# ==========================================
# SENTINEL AI - Complete Startup Script
# ==========================================
# This script:
# 1. Starts backend (auto-seeds database with users)
# 2. Waits for backend to be ready
# 3. Starts frontend
# 4. Opens browser
# ==========================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║              🛡️  SENTINEL AI - STARTING SYSTEM  🛡️              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Colors
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

# Paths
$BackendPath = "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend"
$FrontendPath = "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend"

# ==========================================
# STEP 1: Check Prerequisites
# ==========================================
Write-Host "[1/5] Checking prerequisites..." -ForegroundColor $Cyan

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "  ✓ Java found: $javaVersion" -ForegroundColor $Green
} catch {
    Write-Host "  ✗ Java not found! Please install Java 17 or higher" -ForegroundColor $Red
    exit 1
}

# Check Maven
try {
    $mavenVersion = mvn -version 2>&1 | Select-String "Apache Maven" | Select-Object -First 1
    Write-Host "  ✓ Maven found: $mavenVersion" -ForegroundColor $Green
} catch {
    Write-Host "  ✗ Maven not found! Please install Maven" -ForegroundColor $Red
    exit 1
}

# Check Node
try {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js found: $nodeVersion" -ForegroundColor $Green
} catch {
    Write-Host "  ✗ Node.js not found! Please install Node.js" -ForegroundColor $Red
    exit 1
}

# Check if ports are available
$backendPort = 8081
$frontendPort = 3000

$backendInUse = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue
if ($backendInUse) {
    Write-Host "  ⚠ Port $backendPort is already in use. Stopping existing process..." -ForegroundColor $Yellow
    $processId = (Get-NetTCPConnection -LocalPort $backendPort).OwningProcess | Select-Object -First 1
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

$frontendInUse = Get-NetTCPConnection -LocalPort $frontendPort -ErrorAction SilentlyContinue
if ($frontendInUse) {
    Write-Host "  ⚠ Port $frontendPort is already in use. Stopping existing process..." -ForegroundColor $Yellow
    $processId = (Get-NetTCPConnection -LocalPort $frontendPort).OwningProcess | Select-Object -First 1
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""

# ==========================================
# STEP 2: Start Backend
# ==========================================
Write-Host "[2/5] Starting backend (this will seed database with users)..." -ForegroundColor $Cyan
Write-Host "  Location: $BackendPath" -ForegroundColor Gray

if (-not (Test-Path $BackendPath)) {
    Write-Host "  ✗ Backend path not found!" -ForegroundColor $Red
    exit 1
}

# Start backend in background
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    mvn spring-boot:run
} -ArgumentList $BackendPath

Write-Host "  ✓ Backend started (Job ID: $($backendJob.Id))" -ForegroundColor $Green
Write-Host "  ⏳ Waiting for backend to initialize and seed database..."  -ForegroundColor $Yellow
Write-Host ""

# Wait for backend to be ready (check for "Started" message in logs)
$maxWaitTime = 120  # 2 minutes
$waitInterval = 5
$elapsed = 0
$backendReady = $false

while ($elapsed -lt $maxWaitTime -and -not $backendReady) {
    Start-Sleep -Seconds $waitInterval
    $elapsed += $waitInterval

    # Check if port is listening
    $connection = Get-NetTCPConnection -LocalPort $backendPort -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  ✓ Backend is up on port $backendPort!" -ForegroundColor $Green
        $backendReady = $true
        break
    }

    # Show progress
    $dots = "." * ($elapsed / 5)
    Write-Host "  Waiting$dots ($elapsed seconds)" -ForegroundColor Gray
}

if (-not $backendReady) {
    Write-Host "  ✗ Backend failed to start within $maxWaitTime seconds" -ForegroundColor $Red
    Write-Host "  Check logs above for errors" -ForegroundColor $Red
    exit 1
}

