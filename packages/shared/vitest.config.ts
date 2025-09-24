/**
 * Vitest 配置文件
 * 用于单元测试和集成测试
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],

  test: {
    // 测试环境
    environment: 'jsdom',

    // 全局设置
    globals: true,

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      'es',
      'lib',
      'types',
      'types-temp',
      'temp_vue_files',
      'test-build',
      '.idea',
      '.git',
      '.cache'
    ],

    // 覆盖率配置
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        'es/',
        'lib/',
        'types/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'scripts/',
        'temp_vue_files/',
        'test-build/'
      ],
      thresholds: {
        branches: 85,
        functions: 85,
        lines: 85,
        statements: 85
      }
    },

    // 超时设置
    testTimeout: 30000,
    hookTimeout: 10000,

    // 并发设置
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 测试报告
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html'
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/components': resolve(__dirname, './src/components')
    }
  }
})
