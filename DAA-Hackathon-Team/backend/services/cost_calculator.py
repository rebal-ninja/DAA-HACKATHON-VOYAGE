from typing import Dict, Any, Optional

# Costs are planning estimates, not live fuel, toll, or service prices.
# International estimates use USD assumptions; India estimates use INR assumptions.
VEHICLE_PROFILES = {
    "car": {
        "label": "Sedan / Passenger Car", "consumption_per_100km": 7.2, "unit": "L",
        "usd_price": 1.45, "usd_toll_per_km": 0.025, "usd_maintenance_per_km": 0.040,
        "inr_price": 103.0, "inr_toll_per_km": 0.80, "inr_maintenance_per_km": 1.20,
        "co2_kg_per_km": 0.165, "efficiency_label": "7.2 L / 100 km"
    },
    "ev": {
        "label": "Electric Vehicle (EV)", "consumption_per_100km": 18.5, "unit": "kWh",
        "usd_price": 0.24, "usd_toll_per_km": 0.020, "usd_maintenance_per_km": 0.022,
        "inr_price": 8.5, "inr_toll_per_km": 0.80, "inr_maintenance_per_km": 0.70,
        "co2_kg_per_km": 0.042, "efficiency_label": "18.5 kWh / 100 km"
    },
    "van": {
        "label": "Cargo / Delivery Van", "consumption_per_100km": 11.2, "unit": "L",
        "usd_price": 1.55, "usd_toll_per_km": 0.045, "usd_maintenance_per_km": 0.065,
        "inr_price": 92.0, "inr_toll_per_km": 1.20, "inr_maintenance_per_km": 2.20,
        "co2_kg_per_km": 0.258, "efficiency_label": "11.2 L / 100 km"
    },
    "truck": {
        "label": "Freight Truck / Semi", "consumption_per_100km": 31.5, "unit": "L Diesel",
        "usd_price": 1.62, "usd_toll_per_km": 0.115, "usd_maintenance_per_km": 0.145,
        "inr_price": 92.0, "inr_toll_per_km": 4.50, "inr_maintenance_per_km": 4.50,
        "co2_kg_per_km": 0.810, "efficiency_label": "31.5 L / 100 km"
    },
    "motorcycle": {
        "label": "Touring Motorcycle", "consumption_per_100km": 4.1, "unit": "L",
        "usd_price": 1.45, "usd_toll_per_km": 0.015, "usd_maintenance_per_km": 0.025,
        "inr_price": 103.0, "inr_toll_per_km": 0.30, "inr_maintenance_per_km": 0.60,
        "co2_kg_per_km": 0.092, "efficiency_label": "4.1 L / 100 km"
    }
}

def calculate_route_cost(
    distance_km: float,
    vehicle_type: str = "car",
    fuel_price_override: Optional[float] = None,
    currency: str = "USD",
) -> Dict[str, Any]:
    """Return an estimated operating cost in INR for India or USD otherwise."""
    profile = VEHICLE_PROFILES.get(vehicle_type.lower(), VEHICLE_PROFILES["car"])
    currency = currency.upper() if currency.upper() in {"INR", "USD"} else "USD"
    price_per_unit = (
        fuel_price_override if fuel_price_override is not None and fuel_price_override > 0
        else profile["inr_price"] if currency == "INR"
        else profile["usd_price"]
    )
    toll_per_km = profile["inr_toll_per_km"] if currency == "INR" else profile["usd_toll_per_km"]
    maintenance_per_km = profile["inr_maintenance_per_km"] if currency == "INR" else profile["usd_maintenance_per_km"]

    # Scale the vehicle's per-100-km consumption to this route, then price it
    # alongside per-kilometer toll and maintenance estimates.
    units_consumed = (max(distance_km, 0) / 100.0) * profile["consumption_per_100km"]
    fuel_cost = units_consumed * price_per_unit
    tolls_cost = max(distance_km, 0) * toll_per_km
    maintenance_cost = max(distance_km, 0) * maintenance_per_km
    total_cost = fuel_cost + tolls_cost + maintenance_cost
    # All cost and emissions calculations below take constant time and space.

    return {
        "fuel_cost": round(fuel_cost, 2),
        "tolls_estimate": round(tolls_cost, 2),
        "maintenance_cost": round(maintenance_cost, 2),
        "total_cost": round(total_cost, 2),
        "co2_kg": round(max(distance_km, 0) * profile["co2_kg_per_km"], 1),
        "vehicle_type": vehicle_type.lower(),
        "consumption_rate": profile["efficiency_label"],
        "currency": currency,
        "is_estimate": True,
        "disclaimer": (
            "India estimate uses configurable indicative INR fuel/energy, toll, and maintenance assumptions; "
            "actual pump prices, tolls, charging rates, and maintenance costs vary by location."
            if currency == "INR" else
            "USD estimate uses indicative fleet assumptions; actual fuel prices, tolls, and maintenance vary by region."
        )
    }
