import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

/**
 * 创建基础的 Vitest 配置
 * @param options 配置选项
 */
export function createVitestConfig(options: {
  packageDir?: string
  vue?: boolean
  environment?: 'node' | 'jsdom' | 'happy-dom'
  setupFiles?: string[]
  alias?: Record<string, string>
} = {}) {
  const {
    packageDir = process.cwd(),
    vue: enableVue = true,
    environment = 'jsdom',
    setupFiles = [],
    alias = {}
  } = options

  const plugins = []
  if (enableVue) {
    plugins.push(vue())
  }

  const defaultAlias = {
    '@': resolve(packageDir, 'src'),
    ...alias
  }

  return defineConfig({
    plugins,
    test: {
      globals: true,
      environment,
      setupFiles: [
        ...setupFiles.map(file => resolve(packageDir, file))
      ],
      coverage: {
        provider: 'v8',
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
          '**/*.d.ts',
          '**/*.config.*',
          '**/coverage/**'
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      },
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
      ],
      exclude: [
        'node_modules',
        'dist',
        'es',
        'lib',
        'types',
        'coverage',
        'docs',
        'examples'
      ]
    },
    resolve: {
      alias: defaultAlias
    }
  })
}

export default createVitestConfig
