/**
 * Vitest 测试配置
 * 
 * 用于单元测试和集成测试
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  test: {
    // 测试环境配置
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        '**/*.d.ts',
        '**/*.config.*',
        'tests/',
        'docs/'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}'
    ],
    exclude: [
      'node_modules/',
      'dist/',
      'coverage/',
      'docs/'
    ],
    
    // 测试超时配置
    testTimeout: 10000,
    hookTimeout: 10000,
    
    // 并发配置
    threads: true,
    maxThreads: 4,
    minThreads: 1
  },
  
  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/server': resolve(__dirname, 'src/server'),
      '@/core': resolve(__dirname, 'src/core')
    }
  }
})
