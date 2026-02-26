from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import calculate, extract, report, auth, compliance
from app.models.calculation import Base, engine

# Create DB tables on startup if they don't exist yet (Supabase PostgreSQL)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not create DB tables: {e}")

app = FastAPI(
    title="BharatZero API",
    description="CBAM Carbon Calculator for Indian Exporters — Scope 1 & 2 emissions",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(calculate.router, prefix="/api", tags=["Emissions"])
app.include_router(extract.router,   prefix="/api", tags=["OCR & Extraction"])
app.include_router(report.router,    prefix="/api", tags=["Reports"])
app.include_router(auth.router,       prefix="/api", tags=["Auth"])
app.include_router(compliance.router, prefix="/api", tags=["Compliance"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "BharatZero API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
