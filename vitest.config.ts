import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { createDevAliases } from './tools/configs/vite-alias'

export default defineConfig({
  plugins: [
    vue({
      jsx: true,
    }),
  ],
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/es/**',
      '**/lib/**',
      '**/types/**',
      '**/coverage/**',
      '**/examples/**',
      '**/docs/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        'es/**',
        'lib/**',
        'types/**',
        '**/node_modules/**',
        '**/tests/**',
        '**/__tests__/**',
        '**/examples/**',
        '**/docs/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/bin/**',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts', // 通常只是导出
        '**/types/**',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // 核心包需要更高的覆盖率
        'packages/engine/**/*.ts': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
      clean: true,
      skipFull: false,
    },
  },
  resolve: {
    alias: {
      ...createDevAliases(__dirname),
      '@': resolve(__dirname, 'packages'),
    },
  },
})
