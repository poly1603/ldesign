# 为所有子模块添加 branch = main

$submodulesWithoutBranch = @(
    "libraries/3d-viewer", "libraries/chart", "libraries/code-editor", "libraries/cropper",
    "libraries/editor", "libraries/excel", "libraries/flowchart", "libraries/form",
    "libraries/grid", "libraries/lottie", "libraries/lowcode", "libraries/map",
    "libraries/office-document", "libraries/pdf", "libraries/progress", "libraries/qrcode",
    "libraries/table", "libraries/webcomponent", "libraries/word",
    "libraries/datepicker", "libraries/barcode", "libraries/calendar", "libraries/gantt",
    "libraries/markdown", "libraries/mindmap", "libraries/player", "libraries/signature",
    "libraries/timeline", "libraries/tree", "libraries/upload", "libraries/video",
    "packages/cache", "packages/color", "packages/crypto", "packages/device",
    "packages/engine", "packages/http", "packages/i18n", "packages/size",
    "packages/store", "packages/template", "packages/router", "packages/shared",
    "packages/logger", "packages/auth",
    "tools/builder", "tools/kit", "tools/launcher", "tools/cli",
    "tools/deployer", "tools/docs-generator", "tools/monitor", "tools/publisher",
    "tools/deps", "tools/generator", "tools/git", "tools/security",
    "tools/formatter", "tools/translator", "tools/mock", "tools/performance",
    "tools/env", "tools/changelog", "tools/testing", "tools/server",
    "tools/node-manager", "tools/project-manager", "tools/configmate", "tools/web",
    "tools/benchmark"
)

foreach ($submodule in $submodulesWithoutBranch) {
    Write-Host "Adding branch = main to $submodule" -ForegroundColor Cyan
    git config --file .gitmodules "submodule.$submodule.branch" "main"
}

Write-Host "`nDone! Updated .gitmodules" -ForegroundColor Green
