from app.models.irrigation_status import IrrigationState


def irrigation_state_for_moisture(soil_moisture: float) -> IrrigationState:
    if soil_moisture < 30:
        return IrrigationState.ON
    if soil_moisture > 60:
        return IrrigationState.OFF
    return IrrigationState.OFF
