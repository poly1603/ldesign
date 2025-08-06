import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    setupFiles: ['tests/setup.ts'],
    globals: true,
    include: ['tests/**/*.test.ts'],
    exclude: [
      'node_modules/',
      'dist/',
      'es/',
      'lib/',
      'types/',
      'coverage/',
      'e2e/',
      'docs/',
      'example/',
      '**/*.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'es/',
        'lib/',
        'types/',
        'coverage/',
        '**/*.d.ts',
        'tests/setup.ts',
        'e2e/',
        'docs/',
        'example/',
      ],
    },
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
