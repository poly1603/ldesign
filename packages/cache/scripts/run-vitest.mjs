#!/usr/bin/env node
// Simplified Vitest runner with better error handling and cleaner output
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rawArgs = process.argv.slice(2)
const FAST_FLAG_INDEX = rawArgs.indexOf('--fast')
const isFast = FAST_FLAG_INDEX !== -1

if (isFast) rawArgs.splice(FAST_FLAG_INDEX, 1)

// Resolve vitest ESM entry
const vitestEntryUrl = new URL('../node_modules/vitest/vitest.mjs', import.meta.url)
const vitestEntryPath = fileURLToPath(vitestEntryUrl)

// Ensure non-watch runs exit: default to `run` subcommand unless explicitly watching/UI
const hasRunFlag = rawArgs.includes('--run') || rawArgs.includes('run')
const isWatchMode = rawArgs.includes('--watch') || rawArgs.includes('-w') || rawArgs.includes('--ui')

// Remove duplicates and conflicting options
const filteredArgs = rawArgs.filter(arg =>
  !['--reporter=basic', '--silent', '--bail=1'].includes(arg) &&
  !arg.startsWith('--reporter=') &&
  !arg.startsWith('--silent') &&
  !arg.startsWith('--bail=')
)

const vitestArgs = [
  vitestEntryPath,
  ...(hasRunFlag || isWatchMode ? [] : ['run']),
  ...filteredArgs,
  ...(isFast ? ['--bail=1', '--reporter=basic', '--silent'] : []),
]

const child = spawn(process.execPath, vitestArgs, {
  stdio: 'inherit',
  windowsHide: true,
})

// Set a reasonable timeout
const timeoutMs = Number(process.env.VITEST_TIMEOUT_MS || (isFast ? 60_000 : 120_000))
const timer = setTimeout(() => {
  console.error(`[vitest-wrapper] Timeout after ${timeoutMs}ms, killing Vitest.`)
  try {
    child.kill('SIGTERM')
    setTimeout(() => child.kill('SIGKILL'), 5000)
  } catch {}
  process.exit(124)
}, timeoutMs)

// Handle process signals
process.on('SIGINT', () => {
  clearTimeout(timer)
  child.kill('SIGTERM')
})

process.on('SIGTERM', () => {
  clearTimeout(timer)
  child.kill('SIGTERM')
})

child.on('close', (code) => {
  clearTimeout(timer)
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  clearTimeout(timer)
  console.error('[vitest-wrapper] Failed to start Vitest:', err)
  process.exit(1)
})

