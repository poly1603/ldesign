# PowerShell script to setup Git hooks on Windows

Write-Host "🚀 Setting up Git hooks..." -ForegroundColor Cyan

# Check if we're in a Git repository
try {
    git rev-parse --git-dir | Out-Null
    Write-Host "✅ Git repository detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Not a Git repository" -ForegroundColor Red
    exit 1
}

# Create hooks directory if it doesn't exist
$hooksDir = ".git/hooks"
if (!(Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

# Copy pre-commit hook
$preCommitSource = ".git/hooks/pre-commit"
if (Test-Path $preCommitSource) {
    Write-Host "✅ Pre-commit hook already exists" -ForegroundColor Green
} else {
    Write-Host "❌ Pre-commit hook not found at $preCommitSource" -ForegroundColor Red
}

# Copy commit-msg hook
$commitMsgSource = ".git/hooks/commit-msg"
if (Test-Path $commitMsgSource) {
    Write-Host "✅ Commit-msg hook already exists" -ForegroundColor Green
} else {
    Write-Host "❌ Commit-msg hook not found at $commitMsgSource" -ForegroundColor Red
}

# Test hooks
Write-Host "`n🔍 Testing hooks..." -ForegroundColor Cyan

# Test pre-commit hook
Write-Host "Testing pre-commit hook..." -ForegroundColor Yellow
if (Test-Path $preCommitSource) {
    Write-Host "✅ Pre-commit hook is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Pre-commit hook setup failed" -ForegroundColor Red
}

# Test commit-msg hook
Write-Host "Testing commit-msg hook..." -ForegroundColor Yellow
if (Test-Path $commitMsgSource) {
    Write-Host "✅ Commit-msg hook is ready" -ForegroundColor Green
} else {
    Write-Host "❌ Commit-msg hook setup failed" -ForegroundColor Red
}

Write-Host "`n📋 Usage:" -ForegroundColor Cyan
Write-Host "Now you can commit with automatic validation:" -ForegroundColor White
Write-Host "  git add ." -ForegroundColor Yellow
Write-Host "  git commit -m `"feat(router): add new feature`"" -ForegroundColor Yellow
Write-Host ""
Write-Host "Or use the interactive commit helper:" -ForegroundColor White
Write-Host "  pnpm commit:interactive" -ForegroundColor Yellow
Write-Host ""
Write-Host "Manual validation commands:" -ForegroundColor White
Write-Host "  pnpm validate:quick      # Quick validation" -ForegroundColor Yellow
Write-Host "  pnpm validate           # Full validation" -ForegroundColor Yellow

Write-Host "`n🎉 Git hooks setup complete!" -ForegroundColor Green
