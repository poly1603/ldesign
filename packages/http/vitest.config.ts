import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**', // 排除E2E测试
    ],
    // 抑制测试中的预期错误输出
    silent: false,
    reporter: 'default',
    onConsoleLog: (log, type) => {
      // 过滤掉预期的错误信息和警告
      if (type === 'stderr' && (
        log.includes('Recovery strategy')
        || log.includes('Cache read error')
        || log.includes('Cache write error')
        || log.includes('Failed to install http plugin')
        || log.includes('[Vue warn]')
        || log.includes('Invalid engine context')
      )) {
        return false
      }
      return true
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'examples/',
        'docs/',
        '*.config.*',
        'scripts/',
        'src/**/*.d.ts',
        'src/**/types.ts',
        'src/**/index.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
