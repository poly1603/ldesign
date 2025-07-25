# LDesign 开发环境启动脚本
# PowerShell 版本

param(
    [string]$Mode = "dev",
    [switch]$Help,
    [switch]$Clean,
    [switch]$Install,
    [switch]$Test,
    [switch]$Docs,
    [switch]$Commit,
    [switch]$Update,
    [switch]$Init,
    [switch]$Main,
    [string]$Submodule = "",
    [string]$Message = "",
    [string]$Path = ""
)

# 显示帮助信息
if ($Help) {
    Write-Host "LDesign 开发环境启动脚本" -ForegroundColor Green
    Write-Host ""
    Write-Host "用法:" -ForegroundColor Yellow
    Write-Host "  .\scripts\dev.ps1 [选项]"
    Write-Host ""
    Write-Host "选项:" -ForegroundColor Yellow
    Write-Host "  -Mode <模式>    指定运行模式 (dev, build, test, docs)"
    Write-Host "  -Clean          清理所有构建产物和依赖"
    Write-Host "  -Install        安装依赖"
    Write-Host "  -Test           运行测试"
    Write-Host "  -Docs           启动文档服务器"
    Write-Host "  -Commit         提交代码"
    Write-Host "  -Update         更新代码"
    Write-Host "  -Init           初始化项目"
    Write-Host "  -Main           启动交互式主菜单"
    Write-Host "  -Submodule      管理 submodule (add|remove|list|modify)"
    Write-Host "  -Message        提交信息"
    Write-Host "  -Path           目标路径"
    Write-Host "  -Help           显示此帮助信息"
    Write-Host ""
    Write-Host "示例:" -ForegroundColor Yellow
    Write-Host "  .\scripts\dev.ps1                # 启动开发服务器"
    Write-Host "  .\scripts\dev.ps1 -Mode build    # 构建项目"
    Write-Host "  .\scripts\dev.ps1 -Clean         # 清理项目"
    Write-Host "  .\scripts\dev.ps1 -Docs          # 启动文档服务器"
    Write-Host "  .\scripts\dev.ps1 -Main          # 启动交互式菜单"
    Write-Host "  .\scripts\dev.ps1 -Commit        # 提交代码"
    Write-Host "  .\scripts\dev.ps1 -Update        # 更新代码"
    Write-Host "  .\scripts\dev.ps1 -Submodule list # 列出 submodule"
    exit 0
}

# 检查 Node.js 版本
function Check-NodeVersion {
    try {
        $nodeVersion = node --version
        $majorVersion = [int]($nodeVersion -replace "v(\d+)\..*", '$1')

        if ($majorVersion -lt 18) {
            Write-Host "❌ 需要 Node.js 18 或更高版本，当前版本: $nodeVersion" -ForegroundColor Red
            exit 1
        }

        Write-Host "✅ Node.js 版本检查通过: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 未找到 Node.js，请先安装 Node.js 18 或更高版本" -ForegroundColor Red
        exit 1
    }
}

# 检查 pnpm
function Check-Pnpm {
    try {
        $pnpmVersion = pnpm --version
        Write-Host "✅ pnpm 版本: $pnpmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ 未找到 pnpm，正在安装..." -ForegroundColor Yellow
        npm install -g pnpm
        Write-Host "✅ pnpm 安装完成" -ForegroundColor Green
    }
}

