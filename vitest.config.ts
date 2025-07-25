import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default defineConfig({
  plugins: [vue(), vueJsx()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'packages/**/__tests__/**/*.{test,spec}.{js,ts,tsx}',
      'tests/**/*.{test,spec}.{js,ts,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'docs',
      'playground',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts',
        'docs/',
        'playground/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@ldesign/color': resolve(__dirname, 'packages/color/src'),
      '@ldesign/crypto': resolve(__dirname, 'packages/crypto/src'),
      '@ldesign/device': resolve(__dirname, 'packages/device/src'),
      '@ldesign/engine': resolve(__dirname, 'packages/engine/src'),
      '@ldesign/http': resolve(__dirname, 'packages/http/src'),
      '@ldesign/i18n': resolve(__dirname, 'packages/i18n/src'),
      '@ldesign/size': resolve(__dirname, 'packages/size/src'),
      '@ldesign/store': resolve(__dirname, 'packages/store/src'),
      '@ldesign/template': resolve(__dirname, 'packages/template/src'),
      '@': resolve(__dirname, 'src'),
    },
  },
})
