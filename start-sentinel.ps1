# Sentinel MVP - Complete Startup Script
# This script starts both backend and frontend servers

Write-Host "🚀 Starting Sentinel MVP..." -ForegroundColor Cyan
Write-Host ""

# Check if backend directory exists
$backendPath = "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend"
$frontendPath = "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend directory not found: $frontendPath" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "📦 Starting Backend (Port 8081)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Sentinel Backend...' -ForegroundColor Green; mvn spring-boot:run"

Start-Sleep -Seconds 2

# Start Frontend
Write-Host "🎨 Starting Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting Sentinel Frontend...' -ForegroundColor Green; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows..." -ForegroundColor Green
Write-Host ""
Write-Host "📋 Access Information:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:8081" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Demo Login Credentials:" -ForegroundColor Cyan
Write-Host "   Email:    admin@sentinel.ai" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "⏳ Please wait 30-60 seconds for both servers to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to open browser..." -ForegroundColor Green
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "Sentinel MVP is now running!" -ForegroundColor Green
Write-Host "Close this window when done (servers will keep running)" -ForegroundColor Gray

