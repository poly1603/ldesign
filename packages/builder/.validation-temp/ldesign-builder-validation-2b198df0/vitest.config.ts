/**
 * Vitest 配置文件
 * 用于单元测试和集成测试
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',

    // 全局设置
    globals: true,

    // 测试设置文件
    setupFiles: ['./src/__tests__/setup.ts'],

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.idea',
      '.git',
      '.cache'
    ],

    // 覆盖率配置
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/cli/**'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },

    // 超时设置
    testTimeout: 60000, // 增加到60秒
    hookTimeout: 30000, // 钩子超时

    // 并发设置
    threads: false, // 禁用多线程以避免资源竞争
    maxConcurrency: 1, // 限制并发数

    // 内存管理
    pool: 'forks',
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1
      }
    },

    // 隔离设置
    isolate: true,

    // 重试设置
    retry: 1
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@core': resolve(__dirname, './src/core'),
      '@types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils')
    }
  }
})
