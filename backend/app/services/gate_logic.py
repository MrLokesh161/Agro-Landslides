from app.models.gate_status import GateState


def gate_state_for_risk(risk_level: str) -> GateState:
    if risk_level == "HIGH":
        return GateState.CLOSED
    if risk_level == "MEDIUM":
        return GateState.OPEN
    return GateState.OPEN
