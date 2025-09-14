import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  // 测试环境配置
  test: {
    // 使用 jsdom 环境（模拟浏览器环境）
    environment: 'jsdom',
    
    // 全局测试设置
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
      'docs',
      'examples'
    ],
    
    // 测试覆盖率配置
    coverage: {
      // 覆盖率提供者
      provider: 'v8',
      
      // 报告格式
      reporter: ['text', 'json', 'html', 'lcov'],
      
      // 覆盖率阈值
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      },
      
      // 包含的文件
      include: ['src/**/*.{js,ts}'],
      
      // 排除的文件
      exclude: [
        'src/**/*.{test,spec}.{js,ts}',
        'src/types/**/*',
        'src/**/*.d.ts'
      ]
    },
    
    // 测试超时时间（毫秒）
    testTimeout: 10000,
    
    // 钩子超时时间（毫秒）
    hookTimeout: 10000,
    
    // 测试设置文件
    setupFiles: ['./tests/setup.ts'],
    
    // 并发运行测试
    pool: 'threads',
    
    // 最大并发数
    poolOptions: {
      threads: {
        maxThreads: 4,
        minThreads: 1
      }
    }
  },
  
  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/pickers': resolve(__dirname, 'src/pickers'),
      '@/styles': resolve(__dirname, 'src/styles')
    }
  },
  
  // 定义全局变量
  define: {
    __DEV__: true,
    __TEST__: true
  }
});
