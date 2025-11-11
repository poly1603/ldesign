# 测试所有包的打包脚本
# 从 core 开始，逐个测试每个包

$packagesOrder = @(
    "shared",
    "logger",
    "validator", 
    "storage",
    "file",
    "color",
    "size",
    "icons",
    "template",
    "animation",
    "auth",
    "cache",
    "crypto",
    "device",
    "engine",
    "http",
    "i18n",
    "menu",
    "notification",
    "permission",
    "router",
    "store",
    "tabs",
    "websocket",
    "api"
)

$rootPath = "D:\WorkBench\ldesign\packages"
$results = @()
$successCount = 0
$failCount = 0

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始测试所有包的打包" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($package in $packagesOrder) {
    $packagePath = Join-Path $rootPath $package
    
    if (-not (Test-Path $packagePath)) {
        Write-Host "⚠️  包不存在: $package" -ForegroundColor Yellow
        $results += [PSCustomObject]@{
            Package = $package
            Status = "不存在"
            Error = "目录不存在"
        }
        $failCount++
        continue
    }
    
    Write-Host "📦 测试打包: $package" -ForegroundColor Blue
    Write-Host "路径: $packagePath" -ForegroundColor Gray
    
    Push-Location $packagePath
    
    try {
        $output = pnpm run build 2>&1
        $exitCode = $LASTEXITCODE
        
        if ($exitCode -eq 0) {
            Write-Host "✅ $package 打包成功" -ForegroundColor Green
            $results += [PSCustomObject]@{
                Package = $package
                Status = "成功"
                Error = ""
            }
            $successCount++
        } else {
            Write-Host "❌ $package 打包失败" -ForegroundColor Red
            Write-Host "错误信息:" -ForegroundColor Red
            Write-Host $output -ForegroundColor Red
            $results += [PSCustomObject]@{
                Package = $package
                Status = "失败"
                Error = $output
            }
            $failCount++
        }
    } catch {
        Write-Host "❌ $package 打包异常: $_" -ForegroundColor Red
        $results += [PSCustomObject]@{
            Package = $package
            Status = "异常"
            Error = $_.Exception.Message
        }
        $failCount++
    } finally {
        Pop-Location
    }
    
    Write-Host ""
}

# 输出汇总报告
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "打包测试汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 成功: $successCount 个" -ForegroundColor Green
Write-Host "❌ 失败: $failCount 个" -ForegroundColor Red
Write-Host ""

if ($failCount -gt 0) {
    Write-Host "失败的包:" -ForegroundColor Red
    foreach ($result in $results) {
        if ($result.Status -ne "成功") {
            Write-Host "  - $($result.Package): $($result.Status)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "详细结果:" -ForegroundColor Cyan
$results | Format-Table -AutoSize

exit $failCount
