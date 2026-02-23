import logging

# Reduce noisy passlib/bcrypt import diagnostics which can print a trapped AttributeError
logging.getLogger("passlib").setLevel(logging.WARNING)
logging.getLogger("bcrypt").setLevel(logging.WARNING)

from contextlib import asynccontextmanager
from typing import Iterator

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine
from app.routers import (
    alerts_router,
    auth_router,
    dashboard_router,
    gate_router,
    irrigation_router,
    profile_router,
    scenario_router,
    sensor_router,
    notifications_router,
)
from app.services.simulation_service import run_simulation_step


def _get_db_session() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _simulation_job() -> None:
    for db in _get_db_session():
        run_simulation_step(db)


def _create_scheduler() -> BackgroundScheduler:
    scheduler = BackgroundScheduler(timezone="UTC")
    scheduler.add_job(_simulation_job, "interval", seconds=5, max_instances=1)
    return scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    scheduler = _create_scheduler()
    scheduler.start()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(title="Smart Agriculture Landslide Prevention System", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(alerts_router)
app.include_router(gate_router)
app.include_router(irrigation_router)
app.include_router(sensor_router)
app.include_router(scenario_router)
app.include_router(notifications_router)
