@echo off
chcp 65001 >nul
title Claude 配置更新工具
echo.
echo ========================================
echo     Claude 配置更新工具
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update-claude-config.ps1"
echo.
pause
