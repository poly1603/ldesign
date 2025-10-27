# Verify All Package Builds
# 快速验证所有包的构建产物

$packagesDir = "D:\WorkBench\ldesign\packages"
$packages = @(
    'animation', 'api', 'auth', 'cache', 'color',
    'crypto', 'device', 'engine', 'file', 'http',
    'i18n', 'icons', 'logger', 'menu', 'notification',
    'permission', 'router', 'shared', 'size', 'storage',
    'store', 'tabs', 'template', 'validator', 'websocket'
)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Verifying Build Outputs for All Packages" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @()

foreach ($pkg in $packages) {
    $pkgPath = Join-Path $packagesDir $pkg
    
    if (!(Test-Path $pkgPath)) {
        Write-Host "❌ $pkg - NOT FOUND" -ForegroundColor Red
        continue
    }
    
    # 检查输出目录
    $hasEs = Test-Path (Join-Path $pkgPath "es")
    $hasLib = Test-Path (Join-Path $pkgPath "lib")
    $hasDist = Test-Path (Join-Path $pkgPath "dist")
    
    # 统计文件
    $esFiles = if ($hasEs) { (Get-ChildItem (Join-Path $pkgPath "es") -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
    $libFiles = if ($hasLib) { (Get-ChildItem (Join-Path $pkgPath "lib") -Recurse -Filter "*.cjs" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
    $dtsEs = if ($hasEs) { (Get-ChildItem (Join-Path $pkgPath "es") -Recurse -Filter "*.d.ts" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
    $dtsLib = if ($hasLib) { (Get-ChildItem (Join-Path $pkgPath "lib") -Recurse -Filter "*.d.ts" -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
    
    $status = "OK"
    if (!$hasEs -or !$hasLib -or $esFiles -eq 0 -or $libFiles -eq 0) {
        $status = "WARN"
    }
    
    Write-Host "$status $pkg" -NoNewline
    Write-Host " | ESM:$esFiles CJS:$libFiles DTS:$($dtsEs+$dtsLib)" -ForegroundColor Gray
    
    $results += [PSCustomObject]@{
        Package = $pkg
        Status = $status
        ESM = $esFiles
        CJS = $libFiles
        DTS = $dtsEs + $dtsLib
        HasDist = $hasDist
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$totalPkgs = $results.Count
$withOutputs = ($results | Where-Object { $_.ESM -gt 0 -and $_.CJS -gt 0 }).Count
$withDts = ($results | Where-Object { $_.DTS -gt 0 }).Count
$withDist = ($results | Where-Object { $_.HasDist -eq $true }).Count

Write-Host "Total Packages: $totalPkgs" -ForegroundColor White
Write-Host "With ESM+CJS outputs: $withOutputs" -ForegroundColor Green
Write-Host "With DTS files: $withDts" -ForegroundColor Green
Write-Host "With UMD (dist/): $withDist" -ForegroundColor Green

if ($withOutputs -eq $totalPkgs -and $withDts -eq $totalPkgs) {
    Write-Host "`n[SUCCESS] All packages have complete build outputs!" -ForegroundColor Green
} else {
    Write-Host "`n[WARNING] Some packages may need building" -ForegroundColor Yellow
}

