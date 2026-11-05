# Production Tracker

Starter production tracking app: React + Spring Boot + PostgreSQL.

It includes sign-in, overview, projects, assembly lines, production log, team, reports, and settings pages. Project and production-update data are stored in PostgreSQL. Team, reports, and some dashboard figures are currently sample UI content.

## Start the app

Open three PowerShell windows.

1. Start PostgreSQL:

   ```powershell
   cd D:\Production-Tracking-System
   .\start-database.ps1
   ```

2. Start the API:

   ```powershell
   cd D:\Production-Tracking-System
   .\start-backend.ps1
   ```

3. Start the website:

   ```powershell
   cd D:\Production-Tracking-System\frontend
   npm run dev
   ```

Open `http://localhost:5173` and sign in with:

- Email: `admin@northstar.local`
- Password: `ChangeMe123!`

Stop PostgreSQL when finished:

```powershell
D:\Production-Tracking-System\stop-database.ps1
```

The sample password is for local development. Change it before anyone else uses the app.
The local PostgreSQL database uses port `5433` so it does not conflict with another database already using the default port.

## Continuing on another computer

Install Node.js 20+, JDK 21, Maven, and PostgreSQL 17. The PowerShell helper scripts above assume the tools are in `D:\Tools` on the current development laptop. On another computer, set the database connection in `backend\src\main\resources\application.yml`, then run Spring Boot with Maven and the website with `npm run dev` from `frontend`.

The project contains starter data and a development password. Review authentication, access rules, and sample content before using it with a client or real production data.
