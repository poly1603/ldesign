/**
 * Vitest 测试配置
 * 支持TypeScript、Vue组件测试和代码覆盖率
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    
    // 代码覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts',
        'src/**/*.d.ts',
        'src/**/types/**',
        'src/**/examples/**',
        'src/**/worker/*.ts', // Worker代码需要特殊测试环境
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },

    // 文件匹配规则
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'examples',
      'docs',
      'e2e',
    ],

    // 测试超时配置
    testTimeout: 10000,
    hookTimeout: 10000,

    // 并发配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },

    // 报告器配置
    reporters: ['verbose', 'html'],
    outputFile: {
      html: './test-results/index.html',
    },
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/api': resolve(__dirname, './src/api'),
      '@/engine': resolve(__dirname, './src/engine'),
      '@/cache': resolve(__dirname, './src/cache'),
      '@/worker': resolve(__dirname, './src/worker'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/adapters': resolve(__dirname, './src/adapters'),
    },
  },
})