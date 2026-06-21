# ============================================
# SENTINELAI - STOP ALL SERVICES
# ============================================

Write-Host "🛑 Stopping SentinelAI Platform..." -ForegroundColor Yellow
Write-Host ""

$ErrorActionPreference = "Continue"

# ============================================
# Stop Node.js processes (Frontend)
# ============================================
Write-Host "Stopping Frontend..." -ForegroundColor Cyan
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*sentinel-frontend*"
} | Stop-Process -Force
Write-Host "✅ Frontend stopped" -ForegroundColor Green
Write-Host ""

# ============================================
# Stop Java processes (Backend)
# ============================================
Write-Host "Stopping Backend..." -ForegroundColor Cyan
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*spring-boot*" -or $_.CommandLine -like "*sentinel*"
} | Stop-Process -Force
Write-Host "✅ Backend stopped" -ForegroundColor Green
Write-Host ""

# ============================================
# Stop Docker containers
# ============================================
Write-Host "Stopping Docker containers..." -ForegroundColor Cyan
Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend"
docker-compose down

Write-Host "✅ Docker containers stopped" -ForegroundColor Green
Write-Host ""

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ All services stopped!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start again, run: .\start-all.ps1" -ForegroundColor White
Write-Host ""

