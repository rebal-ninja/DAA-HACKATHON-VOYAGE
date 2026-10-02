import httpx
from typing import List, Dict, Any

PRESET_CITIES: List[Dict[str, Any]] = [
    # Europe
    {"id": "paris", "name": "Paris", "country": "France", "state": "Île-de-France", "lat": 48.8566, "lng": 2.3522},
    {"id": "london", "name": "London", "country": "United Kingdom", "state": "England", "lat": 51.5074, "lng": -0.1278},
    {"id": "berlin", "name": "Berlin", "country": "Germany", "state": "Berlin", "lat": 52.5200, "lng": 13.4050},
    {"id": "amsterdam", "name": "Amsterdam", "country": "Netherlands", "state": "North Holland", "lat": 52.3676, "lng": 4.9041},
    {"id": "brussels", "name": "Brussels", "country": "Belgium", "state": "Brussels", "lat": 50.8503, "lng": 4.3517},
    {"id": "prague", "name": "Prague", "country": "Czech Republic", "state": "Prague", "lat": 50.0755, "lng": 14.4378},
    {"id": "vienna", "name": "Vienna", "country": "Austria", "state": "Vienna", "lat": 48.2082, "lng": 16.3738},
    {"id": "zurich", "name": "Zurich", "country": "Switzerland", "state": "Zurich", "lat": 47.3769, "lng": 8.5417},
    {"id": "rome", "name": "Rome", "country": "Italy", "state": "Lazio", "lat": 41.9028, "lng": 12.4964},
    {"id": "florence", "name": "Florence", "country": "Italy", "state": "Tuscany", "lat": 43.7696, "lng": 11.2558},
    {"id": "milan", "name": "Milan", "country": "Italy", "state": "Lombardy", "lat": 45.4642, "lng": 9.1900},
    {"id": "venice", "name": "Venice", "country": "Italy", "state": "Veneto", "lat": 45.4408, "lng": 12.3155},
    {"id": "barcelona", "name": "Barcelona", "country": "Spain", "state": "Catalonia", "lat": 41.3851, "lng": 2.1734},
    {"id": "madrid", "name": "Madrid", "country": "Spain", "state": "Madrid", "lat": 40.4168, "lng": -3.7038},
    {"id": "munich", "name": "Munich", "country": "Germany", "state": "Bavaria", "lat": 48.1351, "lng": 11.5820},
    {"id": "frankfurt", "name": "Frankfurt", "country": "Germany", "state": "Hesse", "lat": 50.1109, "lng": 8.6821},
    {"id": "copenhagen", "name": "Copenhagen", "country": "Denmark", "state": "Capital Region", "lat": 55.6761, "lng": 12.5683},
    {"id": "stockholm", "name": "Stockholm", "country": "Sweden", "state": "Stockholm", "lat": 59.3293, "lng": 18.0686},
    {"id": "budapest", "name": "Budapest", "country": "Hungary", "state": "Central Hungary", "lat": 47.4979, "lng": 19.0402},
    {"id": "warsaw", "name": "Warsaw", "country": "Poland", "state": "Masovian", "lat": 52.2297, "lng": 21.0122},

    # North America
    {"id": "nyc", "name": "New York", "country": "United States", "state": "NY", "lat": 40.7128, "lng": -74.0060},
    {"id": "boston", "name": "Boston", "country": "United States", "state": "MA", "lat": 42.3601, "lng": -71.0589},
    {"id": "philadelphia", "name": "Philadelphia", "country": "United States", "state": "PA", "lat": 39.9526, "lng": -75.1652},
    {"id": "dc", "name": "Washington DC", "country": "United States", "state": "DC", "lat": 38.9072, "lng": -77.0369},
    {"id": "chicago", "name": "Chicago", "country": "United States", "state": "IL", "lat": 41.8781, "lng": -87.6298},
    {"id": "seattle", "name": "Seattle", "country": "United States", "state": "WA", "lat": 47.6062, "lng": -122.3321},
    {"id": "portland", "name": "Portland", "country": "United States", "state": "OR", "lat": 45.5152, "lng": -122.6784},
    {"id": "sf", "name": "San Francisco", "country": "United States", "state": "CA", "lat": 37.7749, "lng": -122.4194},
    {"id": "la", "name": "Los Angeles", "country": "United States", "state": "CA", "lat": 34.0522, "lng": -118.2437},
    {"id": "sandiego", "name": "San Diego", "country": "United States", "state": "CA", "lat": 32.7157, "lng": -117.1611},
    {"id": "lasvegas", "name": "Las Vegas", "country": "United States", "state": "NV", "lat": 36.1699, "lng": -115.1398},
    {"id": "phoenix", "name": "Phoenix", "country": "United States", "state": "AZ", "lat": 33.4484, "lng": -112.0740},
    {"id": "denver", "name": "Denver", "country": "United States", "state": "CO", "lat": 39.7392, "lng": -104.9903},
    {"id": "austin", "name": "Austin", "country": "United States", "state": "TX", "lat": 30.2672, "lng": -97.7431},
    {"id": "toronto", "name": "Toronto", "country": "Canada", "state": "Ontario", "lat": 43.6532, "lng": -79.3832},
    {"id": "montreal", "name": "Montreal", "country": "Canada", "state": "Quebec", "lat": 45.5017, "lng": -73.5673},
    {"id": "vancouver", "name": "Vancouver", "country": "Canada", "state": "British Columbia", "lat": 49.2827, "lng": -123.1207},

    # Asia & India
    {"id": "delhi", "name": "New Delhi", "country": "India", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"id": "agra", "name": "Agra", "country": "India", "state": "Uttar Pradesh", "lat": 27.1767, "lng": 78.0081},
    {"id": "jaipur", "name": "Jaipur", "country": "India", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    {"id": "udaipur", "name": "Udaipur", "country": "India", "state": "Rajasthan", "lat": 24.5854, "lng": 73.7125},
    {"id": "mumbai", "name": "Mumbai", "country": "India", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"id": "pune", "name": "Pune", "country": "India", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"id": "bengaluru", "name": "Bengaluru", "country": "India", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"id": "chennai", "name": "Chennai", "country": "India", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"id": "hyderabad", "name": "Hyderabad", "country": "India", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"id": "hampi", "name": "Hampi", "country": "India", "state": "Karnataka", "lat": 15.3350, "lng": 76.4600},
    {"id": "kolkata", "name": "Kolkata", "country": "India", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"id": "tokyo", "name": "Tokyo", "country": "Japan", "state": "Tokyo", "lat": 35.6762, "lng": 139.6503},
    {"id": "kyoto", "name": "Kyoto", "country": "Japan", "state": "Kyoto", "lat": 35.0116, "lng": 135.7681},
    {"id": "osaka", "name": "Osaka", "country": "Japan", "state": "Osaka", "lat": 34.6937, "lng": 135.5023},
    {"id": "seoul", "name": "Seoul", "country": "South Korea", "state": "Seoul", "lat": 37.5665, "lng": 126.9780},
    {"id": "singapore", "name": "Singapore", "country": "Singapore", "state": "Singapore", "lat": 1.3521, "lng": 103.8198},
    {"id": "bangkok", "name": "Bangkok", "country": "Thailand", "state": "Bangkok", "lat": 13.7563, "lng": 100.5018},
    {"id": "dubai", "name": "Dubai", "country": "United Arab Emirates", "state": "Dubai", "lat": 25.2048, "lng": 55.2708},
    {"id": "sydney", "name": "Sydney", "country": "Australia", "state": "NSW", "lat": -33.8688, "lng": 151.2093},
    {"id": "melbourne", "name": "Melbourne", "country": "Australia", "state": "Victoria", "lat": -37.8136, "lng": 144.9631},
]

SAMPLE_TOURS = [
    {
        "id": "euro_tour",
        "title": "European Grand Loop",
        "description": "European cities linked by cross-border road corridors",
        "city_ids": ["paris", "brussels", "amsterdam", "berlin", "prague", "vienna", "zurich"]
    },
    {
        "id": "california_coastal",
        "title": "California Pacific Express",
        "description": "West Coast hubs from the Pacific Northwest to Southern California",
        "city_ids": ["seattle", "portland", "sf", "la", "sandiego", "lasvegas"]
    },
    {
        "id": "golden_triangle_india",
        "title": "India's Golden Triangle",
        "description": "Historic North India route through Delhi, Agra, and Jaipur",
        "city_ids": ["delhi", "agra", "jaipur"]
    },
    {
        "id": "japan_tokyo_osaka",
        "title": "Japan Cultural Corridor",
        "description": "Tokyo, Kyoto, and Osaka across Japan's main island",
        "city_ids": ["tokyo", "kyoto", "osaka"]
    },
    {
        "id": "south_india_heritage",
        "title": "South India Heritage Trail",
        "description": "A South Indian journey through Hyderabad, Hampi, and Bengaluru",
        "city_ids": ["hyderabad", "hampi", "bengaluru"]
    },
    {
        "id": "west_india_circuit",
        "title": "Western India City Circuit",
        "description": "A western India loop across Mumbai, Pune, and Hyderabad",
        "city_ids": ["mumbai", "pune", "hyderabad"]
    }
]

async def search_cities_service(query: str, limit: int = 8) -> List[Dict[str, Any]]:
    """
    Searches pre-indexed popular destinations first, then queries OpenStreetMap Nominatim for any unlisted cities.
    """
    clean_q = query.strip().lower()
    if not clean_q:
        return PRESET_CITIES[:limit]

    # 1. Match local preset database
    local_matches = []
    for city in PRESET_CITIES:
        name_match = clean_q in city["name"].lower()
        country_match = clean_q in city.get("country", "").lower()
        state_match = clean_q in city.get("state", "").lower()

        if name_match or country_match or state_match:
            display_name = f"{city['name']}, {city['country']}"
            local_matches.append({
                "id": city["id"],
                "name": city["name"],
                "country": city.get("country", ""),
                "state": city.get("state", ""),
                "lat": city["lat"],
                "lng": city["lng"],
                "display_name": display_name
            })
            if len(local_matches) >= limit:
                return local_matches

    # 2. If we need more results, query OSM Nominatim
    if len(local_matches) < limit:
        url = f"https://nominatim.openstreetmap.org/search?format=json&q={clean_q}&limit={limit}&addressdetails=1"
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                resp = await client.get(url, headers={"User-Agent": "VoyageAI-Hackathon-App/1.0"})
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data:
                        raw_id = f"osm_{item.get('place_id')}"
                        lat = float(item["lat"])
                        lng = float(item["lon"])
                        display = item.get("display_name", "")
                        name_parts = display.split(",")
                        city_name = name_parts[0].strip() if name_parts else display
                        country_name = name_parts[-1].strip() if len(name_parts) > 1 else ""

                        # Prevent duplicate coordinates
                        if not any(abs(m["lat"] - lat) < 0.05 and abs(m["lng"] - lng) < 0.05 for m in local_matches):
                            local_matches.append({
                                "id": raw_id,
                                "name": city_name,
                                "country": country_name,
                                "state": "",
                                "lat": round(lat, 5),
                                "lng": round(lng, 5),
                                "display_name": display
                            })
                        if len(local_matches) >= limit:
                            break
        except Exception:
            pass

    return local_matches
