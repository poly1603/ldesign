@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set GITHUB_USERNAME=poly1603
set GITHUB_TOKEN=%GITHUB_TOKEN%

echo 🚀 开始设置 GitHub 仓库...
echo.

:: 处理 ldesign-git
echo ============================================================
echo 处理包: @ldesign/git
echo ============================================================
echo.

echo 📦 创建 GitHub 仓库: ldesign-git
curl -H "Authorization: token %GITHUB_TOKEN%" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\":\"ldesign-git\",\"description\":\"LDesign Git工具 - Git操作、仓库管理、提交分析\",\"private\":false}"
timeout /t 2 /nobreak >nul

echo.
echo 🔧 初始化 Git 仓库: tools/git
cd tools\git
if not exist .git (
    git init
)
git add .
git commit -m "feat: initial commit for ldesign-git" 2>nul
git remote remove origin 2>nul
git remote add origin https://%GITHUB_TOKEN%@github.com/%GITHUB_USERNAME%/ldesign-git.git
git branch -M main
git push -u origin main --force
cd ..\..
echo ✅ ldesign-git 处理完成
echo.

:: 处理 ldesign-generator
echo ============================================================
echo 处理包: @ldesign/generator
echo ============================================================
echo.

echo 📦 创建 GitHub 仓库: ldesign-generator
curl -H "Authorization: token %GITHUB_TOKEN%" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\":\"ldesign-generator\",\"description\":\"LDesign代码生成器 - 快速生成组件、页面、配置文件等\",\"private\":false}"
timeout /t 2 /nobreak >nul

echo.
echo 🔧 初始化 Git 仓库: tools/generator
cd tools\generator
if not exist .git (
    git init
)
git add .
git commit -m "feat: initial commit for ldesign-generator" 2>nul
git remote remove origin 2>nul
git remote add origin https://%GITHUB_TOKEN%@github.com/%GITHUB_USERNAME%/ldesign-generator.git
git branch -M main
git push -u origin main --force
cd ..\..
echo ✅ ldesign-generator 处理完成
echo.

:: 处理 ldesign-deps
echo ============================================================
echo 处理包: @ldesign/deps
echo ============================================================
echo.

echo 📦 创建 GitHub 仓库: ldesign-deps
curl -H "Authorization: token %GITHUB_TOKEN%" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\":\"ldesign-deps\",\"description\":\"LDesign依赖管理工具 - 依赖分析、更新检查、版本管理\",\"private\":false}"
timeout /t 2 /nobreak >nul

echo.
echo 🔧 初始化 Git 仓库: tools/deps
cd tools\deps
if not exist .git (
    git init
)
git add .
git commit -m "feat: initial commit for ldesign-deps" 2>nul
git remote remove origin 2>nul
git remote add origin https://%GITHUB_TOKEN%@github.com/%GITHUB_USERNAME%/ldesign-deps.git
git branch -M main
git push -u origin main --force
cd ..\..
echo ✅ ldesign-deps 处理完成
echo.

:: 处理 ldesign-security
echo ============================================================
echo 处理包: @ldesign/security
echo ============================================================
echo.

echo 📦 创建 GitHub 仓库: ldesign-security
curl -H "Authorization: token %GITHUB_TOKEN%" -H "Accept: application/vnd.github.v3+json" https://api.github.com/user/repos -d "{\"name\":\"ldesign-security\",\"description\":\"LDesign安全工具 - 依赖安全扫描、漏洞检测、代码审计\",\"private\":false}"
timeout /t 2 /nobreak >nul

echo.
echo 🔧 初始化 Git 仓库: tools/security
cd tools\security
if not exist .git (
    git init
)
git add .
git commit -m "feat: initial commit for ldesign-security" 2>nul
git remote remove origin 2>nul
git remote add origin https://%GITHUB_TOKEN%@github.com/%GITHUB_USERNAME%/ldesign-security.git
git branch -M main
git push -u origin main --force
cd ..\..
echo ✅ ldesign-security 处理完成
echo.

echo ============================================================
echo ✨ 所有包处理完成！
echo ============================================================
echo.

echo 📝 已创建的仓库:
echo   - https://github.com/%GITHUB_USERNAME%/ldesign-git
echo   - https://github.com/%GITHUB_USERNAME%/ldesign-generator
echo   - https://github.com/%GITHUB_USERNAME%/ldesign-deps
echo   - https://github.com/%GITHUB_USERNAME%/ldesign-security
echo.

echo ✅ 完成！
pause

