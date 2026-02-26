# India CEA Grid Emission Factors (2022-23, kg CO2 per kWh)
# Source: Central Electricity Authority CO2 Baseline Database v18
CEA_GRID_FACTORS = {
    "andhra_pradesh": 0.83,
    "gujarat":        0.88,
    "karnataka":      0.74,
    "maharashtra":    0.79,
    "rajasthan":      0.91,
    "tamil_nadu":     0.82,
    "telangana":      0.86,
    "west_bengal":    1.02,
    "punjab":         0.70,
    "haryana":        0.82,
    "uttarakhand":    0.45,
    "himachal_pradesh": 0.40,
    "kerala":         0.60,
    "odisha":         0.95,
    "jharkhand":      0.98,
    "chhattisgarh":   0.93,
    "madhya_pradesh": 0.89,
    "uttar_pradesh":  0.88,
    "bihar":          0.95,
    "assam":          0.72,
    "national":       0.82,   # fallback if state unknown
}

# IPCC AR6 Combustion Factors (kg CO2e per unit)
COMBUSTION_FACTORS = {
    "diesel_per_liter":  2.68,
    "petrol_per_liter":  2.31,
    "lpg_per_kg":        2.98,
    "coal_per_kg":       2.42,
    "furnace_oil_liter": 3.17,
    "natural_gas_m3":    2.04,
}

# EU CBAM Industry Benchmarks (tCO2e per tonne of product)
CBAM_BENCHMARKS = {
    "steel":     1.89,
    "aluminium": 6.70,
    "cement":    0.81,
    "textile":   0.30,
    "chemicals": 1.20,
    "default":   1.50,
}
