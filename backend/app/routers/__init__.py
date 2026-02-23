from app.routers.alerts import router as alerts_router
from app.routers.auth import router as auth_router
from app.routers.dashboard import router as dashboard_router
from app.routers.gate import router as gate_router
from app.routers.irrigation import router as irrigation_router
from app.routers.profile import router as profile_router
from app.routers.notifications import router as notifications_router
from app.routers.scenario import router as scenario_router
from app.routers.sensor import router as sensor_router

__all__ = [
    "alerts_router",
    "auth_router",
    "dashboard_router",
    "gate_router",
    "irrigation_router",
    "profile_router",
    "notifications_router",
    "scenario_router",
    "sensor_router",
]
