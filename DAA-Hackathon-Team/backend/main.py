import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional

try:
    from models import (
        City, OptimizeRequest, OptimizeResponse, AlgorithmResult,
        RouteLeg, CostBreakdown, ComparisonResponse
    )
    from algorithms.nearest_neighbor import solve_nearest_neighbor
    from algorithms.held_karp import solve_held_karp
    from algorithms.brute_force import solve_brute_force
    from algorithms.comparison import compare_all_algorithms
    from services.osrm_service import fetch_osrm_matrix, fetch_route_geometry
    from services.cost_calculator import calculate_route_cost
    from services.city_database import search_cities_service, PRESET_CITIES, SAMPLE_TOURS
    from services.algorithm_info import ALGORITHMS_INFO, TOY_DEMO_GRAPH
except ImportError:
    from .models import (
        City, OptimizeRequest, OptimizeResponse, AlgorithmResult,
        RouteLeg, CostBreakdown, ComparisonResponse
    )
    from .algorithms.nearest_neighbor import solve_nearest_neighbor
    from .algorithms.held_karp import solve_held_karp
    from .algorithms.brute_force import solve_brute_force
    from .algorithms.comparison import compare_all_algorithms
    from .services.osrm_service import fetch_osrm_matrix, fetch_route_geometry
    from .services.cost_calculator import calculate_route_cost
    from .services.city_database import search_cities_service, PRESET_CITIES, SAMPLE_TOURS
    from .services.algorithm_info import ALGORITHMS_INFO, TOY_DEMO_GRAPH

app = FastAPI(
    title="VoyageAI API",
    description="Intelligent Route Optimization using DAA Algorithms (Greedy Nearest Neighbor, Held-Karp DP, Brute Force)",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "VoyageAI Optimization Engine",
        "version": "1.0.0",
        "algorithms_available": ["nearest_neighbor", "held_karp", "brute_force"]
    }

@app.get("/api/cities/search")
async def search_cities(q: str = Query("", description="City or country search term"), limit: int = 8):
    results = await search_cities_service(q, limit=limit)
    return {"cities": results}

@app.get("/api/cities/presets")
def get_presets():
    return {
        "popular_cities": PRESET_CITIES,
        "sample_tours": SAMPLE_TOURS
    }

@app.get("/api/algorithms/info")
def get_algorithm_info():
    return {
        "algorithms": ALGORITHMS_INFO,
        "toy_graph": TOY_DEMO_GRAPH
    }

@app.post("/api/route/optimize", response_model=OptimizeResponse)
async def optimize_route(req: OptimizeRequest):
    cities = req.cities
    n = len(cities)
    if n < 2:
        raise HTTPException(status_code=400, detail="At least 2 cities are required to construct a route.")
    if n > 25:
        raise HTTPException(status_code=400, detail="Maximum 25 cities allowed per route optimization.")

    coords = [(c.lat, c.lng) for c in cities]

    # 1. Fetch pairwise distance matrix (OSRM road table or Haversine fallback)
    dist_matrix, dur_matrix, routing_source = await fetch_osrm_matrix(coords)

    # 2. Run selected algorithm
    algo_key = req.algorithm.lower()
    algo_result_data = None
    
    try:
        if algo_key == "nearest_neighbor":
            raw_res = solve_nearest_neighbor(dist_matrix, start_index=0, round_trip=req.round_trip)
            algo_result_data = {
                "algorithm_id": "nearest_neighbor",
                "algorithm_name": "Nearest Neighbor (Greedy)",
                "tour_indices": raw_res["tour"],
                "total_distance_km": raw_res["distance"],
                "execution_time_ms": raw_res["execution_time_ms"],
                "complexity_time": raw_res["complexity_time"],
                "complexity_space": raw_res["complexity_space"],
                "is_optimal_guaranteed": False,
                "operations_count": raw_res.get("operations_count", 0),
                "notes": "Greedy O(N²) selection; fast polynomial approximation."
            }
        elif algo_key == "held_karp":
            raw_res = solve_held_karp(dist_matrix, start_index=0, round_trip=req.round_trip)
            algo_result_data = {
                "algorithm_id": "held_karp",
                "algorithm_name": "Held-Karp (Dynamic Programming)",
                "tour_indices": raw_res["tour"],
                "total_distance_km": raw_res["distance"],
                "execution_time_ms": raw_res["execution_time_ms"],
                "complexity_time": raw_res["complexity_time"],
                "complexity_space": raw_res["complexity_space"],
                "is_optimal_guaranteed": True,
                "operations_count": raw_res.get("states_computed", 0),
                "notes": "Exact dynamic programming with bitmask state memoization."
            }
        elif algo_key == "brute_force":
            raw_res = solve_brute_force(dist_matrix, start_index=0, round_trip=req.round_trip)
            algo_result_data = {
                "algorithm_id": "brute_force",
                "algorithm_name": "Brute Force Search",
                "tour_indices": raw_res["tour"],
                "total_distance_km": raw_res["distance"],
                "execution_time_ms": raw_res["execution_time_ms"],
                "complexity_time": raw_res["complexity_time"],
                "complexity_space": raw_res["complexity_space"],
                "is_optimal_guaranteed": True,
                "operations_count": raw_res.get("permutations_evaluated", 0),
                "notes": "Exhaustive permutation evaluation guaranteeing global optimum."
            }
        else:
            raise HTTPException(status_code=400, detail=f"Unknown algorithm '{req.algorithm}'. Valid options: nearest_neighbor, held_karp, brute_force.")
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Algorithm optimization error: {str(e)}")

    tour = algo_result_data["tour_indices"]
    ordered_cities = [cities[idx] for idx in tour]
    algo_result_data["ordered_cities"] = ordered_cities
    algo_result_data["nodes_count"] = n

    # 3. Calculate ordered road geometry & legs
    ordered_coords = [(c.lat, c.lng) for c in ordered_cities]
    geometry, raw_legs, geom_source = await fetch_route_geometry(ordered_coords)

    # Calculate estimated duration in minutes
    total_duration_min = 0.0
    legs: List[RouteLeg] = []
    for i in range(len(ordered_cities) - 1):
        from_c = ordered_cities[i]
        to_c = ordered_cities[i + 1]
        leg_dist = raw_legs[i]["distance_km"] if i < len(raw_legs) else 0.0
        leg_dur = raw_legs[i]["duration_minutes"] if i < len(raw_legs) else 0.0
        total_duration_min += leg_dur

        legs.append(RouteLeg(
            leg_index=i + 1,
            from_city=from_c,
            to_city=to_c,
            distance_km=leg_dist,
            duration_minutes=leg_dur
        ))

    algo_result_data["estimated_duration_minutes"] = round(total_duration_min, 1)

    # 4. Compute cost breakdown
    is_india_route = bool(cities) and all((c.country or "").strip().lower() == "india" for c in cities)
    cost_data = calculate_route_cost(
        distance_km=algo_result_data["total_distance_km"],
        vehicle_type=req.vehicle_type,
        fuel_price_override=req.fuel_price_override,
        currency="INR" if is_india_route else "USD"
    )

    routing_note = (
        "Calculated using OpenStreetMap OSRM real highway network."
        if routing_source == "OSRM_ROAD"
        else "Computed using Haversine formula with a 1.25x circuity factor (OSRM road service unreachable)."
    )

    return OptimizeResponse(
        algorithm_result=AlgorithmResult(**algo_result_data),
        cost_breakdown=CostBreakdown(**cost_data),
        route_geometry=geometry,
        legs=legs,
        routing_source=routing_source,
        routing_note=routing_note,
        round_trip=req.round_trip
    )

