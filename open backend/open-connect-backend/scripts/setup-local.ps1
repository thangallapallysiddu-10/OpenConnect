$ErrorActionPreference = 'Stop'
Set-Location (Split-Path -Parent $PSScriptRoot)
if (-not (Test-Path '.env')) { Copy-Item '.env.example' '.env'; Write-Host 'Created .env; replace JWT secrets before production.' }
npm.cmd install
docker compose up -d postgres redis
Start-Sleep -Seconds 5
npm.cmd run migrate
npm.cmd run seed
Write-Host 'Setup complete. Run npm run dev; docs: http://localhost:4000/api-docs'
