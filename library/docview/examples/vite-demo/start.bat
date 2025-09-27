@echo off
echo Starting LDesign DocView Demo...
echo.

REM 检查是否安装了 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM 检查是否存在 node_modules
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo Error: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo Starting development server...
echo Open http://localhost:3000 in your browser
echo Press Ctrl+C to stop the server
echo.

npm run dev
