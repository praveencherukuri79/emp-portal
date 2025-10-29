@echo off
echo 🚀 Starting Employee Portal Development Servers in Watch Mode...
echo.
echo 📊 Backend will run on: http://localhost:3000
echo 🎨 Frontend will run on: http://localhost:4200
echo.
echo 🔄 Both servers will automatically restart on file changes
echo 🛑 Press Ctrl+C to stop all servers
echo.

REM Check if concurrently is installed
npm list concurrently >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Installing concurrently for running multiple servers...
    npm install concurrently --save-dev
)

REM Start both servers in watch mode
npm run watch