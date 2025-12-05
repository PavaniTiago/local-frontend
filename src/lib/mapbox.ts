import { MapboxDirectionsResponse } from '@/features/locations/types/location';

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';

export const DEFAULT_CENTER: [number, number] = [-43.1729, -22.9068]; // Rio de Janeiro
export const DEFAULT_ZOOM = 12;

export async function getRoute(
  origin: [number, number], // [lng, lat]
  destination: [number, number] // [lng, lat]
): Promise<MapboxDirectionsResponse> {
  const [originLng, originLat] = origin;
  const [destLng, destLat] = destination;

  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${originLng},${originLat};${destLng},${destLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Erro ao calcular rota');
  }

  return response.json();
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatDuration(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
}
