import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules/**', 'dist/**', 'coverage/**', 'examples/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'coverage/**',
        'tests/**',
        'examples/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // 入口文件通常只是导出，不需要测试覆盖
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    isolate: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/filesystem': resolve(__dirname, 'src/filesystem'),
      '@/network': resolve(__dirname, 'src/network'),
      '@/archive': resolve(__dirname, 'src/archive'),
      '@/git': resolve(__dirname, 'src/git'),
      '@/package': resolve(__dirname, 'src/package'),
      '@/ssl': resolve(__dirname, 'src/ssl'),
      '@/process': resolve(__dirname, 'src/process'),
      '@/logger': resolve(__dirname, 'src/logger'),
      '@/config': resolve(__dirname, 'src/config'),
      '@/cli': resolve(__dirname, 'src/cli'),
      '@/inquirer': resolve(__dirname, 'src/inquirer'),
      '@/notification': resolve(__dirname, 'src/notification'),
      '@/performance': resolve(__dirname, 'src/performance'),
      '@/database': resolve(__dirname, 'src/database'),
    },
  },
  esbuild: {
    target: 'node16',
  },
})
