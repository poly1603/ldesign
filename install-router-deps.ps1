# 为所有 engine 框架安装路由依赖

$frameworks = @(
    @{name="preact"; router="@ldesign/router-preact"},
    @{name="lit"; router="@ldesign/router-lit"},
    @{name="qwik"; router="@ldesign/router-qwik"},
    @{name="svelte"; router="@ldesign/router-svelte"},
    @{name="angular"; router="@ldesign/router-angular"},
    @{name="vue2"; router="@ldesign/router-vue2"}
)

Write-Host "🚀 开始为所有框架安装路由依赖..." -ForegroundColor Green
Write-Host ""

foreach ($fw in $frameworks) {
    $path = "packages/engine/packages/$($fw.name)/example"
    $router = $fw.router
    
    Write-Host "📦 [$($fw.name)] 安装 $router..." -ForegroundColor Cyan
    
    if (Test-Path $path) {
        Push-Location $path
        pnpm add @ldesign/router $router
        Pop-Location
        Write-Host "✅ [$($fw.name)] 安装完成" -ForegroundColor Green
    } else {
        Write-Host "❌ [$($fw.name)] 路径不存在: $path" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "🎉 所有依赖安装完成!" -ForegroundColor Green

