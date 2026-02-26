from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models.user import User
from app.models.calculation import SessionLocal

router = APIRouter(prefix="/user", tags=["user"])


@router.get("/me")
def read_me(user=Depends(get_current_user)):
    db: Session = SessionLocal()

    db_user = db.query(User).filter(User.id == user["sub"]).first()

    if not db_user:
        db_user = User(
            id=user["sub"],
            email=user["email"],
        )
        db.add(db_user)
        db.commit()

    return {
        "user_id": user["sub"],
        "email": user["email"],
    }