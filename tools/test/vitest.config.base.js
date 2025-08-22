import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export function createVitestConfig(options = {}) {
  const {
    vue = false,
    environment = 'jsdom',
    setupFiles = ['./tests/setup.ts'],
    ...customOptions
  } = options

  return defineConfig({
    test: {
      globals: true,
      environment,
      setupFiles,
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
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
          'test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**',
        ],
      },
      ...customOptions,
    },
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
        '@tests': resolve(process.cwd(), 'tests'),
        '@/__tests__': resolve(process.cwd(), '__tests__'),
        '@/test': resolve(process.cwd(), 'test'),
      },
    },
    esbuild: {
      target: 'es2020',
    },
  })
}

export default createVitestConfig()
