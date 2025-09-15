import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

// 本地开发使用的 Vitest 配置，不依赖 monorepo 根目录的测试基座
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    reporter: 'basic',
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
    // 限制为单线程以降低内存占用
    threads: false,
    maxThreads: 1,
    minThreads: 1,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@tests': resolve(__dirname, './__tests__'),
    },
  },
})

