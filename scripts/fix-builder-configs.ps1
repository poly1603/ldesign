# 批量修复 builder 配置，添加 output.format

$packages = @(
    'cache', 'color', 'crypto', 'device', 'engine', 
    'http', 'i18n', 'shared', 'size', 'store', 'template'
)

foreach ($pkg in $packages) {
    $configPath = "D:\WorkBench\ldesign\packages\$pkg\.ldesign\builder.config.ts"
    
    if (Test-Path $configPath) {
        $content = Get-Content $configPath -Raw
        
        # 检查是否已有 output.format 配置
        if ($content -notmatch 'output:\s*\{') {
            Write-Host "修复 $pkg 配置..." -ForegroundColor Yellow
            
            # 在 defineConfig({ 后面添加 output 配置
            $newContent = $content -replace '(defineConfig\(\{)', "`$1`n  // 输出格式配置`n  output: {`n    format: ['esm', 'cjs', 'umd']`n  },`n"
            
            Set-Content -Path $configPath -Value $newContent -Encoding UTF8
            Write-Host "✓ $pkg 配置已更新" -ForegroundColor Green
        } else {
            Write-Host "✓ $pkg 配置已包含 output" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ $pkg 配置文件不存在" -ForegroundColor Red
    }
}

Write-Host "
Done!" -ForegroundColor Cyan
