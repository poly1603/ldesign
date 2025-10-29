# 清理临时文档
# 保留重要文档：README.md, CHANGELOG.md, LICENSE, docs/, doc/ 等
# 删除临时文档：优化报告、完成总结、项目计划等

Write-Host "🧹 开始清理临时文档..." -ForegroundColor Cyan
Write-Host ""

# 要删除的文件名模式（不区分大小写）
$deletePatterns = @(
    # 优化相关
    "*OPTIMIZATION*.md",
    "*OPTIMIZ*.md",
    "*优化*.md",
    
    # 完成报告
    "*COMPLETE*.md",
    "*COMPLETION*.md",
    "*FINISHED*.md",
    "*完成*.md",
    "*成功*.md",
    
    # 总结报告
    "*SUMMARY*.md",
    "*总结*.md",
    "*摘要*.md",
    
    # 实施报告
    "*IMPLEMENTATION*.md",
    "*PROGRESS*.md",
    "*STATUS*.md",
    "*实施*.md",
    "*进度*.md",
    
    # 项目计划
    "*PROJECT_PLAN*.md",
    "*PLAN*.md",
    "*计划*.md",
    
    # 最终报告
    "*FINAL*.md",
    "*最终*.md",
    
    # 迁移相关
    "*MIGRATION*.md",
    "*迁移*.md",
    
    # 验证检查
    "*VERIFICATION*.md",
    "*VALIDATION*.md",
    "*CHECK*.md",
    "*验证*.md",
    
    # 指南（非 docs 目录）
    "*GUIDE*.md",
    "*指南*.md",
    
    # 其他临时文档
    "*REPORT*.md",
    "*ANALYSIS*.md",
    "*REVIEW*.md",
    "*AUDIT*.md",
    "*报告*.md",
    "*分析*.md",
    
    # 带 emoji 的文件
    "*🎉*.md",
    "*✅*.md",
    "*🚀*.md",
    "*📚*.md",
    "*🎊*.md",
    "*📖*.md",
    "*📋*.md",
    "*✨*.md",
    "*🌟*.md",
    "*🎯*.md",
    "*🏆*.md",
    "*⭐*.md",
    "*💡*.md",
    "*🔧*.md",
    "*📝*.md",
    "*🎁*.md"
)

# 要保留的文件名（精确匹配）
$keepFiles = @(
    "README.md",
    "CHANGELOG.md",
    "LICENSE.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md",
    "SECURITY.md",
    "SUPPORT.md",
    ".github/README.md"
)

# 要保留的目录
$keepDirs = @(
    "docs",
    "doc",
    ".github",
    "examples",
    "example"
)

# 统计
$totalFound = 0
$totalDeleted = 0
$totalSkipped = 0

Write-Host "正在扫描文件..." -ForegroundColor Yellow
Write-Host ""

# 获取所有 MD 文件
$allMdFiles = Get-ChildItem -Path . -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { 
        $_.DirectoryName -notlike "*node_modules*" -and 
        $_.DirectoryName -notlike "*\dist*" -and 
        $_.DirectoryName -notlike "*\es*" -and 
        $_.DirectoryName -notlike "*\lib*" -and
        $_.DirectoryName -notlike "*.git*"
    }

$totalFound = $allMdFiles.Count
Write-Host "找到 $totalFound 个 MD 文件" -ForegroundColor Cyan
Write-Host ""

