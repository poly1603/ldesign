/**
 * @ldesign/theme - Vitest 单元测试配置
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局设置
    globals: true,

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 包含的测试文件
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // 排除的文件
    exclude: ['node_modules', 'dist', 'tests/e2e', '.idea', '.git', '.cache'],

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // 测试超时
    testTimeout: 10000,
    hookTimeout: 10000,

    // 并发配置
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 监听模式配置
    watch: {
      ignore: ['node_modules/**', 'dist/**', 'coverage/**'],
    },

    // 报告器
    reporter: ['verbose', 'json'],
    outputFile: {
      json: './test-results/unit-results.json',
    },

    // 模拟配置
    deps: {
      inline: ['@ldesign/theme', '@ldesign/color'],
    },
  },

  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/theme': resolve(__dirname, '../../src'),
      '@ldesign/color': resolve(__dirname, '../../../color/src'),
    },
  },

  // 定义全局变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
