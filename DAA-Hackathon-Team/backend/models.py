from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class City(BaseModel):
    id: str
    name: str
    country: Optional[str] = ""
    lat: float
    lng: float
    display_name: Optional[str] = None
    state: Optional[str] = None

class OptimizeRequest(BaseModel):
    cities: List[City]
    algorithm: str = Field(default="nearest_neighbor", description="nearest_neighbor | held_karp | brute_force | compare_all")
    round_trip: bool = Field(default=True, description="True if cycle returns to starting city")
    vehicle_type: str = Field(default="car", description="car | ev | van | truck | motorcycle")
    fuel_price_override: Optional[float] = None

class RouteLeg(BaseModel):
    leg_index: int
    from_city: City
    to_city: City
    distance_km: float
    duration_minutes: float
    geometry: Optional[List[List[float]]] = None # [lat, lng] pairs

class CostBreakdown(BaseModel):
    fuel_cost: float
    tolls_estimate: float
    maintenance_cost: float
    total_cost: float
    co2_kg: float
    vehicle_type: str
    consumption_rate: str
    currency: str = "USD"
    is_estimate: bool = True
    disclaimer: str = "Estimates derived from standard fleet modeling coefficients; real-world costs may vary with terrain, weather, and tollway policies."

class AlgorithmResult(BaseModel):
    algorithm_id: str
    algorithm_name: str
    tour_indices: List[int]
    ordered_cities: List[City]
    total_distance_km: float
    estimated_duration_minutes: float
    execution_time_ms: float
    complexity_time: str
    complexity_space: str
    is_optimal_guaranteed: bool
    nodes_count: int
    operations_count: Optional[int] = 0
    notes: Optional[str] = None

class OptimizeResponse(BaseModel):
    algorithm_result: AlgorithmResult
    cost_breakdown: CostBreakdown
    route_geometry: List[List[float]] # [lat, lng] path coordinates for Leaflet
    legs: List[RouteLeg]
    routing_source: str # "OSRM_ROAD" or "HAVERSINE_FALLBACK"
    routing_note: str
    round_trip: bool

class ComparisonResponse(BaseModel):
    results: List[AlgorithmResult]
    fastest_algorithm: str
    shortest_distance_algorithm: str
    distance_saving_pct: float
    time_difference_factor: float
    node_count: int
    routing_source: str
