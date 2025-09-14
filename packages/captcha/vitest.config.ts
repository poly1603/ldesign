import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'happy-dom',
    
    // 全局变量
    globals: true,
    
    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'lib',
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
        'docs/',
        'dist/',
        'lib/',
        'es/',
        '**/*.d.ts',
        '**/*.config.*',
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
    threads: true,
    
    // 监听模式下的文件变化
    watchExclude: [
      'node_modules/**',
      'dist/**',
      'lib/**',
      'es/**'
    ]
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/captcha': resolve(__dirname, 'src/captcha'),
      '@/adapters': resolve(__dirname, 'src/adapters'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/styles': resolve(__dirname, 'src/styles')
    }
  }
})
