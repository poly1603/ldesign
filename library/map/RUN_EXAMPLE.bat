@echo off
echo ========================================
echo  Map Renderer v2.0 - 示例启动脚本
echo ========================================
echo.

REM 检查是否在正确的目录
if not exist "package.json" (
    echo [错误] 请在项目根目录运行此脚本
    pause
    exit /b 1
)

echo [1/4] 检查 Node.js...
node --version
if errorlevel 1 (
    echo [错误] Node.js 未安装
    pause
    exit /b 1
)
echo.

echo [2/4] 构建主库...
call npm run build
if errorlevel 1 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo.

echo [3/4] 安装示例依赖...
cd example
call npm install
if errorlevel 1 (
    echo [错误] 依赖安装失败
    cd ..
    pause
    exit /b 1
)
echo.

echo [4/4] 启动开发服务器...
echo.
echo ========================================
echo  服务器将在 http://localhost:3000 启动
echo  按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run dev








