# GitHub 配置
$GITHUB_USER = "poly1603"
$GITHUB_TOKEN = $env:GITHUB_TOKEN
$REPO_PREFIX = "ldesign-"

# 要转换的目录
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
        Write-Host "✓ 创建仓库: $RepoName" -ForegroundColor Green
        return $response.clone_url
    } catch {
        Write-Host "✗ 创建仓库失败: $RepoName - $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Convert-ToSubmodule {
    param($DirPath, $DirName)
    
    $repoName = "$REPO_PREFIX$DirName"
    $fullPath = Join-Path $PWD $DirPath
    $tempPath = Join-Path $env:TEMP "$repoName-temp"
    
    Write-Host "`n=== 处理 $DirPath ===" -ForegroundColor Cyan
    
    # 1. 创建 GitHub 仓库
    Write-Host "1. 创建 GitHub 仓库..."
    $cloneUrl = Create-GitHubRepo -RepoName $repoName
    if (-not $cloneUrl) {
        Write-Host "跳过 $DirPath" -ForegroundColor Yellow
        return
    }
    
    # 2. 复制目录到临时位置
    Write-Host "2. 复制代码到临时目录..."
    if (Test-Path $tempPath) {
        Remove-Item $tempPath -Recurse -Force
    }
    Copy-Item $fullPath $tempPath -Recurse
    
    # 3. 在临时目录初始化 git 并推送
    Write-Host "3. 初始化 Git 仓库并推送..."
    Push-Location $tempPath
    try {
        git init
        git add .
        git commit -m "Initial commit from ldesign monorepo"
        git branch -M main
        
        # 使用 token 认证的 URL
        $authUrl = $cloneUrl -replace "https://", "https://${GITHUB_USER}:${GITHUB_TOKEN}@"
        git remote add origin $authUrl
        git push -u origin main
        
        Write-Host "✓ 推送成功" -ForegroundColor Green
    } catch {
        Write-Host "✗ Git 操作失败: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location
        return
    }
    Pop-Location
    
    # 4. 从主仓库移除目录
    Write-Host "4. 从主仓库移除目录..."
    Push-Location $PWD
    git rm -rf $DirPath
    git commit -m "Remove $DirPath (converting to submodule)"
    Pop-Location
    
    # 5. 添加为 submodule
    Write-Host "5. 添加为 submodule..."
    Push-Location $PWD
    git submodule add $cloneUrl $DirPath
    git commit -m "Add $DirPath as submodule"
    Pop-Location
    
    # 6. 清理临时目录
    Remove-Item $tempPath -Recurse -Force
    
    Write-Host "✓ 完成 $DirPath" -ForegroundColor Green
}

# 主流程
Write-Host "开始转换目录为 submodules..." -ForegroundColor Cyan
Write-Host "GitHub 用户: $GITHUB_USER" -ForegroundColor Yellow
Write-Host "仓库前缀: $REPO_PREFIX" -ForegroundColor Yellow

foreach ($dir in $directories) {
    Convert-ToSubmodule -DirPath $dir.Path -DirName $dir.Name
}

Write-Host "`n=== 全部完成 ===" -ForegroundColor Green
Write-Host "请运行以下命令查看 submodules:" -ForegroundColor Yellow
Write-Host "git submodule status" -ForegroundColor White
