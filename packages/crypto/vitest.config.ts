import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'node',
    setupFiles: ['test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules',
        'test',
        'tests',
        'e2e',
        '*.config.ts',
        '*.config.js',
        'dist',
        'lib',
        'es',
        'esm',
        'cjs',
        'types',
        'docs',
        'examples',
        'scripts',
        '**/*.d.ts',
        '**/debug-*.js',
        '**/debug-*.ts',
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
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'test/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts}',
    ],
    // 测试超时设置
    testTimeout: 10000,
    hookTimeout: 10000,
    // 并发设置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
    // 报告器设置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
})
