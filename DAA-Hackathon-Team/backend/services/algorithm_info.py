from typing import Dict, Any

ALGORITHMS_INFO: Dict[str, Any] = {
    "nearest_neighbor": {
        "id": "nearest_neighbor",
        "name": "Nearest Neighbor",
        "paradigm": "Greedy Heuristic",
        "time_complexity": "O(N²)",
        "space_complexity": "O(N)",
        "optimality_guaranteed": False,
        "max_recommended_nodes": 1000,
        "description": "Constructs a tour by starting at an origin node and greedily appending the nearest unvisited node until all cities are traversed. Very fast for real-time applications but vulnerable to suboptimal decisions in the final legs.",
        "pros": [
            "Extremely fast execution with quadratic polynomial time O(N²)",
            "Negligible memory footprint O(N)",
            "Scales smoothly to hundreds or thousands of waypoints",
            "Easy to implement and parallelize"
        ],
        "cons": [
            "Does not guarantee global optimality",
            "Frequently leaves a very long 'closing leg' as options diminish",
            "Worst-case approximation ratio can be bounded by O(log N)"
        ],
        "pseudocode": """algorithm NearestNeighbor(DistanceMatrix dist, StartNode start):
    n = size(dist)
    visited = array of boolean with size n, all False
    tour = [start]
    visited[start] = True
    current = start
    
    for step from 1 to n - 1:
        nearest = null
        min_dist = infinity
        for candidate from 0 to n - 1:
            if not visited[candidate] and dist[current][candidate] < min_dist:
                min_dist = dist[current][candidate]
                nearest = candidate
        visited[nearest] = True
        tour.append(nearest)
        current = nearest
        
    tour.append(start) // close loop for round trip
    return tour""",
        "daa_deep_dive": "Nearest Neighbor exemplifies the Greedy Choice Property: making locally optimal choices at each decision vertex in hopes of reaching a global optimum. Because TSP lacks the matroid property required for greedy optimality, this heuristic can be 'fooled' by clusters of nearby nodes separated by large expanses."
    },
    "held_karp": {
        "id": "held_karp",
        "name": "Held-Karp Dynamic Programming",
        "paradigm": "Dynamic Programming with Bitmasking",
        "time_complexity": "O(N² · 2ᴺ)",
        "space_complexity": "O(N · 2ᴺ)",
        "optimality_guaranteed": True,
        "max_recommended_nodes": 17,
        "description": "Formulated by Michael Held and Richard M. Karp in 1962. Breaks the TSP down into subproblems defined by a visited subset of vertices (represented as an integer bitmask) and the last visited vertex, storing intermediate results to eliminate redundant permutations.",
        "pros": [
            "Guarantees the provably optimal shortest Hamiltonian tour",
            "Massive speedup over Brute Force: reduces (N-1)! to N² · 2ᴺ",
            "Standard benchmark for evaluating TSP approximation algorithms"
        ],
        "cons": [
            "Exponential time and space complexity",
            "State table rapidly expands beyond N > 17 (e.g. 18 nodes requires ~4.7 million states)",
            "Memory-bound on browser/embedded environments"
        ],
        "pseudocode": """algorithm HeldKarpDP(DistanceMatrix dist):
    n = size(dist)
    // C(mask, j) stores min cost starting at 0, visiting subset 'mask', ending at j
    memo = hash_map()
    
    // Base cases: direct paths from start node 0
    for j from 1 to n - 1:
        memo[(1 | (1 << j), j)] = dist[0][j]
        
    // Subsets of increasing size s from 3 to n
    for s from 3 to n:
        for each subset S containing 0 with size s:
            mask = bitmask(S)
            for j in S where j != 0:
                prev_mask = mask ^ (1 << j)
                memo[(mask, j)] = min over k in S (k != 0, k != j) of:
                    memo[(prev_mask, k)] + dist[k][j]
                    
    // Closing cycle back to starting city
    full_mask = (1 << n) - 1
    optimal_cost = min over j from 1 to n - 1 of:
        memo[(full_mask, j)] + dist[j][0]
    return backtrack_tour(memo, full_mask)""",
        "daa_deep_dive": "Held-Karp demonstrates both Optimal Substructure and Overlapping Subproblems. The subproblem C(S, j) denotes the minimum weight path from start node 0 to node j traversing all vertices in subset S. By memoizing the 2ᴺ subsets rather than exploring all N! orderings, Held-Karp transforms factorial growth into exponential growth."
    },
    "brute_force": {
        "id": "brute_force",
        "name": "Brute Force Search",
        "paradigm": "Exhaustive Permutation Search",
        "time_complexity": "O(N!)",
        "space_complexity": "O(N)",
        "optimality_guaranteed": True,
        "max_recommended_nodes": 10,
        "description": "Systematically tests every possible permutation of destination sequences, calculating the total distance for each and retaining the absolute minimum. Provides the gold standard baseline for verification on tiny graphs.",
        "pros": [
            "Trivially provable correctness and absolute global optimum",
            "Minimal memory overhead O(N) since only the current best tour is stored",
            "Ideal educational baseline to demonstrate combinatorial explosion"
        ],
        "cons": [
            "Factorial runtime explosion O(N!)",
            "Unviable beyond N = 10 (10! = 3.6 million tours; 15! = 1.3 trillion tours; 20! = 2.4 quintillion tours)"
        ],
        "pseudocode": """algorithm BruteForceTSP(DistanceMatrix dist, StartNode start):
    n = size(dist)
    other_nodes = [0..n-1 except start]
    best_tour = null
    min_dist = infinity
    
    for perm in permutations(other_nodes):
        current_tour = [start] + perm + [start]
        current_dist = calculate_tour_distance(current_tour, dist)
        
        if current_dist < min_dist:
            min_dist = current_dist
            best_tour = current_tour
            
    return best_tour, min_dist""",
        "daa_deep_dive": "Exhaustive permutation search demonstrates the raw combinatorial nature of NP-Hard problems. Because a symmetric TSP graph with N vertices has (N-1)! / 2 unique directed cycles, factorial time complexity means adding a single city multiplies the total computation by the next integer."
    }
}

TOY_DEMO_GRAPH = {
    "nodes": [
        {"id": 0, "name": "Berlin", "x": 180, "y": 80},
        {"id": 1, "name": "Prague", "x": 260, "y": 190},
        {"id": 2, "name": "Vienna", "x": 240, "y": 300},
        {"id": 3, "name": "Munich", "x": 80, "y": 250},
    ],
    "matrix": [
        [0, 280, 524, 504],
        [280, 0, 252, 382],
        [524, 252, 0, 355],
        [504, 382, 355, 0]
    ],
    "nn_trace": [
        {"step": 1, "from": 0, "to": 1, "dist": 280, "action": "From Berlin, Prague (280km) is nearest"},
        {"step": 2, "from": 1, "to": 2, "dist": 252, "action": "From Prague, Vienna (252km) is nearest unvisited"},
        {"step": 3, "from": 2, "to": 3, "dist": 355, "action": "From Vienna, only Munich (355km) remains"},
        {"step": 4, "from": 3, "to": 0, "dist": 504, "action": "Return leg from Munich back to Berlin (504km)"}
    ]
}
