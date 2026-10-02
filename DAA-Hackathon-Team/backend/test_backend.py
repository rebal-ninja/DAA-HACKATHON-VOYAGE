import sys
import main
from algorithms.nearest_neighbor import solve_nearest_neighbor
from algorithms.held_karp import solve_held_karp
from algorithms.brute_force import solve_brute_force
from algorithms.comparison import compare_all_algorithms

print(f"Python version: {sys.version}")
print(f"FastAPI app: {main.app.title}")

# Test matrix with 4 cities: Berlin, Prague, Vienna, Munich
dist_matrix = [
    [0.0, 280.0, 524.0, 504.0],
    [280.0, 0.0, 252.0, 382.0],
    [524.0, 252.0, 0.0, 355.0],
    [504.0, 382.0, 355.0, 0.0]
]

nn = solve_nearest_neighbor(dist_matrix, start_index=0, round_trip=True)
print(f"Nearest Neighbor result: dist={nn['distance']}km, tour={nn['tour']}, time={nn['execution_time_ms']}ms")

hk = solve_held_karp(dist_matrix, start_index=0, round_trip=True)
print(f"Held-Karp result: dist={hk['distance']}km, tour={hk['tour']}, time={hk['execution_time_ms']}ms")

bf = solve_brute_force(dist_matrix, start_index=0, round_trip=True)
print(f"Brute Force result: dist={bf['distance']}km, tour={bf['tour']}, time={bf['execution_time_ms']}ms")

cmp_res = compare_all_algorithms(dist_matrix, start_index=0, round_trip=True)
print(f"Comparison: Fastest={cmp_res['fastest_algorithm']}, Shortest={cmp_res['shortest_distance_algorithm']}, Savings={cmp_res['distance_saving_pct']}%")

assert hk['distance'] == bf['distance'], f"Held-Karp ({hk['distance']}) and Brute Force ({bf['distance']}) must agree on optimal distance!"
print("ALL ALGORITHM TESTS PASSED PERFECTLY!")
