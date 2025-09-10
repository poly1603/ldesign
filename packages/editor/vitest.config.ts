import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'jsdom',
    
    // 全局测试设置
    globals: true,
    
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,ts}',
      'src/**/*.{test,spec}.{js,ts}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'docs',
      'examples'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'docs/',
        'examples/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts'
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
    
    // 测试超时时间
    testTimeout: 10000,
    
    // 钩子超时时间
    hookTimeout: 10000,
    
    // 并发测试
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/plugins': resolve(__dirname, 'src/plugins'),
      '@/renderers': resolve(__dirname, 'src/renderers'),
      '@/adapters': resolve(__dirname, 'src/adapters'),
      '@/themes': resolve(__dirname, 'src/themes'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types')
    }
  }
})
