# 逐个测试所有包的打包和example启动
$ErrorActionPreference = "Continue"
$packages = @(
    "alpinejs",
    "angular", 
    "astro",
    "lit",
    "nextjs",
    "nuxtjs",
    "preact",
    "qwik",
    "react",
    "remix",
    "solid",
    "svelte",
    "sveltekit",
    "vue"
)

$baseDir = "packages/engine/packages"
$results = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始逐个测试所有包的打包" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($package in $packages) {
    $packagePath = Join-Path $baseDir $package
    
    if (-not (Test-Path $packagePath)) {
        Write-Host "❌ 包目录不存在: $package" -ForegroundColor Red
        continue
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "测试包: $package" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    Push-Location $packagePath
    
    try {
        # 清理之前的构建产物
        Write-Host "🧹 清理构建产物..." -ForegroundColor Gray
        if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue }
        if (Test-Path "es") { Remove-Item -Recurse -Force "es" -ErrorAction SilentlyContinue }
        if (Test-Path "lib") { Remove-Item -Recurse -Force "lib" -ErrorAction SilentlyContinue }
        
        # 执行打包
        Write-Host "🔨 执行打包: pnpm build" -ForegroundColor Yellow
        $buildOutput = & pnpm build 2>&1 | Out-String
        $buildExitCode = $LASTEXITCODE
        
        if ($buildExitCode -ne 0) {
            Write-Host "❌ 打包失败!" -ForegroundColor Red
            Write-Host $buildOutput -ForegroundColor Red
            $results += @{
                Package = $package
                BuildSuccess = $false
                BuildMessage = "打包失败"
            }
        }
        else {
            # 检查构建产物
            $hasDist = Test-Path "dist"
            $hasEs = Test-Path "es"
            $hasLib = Test-Path "lib"
            
            Write-Host "✓ 打包成功!" -ForegroundColor Green
            Write-Host "  - dist: $hasDist" -ForegroundColor Gray
            Write-Host "  - es: $hasEs" -ForegroundColor Gray
            Write-Host "  - lib: $hasLib" -ForegroundColor Gray
            
            $results += @{
                Package = $package
                BuildSuccess = $true
                BuildMessage = "打包成功"
                HasDist = $hasDist
                HasEs = $hasEs
                HasLib = $hasLib
            }
        }
    }
    catch {
        Write-Host "❌ 打包异常: $_" -ForegroundColor Red
        $results += @{
            Package = $package
            BuildSuccess = $false
            BuildMessage = "打包异常: $_"
        }
    }
    finally {
        Pop-Location
    }
}

# 输出打包结果汇总
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "打包测试汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$buildSuccessCount = ($results | Where-Object { $_.BuildSuccess }).Count
$buildTotalCount = $results.Count

Write-Host ""
Write-Host "📦 打包结果: $buildSuccessCount / $buildTotalCount 成功" -ForegroundColor $(if ($buildSuccessCount -eq $buildTotalCount) { "Green" } else { "Yellow" })

foreach ($result in $results) {
    $status = if ($result.BuildSuccess) { "✓" } else { "✗" }
    $color = if ($result.BuildSuccess) { "Green" } else { "Red" }
    Write-Host "  $status $($result.Package) - $($result.BuildMessage)" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "打包测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 保存结果到文件
$results | ConvertTo-Json -Depth 5 | Out-File "build-test-results.json" -Encoding UTF8
Write-Host "结果已保存到 build-test-results.json" -ForegroundColor Gray























































