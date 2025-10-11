# Grid Examples 快速启动脚本
# 简化版 - 只启动服务并打开浏览器

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Grid Examples 快速启动" -ForegroundColor Cyan
Write-Host "============================================================`n" -ForegroundColor Cyan

# 端口配置
$ports = @{
    Vue = 5173
    React = 5174
    Vanilla = 5175
}

$urls = @{
    Vue = "http://localhost:5173"
    React = "http://localhost:5174"
    Vanilla = "http://localhost:5175"
}

# 启动服务器
Write-Host "🚀 启动开发服务器...`n" -ForegroundColor Green

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd examples/vue-demo; pnpm dev --port $($ports.Vue)" -WindowStyle Normal
Start-Sleep -Seconds 1

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd examples/react-demo; pnpm dev --port $($ports.React)" -WindowStyle Normal
Start-Sleep -Seconds 1

Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd examples/vanilla-demo; pnpm dev --port $($ports.Vanilla)" -WindowStyle Normal

Write-Host "⏳ 等待服务器启动 (10秒)...`n" -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 打开浏览器
Write-Host "🌐 打开浏览器...`n" -ForegroundColor Cyan

foreach ($key in $urls.Keys) {
    Write-Host "   → $key Demo: $($urls[$key])" -ForegroundColor Gray
    Start-Process $urls[$key]
    Start-Sleep -Milliseconds 500
}

Write-Host "" -ForegroundColor Green
Write-Host "Done!" -ForegroundColor Green
Write-Host "" -ForegroundColor Yellow
Write-Host "Tip: Close the PowerShell windows to stop the servers" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow
