# Grid Examples Quick Start
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Grid Examples Quick Start" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

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

# Start servers
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Green
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd examples/vue-demo; pnpm dev --port $($ports.Vue)" -WindowStyle Normal
Start-Sleep -Seconds 1

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd examples/react-demo; pnpm dev --port $($ports.React)" -WindowStyle Normal
Start-Sleep -Seconds 1

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd examples/vanilla-demo; pnpm dev --port $($ports.Vanilla)" -WindowStyle Normal

Write-Host "Waiting for servers to start (10 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Open browsers
Write-Host ""
Write-Host "Opening browsers..." -ForegroundColor Cyan
Write-Host ""

foreach ($key in $urls.Keys) {
    Write-Host "  Opening $key Demo: $($urls[$key])" -ForegroundColor Gray
    Start-Process $urls[$key]
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host "Close the PowerShell windows to stop the servers" -ForegroundColor Yellow
Write-Host ""
