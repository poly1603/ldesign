@echo off
chcp 65001 >nul
title Claude ���ø��¹���
echo.
echo ========================================
echo     Claude ���ø��¹���
echo ========================================
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0update-claude-config.ps1"
echo.
pause
