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
      'cjs',
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
        'es/',
        'cjs/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData'
      ],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80
      }
    },
    
    // 超时设置
    testTimeout: 30000,
    
    // 并发设置
    threads: true,
    maxThreads: 4,
    minThreads: 1
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
