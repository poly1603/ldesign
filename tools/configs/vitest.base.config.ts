import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

interface VitestConfigOptions {
  packageDir?: string
  vue?: boolean
  environment?: 'node' | 'jsdom' | 'happy-dom'
  setupFiles?: string[]
}

export function createVitestConfig(options: VitestConfigOptions = {}) {
  const {
    packageDir = process.cwd(),
    vue: enableVue = true,
    environment = 'jsdom',
    setupFiles = [],
  } = options
  return defineConfig({
    plugins: enableVue
      ? [
          vue({
            jsx: true,
          }),
        ]
      : [],
    esbuild: enableVue
      ? {
          jsx: 'transform',
          jsxFactory: 'h',
          jsxFragment: 'Fragment',
        }
      : {
          jsx: 'automatic',
        },
    test: {
      globals: true,
      environment,
      setupFiles,
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
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
          '**/bin/**',
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
        '@': resolve(packageDir, 'src'),
      },
    },
  })
}
