#!/usr/bin/env pwsh

Write-Host "🚀 Math Club Website Setup & Start" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "`n⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "📋 Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
    Write-Host "`n⚠️  IMPORTANT: Edit .env.local with your Supabase credentials!" -ForegroundColor Red
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
    Write-Host "   - SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
    bun install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Installation failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Start dev server
Write-Host "`n🌐 Starting development server..." -ForegroundColor Cyan
Write-Host "📍 Open: http://localhost:3000" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop the server" -ForegroundColor Gray

bun run dev
