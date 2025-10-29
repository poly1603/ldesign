$files = Get-ChildItem -Path . -Filter "*.md" -Recurse -File -ErrorAction SilentlyContinue | Where-Object { 
    $_.DirectoryName -notlike "*node_modules*" -and 
    $_.DirectoryName -notlike "*\dist*" -and 
    $_.DirectoryName -notlike "*\es*" -and 
    $_.DirectoryName -notlike "*\lib*" -and
    $_.DirectoryName -notlike "*.git*"
}

$deleted = 0
$kept = 0

foreach ($file in $files) {
    $path = $file.FullName.Replace((Get-Location).Path + '\', '')
    $name = $file.Name
    
    # Keep docs/ and examples/ directories
    if ($path -like "*\docs\*" -or $path -like "docs\*" -or 
        $path -like "*\doc\*" -or $path -like "doc\*" -or
        $path -like "*\examples\*" -or $path -like "examples\*" -or
        $path -like "*\example\*" -or $path -like "example\*" -or
        $path -like "*\.github\*" -or $path -like ".github\*") {
        $kept++
        continue
    }
    
    # Keep important files
    if ($name -eq "README.md" -or $name -eq "CHANGELOG.md" -or 
        $name -eq "LICENSE.md" -or $name -eq "LICENSE" -or 
        $name -eq "CONTRIBUTING.md") {
        $kept++
        continue
    }
    
    # Delete temporary docs
    $shouldDelete = $false
    $patterns = @("OPTIMIZATION", "OPTIMIZ", "COMPLETE", "COMPLETION", "SUMMARY", 
                  "IMPLEMENTATION", "PROGRESS", "STATUS", "PLAN", "FINAL", "MIGRATION",
                  "VERIFICATION", "GUIDE", "REPORT", "ANALYSIS", "REVIEW", "AUDIT")
    
    foreach ($pattern in $patterns) {
        if ($name -like "*$pattern*") {
            $shouldDelete = $true
            break
        }
    }
    
    # Delete emoji files
    if ($name -match "[🎉✅🚀📚🎊📖📋✨🌟🎯🏆⭐💡🔧📝🎁]") {
        $shouldDelete = $true
    }
    
    # Delete Chinese temp docs
    if ($name -match "[优化完成总结实施进度计划最终迁移验证指南报告分析]") {
        $shouldDelete = $true
    }
    
    if ($shouldDelete) {
        Remove-Item -Path $file.FullName -Force -ErrorAction SilentlyContinue
        $deleted++
        if ($deleted % 100 -eq 0) {
            Write-Host "已删除 $deleted 个文件..." -ForegroundColor Yellow
        }
    } else {
        $kept++
    }
}

Write-Host ""
Write-Host "Clean completed!" -ForegroundColor Green
Write-Host "Deleted: $deleted files" -ForegroundColor Red
Write-Host "Kept: $kept files" -ForegroundColor Green

