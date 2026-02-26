from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import settings
from app.services.ocr_service import extract_content
from app.services.llm_service import extract_bill_data

router = APIRouter()

ALLOWED_TYPES = {"electricity_bill", "diesel_invoice"}


@router.post("/extract")
async def extract_from_file(
    file: UploadFile = File(...),
    document_type: str = Form(...),
):
    """
    Accept a PDF or image of an electricity bill / diesel invoice.
    For native-text PDFs, extracts text directly (no Tesseract required).
    For scanned PDFs and images, uses Claude's vision API.
    Returns structured numeric fields ready to pre-fill the calculator form.
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
    filename = file.filename or "upload.pdf"

    try:
        content = extract_content(file_bytes, filename)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"File processing failed: {exc}")

    if content["type"] == "text" and not content["content"].strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in the uploaded file. Try a clearer scan or image.",
        )

    try:
        extracted = extract_bill_data(content, document_type)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"LLM extraction failed: {exc}")

    return {
        "document_type": document_type,
        "extracted": extracted,
        "confidence": "high",
    }
