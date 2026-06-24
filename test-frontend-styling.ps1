Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  SENTINEL FRONTEND - STYLING FIX COMPLETE!  " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ CRITICAL FIXES APPLIED:" -ForegroundColor Green
Write-Host "  1. Tailwind now scans src/ folder (styles work!)" -ForegroundColor White
Write-Host "  2. Light theme applied (professional look)" -ForegroundColor White
Write-Host "  3. Clean design matching ReconIQ quality" -ForegroundColor White
Write-Host "  4. All pages updated with proper styling" -ForegroundColor White
Write-Host ""

Write-Host "🎨 NEW DESIGN:" -ForegroundColor Yellow
Write-Host "  • Light gray background (bg-gray-50)" -ForegroundColor White
Write-Host "  • Dark sidebar (bg-gray-900)" -ForegroundColor White
Write-Host "  • White header and cards" -ForegroundColor White
Write-Host "  • Cyan/Purple brand colors" -ForegroundColor White
Write-Host "  • Clean, professional aesthetic" -ForegroundColor White
Write-Host ""

# Kill any existing node processes
Write-Host "[1/3] Stopping existing dev server..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Navigate to frontend directory
Write-Host "[2/3] Starting fresh dev server..." -ForegroundColor Yellow
Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend"

# Start dev server in new window
Write-Host "[3/3] Launching browser..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\sentinel-frontend'; Write-Host 'Starting Sentinel Frontend...' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 8

# Open browser
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "         APPLICATION LAUNCHED!               " -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 URL: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📝 Demo Login:" -ForegroundColor Yellow
Write-Host "   Email:    admin@sentinel.ai" -ForegroundColor White
Write-Host "   Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "✨ The frontend now has:" -ForegroundColor Cyan
Write-Host "   ✅ Professional light theme" -ForegroundColor Green
Write-Host "   ✅ Clean, modern design" -ForegroundColor Green
Write-Host "   ✅ Proper styling on all pages" -ForegroundColor Green
Write-Host "   ✅ Matching ReconIQ quality" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

