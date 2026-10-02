import math
import httpx
from typing import List, Tuple, Dict, Any, Optional

EARTH_RADIUS_KM = 6371.0088
ROAD_CIRCUITY_FACTOR = 1.25  # Roads are typically ~25% longer than great-circle distance
AVERAGE_ROAD_SPEED_KMPH = 80.0 # Heuristic speed for duration estimation

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate great-circle distance in kilometers from two coordinates."""
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_KM * c

def compute_haversine_matrix(coords: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]]]:
    """
    Computes pairwise distance (km) and estimated duration (seconds) matrices
    using the Haversine formula with a circuity factor.
    coords is list of (lat, lng).
    This fills two N x N matrices, so it takes O(N^2) time and O(N^2) space.
    """
    n = len(coords)
    dist_matrix = [[0.0] * n for _ in range(n)]
    dur_matrix = [[0.0] * n for _ in range(n)]

    for i in range(n):
        for j in range(n):
            if i == j:
                dist_matrix[i][j] = 0.0
                dur_matrix[i][j] = 0.0
            else:
                # Estimate road distance by applying an average circuity multiplier
                # to straight-line distance; convert that estimate to seconds at
                # the configured average road speed.
                straight = haversine_distance(coords[i][0], coords[i][1], coords[j][0], coords[j][1])
                road_dist = straight * ROAD_CIRCUITY_FACTOR
                dist_matrix[i][j] = round(road_dist, 3)
                # Duration in seconds: (dist / speed) * 3600
                duration_sec = (road_dist / AVERAGE_ROAD_SPEED_KMPH) * 3600.0
                dur_matrix[i][j] = round(duration_sec, 1)

    return dist_matrix, dur_matrix

async def fetch_osrm_matrix(coords: List[Tuple[float, float]]) -> Tuple[List[List[float]], List[List[float]], str]:
    """
    Attempts to fetch real road network distance and duration matrices from OSRM public server.
    coords is list of (lat, lng).
    Returns (distances_km, durations_sec, source_flag).
    """
    n = len(coords)
    if n <= 1:
        return [[0.0]], [[0.0]], "LOCAL"

    # OSRM expects coordinates in '{lng},{lat}' format
    coord_str = ";".join([f"{lon},{lat}" for lat, lon in coords])
    url = f"https://router.project-osrm.org/table/v1/driving/{coord_str}?annotations=distance,duration"

    try:
        async with httpx.AsyncClient(timeout=4.5) as client:
            resp = await client.get(url, headers={"User-Agent": "VoyageAI-Hackathon-App/1.0"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and "distances" in data:
                    raw_distances = data["distances"]
                    raw_durations = data.get("durations", [])

                    dist_matrix = [[0.0] * n for _ in range(n)]
                    dur_matrix = [[0.0] * n for _ in range(n)]

                    # OSRM provides road distances in meters and durations in seconds.
                    for i in range(n):
                        for j in range(n):
                            if raw_distances[i][j] is not None:
                                dist_matrix[i][j] = round(raw_distances[i][j] / 1000.0, 3) # m to km
                            else:
                                dist_matrix[i][j] = round(haversine_distance(coords[i][0], coords[i][1], coords[j][0], coords[j][1]) * ROAD_CIRCUITY_FACTOR, 3)

                            if raw_durations and i < len(raw_durations) and j < len(raw_durations[i]) and raw_durations[i][j] is not None:
                                dur_matrix[i][j] = round(raw_durations[i][j], 1)
                            else:
                                dur_matrix[i][j] = round((dist_matrix[i][j] / AVERAGE_ROAD_SPEED_KMPH) * 3600.0, 1)

                    return dist_matrix, dur_matrix, "OSRM_ROAD"
    except Exception:
        # Fall through to Haversine fallback
        pass

    # Seamless fallback
    dist_matrix, dur_matrix = compute_haversine_matrix(coords)
    return dist_matrix, dur_matrix, "HAVERSINE_FALLBACK"

def generate_interpolated_arc(lat1: float, lon1: float, lat2: float, lon2: float, num_points: int = 15) -> List[List[float]]:
    """Generates smooth great-circle interpolation points between two coordinates."""
    points = []
    for step in range(num_points + 1):
        fraction = step / float(num_points)
        lat = lat1 + fraction * (lat2 - lat1)
        lon = lon1 + fraction * (lon2 - lon1)
        points.append([round(lat, 5), round(lon, 5)])
    return points

async def fetch_route_geometry(
    ordered_coords: List[Tuple[float, float]]
) -> Tuple[List[List[float]], List[Dict[str, Any]], str]:
    """
    Fetches the precise road geometry for an ordered list of (lat, lng) stops.
    Returns (merged_lat_lng_polyline, leg_details, source).
    """
    if len(ordered_coords) <= 1:
        return ordered_coords, [], "LOCAL"

    # Try OSRM route API
    coord_str = ";".join([f"{lon},{lat}" for lat, lon in ordered_coords])
    url = f"https://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson&steps=false"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url, headers={"User-Agent": "VoyageAI-Hackathon-App/1.0"})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("code") == "Ok" and data.get("routes"):
                    primary_route = data["routes"][0]
                    # GeoJSON is [lng, lat]; Leaflet expects [lat, lng]
                    raw_coords = primary_route["geometry"]["coordinates"]
                    leaflet_polyline = [[c[1], c[0]] for c in raw_coords]

                    legs = []
                    for idx, leg_data in enumerate(primary_route.get("legs", [])):
                        leg_dist_km = round(leg_data.get("distance", 0.0) / 1000.0, 2)
                        leg_dur_min = round(leg_data.get("duration", 0.0) / 60.0, 1)
                        legs.append({
                            "leg_index": idx,
                            "distance_km": leg_dist_km,
                            "duration_minutes": leg_dur_min,
                        })

                    return leaflet_polyline, legs, "OSRM_ROAD"
    except Exception:
        pass

    # If OSRM is unavailable, draw straight-line arcs and estimate distance with
    # the same road-circuity factor and duration with the configured average speed.
    # For P interpolation points per leg, this fallback takes O(N*P) time and
    # space; OSRM request time is external and network-dependent.
    # Fallback to geodesic arcs
    leaflet_polyline = []
    legs = []
    for i in range(len(ordered_coords) - 1):
        c1 = ordered_coords[i]
        c2 = ordered_coords[i + 1]
        arc = generate_interpolated_arc(c1[0], c1[1], c2[0], c2[1])
        if i > 0 and arc:
            leaflet_polyline.extend(arc[1:])
        else:
            leaflet_polyline.extend(arc)

        leg_dist = haversine_distance(c1[0], c1[1], c2[0], c2[1]) * ROAD_CIRCUITY_FACTOR
        leg_dur_min = (leg_dist / AVERAGE_ROAD_SPEED_KMPH) * 60.0
        legs.append({
            "leg_index": i,
            "distance_km": round(leg_dist, 2),
            "duration_minutes": round(leg_dur_min, 1)
        })

    return leaflet_polyline, legs, "HAVERSINE_FALLBACK"
