# LDesign 一键打包 PowerShell 包装脚本
# 此脚本用于在 Windows PowerShell 中方便地调用 TypeScript 脚本

param(
    [switch]$Clean,
    [switch]$Verbose,
    [switch]$DryRun,
    [switch]$SkipTests,
    [switch]$Help
)

# 显示帮助信息
if ($Help) {
    Write-Host @"
LDesign 一键打包脚本
===================

用法:
  .\scripts\build-all.ps1 [选项]

选项:
  -Clean        清理后构建
  -Verbose      详细输出
  -DryRun       模拟运行（不实际构建）
  -SkipTests    跳过测试
  -Help         显示此帮助信息

示例:
  .\scripts\build-all.ps1
  .\scripts\build-all.ps1 -Clean
  .\scripts\build-all.ps1 -Clean -Verbose
  .\scripts\build-all.ps1 -DryRun

更多信息请查看: scripts/README.md
"@
    exit 0
}

# 检查 tsx 是否安装
$tsxPath = Get-Command tsx -ErrorAction SilentlyContinue
if (-not $tsxPath) {
    Write-Host "❌ 错误: 未找到 tsx 命令" -ForegroundColor Red
    Write-Host "请先安装 tsx: pnpm add -g tsx" -ForegroundColor Yellow
    exit 1
}

# 构建参数
$args = @()
if ($Clean) { $args += "--clean" }
if ($Verbose) { $args += "--verbose" }
if ($DryRun) { $args += "--dry-run" }
if ($SkipTests) { $args += "--skip-tests" }

# 执行脚本
$scriptPath = Join-Path $PSScriptRoot "build-all.ts"
Write-Host "执行: tsx $scriptPath $($args -join ' ')" -ForegroundColor Cyan
Write-Host ""

& tsx $scriptPath @args

# 传递退出码
exit $LASTEXITCODE
