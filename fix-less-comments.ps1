# 修复 Vue 文件中 LESS 样式部分的注释问题
# 将 // 注释替换为 /* */ 注释

$templatePath = "packages/template/src/templates"
$vueFiles = Get-ChildItem -Path $templatePath -Recurse -Filter "*.vue"

foreach ($file in $vueFiles) {
    Write-Host "处理文件: $($file.FullName)"
    
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content
    
    # 简单的字符串替换方法
    # 查找样式块中的 // 注释并替换为 /* */ 注释
    $lines = $content -split "`n"
    $inStyleBlock = $false
    $isLessStyle = $false

    for ($i = 0; $i -lt $lines.Length; $i++) {
        $line = $lines[$i]

        # 检测是否进入样式块
        if ($line -match '<style[^>]*lang="less"[^>]*>') {
            $inStyleBlock = $true
            $isLessStyle = $true
        }
        elseif ($line -match '<style[^>]*>') {
            $inStyleBlock = $true
            $isLessStyle = $false
        }
        elseif ($line -match '</style>') {
            $inStyleBlock = $false
            $isLessStyle = $false
        }

        # 如果在 LESS 样式块中，替换 // 注释
        if ($inStyleBlock -and $isLessStyle -and $line -match '^\s*//\s*(.*)$') {
            $commentText = $matches[1]
            $lines[$i] = $line -replace '^\s*//\s*(.*)$', "/* $commentText */"
        }
    }

    $content = $lines -join "`n"
    
    # 如果内容有变化，则写回文件
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ 已修复 LESS 注释"
    } else {
        Write-Host "  - 无需修复"
    }
}

Write-Host "所有文件处理完成！"
