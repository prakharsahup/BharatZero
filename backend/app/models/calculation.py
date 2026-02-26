from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings


engine = create_engine(
    settings.database_url,
    # Required for SQLite — not needed for PostgreSQL
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Calculation(Base):
    __tablename__ = "calculations"

    id                = Column(Integer, primary_key=True, autoincrement=True)
    session_id        = Column(String, nullable=False, index=True)
    company_name      = Column(String, nullable=True)
    industry          = Column(String, nullable=True)
    state             = Column(String, nullable=True)
    kwh               = Column(Float, nullable=True, default=0)
    diesel_liters     = Column(Float, nullable=True, default=0)
    lpg_kg            = Column(Float, nullable=True, default=0)
    production_tonnes = Column(Float, nullable=True)
    scope1_kg_co2e    = Column(Float, nullable=True)
    scope2_kg_co2e    = Column(Float, nullable=True)
    total_tco2e       = Column(Float, nullable=True)
    intensity         = Column(Float, nullable=True)
    cbam_status       = Column(String, nullable=True)   # stored as JSON string
    created_at        = Column(DateTime, default=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
