# Batch fix builder configs - add output.format

$packages = @(
    'cache', 'color', 'crypto', 'device', 'engine', 
    'http', 'i18n', 'shared', 'size', 'store', 'template'
)

foreach ($pkg in $packages) {
    $configPath = "D:\WorkBench\ldesign\packages\$pkg\.ldesign\builder.config.ts"
    
    if (Test-Path $configPath) {
        $content = Get-Content $configPath -Raw
        
        # Check if output.format is already configured
        if ($content -notmatch 'output:\s*\{') {
            Write-Host "Fixing $pkg config..." -ForegroundColor Yellow
            
            # Add output config after defineConfig({
            $newContent = $content -replace '(defineConfig\(\{)', '$1
  // Output format config
  output: {
    format: [''esm'', ''cjs'', ''umd'']
  },
'
            
            Set-Content -Path $configPath -Value $newContent -Encoding UTF8
            Write-Host "OK $pkg config updated" -ForegroundColor Green
        } else {
            Write-Host "OK $pkg already has output config" -ForegroundColor Green
        }
    } else {
        Write-Host "ERROR $pkg config not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Complete!" -ForegroundColor Cyan
