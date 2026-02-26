import io
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.schemas.input import ReportRequest
from app.core.auth import get_current_user
from app.core import session_cache
from app.models.calculation import Calculation, get_db
from app.core.pdf_generator import generate_report_pdf

router = APIRouter()


@router.get("/calculations")
def list_calculations(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Return all calculations for the authenticated user, newest first."""
    try:
        calcs = (
            db.query(Calculation)
            .filter(Calculation.user_id == user_id)
            .order_by(Calculation.created_at.desc())
            .all()
        )
        if calcs:
            return [
                {
                    "session_id":           c.session_id,
                    "company_name":         c.company_name,
                    "industry":             c.industry,
                    "state":                c.state,
                    "total_tco2e":          c.total_tco2e,
                    "intensity":            c.intensity,
                    "cbam_color":           c.cbam_color,
                    "cbam_label":           c.cbam_label,
                    "percent_vs_benchmark": c.percent_vs_benchmark,
                    "created_at":           c.created_at.isoformat() if c.created_at else None,
                }
                for c in calcs
            ]
    except Exception:
        pass

    # Fall back to in-memory cache when DB is unavailable or returned nothing
    cached = session_cache.list_by_user(user_id)
    return [
        {
            "session_id":           c.get("session_id"),
            "company_name":         c.get("company_name"),
            "industry":             c.get("industry"),
            "state":                c.get("state"),
            "total_tco2e":          c.get("total_tco2e"),
            "intensity":            c.get("intensity"),
            "cbam_color":           c.get("cbam_color"),
            "cbam_label":           c.get("cbam_label"),
            "percent_vs_benchmark": c.get("percent_vs_benchmark"),
            "created_at":           None,
        }
        for c in cached
    ]


@router.post("/report")
def generate_report(
    request: ReportRequest,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user),
):
    """Look up a previously calculated session and return a CBAM-style PDF report."""
    try:
        calc = (
            db.query(Calculation)
            .filter(
                Calculation.session_id == request.session_id,
                Calculation.user_id == user_id,
            )
            .first()
        )
    except Exception:
        calc = None

    if not calc:
        # Fall back to in-memory cache when DB is unavailable
        cached = session_cache.get(request.session_id)
        if not cached or cached.get("user_id") != user_id:
            raise HTTPException(
                status_code=404,
                detail="Session not found. Run /api/calculate first to generate a session.",
            )

        class _CalcProxy:
            def __getattr__(self, name):
                return cached.get(name)

        calc = _CalcProxy()

    cbam_status = json.loads(calc.cbam_status) if calc.cbam_status else {}

    pdf_bytes = generate_report_pdf(calc, cbam_status)
    filename  = f"cbam_report_{request.session_id[:8]}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
