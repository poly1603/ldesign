# 验证所有示例项目的构建状态
# PowerShell 脚本用于检查所有示例项目的输出目录

Write-Host "🔍 检查 Builder 示例项目构建状态..." -ForegroundColor Cyan
Write-Host ""

# 获取所有示例项目目录
$exampleProjects = Get-ChildItem -Path "." -Directory | Where-Object { 
    $_.Name -ne "BUILD_FIX_SUMMARY.md" -and $_.Name -ne "README.md" 
}

# 创建结果表格
$results = @()

foreach ($project in $exampleProjects) {
    $projectName = $project.Name
    $projectPath = $project.FullName
    
    # 检查输出目录
    $distExists = Test-Path "$projectPath\dist"
    $esExists = Test-Path "$projectPath\es"
    $libExists = Test-Path "$projectPath\lib"
    
    # 检查package.json是否存在
    $packageJsonExists = Test-Path "$projectPath\package.json"
    
    # 检查构建脚本是否存在
    $buildScriptExists = $false
    if ($packageJsonExists) {
        $packageJson = Get-Content "$projectPath\package.json" | ConvertFrom-Json
        $buildScriptExists = $packageJson.scripts.PSObject.Properties.Name -contains "build"
    }
    
    # 统计输出文件数量
    $distFileCount = if ($distExists) { (Get-ChildItem "$projectPath\dist" -Recurse -File).Count } else { 0 }
    $esFileCount = if ($esExists) { (Get-ChildItem "$projectPath\es" -Recurse -File).Count } else { 0 }
    $libFileCount = if ($libExists) { (Get-ChildItem "$projectPath\lib" -Recurse -File).Count } else { 0 }
    
    # 判断项目类型
    $projectType = "Unknown"
    if ($distExists -and $esExists -and $libExists) {
        $projectType = "Single Entry"
    } elseif (!$distExists -and $esExists -and $libExists) {
        $projectType = "Multi Entry"
    } elseif ($projectName -eq "style-library") {
        $projectType = "Style Library"
    }
    
    # 构建状态
    $buildStatus = if ($esExists -or $libExists -or $distExists) { "✅ Success" } else { "❌ Failed" }
    
    $results += [PSCustomObject]@{
        Project = $projectName
        Type = $projectType
        Status = $buildStatus
        Dist = if ($distExists) { "✅ ($distFileCount)" } else { "❌" }
        ES = if ($esExists) { "✅ ($esFileCount)" } else { "❌" }
        Lib = if ($libExists) { "✅ ($libFileCount)" } else { "❌" }
        BuildScript = if ($buildScriptExists) { "✅" } else { "❌" }
    }
}

# 显示结果表格
Write-Host "📊 构建状态总览:" -ForegroundColor Green
Write-Host ""
$results | Format-Table -AutoSize

# 统计信息
$totalProjects = $results.Count
$successfulBuilds = ($results | Where-Object { $_.Status -eq "✅ Success" }).Count
$failedBuilds = $totalProjects - $successfulBuilds

Write-Host ""
Write-Host "📈 统计信息:" -ForegroundColor Yellow
Write-Host "  总项目数: $totalProjects"
Write-Host "  构建成功: $successfulBuilds"
Write-Host "  构建失败: $failedBuilds"
Write-Host ""

# 按项目类型分组统计
$singleEntryProjects = ($results | Where-Object { $_.Type -eq "Single Entry" }).Count
$multiEntryProjects = ($results | Where-Object { $_.Type -eq "Multi Entry" }).Count
$styleLibraryProjects = ($results | Where-Object { $_.Type -eq "Style Library" }).Count

Write-Host "📋 项目类型分布:" -ForegroundColor Magenta
Write-Host "  单入口项目: $singleEntryProjects (支持 UMD 格式)"
Write-Host "  多入口项目: $multiEntryProjects (不支持 UMD 格式)"
Write-Host "  样式库项目: $styleLibraryProjects (仅 ESM 格式)"
Write-Host ""

# 检查是否所有项目都构建成功
if ($failedBuilds -eq 0) {
    Write-Host "🎉 所有示例项目构建成功！" -ForegroundColor Green
    Write-Host ""
    Write-Host "✨ 输出目录说明:" -ForegroundColor Cyan
    Write-Host "  • dist/ - UMD 格式文件（仅单入口项目）"
    Write-Host "  • es/   - ESM 格式文件（所有项目）"
    Write-Host "  • lib/  - CJS 格式文件（所有项目）"
    Write-Host ""
    Write-Host "🚀 所有项目都可以正常使用和发布！" -ForegroundColor Green
} else {
    Write-Host "⚠️  有 $failedBuilds 个项目构建失败，请检查！" -ForegroundColor Red
    
    # 显示失败的项目
    $failedProjects = $results | Where-Object { $_.Status -eq "❌ Failed" }
    if ($failedProjects.Count -gt 0) {
        Write-Host ""
        Write-Host "❌ 构建失败的项目:" -ForegroundColor Red
        $failedProjects | ForEach-Object {
            Write-Host "  • $($_.Project)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "📝 如需重新构建所有项目，请运行:" -ForegroundColor Blue
Write-Host "  Get-ChildItem -Directory | ForEach-Object { Set-Location `$_.FullName; pnpm build; Set-Location .. }"
Write-Host ""
