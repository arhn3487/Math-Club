@echo off
REM Math Club Website - Quick Start Script
echo.
echo ========================================
echo  Math Club Website Setup ^& Start
echo ========================================
echo.

REM Check if .env.local exists
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo.
    echo WARNING: Edit .env.local with your Supabase credentials!
    echo.
    pause
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call bun install
    if errorlevel 1 (
        echo Installation failed!
        pause
        exit /b 1
    )
)

REM Start dev server
echo.
echo Starting development server...
echo Open: http://localhost:3000
echo Press Ctrl+C to stop
echo.

call bun run dev
