# Test Frontend Endpoints

Write-Host "🧪 Testing SentinelAI Frontend..." -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$timeout = 5

function Test-Endpoint {
    param(
        [string]$url,
        [string]$name
    )

    try {
        Write-Host "Testing $name... " -NoNewline
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec $timeout -ErrorAction Stop

        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 307 -or $response.StatusCode -eq 308) {
            Write-Host "✅ OK ($($response.StatusCode))" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  Unexpected status: $($response.StatusCode)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ FAILED - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "Waiting for server to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host ""

# Test endpoints
$endpoints = @(
    @{ Url = "$baseUrl"; Name = "Root Page" },
    @{ Url = "$baseUrl/login"; Name = "Login Page" },
    @{ Url = "$baseUrl/dashboard"; Name = "Dashboard Page" }
)

$allPassed = $true
foreach ($endpoint in $endpoints) {
    $result = Test-Endpoint -url $endpoint.Url -name $endpoint.Name
    if (-not $result) {
        $allPassed = $false
    }
}

Write-Host ""
if ($allPassed) {
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Frontend is ready!" -ForegroundColor Green
    Write-Host "Go to: http://localhost:3000/login" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Some tests failed. Check the dev server logs." -ForegroundColor Yellow
}

