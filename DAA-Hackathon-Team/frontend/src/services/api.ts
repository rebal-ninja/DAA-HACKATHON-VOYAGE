import type { City, OptimizeResponse, ComparisonResponse, AlgorithmDoc, ToyGraphNode, ToyGraphTrace, SampleTour } from '../types';

const API_BASE = '/api';

export async function searchCities(query: string, limit = 8): Promise<City[]> {
  try {
    const res = await fetch(`${API_BASE}/cities/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.cities || [];
  } catch (err) {
    console.warn('Backend search unreachable, using fallback list', err);
    return getFallbackCities().filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      (c.country && c.country.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, limit);
  }
}

export async function getPresets(): Promise<{ popular_cities: City[]; sample_tours: SampleTour[] }> {
  try {
    const res = await fetch(`${API_BASE}/cities/presets`);
    if (!res.ok) throw new Error('Presets failed');
    return await res.json();
  } catch (err) {
    console.warn('Backend presets unreachable, using fallback', err);
    return {
      popular_cities: getFallbackCities(),
      sample_tours: [
        { id: 'euro_tour', title: 'European Grand Loop', description: 'European cities linked by cross-border road corridors', city_ids: ['paris', 'brussels', 'amsterdam', 'berlin', 'prague', 'vienna', 'zurich'] },
        { id: 'california_coastal', title: 'California Pacific Express', description: 'West Coast hubs from the Pacific Northwest to Southern California', city_ids: ['seattle', 'portland', 'sf', 'la', 'sandiego', 'lasvegas'] },
        { id: 'golden_triangle_india', title: "India's Golden Triangle", description: 'Historic North India route through Delhi, Agra, and Jaipur', city_ids: ['delhi', 'agra', 'jaipur'] },
        { id: 'japan_tokyo_osaka', title: 'Japan Cultural Corridor', description: "Tokyo, Kyoto, and Osaka across Japan's main island", city_ids: ['tokyo', 'kyoto', 'osaka'] },
        { id: 'south_india_heritage', title: 'South India Heritage Trail', description: 'A South Indian journey through Hyderabad, Hampi, and Bengaluru', city_ids: ['hyderabad', 'hampi', 'bengaluru'] },
        { id: 'west_india_circuit', title: 'Western India City Circuit', description: 'A western India loop across Mumbai, Pune, and Hyderabad', city_ids: ['mumbai', 'pune', 'hyderabad'] }
      ]
    };
  }
}

export async function optimizeRouteApi(
  cities: City[],
  algorithm: string,
  roundTrip: boolean,
  vehicleType: string,
  fuelPriceOverride?: number
): Promise<OptimizeResponse> {
  const payload = {
    cities,
    algorithm,
    round_trip: roundTrip,
    vehicle_type: vehicleType,
    fuel_price_override: fuelPriceOverride
  };

  const res = await fetch(`${API_BASE}/route/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ detail: 'Optimization request failed' }));
    throw new Error(errorJson.detail || 'Optimization failed');
  }

  return await res.json();
}

