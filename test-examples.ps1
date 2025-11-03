# 测试所有包的example项目启动
$ErrorActionPreference = "Continue"
$packages = @(
    @{Name="vue"; Port=5100},
    @{Name="react"; Port=5101},
    @{Name="solid"; Port=5102},
    @{Name="svelte"; Port=5103},
    @{Name="preact"; Port=5104},
    @{Name="alpinejs"; Port=5105},
    @{Name="lit"; Port=5106},
    @{Name="angular"; Port=5107},
    @{Name="astro"; Port=5108},
    @{Name="nextjs"; Port=5109},
    @{Name="nuxtjs"; Port=5110},
    @{Name="qwik"; Port=5111},
    @{Name="remix"; Port=5112},
    @{Name="sveltekit"; Port=5113}
)

$baseDir = "packages/engine/packages"
$results = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始测试所有包的example项目启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($pkg in $packages) {
    $packageName = $pkg.Name
    $packagePath = Join-Path $baseDir $packageName
    $examplePath = Join-Path $packagePath "example"
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "测试包: $packageName" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    if (-not (Test-Path $examplePath)) {
        Write-Host "⚠️  示例项目不存在: $examplePath" -ForegroundColor Yellow
        $results += @{
            Package = $packageName
            Success = $false
            Message = "示例项目不存在"
        }
        continue
    }
    
    Push-Location $examplePath
    
    try {
        # 检查依赖
        if (-not (Test-Path "node_modules")) {
            Write-Host "📥 安装依赖..." -ForegroundColor Yellow
            $installOutput = & pnpm install 2>&1 | Out-String
            if ($LASTEXITCODE -ne 0) {
                Write-Host "❌ 依赖安装失败!" -ForegroundColor Red
                Write-Host $installOutput -ForegroundColor Red
                $results += @{
                    Package = $packageName
                    Success = $false
                    Message = "依赖安装失败"
                }
                continue
            }
            Write-Host "✓ 依赖安装完成" -ForegroundColor Green
        }
        
        # 检查 launcher.config.ts
        $hasLauncherConfig = Test-Path "launcher.config.ts"
        if (-not $hasLauncherConfig) {
            Write-Host "⚠️  launcher.config.ts 不存在" -ForegroundColor Yellow
            $results += @{
                Package = $packageName
                Success = $false
                Message = "launcher.config.ts 不存在"
            }
            continue
        }
        
        # 读取端口号
        $configContent = Get-Content "launcher.config.ts" -Raw -ErrorAction SilentlyContinue
        $portMatch = [regex]::Match($configContent, 'port:\s*(\d+)')
        $port = if ($portMatch.Success) { $portMatch.Groups[1].Value } else { $pkg.Port }
        
        Write-Host "🔍 检测到端口: $port" -ForegroundColor Gray
        
        # 启动开发服务器
        Write-Host "🚀 启动开发服务器..." -ForegroundColor Yellow
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "pnpm"
        $psi.Arguments = "dev"
        $psi.WorkingDirectory = $examplePath
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        
        $devProcess = [System.Diagnostics.Process]::Start($psi)
        
        # 等待服务器启动
        Write-Host "⏳ 等待服务器启动（最多30秒）..." -ForegroundColor Gray
        $maxWait = 30
        $waited = 0
        $started = $false
        
        while ($waited -lt $maxWait) {
            if ($devProcess.HasExited) {
                $errorOutput = $devProcess.StandardError.ReadToEnd()
                Write-Host "❌ 服务器启动失败!" -ForegroundColor Red
                if ($errorOutput) {
                    Write-Host $errorOutput -ForegroundColor Red
                }
                $results += @{
                    Package = $packageName
                    Success = $false
                    Message = "服务器启动失败"
                    Port = $port
                }
                $started = $false
                break
            }
            
            # 尝试访问服务器
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $started = $true
                    Write-Host "✓ 服务器启动成功，页面可访问!" -ForegroundColor Green
                    break
                }
            }
            catch {
                # 服务器还没启动，继续等待
            }
            
            Start-Sleep -Seconds 2
            $waited += 2
            Write-Host "   ... 已等待 $waited 秒" -ForegroundColor Gray
        }
        
        if ($started) {
            # 停止服务器
            Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 1
            
            $results += @{
                Package = $packageName
                Success = $true
                Message = "启动成功，页面可访问"
                Port = $port
            }
            
            # 打开浏览器
            Write-Host "🌐 打开浏览器访问 http://localhost:$port ..." -ForegroundColor Yellow
            Start-Process "http://localhost:$port"
            Start-Sleep -Seconds 2
        }
        else {
            if (-not $devProcess.HasExited) {
                Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
            }
            $results += @{
                Package = $packageName
                Success = $false
                Message = "等待超时"
                Port = $port
            }
        }
    }
    catch {
        Write-Host "❌ 测试异常: $_" -ForegroundColor Red
        $results += @{
            Package = $packageName
            Success = $false
            Message = "测试异常: $_"
        }
    }
    finally {
        Pop-Location
    }
}

# 输出汇总
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试汇总" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count

Write-Host ""
Write-Host "🚀 Example启动结果: $successCount / $totalCount 成功" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

foreach ($result in $results) {
    $status = if ($result.Success) { "✓" } else { "✗" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    $portInfo = if ($result.Port) { " (端口: $($result.Port))" } else { "" }
    Write-Host "  $status $($result.Package)$portInfo - $($result.Message)" -ForegroundColor $color
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan










