# LDesign 工具集快速启动脚本
# 同时启动后端和前端服务

Write-Host "🚀 LDesign 工具集启动中..." -ForegroundColor Cyan
Write-Host ""

# 检查是否在tools目录
$currentDir = Get-Location
if (-not ($currentDir.Path.EndsWith("tools"))) {
    Write-Host "❌ 请在tools目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 检查pnpm是否安装
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 未找到pnpm，请先安装: npm install -g pnpm" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 环境检查通过" -ForegroundColor Green
Write-Host ""

# 启动后端服务器
Write-Host "📦 启动后端服务器..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$currentDir\server'; Write-Host '🔧 后端服务器' -ForegroundColor Cyan; pnpm start"

# 等待后端启动
Write-Host "⏳ 等待后端启动 (3秒)..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# 启动前端开发服务器
Write-Host "🎨 启动前端开发服务器..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$currentDir\web'; Write-Host '🌐 前端服务器' -ForegroundColor Cyan; pnpm dev"

Write-Host ""
Write-Host "✨ 服务启动完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 后端地址: http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host "📍 前端地址: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 提示: 关闭此窗口不会停止服务，请分别关闭后端和前端窗口" -ForegroundColor Yellow
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