# 清理项目
function Clean-Project {
    Write-Host "🧹 清理项目..." -ForegroundColor Yellow

    if (Test-Path "node_modules") {
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "✅ 删除 node_modules" -ForegroundColor Green
    }

    if (Test-Path "pnpm-lock.yaml") {
        Remove-Item -Force "pnpm-lock.yaml"
        Write-Host "✅ 删除 pnpm-lock.yaml" -ForegroundColor Green
    }

    # 清理各个包的构建产物
    Get-ChildItem -Path "packages" -Directory | ForEach-Object {
        $distPath = Join-Path $_.FullName "dist"
        if (Test-Path $distPath) {
            Remove-Item -Recurse -Force $distPath
            Write-Host "✅ 删除 $($_.Name)/dist" -ForegroundColor Green
        }
    }

    # 清理文档构建产物
    $docsDistPath = "docs\.vitepress\dist"
    if (Test-Path $docsDistPath) {
        Remove-Item -Recurse -Force $docsDistPath
        Write-Host "✅ 删除文档构建产物" -ForegroundColor Green
    }

    # 清理测试覆盖率报告
    if (Test-Path "coverage") {
        Remove-Item -Recurse -Force "coverage"
        Write-Host "✅ 删除测试覆盖率报告" -ForegroundColor Green
    }

    Write-Host "🎉 项目清理完成" -ForegroundColor Green
}

# 安装依赖
function Install-Dependencies {
    Write-Host "📦 安装依赖..." -ForegroundColor Yellow
    pnpm install

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 依赖安装完成" -ForegroundColor Green
    } else {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
}

# 运行测试
function Run-Tests {
    Write-Host "🧪 运行测试..." -ForegroundColor Yellow

    Write-Host "运行代码检查..." -ForegroundColor Cyan
    pnpm lint

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 代码检查失败" -ForegroundColor Red
        exit 1
    }

    Write-Host "运行类型检查..." -ForegroundColor Cyan
    pnpm typecheck

    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 类型检查失败" -ForegroundColor Red
        exit 1
    }

    Write-Host "运行单元测试..." -ForegroundColor Cyan
    pnpm test

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ 所有测试通过" -ForegroundColor Green
    } else {
        Write-Host "❌ 测试失败" -ForegroundColor Red
        exit 1
    }
}

# 主函数
function Main {
    Write-Host "🚀 LDesign 开发环境" -ForegroundColor Magenta
    Write-Host "===================" -ForegroundColor Magenta

    # 检查环境
    Check-NodeVersion
    Check-Pnpm

    # 处理参数
    if ($Clean) {
        Clean-Project
        return
    }

    if ($Install) {
        Install-Dependencies
        return
    }

    if ($Test) {
        Run-Tests
        return
    }

    if ($Docs) {
        Write-Host "📚 启动文档服务器..." -ForegroundColor Yellow
        pnpm docs:dev
        return
    }

    if ($Commit) {
        Write-Host "📝 提交代码..." -ForegroundColor Yellow
        if ($Message) {
            pnpm script:commit $Path -m $Message
        } else {
            pnpm script:commit $Path
        }
        return
    }

    if ($Update) {
        Write-Host "🔄 更新代码..." -ForegroundColor Yellow
        if ($Path) {
            pnpm script:update $Path
        } else {
            pnpm script:update --all
        }
        return
    }

    if ($Init) {
        Write-Host "🚀 初始化项目..." -ForegroundColor Yellow
        pnpm script:init
        return
    }

    if ($Main) {
        Write-Host "🛠️ 启动交互式主菜单..." -ForegroundColor Yellow
        pnpm script:main
        return
    }

    if ($Submodule) {
        Write-Host "📦 管理 Submodule..." -ForegroundColor Yellow
        pnpm script:submodule $Submodule
        return
    }

    # 根据模式执行相应操作
    switch ($Mode) {
        "dev" {
            Write-Host "🔧 启动开发服务器..." -ForegroundColor Yellow
            pnpm dev
        }
        "build" {
            Write-Host "🏗️ 构建项目..." -ForegroundColor Yellow
            pnpm build
        }
        "test" {
            Run-Tests
        }
        "docs" {
            Write-Host "📚 构建文档..." -ForegroundColor Yellow
            pnpm docs:build
        }
        default {
            Write-Host "❌ 未知模式: $Mode" -ForegroundColor Red
            Write-Host "使用 -Help 查看可用选项" -ForegroundColor Yellow
            exit 1
        }
    }
}

# 执行主函数
Main
