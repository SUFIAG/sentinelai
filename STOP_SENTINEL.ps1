# ==========================================
# SENTINEL AI - Stop Script
# ==========================================

Write-Host ""
Write-Host "🛑 Stopping Sentinel AI services..." -ForegroundColor Red
Write-Host ""

# Stop all background jobs
$jobs = Get-Job | Where-Object { $_.Name -like "*spring-boot*" -or $_.Name -like "*npm*" }
if ($jobs) {
    Write-Host "Stopping background jobs..." -ForegroundColor Yellow
    $jobs | Stop-Job -PassThru | Remove-Job
    Write-Host "✓ Background jobs stopped" -ForegroundColor Green
}

# Kill processes on ports
$ports = @(8081, 3000)

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "Stopping process on port $port..." -ForegroundColor Yellow
        $processIds = $connections.OwningProcess | Select-Object -Unique
        foreach ($pid in $processIds) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  ✓ Stopped process $pid on port $port" -ForegroundColor Green
            } catch {
                Write-Host "  ⚠ Could not stop process $pid" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host ""
Write-Host "✅ All Sentinel services  stopped" -ForegroundColor Green
Write-Host ""

