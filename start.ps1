#!/usr/bin/env pwsh

# Math Club Website - Complete Setup & Start Script
# This script handles all setup and starts the development server

$ErrorActionPreference = "Continue"

# Colors
$header = "Cyan"
$success = "Green"
$warning = "Yellow"
$error_color = "Red"
$info = "Gray"

# ==================== DISPLAY HEADER ====================
Write-Host ""
Write-Host "========================================" -ForegroundColor $header
Write-Host "  MATH CLUB WEBSITE - COMPLETE SETUP" -ForegroundColor $header
Write-Host "========================================" -ForegroundColor $header
Write-Host ""
Write-Host "This script will:" -ForegroundColor $header
Write-Host "  1. Check prerequisites (Node.js, PostgreSQL)" -ForegroundColor $info
Write-Host "  2. Install npm dependencies" -ForegroundColor $info
Write-Host "  3. Configure environment variables" -ForegroundColor $info
Write-Host "  4. Setup PostgreSQL database" -ForegroundColor $info
Write-Host "  5. Load database schema" -ForegroundColor $info
Write-Host "  6. Start development server" -ForegroundColor $info
Write-Host ""
Write-Host "========================================" -ForegroundColor $header
Write-Host ""

# ==================== CHECK PREREQUISITES ====================
Write-Host "[STEP 1/6] Checking prerequisites..." -ForegroundColor $header
Write-Host ""

# Check Node.js
try {
    $node_version = node --version 2>$null
    Write-Host "[OK] Node.js found: $node_version" -ForegroundColor $success
} catch {
    Write-Host "ERROR: Node.js is not installed or not in PATH" -ForegroundColor $error_color
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor $warning
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check npm
try {
    $npm_version = npm --version 2>$null
    Write-Host "[OK] npm found: $npm_version" -ForegroundColor $success
} catch {
    Write-Host "ERROR: npm is not installed or not in PATH" -ForegroundColor $error_color
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check PostgreSQL (optional - can be set up manually)
try {
    $psql_version = psql --version 2>$null
    $POSTGRES_FOUND = $true
    Write-Host "[OK] PostgreSQL found: $psql_version" -ForegroundColor $success
} catch {
    Write-Host "WARNING: PostgreSQL psql command not found in PATH" -ForegroundColor $warning
    Write-Host "PostgreSQL can be added to PATH later" -ForegroundColor $warning
    $POSTGRES_FOUND = $false
}

Write-Host ""
Write-Host "[STEP 1/6] ✓ All prerequisites installed" -ForegroundColor $success
Write-Host ""

# ==================== CREATE ENVIRONMENT FILE ====================
Write-Host "[STEP 2/6] Configuring environment variables..." -ForegroundColor $header
Write-Host ""

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.local.example") {
        Write-Host "Copying .env.local.example to .env.local..." -ForegroundColor $info
        Copy-Item ".env.local.example" ".env.local" -Force | Out-Null
        Write-Host "[OK] Created .env.local" -ForegroundColor $success
    } else {
        Write-Host "Creating .env.local with default values..." -ForegroundColor $info
        $env_content = @"
# PostgreSQL Database Configuration
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=math_club

# JWT Secret - CHANGE THIS IN PRODUCTION
JWT_SECRET=change-this-secret-in-production

# Supabase Configuration (for image storage)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Node Environment
NODE_ENV=development
"@
        Set-Content -Path ".env.local" -Value $env_content
        Write-Host "[OK] Created .env.local with default values" -ForegroundColor $success
    }
    Write-Host ""
    Write-Host "IMPORTANT: Edit .env.local with your database credentials:" -ForegroundColor $warning
    Write-Host "  - DB_PASSWORD: Your PostgreSQL password" -ForegroundColor $info
    Write-Host "  - JWT_SECRET: Change to a random string for production" -ForegroundColor $info
    Write-Host ""
} else {
    Write-Host "[OK] .env.local already exists" -ForegroundColor $success
}

Write-Host "[STEP 2/6] ✓ Environment configured" -ForegroundColor $success
Write-Host ""

# ==================== INSTALL DEPENDENCIES ====================
Write-Host "[STEP 3/6] Installing npm dependencies..." -ForegroundColor $header
Write-Host ""

if (-not (Test-Path "node_modules")) {
    Write-Host "Running: npm install" -ForegroundColor $info
    Write-Host "This may take a few minutes..." -ForegroundColor $info
    Write-Host ""
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "ERROR: npm install failed" -ForegroundColor $error_color
        Write-Host "Try running: npm install --legacy-peer-deps" -ForegroundColor $warning
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
    Write-Host "[OK] Dependencies installed" -ForegroundColor $success
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor $success
    Write-Host "Run 'npm install' if you need to update packages" -ForegroundColor $info
}

Write-Host ""
Write-Host "[STEP 3/6] ✓ Dependencies ready" -ForegroundColor $success
Write-Host ""

REM ==================== SETUP DATABASE ====================
Write-Host "[STEP 4/6] Setting up PostgreSQL database..." -ForegroundColor $header
Write-Host ""

