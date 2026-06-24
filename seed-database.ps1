# Sentinel Database Seeding Script

$PGPASSWORD = "postgres"
$env:PGPASSWORD = $PGPASSWORD

# PostgreSQL installation path (adjust if different)
$psqlPath = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "PostgreSQL psql not found at: $psqlPath" -ForegroundColor Red
    Write-Host "Looking for alternatives..." -ForegroundColor Yellow

    # Try to find psql in PATH
    $psqlCmd = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlCmd) {
        $psqlPath = $psqlCmd.Source
        Write-Host "Found psql at: $psqlPath" -ForegroundColor Green
    } else {
        Write-Host "psql command not found. Please install PostgreSQL or add it to PATH." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Seeding Sentinel database with test data..." -ForegroundColor Cyan

& $psqlPath -U postgres -d sentinel -f "backend\src\main\resources\db\seed-data.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database seeded successfully!" -ForegroundColor Green
} else {
    Write-Host "Database seeding failed with exit code: $LASTEXITCODE" -ForegroundColor Red
}


