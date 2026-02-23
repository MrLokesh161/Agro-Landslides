"""Ensure notifications.severity column exists.
Run with: python -m app.scripts.add_notification_severity_column
"""
from sqlalchemy import text
from app.core.database import engine

with engine.connect() as conn:
    try:
        conn.execute(text("""
            ALTER TABLE notifications
            ADD COLUMN IF NOT EXISTS severity VARCHAR(20);
        """))
        conn.commit()
        print("severity column ensured on notifications table")
    except Exception as e:
        print("Failed to add notifications.severity column:", e)
        raise
