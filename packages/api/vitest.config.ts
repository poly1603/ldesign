import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.*',
        'dist/',
        'coverage/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/http': resolve(__dirname, '__tests__/stubs/ldesign-http.ts'),
    },
  },
})
