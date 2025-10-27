# Test All Packages Build Script
# 测试所有@ldesign包的构建

param(
    [string[]]$Packages = @(),
    [switch]$StopOnError = $false,
    [switch]$SkipCSS = $true  # 默认跳过CSS包（menu, tabs）
)

$ErrorActionPreference = "Continue"
$packagesDir = "D:\WorkBench\ldesign\packages"

# 如果没有指定包，测试所有包
if ($Packages.Count -eq 0) {
    $Packages = Get-ChildItem -Path $packagesDir -Directory | Select-Object -ExpandProperty Name
}

# 跳过的包（有CSS问题）
$skipPackages = @()
if ($SkipCSS) {
    $skipPackages = @('menu', 'tabs')
}

$results = @()
$passed = 0
$failed = 0
$skipped = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing Build for @ldesign Packages" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($pkg in $Packages) {
    if ($skipPackages -contains $pkg) {
        Write-Host "⏭️  Skipping $pkg (CSS issues)" -ForegroundColor Yellow
        $skipped++
        $results += [PSCustomObject]@{
            Package = $pkg
            Status = "SKIPPED"
            Time = "-"
            DTS = "-"
        }
        continue
    }

    Write-Host "📦 Testing $pkg..." -NoNewline
    
    $pkgPath = Join-Path $packagesDir $pkg
    if (!(Test-Path $pkgPath)) {
        Write-Host " NOT FOUND" -ForegroundColor Red
        $failed++
        continue
    }

    Push-Location $pkgPath
    
    try {
        $output = pnpm build 2>&1 | Out-String
        
        if ($LASTEXITCODE -eq 0) {
            # 提取构建时间
            if ($output -match '耗时:\s+([\d.]+)s') {
                $time = $matches[1]
            } else {
                $time = "-"
            }
            
            # 检查DTS文件
            $dtsCount = 0
            if (Test-Path "es") {
                $dtsCount = (Get-ChildItem -Path "es" -Recurse -Filter "*.d.ts" -ErrorAction SilentlyContinue | Measure-Object).Count
            }
            
            Write-Host " ✅ SUCCESS (${time}s, ${dtsCount} DTS)" -ForegroundColor Green
            $passed++
            $results += [PSCustomObject]@{
                Package = $pkg
                Status = "PASS"
                Time = "${time}s"
                DTS = $dtsCount
            }
        } else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            $failed++
            $results += [PSCustomObject]@{
                Package = $pkg
                Status = "FAIL"
                Time = "-"
                DTS = "-"
            }
            
            if ($StopOnError) {
                Write-Host "`nError output:" -ForegroundColor Red
                Write-Host $output
                Pop-Location
                break
            }
        }
    } catch {
        Write-Host " ❌ ERROR: $_" -ForegroundColor Red
        $failed++
        $results += [PSCustomObject]@{
            Package = $pkg
            Status = "ERROR"
            Time = "-"
            DTS = "-"
        }
    } finally {
        Pop-Location
    }
}

# 显示总结
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Build Test Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

Write-Host "`n📊 Statistics:" -ForegroundColor Cyan
Write-Host "  Total:   $($Packages.Count)" -ForegroundColor White
Write-Host "  Passed:  $passed" -ForegroundColor Green
Write-Host "  Failed:  $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "  Skipped: $skipped" -ForegroundColor Yellow

if ($failed -eq 0 -and $skipped -eq 0) {
    Write-Host "`n🎉 All packages built successfully!" -ForegroundColor Green
    exit 0
} elseif ($failed -eq 0) {
    Write-Host "`n✅ All tested packages passed ($skipped skipped)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some packages failed to build" -ForegroundColor Yellow
    exit 1
}