@app.post("/api/route/compare", response_model=ComparisonResponse)
async def compare_route(req: OptimizeRequest):
    cities = req.cities
    n = len(cities)
    if n < 2:
        raise HTTPException(status_code=400, detail="At least 2 cities are required to compare algorithms.")
    if n > 25:
        raise HTTPException(status_code=400, detail="Maximum 25 cities allowed.")

    coords = [(c.lat, c.lng) for c in cities]
    dist_matrix, dur_matrix, routing_source = await fetch_osrm_matrix(coords)

    comparison_raw = compare_all_algorithms(dist_matrix, start_index=0, round_trip=req.round_trip)
    
    formatted_results: List[AlgorithmResult] = []
    for res in comparison_raw["results"]:
        tour = res.get("tour", [])
        ordered = [cities[idx] for idx in tour] if tour else []
        formatted_results.append(AlgorithmResult(
            algorithm_id=res["algorithm_id"],
            algorithm_name=res["algorithm_name"],
            tour_indices=tour,
            ordered_cities=ordered,
            total_distance_km=res.get("distance", 0.0),
            estimated_duration_minutes=round((res.get("distance", 0.0) / 80.0) * 60, 1),
            execution_time_ms=res.get("execution_time_ms", 0.0),
            complexity_time=res.get("complexity_time", ""),
            complexity_space=res.get("complexity_space", ""),
            is_optimal_guaranteed=res.get("is_optimal", False),
            nodes_count=n,
            operations_count=res.get("operations_count") or res.get("states_computed") or res.get("permutations_evaluated") or 0,
            notes=res.get("skip_reason") or res.get("error"),
            cost_breakdown=calculate_route_cost(
                distance_km=res.get("distance", 0.0),
                vehicle_type=req.vehicle_type,
                fuel_price_override=req.fuel_price_override,
                currency="INR" if all((c.country or "").strip().lower() == "india" for c in cities) else "USD"
            ) if not res.get("skipped") and not res.get("error") else None
        ))

    # Compute execution time factor
    times = [r.execution_time_ms for r in formatted_results if r.execution_time_ms > 0]
    time_factor = (max(times) / min(times)) if len(times) >= 2 and min(times) > 0 else 1.0

    return ComparisonResponse(
        results=formatted_results,
        fastest_algorithm=comparison_raw["fastest_algorithm"],
        shortest_distance_algorithm=comparison_raw["shortest_distance_algorithm"],
        distance_saving_pct=comparison_raw["distance_saving_pct"],
        time_difference_factor=round(time_factor, 1),
        node_count=n,
        routing_source=routing_source
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
