# GitHub Configuration
$GITHUB_USER = "poly1603"
$GITHUB_TOKEN = $env:GITHUB_TOKEN
$REPO_PREFIX = "ldesign-"

# Directories to convert
$directories = @(
    @{Path = "packages\tabs"; Name = "tabs"},
    @{Path = "packages\menu"; Name = "menu"},
    @{Path = "tools\publisher"; Name = "publisher"}
)

function Create-GitHubRepo {
    param($RepoName)
    
    $headers = @{
        "Authorization" = "token $GITHUB_TOKEN"
        "Accept" = "application/vnd.github.v3+json"
    }
    
    $body = @{
        name = $RepoName
        private = $false
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
        Write-Host "[OK] Created repo: $RepoName" -ForegroundColor Green
        return $response.clone_url
    } catch {
        Write-Host "[ERROR] Failed to create repo: $RepoName - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Convert-ToSubmodule {
    param($DirPath, $DirName)
    
    $repoName = "$REPO_PREFIX$DirName"
    $fullPath = Join-Path $PWD $DirPath
    $tempPath = Join-Path $env:TEMP "$repoName-temp"
    
    Write-Host "`n=== Processing $DirPath ===" -ForegroundColor Cyan
    
    # 1. Create GitHub repository
    Write-Host "Step 1: Creating GitHub repository..."
    $cloneUrl = Create-GitHubRepo -RepoName $repoName
    if (-not $cloneUrl) {
        Write-Host "Skipping $DirPath" -ForegroundColor Yellow
        return
    }
    
    # 2. Copy directory to temp location
    Write-Host "Step 2: Copying code to temp directory..."
    if (Test-Path $tempPath) {
        Remove-Item $tempPath -Recurse -Force
    }
    Copy-Item $fullPath $tempPath -Recurse
    
    # 3. Initialize git in temp directory and push
    Write-Host "Step 3: Initializing Git and pushing..."
    Push-Location $tempPath
    try {
        git init
        git add .
        git commit -m "Initial commit from ldesign monorepo"
        git branch -M main
        
        # Use authenticated URL with token
        $authUrl = $cloneUrl -replace "https://", "https://${GITHUB_USER}:${GITHUB_TOKEN}@"
        git remote add origin $authUrl
        git push -u origin main
        
        Write-Host "[OK] Push successful" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] Git operation failed: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location
        return
    }
    Pop-Location
    
    # 4. Remove directory from main repo
    Write-Host "Step 4: Removing directory from main repo..."
    Push-Location $PWD
    git rm -rf $DirPath
    git commit -m "Remove $DirPath (converting to submodule)"
    Pop-Location
    
    # 5. Add as submodule
    Write-Host "Step 5: Adding as submodule..."
    Push-Location $PWD
    git submodule add $cloneUrl $DirPath
    git commit -m "Add $DirPath as submodule"
    Pop-Location
    
    # 6. Clean up temp directory
    Remove-Item $tempPath -Recurse -Force
    
    Write-Host "[OK] Completed $DirPath" -ForegroundColor Green
}

# Main execution
Write-Host "Starting conversion to submodules..." -ForegroundColor Cyan
Write-Host "GitHub User: $GITHUB_USER" -ForegroundColor Yellow
Write-Host "Repo Prefix: $REPO_PREFIX" -ForegroundColor Yellow

foreach ($dir in $directories) {
    Convert-ToSubmodule -DirPath $dir.Path -DirName $dir.Name
}

Write-Host "`n=== All Done ===" -ForegroundColor Green
Write-Host "Run the following command to check submodules:" -ForegroundColor Yellow
Write-Host "git submodule status" -ForegroundColor White
