# 验证清理结果脚本

Write-Host "=== 验证清理结果 ===" -ForegroundColor Cyan
Write-Host ""

# 1. 验证桥接插件包已删除
Write-Host "1. 验证桥接插件包已删除..." -ForegroundColor Yellow
$bridgePlugins = @(
    "packages\engine\packages\plugins\i18n-bridge",
    "packages\engine\packages\plugins\color-bridge",
    "packages\engine\packages\plugins\size-bridge"
)

$allDeleted = $true
foreach ($plugin in $bridgePlugins) {
    $exists = Test-Path $plugin
    if ($exists) {
        Write-Host "  ❌ $plugin 仍然存在" -ForegroundColor Red
        $allDeleted = $false
    } else {
        Write-Host "  ✅ $plugin 已删除" -ForegroundColor Green
    }
}

if ($allDeleted) {
    Write-Host "  ✅ 所有桥接插件包已成功删除" -ForegroundColor Green
}
Write-Host ""

# 2. 验证 shared-state 包已删除
Write-Host "2. 验证 shared-state 包已删除..." -ForegroundColor Yellow
$sharedStateExists = Test-Path "packages\shared-state"
if ($sharedStateExists) {
    Write-Host "  ❌ packages\shared-state 仍然存在" -ForegroundColor Red
} else {
    Write-Host "  ✅ packages\shared-state 已删除" -ForegroundColor Green
}
Write-Host ""

# 3. 验证 package.json 已更新
Write-Host "3. 验证 package.json 已更新..." -ForegroundColor Yellow
$packageJson = Get-Content "apps\app-vue\package.json" -Raw
$hasBridgePlugins = $packageJson -match "@ldesign/engine-plugin-.*-bridge"
if ($hasBridgePlugins) {
    Write-Host "  ❌ package.json 仍包含桥接插件依赖" -ForegroundColor Red
} else {
    Write-Host "  ✅ package.json 已移除桥接插件依赖" -ForegroundColor Green
}
Write-Host ""

# 4. 验证 main.ts 已更新
Write-Host "4. 验证 main.ts 已更新..." -ForegroundColor Yellow
$mainTs = Get-Content "apps\app-vue\src\main.ts" -Raw
$hasBridgeImports = $mainTs -match "createI18nBridgePlugin|createColorBridgePlugin|createSizeBridgePlugin"
$hasStateBridge = $mainTs -match "connectAllToEngine"

if ($hasBridgeImports) {
    Write-Host "  ❌ main.ts 仍包含桥接插件导入" -ForegroundColor Red
} else {
    Write-Host "  ✅ main.ts 已移除桥接插件导入" -ForegroundColor Green
}

if ($hasStateBridge) {
    Write-Host "  ✅ main.ts 已添加应用层桥接" -ForegroundColor Green
} else {
    Write-Host "  ❌ main.ts 未添加应用层桥接" -ForegroundColor Red
}
Write-Host ""

# 5. 验证 state-bridge.ts 存在
Write-Host "5. 验证 state-bridge.ts 存在..." -ForegroundColor Yellow
$stateBridgeExists = Test-Path "apps\app-vue\src\utils\state-bridge.ts"
if ($stateBridgeExists) {
    Write-Host "  ✅ state-bridge.ts 存在" -ForegroundColor Green
} else {
    Write-Host "  ❌ state-bridge.ts 不存在" -ForegroundColor Red
}
Write-Host ""

# 6. 总结
Write-Host "=== 验证总结 ===" -ForegroundColor Cyan
Write-Host ""

$allPassed = $allDeleted -and (-not $sharedStateExists) -and (-not $hasBridgePlugins) -and (-not $hasBridgeImports) -and $hasStateBridge -and $stateBridgeExists

if ($allPassed) {
    Write-Host "All checks passed! Cleanup completed successfully." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Run 'cd apps\app-vue; pnpm dev' to start the app" -ForegroundColor White
    Write-Host "  2. Verify i18n, color, size state bridging works" -ForegroundColor White
    Write-Host "  3. Check browser console for errors" -ForegroundColor White
} else {
    Write-Host "Some checks failed. Please review the errors above." -ForegroundColor Red
}
Write-Host ""

