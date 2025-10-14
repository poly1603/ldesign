# Fix ES module imports by adding .js extensions
$files = Get-ChildItem -Path "es" -Filter "*.js" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    
    # Fix relative imports
    $content = $content -replace "from '(\./[^']+)(?<!\.js)'", "from '`$1.js'"
    $content = $content -replace "from '(\.\.\/[^']+)(?<!\.js)'", "from '`$1.js'"
    
    Set-Content $file.FullName -Value $content -NoNewline
}

Write-Host "Fixed imports in $($files.Count) files"