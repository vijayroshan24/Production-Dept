$pgctl = 'D:\Tools\postgresql-17.11\pgsql\bin\pg_ctl.exe'
$data = 'D:\Tools\postgresql-data-17.11'
& $pgctl -D $data stop
if ($LASTEXITCODE -ne 0) { throw 'Could not stop PostgreSQL.' }
