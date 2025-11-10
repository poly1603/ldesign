# 测试所有 Router 和 Engine 包的构建状态

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试 Router 包构建状态" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$routerPackages = @(
    "@ldesign/router-react",
    "@ldesign/router-vue",
    "@ldesign/router-solid",
    "@ldesign/router-svelte",
    "@ldesign/router-lit",
    "@ldesign/router-preact",
    "@ldesign/router-qwik",
    "@ldesign/router-angular",
    "@ldesign/router-vue2"
)

$routerResults = @{}

foreach ($pkg in $routerPackages) {
    Write-Host "`n测试 $pkg..." -ForegroundColor Yellow
    $result = pnpm --filter=$pkg run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $pkg 构建成功" -ForegroundColor Green
        $routerResults[$pkg] = "成功"
    } else {
        Write-Host "❌ $pkg 构建失败" -ForegroundColor Red
        $routerResults[$pkg] = "失败"
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "测试 Engine 包构建状态" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$enginePackages = @(
    "@ldesign/engine-react",
    "@ldesign/engine-vue3",
    "@ldesign/engine-solid",
    "@ldesign/engine-svelte",
    "@ldesign/engine-lit",
    "@ldesign/engine-preact",
    "@ldesign/engine-qwik",
    "@ldesign/engine-angular",
    "@ldesign/engine-vue2"
)

$engineResults = @{}

foreach ($pkg in $enginePackages) {
    Write-Host "`n测试 $pkg..." -ForegroundColor Yellow
    $result = pnpm --filter=$pkg run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $pkg 构建成功" -ForegroundColor Green
        $engineResults[$pkg] = "成功"
    } else {
        Write-Host "❌ $pkg 构建失败" -ForegroundColor Red
        $engineResults[$pkg] = "失败"
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "构建结果总结" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nRouter 包:" -ForegroundColor Yellow
$routerSuccess = 0
$routerFail = 0
foreach ($pkg in $routerPackages) {
    $status = $routerResults[$pkg]
    if ($status -eq "成功") {
        Write-Host "  ✅ $pkg" -ForegroundColor Green
        $routerSuccess++
    } else {
        Write-Host "  ❌ $pkg" -ForegroundColor Red
        $routerFail++
    }
}

Write-Host "`nEngine 包:" -ForegroundColor Yellow
$engineSuccess = 0
$engineFail = 0
foreach ($pkg in $enginePackages) {
    $status = $engineResults[$pkg]
    if ($status -eq "成功") {
        Write-Host "  ✅ $pkg" -ForegroundColor Green
        $engineSuccess++
    } else {
        Write-Host "  ❌ $pkg" -ForegroundColor Red
        $engineFail++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "统计信息" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Router 包: $routerSuccess/$($routerPackages.Count) 成功 ($([math]::Round($routerSuccess/$routerPackages.Count*100, 1))%)" -ForegroundColor $(if ($routerSuccess -eq $routerPackages.Count) { "Green" } else { "Yellow" })
Write-Host "Engine 包: $engineSuccess/$($enginePackages.Count) 成功 ($([math]::Round($engineSuccess/$enginePackages.Count*100, 1))%)" -ForegroundColor $(if ($engineSuccess -eq $enginePackages.Count) { "Green" } else { "Yellow" })
Write-Host "总计: $($routerSuccess + $engineSuccess)/$($routerPackages.Count + $enginePackages.Count) 成功 ($([math]::Round(($routerSuccess + $engineSuccess)/($routerPackages.Count + $enginePackages.Count)*100, 1))%)" -ForegroundColor $(if (($routerSuccess + $engineSuccess) -eq ($routerPackages.Count + $enginePackages.Count)) { "Green" } else { "Yellow" })

