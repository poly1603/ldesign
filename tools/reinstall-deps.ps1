# LDesign Tools - 重新安装依赖脚本
# 在重构后首次运行此脚本

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "LDesign Tools - 重新安装依赖" -ForegroundColor Cyan  
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在tools目录
$currentDir = Get-Location
if (-not (Test-Path ".\cli\package.json")) {
    Write-Host "错误: 请在 tools 目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 1. 清理 node_modules
Write-Host "1. 清理 node_modules..." -ForegroundColor Yellow
Get-ChildItem -Path . -Directory -Recurse -Filter "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "   ✓ 清理完成" -ForegroundColor Green
Write-Host ""

# 2. 回到根目录重新安装
Write-Host "2. 回到根目录安装依赖..." -ForegroundColor Yellow
Set-Location ..
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ 依赖安装失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ 依赖安装完成" -ForegroundColor Green
Write-Host ""

# 3. 构建 shared 包
Write-Host "3. 构建 @ldesign/shared..." -ForegroundColor Yellow
Set-Location tools\shared
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ shared 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ @ldesign/shared 构建完成" -ForegroundColor Green
Write-Host ""

# 4. 构建 server 包
Write-Host "4. 构建 @ldesign/server..." -ForegroundColor Yellow
Set-Location ..\server
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ server 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ @ldesign/server 构建完成" -ForegroundColor Green
Write-Host ""

# 5. 构建 web 包
Write-Host "5. 构建 @ldesign/web..." -ForegroundColor Yellow
Set-Location ..\web
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ web 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ @ldesign/web 构建完成" -ForegroundColor Green
Write-Host ""

# 6. 构建 cli 包
Write-Host "6. 构建 @ldesign/cli..." -ForegroundColor Yellow
Set-Location ..\cli
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ✗ cli 构建失败" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ @ldesign/cli 构建完成" -ForegroundColor Green
Write-Host ""

# 7. 完成
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "✓ 所有包构建完成!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "下一步:" -ForegroundColor Yellow
Write-Host "  1. 全局链接 CLI: cd cli && npm link" -ForegroundColor White
Write-Host "  2. 测试命令: ldesign --help" -ForegroundColor White
Write-Host "  3. 启动 UI: ldesign ui" -ForegroundColor White
Write-Host ""
