import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// 本地开发使用的 Vitest 配置，不依赖 monorepo 根目录的测试基座
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    reporter: ['basic'],
    // 禁用并发以避免输出混乱
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // 设置合理的超时时间
    testTimeout: 10000,
    hookTimeout: 10000,
    // 优化输出
    outputFile: {
      json: './test-results.json',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        global: { branches: 80, functions: 80, lines: 80, statements: 80 },
        perFile: { branches: 80, functions: 80, lines: 80, statements: 80 }
      },
      all: true,
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/', 'dist/', 'lib/', 'es/', 'cjs/', 'types/',
        '**/*.d.ts', '**/test-setup.ts', '**/__tests__/**',
        '**/coverage/**', '**/docs/**', '**/examples/**'
      ]
    },
    include: [
      '**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
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
      '**/.{idea,git,cache,output,temp}/**',
    ],
    // 单线程运行以确保输出清晰
    threads: false,
    maxThreads: 1,
    minThreads: 1,
    // 禁用文件监听以避免重复运行
    watch: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './__tests__'),
    },
  },
})

