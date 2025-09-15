import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  // 测试配置
  test: {
    // 测试环境
    environment: 'happy-dom',

    // 全局变量
    globals: true,

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 包含的测试文件
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      'es',
      'lib',
      'types',
      'docs',
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
        'es/',
        'lib/',
        'types/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts' // 通常只是导出文件
      ],
      // 覆盖率阈值
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },

    // 测试超时
    testTimeout: 10000,
    hookTimeout: 10000,

    // 并发配置
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // 监听模式配置
    watch: false,

    // 报告器
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results.json',
      html: './test-results.html'
    }
  },

  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/adapters': resolve(__dirname, 'src/adapters')
    }
  },

  // 定义全局变量
  define: {
    __DEV__: true,
    __TEST__: true
  }
})
