# Batch fix library builder configs - add output.format

$libraries = @(
    'cropper', 'editor', 'flowchart', 'form', 'pdf'
)

foreach ($lib in $libraries) {
    $configPath = "D:\WorkBench\ldesign\library\$lib\.ldesign\builder.config.ts"
    
    if (Test-Path $configPath) {
        $content = Get-Content $configPath -Raw
        
        # Check if output.format is already configured
        if ($content -notmatch 'output:\s*\{') {
            Write-Host "Fixing $lib config..." -ForegroundColor Yellow
            
            # Add output config after defineConfig({
            $newContent = $content -replace '(defineConfig\(\{)', '$1
  // Output format config
  output: {
    format: [''esm'', ''cjs'', ''umd'']
  },
'
            
            Set-Content -Path $configPath -Value $newContent -Encoding UTF8
            Write-Host "OK $lib config updated" -ForegroundColor Green
        } else {
            Write-Host "OK $lib already has output config" -ForegroundColor Green
        }
    } else {
        Write-Host "ERROR $lib config not found" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Complete!" -ForegroundColor Cyan
