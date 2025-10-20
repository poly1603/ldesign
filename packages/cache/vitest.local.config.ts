import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

/**
 * 本地开发使用的 Vitest 配置
 * 不依赖 monorepo 根目录的测试基座，提供完整的独立测试环境
 */
export default defineConfig({
  test: {
    // 测试环境配置
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],

    // 报告器配置
    reporter: ['basic', 'json'],

    // 并发控制 - 使用单进程以确保输出清晰
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },

    // 超时配置
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,

    // 输出配置
    outputFile: {
      json: './test-results.json',
      junit: './junit.xml',
    },

    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',

      // 覆盖率阈值
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        perFile: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      },

      // 覆盖率分析配置
      all: true,
      clean: true,
      cleanOnRerun: true,

      // 包含的文件
      include: ['src/**/*.ts'],

      // 排除的文件
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        'es/',
        'cjs/',
        'types/',
        '**/*.d.ts',
        '**/test-setup.ts',
        '**/__tests__/**',
        '**/coverage/**',
        '**/docs/**',
        '**/examples/**',
        '**/scripts/**',
        '**/*.config.*',
        '**/*.test.*',
        '**/*.spec.*'
      ]
    },
    // 测试文件匹配模式
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],

    // 排除的文件和目录
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/lib/**',
      '**/es/**',
      '**/cjs/**',
      '**/types/**',
      '**/coverage/**',
      '**/docs/**',
      '**/examples/**',
      '**/scripts/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/*.config.*',
      '**/playwright.config.*',
      '**/benchmark.config.*'
    ],

    // 性能配置
    threads: false,
    maxThreads: 1,
    minThreads: 1,
    isolate: true,

    // 监听配置
    watch: false,
    watchExclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**'
    ],

    // 重试配置
    retry: 2,
    bail: 0,

    // 日志配置
    logHeapUsage: true,
    allowOnly: true,
    passWithNoTests: false,
  },

  // 模块解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './__tests__'),
      '@/core': resolve(__dirname, './src/core'),
      '@/engines': resolve(__dirname, './src/engines'),
      '@/security': resolve(__dirname, './src/security'),
      '@/strategies': resolve(__dirname, './src/strategies'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/vue': resolve(__dirname, './src/vue'),
      '@/types': resolve(__dirname, './src/types'),
    },
  },

  // 构建配置
  build: {
    target: 'node14',
    sourcemap: true,
  },

  // 定义全局变量
  define: {
    __DEV__: true,
    __TEST__: true,
    // eslint-disable-next-line node/prefer-global/process
    __VERSION__: JSON.stringify((typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.npm_package_version) || '0.1.0'),
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue', '@vue/test-utils'],
    exclude: ['@ldesign/cache'],
  },
})

