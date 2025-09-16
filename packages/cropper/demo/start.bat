@echo off
echo ========================================
echo   @ldesign/cropper Demo Launcher
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies...
    pnpm install
    echo.
)

echo [INFO] Starting development server...
echo [INFO] Demo will be available at: http://localhost:3000
echo [INFO] Press Ctrl+C to stop the server
echo.
echo ========================================
echo   Demo Features:
echo   - Native JavaScript usage
echo   - Vue Component usage
echo   - Vue Hook usage
echo   - Vue Directive usage
echo ========================================
echo.

pnpm run dev

pause
