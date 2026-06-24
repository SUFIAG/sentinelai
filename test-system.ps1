# SentinelAI System Status Check

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  🛡️  SentinelAI - System Status Check" -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

# Check Backend
Write-Host "🔍 Checking Backend (Port 8081)..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8081/actuator/health" -TimeoutSec 5
    Write-Host "✅ Backend Status: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Frontend
Write-Host "`n🔍 Checking Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Frontend Status: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Login
Write-Host "`n🔐 Testing Login API..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@sentinel.ai"
        password = "Admin@123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"

    if ($loginResponse.success -and $loginResponse.data.token) {
        Write-Host "✅ Login Successful!" -ForegroundColor Green
        Write-Host "   User: $($loginResponse.data.user.email)" -ForegroundColor Cyan
        Write-Host "   Role: $($loginResponse.data.user.role)" -ForegroundColor Cyan
        Write-Host "   Token: $($loginResponse.data.token.Substring(0, 30))..." -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Login returned unexpected response" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Login Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  📊 Summary" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:8081" -ForegroundColor White
Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "`n📝 Login Credentials:" -ForegroundColor Yellow
Write-Host "   Email:    admin@sentinel.ai" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host ">> Open browser: http://localhost:3000/login" -ForegroundColor Green
Write-Host ""



