import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: ['node_modules', 'dist', 'lib', 'es', 'types'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        'es/',
        'types/',
        'tests/',
        '__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@tests': resolve(process.cwd(), 'tests'),
      '@/__tests__': resolve(process.cwd(), '__tests__'),
    },
  },
  esbuild: {
    target: 'es2020',
  },
})
