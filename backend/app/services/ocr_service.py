import io


def extract_text_from_image(file_bytes: bytes, filename: str) -> str:
    """
    Extract raw text from an image or PDF file using pytesseract.
    Falls back gracefully if tesseract is not installed.
    """
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise RuntimeError("pytesseract / Pillow not installed. Run: pip install pytesseract Pillow")

    filename_lower = filename.lower()

    if filename_lower.endswith(".pdf"):
        try:
            import fitz  # PyMuPDF
        except ImportError:
            raise RuntimeError("PyMuPDF not installed. Run: pip install PyMuPDF")

        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page in doc:
            # 2x zoom for better OCR accuracy
            mat = fitz.Matrix(2, 2)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(img)
            text_parts.append(text)
        doc.close()
        return "\n".join(text_parts)

    else:
        # Treat as image (JPEG, PNG, TIFF, BMP …)
        img = Image.open(io.BytesIO(file_bytes))
        return pytesseract.image_to_string(img)
