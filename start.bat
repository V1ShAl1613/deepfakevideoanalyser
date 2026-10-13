@echo off
setlocal
cd /d "%~dp0"

echo ==========================================================
echo   Deepfake Video Forensics - Auto Launcher
echo ==========================================================

:: 1. Verify Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please download and install Node.js (v18+) from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: 2. Verify Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    where py >nul 2>nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Python 3 is not found on your system PATH!
        echo Please download and install Python 3.10+ from: https://www.python.org/
        echo (Ensure you check "Add python.exe to PATH" during installation)
        echo.
        pause
        exit /b 1
    )
)

echo [launcher] Starting Deepfake Forensics environment...
node run.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo [launcher] Process exited with error code %ERRORLEVEL%.
    pause
)

