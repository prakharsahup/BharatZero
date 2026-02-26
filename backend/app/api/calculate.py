import json
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.input import CalculationInput
from app.schemas.output import CalculationResult, CBAMStatus
from app.core.calculator import run_full_calculation
from app.core.auth import get_current_user
from app.core import session_cache
from app.models.calculation import Calculation, get_db

router = APIRouter()


@router.post("/calculate", response_model=CalculationResult)
def calculate_emissions(
    payload: CalculationInput,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """
    Accept emission inputs, run Scope 1 + Scope 2 calculation,
    persist result linked to the authenticated user, and return CBAM summary.
    """
    session_id = str(uuid.uuid4())

    result = run_full_calculation(
        kwh=payload.kwh,
        state=payload.state,
        diesel_liters=payload.diesel_liters,
        production_tonnes=payload.production_tonnes,
        industry=payload.industry,
        lpg_kg=payload.lpg_kg,
    )

    cbam = result["cbam_status"]

    try:
        calc = Calculation(
            user_id=user_id,
            session_id=session_id,
            company_name=payload.company_name,
            industry=payload.industry,
            state=payload.state,
            kwh=payload.kwh,
            diesel_liters=payload.diesel_liters,
            lpg_kg=payload.lpg_kg,
            production_tonnes=payload.production_tonnes,
            scope1_kg_co2e=result["scope1_kg_co2e"],
            scope2_kg_co2e=result["scope2_kg_co2e"],
            total_tco2e=result["total_tco2e"],
            intensity=result["intensity"],
            cbam_status=json.dumps(cbam),
            cbam_color=cbam["status"],
            cbam_label=cbam["label"],
            percent_vs_benchmark=cbam["percent_vs_benchmark"],
        )
        db.add(calc)
        db.commit()
    except Exception as e:
        print(f"Warning: Could not save calculation to DB: {e}")
        db.rollback()

    # Always cache in memory so report generation works even without DB
    session_cache.store(session_id, {
        "user_id": user_id,
        "session_id": session_id,
        "company_name": payload.company_name,
        "industry": payload.industry,
        "state": payload.state,
        "kwh": payload.kwh,
        "diesel_liters": payload.diesel_liters,
        "lpg_kg": payload.lpg_kg,
        "production_tonnes": payload.production_tonnes,
        "scope1_kg_co2e": result["scope1_kg_co2e"],
        "scope2_kg_co2e": result["scope2_kg_co2e"],
        "total_tco2e": result["total_tco2e"],
        "intensity": result["intensity"],
        "cbam_status": json.dumps(cbam),
        "cbam_color": cbam["status"],
        "cbam_label": cbam["label"],
        "percent_vs_benchmark": cbam["percent_vs_benchmark"],
    })

    return CalculationResult(
        session_id=session_id,
        scope1_kg_co2e=result["scope1_kg_co2e"],
        scope2_kg_co2e=result["scope2_kg_co2e"],
        total_kg_co2e=result["total_kg_co2e"],
        total_tco2e=result["total_tco2e"],
        intensity=result["intensity"],
        cbam_status=CBAMStatus(**cbam),
    )
