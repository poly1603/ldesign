# 处理剩余的三个包
$token = $env:GITHUB_TOKEN
$username = "poly1603"

$packages = @(
    @{ dir = "tools/generator"; repo = "ldesign-generator"; desc = "LDesign code generator" },
    @{ dir = "tools/deps"; repo = "ldesign-deps"; desc = "LDesign dependency manager" },
    @{ dir = "tools/security"; repo = "ldesign-security"; desc = "LDesign security scanner" }
)

foreach ($pkg in $packages) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Processing: $($pkg.repo)" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    # 创建 GitHub 仓库
    Write-Host "Creating GitHub repo: $($pkg.repo)" -ForegroundColor Yellow
    $headers = @{
        Authorization = "token $token"
        Accept = "application/vnd.github.v3+json"
    }
    $body = @{
        name = $pkg.repo
        description = $pkg.desc
        private = $false
    } | ConvertTo-Json
    
    try {
        Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json" | Out-Null
        Write-Host "Repo created successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "Repo may already exist" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 2
    
    # 初始化并推送
    Write-Host "Initializing and pushing..." -ForegroundColor Yellow
    Push-Location $pkg.dir
    
    git init
    git add .
    git commit -m "feat: initial commit for $($pkg.repo)" 2>$null
    git remote remove origin 2>$null
    git remote add origin "https://${token}@github.com/${username}/$($pkg.repo).git"
    git branch -M main
    git push -u origin main --force
    
    Pop-Location
    Write-Host "Done!" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "All repositories created!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Created repositories:" -ForegroundColor Yellow
Write-Host "  - https://github.com/$username/ldesign-git" -ForegroundColor Cyan
Write-Host "  - https://github.com/$username/ldesign-generator" -ForegroundColor Cyan
Write-Host "  - https://github.com/$username/ldesign-deps" -ForegroundColor Cyan
Write-Host "  - https://github.com/$username/ldesign-security" -ForegroundColor Cyan

