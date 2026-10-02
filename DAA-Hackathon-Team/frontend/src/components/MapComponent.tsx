import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import type { City } from '../types';
import { Navigation, Play, Pause, RotateCcw, SkipBack, SkipForward } from 'lucide-react';

interface MapComponentProps {
  cities: City[];
  orderedCities?: City[];
  geometry?: [number, number][];
  routingSource?: 'OSRM_ROAD' | 'HAVERSINE_FALLBACK' | 'LOCAL';
  isRoundTrip?: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const MapComponent: React.FC<MapComponentProps> = ({
  cities,
  orderedCities,
  geometry,
  routingSource = 'OSRM_ROAD',
  isRoundTrip = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const animationLayerRef = useRef<L.LayerGroup | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const stops = orderedCities?.length ? orderedCities : cities;
  const routePoints = useMemo<[number, number][]>(() => {
    if (geometry && geometry.length > 1) return geometry;
    const points = stops.map((city) => [city.lat, city.lng] as [number, number]);
    if (isRoundTrip && points.length > 1) points.push(points[0]);
    return points;
  }, [geometry, stops, isRoundTrip]);

  // Create the actual OpenStreetMap map once.
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    const map = L.map(mapContainerRef.current, { center: [20.5937, 78.9629], zoom: 5, zoomControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    layerGroupRef.current = L.layerGroup().addTo(map);
    animationLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      layerGroupRef.current = null;
      animationLayerRef.current = null;
    };
  }, []);

  // Draw the route and numbered city markers.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = layerGroupRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!stops.length) return;
    const bounds = L.latLngBounds([]);

    if (routePoints.length > 1) {
      const roadRoute = routingSource === 'OSRM_ROAD';
      L.polyline(routePoints, {
        color: roadRoute ? '#78a985' : '#d2a15d',
        weight: 5,
        opacity: 0.45,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layer);
      L.polyline(routePoints, {
        color: roadRoute ? '#356b4b' : '#a87532',
        weight: 3,
        opacity: 0.85,
        dashArray: roadRoute ? undefined : '7 8',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layer);
      routePoints.forEach((point) => bounds.extend(point));
    }

    stops.forEach((city, index) => {
      const isStart = index === 0;
      const icon = L.divIcon({
        className: 'voyage-map-marker',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:${isStart ? '#356b4b' : '#547f5e'};border:2px solid #f4f7f1;color:white;font-weight:800;font-size:11px;box-shadow:0 3px 10px #26352b55">${isStart ? 'START' : index + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      L.marker([city.lat, city.lng], { icon })
        .bindPopup(`<strong>${index + 1}. ${city.name}</strong><br/>${city.display_name || city.country || ''}`)
        .addTo(layer);
      bounds.extend([city.lat, city.lng]);
    });

    if (bounds.isValid()) map.fitBounds(bounds, { padding: [45, 45], maxZoom: 12 });
    setProgress(0);
    setIsPlaying(false);
  }, [stops, routePoints, routingSource]);

  // Playback timer: advances a moving marker along the real route geometry.
  useEffect(() => {
    if (!isPlaying || routePoints.length < 2) return;
    const timer = window.setInterval(() => {
      setProgress((previous) => {
        const next = previous + 0.004 * speed;
        if (next >= 1) {
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
    }, 35);
    return () => window.clearInterval(timer);
  }, [isPlaying, routePoints.length, speed]);

  // Render the animated route prefix and the moving vehicle marker.
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = animationLayerRef.current;
    if (!map || !layer || routePoints.length < 2) return;
    layer.clearLayers();
    const routePosition = progress * (routePoints.length - 1);
    const lastIndex = Math.min(Math.floor(routePosition), routePoints.length - 1);
    const fraction = routePosition - lastIndex;
    const visiblePoints = routePoints.slice(0, lastIndex + 1);
    const current = routePoints[lastIndex];
    if (lastIndex < routePoints.length - 1) {
      const nextPoint = routePoints[lastIndex + 1];
      visiblePoints.push([
        current[0] + (nextPoint[0] - current[0]) * clamp(fraction, 0, 1),
        current[1] + (nextPoint[1] - current[1]) * clamp(fraction, 0, 1),
      ]);
    }
    if (visiblePoints.length > 1) {
      L.polyline(visiblePoints, { color: '#22c55e', weight: 5, opacity: 0.95, lineCap: 'round', lineJoin: 'round' }).addTo(layer);
    }
    const point = visiblePoints[visiblePoints.length - 1];
    const vehicleIcon = L.divIcon({
      className: 'voyage-moving-marker',
      html: '<div style="width:22px;height:22px;border-radius:50%;background:#facc15;border:3px solid white;box-shadow:0 0 0 5px #facc1540,0 0 18px #facc15;display:flex;align-items:center;justify-content:center;font-size:11px">➤</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });
    L.marker(point, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(layer);
  }, [progress, routePoints]);

  const fitRoute = () => {
    const map = mapInstanceRef.current;
    if (!map || !routePoints.length) return;
    map.fitBounds(L.latLngBounds(routePoints), { padding: [45, 45], maxZoom: 12 });
  };

  const stepForward = () => {
    setIsPlaying(false);
    setProgress((value) => Math.min(1, value + 0.05));
  };
  const stepBack = () => {
    setIsPlaying(false);
    setProgress((value) => Math.max(0, value - 0.05));
  };
  const reset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl bg-[#080d1a]">
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />

      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 pointer-events-none">
        <div className="glass-panel px-3 py-2 rounded-lg text-xs text-slate-100 shadow-lg">
          <div className="font-bold">LIVE ROUTE SIMULATION</div>
          <div className="text-[10px] text-slate-300 mt-1">{Math.round(progress * 100)}% complete · {stops.length} destinations</div>
          <div className="w-40 h-1.5 rounded-full bg-slate-700 mt-2 overflow-hidden"><div className="h-full bg-emerald-400 transition-all" style={{ width: `${progress * 100}%` }} /></div>
        </div>
        {routePoints.length > 1 && <div className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-slate-950/90 text-cyan-200 border border-cyan-500/30">{routingSource === 'OSRM_ROAD' ? 'REAL ROAD GEOMETRY · OSRM' : 'ESTIMATED / STRAIGHT-LINE ROUTE'}</div>}
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3">
        <div className="glass-panel rounded-xl px-2 py-2 flex items-center gap-1.5 shadow-xl">
          <button onClick={reset} title="Restart animation" className="p-2 rounded-lg text-slate-200 hover:bg-slate-700" aria-label="Restart animation"><RotateCcw size={16} /></button>
          <button onClick={stepBack} title="Step backward" className="p-2 rounded-lg text-slate-200 hover:bg-slate-700" aria-label="Step backward"><SkipBack size={16} /></button>
          <button onClick={() => { if (progress >= 1) setProgress(0); setIsPlaying((playing) => !playing); }} className="px-3 py-2 rounded-lg bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:bg-cyan-300" aria-label={isPlaying ? 'Pause animation' : 'Play animation'}>
            {isPlaying ? <Pause size={15} /> : <Play size={15} />} {isPlaying ? 'Pause' : 'Play route'}
          </button>
          <button onClick={stepForward} title="Step forward" className="p-2 rounded-lg text-slate-200 hover:bg-slate-700" aria-label="Step forward"><SkipForward size={16} /></button>
        </div>
        <div className="glass-panel rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-slate-200">
          <label htmlFor="route-speed">Speed</label>
          <select id="route-speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="bg-slate-900 text-white rounded px-2 py-1 border border-slate-700">
            <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option>
          </select>
          <button onClick={fitRoute} title="Fit all route points" className="p-1.5 rounded text-cyan-300 hover:bg-slate-700" aria-label="Fit route"><Navigation size={16} /></button>
        </div>
      </div>
    </div>
  );
};
