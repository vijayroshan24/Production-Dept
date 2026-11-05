# Production Tracker Demo

A small, single-site Django demo for walking a client through a production dashboard. Django serves the pages and handles the app logic. It uses SQLite, so there is no separate frontend server, Java runtime, Docker, or hosted database to configure.

## What works

- Demo sign-in and sign-out
- Overview with project counts, output chart, and status summary
- Project search, status filters, create, edit, and delete
- Production log with search and a form that updates project totals
- Sample assembly line and team pages
- CSV exports for projects and production updates
- Fictional sample data created by the `seed_demo` command

Team and assembly line rows are presentation sample content. This project is for a client walkthrough, not for real production records.

## Run locally on Windows

Install Python 3.10 or newer, then open PowerShell in this folder:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Open <http://127.0.0.1:8000>.

### Demo login

- Email: `demo@production.local`
- Password: `Demo123!`

## Free demo deployment on Render

The included `render.yaml` describes one free Python web service. Connect the public GitHub repository to Render and choose **Blueprint** (or create a Python web service using the commands in `render.yaml`). The whole site uses one Render URL. It uses no Docker image and no separate database service.

Render's free service sleeps when idle, and its local filesystem is temporary. Because this demo stores data in a local SQLite file, edits may reset after a sleep, restart, or redeploy. The start command applies database migrations and restores the fictional sample data when needed.

For a client walkthrough, open the site shortly before the meeting so the free service has time to wake up. Do not enter customer or private production information.
