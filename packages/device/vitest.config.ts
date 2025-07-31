import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'es/',
        'types/',
        'docs/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/',
      ],
    },
    include: [
      'src/**/*.{test,spec}.{js,ts}',
      '__tests__/**/*.{test,spec}.{js,ts}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'es',
      'types',
      'docs',
    ],
  },
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})