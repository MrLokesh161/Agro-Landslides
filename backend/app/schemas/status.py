from datetime import datetime

from pydantic import BaseModel

from app.models.gate_status import GateState
from app.models.irrigation_status import IrrigationState


class GateStatusOut(BaseModel):
    id: int
    status: GateState
    updated_at: datetime

    class Config:
        from_attributes = True


class IrrigationStatusOut(BaseModel):
    id: int
    status: IrrigationState
    updated_at: datetime
    water_level: float

    class Config:
        from_attributes = True


class DashboardLatestOut(BaseModel):
    sensor: "SensorDataOut"
    gate: GateStatusOut
    irrigation: IrrigationStatusOut


from app.schemas.sensor import SensorDataOut  # noqa: E402
DashboardLatestOut.model_rebuild()
