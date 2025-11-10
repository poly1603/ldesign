# 自动化测试所有框架的路由功能

$frameworks = @(
    @{name="Preact"; path="packages/engine/packages/preact/example"; port=5181},
    @{name="Lit"; path="packages/engine/packages/lit/example"; port=5180},
    @{name="Qwik"; path="packages/engine/packages/qwik/example"; port=5184},
    @{name="Svelte"; path="packages/engine/packages/svelte/example"; port=5185},
    @{name="Angular"; path="packages/engine/packages/angular/example"; port=4200}
)

$results = @()

Write-Host "🚀 开始测试所有框架的路由功能..." -ForegroundColor Green
Write-Host ""

foreach ($fw in $frameworks) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📦 测试框架: $($fw.name)" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    $result = @{
        Framework = $fw.name
        Status = "未测试"
        Port = $fw.port
        Error = ""
    }
    
    # 启动开发服务器
    Write-Host "🔧 启动开发服务器..." -ForegroundColor Yellow
    Push-Location $fw.path
    
    $job = Start-Job -ScriptBlock {
        param($path)
        Set-Location $path
        pnpm dev 2>&1
    } -ArgumentList (Get-Location).Path
    
    Pop-Location
    
    # 等待服务器启动
    Write-Host "⏳ 等待服务器启动 (15秒)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # 检查服务器是否启动
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($fw.port)/" -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ 服务器启动成功!" -ForegroundColor Green
            $result.Status = "通过"
        } else {
            Write-Host "❌ 服务器响应异常: $($response.StatusCode)" -ForegroundColor Red
            $result.Status = "失败"
            $result.Error = "HTTP $($response.StatusCode)"
        }
    } catch {
        Write-Host "❌ 无法连接到服务器: $_" -ForegroundColor Red
        $result.Status = "失败"
        $result.Error = $_.Exception.Message
    }
    
    # 停止服务器
    Write-Host "🛑 停止服务器..." -ForegroundColor Yellow
    Stop-Job -Job $job
    Remove-Job -Job $job
    
    $results += $result
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # 等待端口释放
    Start-Sleep -Seconds 3
}

# 生成测试报告
Write-Host ""
Write-Host "📊 测试结果汇总" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""

$passed = ($results | Where-Object { $_.Status -eq "通过" }).Count
$failed = ($results | Where-Object { $_.Status -eq "失败" }).Count
$total = $results.Count

foreach ($r in $results) {
    $icon = if ($r.Status -eq "通过") { "✅" } else { "❌" }
    $color = if ($r.Status -eq "通过") { "Green" } else { "Red" }
    
    Write-Host "$icon $($r.Framework) - $($r.Status)" -ForegroundColor $color
    if ($r.Error) {
        Write-Host "   错误: $($r.Error)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "通过: $passed/$total | 失败: $failed/$total" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

