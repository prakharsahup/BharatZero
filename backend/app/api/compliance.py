import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.input import ReportRequest
from app.core.auth import get_current_user
from app.core import session_cache
from app.models.calculation import Calculation, get_db
from app.services.llm_service import analyze_compliance

router = APIRouter()


@router.post("/compliance")
def get_compliance_note(
    request: ReportRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Run Gemini compliance analysis on a previously calculated session.
    Returns a structured note covering risks, recommendations, and phase implications.
    """
    # Resolve calculation data ─────────────────────────────────────────────────
    calc_data: dict | None = None

    try:
        calc = (
            db.query(Calculation)
            .filter(
                Calculation.session_id == request.session_id,
                Calculation.user_id == user_id,
            )
            .first()
        )
        if calc:
            calc_data = {
                "company_name":       calc.company_name,
                "industry":           calc.industry,
                "state":              calc.state,
                "kwh":                calc.kwh,
                "diesel_liters":      calc.diesel_liters,
                "lpg_kg":             calc.lpg_kg,
                "production_tonnes":  calc.production_tonnes,
                "scope1_kg_co2e":     calc.scope1_kg_co2e,
                "scope2_kg_co2e":     calc.scope2_kg_co2e,
                "total_tco2e":        calc.total_tco2e,
                "intensity":          calc.intensity,
                "cbam_status":        calc.cbam_status,  # JSON string
            }
    except Exception:
        pass

    if calc_data is None:
        cached = session_cache.get(request.session_id)
        if not cached or cached.get("user_id") != user_id:
            raise HTTPException(
                status_code=404,
                detail="Session not found. Run /api/calculate first.",
            )
        calc_data = cached

    # Run Gemini analysis ──────────────────────────────────────────────────────
    try:
        note = analyze_compliance(calc_data)
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Compliance analysis failed: {exc}",
        )

    return note
