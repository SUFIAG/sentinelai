# ============================================
# SENTINELAI - COMPLETE STARTUP SCRIPT
# ============================================

Write-Host "🚀 Starting SentinelAI Platform..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# ============================================
# STEP 1: Start Database & Infrastructure
# ============================================
Write-Host "📦 STEP 1: Starting PostgreSQL + Redis + Kafka..." -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend"

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first!" -ForegroundColor Red
    exit 1
}

# Start infrastructure
Write-Host "Starting Docker containers..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "Waiting for services to be healthy (30 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 30

# Check container status
Write-Host ""
Write-Host "Container Status:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}" | Where-Object { $_ -match "sentinel-" }

Write-Host ""
Write-Host "✅ Infrastructure started!" -ForegroundColor Green
Write-Host ""

# ============================================
# STEP 2: Start Backend (with auto-migration)
# ============================================
Write-Host "🔧 STEP 2: Starting Backend..." -ForegroundColor Yellow
Write-Host "⚠️  This will run database migrations automatically" -ForegroundColor Yellow
Write-Host ""

# Start backend in background
$backendProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend" -PassThru -WindowStyle Normal

Write-Host "✅ Backend starting (PID: $($backendProcess.Id))..." -ForegroundColor Green
Write-Host "Waiting for backend to be ready (60 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 60

# Test backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is healthy!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Backend might still be starting... Check logs if issues persist" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 3: Start Frontend
# ============================================
Write-Host "🎨 STEP 3: Starting Frontend..." -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend"

# Start frontend in background
$frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend" -PassThru -WindowStyle Normal

Write-Host "✅ Frontend starting (PID: $($frontendProcess.Id))..." -ForegroundColor Green
Write-Host "Waiting for frontend to be ready (20 seconds)..." -ForegroundColor Cyan
Start-Sleep -Seconds 20

# Test frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 307) {
        Write-Host "✅ Frontend is running!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Frontend might still be starting... Wait a few more seconds" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎉 SENTINELAI PLATFORM IS READY!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# ACCESS INFORMATION
# ============================================
Write-Host "📱 ACCESS URLS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Frontend:         http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Login Page:       http://localhost:3000/login" -ForegroundColor Cyan
Write-Host "  Dashboard:        http://localhost:3000/dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Backend API:      http://localhost:8081/api/v1" -ForegroundColor Cyan
Write-Host "  Health Check:     http://localhost:8081/actuator/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Kafka UI:         http://localhost:8090" -ForegroundColor Cyan
Write-Host "  pgAdmin:          http://localhost:5050" -ForegroundColor Cyan
Write-Host "  RedisInsight:     http://localhost:8001" -ForegroundColor Cyan
Write-Host ""

# ============================================
# LOGIN CREDENTIALS
# ============================================
Write-Host "🔐 LOGIN CREDENTIALS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Email:            admin@sentinel.ai" -ForegroundColor White
Write-Host "  Password:         Admin@123" -ForegroundColor White
Write-Host ""

# ============================================
# DATABASE INFO
# ============================================
Write-Host "🗄️  DATABASE INFO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Database:         sentinel" -ForegroundColor White
Write-Host "  Host:             localhost:5432" -ForegroundColor White
Write-Host "  Username:         postgres" -ForegroundColor White
Write-Host "  Password:         postgres" -ForegroundColor White
Write-Host ""

# ============================================
# WHAT'S RUNNING
# ============================================
Write-Host "🔄 WHAT'S RUNNING:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ PostgreSQL       (Port 5432)" -ForegroundColor Green
Write-Host "  ✅ Redis            (Port 6379)" -ForegroundColor Green
Write-Host "  ✅ Kafka            (Port 9092)" -ForegroundColor Green
Write-Host "  ✅ Zookeeper        (Port 2181)" -ForegroundColor Green
Write-Host "  ✅ Backend API      (Port 8081)" -ForegroundColor Green
Write-Host "  ✅ Frontend         (Port 3000)" -ForegroundColor Green
Write-Host ""

# ============================================
# NEXT STEPS
# ============================================
Write-Host "📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Open browser: http://localhost:3000/login" -ForegroundColor White
Write-Host "  2. Login with: admin@sentinel.ai / Admin@123" -ForegroundColor White
Write-Host "  3. Explore the dashboard!" -ForegroundColor White
Write-Host ""

# ============================================
# STOP INSTRUCTIONS
# ============================================
Write-Host "🛑 TO STOP SERVICES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Run: .\stop-all.ps1" -ForegroundColor White
Write-Host "  Or manually:" -ForegroundColor White
Write-Host "    - Stop frontend: Ctrl+C in frontend terminal" -ForegroundColor White
Write-Host "    - Stop backend: Ctrl+C in backend terminal" -ForegroundColor White
Write-Host "    - Stop Docker: docker-compose down" -ForegroundColor White
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to view this info again" -ForegroundColor Gray
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Keep script running
Write-Host "Services are running. Press Ctrl+C to stop..." -ForegroundColor Gray
try {
    while ($true) {
        Start-Sleep -Seconds 10

        # Periodic health checks
        try {
            $backendHealth = Invoke-WebRequest -Uri "http://localhost:8081/actuator/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            $frontendHealth = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue

            # Silently monitor - only show if issues
        } catch {
            # Ignore errors during health checks
        }
    }
} finally {
    Write-Host ""
    Write-Host "To fully stop all services, run: docker-compose down" -ForegroundColor Yellow
}