# Give it a few more seconds for data seeding to complete
Write-Host "  ⏳ Allowing time for database seeding..." -ForegroundColor $Yellow
Start-Sleep -Seconds 5
Write-Host "  ✓ Database should now be seeded with demo users" -ForegroundColor $Green
Write-Host ""

# ==========================================
# STEP 3: Start Frontend
# ==========================================
Write-Host "[3/5] Starting frontend..." -ForegroundColor $Cyan
Write-Host "  Location: $FrontendPath" -ForegroundColor Gray

if (-not (Test-Path $FrontendPath)) {
    Write-Host "  ✗ Frontend path not found!" -ForegroundColor $Red
    exit 1
}

# Start frontend in background
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev
} -ArgumentList $FrontendPath

Write-Host "  ✓ Frontend started (Job ID: $($frontendJob.Id))" -ForegroundColor $Green
Write-Host "  ⏳ Waiting for frontend to be ready..." -ForegroundColor $Yellow
Write-Host ""

# Wait for frontend
Start-Sleep -Seconds 10

# Check if frontend is up
$frontendConnection = Get-NetTCPConnection -LocalPort $frontendPort -State Listen -ErrorAction SilentlyContinue
if ($frontendConnection) {
    Write-Host "  ✓ Frontend is up on port $frontendPort!" -ForegroundColor $Green
} else {
    Write-Host "  ⚠ Frontend might still be starting up..." -ForegroundColor $Yellow
}

Write-Host ""

# ==========================================
# STEP 4: Display Credentials
# ==========================================
Write-Host "[4/5] System Information" -ForegroundColor $Cyan
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                   🎉  SENTINEL AI IS READY!  🎉                 ║" -ForegroundColor Green
Write-Host "╠════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  🌐 Frontend URL:  http://localhost:3000                       ║" -ForegroundColor Green
Write-Host "║  🔌 Backend URL:   http://localhost:8081                       ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  🔐 Demo Credentials:                                          ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║     Email:    admin@sentinel.ai                                ║" -ForegroundColor Green
Write-Host "║     Password: Admin@123                                        ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║  👥 Other Users:                                               ║" -ForegroundColor Green
Write-Host "║     analyst@sentinel.ai  / Admin@123  (Analyst)               ║" -ForegroundColor Green
Write-Host "║     reviewer@sentinel.ai / Admin@123  (Reviewer)              ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ==========================================
# STEP 5: Open Browser
# ==========================================
Write-Host "[5/5] Opening browser..." -ForegroundColor $Cyan
Start-Sleep -Seconds 2

try {
    Start-Process "http://localhost:3000"
    Write-Host "  ✓ Browser opened" -ForegroundColor $Green
} catch {
    Write-Host "  ⚠ Could not open browser automatically" -ForegroundColor $Yellow
    Write-Host "  Please open: http://localhost:3000" -ForegroundColor $Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 Process IDs:" -ForegroundColor Cyan
Write-Host "     Backend:  Job $($backendJob.Id)" -ForegroundColor Gray
Write-Host "     Frontend: Job $($frontendJob.Id)" -ForegroundColor Gray
Write-Host ""
Write-Host "  🛑 To stop all services, run: .\STOP_SENTINEL.ps1" -ForegroundColor Cyan
Write-Host "     Or press Ctrl+C and type: Stop-Job $($backendJob.Id),$($frontendJob.Id)" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ All systems operational! Ready for testing." -ForegroundColor Green
Write-Host ""

# Keep script running to monitor jobs
Write-Host "Monitoring services (Press Ctrl+C to stop)..." -ForegroundColor Yellow
Write-Host ""

# Show job status
while ($true) {
    Start-Sleep -Seconds 30

    $backendStatus = (Get-Job -Id $backendJob.Id).State
    $frontendStatus = (Get-Job -Id $frontendJob.Id).State

    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Backend: $backendStatus | Frontend: $frontendStatus" -ForegroundColor Gray

    if ($backendStatus -eq "Failed" -or $frontendStatus -eq "Failed") {
        Write-Host "⚠ One or more services failed!" -ForegroundColor Red
        break
    }
}

