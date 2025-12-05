'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import mapboxgl from 'mapbox-gl';

interface RouteParticlesProps {
  map: mapboxgl.Map | null;
  routeCoordinates: [number, number][] | null;
}

export function RouteParticles({ map, routeCoordinates }: RouteParticlesProps) {
  const particlesRef = useRef<THREE.Points | null>(null);
  const layerIdRef = useRef('route-particles');

  useEffect(() => {
    if (!map || !routeCoordinates || routeCoordinates.length === 0) {
      if (map && map.getLayer(layerIdRef.current)) {
        map.removeLayer(layerIdRef.current);
      }
      return;
    }

    addParticleLayer();

    function addParticleLayer() {
      if (!map || !routeCoordinates) return;

      if (map.getLayer(layerIdRef.current)) {
        map.removeLayer(layerIdRef.current);
      }

      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 150 : 500;
      const particleLayer: mapboxgl.CustomLayerInterface = {
        id: layerIdRef.current,
        type: 'custom',
        renderingMode: '3d',

        onAdd: function (map: mapboxgl.Map, gl: WebGLRenderingContext) {
          const scene = new THREE.Scene();
          const camera = new THREE.Camera();

          const geometry = new THREE.BufferGeometry();
          const positions = new Float32Array(particleCount * 3);
          const velocities = new Float32Array(particleCount);
          const colors = new Float32Array(particleCount * 3);
          const sizes = new Float32Array(particleCount);
          const offsets = new Float32Array(particleCount * 2);

          for (let i = 0; i < particleCount; i++) {
            const progress = i / particleCount;
            const index = Math.floor(progress * (routeCoordinates!.length - 1));
            const coord = routeCoordinates![index];

            const mercator = mapboxgl.MercatorCoordinate.fromLngLat(
              [coord[0], coord[1]],
              0
            );

            positions[i * 3] = mercator.x;
            positions[i * 3 + 1] = mercator.y;
            positions[i * 3 + 2] = mercator.z;

            velocities[i] = Math.random() * 0.5 + 0.8;

            sizes[i] = (Math.random() * 1.0 + 1.5) * (isMobile ? 0.7 : 1.2);

            const offsetDistance = (Math.random() - 0.5) * 0.000015;
            offsets[i * 2] = offsetDistance;
            offsets[i * 2 + 1] = (Math.random() - 0.5) * 0.000008;

            const blueIntensity = Math.random() * 0.3 + 0.7;
            colors[i * 3] = 0.0;
            colors[i * 3 + 1] = blueIntensity * 0.4;
            colors[i * 3 + 2] = blueIntensity;
          }

          geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

          const material = new THREE.PointsMaterial({
            size: 0.00025,
            vertexColors: true,
            transparent: true,
            opacity: 0.85,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
            depthWrite: false,
          });

          particlesRef.current = new THREE.Points(geometry, material);
          scene.add(particlesRef.current);

          (this as any).scene = scene;
          (this as any).camera = camera;
          (this as any).velocities = velocities;
          (this as any).particleCount = particleCount;
          (this as any).routeCoordinates = routeCoordinates;
          (this as any).startTime = Date.now();
          (this as any).offsets = offsets;
          const renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true,
          });

          renderer.autoClear = false;
          (this as any).renderer = renderer;
        },

        render: function (gl: WebGLRenderingContext, matrix: number[]) {
          const scene = (this as any).scene;
          const camera = (this as any).camera;
          const renderer = (this as any).renderer;
          const velocities = (this as any).velocities;
          const particleCount = (this as any).particleCount;
          const routeCoords = (this as any).routeCoordinates;
          const startTime = (this as any).startTime;
          const offsets = (this as any).offsets;

          if (!particlesRef.current || !routeCoords) return;

          const elapsedTime = (Date.now() - startTime) / 1000;
          const positions = particlesRef.current.geometry.attributes.position
            .array as Float32Array;

          for (let i = 0; i < particleCount; i++) {
            const baseProgress = (elapsedTime * velocities[i] * 0.12) % 1;
            const routeIndex = Math.floor(baseProgress * (routeCoords.length - 1));
            const nextIndex = Math.min(routeIndex + 1, routeCoords.length - 1);

            const localProgress = (baseProgress * (routeCoords.length - 1)) % 1;
            const coord1 = routeCoords[routeIndex];
            const coord2 = routeCoords[nextIndex];

            const lng = coord1[0] + (coord2[0] - coord1[0]) * localProgress;
            const lat = coord1[1] + (coord2[1] - coord1[1]) * localProgress;

            const dx = coord2[0] - coord1[0];
            const dy = coord2[1] - coord1[1];
            const length = Math.sqrt(dx * dx + dy * dy);

            const perpX = length > 0 ? -dy / length : 0;
            const perpY = length > 0 ? dx / length : 0;

            const offsetX = offsets[i * 2];
            const offsetY = offsets[i * 2 + 1];

            const finalLng = lng + perpX * offsetX;
            const finalLat = lat + perpY * offsetX + offsetY;

            const mercator = mapboxgl.MercatorCoordinate.fromLngLat([finalLng, finalLat], 0);

            positions[i * 3] = mercator.x;
            positions[i * 3 + 1] = mercator.y;
            positions[i * 3 + 2] = mercator.z;
          }

          particlesRef.current.geometry.attributes.position.needsUpdate = true;

          camera.projectionMatrix = new THREE.Matrix4().fromArray(matrix);
          renderer.resetState();
          renderer.render(scene, camera);
          map.triggerRepaint();
        },

        onRemove: function () {
          if (particlesRef.current) {
            particlesRef.current.geometry.dispose();
            (particlesRef.current.material as THREE.Material).dispose();
          }
        },
      };

      // Add layer to map
      map.addLayer(particleLayer);
    }

    return () => {
      if (map && map.getLayer(layerIdRef.current)) {
        map.removeLayer(layerIdRef.current);
      }
    };
  }, [map, routeCoordinates]);

  return null;
}
