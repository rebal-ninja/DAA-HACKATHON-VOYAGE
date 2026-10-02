# VoyageAI DAA Algorithms

## Problem and application approach

The Traveling Salesperson Problem (TSP) asks for an ordering of cities with minimum total travel distance, visiting each city once. VoyageAI supports both a round trip (including the return edge to the start) and an open route. Each solver receives a pairwise distance matrix, starting city index, and round-trip setting.

The FastAPI service obtains road distance and duration matrices from OSRM when available. Its fallback estimates distances from coordinates with the Haversine formula and a road-circuity factor. The selected DAA algorithm optimizes the supplied distance matrix; Leaflet displays the resulting route separately.

The standalone entry point at `src/solution.py` imports the production solver implementations in `backend/algorithms/` and exercises them on the sample in `backend/test_backend.py`.

## Nearest Neighbor (Greedy)

The implementation starts at the requested city, repeatedly scans for the closest unvisited city, marks it visited, and appends it to the tour. In round-trip mode it then adds the edge back to the start. Each step's scan considers up to `N` cities, and there are up to `N` steps.

The greedy choice only optimizes the next edge. An early choice can leave expensive remaining edges, so the result is not guaranteed to be globally optimal.

- **Time complexity:** `O(N²)`
- **Space complexity:** `O(N)` for visited tracking, route, and step records

## Held–Karp (Dynamic Programming with Bitmasks)

The implementation remaps the requested start city to index zero. A bitmask represents which cities have been visited. Each state `(mask, last)` stores the shortest path that starts at zero, visits exactly the cities in `mask`, and ends at `last`; it also records a parent city for reconstruction.

Base states are direct paths from the start to each other city. For a larger subset, each possible previous endpoint is tried and the least-cost transition to `last` is stored. The best complete state is selected, including the closing edge only for a round trip. Following stored parents reconstructs the route, after which indices are mapped back to the original city order.

Every subset and endpoint is considered, so the chosen route is optimal for the supplied matrix (within the implementation's size limit).

- **Time complexity:** `O(N² · 2^N)`
- **Space complexity:** `O(N · 2^N)` for the stored states and parents
- **Implementation limit:** `N ≤ 17`

## Brute Force

The implementation fixes the requested start and lazily generates permutations of the remaining cities. It sums each candidate's legs and adds the return edge for round trips. If a partial sum is already no better than the shortest complete tour found, it stops evaluating that candidate. The shortest complete route is retained.

Every permutation is considered unless pruned by that bound, so it finds an optimal route for the supplied matrix.

- **Time complexity:** `O(N!)` worst case — `(N-1)!` candidate orders, each with up to `O(N)` distance calculations. Pruning can reduce work on some inputs but does not change the worst-case bound.
- **Space complexity:** `O(N)` for the current candidate and best route; permutations are generated lazily
- **Implementation limit:** `N ≤ 10`

## Existing sample test

`backend/test_backend.py` and `src/solution.py` use the same four-city round-trip matrix (Berlin, Prague, Vienna, Munich). The test runs all three algorithms and the comparison routine, then asserts that Held–Karp and Brute Force return the same distance. See [../test/test_cases.txt](../test/test_cases.txt).
