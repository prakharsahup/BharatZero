from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import settings
from app.services.ocr_service import extract_text_from_image
from app.services.llm_service import extract_bill_data

router = APIRouter()

ALLOWED_TYPES = {"electricity_bill", "diesel_invoice"}


@router.post("/extract")
async def extract_from_file(
    file: UploadFile = File(...),
    document_type: str = Form(...),
):
    """
    Accept a PDF or image of an electricity bill / diesel invoice,
    run OCR, then use Claude to extract structured numeric fields.
    """
    if document_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"document_type must be one of: {', '.join(ALLOWED_TYPES)}",
        )

    if not settings.anthropic_api_key:
        raise HTTPException(
            status_code=503,
            detail="OCR extraction not configured. Set ANTHROPIC_API_KEY in backend .env",
        )

    file_bytes = await file.read()
    filename   = file.filename or "upload.jpg"

    try:
        raw_text = extract_text_from_image(file_bytes, filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"OCR failed: {exc}")

    if not raw_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the uploaded file. Try a clearer image.",
        )

    try:
        extracted = extract_bill_data(raw_text, document_type)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"LLM extraction failed: {exc}")

    return {
        "document_type": document_type,
        "extracted":     extracted,
        "confidence":    "high",
    }
