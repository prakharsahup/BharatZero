from .emission_factors import CBAM_BENCHMARKS


def check_cbam_readiness(intensity: float, industry: str) -> dict:
    """
    Compare carbon intensity against EU CBAM benchmark for the industry.
    Returns status (green/yellow/red), label, and comparison metrics.
    """
    benchmark = CBAM_BENCHMARKS.get(industry.lower(), CBAM_BENCHMARKS["default"])
    ratio = intensity / benchmark if benchmark > 0 else 0

    if ratio <= 0.8:
        status = "green"
        label  = "CBAM Ready — below EU benchmark"
    elif ratio <= 1.0:
        status = "yellow"
        label  = "Near EU benchmark — improvements needed"
    else:
        status = "red"
        label  = "Exceeds EU benchmark — CBAM tax applies"

    return {
        "status": status,
        "label": label,
        "your_intensity": round(intensity, 4),
        "eu_benchmark": benchmark,
        "percent_vs_benchmark": round((intensity / benchmark) * 100, 1) if benchmark > 0 else 0,
    }