export async function compareRouteApi(
  cities: City[],
  roundTrip: boolean,
  vehicleType: string
): Promise<ComparisonResponse> {
  const payload = {
    cities,
    algorithm: 'compare_all',
    round_trip: roundTrip,
    vehicle_type: vehicleType
  };

  const res = await fetch(`${API_BASE}/route/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({ detail: 'Comparison request failed' }));
    throw new Error(errorJson.detail || 'Comparison failed');
  }

  return await res.json();
}

export async function getAlgorithmInfoApi(): Promise<{
  algorithms: Record<string, AlgorithmDoc>;
  toy_graph: { nodes: ToyGraphNode[]; matrix: number[][]; nn_trace: ToyGraphTrace[] };
}> {
  try {
    const res = await fetch(`${API_BASE}/algorithms/info`);
    if (!res.ok) throw new Error('Failed to fetch algorithm info');
    return await res.json();
  } catch (err) {
    console.warn('Algorithm info fallback', err);
    return getFallbackAlgorithmInfo();
  }
}

function getFallbackCities(): City[] {
  return [
    { id: 'paris', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, display_name: 'Paris, France' },
    { id: 'london', name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, display_name: 'London, UK' },
    { id: 'berlin', name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050, display_name: 'Berlin, Germany' },
    { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, display_name: 'Amsterdam, Netherlands' },
    { id: 'brussels', name: 'Brussels', country: 'Belgium', lat: 50.8503, lng: 4.3517, display_name: 'Brussels, Belgium' },
    { id: 'prague', name: 'Prague', country: 'Czech Republic', lat: 50.0755, lng: 14.4378, display_name: 'Prague, Czech Republic' },
    { id: 'vienna', name: 'Vienna', country: 'Austria', lat: 48.2082, lng: 16.3738, display_name: 'Vienna, Austria' },
    { id: 'zurich', name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, display_name: 'Zurich, Switzerland' },
    { id: 'rome', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, display_name: 'Rome, Italy' },
    { id: 'milan', name: 'Milan', country: 'Italy', lat: 45.4642, lng: 9.1900, display_name: 'Milan, Italy' },
    { id: 'barcelona', name: 'Barcelona', country: 'Spain', lat: 41.3851, lng: 2.1734, display_name: 'Barcelona, Spain' },
    { id: 'nyc', name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060, display_name: 'New York, USA' },
    { id: 'sf', name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, display_name: 'San Francisco, USA' },
    { id: 'la', name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, display_name: 'Los Angeles, USA' },
    { id: 'seattle', name: 'Seattle', country: 'United States', lat: 47.6062, lng: -122.3321, display_name: 'Seattle, USA' },
    { id: 'portland', name: 'Portland', country: 'United States', lat: 45.5152, lng: -122.6784, display_name: 'Portland, USA' },
    { id: 'sandiego', name: 'San Diego', country: 'United States', lat: 32.7157, lng: -117.1611, display_name: 'San Diego, USA' },
    { id: 'lasvegas', name: 'Las Vegas', country: 'United States', lat: 36.1699, lng: -115.1398, display_name: 'Las Vegas, USA' },
    { id: 'delhi', name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090, display_name: 'New Delhi, India' },
    { id: 'agra', name: 'Agra', country: 'India', state: 'Uttar Pradesh', lat: 27.1767, lng: 78.0081, display_name: 'Agra, India' },
    { id: 'jaipur', name: 'Jaipur', country: 'India', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, display_name: 'Jaipur, India' },
    { id: 'udaipur', name: 'Udaipur', country: 'India', state: 'Rajasthan', lat: 24.5854, lng: 73.7125, display_name: 'Udaipur, India' },
    { id: 'mumbai', name: 'Mumbai', country: 'India', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, display_name: 'Mumbai, India' },
    { id: 'pune', name: 'Pune', country: 'India', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, display_name: 'Pune, India' },
    { id: 'bengaluru', name: 'Bengaluru', country: 'India', state: 'Karnataka', lat: 12.9716, lng: 77.5946, display_name: 'Bengaluru, India' },
    { id: 'hyderabad', name: 'Hyderabad', country: 'India', state: 'Telangana', lat: 17.3850, lng: 78.4867, display_name: 'Hyderabad, India' },
    { id: 'hampi', name: 'Hampi', country: 'India', state: 'Karnataka', lat: 15.3350, lng: 76.4600, display_name: 'Hampi, Karnataka, India' },
    { id: 'tokyo', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, display_name: 'Tokyo, Japan' },
    { id: 'kyoto', name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681, display_name: 'Kyoto, Japan' },
    { id: 'osaka', name: 'Osaka', country: 'Japan', lat: 34.6937, lng: 135.5023, display_name: 'Osaka, Japan' },
  ];
}

function getFallbackAlgorithmInfo() {
  return {
    algorithms: {
      nearest_neighbor: {
        id: 'nearest_neighbor',
        name: 'Nearest Neighbor',
        paradigm: 'Greedy Heuristic',
        time_complexity: 'O(N²)',
        space_complexity: 'O(N)',
        optimality_guaranteed: false,
        max_recommended_nodes: 1000,
        description: 'Constructs a tour by greedily appending the nearest unvisited node until all cities are traversed.',
        pros: ['Extremely fast O(N²)', 'Negligible memory O(N)', 'Scales to 1000+ nodes'],
        cons: ['Does not guarantee global optimality', 'Can leave very long closing leg'],
        pseudocode: `for step from 1 to n - 1:\n  nearest = min(unvisited)\n  tour.append(nearest)`,
        daa_deep_dive: 'Greedy choice property without matroid optimality guarantees.'
      },
      held_karp: {
        id: 'held_karp',
        name: 'Held-Karp Dynamic Programming',
        paradigm: 'Dynamic Programming with Bitmasking',
        time_complexity: 'O(N² · 2ᴺ)',
        space_complexity: 'O(N · 2ᴺ)',
        optimality_guaranteed: true,
        max_recommended_nodes: 17,
        description: 'State memoization over subsets represented as bitmasks to guarantee optimal tour.',
        pros: ['Provably optimal shortest tour', 'Massive speedup over (N-1)! brute force'],
        cons: ['Exponential time and memory O(N² · 2ᴺ)', 'Limited to N <= 17'],
        pseudocode: `memo[(mask, j)] = min(memo[(prev_mask, k)] + dist[k][j])`,
        daa_deep_dive: 'Optimal substructure and overlapping subproblems in NP-Hard space.'
      },
      brute_force: {
        id: 'brute_force',
        name: 'Brute Force Search',
        paradigm: 'Exhaustive Permutation Search',
        time_complexity: 'O(N!)',
        space_complexity: 'O(N)',
        optimality_guaranteed: true,
        max_recommended_nodes: 10,
        description: 'Evaluates all (N-1)! permutations to find the absolute global minimum.',
        pros: ['Trivially provable correctness', 'O(N) memory requirement'],
        cons: ['Factorial explosion O(N!)', 'Strictly unviable beyond N=10'],
        pseudocode: `for perm in permutations(nodes):\n  min_dist = min(min_dist, dist(perm))`,
        daa_deep_dive: 'Combinatorial explosion baseline of the Traveling Salesperson Problem.'
      }
    },
    toy_graph: {
      nodes: [
        { id: 0, name: 'Berlin', x: 180, y: 80 },
        { id: 1, name: 'Prague', x: 260, y: 190 },
        { id: 2, name: 'Vienna', x: 240, y: 300 },
        { id: 3, name: 'Munich', x: 80, y: 250 },
      ],
      matrix: [
        [0, 280, 524, 504],
        [280, 0, 252, 382],
        [524, 252, 0, 355],
        [504, 382, 355, 0]
      ],
      nn_trace: [
        { step: 1, from: 0, to: 1, dist: 280, action: 'From Berlin, Prague (280km) is nearest' },
        { step: 2, from: 1, to: 2, dist: 252, action: 'From Prague, Vienna (252km) is nearest' },
        { step: 3, from: 2, to: 3, dist: 355, action: 'From Vienna, only Munich (355km) remains' },
        { step: 4, from: 3, to: 0, dist: 504, action: 'Closing leg back to Berlin (504km)' }
      ]
    }
  };
}
