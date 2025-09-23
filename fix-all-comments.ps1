# 批量修复 Vue 文件中 LESS 样式块的注释问题
# 将 // 注释替换为 /* */ 注释

$templateDir = "packages\template\src\templates"

# 获取所有 Vue 文件
$vueFiles = Get-ChildItem -Path $templateDir -Recurse -Filter "*.vue"

Write-Host "找到 $($vueFiles.Count) 个 Vue 文件"

$totalFixed = 0

foreach ($file in $vueFiles) {
    Write-Host "处理文件: $($file.FullName)"
    
    # 读取文件内容
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    $lines = $content -split "`n"
    
    $inStyleBlock = $false
    $isLessStyle = $false
    $modified = $false
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # 检测样式块开始
        if ($line -match '<style.*lang="less"') {
            $inStyleBlock = $true
            $isLessStyle = $true
            Write-Host "  找到 LESS 样式块开始: 行 $($i + 1)"
        } elseif ($line -match '<style' -and $line -notmatch 'lang="less"') {
            $inStyleBlock = $true
            $isLessStyle = $false
        } elseif ($line -match '</style>') {
            if ($inStyleBlock -and $isLessStyle) {
                Write-Host "  LESS 样式块结束: 行 $($i + 1)"
            }
            $inStyleBlock = $false
            $isLessStyle = $false
        }
        
        # 如果在 LESS 样式块中，替换 // 注释
        if ($inStyleBlock -and $isLessStyle) {
            # 匹配行首的 // 注释（可能有前导空格）
            if ($line -match '^(\s*)//\s*(.*)$') {
                $indent = $matches[1]
                $comment = $matches[2]
                $newLine = "$indent/* $comment */"
                $lines[$i] = $newLine
                Write-Host "    修复行首注释: 行 $($i + 1): '$($line.Trim())' -> '$($newLine.Trim())'"
                $modified = $true
            }
            
            # 匹配行内的 // 注释（但不包含已有的 /* */ 注释）
            if ($line -match '^(.+?)(\s+)//\s*(.*)$' -and $line -notmatch '/\*' -and $line -notmatch '\*/') {
                $code = $matches[1]
                $space = $matches[2]
                $comment = $matches[3]
                $newLine = "$code$space/* $comment */"
                $lines[$i] = $newLine
                Write-Host "    修复行内注释: 行 $($i + 1): '$($line.Trim())' -> '$($newLine.Trim())'"
                $modified = $true
            }
        }
    }
    
    if ($modified) {
        # 写回文件
        $newContent = $lines -join "`n"
        Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
        Write-Host "  ✓ 修复了 $($file.FullName)"
        $totalFixed++
    } else {
        Write-Host "  无需修复 $($file.FullName)"
    }
}

Write-Host ""
Write-Host "修复完成！共修复了 $totalFixed 个文件"
