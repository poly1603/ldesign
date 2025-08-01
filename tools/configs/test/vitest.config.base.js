import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

/**
 * 创建基础的 Vitest 配置
 * @param {object} options 配置选项
 * @param {string} [options.packageDir] 包目录路径
 * @param {boolean} [options.vue] 是否启用 Vue 支持
 * @param {'node'|'jsdom'|'happy-dom'} [options.environment] 测试环境
 * @param {string[]} [options.setupFiles] 设置文件数组
 * @param {Record<string, string>} [options.alias] 路径别名配置
 * @param {object} [options.coverage] 覆盖率配置
 */
export function createVitestConfig(options = {}) {
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
      setupFiles: [
        ...setupFiles.map(file => resolve(packageDir, file)),
      ],
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
