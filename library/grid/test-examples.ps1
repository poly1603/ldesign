# Grid Examples 自动化测试 PowerShell 脚本
# 功能：启动三个示例项目并自动打开浏览器

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Grid Examples 自动化启动和测试" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 配置
$examples = @(
    @{Name="Vue Demo"; Path=".\examples\vue-demo"; Port=5173; URL="http://localhost:5173"},
    @{Name="React Demo"; Path=".\examples\react-demo"; Port=5174; URL="http://localhost:5174"},
    @{Name="Vanilla Demo"; Path=".\examples\vanilla-demo"; Port=5175; URL="http://localhost:5175"}
)

# 存储进程
$jobs = @()

# 检查端口是否被占用
function Test-PortInUse {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connections.Count -gt 0
}

# 清理函数
function Cleanup {
    Write-Host "`n🧹 清理进程..." -ForegroundColor Yellow
    foreach ($job in $jobs) {
        try {
            Stop-Job -Job $job -ErrorAction SilentlyContinue
            Remove-Job -Job $job -ErrorAction SilentlyContinue
        } catch {
            Write-Host "清理进程失败: $_" -ForegroundColor Red
        }
    }
}

# 注册清理处理
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
    Cleanup
}

try {
    # 检查并清理端口
    Write-Host "🔍 检查端口占用..." -ForegroundColor Yellow
    foreach ($example in $examples) {
        if (Test-PortInUse -Port $example.Port) {
            Write-Host "⚠️  端口 $($example.Port) 已被占用，尝试释放..." -ForegroundColor Yellow
            $processId = (Get-NetTCPConnection -LocalPort $example.Port -ErrorAction SilentlyContinue).OwningProcess
            if ($processId) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
            }
        }
    }
    Write-Host "✅ 端口检查完成`n" -ForegroundColor Green

    # 启动所有示例项目
    Write-Host "📦 启动所有示例项目...`n" -ForegroundColor Cyan
    
    foreach ($example in $examples) {
        Write-Host "🚀 启动 $($example.Name)..." -ForegroundColor Green
        
        $job = Start-Job -ScriptBlock {
            param($path, $port)
            Set-Location $path
            pnpm dev --port $port
        } -ArgumentList $example.Path, $example.Port
        
        $jobs += $job
        Write-Host "   → 任务已启动 (JobId: $($job.Id))" -ForegroundColor Gray
    }

    # 等待服务器启动
    Write-Host "`n⏳ 等待服务器启动 (15秒)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    # 检查服务器状态
    Write-Host "`n🔍 检查服务器状态..." -ForegroundColor Cyan
    $allReady = $true
    foreach ($example in $examples) {
        try {
            $response = Invoke-WebRequest -Uri $example.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $($example.Name) 运行正常: $($example.URL)" -ForegroundColor Green
            } else {
                Write-Host "⚠️  $($example.Name) 状态异常: $($response.StatusCode)" -ForegroundColor Yellow
                $allReady = $false
            }
        } catch {
            Write-Host "❌ $($example.Name) 无法访问: $($example.URL)" -ForegroundColor Red
            $allReady = $false
        }
    }

    if (-not $allReady) {
        Write-Host "`n⚠️  部分服务器未能正常启动，但将继续打开浏览器..." -ForegroundColor Yellow
    }

    # 打开浏览器
    Write-Host "`n🌐 打开浏览器访问所有示例..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2

    foreach ($example in $examples) {
        Write-Host "   → 打开 $($example.Name): $($example.URL)" -ForegroundColor Gray
        Start-Process $example.URL
        Start-Sleep -Seconds 1
    }

    Write-Host "`n✅ 所有浏览器标签已打开！" -ForegroundColor Green
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host "测试说明：" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "1. 请在浏览器中检查每个示例页面" -ForegroundColor White
    Write-Host "2. 验证 Grid 布局是否正常显示" -ForegroundColor White
    Write-Host "3. 测试拖拽功能是否正常工作" -ForegroundColor White
    Write-Host "4. 测试响应式布局（调整浏览器窗口大小）" -ForegroundColor White
    Write-Host "5. 检查控制台是否有错误信息" -ForegroundColor White
    Write-Host "`n按 Ctrl+C 退出并清理所有进程" -ForegroundColor Yellow
    Write-Host "============================================================`n" -ForegroundColor Cyan

    # 保持脚本运行并显示日志
    Write-Host "📊 实时日志输出：`n" -ForegroundColor Cyan
    while ($true) {
        foreach ($job in $jobs) {
            $output = Receive-Job -Job $job -ErrorAction SilentlyContinue
            if ($output) {
                Write-Host $output
            }
        }
        Start-Sleep -Seconds 2
    }

} catch {
    Write-Host "`n❌ 错误: $_" -ForegroundColor Red
    Cleanup
    exit 1
} finally {
    # 这里不清理，让用户手动终止
}
