@echo off
echo 🚀 启动 @ldesign/form 演示项目...
echo.

REM 检查 Node.js 是否安装
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

REM 检查 npm 是否安装
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到 npm，请确保 Node.js 正确安装
    pause
    exit /b 1
)

echo ✅ Node.js 和 npm 已安装

REM 检查并安装原生 JavaScript 项目依赖
echo.
echo 📦 检查原生 JavaScript 项目依赖...
if not exist "vanilla-js-demo\node_modules" (
    echo 📦 安装原生 JavaScript 项目依赖...
    cd vanilla-js-demo
    call npm install
    if errorlevel 1 (
        echo ❌ 原生 JavaScript 项目依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    echo ✅ 原生 JavaScript 项目依赖安装完成
) else (
    echo ✅ 原生 JavaScript 项目依赖已存在
)

REM 检查并安装 Vue 3 项目依赖
echo.
echo 📦 检查 Vue 3 项目依赖...
if not exist "vue-demo\node_modules" (
    echo 📦 安装 Vue 3 项目依赖...
    cd vue-demo
    call npm install
    if errorlevel 1 (
        echo ❌ Vue 3 项目依赖安装失败
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Vue 3 项目依赖安装完成
) else (
    echo ✅ Vue 3 项目依赖已存在
)

echo.
echo ============================================================
echo 🎉 @ldesign/form 演示项目准备完成！
echo ============================================================
echo 📱 原生 JavaScript 演示: http://localhost:3001
echo 🖥️  Vue 3 演示:           http://localhost:3002
echo ============================================================
echo.
echo 💡 提示:
echo    - 两个项目将在不同的命令行窗口中启动
echo    - 关闭命令行窗口即可停止对应的服务器
echo    - 修改代码后会自动热重载
echo ============================================================
echo.

REM 启动原生 JavaScript 项目
echo 🚀 启动原生 JavaScript 演示项目...
start "原生 JavaScript 演示 - @ldesign/form" cmd /k "cd vanilla-js-demo && npm run dev"

REM 等待一下再启动 Vue 项目
timeout /t 2 /nobreak >nul

REM 启动 Vue 3 项目
echo 🚀 启动 Vue 3 演示项目...
start "Vue 3 演示 - @ldesign/form" cmd /k "cd vue-demo && npm run dev"

echo.
echo ✅ 所有演示项目已启动！
echo 💡 请查看新打开的命令行窗口了解启动状态
echo.
pause
