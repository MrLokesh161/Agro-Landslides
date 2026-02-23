"""Ensure alerts.reason column exists.
Run with: python -m app.scripts.add_alert_reason_column
"""
from sqlalchemy import text
from app.core.database import engine

with engine.connect() as conn:
    try:
        conn.execute(text("""
            ALTER TABLE alerts
            ADD COLUMN IF NOT EXISTS reason VARCHAR(255);
        """))
        conn.commit()
        print("reason column ensured on alerts table")
    except Exception as e:
        print("Failed to add alerts.reason column:", e)
        raise
