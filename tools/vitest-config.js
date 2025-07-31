import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'

/**
 * 创建标准化的Vitest配置
 * @param {Object} options 配置选项
 * @param {string} options.packageDir 包目录路径
 * @param {boolean} options.vue 是否支持Vue
 * @param {Object} options.alias 路径别名
 * @returns {Object} Vitest配置
 */
export function createVitestConfig(options = {}) {
  const {
    packageDir = process.cwd(),
    vue: enableVue = false,
    alias = {}
  } = options

  const plugins = []
  
  if (enableVue) {
    plugins.push(vue())
  }

  return defineConfig({
    plugins,
    test: {
      globals: true,
      environment: enableVue ? 'happy-dom' : 'node',
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/es/**',
        '**/lib/**',
        '**/cjs/**',
        '**/types/**',
        '**/coverage/**',
        '**/playwright-report/**',
        '**/test-results/**'
      ],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'coverage/**',
          'dist/**',
          'es/**',
          'lib/**',
          'cjs/**',
          'types/**',
          '**/node_modules/**',
          '**/tests/**',
          '**/__tests__/**',
          '**/*.d.ts',
          '**/*.config.*',
          '**/bin/**',
          '**/examples/**',
          '**/docs/**'
        ],
        thresholds: {
          global: {
            branches: 90,
            functions: 90,
            lines: 90,
            statements: 90
          }
        },
        all: true,
        skipFull: false
      },
      setupFiles: [
        resolve(packageDir, 'tests/setup.ts')
      ].filter(file => {
        try {
          require.resolve(file)
          return true
        } catch {
          return false
        }
      }),
      testTimeout: 10000,
      hookTimeout: 10000,
      teardownTimeout: 10000,
      isolate: true,
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
          isolate: true
        }
      },
      reporter: ['verbose', 'json', 'html'],
      outputFile: {
        json: resolve(packageDir, 'coverage/test-results.json'),
        html: resolve(packageDir, 'coverage/test-results.html')
      }
    },
    resolve: {
      alias: {
        '@': resolve(packageDir, 'src'),
        '@/types': resolve(packageDir, 'src/types'),
        '@/utils': resolve(packageDir, 'src/utils'),
        '@/core': resolve(packageDir, 'src/core'),
        ...alias
      }
    },
    define: {
      __VUE_OPTIONS_API__: true,
      __VUE_PROD_DEVTOOLS__: false,
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    }
  })
}

/**
 * 默认Vitest配置
 */
export default createVitestConfig()