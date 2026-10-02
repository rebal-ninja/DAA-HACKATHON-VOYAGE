import React, { useState, useEffect } from 'react';
import type { AlgorithmDoc, ToyGraphNode, ToyGraphTrace } from '../types';
import { getAlgorithmInfoApi } from '../services/api';
import {
  Cpu, Play, Pause, RotateCcw, ChevronRight,
  ChevronLeft, BookOpen, Code2, ShieldAlert, CheckCircle2, Zap
} from 'lucide-react';

export const AlgorithmLabView: React.FC = () => {
  const [selectedAlgoKey, setSelectedAlgoKey] = useState<string>('nearest_neighbor');
  const [algoInfo, setAlgoInfo] = useState<Record<string, AlgorithmDoc>>({});
  const [toyGraph, setToyGraph] = useState<{
    nodes: ToyGraphNode[];
    matrix: number[][];
    nn_trace: ToyGraphTrace[];
  }>({
    nodes: [],
    matrix: [],
    nn_trace: []
  });
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    getAlgorithmInfoApi().then((data) => {
      setAlgoInfo(data.algorithms);
      setToyGraph(data.toy_graph);
    });
  }, []);

  // Auto-play timer for simulator
  useEffect(() => {
    let timer: any = null;
    if (isPlaying && toyGraph.nn_trace.length > 0) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= toyGraph.nn_trace.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, toyGraph.nn_trace]);

  const activeDoc = algoInfo[selectedAlgoKey];
  const maxSteps = toyGraph.nn_trace.length;

  const currentTrace = currentStep > 0 && currentStep <= maxSteps
    ? toyGraph.nn_trace[currentStep - 1]
    : null;

  // Compute visited nodes up to currentStep
  const visitedNodeIds = new Set<number>([0]);
  for (let i = 0; i < currentStep && i < toyGraph.nn_trace.length; i++) {
    visitedNodeIds.add(toyGraph.nn_trace[i].to);
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="pb-4 border-b border-slate-800">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase mb-1">
          DAA Pedagogical Laboratory
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Algorithm Theory, Pseudocode & Step-by-Step Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          Deep-dive into the formal complexity, algorithmic paradigms, and decision traces of classic TSP solvers.
        </p>
      </div>

      {/* Algorithm Selector Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { key: 'nearest_neighbor', label: 'Nearest Neighbor', paradigm: 'Greedy Heuristic', complexity: 'O(N²)' },
          { key: 'held_karp', label: 'Held-Karp DP', paradigm: 'Dynamic Programming', complexity: 'O(N² · 2ᴺ)' },
          { key: 'brute_force', label: 'Brute Force', paradigm: 'Exhaustive Permutations', complexity: 'O(N!)' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setSelectedAlgoKey(item.key)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedAlgoKey === item.key
                ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                : 'glass-panel border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{item.label}</span>
              <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                {item.complexity}
              </span>
            </div>
            <div className="text-xs text-slate-400">{item.paradigm}</div>
          </button>
        ))}
      </div>

      {/* Simulator: Interactive Step-by-Step Execution on Toy Graph */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <span>Interactive Step-by-Step Decision Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live visualization of vertex selection on a 4-city metric graph (Berlin, Prague, Vienna, Munich).
            </p>
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep(0);
              }}
              title="Reset"
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
              disabled={currentStep === 0}
              title="Previous Step"
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-lg cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
            </button>
            <button
              onClick={() => setCurrentStep((p) => Math.min(maxSteps, p + 1))}
              disabled={currentStep >= maxSteps}
              title="Next Step"
              className="p-2 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400 font-mono ml-2">
              Step {currentStep}/{maxSteps}
            </span>
          </div>
        </div>

        {/* Simulator Body: SVG Canvas + Step Log */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* SVG Graph Canvas (7 cols) */}
          <div className="md:col-span-7 bg-[#070b14] rounded-2xl p-4 border border-slate-800/90 flex items-center justify-center relative overflow-hidden h-[340px]">
            <svg viewBox="0 0 360 360" className="w-full h-full max-w-[340px] max-h-[340px]">
              {/* Background Edges */}
              {toyGraph.nodes.map((nodeA, i) =>
                toyGraph.nodes.map((nodeB, j) => {
                  if (j <= i) return null;
                  const weight = toyGraph.matrix[i]?.[j] || 0;
                  return (
                    <g key={`edge-${i}-${j}`}>
                      <line
                        x1={nodeA.x}
                        y1={nodeA.y}
                        x2={nodeB.x}
                        y2={nodeB.y}
                        stroke="var(--graph-edge)"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={(nodeA.x + nodeB.x) / 2}
                        y={(nodeA.y + nodeB.y) / 2 - 4}
                        fill="var(--graph-muted)"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {weight}km
                      </text>
                    </g>
                  );
                })
              )}

              {/* Active Traversed Edges */}
              {toyGraph.nn_trace.slice(0, currentStep).map((trace, idx) => {
                const nodeA = toyGraph.nodes[trace.from];
                const nodeB = toyGraph.nodes[trace.to];
                if (!nodeA || !nodeB) return null;
                const isLatest = idx === currentStep - 1;
                return (
                  <g key={`active-edge-${idx}`}>
                    <line
                      x1={nodeA.x}
                      y1={nodeA.y}
                      x2={nodeB.x}
                      y2={nodeB.y}
                      stroke="var(--accent)"
                      strokeWidth={isLatest ? '4' : '3'}
                      strokeLinecap="round"
                    />
                  </g>
                );
              })}

              {/* Graph Vertices */}
              {toyGraph.nodes.map((node) => {
                const isVisited = visitedNodeIds.has(node.id);
                const isCurrent = currentTrace ? currentTrace.to === node.id : node.id === 0;

                return (
                  <g key={`node-${node.id}`} className="cursor-pointer">
                    {isCurrent && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="24"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="2"
                        className="animate-ping origin-center"
                        opacity="0.6"
                      />
                    )}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="16"
                      fill={isCurrent ? 'var(--accent)' : isVisited ? 'var(--accent-strong)' : 'var(--surface-muted)'}
                      stroke="var(--accent)"
                      strokeWidth="2"
                    />
                    <text
                      x={node.x}
                      y={node.y + 4}
                      fill={isCurrent || isVisited ? 'var(--button-text)' : 'var(--text-primary)'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.id}
                    </text>
                    <text
                      x={node.x}
                      y={node.y + 30}
                      fill={isCurrent ? 'var(--accent)' : 'var(--graph-muted)'}
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Step Details & Decision Feed (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-4 rounded-2xl bg-[#091020] border border-slate-800">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                Current Decision State
              </span>
              <div className="mt-2 text-sm font-semibold text-white">
                {currentStep === 0 ? (
                  <span>Initialization: Start at Departure Vertex 0 (Berlin).</span>
                ) : currentTrace ? (
                  <span className="text-cyan-300">{currentTrace.action}</span>
                ) : (
                  <span>Cycle completed! Reached origin.</span>
                )}
              </div>

              {currentTrace && (
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Step Weight:</span>
                  <span className="text-cyan-400 font-bold">+{currentTrace.dist} km</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-[#091020] border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Step-by-Step Execution Log
              </span>
              <div className="mt-2 space-y-1.5 max-h-[160px] overflow-y-auto pr-1 text-xs">
                {toyGraph.nn_trace.map((t, idx) => {
                  const isDone = idx < currentStep;
                  const isCurrent = idx === currentStep - 1;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-200'
                          : isDone
                          ? 'bg-slate-900/60 text-slate-300'
                          : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px]">#{t.step}</span>
                        <span>{t.action}</span>
                      </div>
                      <span className="font-mono text-[11px] font-semibold">{t.dist} km</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Theoretical Analysis & Pseudocode */}
      {activeDoc && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Deep Dive & Complexity (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            {/* Complexity Cards */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Asymptotic Complexity Analysis</span>
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#091020] border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">Time Complexity</span>
                  <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                    {activeDoc.time_complexity}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {activeDoc.optimality_guaranteed ? 'Exponential/Factorial bound' : 'Quadratic polynomial bound'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#091020] border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400">Space Complexity</span>
                  <div className="text-xl font-mono font-bold text-purple-400 mt-1">
                    {activeDoc.space_complexity}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">Auxiliary state tables & recursion</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                {activeDoc.description}
              </p>
            </div>

            {/* Pros & Cons */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Engineering Trade-Offs
              </h3>

              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Algorithmic Strengths
                </span>
                <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                  {activeDoc.pros.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" /> Constraints & Vulnerabilities
                </span>
                <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                  {activeDoc.cons.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* DAA Theoretical Deep Dive */}
            <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-xs leading-relaxed text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>DAA Theoretical Foundation</span>
              </div>
              <p>{activeDoc.daa_deep_dive}</p>
            </div>
          </div>

          {/* Right: Pseudocode Viewer (6 cols) */}
          <div className="lg:col-span-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 h-full flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Formal Pseudocode Implementation</span>
                </h3>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                  {activeDoc.id}.py
                </span>
              </div>

              <div className="bg-[#070b14] p-4 rounded-2xl border border-slate-800/80 font-mono text-xs text-cyan-300/90 overflow-x-auto flex-1 leading-relaxed shadow-inner">
                <pre>{activeDoc.pseudocode}</pre>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Maximum safe size: <strong>N ≤ {activeDoc.max_recommended_nodes}</strong></span>
                <span className="text-cyan-400 font-semibold">VoyageAI Core Spec</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
