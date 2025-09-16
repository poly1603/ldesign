/**
 * Vitest CI 配置
 * 专门用于 CI/CD 环境的测试配置
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // CI 环境配置
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        'es/',
        'cjs/',
        'types/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/test-setup.ts',
        '**/__tests__/**',
        '**/coverage/**',
        '**/docs/**',
        '**/examples/**'
      ],
      include: ['src/**/*.ts'],
      // CI 环境下的覆盖率阈值
      thresholds: {
        global: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        },
        perFile: {
          branches: 100,
          functions: 100,
          lines: 100,
          statements: 100
        }
      },
      skipFull: false,
      all: true
    },
    
    // 测试文件匹配
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/lib/**',
      '**/es/**',
      '**/cjs/**',
      '**/types/**',
      '**/coverage/**',
      '**/docs/**',
      '**/examples/**',
      '**/.{idea,git,cache,output,temp}/**'
    ],
    
    // 超时配置
    testTimeout: 30000,
    hookTimeout: 10000,
    
    // 并发配置
    threads: true,
    maxThreads: 4,
    minThreads: 1,
    
    // 报告配置
    reporter: [
      'verbose',
      'json',
      'junit'
    ],
    
    outputFile: {
      json: './test-results.json',
      junit: './junit.xml'
    },
    
    // 监听模式禁用（CI 环境）
    watch: false,
    
    // 失败时立即停止
    bail: 1,
    
    // 重试配置
    retry: 2,
    
    // 性能配置
    isolate: true,
    pool: 'threads',
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      CI: 'true'
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './__tests__')
    }
  },
  
  // 定义全局变量
  define: {
    __TEST__: true,
    __CI__: true
  }
})
