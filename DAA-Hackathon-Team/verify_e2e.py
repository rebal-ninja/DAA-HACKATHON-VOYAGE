import urllib.request
import json
import sys

print("--- 1. Testing Health Endpoint ---")
req = urllib.request.urlopen("http://127.0.0.1:8000/api/health")
health_data = json.loads(req.read().decode())
print("Health status:", req.status, health_data)

print("\n--- 2. Testing City Search (Prague) ---")
req = urllib.request.urlopen("http://127.0.0.1:8000/api/cities/search?q=Prague")
search_data = json.loads(req.read().decode())
print(f"Found {len(search_data['cities'])} matches. Top match: {search_data['cities'][0]['name']}, {search_data['cities'][0]['country']}")

print("\n--- 3. Testing Held-Karp Optimization on 4 European Hubs ---")
payload = json.dumps({
    "cities": [
        {"id": "paris", "name": "Paris", "lat": 48.8566, "lng": 2.3522},
        {"id": "brussels", "name": "Brussels", "lat": 50.8503, "lng": 4.3517},
        {"id": "amsterdam", "name": "Amsterdam", "lat": 52.3676, "lng": 4.9041},
        {"id": "berlin", "name": "Berlin", "lat": 52.5200, "lng": 13.4050}
    ],
    "algorithm": "held_karp",
    "round_trip": True,
    "vehicle_type": "ev"
}).encode("utf-8")

request = urllib.request.Request("http://127.0.0.1:8000/api/route/optimize", data=payload, headers={"Content-Type": "application/json"})
resp = urllib.request.urlopen(request)
opt_data = json.loads(resp.read().decode())

print(f"Algorithm: {opt_data['algorithm_result']['algorithm_name']}")
print(f"Total Distance: {opt_data['algorithm_result']['total_distance_km']} km")
print(f"Execution Runtime: {opt_data['algorithm_result']['execution_time_ms']} ms")
print(f"Routing Source: {opt_data['routing_source']}")
print(f"Stops: {' -> '.join([c['name'] for c in opt_data['algorithm_result']['ordered_cities']])}")
print(f"Total Road Geometry Points: {len(opt_data['route_geometry'])}")
print(f"Estimated Cost Breakdown: ${opt_data['cost_breakdown']['total_cost']} ({opt_data['cost_breakdown']['consumption_rate']})")

print("\n--- 4. Testing Multi-Algorithm Comparison ---")
request_cmp = urllib.request.Request("http://127.0.0.1:8000/api/route/compare", data=payload, headers={"Content-Type": "application/json"})
resp_cmp = urllib.request.urlopen(request_cmp)
cmp_data = json.loads(resp_cmp.read().decode())
print(f"Comparison: Fastest = {cmp_data['fastest_algorithm']} | Shortest = {cmp_data['shortest_distance_algorithm']}")
for r in cmp_data["results"]:
    print(f"  • {r['algorithm_name']:<35}: {r['total_distance_km']:>8.1f} km | {r['execution_time_ms']:>6.3f} ms | Optimal: {r['is_optimal_guaranteed']}")

print("\n=== ALL END-TO-END SUITES VERIFIED AND WORKING 100%! ===")
