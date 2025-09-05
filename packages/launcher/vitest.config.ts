/**
 * Vitest 配置文件
 *
 * @ldesign/launcher 包的测试配置
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',

    // 全局设置
    globals: true,

    // 测试文件匹配模式
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // 排除文件
    exclude: [
      'node_modules',
      'dist',
      'docs',
      '.git',
      '.vscode'
    ],

    // 测试超时时间
    testTimeout: 30000,

    // 钩子超时时间
    hookTimeout: 30000,

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        'docs/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts', // 通常只是导出文件
        'bin/**',
        'src/constants/**', // 常量文件通常不需要测试
        'src/types/**' // 类型定义文件
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

    // 设置文件
    setupFiles: [
      './tests/setup.ts'
    ],

    // 监听模式配置
    watch: true,

    // 并发运行
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1
      }
    },

    // 报告器
    reporter: ['verbose', 'json', 'html'],

    // 输出目录
    outputFile: {
      json: './test-results.json',
      html: './test-results.html'
    }
  },

  // 解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/core': resolve(__dirname, './src/core'),
      '@/cli': resolve(__dirname, './src/cli'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/constants': resolve(__dirname, './src/constants')
    }
  },

  // 定义全局变量
  define: {
    __TEST__: true,
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },

  // esbuild 配置
  esbuild: {
    target: 'node16'
  }
})
