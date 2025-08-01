import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: [
      'packages/**/src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'packages/**/tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/es/**',
      '**/lib/**',
      '**/types/**',
      '**/coverage/**',
      '**/examples/**',
      '**/docs/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
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
        '**/bin/**'
      ],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        }
      }
    }
  },
  resolve: {
    alias: {
      '@ldesign/engine': resolve(__dirname, 'packages/engine/src'),
      '@ldesign/color': resolve(__dirname, 'packages/color/src'),
      '@ldesign/crypto': resolve(__dirname, 'packages/crypto/src'),
      '@ldesign/device': resolve(__dirname, 'packages/device/src'),
      '@ldesign/http': resolve(__dirname, 'packages/http/src'),
      '@ldesign/i18n': resolve(__dirname, 'packages/i18n/src'),
      '@ldesign/router': resolve(__dirname, 'packages/router/src'),
      '@ldesign/store': resolve(__dirname, 'packages/store/src'),
      '@ldesign/template': resolve(__dirname, 'packages/template/src'),
      '@': resolve(__dirname, 'packages')
    }
  }
})
