@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 开始测试所有包的打包
echo ========================================
echo.

set "SUCCESS_COUNT=0"
set "FAIL_COUNT=0"
set "FAILED_PACKAGES="

:: 定义包列表
set PACKAGES=shared logger validator storage file color size icons template animation auth cache crypto device engine http i18n menu notification permission router store tabs websocket api

for %%P in (%PACKAGES%) do (
    echo.
    echo [%%P] 开始测试...
    
    cd /d "D:\WorkBench\ldesign\packages\%%P" 2>nul
    if errorlevel 1 (
        echo [%%P] ❌ 包不存在
        set /a "FAIL_COUNT+=1"
        set "FAILED_PACKAGES=!FAILED_PACKAGES! %%P(不存在)"
    ) else (
        pnpm run build >nul 2>&1
        if errorlevel 1 (
            echo [%%P] ❌ 构建失败
            set /a "FAIL_COUNT+=1"
            set "FAILED_PACKAGES=!FAILED_PACKAGES! %%P"
        ) else (
            echo [%%P] ✅ 构建成功
            set /a "SUCCESS_COUNT+=1"
        )
    )
)

echo.
echo ========================================
echo 测试汇总
echo ========================================
echo ✅ 成功: !SUCCESS_COUNT! 个
echo ❌ 失败: !FAIL_COUNT! 个
if not "!FAILED_PACKAGES!"=="" (
    echo.
    echo 失败的包:!FAILED_PACKAGES!
)
echo.

endlocal
