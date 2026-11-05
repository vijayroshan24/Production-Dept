$ErrorActionPreference = 'Stop'
$pgBin = 'D:\Tools\postgresql-17.11\pgsql\bin'
$data = 'D:\Tools\postgresql-data-17.11'
$log = Join-Path $env:LOCALAPPDATA 'Temp\postgresql-17.11.log'
$pgctl = Join-Path $pgBin 'pg_ctl.exe'
if (-not (Test-Path $pgctl)) { throw "PostgreSQL 17.11 is not installed at $pgBin" }
& $pgctl -D $data status *> $null
if ($LASTEXITCODE -eq 0) { Write-Output 'PostgreSQL is already running.'; exit 0 }
& $pgctl -D $data -l $log -o '-h 127.0.0.1 -p 5433' start
if ($LASTEXITCODE -ne 0) { throw "Could not start PostgreSQL. Check $log" }
