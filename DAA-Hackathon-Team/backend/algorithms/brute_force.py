import itertools
import time
from typing import List, Dict, Any

def solve_brute_force(
    dist_matrix: List[List[float]],
    start_index: int = 0,
    round_trip: bool = True
) -> Dict[str, Any]:
    """
    Brute Force Search Algorithm for TSP.
    - Time Complexity: O(N!): there are (N-1)! tours and each may take O(N)
      distance work; this is O(N!) overall. Pruning helps typical cases only.
    - Space Complexity: O(N): permutations are generated lazily and only the
      current candidate and best route are retained.
    - Guarantee: Exhaustive search; guarantees finding the absolute global minimum.
    - Guard limit: N <= 10. (10 nodes = 9! = 362,880 tours; 11 nodes = 10! = 3.6M tours).
    """
    n = len(dist_matrix)
    if n == 0:
        return {
            "tour": [],
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "permutations_evaluated": 0,
            "complexity_time": "O(N!)",
            "complexity_space": "O(N)",
            "is_optimal": True
        }
    if n == 1:
        tour = [0, 0] if round_trip else [0]
        return {
            "tour": tour,
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "permutations_evaluated": 1,
            "complexity_time": "O(N!)",
            "complexity_space": "O(N)",
            "is_optimal": True
        }

    if n > 10:
        raise ValueError(
            f"Brute Force input size N={n} exceeds the safe threshold (N <= 10). "
            f"Evaluating (N-1)! = {math_factorial(n-1):,} permutations would take too long. "
            f"Please use Held-Karp DP (O(N²·2ᴺ)) or Nearest Neighbor (O(N²)) instead."
        )

    start_perf = time.perf_counter()
    start_node = min(max(0, start_index), n - 1)
    other_nodes = [i for i in range(n) if i != start_node]

    best_tour = None
    best_dist = float("inf")
    perms_count = 0

    # Fix the start city and lazily generate every ordering of the remaining
    # cities, so each candidate is a distinct possible tour.
    for perm in itertools.permutations(other_nodes):
        perms_count += 1
        current_dist = 0.0
        prev_node = start_node
        
        # Sum each leg in the candidate tour; stop once it cannot beat the best.
        for node in perm:
            current_dist += dist_matrix[prev_node][node]
            prev_node = node
            if current_dist >= best_dist:
                # Slight branch-and-bound pruning optimization
                break
        else:
            if round_trip:
                current_dist += dist_matrix[prev_node][start_node]

            # Keep the shortest complete tour seen so far.
            if current_dist < best_dist:
                best_dist = current_dist
                if round_trip:
                    best_tour = [start_node] + list(perm) + [start_node]
                else:
                    best_tour = [start_node] + list(perm)

    elapsed_ms = (time.perf_counter() - start_perf) * 1000.0

    return {
        "tour": best_tour if best_tour is not None else [start_node],
        "distance": round(best_dist, 3),
        "execution_time_ms": round(elapsed_ms, 4),
        "permutations_evaluated": perms_count,
        "complexity_time": "O(N!)",
        "complexity_space": "O(N)",
        "is_optimal": True
    }

def math_factorial(x: int) -> int:
    ans = 1
    for i in range(1, x + 1):
        ans *= i
    return ans
