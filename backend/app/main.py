from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models import user

from app.api import calculate, extract, report
from app.models.calculation import Base, engine
from app.api.user import router as user_router

# Create DB tables on startup (SQLite creates the file automatically)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="GreenLedger Lite API",
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
app.include_router(user_router)

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "BharatZero API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}
