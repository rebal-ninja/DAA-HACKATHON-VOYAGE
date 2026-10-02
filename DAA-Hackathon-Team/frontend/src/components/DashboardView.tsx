import React from 'react';
import type { ActiveTab, SampleTour, AlgorithmResult } from '../types';
import { Route, BarChart3, FlaskConical, Zap, ShieldCheck, Cpu, ArrowRight, Play, Globe, CheckCircle2 } from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onLoadTour: (tour: SampleTour) => void;
  sampleTours: SampleTour[];
  lastResult?: AlgorithmResult;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onLoadTour,
  sampleTours,
  lastResult,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 border border-slate-800 bg-gradient-to-br from-[#0c1322] via-[#091020] to-[#060a14] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 mb-4">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Design and Analysis of Algorithms (DAA) Capstone</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight mb-4">
            Intelligent Multi-Stop Route Optimization with{' '}
            <span className="hero-highlight">
              DAA Algorithms
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-normal">
            VoyageAI tackles the classic NP-Hard Traveling Salesperson Problem (TSP) using real road network geometries from OpenStreetMap. Compare greedy heuristics, dynamic programming bitmasks, and exhaustive search with empirical microsecond benchmarks.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('planner')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] flex items-center gap-2 cursor-pointer"
            >
              <Route className="w-4 h-4" />
              <span>Launch Route Planner</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('lab')}
              className="px-5 py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all duration-200 border border-slate-700/70 flex items-center gap-2 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-cyan-400" />
              <span>Explore Algorithm Lab</span>
            </button>

            <button
              onClick={() => onNavigate('comparison')}
              className="px-5 py-3 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-semibold text-sm transition-all duration-200 border border-slate-700/70 flex items-center gap-2 cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span>Algorithm Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics & Capabilities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DAA Paradigms</span>
            <Cpu className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">3 Implemented</div>
          <p className="text-xs text-slate-400 mt-1">Greedy, Bitmask DP, Brute Force</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Routing Engine</span>
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">OSRM + Haversine</div>
          <p className="text-xs text-slate-400 mt-1">Real road geometry & fallback</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Optimal Guarantee</span>
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">Held-Karp Exact</div>
          <p className="text-xs text-slate-400 mt-1">Provable minimum Hamiltonian loop</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-cyan-500/30 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost Modeling</span>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">5 Vehicle Types</div>
          <p className="text-xs text-slate-400 mt-1">Gas, EV, Van, Truck, Motorcycle</p>
        </div>
      </div>

      {/* Algorithm Highlights */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Core DAA Algorithms</h2>
            <p className="text-xs text-slate-400">Integrated mathematical optimization engines with strict complexity boundaries</p>
          </div>
          <button
            onClick={() => onNavigate('lab')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <span>Read Pseudocode & Theory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Nearest Neighbor */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  Greedy Heuristic
                </span>
                <span className="text-xs font-mono text-cyan-400 font-semibold">O(N²)</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Nearest Neighbor</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Rapidly assembles a tour by iteratively jumping to the nearest unvisited city. Highly efficient for large input sets, though susceptible to suboptimal closing edges.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Space: <strong className="text-slate-200">O(N)</strong></span>
              <span className="text-amber-400 font-medium">Approximate Solution</span>
            </div>
          </div>

          {/* Held-Karp DP */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Dynamic Programming
                </span>
                <span className="text-xs font-mono text-indigo-400 font-semibold">O(N² · 2ᴺ)</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Held-Karp DP</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Exact mathematical formulation using bitmask subsets to memoize overlapping Hamiltonian subproblems. Guarantees the absolute shortest road tour up to 17 cities.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Space: <strong className="text-slate-200">O(N · 2ᴺ)</strong></span>
              <span className="text-emerald-400 font-medium">Guaranteed Optimal</span>
            </div>
          </div>

          {/* Brute Force */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  Exhaustive Search
                </span>
                <span className="text-xs font-mono text-purple-400 font-semibold">O(N!)</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Brute Force</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Exhaustively checks all (N-1)! permutations of waypoints. Employs branch pruning to establish the theoretical minimum baseline on small waypoint clusters (N ≤ 10).
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Space: <strong className="text-slate-200">O(N)</strong></span>
              <span className="text-emerald-400 font-medium">Guaranteed Optimal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Sample Tours */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Curated Hackathon Showcase Tours</h2>
            <p className="text-xs text-slate-400">One-click preset itineraries pre-loaded with verified road coordinates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleTours.map((tour) => (
            <div
              key={tour.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              onClick={() => onLoadTour(tour)}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                    {tour.city_ids.length} Destinations
                  </span>
                  <Play className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {tour.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed line-clamp-2">
                  {tour.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Click to optimize</span>
                <span className="text-cyan-400 font-semibold group-hover:underline">Load Itinerary →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Route Summary (if one was run) */}
      {lastResult && (
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-blue-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Latest Calculation Ready</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {lastResult.algorithm_name}: {lastResult.total_distance_km.toLocaleString()} km
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Computed in {lastResult.execution_time_ms} ms across {lastResult.nodes_count} waypoints.
              </p>
            </div>
            <button
              onClick={() => onNavigate('results')}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>View Interactive Map & Turn Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
