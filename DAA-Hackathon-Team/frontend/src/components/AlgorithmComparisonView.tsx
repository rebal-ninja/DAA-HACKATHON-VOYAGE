import React, { useState } from 'react';
import type { ComparisonResponse, City, ActiveTab } from '../types';
import { compareRouteApi } from '../services/api';
import {
  BarChart3, Zap, Clock, Route,
  TrendingDown, CheckCircle2, AlertCircle, RefreshCw, Loader2
} from 'lucide-react';

interface AlgorithmComparisonViewProps {
  cities: City[];
  isRoundTrip: boolean;
  vehicleType: string;
  comparisonData: ComparisonResponse | null;
  onSetComparisonData: (data: ComparisonResponse) => void;
  onNavigate?: (tab: ActiveTab) => void;
}

export const AlgorithmComparisonView: React.FC<AlgorithmComparisonViewProps> = ({
  cities,
  isRoundTrip,
  vehicleType,
  comparisonData,
  onSetComparisonData,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunComparison = async () => {
    if (cities.length < 2) {
      setError('Please configure at least 2 cities in the Route Planner before running comparison.');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const data = await compareRouteApi(cities, isRoundTrip, vehicleType);
      onSetComparisonData(data);
    } catch (err: any) {
      setError(err.message || 'Comparison failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Find min and max for chart visual scaling
  const validResults = comparisonData?.results.filter((r) => r.total_distance_km > 0) || [];
  const maxDistance = validResults.length > 0 ? Math.max(...validResults.map((r) => r.total_distance_km)) : 1;
  const maxTime = validResults.length > 0 ? Math.max(...validResults.map((r) => r.execution_time_ms)) : 1;

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase mb-1">
            DAA Benchmark Suite
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Algorithm Performance Comparison
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Empirical runtime and route optimality benchmarks executed on the identical distance matrix.
          </p>
        </div>

        <button
          onClick={handleRunComparison}
          disabled={cities.length < 2 || isLoading}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
            cities.length < 2 || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Benchmarking Matrix...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Run Benchmark ({cities.length} Cities)</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Benchmark Summary Cards (if data ready) */}
      {comparisonData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fastest Algo */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Fastest Execution</span>
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-300">{comparisonData.fastest_algorithm}</div>
            <p className="text-[11px] text-slate-400 mt-1">
              {comparisonData.time_difference_factor > 1
                ? `${comparisonData.time_difference_factor}x faster than optimal search`
                : 'Near-instant execution'}
            </p>
          </div>

          {/* Shortest Distance */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Shortest Route</span>
              <Route className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400">
              {comparisonData.shortest_distance_algorithm}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Provably optimal or minimal Hamiltonian loop
            </p>
          </div>

          {/* Distance Savings */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
              <span>Optimization Advantage</span>
              <TrendingDown className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-indigo-300">
              {comparisonData.distance_saving_pct > 0
                ? `${comparisonData.distance_saving_pct}% Saved`
                : 'Identical Distance'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {comparisonData.distance_saving_pct > 0
                ? 'DP found shortcuts missed by Greedy'
                : 'Greedy heuristic matched the exact optimum'}
            </p>
          </div>
        </div>
      )}

      {/* Main Benchmark Comparison Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Algorithm Benchmark Results</span>
            <span className="text-xs text-slate-400 font-mono font-normal">
              ({cities.length} vertices, {isRoundTrip ? 'Round Trip' : 'One Way'})
            </span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#091124] text-slate-400 uppercase font-semibold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Algorithm</th>
                <th className="py-3.5 px-4">Time Complexity</th>
                <th className="py-3.5 px-4">Space Complexity</th>
                <th className="py-3.5 px-4">Distance</th>
                <th className="py-3.5 px-4">Est. Cost</th>
                <th className="py-3.5 px-4">Operations / States</th>
                <th className="py-3.5 px-4">Execution Time</th>
                <th className="py-3.5 px-4">Optimality</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {comparisonData ? (
                comparisonData.results.map((r) => {
                  const isShortest = r.algorithm_name === comparisonData.shortest_distance_algorithm && r.total_distance_km > 0;
                  const isFastest = r.algorithm_name === comparisonData.fastest_algorithm && r.execution_time_ms > 0;
                  const isSkipped = !!r.notes && r.total_distance_km === 0;

                  return (
                    <tr
                      key={r.algorithm_id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-4 font-bold text-white flex items-center gap-2">
                        <span>{r.algorithm_name}</span>
                        {isShortest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-950 text-emerald-300 border border-emerald-700 uppercase">
                            Shortest
                          </span>
                        )}
                        {isFastest && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase">
                            Fastest
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-cyan-400 font-semibold">
                        {r.complexity_time}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-400">
                        {r.complexity_space}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm font-bold text-white">
                        {isSkipped ? (
                          <span className="text-slate-500 font-normal italic">Skipped</span>
                        ) : (
                          `${r.total_distance_km.toLocaleString()} km`
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm font-bold text-emerald-300">
                        {isSkipped || !r.cost_breakdown ? '—' : new Intl.NumberFormat(r.cost_breakdown.currency === 'INR' ? 'en-IN' : 'en-US', { style: 'currency', currency: r.cost_breakdown.currency, maximumFractionDigits: 0 }).format(r.cost_breakdown.total_cost)}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm text-amber-300">
                        {isSkipped ? '—' : (r.operations_count ?? 0).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-mono text-sm font-semibold text-purple-300">
                        {isSkipped ? (
                          <span className="text-slate-500 font-normal italic">—</span>
                        ) : (
                          `${r.execution_time_ms} ms`
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            r.is_optimal_guaranteed
                              ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                              : 'bg-amber-950/80 text-amber-300 border-amber-700'
                          }`}
                        >
                          {r.is_optimal_guaranteed ? 'Guaranteed' : 'Approximate'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {isSkipped ? (
                          <span className="text-[11px] text-amber-400/90 font-medium">
                            {r.notes}
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Executed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    <BarChart3 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400">No benchmark executed yet</p>
                    <p className="text-xs text-slate-600 mt-1">
                      Click the "Run Benchmark" button above to evaluate all 3 algorithms on your selected {cities.length} cities.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {comparisonData && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Route Order Produced by Each Algorithm</h2>
          <div className="space-y-3">
            {comparisonData.results.filter((r) => r.total_distance_km > 0 && r.ordered_cities.length > 0).map((r) => (
              <div key={r.algorithm_id} className="rounded-xl bg-slate-950/70 border border-slate-800 p-3">
                <div className="text-xs font-bold text-cyan-300 mb-2">{r.algorithm_name}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-200">
                  {r.ordered_cities.map((city, index) => (
                    <React.Fragment key={`${r.algorithm_id}-${index}`}>
                      <span className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1">{city.name}</span>
                      {index < r.ordered_cities.length - 1 && <span className="text-cyan-500">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-3">If the route and cost match, the algorithms may have found the same tour. Compare operations/states and runtime too; the algorithms differ in how they search, not necessarily in the answer they return.</p>
        </div>
      )}

      {/* Visual Comparative Charts */}
      {comparisonData && validResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distance Comparison Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Route Distance (Shorter is Better)</span>
              <Route className="w-4 h-4 text-cyan-400" />
            </h3>
            <div className="space-y-4">
              {validResults.map((r) => {
                const pct = (r.total_distance_km / maxDistance) * 100;
                return (
                  <div key={r.algorithm_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{r.algorithm_name}</span>
                      <span className="font-mono text-cyan-400 font-bold">
                        {r.total_distance_km.toLocaleString()} km
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Execution Time Chart */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Execution Runtime (Faster is Better)</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </h3>
            <div className="space-y-4">
              {validResults.map((r) => {
                const pct = Math.max(8, (r.execution_time_ms / maxTime) * 100);
                return (
                  <div key={r.algorithm_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{r.algorithm_name}</span>
                      <span className="font-mono text-purple-300 font-bold">
                        {r.execution_time_ms} ms
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
