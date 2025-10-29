# 批量修复所有包的 UMD 构建配置
# 禁用 UMD 格式，避免构建失败

$packagesDir = "D:\WorkBench\ldesign\packages"
$packages = Get-ChildItem $packagesDir -Directory

foreach ($pkg in $packages) {
    $pkgName = $pkg.Name
    $configPath = Join-Path $pkg.FullName "ldesign.config.ts"
    $packageJsonPath = Join-Path $pkg.FullName "package.json"
    
    # 跳过没有配置文件的包
    if (-not (Test-Path $configPath)) {
        Write-Host "跳过 $pkgName - 没有 ldesign.config.ts" -ForegroundColor Yellow
        continue
    }
    
    Write-Host "处理 $pkgName..." -ForegroundColor Cyan
    
    # 修改 ldesign.config.ts
    $config = Get-Content $configPath -Raw
    
    # 检查是否包含 umd 格式
    if ($config -match "format:\s*\[[^\]]*'umd'[^\]]*\]") {
        # 从 format 数组中移除 umd
        $config = $config -replace "(\s*format:\s*\[)([^\]]*)'umd'[,\s]*([^\]]*)\]", '$1$2$3]'
        $config = $config -replace "(\s*format:\s*\[[^\]]*),\s*'umd'([^\]]*\])", '$1$2'
        $config = $config -replace "(\s*format:\s*\[)'umd',\s*([^\]]*\])", '$1$2'
        
        # 添加 umd.enabled = false
        if ($config -match "umd:\s*\{") {
            # 如果已有 umd 配置，添加 enabled: false
            if ($config -notmatch "enabled:\s*false") {
                $config = $config -replace "(umd:\s*\{)", '$1`n      enabled: false,'
            }
        } else {
            # 添加新的 umd 配置
            if ($config -match "output:\s*\{") {
                $config = $config -replace "(output:\s*\{[^\}]*)(,?\s*\})", '$1,`n    umd: {`n      enabled: false`n    }$2'
            }
        }
        
        Set-Content $configPath $config -NoNewline
        Write-Host "  ✓ 更新了 ldesign.config.ts" -ForegroundColor Green
    }
    
    # 修改 package.json
    if (Test-Path $packageJsonPath) {
        $pkgJson = Get-Content $packageJsonPath -Raw
        
        # 检查 build 脚本中是否包含 umd
        if ($pkgJson -match '"build":\s*"[^"]*-f\s+[^"]*umd[^"]*"') {
            $pkgJson = $pkgJson -replace '(-f\s+[^"]*),?umd,?([^"]*")', '$1$2'
            $pkgJson = $pkgJson -replace '(-f\s+)umd,([^"]*")', '$1$2'
            $pkgJson = $pkgJson -replace '(-f\s+[^,"]*)umd([^"]*")', '$1$2'
            
            Set-Content $packageJsonPath $pkgJson -NoNewline
            Write-Host "  ✓ 更新了 package.json" -ForegroundColor Green
        }
    }
}

Write-Host "`n完成！所有包的 UMD 构建配置已更新。" -ForegroundColor Green
