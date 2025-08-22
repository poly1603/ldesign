import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export interface VitestConfigOptions {
  packageDir?: string
  vue?: boolean
  environment?: 'node' | 'jsdom' | 'happy-dom'
  setupFiles?: string[]
  alias?: Record<string, string>
  coverage?: {
    provider?: 'v8' | 'istanbul'
    reporter?: string[]
    exclude?: string[]
    thresholds?: {
      global?: {
        branches?: number
        functions?: number
        lines?: number
        statements?: number
      }
    }
  }
}

/**
 * 创建基础的 Vitest 配置
 * @param options 配置选项
 */
export function createVitestConfig(options: VitestConfigOptions = {}) {
  const {
    packageDir = process.cwd(),
    vue: enableVue = true,
    environment = 'jsdom',
    setupFiles = [],
    alias = {},
    coverage = {},
  } = options

  const plugins = []
  if (enableVue) {
    plugins.push(vue())
  }

  const defaultAlias = {
    '@': resolve(packageDir, 'src'),
    ...alias,
  }

  const defaultCoverage = {
    provider: 'v8' as const,
    reporter: ['text', 'json', 'html', 'lcov'],
    exclude: [
      'node_modules/',
      'dist/',
      'es/',
      'lib/',
      'types/',
      'coverage/',
      'docs/',
      'examples/',
      '__tests__/',
      'tests/',
      'test/',
      '**/*.d.ts',
      '**/*.config.*',
      '**/coverage/**',
    ],
    thresholds: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    ...coverage,
  }

  return defineConfig({
    plugins,
    test: {
      globals: true,
      environment,
      setupFiles: [...setupFiles.map(file => resolve(packageDir, file))],
      coverage: defaultCoverage,
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      exclude: [
        'node_modules',
        'dist',
        'es',
        'lib',
        'types',
        'coverage',
        'docs',
        'examples',
      ],
    },
    resolve: {
      alias: defaultAlias,
    },
  })
}

export default createVitestConfig
