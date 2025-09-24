import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // 基准测试在 Node 环境中运行更准确
    include: [
      'tests/performance/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'lib',
      'es',
      'types',
      'cjs',
      'esm',
      'e2e/**'
    ],
    testTimeout: 300000, // 5分钟超时，因为基准测试可能需要较长时间
    hookTimeout: 30000,
    // 单独运行每个测试文件，避免内存泄漏影响
    isolate: true,
    // 禁用并行，确保基准测试结果的准确性
    threads: false,
    // 为基准测试提供更多内存
    pool: 'forks',
    // 基准测试的特殊报告器
    reporters: ['verbose', 'json'],
    outputFile: {
      json: './tests/performance/benchmark-results.json'
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests'),
    },
  },
  esbuild: {
    target: 'es2020',
  },
})
