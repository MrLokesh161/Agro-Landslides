from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import GateStatus
from app.schemas.status import GateStatusOut

router = APIRouter(prefix="/gate-status", tags=["gate"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("", response_model=GateStatusOut)
def get_gate_status(db: Session = Depends(get_db)) -> GateStatusOut:
    status = db.query(GateStatus).order_by(GateStatus.updated_at.desc()).first()
    if status is None:
        raise HTTPException(status_code=404, detail="No gate status available")
    return status
