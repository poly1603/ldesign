# 测试所有框架的路由功能
# 使用 Playwright 自动化测试

$frameworks = @(
    @{name="preact"; port=5181},
    @{name="lit"; port=5178},
    @{name="qwik"; port=5180},
    @{name="svelte"; port=5177},
    @{name="angular"; port=5179},
    @{name="vue2"; port=5176}
)

$results = @()

foreach ($fw in $frameworks) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Testing $($fw.name) Framework" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    $url = "http://localhost:$($fw.port)/"
    
    Write-Host "Starting dev server for $($fw.name)..." -ForegroundColor Yellow
    
    # 启动开发服务器
    $serverPath = "packages/engine/packages/$($fw.name)/example"
    $job = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        pnpm dev
    } -ArgumentList (Resolve-Path $serverPath).Path
    
    # 等待服务器启动
    Write-Host "Waiting for server to start..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    $serverReady = $false
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $serverReady = $true
                break
            }
        } catch {
            # Server not ready yet
        }
        Start-Sleep -Seconds 2
        $attempt++
    }
    
    if (-not $serverReady) {
        Write-Host "❌ Server failed to start for $($fw.name)" -ForegroundColor Red
        Stop-Job -Job $job
        Remove-Job -Job $job
        $results += @{
            framework = $fw.name
            status = "FAILED"
            reason = "Server failed to start"
        }
        continue
    }
    
    Write-Host "✅ Server started successfully" -ForegroundColor Green
    Write-Host "Opening browser at $url..." -ForegroundColor Yellow
    
    # 使用 Playwright 测试
    try {
        $testResult = npx playwright test --config=playwright.config.ts --grep="$($fw.name)"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ All tests passed for $($fw.name)" -ForegroundColor Green
            $results += @{
                framework = $fw.name
                status = "PASSED"
                url = $url
            }
        } else {
            Write-Host "❌ Tests failed for $($fw.name)" -ForegroundColor Red
            $results += @{
                framework = $fw.name
                status = "FAILED"
                reason = "Tests failed"
            }
        }
    } catch {
        Write-Host "❌ Error running tests for $($fw.name): $_" -ForegroundColor Red
        $results += @{
            framework = $fw.name
            status = "FAILED"
            reason = $_.Exception.Message
        }
    }
    
    # 停止服务器
    Write-Host "Stopping server..." -ForegroundColor Yellow
    Stop-Job -Job $job
    Remove-Job -Job $job
    
    # 等待端口释放
    Start-Sleep -Seconds 3
}

# 输出测试结果
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$passed = 0
$failed = 0

foreach ($result in $results) {
    if ($result.status -eq "PASSED") {
        Write-Host "✅ $($result.framework) - PASSED ($($result.url))" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $($result.framework) - FAILED ($($result.reason))" -ForegroundColor Red
        $failed++
    }
}

Write-Host "`nTotal: $($results.Count) | Passed: $passed | Failed: $failed" -ForegroundColor Cyan
Write-Host "Pass Rate: $([math]::Round($passed / $results.Count * 100, 2))%" -ForegroundColor Cyan