if (-not $POSTGRES_FOUND) {
    Write-Host "WARNING: PostgreSQL not available" -ForegroundColor $warning
    Write-Host "Database setup will be skipped" -ForegroundColor $warning
    Write-Host ""
    Write-Host "You can set up PostgreSQL later:" -ForegroundColor $warning
    Write-Host "  1. Install PostgreSQL from: https://www.postgresql.org/download/windows/" -ForegroundColor $info
    Write-Host "  2. Add to system PATH: C:\Program Files\PostgreSQL\15\bin" -ForegroundColor $info
    Write-Host "  3. Run: psql -U postgres -d math_club -f database.sql" -ForegroundColor $info
    Write-Host ""
    Write-Host "For now, the app will start but won't have a working database" -ForegroundColor $warning
    Write-Host ""
} else {
    # Create database
    Write-Host "Checking if database 'math_club' exists..." -ForegroundColor $info
    $db_exists = psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'math_club'" 2>$null | Select-String "1"

    if ($null -eq $db_exists) {
        Write-Host "Creating database 'math_club'..." -ForegroundColor $info
        psql -U postgres -c "CREATE DATABASE math_club;" 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "ERROR: Failed to create database" -ForegroundColor $error_color
            Write-Host "This usually means:" -ForegroundColor $warning
            Write-Host "  1. PostgreSQL password is wrong (default is 'postgres')" -ForegroundColor $info
            Write-Host "  2. PostgreSQL service is not running" -ForegroundColor $info
            Write-Host "  3. Connection issue" -ForegroundColor $info
            Write-Host ""
            Write-Host "Please verify:" -ForegroundColor $warning
            Write-Host "  - PostgreSQL is running" -ForegroundColor $info
            Write-Host "  - Your password is correct in .env.local" -ForegroundColor $info
            Write-Host "  - You can connect: psql -U postgres" -ForegroundColor $info
            Write-Host ""
            Read-Host "Press Enter to exit"
            exit 1
        }
        Write-Host "[OK] Database 'math_club' created" -ForegroundColor $success
    } else {
        Write-Host "[OK] Database 'math_club' already exists" -ForegroundColor $success
    }
}

Write-Host ""
Write-Host "[STEP 4/6] ✓ Database ready" -ForegroundColor $success
Write-Host ""

# ==================== LOAD SCHEMA ====================
Write-Host "[STEP 5/6] Loading database schema..." -ForegroundColor $header
Write-Host ""

if (Test-Path "database.sql") {
    Write-Host "Loading schema from database.sql..." -ForegroundColor $info
    psql -U postgres -d math_club -f database.sql 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "WARNING: Schema load had some issues" -ForegroundColor $warning
        Write-Host "Try manual load with: psql -U postgres -d math_club -f database.sql" -ForegroundColor $info
    } else {
        Write-Host "[OK] Schema loaded successfully" -ForegroundColor $success
    }
} else {
    Write-Host "WARNING: database.sql not found" -ForegroundColor $warning
    Write-Host "Schema must be loaded manually with: psql -U postgres -d math_club -f database.sql" -ForegroundColor $info
}

# Verify tables exist
Write-Host "Verifying database setup..." -ForegroundColor $info
$table_exists = psql -U postgres -d math_club -tc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users')" 2>$null | Select-String "t"

if ($null -eq $table_exists) {
    Write-Host "WARNING: Users table not found" -ForegroundColor $warning
    Write-Host "Run: psql -U postgres -d math_club -f database.sql" -ForegroundColor $info
} else {
    Write-Host "[OK] Users table verified" -ForegroundColor $success
}

Write-Host ""
Write-Host "[STEP 5/6] ✓ Database schema loaded" -ForegroundColor $success
Write-Host ""

# ==================== FINAL SUMMARY ====================
Write-Host "========================================" -ForegroundColor $header
Write-Host "  SETUP COMPLETE" -ForegroundColor $header
Write-Host "========================================" -ForegroundColor $header
Write-Host ""
Write-Host "Demo Credentials:" -ForegroundColor $info
Write-Host "  Student: user_id=student_001, password=password123" -ForegroundColor $success
Write-Host "  Admin:   user_id=admin_001, password=password123" -ForegroundColor $success
Write-Host ""
Write-Host "Database Information:" -ForegroundColor $info
Write-Host "  Host: localhost:5432" -ForegroundColor $success
Write-Host "  Database: math_club" -ForegroundColor $success
Write-Host "  User: postgres" -ForegroundColor $success
Write-Host ""
Write-Host "[STEP 6/6] Starting development server..." -ForegroundColor $header
Write-Host ""
Write-Host "========================================" -ForegroundColor $header
Write-Host "  Development Server Starting..." -ForegroundColor $header
Write-Host "========================================" -ForegroundColor $header
Write-Host ""
Write-Host "Server will be available at: http://localhost:3000" -ForegroundColor $success
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor $info
Write-Host ""

# Start dev server
npm run dev

# If dev server exits
Write-Host ""
Write-Host "Development server has stopped." -ForegroundColor $info
Write-Host ""
Read-Host "Press Enter to exit"
exit 0
