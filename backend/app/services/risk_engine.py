from typing import Tuple


def calculate_risk(water_pressure: float, tilt_angle: float) -> Tuple[float, str]:
    risk_score = (water_pressure * 0.5) + (tilt_angle * 5)
    if risk_score < 40:
        return risk_score, "LOW"
    if risk_score <= 70:
        return risk_score, "MEDIUM"
    return risk_score, "HIGH"
