"""Standalone entry point for the existing VoyageAI TSP implementations."""

import sys
from pathlib import Path

# Load the production algorithms directly, avoiding a second implementation.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from algorithms.brute_force import solve_brute_force
from algorithms.comparison import compare_all_algorithms
from algorithms.held_karp import solve_held_karp
from algorithms.nearest_neighbor import solve_nearest_neighbor


def main() -> None:
    # Four-city test matrix from backend/test_backend.py:
    # Berlin, Prague, Vienna, and Munich.
    dist_matrix = [
        [0.0, 280.0, 524.0, 504.0],
        [280.0, 0.0, 252.0, 382.0],
        [524.0, 252.0, 0.0, 355.0],
        [504.0, 382.0, 355.0, 0.0],
    ]

    nearest_neighbor = solve_nearest_neighbor(
        dist_matrix, start_index=0, round_trip=True
    )
    held_karp = solve_held_karp(dist_matrix, start_index=0, round_trip=True)
    brute_force = solve_brute_force(dist_matrix, start_index=0, round_trip=True)
    comparison = compare_all_algorithms(
        dist_matrix, start_index=0, round_trip=True
    )

    for name, result in (
        ("Nearest Neighbor", nearest_neighbor),
        ("Held-Karp", held_karp),
        ("Brute Force", brute_force),
    ):
        print(
            f"{name}: distance={result['distance']} km, "
            f"tour={result['tour']}, "
            f"time={result['execution_time_ms']} ms"
        )

    print(
        "Comparison: "
        f"fastest={comparison['fastest_algorithm']}, "
        f"shortest={comparison['shortest_distance_algorithm']}, "
        f"savings={comparison['distance_saving_pct']}%"
    )
    assert held_karp["distance"] == brute_force["distance"], (
        "Held-Karp and Brute Force must agree on the optimal distance."
    )
    print("Existing sample checks passed.")


if __name__ == "__main__":
    main()
