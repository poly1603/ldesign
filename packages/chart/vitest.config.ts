import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/examples/**',
      '**/docs/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.{js,ts}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.test.{js,ts}',
        'src/**/*.spec.{js,ts}',
        'src/**/index.ts', // 导出文件通常不需要测试
        'src/types/**', // 类型定义文件
        'src/**/*.stories.{js,ts}',
        'src/**/__tests__/**',
        'src/**/__mocks__/**',
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
      all: true,
      clean: true,
    },
    // 性能优化配置
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        maxThreads: 4,
        minThreads: 1,
      },
    },
    // 超时配置
    testTimeout: 15000,
    hookTimeout: 10000,
    // 监听模式配置
    watch: false,
    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html',
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/adapters': resolve(__dirname, 'src/adapters'),
      '@/themes': resolve(__dirname, 'src/themes'),
      '@/events': resolve(__dirname, 'src/events'),
      '@/config': resolve(__dirname, 'src/config'),
      '@/responsive': resolve(__dirname, 'src/responsive'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@tests': resolve(__dirname, 'tests'),
    },
  },
  // 优化构建性能
  esbuild: {
    target: 'es2020',
  },
})
