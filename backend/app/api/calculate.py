import json
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas.input import CalculationInput
from app.schemas.output import CalculationResult, CBAMStatus
from app.core.calculator import run_full_calculation
from app.models.calculation import Calculation, get_db

router = APIRouter()


@router.post("/calculate", response_model=CalculationResult)
def calculate_emissions(payload: CalculationInput, db: Session = Depends(get_db)):
    """
    Accept manual emission inputs, run Scope 1 + Scope 2 calculation,
    persist result, and return CBAM compliance summary.
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

    # Persist to database
    calc = Calculation(
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
        cbam_status=json.dumps(result["cbam_status"]),
    )
    db.add(calc)
    db.commit()

    return CalculationResult(
        session_id=session_id,
        scope1_kg_co2e=result["scope1_kg_co2e"],
        scope2_kg_co2e=result["scope2_kg_co2e"],
        total_kg_co2e=result["total_kg_co2e"],
        total_tco2e=result["total_tco2e"],
        intensity=result["intensity"],
        cbam_status=CBAMStatus(**result["cbam_status"]),
    )
