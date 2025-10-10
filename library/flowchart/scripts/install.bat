@echo off
REM ApprovalFlow 安装脚本（Windows）
REM 用途：自动安装项目依赖

echo ================================
echo   ApprovalFlow 安装脚本
echo ================================
echo.

REM 检查 Node.js
echo 检查 Node.js...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未找到 Node.js
    echo 请访问 https://nodejs.org/ 下载并安装 Node.js
    pause
    exit /b 1
)

node -v
echo ✅ Node.js 已安装
echo.

REM 检查 npm
echo 检查 npm...
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 错误: 未找到 npm
    pause
    exit /b 1
)

npm -v
echo ✅ npm 已安装
echo.

REM 清理旧的安装
echo 清理旧的安装...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
echo ✅ 清理完成
echo.

REM 设置镜像
echo 是否使用淘宝镜像？(y/n)
set /p USE_MIRROR=

if /i "%USE_MIRROR%"=="y" (
    echo 设置淘宝镜像...
    npm config set registry https://registry.npmmirror.com
    echo ✅ 镜像设置完成
)
echo.

REM 安装依赖
echo 安装依赖...
echo 这可能需要几分钟时间，请耐心等待...
echo.

npm install --legacy-peer-deps
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 依赖安装成功！
    echo.
    echo 可用命令：
    echo   npm run build       - 构建项目
    echo   npm run docs:dev    - 启动文档
    echo   npm run test        - 运行测试
    echo.
) else (
    echo.
    echo ❌ 依赖安装失败
    echo.
    echo 请尝试以下方法：
    echo 1. 检查网络连接
    echo 2. 清理 npm 缓存: npm cache clean --force
    echo 3. 使用淘宝镜像
    echo 4. 查看 BUILD_GUIDE.md 了解更多信息
    echo.
    pause
    exit /b 1
)

pause
