import React, { useState, useEffect, useRef } from 'react';
import type { City, VehicleType, AlgorithmId } from '../types';
import { searchCities } from '../services/api';
import {
  Search, Plus, Trash2, ChevronUp, ChevronDown,
  Car, Zap, Truck, Bike, Compass, AlertCircle,
  Sparkles, Loader2
} from 'lucide-react';

interface RoutePlannerViewProps {
  cities: City[];
  onAddCity: (city: City) => void;
  onRemoveCity: (index: number) => void;
  onMoveCity: (index: number, direction: 'up' | 'down') => void;
  onClearCities: () => void;
  selectedAlgorithm: AlgorithmId;
  onSelectAlgorithm: (algo: AlgorithmId) => void;
  isRoundTrip: boolean;
  onToggleRoundTrip: (roundTrip: boolean) => void;
  vehicleType: VehicleType;
  onSelectVehicle: (v: VehicleType) => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  error?: string | null;
  popularCities: City[];
}

export const RoutePlannerView: React.FC<RoutePlannerViewProps> = ({
  cities,
  onAddCity,
  onRemoveCity,
  onMoveCity,
  onClearCities,
  selectedAlgorithm,
  onSelectAlgorithm,
  isRoundTrip,
  onToggleRoundTrip,
  vehicleType,
  onSelectVehicle,
  onOptimize,
  isOptimizing,
  error,
  popularCities,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<City[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(searchQuery, 7);
        setSearchResults(results);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleSelectCity = (city: City) => {
    onAddCity(city);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  const isHeldKarpDisabled = cities.length > 17;
  const isBruteForceDisabled = cities.length > 10;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner / Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Route Planner & Waypoint Manager</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
              {cities.length} {cities.length === 1 ? 'City' : 'Cities'} Selected
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure destinations, choose optimization algorithms, and prepare your traveling salesperson route.
          </p>
        </div>

        {cities.length > 0 && (
          <button
            onClick={onClearCities}
            className="text-xs text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg border border-rose-900/40 hover:bg-rose-950/30 transition-colors self-start md:self-auto cursor-pointer"
          >
            Clear All Waypoints
          </button>
        )}
      </div>

      {/* Global Error Notice if any */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3 shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: City Search & Stop List (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Search Box */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Add Destination or Waypoint
            </label>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search global cities (e.g. Paris, Tokyo, New York, Delhi)..."
                className="w-full bg-[#0d1629] text-white placeholder-slate-500 pl-10 pr-10 py-3 rounded-xl border border-slate-700/80 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 text-sm shadow-inner transition-all"
              />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
              )}
            </div>

            {/* Search Autocomplete Dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#0e172a] border border-cyan-500/40 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800">
                {searchResults.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className="w-full text-left px-4 py-3 hover:bg-cyan-950/30 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-cyan-300">
                        {city.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {city.display_name || city.country}
                      </div>
                    </div>
                    <span className="text-xs text-cyan-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Quick Add Chips */}
            <div className="mt-3">
              <span className="text-[11px] font-semibold text-slate-400 mr-2">Instant Quick Add:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {popularCities.slice(0, 10).map((city) => {
                  const isAdded = cities.some((c) => c.name === city.name);
                  return (
                    <button
                      key={city.id}
                      onClick={() => !isAdded && onAddCity(city)}
                      disabled={isAdded}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all duration-150 cursor-pointer ${
                        isAdded
                          ? 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed'
                          : 'glass-panel hover:bg-cyan-950/40 border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
                      }`}
                    >
                      +{city.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Ordered Stops List */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Waypoint Sequence</span>
                <span className="text-xs text-slate-400 font-normal">
                  (Reorder or anchor starting hub)
                </span>
              </h3>
              <span className="text-xs text-slate-400">
                Origin:{' '}
                <strong className="text-emerald-400">
                  {cities.length > 0 ? cities[0].name : 'Not Set'}
                </strong>
              </span>
            </div>

            {cities.length === 0 ? (
              <div className="text-center py-10 px-4 border border-dashed border-slate-800 rounded-xl">
                <Compass className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-bounce" />
                <p className="text-sm font-semibold text-slate-300">No destinations added yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Type a city name above or select one from the quick-add chips to start plotting your route.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {cities.map((city, idx) => {
                  const isStart = idx === 0;
                  return (
                    <div
                      key={`${city.id}-${idx}`}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        isStart
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                          : 'bg-[#0b1222] border-slate-800 text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isStart
                              ? 'bg-emerald-500 text-slate-950'
                              : 'bg-slate-800 text-cyan-400 border border-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="text-sm font-bold flex items-center gap-2">
                            <span>{city.name}</span>
                            {isStart && (
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-emerald-900/60 text-emerald-300 rounded border border-emerald-500/40">
                                Departure Hub
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {city.country ? `${city.country} • ` : ''}
                            {city.lat.toFixed(3)}°, {city.lng.toFixed(3)}°
                          </div>
                        </div>
                      </div>

                      {/* Controls: Move Up, Move Down, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onMoveCity(idx, 'up')}
                          disabled={idx === 0}
                          title="Move Up"
                          className="p-1.5 text-slate-400 hover:text-cyan-300 disabled:opacity-20 hover:bg-slate-800 rounded transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onMoveCity(idx, 'down')}
                          disabled={idx === cities.length - 1}
                          title="Move Down"
                          className="p-1.5 text-slate-400 hover:text-cyan-300 disabled:opacity-20 hover:bg-slate-800 rounded transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onRemoveCity(idx)}
                          title="Remove Stop"
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parameters, Algorithm Selection, Optimize Button (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Trip Type & Vehicle Options */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Trip Topology & Vehicle Modeling
            </h3>

            {/* Round Trip vs One Way Switch */}
            <div className="bg-[#0b1222] p-1.5 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => onToggleRoundTrip(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isRoundTrip
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Round Trip (TSP Cycle)
              </button>
              <button
                onClick={() => onToggleRoundTrip(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isRoundTrip
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                One Way (Open Path)
              </button>
            </div>

            {/* Vehicle Profile Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-2">
                Fleet Vehicle Profile (Energy & Tolls)
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'car', label: 'Car', icon: <Car className="w-4 h-4" /> },
                  { id: 'ev', label: 'EV', icon: <Zap className="w-4 h-4" /> },
                  { id: 'van', label: 'Van', icon: <Truck className="w-4 h-4" /> },
                  { id: 'truck', label: 'Truck', icon: <Truck className="w-4 h-4" /> },
                  { id: 'motorcycle', label: 'Moto', icon: <Bike className="w-4 h-4" /> },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => onSelectVehicle(v.id as VehicleType)}
                    className={`py-2 px-1 flex flex-col items-center justify-center gap-1 rounded-xl text-xs font-semibold border transition-all ${
                      vehicleType === v.id
                        ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                        : 'bg-[#0d1629] text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    {v.icon}
                    <span className="text-[10px]">{v.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DAA Algorithm Selection */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Optimization Algorithm</span>
              <span className="text-[10px] text-cyan-400 font-mono">DAA Framework</span>
            </h3>

            {/* Algorithm Cards */}
            <div className="space-y-2.5">
              {/* Nearest Neighbor */}
              <div
                onClick={() => onSelectAlgorithm('nearest_neighbor')}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedAlgorithm === 'nearest_neighbor'
                    ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-[#0b1222] border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">Nearest Neighbor</span>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                    O(N²)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Greedy heuristic. Instant execution; safe for 1,000+ cities. Does not guarantee optimal route.
                </p>
              </div>

              {/* Held-Karp DP */}
              <div
                onClick={() => !isHeldKarpDisabled && onSelectAlgorithm('held_karp')}
                className={`p-3.5 rounded-xl border transition-all ${
                  isHeldKarpDisabled
                    ? 'opacity-40 bg-slate-900/40 border-slate-800 cursor-not-allowed'
                    : selectedAlgorithm === 'held_karp'
                    ? 'bg-indigo-950/50 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)] cursor-pointer'
                    : 'bg-[#0b1222] border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Held-Karp DP</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                      Optimal
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                    O(N² · 2ᴺ)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Dynamic programming with bitmasks. Guarantees global minimum. (Limit: N ≤ 17).
                </p>
                {isHeldKarpDisabled && (
                  <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                    Disabled: {cities.length} cities exceeds safe DP limit (N ≤ 17).
                  </p>
                )}
              </div>

              {/* Brute Force */}
              <div
                onClick={() => !isBruteForceDisabled && onSelectAlgorithm('brute_force')}
                className={`p-3.5 rounded-xl border transition-all ${
                  isBruteForceDisabled
                    ? 'opacity-40 bg-slate-900/40 border-slate-800 cursor-not-allowed'
                    : selectedAlgorithm === 'brute_force'
                    ? 'bg-purple-950/50 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer'
                    : 'bg-[#0b1222] border-slate-800 hover:border-slate-700 text-slate-300 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Brute Force Search</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800">
                      Optimal
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
                    O(N!)
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Exhaustive permutation solver. Checks all (N-1)! orderings. (Limit: N ≤ 10).
                </p>
                {isBruteForceDisabled && (
                  <p className="text-[11px] text-amber-400 mt-1 font-semibold">
                    Disabled: {cities.length} cities exceeds factorial limit (N ≤ 10).
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Prominent Optimize Route Button */}
          <div>
            <button
              onClick={onOptimize}
              disabled={cities.length < 2 || isOptimizing}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide uppercase transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer ${
                cities.length < 2 || isOptimizing
                  ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.7)] hover:scale-[1.01]'
              }`}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Calculating Optimal Route Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>Optimize Route with {selectedAlgorithm.replace('_', ' ')}</span>
                </>
              )}
            </button>

            {cities.length < 2 && (
              <p className="text-center text-xs text-slate-500 mt-2">
                Add at least 2 cities to compute route optimization.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
