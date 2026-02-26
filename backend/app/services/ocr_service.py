import base64
import io


def extract_content(file_bytes: bytes, filename: str) -> dict:
    """
    Extract content from a PDF or image file without requiring Tesseract.

    Strategy:
    - PDF with a native text layer  → extract text directly via PyMuPDF
    - PDF that is scanned / image-only → render first page to PNG, return as base64
    - Image file (JPG, PNG, …)         → encode as base64 for Claude vision

    Returns one of:
      {"type": "text",  "content": "<extracted text>"}
      {"type": "image", "content": "<base64 string>", "media_type": "image/png" | "image/jpeg"}
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise RuntimeError("PyMuPDF not installed. Run: pip install PyMuPDF")

    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        doc = fitz.open(stream=file_bytes, filetype="pdf")

        # --- Try native text extraction first (works on Windows, no Tesseract) ---
        text_parts = []
        for page in doc:
            text_parts.append(page.get_text())
        doc.close()

        full_text = "\n".join(text_parts).strip()

        if len(full_text) >= 80:
            # Good native text layer — send as text to Claude
            return {"type": "text", "content": full_text}

        # --- Scanned / image-only PDF: render to PNG and send to Claude vision ---
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        page = doc[0]
        # 2× zoom for better legibility
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        img_bytes = pix.tobytes("png")
        doc.close()

        return {
            "type": "image",
            "content": base64.standard_b64encode(img_bytes).decode(),
            "media_type": "image/png",
        }

    else:
        # --- Image file: encode directly for Claude vision ---
        if filename_lower.endswith((".jpg", ".jpeg")):
            media_type = "image/jpeg"
            encoded = base64.standard_b64encode(file_bytes).decode()
        elif filename_lower.endswith(".png"):
            media_type = "image/png"
            encoded = base64.standard_b64encode(file_bytes).decode()
        else:
            # Convert unsupported formats (TIFF, BMP, …) to PNG first
            try:
                from PIL import Image
            except ImportError:
                raise RuntimeError("Pillow not installed. Run: pip install Pillow")

            img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            media_type = "image/png"
            encoded = base64.standard_b64encode(buf.getvalue()).decode()

        return {"type": "image", "content": encoded, "media_type": media_type}
