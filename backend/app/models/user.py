from sqlalchemy import Column, String
from app.models.calculation import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True)   # Supabase user id
    email = Column(String, nullable=False)