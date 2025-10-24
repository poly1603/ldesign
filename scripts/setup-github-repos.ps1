# PowerShell 脚本：创建 GitHub 仓库并推送代码

$GITHUB_USERNAME = "poly1603"
$GITHUB_TOKEN = $env:GITHUB_TOKEN

$packages = @(
    @{
        name = '@ldesign/git'
        dir = 'tools/git'
        repoName = 'ldesign-git'
        description = 'LDesign Git工具 - Git操作、仓库管理、提交分析'
    },
    @{
        name = '@ldesign/generator'
        dir = 'tools/generator'
        repoName = 'ldesign-generator'
        description = 'LDesign代码生成器 - 快速生成组件、页面、配置文件等'
    },
    @{
        name = '@ldesign/deps'
        dir = 'tools/deps'
        repoName = 'ldesign-deps'
        description = 'LDesign依赖管理工具 - 依赖分析、更新检查、版本管理'
    },
    @{
        name = '@ldesign/security'
        dir = 'tools/security'
        repoName = 'ldesign-security'
        description = 'LDesign安全工具 - 依赖安全扫描、漏洞检测、代码审计'
    }
)

Write-Host "🚀 开始设置 GitHub 仓库..." -ForegroundColor Green
Write-Host ""

foreach ($pkg in $packages) {
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "处理包: $($pkg.name)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 1. 创建 GitHub 仓库
    Write-Host "📦 创建 GitHub 仓库: $($pkg.repoName)" -ForegroundColor Yellow
    
    $body = @{
        name = $pkg.repoName
        description = $pkg.description
        private = $false
    } | ConvertTo-Json
    
    try {
        $headers = @{
            "Authorization" = "token $GITHUB_TOKEN"
            "Accept" = "application/vnd.github.v3+json"
        }
        
        Invoke-RestMethod -Uri "https://api.github.com/user/repos" `
            -Method Post `
            -Headers $headers `
            -Body $body `
            -ContentType "application/json" | Out-Null
        
        Write-Host "✅ 仓库创建成功: https://github.com/$GITHUB_USERNAME/$($pkg.repoName)" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  仓库可能已存在" -ForegroundColor Yellow
    }
    
    Start-Sleep -Seconds 2
    
    # 2. 初始化 Git 并推送
    Write-Host ""
    Write-Host "🔧 初始化 Git 仓库: $($pkg.dir)" -ForegroundColor Yellow
    
    $packagePath = Join-Path $PSScriptRoot "..\$($pkg.dir)"
    
    Push-Location $packagePath
    
    try {
        # 初始化 Git
        if (!(Test-Path ".git")) {
            git init
            Write-Host "  ✓ Git 仓库初始化完成" -ForegroundColor Gray
        }
        else {
            Write-Host "  ✓ Git 仓库已存在" -ForegroundColor Gray
        }
        
        # 添加文件
        git add .
        Write-Host "  ✓ 文件已添加" -ForegroundColor Gray
        
        # 提交
        git commit -m "feat: initial commit for $($pkg.name)" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✓ 提交成功" -ForegroundColor Gray
        }
        else {
            Write-Host "  ✓ 无需提交（可能已提交）" -ForegroundColor Gray
        }
        
        # 设置远程仓库
        $remoteUrl = "https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/$($pkg.repoName).git"
        
        git remote remove origin 2>$null
        git remote add origin $remoteUrl
        Write-Host "  ✓ 远程仓库已配置" -ForegroundColor Gray
        
        # 重命名分支为 main
        git branch -M main
        
        # 推送
        Write-Host "  📤 推送到 GitHub..." -ForegroundColor Gray
        git push -u origin main --force
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 推送成功" -ForegroundColor Green
        }
        else {
            Write-Host "❌ 推送失败" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ 处理失败: $_" -ForegroundColor Red
    }
    finally {
        Pop-Location
    }
    
    Write-Host ""
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "✨ 所有包处理完成！" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 已创建的仓库:" -ForegroundColor Yellow
foreach ($pkg in $packages) {
    Write-Host "  - https://github.com/$GITHUB_USERNAME/$($pkg.repoName)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📌 如需在主项目中配置为子模块，请在主项目根目录运行:" -ForegroundColor Yellow
foreach ($pkg in $packages) {
    Write-Host "  git submodule add https://github.com/$GITHUB_USERNAME/$($pkg.repoName).git $($pkg.dir)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ 完成！" -ForegroundColor Green

