# Smart Agriculture — Landslide Prevention System

This repository contains a FastAPI backend and a React + Vite frontend for a Smart Agriculture Landslide Prevention demo system. This single README documents setup and development steps for both backend and frontend.

---

## Project layout

- `backend/` — FastAPI application (Python)
- `frontend/` — React + TypeScript UI (Vite)

---

## Prerequisites

- Python 3.11+ (or 3.10)
- Node.js 18+ and npm
- PostgreSQL server (local or remote)

Optional (for sending emails): SMTP credentials

---

## Environment variables

Create a `.env` file for the backend (or set environment variables in your environment). Example variables used by the app:

```
POSTGRES_USER=develop
POSTGRES_PASSWORD=161
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=agro

# Alternatively set DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/dbname
DATABASE_URL=postgresql+psycopg2://develop:161@localhost:5432/agro

SECRET_KEY=replace-with-a-secure-random-string
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALGORITHM=HS256

# Optional: SMTP for password reset emails
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=alerts@example.com
```

Do not commit `.env` to version control.

---

## Backend — setup (Windows / PowerShell)

1. Create a virtual environment and activate it:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. Create the database (Postgres) and ensure connection settings are correct in `.env`.

4. Apply DB schema (recommended):

- If using Alembic, set `sqlalchemy.url` in `alembic.ini` to your database and run:

```powershell
alembic revision --autogenerate -m "init"
alembic upgrade head
```

- Or for development, run the helper script that creates missing tables:

```powershell
python -m app.scripts.create_tables
```

If you have legacy DB and need the one-off scripts added in this project, run them (they use `ALTER TABLE IF NOT EXISTS`):

```powershell
python -m app.scripts.add_water_level_column
python -m app.scripts.add_alert_reason_column
python -m app.scripts.add_notification_severity_column
```

5. Run the development server:

```powershell
# from backend/ (with venv activated)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000` and OpenAPI docs at `/docs`.

---

## Frontend — setup

1. Install dependencies and run dev server:

```powershell
cd frontend
npm install
npm run dev
```

2. Build for production:

```powershell
npm run build
```

The frontend proxy is configured to forward `/api` to the backend dev server.

---

## Running both together (development)

Open two terminals:

Terminal 1 — backend:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 — frontend:

```powershell
cd frontend
npm run dev
```

Access the UI at the Vite dev server URL (typically `http://localhost:5173`).

---

## Auth features

- Signup, login with JWT.
- Password reset (demo token returned by `/auth/reset-request`; in production configure SMTP and the backend can email the token/URL).
- Password complexity validation (min 8 chars, mixed case, digits, special char). You can enforce this at signup by enabling validation in `register_user`.

---

## Notifications and Scenarios

- The backend simulation creates Alerts and Notifications. Frontend shows popup toasts for HIGH-severity alerts and provides a Notifications list.
- Scenario panel can activate scenarios like `HEAVY_RAIN`, `LANDSLIDE_RISK`, etc.

---

## Production notes

- Use a strong `SECRET_KEY` and don't store it in the repository.
- Use Alembic for schema migrations rather than create_all / one-off scripts for production systems.
- Run the backend under a process manager (systemd, supervisord) and reverse-proxy with nginx. Serve the built frontend using a static file server or CDN.
- Use HTTPS for all production endpoints and secure cookies/localStorage appropriately.

---

## Troubleshooting

- If you see SQL errors about missing columns after changing models, first run the Alembic migrations or run `python -m app.scripts.create_tables` for dev; earlier we included ALTER scripts in `app/scripts/` for incremental updates.
- If `passlib`/`bcrypt` logs a harmless import message, startup code already suppresses that noise.

---

If you'd like I can:

- Add an SMTP email sender and wire reset emails.
- Create Alembic migration files for the schema changes we've added and commit them.
- Add a single `docker-compose.yml` to run Postgres + backend + frontend for local dev.

Tell me which of these you'd like next.