# 处理每个文件
foreach ($file in $allMdFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + '\', '')
    $fileName = $file.Name
    $dirPath = $file.DirectoryName
    
    # 检查是否在保留目录中
    $inKeepDir = $false
    foreach ($keepDir in $keepDirs) {
        if ($relativePath -like "*\$keepDir\*" -or $relativePath -like "$keepDir\*") {
            $inKeepDir = $true
            break
        }
    }
    
    if ($inKeepDir) {
        $totalSkipped++
        Write-Host "  ✓ 保留（在保留目录）: $relativePath" -ForegroundColor Gray
        continue
    }
    
    # 检查是否是要保留的文件
    $isKeepFile = $false
    foreach ($keepFile in $keepFiles) {
        if ($fileName -eq $keepFile -or $relativePath -like "*$keepFile") {
            $isKeepFile = $true
            break
        }
    }
    
    if ($isKeepFile) {
        $totalSkipped++
        Write-Host "  ✓ 保留（重要文件）: $relativePath" -ForegroundColor Gray
        continue
    }
    
    # 检查是否匹配删除模式
    $shouldDelete = $false
    foreach ($pattern in $deletePatterns) {
        if ($fileName -like $pattern) {
            $shouldDelete = $true
            break
        }
    }
    
    if ($shouldDelete) {
        try {
            Remove-Item -Path $file.FullName -Force -ErrorAction Stop
            $totalDeleted++
            Write-Host "  🗑️  删除: $relativePath" -ForegroundColor Yellow
        } catch {
            Write-Host "  ❌ 无法删除: $relativePath" -ForegroundColor Red
        }
    } else {
        $totalSkipped++
        Write-Host "  ✓ 保留: $relativePath" -ForegroundColor Green
    }
}

# 清理 .cursor/plans/ 目录
Write-Host ""
Write-Host "清理 .cursor/plans/ 目录..." -ForegroundColor Yellow
if (Test-Path ".cursor\plans") {
    $planFiles = Get-ChildItem -Path ".cursor\plans" -Filter "*.md" -File -ErrorAction SilentlyContinue
    foreach ($file in $planFiles) {
        try {
            Remove-Item -Path $file.FullName -Force -ErrorAction Stop
            $totalDeleted++
            Write-Host "  🗑️  删除: .cursor\plans\$($file.Name)" -ForegroundColor Yellow
        } catch {
            Write-Host "  ❌ 无法删除: .cursor\plans\$($file.Name)" -ForegroundColor Red
        }
    }
}

# 删除根目录下的临时文档
Write-Host ""
Write-Host "清理根目录临时文档..." -ForegroundColor Yellow
$rootTempFiles = @(
    "WORKSPACE_MIGRATION_SUMMARY.md",
    "选择器重构完成总结.md",
    "选择器问题分析和修复计划.md"
)

foreach ($tempFile in $rootTempFiles) {
    if (Test-Path $tempFile) {
        try {
            Remove-Item -Path $tempFile -Force -ErrorAction Stop
            $totalDeleted++
            Write-Host "  🗑️  删除: $tempFile" -ForegroundColor Yellow
        } catch {
            Write-Host "  ❌ 无法删除: $tempFile" -ForegroundColor Red
        }
    }
}

# 显示统计
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ 清理完成！" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "统计信息：" -ForegroundColor Yellow
Write-Host "  总共找到: $totalFound 个文件" -ForegroundColor White
Write-Host "  已删除: $totalDeleted 个文件" -ForegroundColor Red
Write-Host "  已保留: $totalSkipped 个文件" -ForegroundColor Green
Write-Host ""

# 显示保留的重要文件类型
Write-Host "✅ 已保留的文件类型：" -ForegroundColor Green
Write-Host "  - README.md, CHANGELOG.md, LICENSE" -ForegroundColor Gray
Write-Host "  - docs/ 和 doc/ 目录下的所有文件" -ForegroundColor Gray
Write-Host "  - .github/ 目录下的文档" -ForegroundColor Gray
Write-Host "  - examples/ 目录下的文档" -ForegroundColor Gray
Write-Host ""
Write-Host "🗑️  已删除的文件类型：" -ForegroundColor Red
Write-Host "  - 优化报告、完成总结、项目计划" -ForegroundColor Gray
Write-Host "  - 实施进度、验证检查等临时文档" -ForegroundColor Gray
Write-Host "  - .cursor/plans/ 下的临时计划文件" -ForegroundColor Gray
Write-Host "  - 带 emoji 前缀的临时文档" -ForegroundColor Gray

