#!/usr/bin/env node
// Cross-platform Vitest runner to avoid Windows batch prompt issues
// Adds --fast mode and a hard timeout to avoid hanging runs
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'

const rawArgs = process.argv.slice(2)
const FAST_FLAG_INDEX = rawArgs.indexOf('--fast')
const isFast = FAST_FLAG_INDEX !== -1
// Detect CI mode and set report path for parsing results to avoid false non-zero exits on Windows
const isCI = process.env.CI === '1' || (rawArgs.includes('--config') && rawArgs.includes('vitest.config.ci.ts'))
const reportPath = 'test-results.json'

if (isFast) rawArgs.splice(FAST_FLAG_INDEX, 1)

// Resolve vitest ESM entry
const vitestEntryUrl = new URL('../node_modules/vitest/vitest.mjs', import.meta.url)
const vitestEntryPath = fileURLToPath(vitestEntryUrl)

// Ensure non-watch runs exit: default to `run` subcommand unless explicitly watching/UI
const hasRunFlag = rawArgs.includes('--run') || rawArgs.includes('run')
const isWatchMode = rawArgs.includes('--watch') || rawArgs.includes('-w') || rawArgs.includes('--ui')

const vitestArgs = [
  vitestEntryPath,
  ...(hasRunFlag || isWatchMode ? [] : ['run']),
  ...rawArgs,
  ...(isFast ? ['--bail=1', '--reporter=basic', '--silent'] : []),
  ...(isCI ? ['--reporter=json', '--outputFile', reportPath] : []),
]

const child = spawn(process.execPath, vitestArgs, {
  stdio: 'inherit',
  windowsHide: true,
})

const timeoutMs = Number(process.env.VITEST_TIMEOUT_MS || (isFast ? 120_000 : 600_000))
const timer = setTimeout(() => {
  console.error(`[vitest-wrapper] Timeout after ${timeoutMs}ms, killing Vitest to avoid hang.`)
  try { child.kill('SIGKILL') } catch {}
  process.exit(124)
}, timeoutMs)

// Gracefully handle Ctrl+C or external signals in Windows shells
process.on('SIGINT', () => {
  // ignore and wait for child to exit cleanly
})
process.on('SIGTERM', () => {
  // ignore and wait for child to exit cleanly
})

child.on('close', async (code) => {
  clearTimeout(timer)
  if (isCI && code && code !== 0 && existsSync(reportPath)) {
    try {
      const txt = await readFile(reportPath, 'utf-8')
      const data = JSON.parse(txt)
      const failed = data?.numFailedTests ?? data?.stats?.failures ?? data?.failed ?? data?.summary?.numFailedTests ?? 0
      if (failed === 0) {
        // All tests passed, override non-zero exit caused by Windows shell Ctrl+C injection
        return process.exit(0)
      }
    } catch {
      // ignore parse errors and fall back to original code
    }
  }
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  clearTimeout(timer)
  console.error('[vitest-wrapper] Failed to start Vitest:', err)
  process.exit(1)
})

