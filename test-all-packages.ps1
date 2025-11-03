# 测试所有 engine 包的打包和 example 项目启动
# 使用 PowerShell 脚本

$ErrorActionPreference = "Stop"
$packages = @(
    "alpinejs",
    "angular",
    "astro",
    "lit",
    "nextjs",
    "nuxtjs",
    "preact",
    "qwik",
    "react",
    "remix",
    "solid",
    "svelte",
    "sveltekit",
    "vue"
)

$baseDir = "packages/engine/packages"
$results = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "开始测试所有包的打包和示例项目" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 函数：测试包打包
function Test-PackageBuild {
    param($packageName)
    
    $packagePath = Join-Path $baseDir $packageName
    
    if (-not (Test-Path $packagePath)) {
        Write-Host "❌ 包目录不存在: $packagePath" -ForegroundColor Red
        return $false
    }
    
    Write-Host "📦 测试包打包: $packageName" -ForegroundColor Yellow
    Write-Host "   路径: $packagePath" -ForegroundColor Gray
    
    Push-Location $packagePath
    
    try {
        # 清理之前的构建产物
        Write-Host "   🧹 清理构建产物..." -ForegroundColor Gray
        if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
        if (Test-Path "es") { Remove-Item -Recurse -Force "es" }
        if (Test-Path "lib") { Remove-Item -Recurse -Force "lib" }
        
        # 执行打包
        Write-Host "   🔨 执行打包: ldesign-builder build -f esm,cjs,umd,dts" -ForegroundColor Gray
        $buildOutput = & pnpm build 2>&1
        $buildExitCode = $LASTEXITCODE
        
        if ($buildExitCode -ne 0) {
            Write-Host "   ❌ 打包失败!" -ForegroundColor Red
            Write-Host $buildOutput -ForegroundColor Red
            return $false
        }
        
        # 检查构建产物
        $hasDist = Test-Path "dist"
        $hasEs = Test-Path "es"
        $hasLib = Test-Path "lib"
        
        Write-Host "   ✓ 打包完成" -ForegroundColor Green
        Write-Host "      - dist: $hasDist" -ForegroundColor Gray
        Write-Host "      - es: $hasEs" -ForegroundColor Gray
        Write-Host "      - lib: $hasLib" -ForegroundColor Gray
        
        return $true
    }
    catch {
        Write-Host "   ❌ 打包异常: $_" -ForegroundColor Red
        return $false
    }
    finally {
        Pop-Location
    }
}

