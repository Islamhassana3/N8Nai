@echo off
REM Cross-platform preview launch script for n8n frontend
REM Automatically installs dependencies and launches the development server

echo.
echo 🚀 n8n Frontend Preview Launcher
echo ==================================
echo.

REM Navigate to the frontend directory
set "FRONTEND_DIR=packages\frontend\editor-ui"

if not exist "%FRONTEND_DIR%" (
    echo ❌ Error: Frontend directory not found at %FRONTEND_DIR%
    exit /b 1
)

cd "%FRONTEND_DIR%"

REM Check if dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies (first-time setup)...
    call pnpm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🌐 Starting development server...
echo    The preview will open automatically at http://localhost:8080
echo.
echo    Press Ctrl+C to stop the server
echo.

REM Start the development server and open browser
start "" "http://localhost:8080"
call pnpm dev
