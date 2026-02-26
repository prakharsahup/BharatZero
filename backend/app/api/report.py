import io
import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.schemas.input import ReportRequest
from app.models.calculation import Calculation, get_db
from app.core.pdf_generator import generate_report_pdf

router = APIRouter()


@router.post("/report")
def generate_report(request: ReportRequest, db: Session = Depends(get_db)):
    """
    Look up a previously calculated session and return a CBAM-style PDF report.
    """
    calc = (
        db.query(Calculation)
        .filter(Calculation.session_id == request.session_id)
        .first()
    )

    if not calc:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Run /api/calculate first to generate a session.",
        )

    cbam_status = json.loads(calc.cbam_status) if calc.cbam_status else {}

    pdf_bytes = generate_report_pdf(calc, cbam_status)
    filename  = f"cbam_report_{request.session_id[:8]}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
