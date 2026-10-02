import React, { useEffect, useState } from 'react';
import type { OptimizeResponse, ActiveTab } from '../types';
import { MapComponent } from './MapComponent';
import {
  Clock, DollarSign, Cpu, Route, ShieldCheck,
  Share2, Download, Fuel, Leaf,
  ChevronRight, RotateCcw, BarChart3
} from 'lucide-react';

interface ResultsViewProps {
  result: OptimizeResponse;
  onNavigate: (tab: ActiveTab) => void;
  onReplan: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  result,
  onNavigate,
  onReplan,
}) => {
  const [unit, setUnit] = useState<'km' | 'mi'>('km');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [usdInrRate, setUsdInrRate] = useState(86.5);
  const [rateSource, setRateSource] = useState<'live' | 'fallback'>('fallback');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=INR')
      .then((response) => { if (!response.ok) throw new Error('Exchange rate unavailable'); return response.json(); })
      .then((data: { rates?: { INR?: number } }) => {
        if (active && typeof data.rates?.INR === 'number' && data.rates.INR > 0) {
          setUsdInrRate(data.rates.INR);
          setRateSource('live');
        }
      })
      .catch(() => { if (active) setRateSource('fallback'); });
    return () => { active = false; };
  }, []);

  const { algorithm_result, cost_breakdown, route_geometry, legs, routing_source, routing_note, round_trip } = result;

  const distanceDisplay = unit === 'km'
    ? `${algorithm_result.total_distance_km.toLocaleString()} km`
    : `${(algorithm_result.total_distance_km * 0.621371).toFixed(1)} mi`;

  const hours = Math.floor(algorithm_result.estimated_duration_minutes / 60);
  const minutes = Math.round(algorithm_result.estimated_duration_minutes % 60);
  const baseCurrency = cost_breakdown.currency === 'INR' ? 'INR' : 'USD';
  const formatCost = (amount: number) => {
    const converted = baseCurrency === currency
      ? amount
      : currency === 'INR' ? amount * usdInrRate : amount / usdInrRate;
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency', currency, maximumFractionDigits: currency === 'INR' ? 0 : 2,
    }).format(converted);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `voyage_route_${algorithm_result.algorithm_id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleShare = () => {
    const summary = `VoyageAI Route: ${algorithm_result.ordered_cities.map(c => c.name).join(' → ')} | Distance: ${algorithm_result.total_distance_km}km | Alg: ${algorithm_result.algorithm_name}`;
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
              Route Calculated
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
              algorithm_result.is_optimal_guaranteed
                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                : 'bg-amber-950 text-amber-300 border-amber-700'
            }`}>
              {algorithm_result.is_optimal_guaranteed ? 'Provably Optimal' : 'Heuristic Approximation'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {algorithm_result.algorithm_name}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {round_trip ? 'Closed TSP Cycle (returns to starting hub)' : 'Open Hamiltonian Tour'} • {algorithm_result.ordered_cities.length} Stops
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Unit Switcher */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-0.5 flex text-xs font-semibold">
            <button
              onClick={() => setUnit('km')}
              className={`px-2.5 py-1 rounded-md transition-colors ${unit === 'km' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              KM
            </button>
            <button
              onClick={() => setUnit('mi')}
              className={`px-2.5 py-1 rounded-md transition-colors ${unit === 'mi' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              MI
            </button>
          </div>

          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <span>Currency</span>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value as 'INR' | 'USD')}
              className="bg-slate-900 text-white outline-none cursor-pointer"
              aria-label="Display cost currency"
            >
              <option value="INR">INR ₹</option>
              <option value="USD">USD $</option>
            </select>
          </label>

          <button
            onClick={() => onNavigate('comparison')}
            className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800 text-xs font-semibold text-cyan-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Compare Algos</span>
          </button>

          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-lg glass-panel hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Distance */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Total Route Distance</span>
            <Route className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">{distanceDisplay}</div>
          <div className="text-[11px] text-cyan-400/90 mt-1 flex items-center gap-1">
            <span>{routing_source === 'OSRM_ROAD' ? '✓ Highway Network' : '~ Haversine Calc'}</span>
          </div>
        </div>

        {/* Driving Duration */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Est. Drive Time</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {hours > 0 ? `${hours}h ` : ''}{minutes}m
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Avg speed model ~80 km/h
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Est. Travel Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {formatCost(cost_breakdown.total_cost)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Fuel, tolls & fleet wear
          </div>
        </div>

        {/* Algorithmic Execution Time */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Execution Runtime</span>
            <Cpu className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300 tracking-tight">
            {algorithm_result.execution_time_ms} <span className="text-sm font-normal">ms</span>
          </div>
          <div className="text-[11px] text-purple-400 font-mono mt-1">
            Complexity: {algorithm_result.complexity_time}
          </div>
        </div>
      </div>

      {/* Main Map & Breakdown Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="h-[520px] rounded-2xl overflow-hidden shadow-2xl">
            <MapComponent
              cities={algorithm_result.ordered_cities}
              orderedCities={algorithm_result.ordered_cities}
              geometry={route_geometry}
              routingSource={routing_source}
              isRoundTrip={round_trip}
            />
          </div>

          {/* Routing Source Explanatory Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white">Source Integrity: </span>
              {routing_note}
            </div>
          </div>
        </div>

        {/* Right Details Panel: Ordered Sequence & Cost Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Step-by-Step Leg Details */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Optimized Route Sequence</span>
              <span className="text-xs text-cyan-400 font-mono">
                {algorithm_result.ordered_cities.length} vertices
              </span>
            </h3>

            <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
              {legs.map((leg, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-[#091020] border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-cyan-400">Leg #{leg.leg_index}</span>
                    <span className="text-slate-400 font-mono">
                      {unit === 'km' ? `${leg.distance_km} km` : `${(leg.distance_km * 0.621371).toFixed(1)} mi`} • {Math.round(leg.duration_minutes)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                    <span className="truncate">{leg.from_city.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate text-white">{leg.to_city.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Modeling Breakdown Card */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Fuel className="w-4 h-4 text-amber-400" />
                <span>Estimated Cost Breakdown</span>
              </h3>
              <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                Model Estimate
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Fuel / Energy Consumption ({cost_breakdown.consumption_rate})</span>
                <span className="font-mono font-semibold text-white">{formatCost(cost_breakdown.fuel_cost)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Highway Tolls & Waybill Fees (Heuristic)</span>
                <span className="font-mono font-semibold text-white">{formatCost(cost_breakdown.tolls_estimate)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Fleet Wear & Maintenance Modeling</span>
                <span className="font-mono font-semibold text-white">{formatCost(cost_breakdown.maintenance_cost)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between font-bold text-sm">
                <span className="text-white">Estimated Total Trip Cost</span>
                <span className="text-emerald-400 font-mono">{formatCost(cost_breakdown.total_cost)}</span>
              </div>
            </div>

            {/* Carbon Footprint */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Leaf className="w-3.5 h-3.5" />
                <span>CO₂ Emissions Impact</span>
              </div>
              <span className="font-mono font-bold text-slate-200">{cost_breakdown.co2_kg} kg CO₂</span>
            </div>

            <p className="text-[10px] text-slate-500 italic mt-1 leading-tight">
              * Planning estimate only. India routes use indicative INR fuel, toll, and maintenance assumptions. {baseCurrency !== currency ? `Conversion: 1 USD ≈ ₹${usdInrRate.toFixed(2)}.` : ''} Exchange rate: {rateSource === 'live' ? 'live reference rate' : 'fallback rate (offline estimate)'}. Actual prices vary by location.
            </p>
          </div>

          {/* Replan / Edit Button */}
          <button
            onClick={onReplan}
            className="w-full py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            <span>Modify Stops & Rerun Planner</span>
          </button>
        </div>
      </div>
    </div>
  );
};
