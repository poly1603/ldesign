# 清理所有子模块的非 main 分支

$submodules = @(
    "apps/app-vue",
    "libraries/3d-viewer", "libraries/barcode", "libraries/calendar", "libraries/chart",
    "libraries/code-editor", "libraries/cropper", "libraries/datepicker", "libraries/editor",
    "libraries/excel", "libraries/flowchart", "libraries/form", "libraries/gantt",
    "libraries/grid", "libraries/lottie", "libraries/lowcode", "libraries/map",
    "libraries/markdown", "libraries/mindmap", "libraries/office-document", "libraries/pdf",
    "libraries/player", "libraries/progress", "libraries/qrcode", "libraries/signature",
    "libraries/table", "libraries/timeline", "libraries/tree", "libraries/upload",
    "libraries/video", "libraries/webcomponent", "libraries/word",
    "packages/auth", "packages/cache", "packages/color", "packages/crypto",
    "packages/device", "packages/engine", "packages/error", "packages/http",
    "packages/i18n", "packages/logger", "packages/notification", "packages/permission",
    "packages/router", "packages/shared", "packages/size", "packages/store",
    "packages/template", "packages/tracker",
    "tools/app", "tools/benchmark", "tools/builder", "tools/changelog",
    "tools/cli", "tools/configmate", "tools/deployer", "tools/deps",
    "tools/docs-generator", "tools/env", "tools/formatter", "tools/generator",
    "tools/git", "tools/kit", "tools/launcher", "tools/mock",
    "tools/monitor", "tools/node-manager", "tools/performance", "tools/project-manager",
    "tools/publisher", "tools/security", "tools/server", "tools/submodule",
    "tools/testing", "tools/translator", "tools/web"
)

foreach ($submodule in $submodules) {
    Write-Host "Processing $submodule..." -ForegroundColor Cyan
    
    # 获取所有远程分支
    $remoteBranches = git -C $submodule --no-pager branch -r 2>$null | ForEach-Object { $_.Trim() }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Skipping (not initialized)" -ForegroundColor Yellow
        continue
    }
    
    # 过滤出需要删除的分支（不是 main 且不是 HEAD）
    $branchesToDelete = $remoteBranches | Where-Object { 
        $_ -notmatch "origin/main" -and $_ -notmatch "HEAD" 
    } | ForEach-Object {
        $_ -replace "origin/", ""
    }
    
    if ($branchesToDelete.Count -gt 0) {
        Write-Host "  Found branches to delete: $($branchesToDelete -join ', ')" -ForegroundColor Yellow
        
        foreach ($branch in $branchesToDelete) {
            try {
                git -C $submodule push origin --delete $branch 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✓ Deleted remote branch: $branch" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ Failed to delete: $branch" -ForegroundColor Red
                }
            } catch {
                Write-Host "    ✗ Error deleting $branch : $_" -ForegroundColor Red
            }
        }
        
        # 清理本地分支引用
        git -C $submodule fetch --prune origin 2>&1 | Out-Null
    } else {
        Write-Host "  ✓ Already clean (only main branch)" -ForegroundColor Green
    }
}

Write-Host "`nDone!" -ForegroundColor Green
