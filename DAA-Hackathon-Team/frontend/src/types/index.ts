export interface City {
  id: string;
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lng: number;
  display_name?: string;
}

export type VehicleType = 'car' | 'ev' | 'van' | 'truck' | 'motorcycle';
export type AlgorithmId = 'nearest_neighbor' | 'held_karp' | 'brute_force';

export interface RouteLeg {
  leg_index: number;
  from_city: City;
  to_city: City;
  distance_km: number;
  duration_minutes: number;
  geometry?: [number, number][];
}

export interface CostBreakdown {
  fuel_cost: number;
  tolls_estimate: number;
  maintenance_cost: number;
  total_cost: number;
  co2_kg: number;
  vehicle_type: string;
  consumption_rate: string;
  currency: string;
  is_estimate: boolean;
  disclaimer: string;
}

export interface AlgorithmResult {
  algorithm_id: string;
  algorithm_name: string;
  tour_indices: number[];
  ordered_cities: City[];
  total_distance_km: number;
  estimated_duration_minutes: number;
  execution_time_ms: number;
  complexity_time: string;
  complexity_space: string;
  is_optimal_guaranteed: boolean;
  nodes_count: number;
  operations_count?: number;
  notes?: string;
  cost_breakdown?: CostBreakdown;
}

export interface OptimizeResponse {
  algorithm_result: AlgorithmResult;
  cost_breakdown: CostBreakdown;
  route_geometry: [number, number][]; // [lat, lng] array
  legs: RouteLeg[];
  routing_source: 'OSRM_ROAD' | 'HAVERSINE_FALLBACK' | 'LOCAL';
  routing_note: string;
  round_trip: boolean;
}

export interface ComparisonResponse {
  results: AlgorithmResult[];
  fastest_algorithm: string;
  shortest_distance_algorithm: string;
  distance_saving_pct: number;
  time_difference_factor: number;
  node_count: number;
  routing_source: string;
}

export interface AlgorithmDoc {
  id: string;
  name: string;
  paradigm: string;
  time_complexity: string;
  space_complexity: string;
  optimality_guaranteed: boolean;
  max_recommended_nodes: number;
  description: string;
  pros: string[];
  cons: string[];
  pseudocode: string;
  daa_deep_dive: string;
}

export interface ToyGraphNode {
  id: number;
  name: string;
  x: number;
  y: number;
}

export interface ToyGraphTrace {
  step: number;
  from: number;
  to: number;
  dist: number;
  action: string;
}

export interface SampleTour {
  id: string;
  title: string;
  description: string;
  city_ids: string[];
}

export type ActiveTab = 'dashboard' | 'planner' | 'results' | 'comparison' | 'lab';
