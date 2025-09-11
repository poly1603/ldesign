/**
 * Vitest 测试配置
 * 配置测试环境、覆盖率报告和性能测试
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'jsdom',

    // 设置文件
    setupFiles: ['./tests/setup.ts'],

    // 全局变量
    globals: true,

    // 测试文件匹配模式
    include: [
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'examples'
    ],

    // 测试超时 - 优化性能
    testTimeout: 5000,
    hookTimeout: 3000,
    teardownTimeout: 3000,

    // 并发配置 - 优化性能
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true // 使用单个 fork 避免并发问题
      }
    },
    isolate: false, // 禁用隔离以提高性能

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/**/*.{js,ts}'
      ],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}',
        'tests/**/*'
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

    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html'
    },

    // 监听模式配置
    watch: false,

    // 性能测试配置
    benchmark: {
      include: ['tests/**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['node_modules', 'dist'],
      reporter: ['verbose']
    }
  },

  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests')
    }
  },

  // 定义全局变量
  define: {
    __TEST__: true,
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },

  // 优化配置
  optimizeDeps: {
    include: ['vitest', '@vitest/ui']
  }
})
