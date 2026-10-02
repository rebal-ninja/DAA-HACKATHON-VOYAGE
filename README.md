# VoyageAI — DAA Hackathon Project

VoyageAI is a full-stack route-planning application that explores the Traveling Salesperson Problem (TSP) using three Design and Analysis of Algorithms approaches. The web app combines a React/Vite frontend, a FastAPI/Python backend, OSRM road routing with a Haversine fallback, an interactive Leaflet map, and algorithm comparison tools.

## Project structure

```text
DAA-Hackathon-Team/
├── README.md
├── frontend/                 # React, TypeScript, Vite, Tailwind, Leaflet
├── backend/                  # FastAPI APIs, algorithms, and services
├── src/solution.py           # Standalone entry point using backend solvers
├── test/test_cases.txt       # Existing algorithm test case
├── docs/algorithm.md         # Algorithm and complexity notes
├── presentation/presentation.pptx
├── start.bat                 # Launches the backend and frontend on Windows
└── verify_e2e.py             # API checks; run while the backend is running
```

The frontend and backend are kept intact. The standalone solver imports the same implementations in `backend/algorithms/`, so algorithm logic is not duplicated.

## Problem and algorithms

Given a set of cities and pairwise distances, TSP asks for a route visiting each city once, optionally returning to the start. VoyageAI provides:

| Algorithm | Approach | Time | Space | Exact |
| --- | --- | --- | --- | --- |
| Nearest Neighbor | Greedy nearest unvisited city | `O(N²)` | `O(N)` | No |
| Held–Karp | Dynamic programming with bitmask states | `O(N² · 2^N)` | `O(N · 2^N)` | Yes |
| Brute Force | Enumerate city permutations | `O(N!)` | `O(N)` | Yes |

Held–Karp is limited to 17 cities and Brute Force to 10 to avoid excessive resource use. See [docs/algorithm.md](docs/algorithm.md) for details.

## Prerequisites

- Python 3.10 or later
- Node.js and npm

## Run the full application

Install and start the backend from the project folder:

```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

In a second terminal, install and start the frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`. The backend API documentation is at `http://127.0.0.1:8000/docs`. On Windows, `start.bat` launches both services in separate command windows after dependencies are installed.

## Run the standalone DAA solver

From the project folder:

```powershell
python src\solution.py
```

This runs the existing three algorithms on the four-city sample used by the backend test and checks that Held–Karp and Brute Force agree on the optimal distance.

## Existing API verification

With the backend running, execute the existing end-to-end checks from the project folder:

```powershell
python verify_e2e.py
```

The checks exercise the health endpoint, city search, route optimization, and algorithm comparison.

## Further information

- [test/test_cases.txt](test/test_cases.txt) — the existing four-city algorithm test matrix and checks
- [docs/algorithm.md](docs/algorithm.md) — implementation approach and complexity
- [presentation/presentation.pptx](presentation/presentation.pptx) — VoyageAI DAA hackathon presentation
