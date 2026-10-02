import time
from typing import List, Tuple, Dict, Any

def solve_nearest_neighbor(
    dist_matrix: List[List[float]],
    start_index: int = 0,
    round_trip: bool = True
) -> Dict[str, Any]:
    """
    Nearest Neighbor (Greedy) Algorithm for Traveling Salesperson Problem (TSP).
    - Time Complexity: O(N^2)
    - Space Complexity: O(N)
    - Guarantee: Fast heuristic; does NOT guarantee global optimality because an
      early locally-short choice can force much longer edges later in the tour.
    """
    n = len(dist_matrix)
    if n == 0:
        return {
            "tour": [],
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "operations_count": 0,
            "steps": []
        }
    if n == 1:
        tour = [0, 0] if round_trip else [0]
        return {
            "tour": tour,
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "operations_count": 1,
            "steps": []
        }

    start_perf = time.perf_counter()
    
    # Track each city so a selected city is never visited twice.
    visited = [False] * n
    start_node = min(max(0, start_index), n - 1)
    visited[start_node] = True
    # Build the route greedily, choosing the closest unvisited city at each step.
    tour = [start_node]
    current = start_node
    total_dist = 0.0
    steps = []
    ops = 0

    for step_num in range(1, n):
        nearest_node = None
        min_dist = float("inf")
        
        # A locally nearest city can leave expensive remaining legs, so this
        # greedy choice is fast but is not guaranteed to produce the best tour.
        for next_node in range(n):
            ops += 1
            if not visited[next_node]:
                d = dist_matrix[current][next_node]
                if d < min_dist:
                    # Keep the cheapest next choice found for this step.
                    min_dist = d
                    nearest_node = next_node
        
        if nearest_node is not None:
            # Mark the chosen city, add it to the route, and record this road leg.
            visited[nearest_node] = True
            tour.append(nearest_node)
            total_dist += min_dist
            steps.append({
                "from": current,
                "to": nearest_node,
                "step_distance": round(min_dist, 2),
                "cumulative_distance": round(total_dist, 2),
                "step_index": step_num
            })
            current = nearest_node

    # If round trip, return to start
    if round_trip:
        return_dist = dist_matrix[current][start_node]
        total_dist += return_dist
        tour.append(start_node)
        steps.append({
            "from": current,
            "to": start_node,
            "step_distance": round(return_dist, 2),
            "cumulative_distance": round(total_dist, 2),
            "step_index": n
        })

    elapsed_ms = (time.perf_counter() - start_perf) * 1000.0

    return {
        "tour": tour,
        "distance": round(total_dist, 3),
        "execution_time_ms": round(elapsed_ms, 4),
        "operations_count": ops,
        "steps": steps,
        "complexity_time": "O(N²)",
        "complexity_space": "O(N)",
        "is_optimal": False
    }
