import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type {
  City, ActiveTab, VehicleType, AlgorithmId,
  OptimizeResponse, ComparisonResponse, SampleTour
} from './types';
import { getPresets, optimizeRouteApi } from './services/api';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { RoutePlannerView } from './components/RoutePlannerView';
import { ResultsView } from './components/ResultsView';
import { AlgorithmComparisonView } from './components/AlgorithmComparisonView';
import { AlgorithmLabView } from './components/AlgorithmLabView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('voyage-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('voyage-theme', theme);
  }, [theme]);
  
  // Default Initial 4 European Hubs
  const [cities, setCities] = useState<City[]>([
    { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, display_name: 'Paris, France' },
    { id: 'brussels', name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, display_name: 'Brussels, Belgium' },
    { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, display_name: 'Amsterdam, Netherlands' },
    { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, display_name: 'Berlin, Germany' },
  ]);

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmId>('held_karp');
  const [isRoundTrip, setIsRoundTrip] = useState<boolean>(true);
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');

  const [optimizationResult, setOptimizationResult] = useState<OptimizeResponse | null>(null);
  const [comparisonData, setComparisonData] = useState<ComparisonResponse | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [popularCities, setPopularCities] = useState<City[]>([]);
  const [sampleTours, setSampleTours] = useState<SampleTour[]>([]);

  // Fetch preset tours and popular destinations on load
  useEffect(() => {
    getPresets().then((data) => {
      if (data.popular_cities) setPopularCities(data.popular_cities);
      if (data.sample_tours) setSampleTours(data.sample_tours);
    });
  }, []);

  // Handlers for City Manipulation
  const handleAddCity = (city: City) => {
    // Avoid exact duplicate IDs or coordinates
    if (cities.some(c => c.name.toLowerCase() === city.name.toLowerCase())) {
      setError(`"${city.name}" is already in your waypoint list.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCities((prev) => [...prev, city]);
    setError(null);
  };

  const handleRemoveCity = (index: number) => {
    setCities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveCity = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= cities.length) return;
    setCities((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
  };

  const handleClearCities = () => {
    setCities([]);
    setOptimizationResult(null);
    setComparisonData(null);
  };

  // Load Preset Showcase Tour
  const handleLoadTour = (tour: SampleTour) => {
    if (popularCities.length === 0) return;
    const tourCities = tour.city_ids
      .map((id) => popularCities.find((c) => c.id === id))
      .filter((c): c is City => c !== undefined);

    if (tourCities.length > 0) {
      setCities(tourCities);
      setActiveTab('planner');
      // Trigger optimize on load for seamless instant demo
      setTimeout(() => {
        handleOptimizeRoute(tourCities);
      }, 100);
    }
  };

  // Run Route Optimization
  const handleOptimizeRoute = async (customCities?: City[]) => {
    const targetCities = customCities || cities;
    if (targetCities.length < 2) {
      setError('Please select at least 2 cities to compute a route.');
      return;
    }

    // Guard limits check
    if (selectedAlgorithm === 'held_karp' && targetCities.length > 17) {
      setError(`Held-Karp limit is 17 cities (you have ${targetCities.length}). Please switch to Nearest Neighbor.`);
      return;
    }
    if (selectedAlgorithm === 'brute_force' && targetCities.length > 10) {
      setError(`Brute Force limit is 10 cities (you have ${targetCities.length}). Please switch to Held-Karp or Nearest Neighbor.`);
      return;
    }

    setError(null);
    setIsOptimizing(true);

    try {
      const res = await optimizeRouteApi(
        targetCities,
        selectedAlgorithm,
        isRoundTrip,
        vehicleType
      );
      setOptimizationResult(res);
      setActiveTab('results');

      // Trigger Confetti Celebration if optimal
      if (res.algorithm_result.is_optimal_guaranteed) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#06b6d4', '#10b981', '#3b82f6', '#ffffff']
        });
      }
    } catch (err: any) {
      setError(err.message || 'Route optimization failed.');
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="app-shell flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        stopsCount={cities.length}
        hasResult={optimizationResult !== null}
        theme={theme}
        onToggleTheme={() => setTheme((current) => current === 'light' ? 'dark' : 'light')}
      />

      {/* Main View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            onNavigate={setActiveTab}
            onLoadTour={handleLoadTour}
            sampleTours={sampleTours}
            lastResult={optimizationResult?.algorithm_result}
          />
        )}

        {activeTab === 'planner' && (
          <RoutePlannerView
            cities={cities}
            onAddCity={handleAddCity}
            onRemoveCity={handleRemoveCity}
            onMoveCity={handleMoveCity}
            onClearCities={handleClearCities}
            selectedAlgorithm={selectedAlgorithm}
            onSelectAlgorithm={setSelectedAlgorithm}
            isRoundTrip={isRoundTrip}
            onToggleRoundTrip={setIsRoundTrip}
            vehicleType={vehicleType}
            onSelectVehicle={setVehicleType}
            onOptimize={() => handleOptimizeRoute()}
            isOptimizing={isOptimizing}
            error={error}
            popularCities={popularCities}
          />
        )}

        {activeTab === 'results' && (
          optimizationResult ? (
            <ResultsView
              result={optimizationResult}
              onNavigate={setActiveTab}
              onReplan={() => setActiveTab('planner')}
            />
          ) : (
            <div className="text-center py-20 glass-panel rounded-3xl border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">No Active Route Result</h2>
              <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
                No route has been optimized in this session yet. Go to the Route Planner to configure stops and run an algorithm.
              </p>
              <button
                onClick={() => setActiveTab('planner')}
                className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer shadow-lg"
              >
                Go to Route Planner
              </button>
            </div>
          )
        )}

        {activeTab === 'comparison' && (
          <AlgorithmComparisonView
            cities={cities}
            isRoundTrip={isRoundTrip}
            vehicleType={vehicleType}
            comparisonData={comparisonData}
            onSetComparisonData={setComparisonData}
            onNavigate={setActiveTab}
          />
        )}

        {activeTab === 'lab' && <AlgorithmLabView />}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-[#080d1a]/80 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">VoyageAI</span>
            <span className="text-slate-600">•</span>
            <span>Intelligent Route Optimization using DAA Algorithms</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>FastAPI + Python Backend</span>
            <span className="text-slate-700">|</span>
            <span>OSRM Road Geometry</span>
            <span className="text-slate-700">|</span>
            <span>Leaflet + OpenStreetMap</span>
            <span className="text-slate-700">|</span>
            <span className="text-cyan-400 font-semibold">Held-Karp Exact DP</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
