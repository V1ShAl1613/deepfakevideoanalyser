@echo off
cd /d "%~dp0"

echo ==========================================================
echo   Deepfake Video Forensics - Auto Launcher
echo ==========================================================

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found on your system PATH!
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node run.js
if %ERRORLEVEL% neq 0 (
    pause
)

