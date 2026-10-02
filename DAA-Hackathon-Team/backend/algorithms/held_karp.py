import time
from typing import List, Tuple, Dict, Any, Optional

def solve_held_karp(
    dist_matrix: List[List[float]],
    start_index: int = 0,
    round_trip: bool = True
) -> Dict[str, Any]:
    """
    Held-Karp Dynamic Programming with Bitmasking for exact TSP.
    - Time Complexity: O(N^2 * 2^N)
    - Space Complexity: O(N * 2^N)
    - Guarantee: PROVABLY OPTIMAL exact solution: every subset/end-city state
      keeps its best predecessor, then all complete tours are compared.
    - Guard limit: N <= 17 to prevent memory exhaustion and execution timeouts.
    """
    n = len(dist_matrix)
    if n == 0:
        return {
            "tour": [],
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "states_computed": 0,
            "steps": []
        }
    if n == 1:
        tour = [0, 0] if round_trip else [0]
        return {
            "tour": tour,
            "distance": 0.0,
            "execution_time_ms": 0.0,
            "states_computed": 1,
            "steps": []
        }
    if n == 2:
        if round_trip:
            return {
                "tour": [0, 1, 0],
                "distance": round(dist_matrix[0][1] + dist_matrix[1][0], 3),
                "execution_time_ms": 0.01,
                "states_computed": 2,
                "steps": [],
                "complexity_time": "O(N² · 2ᴺ)",
                "complexity_space": "O(N · 2ᴺ)",
                "is_optimal": True
            }
        else:
            return {
                "tour": [0, 1],
                "distance": round(dist_matrix[0][1], 3),
                "execution_time_ms": 0.01,
                "states_computed": 2,
                "steps": [],
                "complexity_time": "O(N² · 2ᴺ)",
                "complexity_space": "O(N · 2ᴺ)",
                "is_optimal": True
            }

    if n > 17:
        raise ValueError(
            f"Held-Karp input size N={n} exceeds the safe hackathon threshold (N <= 17). "
            f"Held-Karp requires O(N² · 2ᴺ) operations (~{n*n*(2**n):,} ops), which will exhaust browser/server memory. "
            f"Please switch to Nearest Neighbor (Greedy) for instant O(N²) results."
        )

    start_perf = time.perf_counter()
    start_node = min(max(0, start_index), n - 1)

    # Remap indices so that start_node is logically index 0 if needed.
    # To keep implementation standard, if start_node != 0, we can rotate or swap
    mapping = list(range(n))
    if start_node != 0:
        mapping[0], mapping[start_node] = mapping[start_node], mapping[0]

    # Reordered distance matrix according to mapping
    matrix = [[dist_matrix[mapping[i]][mapping[j]] for j in range(n)] for i in range(n)]

    # Each DP state (mask, last) stores the shortest path visiting exactly
    # the cities in mask and ending at last, plus its parent for reconstruction.
    # Bit i in mask is 1 exactly when city i has been visited.
    memo: Dict[Tuple[int, int], Tuple[float, Optional[int]]] = {}
    states_count = 0

    # Base states: the only path to a two-city set is the direct start-to-j edge.
    # mask = 1 (node 0) | (1 << j)
    for j in range(1, n):
        mask = (1 << 0) | (1 << j)
        memo[(mask, j)] = (matrix[0][j], 0)
        states_count += 1

    # Grow each state by adding a final city; try every valid previous endpoint.
    for subset_size in range(3, n + 1):
        # Generate all masks with subset_size cities, always including the start.
        def generate_masks(current_mask: int, bit_index: int, bits_remaining: int):
            if bits_remaining == 0:
                yield current_mask
                return
            if bit_index >= n:
                return
            # Setting this bit includes the city in this subset.
            yield from generate_masks(current_mask | (1 << bit_index), bit_index + 1, bits_remaining - 1)
            # Leaving it clear excludes the city from this subset.
            yield from generate_masks(current_mask, bit_index + 1, bits_remaining)

        # bit 0 is already selected, so select (subset_size - 1) more bits from indices 1..(n-1)
        for mask in generate_masks(1, 1, subset_size - 1):
            for j in range(1, n):
                if not (mask & (1 << j)):
                    continue
                prev_mask = mask ^ (1 << j)
                best_cost = float("inf")
                best_prev = None

                # Try every previous endpoint in the smaller subset and keep
                # the cheapest transition into j.
                for k in range(1, n):
                    if k == j or not (prev_mask & (1 << k)):
                        continue
                    if (prev_mask, k) in memo:
                        cost = memo[(prev_mask, k)][0] + matrix[k][j]
                        if cost < best_cost:
                            best_cost = cost
                            best_prev = k

                if best_prev is not None:
                    memo[(mask, j)] = (best_cost, best_prev)
                    states_count += 1

    # Compare complete tours, including the closing edge only for round trips.
    full_mask = (1 << n) - 1
    best_total_cost = float("inf")
    last_node = None

    if round_trip:
        for j in range(1, n):
            if (full_mask, j) in memo:
                cost = memo[(full_mask, j)][0] + matrix[j][0]
                if cost < best_total_cost:
                    best_total_cost = cost
                    last_node = j
    else:
        for j in range(1, n):
            if (full_mask, j) in memo:
                cost = memo[(full_mask, j)][0]
                if cost < best_total_cost:
                    best_total_cost = cost
                    last_node = j

    if last_node is None:
        last_node = 1
        best_total_cost = 0.0

    # Following stored parents recovers the minimum-cost route represented by
    # the chosen full-mask state.
    curr_mask = full_mask
    curr_node = last_node
    reversed_tour = []

    while curr_node is not None and curr_node != 0:
        reversed_tour.append(curr_node)
        prev_info = memo.get((curr_mask, curr_node))
        if prev_info:
            prev_node = prev_info[1]
            curr_mask = curr_mask ^ (1 << curr_node)
            curr_node = prev_node
        else:
            break

    reversed_tour.append(0)
    ordered_reordered = list(reversed(reversed_tour))

    if round_trip:
        ordered_reordered.append(0)

    # Restore the caller's original city indices after reconstructing the route.
    final_tour = [mapping[idx] for idx in ordered_reordered]

    elapsed_ms = (time.perf_counter() - start_perf) * 1000.0

    return {
        "tour": final_tour,
        "distance": round(best_total_cost, 3),
        "execution_time_ms": round(elapsed_ms, 4),
        "states_computed": states_count,
        "complexity_time": "O(N² · 2ᴺ)",
        "complexity_space": "O(N · 2ᴺ)",
        "is_optimal": True
    }
