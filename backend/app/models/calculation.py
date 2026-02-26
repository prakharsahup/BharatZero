import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings


engine = create_engine(settings.database_url)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Calculation(Base):
    __tablename__ = "calculations"

    id                   = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id              = Column(String, nullable=False, index=True)
    session_id           = Column(String, nullable=False, index=True)
    company_name         = Column(String, nullable=True)
    industry             = Column(String, nullable=True)
    state                = Column(String, nullable=True)
    kwh                  = Column(Float, nullable=True, default=0)
    diesel_liters        = Column(Float, nullable=True, default=0)
    lpg_kg               = Column(Float, nullable=True, default=0)
    production_tonnes    = Column(Float, nullable=True)
    scope1_kg_co2e       = Column(Float, nullable=True)
    scope2_kg_co2e       = Column(Float, nullable=True)
    total_tco2e          = Column(Float, nullable=True)
    intensity            = Column(Float, nullable=True)
    cbam_status          = Column(String, nullable=True)   # full JSON string (for PDF report)
    cbam_color           = Column(String, nullable=True)   # "green" | "yellow" | "red"
    cbam_label           = Column(String, nullable=True)
    percent_vs_benchmark = Column(Float, nullable=True)
    created_at           = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
