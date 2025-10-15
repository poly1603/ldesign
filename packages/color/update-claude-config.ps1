# Claude Configuration Updater Script
# 用于更新所有 Claude 相关配置的 PowerShell 脚本

param(
    [Parameter(Mandatory=$false)]
    [string]$Token,
    [Parameter(Mandatory=$false)]
    [string]$Url
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Claude 配置更新工具 v1.0" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 如果没有通过参数传入，则交互式输入
if (-not $Token) {
    Write-Host "请输入新的 AUTH TOKEN:" -ForegroundColor Yellow
    $Token = Read-Host
}

if (-not $Url) {
    Write-Host "请输入新的 BASE URL:" -ForegroundColor Yellow
    $Url = Read-Host
}

# 验证输入
if ([string]::IsNullOrWhiteSpace($Token) -or [string]::IsNullOrWhiteSpace($Url)) {
    Write-Host "错误：Token 和 URL 都不能为空！" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "新配置信息：" -ForegroundColor Green
Write-Host "Token: $Token" -ForegroundColor White
Write-Host "URL: $Url" -ForegroundColor White
Write-Host ""

# 创建备份目录
$backupDir = "$env:USERPROFILE\.claude_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "备份目录: $backupDir" -ForegroundColor DarkGray

# 1. 更新用户环境变量（永久生效）
Write-Host ""
Write-Host "[1/6] 更新用户环境变量..." -ForegroundColor Yellow
try {
    [Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $Token, "User")
    [Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $Url, "User")
    Write-Host "✅ 用户环境变量更新成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 用户环境变量更新失败: $_" -ForegroundColor Red
}

# 2. 更新系统环境变量（需要管理员权限）
Write-Host ""
Write-Host "[2/6] 检查系统环境变量..." -ForegroundColor Yellow
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if ($isAdmin) {
    try {
        [Environment]::SetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", $Token, "Machine")
        [Environment]::SetEnvironmentVariable("ANTHROPIC_BASE_URL", $Url, "Machine")
        Write-Host "✅ 系统环境变量更新成功" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ 系统环境变量更新失败（可能不存在）: $_" -ForegroundColor Yellow
    }
} else {
    # 检查系统环境变量是否存在
    $sysToken = [Environment]::GetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN", "Machine")
    $sysUrl = [Environment]::GetEnvironmentVariable("ANTHROPIC_BASE_URL", "Machine")
    if ($sysToken -or $sysUrl) {
        Write-Host "⚠️ 检测到系统环境变量存在，但需要管理员权限更新" -ForegroundColor Yellow
        Write-Host "   请以管理员身份运行此脚本来更新系统环境变量" -ForegroundColor Yellow
    } else {
        Write-Host "✅ 系统环境变量不存在（无需更新）" -ForegroundColor Green
    }
}

# 3. 更新 PowerShell Profile
Write-Host ""
Write-Host "[3/6] 更新 PowerShell 配置文件..." -ForegroundColor Yellow
$profiles = @(
    "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1",
    "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1",
    "D:\Users\Document\WindowsPowerShell\Microsoft.PowerShell_profile.ps1"  # 你的特殊路径
)

foreach ($profilePath in $profiles) {
    if (Test-Path $profilePath) {
        Write-Host "   找到配置文件: $profilePath" -ForegroundColor DarkGray
        
        # 备份原文件
        $backupPath = Join-Path $backupDir (Split-Path $profilePath -Leaf)
        Copy-Item $profilePath $backupPath -Force
        
        # 读取文件内容
        $content = Get-Content $profilePath -Raw
        
        # 检查是否包含 ANTHROPIC 相关配置
        if ($content -match 'ANTHROPIC_AUTH_TOKEN|ANTHROPIC_BASE_URL') {
            # 替换现有配置
            $content = $content -replace '\$env:ANTHROPIC_AUTH_TOKEN\s*=\s*"[^"]*"', "`$env:ANTHROPIC_AUTH_TOKEN = `"$Token`""
            $content = $content -replace '\$env:ANTHROPIC_BASE_URL\s*=\s*"[^"]*"', "`$env:ANTHROPIC_BASE_URL = `"$Url`""
            Set-Content $profilePath $content -Force
            Write-Host "   ✅ 已更新: $profilePath" -ForegroundColor Green
        } else {
            # 添加新配置
            $newConfig = @"

# Claude Code 环境变量配置
`$env:ANTHROPIC_AUTH_TOKEN = "$Token"
`$env:ANTHROPIC_BASE_URL = "$Url"
"@
            Add-Content $profilePath $newConfig
            Write-Host "   ✅ 已添加配置到: $profilePath" -ForegroundColor Green
        }
    }
}

# 4. 更新 ~/.claude/config.json
Write-Host ""
Write-Host "[4/6] 更新 ~/.claude/config.json..." -ForegroundColor Yellow
$claudeConfigPath = "$env:USERPROFILE\.claude\config.json"
if (Test-Path $claudeConfigPath) {
    # 备份
    Copy-Item $claudeConfigPath "$backupDir\config.json" -Force
    
    # 创建新配置
    $configJson = @{
        env = @{
            ANTHROPIC_AUTH_TOKEN = $Token
            ANTHROPIC_BASE_URL = $Url
        }
    } | ConvertTo-Json -Depth 10
    
    Set-Content $claudeConfigPath $configJson -Force
    Write-Host "✅ 已更新 ~/.claude/config.json" -ForegroundColor Green
} else {
    # 创建目录和文件
    $claudeDir = "$env:USERPROFILE\.claude"
    if (-not (Test-Path $claudeDir)) {
        New-Item -ItemType Directory -Path $claudeDir -Force | Out-Null
    }
    
    $configJson = @{
        env = @{
            ANTHROPIC_AUTH_TOKEN = $Token
            ANTHROPIC_BASE_URL = $Url
        }
    } | ConvertTo-Json -Depth 10
    
    Set-Content $claudeConfigPath $configJson -Force
    Write-Host "✅ 已创建 ~/.claude/config.json" -ForegroundColor Green
}

# 5. 更新 ~/.claude.json (如果存在)
Write-Host ""
Write-Host "[5/6] 检查 ~/.claude.json..." -ForegroundColor Yellow
$claudeJsonPath = "$env:USERPROFILE\.claude.json"
if (Test-Path $claudeJsonPath) {
    # 备份
    Copy-Item $claudeJsonPath "$backupDir\.claude.json" -Force
    Write-Host "✅ 已备份 ~/.claude.json" -ForegroundColor Green
    Write-Host "   注意: ~/.claude.json 主要存储使用历史，不包含认证配置" -ForegroundColor DarkGray
}

# 6. 更新当前 PowerShell 会话
Write-Host ""
Write-Host "[6/6] 更新当前会话环境变量..." -ForegroundColor Yellow
$env:ANTHROPIC_AUTH_TOKEN = $Token
$env:ANTHROPIC_BASE_URL = $Url
Write-Host "✅ 当前会话环境变量更新成功" -ForegroundColor Green

# 显示总结
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "          更新完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ 所有配置已更新为：" -ForegroundColor Green
Write-Host "   Token: $Token" -ForegroundColor White
Write-Host "   URL: $Url" -ForegroundColor White
Write-Host ""
Write-Host "📁 备份已保存到: $backupDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ 重要提示：" -ForegroundColor Yellow
Write-Host "   1. 请关闭所有 PowerShell 窗口并重新打开" -ForegroundColor White
Write-Host "   2. 如果存在系统环境变量，请以管理员身份运行脚本" -ForegroundColor White
Write-Host "   3. 运行 'claude' 命令测试新配置是否生效" -ForegroundColor White
Write-Host ""

# 询问是否立即测试
Write-Host "是否立即在当前会话测试连接？(Y/N): " -NoNewline -ForegroundColor Yellow
$test = Read-Host
if ($test -eq 'Y' -or $test -eq 'y') {
    Write-Host ""
    Write-Host "测试环境变量..." -ForegroundColor Cyan
    Write-Host "ANTHROPIC_AUTH_TOKEN: $env:ANTHROPIC_AUTH_TOKEN" -ForegroundColor DarkGray
    Write-Host "ANTHROPIC_BASE_URL: $env:ANTHROPIC_BASE_URL" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "正在启动 Claude..." -ForegroundColor Cyan
    & claude
}
