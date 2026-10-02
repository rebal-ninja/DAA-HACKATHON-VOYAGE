from typing import List, Dict, Any
from .nearest_neighbor import solve_nearest_neighbor
from .held_karp import solve_held_karp
from .brute_force import solve_brute_force

def compare_all_algorithms(
    dist_matrix: List[List[float]],
    start_index: int = 0,
    round_trip: bool = True
) -> Dict[str, Any]:
    """
    Runs available algorithms on the same distance matrix and compiles a comparative benchmark.
    """
    n = len(dist_matrix)
    results = []

    # 1. Nearest Neighbor (Always run, safe for large N)
    nn_res = solve_nearest_neighbor(dist_matrix, start_index=start_index, round_trip=round_trip)
    nn_res["algorithm_id"] = "nearest_neighbor"
    nn_res["algorithm_name"] = "Nearest Neighbor (Greedy)"
    results.append(nn_res)

    # 2. Held-Karp DP (Run if N <= 17)
    if n <= 17:
        try:
            hk_res = solve_held_karp(dist_matrix, start_index=start_index, round_trip=round_trip)
            hk_res["algorithm_id"] = "held_karp"
            hk_res["algorithm_name"] = "Held-Karp (Dynamic Programming)"
            results.append(hk_res)
        except Exception as e:
            results.append({
                "algorithm_id": "held_karp",
                "algorithm_name": "Held-Karp (Dynamic Programming)",
                "error": str(e),
                "tour": [],
                "distance": 0.0,
                "execution_time_ms": 0.0,
                "complexity_time": "O(N² · 2ᴺ)",
                "complexity_space": "O(N · 2ᴺ)",
                "is_optimal": True
            })
    else:
        results.append({
            "algorithm_id": "held_karp",
            "algorithm_name": "Held-Karp (Dynamic Programming)",
            "skipped": True,
            "skip_reason": f"Input size N={n} exceeds Held-Karp limit (N <= 17).",
            "tour": [],
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "complexity_time": "O(N² · 2ᴺ)",
            "complexity_space": "O(N · 2ᴺ)",
            "is_optimal": True
        })

    # 3. Brute Force (Run if N <= 10)
    if n <= 10:
        try:
            bf_res = solve_brute_force(dist_matrix, start_index=start_index, round_trip=round_trip)
            bf_res["algorithm_id"] = "brute_force"
            bf_res["algorithm_name"] = "Brute Force Search"
            results.append(bf_res)
        except Exception as e:
            results.append({
                "algorithm_id": "brute_force",
                "algorithm_name": "Brute Force Search",
                "error": str(e),
                "tour": [],
                "distance": 0.0,
                "execution_time_ms": 0.0,
                "complexity_time": "O(N!)",
                "complexity_space": "O(N)",
                "is_optimal": True
            })
    else:
        results.append({
            "algorithm_id": "brute_force",
            "algorithm_name": "Brute Force Search",
            "skipped": True,
            "skip_reason": f"Input size N={n} exceeds Brute Force factorial limit (N <= 10).",
            "tour": [],
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "complexity_time": "O(N!)",
            "complexity_space": "O(N)",
            "is_optimal": True
        })

    # Calculate comparative statistics
    valid_results = [r for r in results if not r.get("skipped") and not r.get("error")]
    
    fastest = min(valid_results, key=lambda x: x["execution_time_ms"]) if valid_results else None
    shortest = min(valid_results, key=lambda x: x["distance"]) if valid_results else None

    # Distance savings
    saving_pct = 0.0
    if len(valid_results) >= 2 and shortest and nn_res:
        if nn_res["distance"] > 0:
            saving_pct = round(((nn_res["distance"] - shortest["distance"]) / nn_res["distance"]) * 100.0, 2)

    return {
        "results": results,
        "fastest_algorithm": fastest["algorithm_name"] if fastest else "N/A",
        "shortest_distance_algorithm": shortest["algorithm_name"] if shortest else "N/A",
        "distance_saving_pct": max(0.0, saving_pct),
        "node_count": n
    }
