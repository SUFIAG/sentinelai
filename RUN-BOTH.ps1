Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  SENTINELAI - COMPLETE STARTUP" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"

# ============================================
# STEP 1: Start Backend
# ============================================
Write-Host "STEP 1: Starting Backend..." -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend"

Write-Host "Backend will:" -ForegroundColor Cyan
Write-Host "  - Connect to PostgreSQL (localhost:5432)" -ForegroundColor Gray
Write-Host "  - Run Flyway migrations" -ForegroundColor Gray
Write-Host "  - Create tables" -ForegroundColor Gray
Write-Host "  - Start on port 8081" -ForegroundColor Gray
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend'; Write-Host 'Starting Backend...' -ForegroundColor Cyan; mvn spring-boot:run"

Write-Host "Backend starting in new window..." -ForegroundColor Green
Write-Host "Waiting 90 seconds for backend to initialize..." -ForegroundColor Yellow
Write-Host ""

for ($i = 90; $i -gt 0; $i--) {
    Write-Progress -Activity "Waiting for backend" -Status "Time remaining: $i seconds" -PercentComplete ((90-$i)/90*100)
    Start-Sleep -Seconds 1
}
Write-Progress -Activity "Waiting for backend" -Completed

Write-Host ""

# ============================================
# STEP 2: Check Backend Health
# ============================================
Write-Host "STEP 2: Checking Backend Status..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend Health: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Backend may still be starting... (This is OK)" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 3: Verify Database Tables
# ============================================
Write-Host "STEP 3: Verifying Database Tables..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Please enter your PostgreSQL password to check tables:" -ForegroundColor Cyan
$dbPassword = Read-Host -AsSecureString
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

$env:PGPASSWORD = $plainPassword

# Find psql
$pgPaths = @(
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe",
    "C:\Program Files\PostgreSQL\14\bin\psql.exe",
    "C:\Program Files\PostgreSQL\13\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $pgPaths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if ($psqlPath) {
    Write-Host "Checking tables in 'sentinel' database..." -ForegroundColor Cyan
    Write-Host ""

    # Count tables
    $tableCountQuery = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';"
    $tableCount = & $psqlPath -U postgres -h localhost -d sentinel -t -c $tableCountQuery 2>&1

    Write-Host "Total Tables Created: $($tableCount.Trim())" -ForegroundColor Green
    Write-Host ""

    # List some key tables
    Write-Host "Key Tables:" -ForegroundColor Yellow
    $listTablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name LIMIT 15;"
    $tables = & $psqlPath -U postgres -h localhost -d sentinel -t -c $listTablesQuery 2>&1

    $tables -split "`n" | ForEach-Object {
        if ($_.Trim()) {
            Write-Host "  - $($_.Trim())" -ForegroundColor White
        }
    }

    Write-Host "  ... and more" -ForegroundColor Gray
    Write-Host ""

    # Check if admin user exists
    Write-Host "Checking admin user..." -ForegroundColor Cyan
    $adminQuery = "SELECT email, role FROM users WHERE email = 'admin@sentinel.ai';"
    $admin = & $psqlPath -U postgres -h localhost -d sentinel -t -c $adminQuery 2>&1

    if ($admin -match "admin@sentinel.ai") {
        Write-Host "Admin user created: admin@sentinel.ai" -ForegroundColor Green
    } else {
        Write-Host "Admin user not found yet (backend may still be initializing)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Could not find psql.exe - skipping table verification" -ForegroundColor Yellow
    Write-Host "You can check manually in pgAdmin" -ForegroundColor Yellow
}

Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host ""

# ============================================
# STEP 4: Start Frontend
# ============================================
Write-Host "STEP 4: Starting Frontend..." -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend"

Write-Host "Frontend will:" -ForegroundColor Cyan
Write-Host "  - Clean build cache" -ForegroundColor Gray
Write-Host "  - Start development server" -ForegroundColor Gray
Write-Host "  - Run on port 3000" -ForegroundColor Gray
Write-Host ""

# Clean cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend'; Write-Host 'Starting Frontend...' -ForegroundColor Cyan; npm run dev"

Write-Host "Frontend starting in new window..." -ForegroundColor Green
Write-Host "Waiting 20 seconds for frontend to compile..." -ForegroundColor Yellow

for ($i = 20; $i -gt 0; $i--) {
    Write-Progress -Activity "Waiting for frontend" -Status "Time remaining: $i seconds" -PercentComplete ((20-$i)/20*100)
    Start-Sleep -Seconds 1
}
Write-Progress -Activity "Waiting for frontend" -Completed

Write-Host ""

# ============================================
# STEP 5: Test Frontend
# ============================================
Write-Host "STEP 5: Testing Frontend..." -ForegroundColor Yellow

Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "Frontend Health: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Frontend Status: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Frontend may still be compiling..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  STARTUP COMPLETE!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Summary
# ============================================
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend:   http://localhost:8081" -ForegroundColor Cyan
Write-Host "Frontend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host "  URL:      http://localhost:3000/login" -ForegroundColor White
Write-Host "  Email:    admin@sentinel.ai" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
Write-Host ""

Write-Host "Check the backend window for migration logs!" -ForegroundColor Cyan
Write-Host "Check the frontend window for compilation status!" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to open the login page in browser..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000/login"

Write-Host ""
Write-Host "Enjoy SentinelAI!" -ForegroundColor Green
Write-Host ""

