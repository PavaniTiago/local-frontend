'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Location } from '@/features/locations/types/location';
import {
  MAPBOX_TOKEN,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  getRoute,
  formatDistance,
  formatDuration,
} from '@/lib/mapbox';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { RouteParticles } from './RouteParticles';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapProps {
  locations: Location[];
  selectedLocation: Location | null;
  userLocation: [number, number] | null;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

export function LocationMap({
  locations,
  selectedLocation,
  userLocation,
  onRouteCalculated,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: mapboxgl.Marker; element: HTMLDivElement }>>(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const routeLayerId = 'route';
  const [routeInfo, setRouteInfo] = useState<{
    distance: number;
    duration: number;
  } | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      markersRef.current.forEach(({ marker }) => marker.remove());
      markersRef.current.clear();
      userMarkerRef.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || locations.length === 0) return;

    const currentLocationIds = new Set(locations.map(loc => loc.id));

    markersRef.current.forEach((value, id) => {
      if (!currentLocationIds.has(id)) {
        value.marker.remove();
        markersRef.current.delete(id);
      }
    });

    locations.forEach((location) => {
      const existing = markersRef.current.get(location.id);
      const isSelected = selectedLocation?.id === location.id;
      const markerColor = isSelected ? '#3b82f6' : '#ef4444';

      if (existing) {
        existing.element.style.backgroundColor = markerColor;
      } else {
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.cssText = `
          width: 30px;
          height: 30px;
          background-color: ${markerColor};
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          transition: background-color 0.3s ease, transform 0.2s ease;
        `;

        el.addEventListener('mouseenter', () => {
          el.style.transform = 'scale(1.2)';
        });

        el.addEventListener('mouseleave', () => {
          el.style.transform = 'scale(1)';
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat([location.longitude, location.latitude])
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              closeButton: true,
              closeOnClick: true,
            }).setHTML(
              `<h3 style="font-weight: 700; font-size: 15px; color: #000; margin: 0 0 8px 0;">${location.nome}</h3><p style="font-size: 13px; color: #333; margin: 0; line-height: 1.5;">${location.descricao}</p>`
            )
          )
          .addTo(map.current!);

        markersRef.current.set(location.id, { marker, element: el });
      }
    });

    if (locations.length > 0 && markersRef.current.size === locations.length) {
      const bounds = new mapboxgl.LngLatBounds();
      locations.forEach((loc) => {
        bounds.extend([loc.longitude, loc.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 1000 });
    }
  }, [locations, selectedLocation]);

  useEffect(() => {
    if (!map.current || !userLocation || !selectedLocation) {
      if (map.current?.getLayer(routeLayerId)) {
        map.current.removeLayer(routeLayerId);
        map.current.removeSource(routeLayerId);
      }
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      setRouteInfo(null);
      setRouteCoordinates(null);
      return;
    }

    const drawRoute = async () => {
      try {
        const origin: [number, number] = [userLocation[1], userLocation[0]];
        const destination: [number, number] = [
          selectedLocation.longitude,
          selectedLocation.latitude,
        ];

        const routeData = await getRoute(origin, destination);

        if (!routeData.routes || routeData.routes.length === 0) {
          toast.error('Nenhuma rota encontrada', {
            description: 'Não foi possível calcular uma rota para o destino selecionado.',
          });
          return;
        }

        const route = routeData.routes[0];
        const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.geometry.coordinates,
          },
        };

        const coords = route.geometry.coordinates as [number, number][];
        setRouteCoordinates(coords);

        if (map.current!.getLayer(routeLayerId)) {
          map.current!.removeLayer(routeLayerId);
          map.current!.removeSource(routeLayerId);
        }
        map.current!.addSource(routeLayerId, {
          type: 'geojson',
          data: geojson,
        });

        map.current!.addLayer({
          id: routeLayerId,
          type: 'line',
          source: routeLayerId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.8,
          },
        });

        if (!userMarkerRef.current) {
          const userMarkerEl = document.createElement('div');
          userMarkerEl.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: #10b981;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          `;

          userMarkerRef.current = new mapboxgl.Marker(userMarkerEl)
            .setLngLat(origin)
            .setPopup(
              new mapboxgl.Popup({
                offset: 15,
                closeButton: true,
              }).setHTML('<h3 style="font-weight: 700; font-size: 15px; color: #000; margin: 0;">Sua localização</h3>')
            )
            .addTo(map.current!);
        } else {
          userMarkerRef.current.setLngLat(origin);
        }

        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(origin);
        bounds.extend(destination);
        map.current!.fitBounds(bounds, {
          padding: 80,
          duration: 1000,
          maxZoom: 13
        });
        const info = {
          distance: route.distance,
          duration: route.duration,
        };
        setRouteInfo(info);
        onRouteCalculated?.(info.distance, info.duration);
      } catch (error) {
        console.error('Erro ao traçar rota:', error);
        toast.error('Erro ao traçar rota', {
          description: error instanceof Error ? error.message : 'Ocorreu um erro ao calcular a rota.',
        });
      }
    };

    if (map.current.loaded()) {
      drawRoute();
    } else {
      map.current.once('load', drawRoute);
    }
  }, [userLocation, selectedLocation, onRouteCalculated]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      <RouteParticles map={map.current} routeCoordinates={routeCoordinates} />

      <AnimatePresence>
        {routeInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-4 border border-zinc-200 dark:border-zinc-800"
          >
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 mb-2">
              Informações da Rota
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span>
                  Distância: <strong>{formatDistance(routeInfo.distance)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  Duração: <strong>{formatDuration(routeInfo.duration)}</strong>
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
