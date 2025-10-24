# 将已创建的仓库转换为子模块
$username = "poly1603"

$packages = @(
    @{ dir = "tools/git"; repo = "ldesign-git" },
    @{ dir = "tools/generator"; repo = "ldesign-generator" },
    @{ dir = "tools/deps"; repo = "ldesign-deps" },
    @{ dir = "tools/security"; repo = "ldesign-security" }
)

Write-Host "`n将包转换为 Git 子模块..." -ForegroundColor Green
Write-Host "注意: 这将删除本地目录并将其替换为子模块`n" -ForegroundColor Yellow

foreach ($pkg in $packages) {
    Write-Host "处理: $($pkg.dir)" -ForegroundColor Cyan
    
    # 备份目录
    $backupDir = "$($pkg.dir)_backup_$(Get-Date -Format 'yyyyMMddHHmmss')"
    Write-Host "  备份到: $backupDir" -ForegroundColor Gray
    
    if (Test-Path $pkg.dir) {
        Copy-Item -Path $pkg.dir -Destination $backupDir -Recurse
        
        # 删除原目录
        Remove-Item -Path $pkg.dir -Recurse -Force
        Write-Host "  已删除原目录" -ForegroundColor Gray
    }
    
    # 添加为子模块
    $repoUrl = "https://github.com/$username/$($pkg.repo).git"
    Write-Host "  添加子模块: $repoUrl" -ForegroundColor Gray
    
    try {
        git submodule add $repoUrl $pkg.dir
        Write-Host "  子模块添加成功" -ForegroundColor Green
    }
    catch {
        Write-Host "  添加失败，恢复备份" -ForegroundColor Red
        if (Test-Path $backupDir) {
            Copy-Item -Path $backupDir -Destination $pkg.dir -Recurse
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "子模块配置完成！" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "后续步骤:" -ForegroundColor Yellow
Write-Host "1. 初始化子模块: git submodule update --init --recursive" -ForegroundColor Gray
Write-Host "2. 提交更改: git add . && git commit -m 'feat: add submodules for tools'" -ForegroundColor Gray
Write-Host "3. 查看子模块状态: git submodule status`n" -ForegroundColor Gray

