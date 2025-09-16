# Test all example projects with launcher

$projects = @(
    @{Name="React TypeScript"; Path="react-typescript"; Port=3002},
    @{Name="Vue3 TypeScript"; Path="vue3-typescript"; Port=3003},
    @{Name="Vue2"; Path="vue2"; Port=3004},
    @{Name="Vanilla"; Path="vanilla"; Port=3005},
    @{Name="Lit"; Path="lit"; Port=3006},
    @{Name="Angular"; Path="angular"; Port=3007}
)

Write-Host "Testing all example projects with launcher..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

foreach ($project in $projects) {
    Write-Host "`nTesting $($project.Name)..." -ForegroundColor Yellow
    Write-Host "Expected port: $($project.Port)" -ForegroundColor Gray
    
    Set-Location $project.Path
    
    # Check if .ldesign config exists
    if (Test-Path ".ldesign/launcher.config.ts") {
        Write-Host "✓ launcher.config.ts found" -ForegroundColor Green
    } else {
        Write-Host "✗ launcher.config.ts missing" -ForegroundColor Red
    }
    
    if (Test-Path ".ldesign/app.config.ts") {
        Write-Host "✓ app.config.ts found" -ForegroundColor Green
    } else {
        Write-Host "✗ app.config.ts missing" -ForegroundColor Red
    }
    
    # Try to start the dev server
    Write-Host "Starting dev server..." -ForegroundColor Cyan
    
    # Create a job to run the server
    $job = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        pnpm launcher dev 2>&1
    } -ArgumentList (Get-Location).Path
    
    # Wait for a few seconds
    Start-Sleep -Seconds 5
    
    # Check if server is running
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($project.Port)" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Server is running on port $($project.Port)" -ForegroundColor Green
        }
    } catch {
        Write-Host "✗ Server not responding on port $($project.Port)" -ForegroundColor Red
    }
    
    # Stop the job
    Stop-Job -Job $job
    Remove-Job -Job $job -Force
    
    Set-Location ..
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "Testing complete!" -ForegroundColor Green
