@echo off
setlocal enabledelayedexpansion
title Math Club Website - Setup & Start

color 0A
cls

echo.
echo ========================================
echo  MATH CLUB WEBSITE - SETUP ^& START
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js installed

REM Create environment file
if not exist ".env.local" (
    echo Creating .env.local...
    (
        echo DB_USER=postgres
        echo DB_PASSWORD=postgres
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=math_club
        echo JWT_SECRET=your-secret-key-change-in-production
        echo NEXT_PUBLIC_SUPABASE_URL=your-url
        echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
        echo NODE_ENV=development
    ) > .env.local
    echo [OK] .env.local created
)

REM Install dependencies
echo Installing npm packages...
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo [OK] npm packages installed

echo.
echo ========================================
echo  STARTING DEVELOPMENT SERVER
echo ========================================
echo.
echo Website: http://localhost:3000
echo.
echo Demo Credentials:
echo   Student ID: student_001, Password: password123
echo   Admin ID: admin_001, Password: password123
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the development server
call npm run dev
