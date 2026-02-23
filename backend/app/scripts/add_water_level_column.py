"""Run to add irrigation_status.water_level column if missing.
Usage: python -m app.scripts.add_water_level_column
"""
from sqlalchemy import text
from app.core.database import engine

with engine.connect() as conn:
    # Use safe ALTER: add column if it doesn't exist (Postgres syntax)
    try:
        conn.execute(text("""
            ALTER TABLE irrigation_status
            ADD COLUMN IF NOT EXISTS water_level DOUBLE PRECISION NOT NULL DEFAULT 0.0;
        """))
        conn.commit()
        print("water_level column ensured on irrigation_status")
    except Exception as e:
        print("Failed to add column:", e)
        raise
