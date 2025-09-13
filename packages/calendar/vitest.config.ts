import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局测试配置
    globals: true,
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'es/',
        'cjs/',
        'coverage/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/examples/**',
        '**/docs/**'
      ],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    
    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      'tests/**/*.{test,spec}.{js,ts}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'es',
      'cjs',
      'coverage',
      'docs'
    ],
    
    // 测试超时时间
    testTimeout: 10000,
    
    // 钩子超时时间
    hookTimeout: 10000,
    
    // 并发测试
    threads: true,
    
    // 监听模式下的文件变化
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'es/**',
      'cjs/**',
      'coverage/**'
    ]
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/themes': resolve(__dirname, 'src/themes'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types')
    }
  }
})
