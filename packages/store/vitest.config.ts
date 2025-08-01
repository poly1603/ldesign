import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/core': resolve(__dirname, 'src/core'),
      '@/decorators': resolve(__dirname, 'src/decorators'),
      '@/hooks': resolve(__dirname, 'src/hooks'),
      '@/vue': resolve(__dirname, 'src/vue'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/types': resolve(__dirname, 'src/types'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        'es/',
        'lib/',
        'types/',
        'examples/',
        'docs/',
        '**/*.d.ts',
        '**/*.config.*',
        'coverage/**',
      ],
    },
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      '__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
    ],
    exclude: [
      'node_modules',
      'dist',
      'es',
      'lib',
      'types',
      'examples',
      'docs',
    ],
  },
})
