# Start Frontend with visible output

Write-Host "🚀 Starting SentinelAI Frontend..." -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend"

Write-Host "Cleaning build cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Watch the output below for any errors:" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Start in foreground so we can see output
npm run dev

