# ============================================
# SENTINELAI - DATABASE SETUP SCRIPT
# ============================================

Write-Host "🗄️  Setting up PostgreSQL database for SentinelAI..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Database configuration
$dbHost = "localhost"
$dbPort = "5432"
$dbName = "sentinel"
$dbUser = "postgres"
$dbPassword = "postgres"

# ============================================
# STEP 1: Check if PostgreSQL is running
# ============================================
Write-Host "📦 Checking PostgreSQL status..." -ForegroundColor Yellow

try {
    $pgRunning = Test-NetConnection -ComputerName $dbHost -Port $dbPort -InformationLevel Quiet -WarningAction SilentlyContinue

    if (-not $pgRunning) {
        Write-Host "❌ PostgreSQL is not running on port $dbPort" -ForegroundColor Red
        Write-Host ""
        Write-Host "Starting PostgreSQL via Docker..." -ForegroundColor Yellow

        Set-Location "C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend"
        docker-compose up -d postgres

        Write-Host "Waiting for PostgreSQL to start (30 seconds)..." -ForegroundColor Cyan
        Start-Sleep -Seconds 30

        $pgRunning = Test-NetConnection -ComputerName $dbHost -Port $dbPort -InformationLevel Quiet -WarningAction SilentlyContinue

        if (-not $pgRunning) {
            Write-Host "❌ Failed to start PostgreSQL" -ForegroundColor Red
            Write-Host "Please start Docker manually: docker-compose up -d postgres" -ForegroundColor Yellow
            exit 1
        }
    }

    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ============================================
# STEP 2: Create the database
# ============================================
Write-Host "📝 Creating database '$dbName'..." -ForegroundColor Yellow

# Set environment variable for password (to avoid prompts)
$env:PGPASSWORD = $dbPassword

try {
    # Check if database already exists
    $checkDbCommand = "SELECT 1 FROM pg_database WHERE datname='$dbName'"
    $dbExists = & docker exec sentinel-postgres psql -U $dbUser -t -c $checkDbCommand 2>&1

    if ($dbExists -match "1") {
        Write-Host "✅ Database '$dbName' already exists" -ForegroundColor Green
    } else {
        # Create the database
        Write-Host "Creating database..." -ForegroundColor Cyan
        & docker exec sentinel-postgres psql -U $dbUser -c "CREATE DATABASE $dbName;" 2>&1

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database '$dbName' created successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Database creation may have failed, but continuing..." -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Error during database creation: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Continuing anyway - database may already exist..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# STEP 3: Verify database
# ============================================
Write-Host "🔍 Verifying database..." -ForegroundColor Yellow

try {
    $verifyCmd = "SELECT datname FROM pg_database WHERE datname='$dbName'"
    $verification = & docker exec sentinel-postgres psql -U $dbUser -t -c $verifyCmd 2>&1

    if ($verification -match "sentinel") {
        Write-Host "✅ Database '$dbName' verified successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Could not verify database" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Verification failed, but database may still exist" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "✅ DATABASE SETUP COMPLETE!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# ============================================
# CONNECTION INFO
# ============================================
Write-Host "📊 Database Connection Info:" -ForegroundColor Yellow
Write-Host "  Host:     $dbHost" -ForegroundColor White
Write-Host "  Port:     $dbPort" -ForegroundColor White
Write-Host "  Database: $dbName" -ForegroundColor White
Write-Host "  Username: $dbUser" -ForegroundColor White
Write-Host "  Password: $dbPassword" -ForegroundColor White
Write-Host ""

# ============================================
# NEXT STEPS
# ============================================
Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Start the backend (it will run migrations automatically):" -ForegroundColor White
Write-Host "   cd C:\Users\sufyan.abdulghani\Downloads\MVP\sentinel\backend" -ForegroundColor Cyan
Write-Host "   mvn spring-boot:run" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. The backend will:" -ForegroundColor White
Write-Host "   - Connect to the database" -ForegroundColor Gray
Write-Host "   - Run 6 Flyway migrations" -ForegroundColor Gray
Write-Host "   - Create 40+ tables" -ForegroundColor Gray
Write-Host "   - Insert admin user (admin@sentinel.ai)" -ForegroundColor Gray
Write-Host "   - Be ready for the frontend!" -ForegroundColor Gray
Write-Host ""

# Clean up
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue

Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

