# Build all packages script

$ErrorActionPreference = "Continue"

$packages = @(
    "auth\packages\core"
    "auth\packages\vue"
    "bookmark\packages\core"
    "bookmark\packages\vue"
    "breadcrumb\packages\core"
    "breadcrumb\packages\vue"
    "cache\packages\core"
    "cache\packages\vue"
    "color\packages\core"
    "color\packages\vue"
    "crypto\packages\core"
    "crypto\packages\vue"
    "device\packages\core"
    "device\packages\vue"
    "engine\packages\core"
    "engine\packages\vue3"
    "error\packages\core"
    "error\packages\vue"
    "http\packages\core"
    "http\packages\vue"
    "i18n\packages\core"
    "i18n\packages\vue"
    "logger\packages\core"
    "logger\packages\vue"
    "menu\packages\core"
    "menu\packages\vue"
    "notification\packages\core"
    "notification\packages\vue"
    "permission\packages\core"
    "permission\packages\vue"
    "router\packages\core"
    "router\packages\vue"
    "shared"
    "size\packages\core"
    "size\packages\vue"
    "store\packages\core"
    "store\packages\vue"
    "template\packages\core"
    "template\packages\vue"
    "tracker\packages\core"
    "tracker\packages\vue"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$successCount = 0
$failCount = 0
$failedPackages = @()

Write-Host "========================================"
Write-Host "Building all packages..."
Write-Host "Total: $($packages.Length) packages"
Write-Host "========================================"
Write-Host ""

foreach ($pkg in $packages) {
    $pkgPath = Join-Path $scriptDir $pkg
    
    if (-not (Test-Path $pkgPath)) {
        Write-Host "[SKIP] Package not found: $pkg"
        continue
    }
    
    $pkgJsonPath = Join-Path $pkgPath "package.json"
    if (-not (Test-Path $pkgJsonPath)) {
        Write-Host "[SKIP] package.json not found: $pkg"
        continue
    }
    
    Write-Host "[BUILD] Building: $pkg"
    
    Push-Location $pkgPath
    try {
        pnpm build 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[SUCCESS] $pkg" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "[FAILED] $pkg" -ForegroundColor Red
            $failCount++
            $failedPackages += $pkg
        }
    } catch {
        Write-Host "[ERROR] $pkg - $_" -ForegroundColor Red
        $failCount++
        $failedPackages += $pkg
    } finally {
        Pop-Location
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "Build completed!"
Write-Host "Success: $successCount packages" -ForegroundColor Green
if ($failCount -gt 0) {
    Write-Host "Failed: $failCount packages" -ForegroundColor Red
    Write-Host "Failed packages:"
    foreach ($failed in $failedPackages) {
        Write-Host "  - $failed" -ForegroundColor Red
    }
}
Write-Host "========================================"
