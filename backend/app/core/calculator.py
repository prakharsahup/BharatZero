from .emission_factors import CEA_GRID_FACTORS, COMBUSTION_FACTORS
from .cbam_checker import check_cbam_readiness


def calculate_scope1(diesel_liters: float = 0, lpg_kg: float = 0) -> float:
    """Direct combustion emissions in kg CO2e"""
    return (
        diesel_liters * COMBUSTION_FACTORS["diesel_per_liter"] +
        lpg_kg        * COMBUSTION_FACTORS["lpg_per_kg"]
    )


def calculate_scope2(kwh: float, state: str) -> float:
    """Purchased electricity emissions in kg CO2e"""
    key = state.lower().replace(" ", "_")
    factor = CEA_GRID_FACTORS.get(key, CEA_GRID_FACTORS["national"])
    return kwh * factor


def calculate_intensity(total_kg_co2e: float, production_tonnes: float) -> float:
    """Carbon intensity in tCO2e per tonne of product"""
    if production_tonnes <= 0:
        return 0
    return (total_kg_co2e / 1000) / production_tonnes


def run_full_calculation(
    kwh: float,
    state: str,
    diesel_liters: float,
    production_tonnes: float,
    industry: str,
    lpg_kg: float = 0,
) -> dict:
    scope1_kg  = calculate_scope1(diesel_liters, lpg_kg)
    scope2_kg  = calculate_scope2(kwh, state)
    total_kg   = scope1_kg + scope2_kg
    intensity  = calculate_intensity(total_kg, production_tonnes)
    cbam       = check_cbam_readiness(intensity, industry)

    return {
        "scope1_kg_co2e":  round(scope1_kg, 2),
        "scope2_kg_co2e":  round(scope2_kg, 2),
        "total_kg_co2e":   round(total_kg, 2),
        "total_tco2e":     round(total_kg / 1000, 4),
        "intensity":       round(intensity, 4),
        "cbam_status":     cbam,
    }
