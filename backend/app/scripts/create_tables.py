"""Create DB tables (useful to apply new models when app not restarted).
Run: python -m app.scripts.create_tables
"""
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)
print("Created tables (if any were missing)")
