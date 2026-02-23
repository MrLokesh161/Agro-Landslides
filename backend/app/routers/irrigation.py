from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import IrrigationStatus
from app.schemas.status import IrrigationStatusOut
from app.services.notification_service import create_notification

router = APIRouter(prefix="/irrigation-status", tags=["irrigation"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class IrrigationUpdate(BaseModel):
    status: str = Field(..., description="ON or OFF")
    water_level: float = Field(..., ge=0.0, description="Water level in liters or percentage")


@router.get("", response_model=IrrigationStatusOut)
def get_irrigation_status(db: Session = Depends(get_db)) -> IrrigationStatusOut:
    status = db.query(IrrigationStatus).order_by(IrrigationStatus.updated_at.desc()).first()
    if status is None:
        raise HTTPException(status_code=404, detail="No irrigation status available")
    return status


@router.post("/update", response_model=IrrigationStatusOut)
def update_irrigation(payload: IrrigationUpdate, db: Session = Depends(get_db)) -> IrrigationStatusOut:
    try:
        state = IrrigationStatus.__table__.c.status.type.enum_class(payload.status)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid irrigation status; must be ON or OFF")

    record = IrrigationStatus(status=state, water_level=payload.water_level)
    db.add(record)
    db.commit()
    db.refresh(record)

    # create a notification for user visibility
    try:
        create_notification(db, message=f"Irrigation set to {payload.status} (level={payload.water_level})", type="irrigation")
    except Exception:
        pass

    return record
