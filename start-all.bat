@echo off
setlocal enabledelayedexpansion

REM HAi Wallet - Complete System Startup Script (Windows)
REM This script starts all three components: NLP Server, Backend API, and Frontend

echo 🚀 Starting HAi Wallet System...
echo ==================================

REM Check if we're in the right directory
if not exist "NLP" (
    echo ❌ Error: Please run this script from the HAi Wallet root directory
    echo    Current directory: %CD%
    echo    Expected structure: .\NLP, .\apps\api, .\apps\web
    pause
    exit /b 1
)

if not exist "apps" (
    echo ❌ Error: Please run this script from the HAi Wallet root directory
    echo    Current directory: %CD%
    echo    Expected structure: .\NLP, .\apps\api, .\apps\web
    pause
    exit /b 1
)

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if virtual environment exists
if not exist "NLP\venv" (
    echo ⚠️  NLP virtual environment not found. Creating...
    cd NLP
    python -m venv venv
    call venv\Scripts\activate.bat
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
    cd ..
)

REM Start NLP Server
echo 🤖 Starting NLP Server...
cd NLP
call venv\Scripts\activate.bat
start "NLP Server" python nlp_service.py
cd ..
echo ✅ NLP Server started

REM Wait a moment for NLP server to initialize
timeout /t 3 /nobreak >nul

REM Start Backend API Server
echo 🔧 Starting Backend API Server...
cd apps\api

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
)

start "Backend API" npm run dev
cd ..\..
echo ✅ Backend API started

REM Wait a moment for API server to initialize
timeout /t 3 /nobreak >nul

REM Start Frontend Web App
echo 🌐 Starting Frontend Web App...
cd apps\web

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing frontend dependencies...
    npm install
)

start "Frontend" npm run dev
cd ..\..
echo ✅ Frontend started

REM Wait a moment for frontend to initialize
timeout /t 3 /nobreak >nul

echo.
echo 🎉 HAi Wallet System Successfully Started!
echo ==========================================
echo.
echo 📱 Frontend Web App: http://localhost:8080
echo 🔧 Backend API:      http://localhost:3001
echo 🤖 NLP Service:      http://localhost:8000
echo.
echo 💡 Quick Test Commands:
echo    • Test NLP:    curl -X POST http://localhost:8000/process_prompt -H "Content-Type: application/json" -d "{\"prompt\": \"Send 0.1 ETH to Bob\"}"
echo    • Test API:    curl http://localhost:3001/api/relay/chains
echo    • Open App:    start http://localhost:8080
echo.
echo 🛑 Close the command windows to stop the services
echo.

REM Open the frontend in default browser
start http://localhost:8080

pause 