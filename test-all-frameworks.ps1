# 自动化测试所有框架的路由功能
# 测试顺序: Preact, Lit, Qwik, Angular, Svelte

Write-Host "开始测试所有框架的路由功能..." -ForegroundColor Green

# 测试 Preact
Write-Host "`n=== 测试 Preact ===" -ForegroundColor Cyan
Set-Location "packages\engine\packages\preact\example"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -WindowStyle Minimized
Start-Sleep -Seconds 10
Write-Host "Preact 服务已启动,请手动测试: http://localhost:5182/" -ForegroundColor Yellow
Read-Host "按回车继续下一个框架"
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 测试 Lit
Write-Host "`n=== 测试 Lit ===" -ForegroundColor Cyan
Set-Location "..\..\..\lit\example"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -WindowStyle Minimized
Start-Sleep -Seconds 10
Write-Host "Lit 服务已启动,请手动测试: http://localhost:5179/" -ForegroundColor Yellow
Read-Host "按回车继续下一个框架"
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 测试 Qwik
Write-Host "`n=== 测试 Qwik ===" -ForegroundColor Cyan
Set-Location "..\..\..\qwik\example"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -WindowStyle Minimized
Start-Sleep -Seconds 10
Write-Host "Qwik 服务已启动,请手动测试" -ForegroundColor Yellow
Read-Host "按回车继续下一个框架"
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 测试 Angular
Write-Host "`n=== 测试 Angular ===" -ForegroundColor Cyan
Set-Location "..\..\..\angular\example"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -WindowStyle Minimized
Start-Sleep -Seconds 10
Write-Host "Angular 服务已启动,请手动测试" -ForegroundColor Yellow
Read-Host "按回车继续下一个框架"
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 测试 Svelte
Write-Host "`n=== 测试 Svelte ===" -ForegroundColor Cyan
Set-Location "..\..\..\svelte\example"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "pnpm dev" -WindowStyle Minimized
Start-Sleep -Seconds 10
Write-Host "Svelte 服务已启动,请手动测试" -ForegroundColor Yellow
Read-Host "按回车完成测试"
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

Write-Host "`n所有框架测试完成!" -ForegroundColor Green