# 函数：测试example项目启动
function Test-ExampleStart {
    param($packageName)
    
    $packagePath = Join-Path $baseDir $packageName
    $examplePath = Join-Path $packagePath "example"
    
    if (-not (Test-Path $examplePath)) {
        Write-Host "⚠️  示例项目不存在: $examplePath" -ForegroundColor Yellow
        return @{
            Success = $false
            Message = "示例项目不存在"
        }
    }
    
    Write-Host "🚀 测试示例项目启动: $packageName" -ForegroundColor Yellow
    Write-Host "   路径: $examplePath" -ForegroundColor Gray
    
    Push-Location $examplePath
    
    try {
        # 检查依赖是否安装
        if (-not (Test-Path "node_modules")) {
            Write-Host "   📥 安装依赖..." -ForegroundColor Gray
            $installOutput = & pnpm install 2>&1 | Out-String
            if ($LASTEXITCODE -ne 0) {
                Write-Host "   ❌ 依赖安装失败!" -ForegroundColor Red
                Write-Host $installOutput -ForegroundColor Red
                return @{
                    Success = $false
                    Message = "依赖安装失败"
                }
            }
            Write-Host "   ✓ 依赖安装完成" -ForegroundColor Green
        }
        
        # 检查 launcher.config.ts 是否存在
        $hasLauncherConfig = Test-Path "launcher.config.ts"
        if (-not $hasLauncherConfig) {
            Write-Host "   ⚠️  launcher.config.ts 不存在，跳过启动测试" -ForegroundColor Yellow
            return @{
                Success = $false
                Message = "launcher.config.ts 不存在"
            }
        }
        
        # 获取端口号（从 launcher.config.ts 读取）
        $configContent = Get-Content "launcher.config.ts" -Raw -ErrorAction SilentlyContinue
        $portMatch = [regex]::Match($configContent, 'port:\s*(\d+)')
        $port = if ($portMatch.Success) { $portMatch.Groups[1].Value } else { "5173" }
        
        Write-Host "   🔍 检测到端口: $port" -ForegroundColor Gray
        
        # 清理旧的日志文件
        Remove-Item "dev-output.log", "dev-error.log" -ErrorAction SilentlyContinue
        
        # 启动开发服务器（后台运行）
        Write-Host "   🚀 启动开发服务器..." -ForegroundColor Gray
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "pnpm"
        $psi.Arguments = "dev"
        $psi.WorkingDirectory = $examplePath
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        
        $devProcess = [System.Diagnostics.Process]::Start($psi)
        
        # 等待服务器启动，最多等待30秒
        Write-Host "   ⏳ 等待服务器启动（最多30秒）..." -ForegroundColor Gray
        $maxWait = 30
        $waited = 0
        $started = $false
        
        while ($waited -lt $maxWait) {
            if ($devProcess.HasExited) {
                $errorOutput = $devProcess.StandardError.ReadToEnd()
                Write-Host "   ❌ 服务器启动失败!" -ForegroundColor Red
                if ($errorOutput) {
                    Write-Host $errorOutput -ForegroundColor Red
                }
                return @{
                    Success = $false
                    Message = "服务器启动失败"
                }
            }
            
            # 尝试访问服务器
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    $started = $true
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
        
        if (-not $started) {
            Write-Host "   ⚠️  等待超时，无法确认服务器是否启动" -ForegroundColor Yellow
            Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
            return @{
                Success = $false
                Message = "等待超时"
            }
        }
        
        Write-Host "   ✓ 服务器启动成功，页面可访问!" -ForegroundColor Green
        
        # 停止服务器
        Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        
        return @{
            Success = $true
            Message = "启动成功，页面可访问"
            Port = $port
        }
    }
    catch {
        Write-Host "   ❌ 测试异常: $_" -ForegroundColor Red
        return @{
            Success = $false
            Message = "测试异常: $_"
        }
    }
    finally {
        Pop-Location
    }
}

# 测试所有包
$buildResults = @()
$exampleResults = @()

foreach ($package in $packages) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "测试包: $package" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    # 测试打包
    $buildSuccess = Test-PackageBuild -packageName $package
    $buildResults += @{
        Package = $package
        Success = $buildSuccess
    }
    
    # 测试示例项目启动
    $exampleResult = Test-ExampleStart -packageName $package
    $exampleResults += @{
        Package = $package
        Success = $exampleResult.Success
        Message = $exampleResult.Message
        Port = if ($exampleResult.Port) { $exampleResult.Port } else { $null }
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1
}

# 输出汇总报告
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试汇总报告" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📦 打包测试结果:" -ForegroundColor Yellow
$buildSuccessCount = ($buildResults | Where-Object { $_.Success }).Count
$buildTotalCount = $buildResults.Count
Write-Host "   成功: $buildSuccessCount / $buildTotalCount" -ForegroundColor $(if ($buildSuccessCount -eq $buildTotalCount) { "Green" } else { "Red" })

foreach ($result in $buildResults) {
    $status = if ($result.Success) { "✓" } else { "✗" }
    $color = if ($result.Success) { "Green" } else { "Red" }
    Write-Host "   $status $($result.Package)" -ForegroundColor $color
}

Write-Host ""
Write-Host "🚀 示例项目启动测试结果:" -ForegroundColor Yellow
$exampleSuccessCount = ($exampleResults | Where-Object { $_.Success }).Count
$exampleTotalCount = ($exampleResults | Where-Object { $_.Message -ne "示例项目不存在" }).Count
Write-Host "   成功: $exampleSuccessCount / $exampleTotalCount" -ForegroundColor $(if ($exampleSuccessCount -eq $exampleTotalCount) { "Green" } else { "Yellow" })

foreach ($result in $exampleResults) {
    if ($result.Message -eq "示例项目不存在") {
        Write-Host "   ⚠️  $($result.Package) - 示例项目不存在" -ForegroundColor Yellow
    }
    else {
        $status = if ($result.Success) { "✓" } else { "✗" }
        $color = if ($result.Success) { "Green" } else { "Red" }
        $portInfo = if ($result.Port) { " (端口: $($result.Port))" } else { "" }
        Write-Host "   $status $($result.Package)$portInfo - $($result.Message)" -ForegroundColor $color
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

