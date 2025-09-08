param(
  [string[]]$Examples,
  [switch]$NoBuild,
  [switch]$NoTest,
  [switch]$FailFast
)

$ErrorActionPreference = 'Stop'
$PSStyle.OutputRendering = 'Host'

# 默认示例列表
$default = @(
  'angular-lib',
  'basic-typescript',
  'complex-library',
  'lit-components',
  'mixed-library',
  'multi-module-typescript',
  'react-components',
  'style-library',
  'typescript-utils',
  'vue3-components',
  'preact-components',
  'solid-components',
  'svelte-components'
)

if (-not $Examples -or $Examples.Count -eq 0) {
  $Examples = $default
}

$examplesRoot = Resolve-Path (Join-Path $PSScriptRoot '..\examples')
$summary = @()
$hasFail = $false

foreach ($name in $Examples) {
  $dir = Join-Path $examplesRoot $name
  if (-not (Test-Path $dir)) {
    Write-Host "[SKIP] $name (目录不存在)" -ForegroundColor Yellow
    continue
  }

  Write-Host "=== $name ===" -ForegroundColor Cyan
  Push-Location $dir
  try {
    $bcode = 0
    $tcode = $null

    if (-not $NoBuild) {
      npm run build
      $bcode = $LASTEXITCODE
      if ($bcode -ne 0) { $hasFail = $true }
    }

    if (-not $NoTest -and (Test-Path 'test-build-artifacts.js')) {
      Write-Host "--- test $name ---" -ForegroundColor DarkCyan
      node .\test-build-artifacts.js
      $tcode = $LASTEXITCODE
      if ($tcode -ne 0) { $hasFail = $true }
    }

    $summary += [PSCustomObject]@{
      example = $name
      build   = if ($NoBuild) { $null } else { $bcode }
      test    = if ($NoTest) { $null } else { $tcode }
    }

    if ($FailFast -and $hasFail) { break }
  } finally {
    Pop-Location
  }
}

Write-Host "`n==== SUMMARY ====" -ForegroundColor Green
foreach ($s in $summary) {
  $b = if ($null -eq $s.build) {'SKIP'} elseif ($s.build -eq 0) {'OK  '} else {'FAIL'}
  $t = if ($null -eq $s.test)  {'SKIP'} elseif ($s.test  -eq 0) {'OK  '} else {'FAIL'}
  $color = if ($b -eq 'FAIL' -or $t -eq 'FAIL') { 'Red' } else { 'Green' }
  Write-Host ("{0,-28} build:{1,-4} test:{2,-4}" -f $s.example, $b, $t) -ForegroundColor $color
}

if ($hasFail) { exit 1 } else { exit 0 }

