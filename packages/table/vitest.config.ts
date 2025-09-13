import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  // 测试环境配置
  test: {
    // 使用happy-dom作为DOM环境
    environment: 'happy-dom',
    
    // 全局测试配置
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
      'es',
      'examples'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'examples/',
        'dist/',
        'es/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts' // 通常只是导出文件
      ],
      // 覆盖率阈值
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
    threads: true,
    
    // 监听模式下的配置
    watch: {
      clearScreen: false
    }
  },
  
  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/managers': resolve(__dirname, './src/managers'),
      '@/types': resolve(__dirname, './src/types'),
      '@/styles': resolve(__dirname, './src/styles'),
      '@/adapters': resolve(__dirname, './src/adapters'),
      '@/utils': resolve(__dirname, './src/utils')
    }
  },
  
  // 定义全局变量
  define: {
    __DEV__: true,
    __TEST__: true
  }
})
