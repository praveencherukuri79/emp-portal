# Employee Portal - Development Watch Mode Script
# This script starts both backend and frontend servers in watch mode

Write-Host "🚀 Employee Portal - Development Watch Mode" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Display server information
Write-Host "📊 Backend Server:" -ForegroundColor Blue
Write-Host "   URL: http://localhost:3000" -ForegroundColor White
Write-Host "   API: http://localhost:3000/api" -ForegroundColor White
Write-Host ""

Write-Host "🎨 Frontend Server:" -ForegroundColor Magenta  
Write-Host "   URL: http://localhost:4200" -ForegroundColor White
Write-Host "   Auto-opens in browser" -ForegroundColor White
Write-Host ""

Write-Host "🔄 Features:" -ForegroundColor Yellow
Write-Host "   • Auto-restart on file changes" -ForegroundColor White
Write-Host "   • TypeScript compilation" -ForegroundColor White
Write-Host "   • Hot reload for frontend" -ForegroundColor White
Write-Host "   • Colored console output" -ForegroundColor White
Write-Host ""

Write-Host "🛑 To stop servers: Press Ctrl+C" -ForegroundColor Red
Write-Host ""

# Check if required packages are installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Cyan

try {
    $null = npm list concurrently 2>$null
    Write-Host "✅ concurrently is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Installing concurrently..." -ForegroundColor Yellow
    npm install concurrently --save-dev
}

try {
    $null = npm list nodemon 2>$null
    Write-Host "✅ nodemon is installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Installing nodemon..." -ForegroundColor Yellow
    npm install nodemon --save-dev
}

Write-Host ""
Write-Host "🎯 Starting development servers..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Start the watch mode
npm run watch