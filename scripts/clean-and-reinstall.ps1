# 清理并重新安装依赖
# 用于工作空间迁移后的环境重置

Write-Host "🧹 开始清理工作空间..." -ForegroundColor Cyan
Write-Host ""

# 1. 清理根目录 node_modules
Write-Host "1. 清理根目录 node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ 根目录 node_modules 已删除" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  根目录没有 node_modules" -ForegroundColor Gray
}

# 2. 清理所有子目录的 node_modules
Write-Host ""
Write-Host "2. 清理所有子目录的 node_modules（这可能需要几分钟）..." -ForegroundColor Yellow
$nodeModulesDirs = Get-ChildItem -Path . -Filter "node_modules" -Recurse -Directory -ErrorAction SilentlyContinue
$count = 0
foreach ($dir in $nodeModulesDirs) {
    try {
        Remove-Item -Path $dir.FullName -Recurse -Force -ErrorAction SilentlyContinue
        $count++
        Write-Host "   🗑️  已删除: $($dir.FullName)" -ForegroundColor Gray
    } catch {
        Write-Host "   ⚠️  无法删除: $($dir.FullName)" -ForegroundColor DarkYellow
    }
}
Write-Host "   ✅ 已清理 $count 个 node_modules 目录" -ForegroundColor Green

# 3. 删除 lockfile
Write-Host ""
Write-Host "3. 删除 pnpm-lock.yaml..." -ForegroundColor Yellow
if (Test-Path "pnpm-lock.yaml") {
    Remove-Item -Path "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ pnpm-lock.yaml 已删除" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  没有 pnpm-lock.yaml 文件" -ForegroundColor Gray
}

# 4. 显示清理统计
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ 清理完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 5. 询问是否立即重新安装
Write-Host "是否立即重新安装依赖？(Y/n): " -NoNewline -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "📦 正在安装依赖..." -ForegroundColor Cyan
    Write-Host ""
    
    # 执行 pnpm install
    pnpm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "🎉 安装完成！" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "下一步：" -ForegroundColor Yellow
        Write-Host "  1. 验证工作空间包：pnpm list -r --depth 0" -ForegroundColor Gray
        Write-Host "  2. 测试构建：pnpm --filter @ldesign/builder build" -ForegroundColor Gray
        Write-Host "  3. 查看开发指南：docs/DEVELOPMENT_GUIDE.md" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "❌ 安装失败！请检查错误信息" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "ℹ️  已跳过安装。稍后请运行：pnpm install" -ForegroundColor Gray
}

