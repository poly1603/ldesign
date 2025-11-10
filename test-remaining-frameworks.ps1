# 测试剩余框架的路由功能
# 由于 Lit, Qwik, Svelte, Angular, Vue2 的 RouterView 实现可能与 Preact 类似,需要先修复

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始测试剩余框架的路由功能" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frameworks = @(
    @{name="lit"; port=5180},
    @{name="qwik"; port=5184},
    @{name="svelte"; port=5185},
    @{name="angular"; port=5186},
    @{name="vue2"; port=5187}
)

$results = @()

foreach ($fw in $frameworks) {
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    Write-Host "测试框架: $($fw.name)" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    $examplePath = "packages\engine\packages\$($fw.name)\example"
    
    if (Test-Path $examplePath) {
        Write-Host "✓ 找到示例目录: $examplePath" -ForegroundColor Green
        
        # 检查是否有 RouterView 组件
        $routerViewPath = "$examplePath\src\components\RouterView.*"
        if (Test-Path $routerViewPath) {
            Write-Host "✓ 找到 RouterView 组件" -ForegroundColor Green
        } else {
            Write-Host "✗ 未找到 RouterView 组件" -ForegroundColor Red
        }
        
        $results += @{
            framework = $fw.name
            port = $fw.port
            exampleExists = $true
            routerViewExists = (Test-Path $routerViewPath)
        }
    } else {
        Write-Host "✗ 未找到示例目录" -ForegroundColor Red
        $results += @{
            framework = $fw.name
            port = $fw.port
            exampleExists = $false
            routerViewExists = $false
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试结果汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

foreach ($result in $results) {
    $status = if ($result.exampleExists -and $result.routerViewExists) { "✓ 准备就绪" } else { "✗ 需要修复" }
    Write-Host "$($result.framework): $status (端口: $($result.port))" -ForegroundColor $(if ($status -like "*准备就绪*") { "Green" } else { "Red" })
}

