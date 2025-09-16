/**
 * Vitest 配置文件
 * 
 * 为 LDesign App 提供单元测试和集成测试配置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

const r = (p: string) => path.resolve(__dirname, p)

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      // 与主配置保持一致的别名
      '@ldesign/api/vue': r('../packages/api/src/vue'),
      '@ldesign/crypto/vue': r('../packages/crypto/src/vue'),
      '@ldesign/http/vue': r('../packages/http/src/vue'),
      '@ldesign/size/vue': r('../packages/size/src/vue'),
      '@ldesign/i18n/vue': r('../packages/i18n/src/vue'),
      '@ldesign/router/vue': r('../packages/router/src/vue'),
      '@ldesign/device/vue': r('../packages/device/src/vue'),
      '@ldesign/color/vue': r('../packages/color/src/vue'),
      '@ldesign/cache/vue': r('../packages/cache/src/vue'),
      '@ldesign/engine/vue': r('../packages/engine/src/vue'),
      '@ldesign/chart/vue': r('../packages/chart/src/vue'),
      '@ldesign/store/vue': r('../packages/store/src/vue'),
      '@ldesign/http': r('../packages/http/src'),
      '@ldesign/color': r('../packages/color/src'),
      '@': r('./src')
    }
  },

  test: {
    // 测试环境配置
    environment: 'jsdom',
    
    // 全局设置
    globals: true,
    
    // 包含的测试文件
    include: [
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    
    // 排除的文件
    exclude: [
      'node_modules',
      'dist',
      '.cache',
      'coverage'
    ],
    
    // 覆盖率配置
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/**/__tests__/**',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/types/**',
        '**/*.d.ts',
        'dist/',
        '.cache/',
        'coverage/'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    
    // 设置文件
    setupFiles: ['./src/__tests__/setup.ts'],
    
    // 测试超时时间
    testTimeout: 10000,
    
    // 钩子超时时间
    hookTimeout: 10000,
    
    // 并发运行
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false
      }
    },
    
    // 监听模式配置
    watch: {
      ignore: ['node_modules/**', 'dist/**', 'coverage/**']
    },
    
    // 报告器配置
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html'
    },
    
    // 模拟配置
    clearMocks: true,
    restoreMocks: true,
    
    // 环境变量
    env: {
      NODE_ENV: 'test',
      VITE_API_BASE_URL: 'http://localhost:8080'
    }
  },
  
  // 定义全局变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  }
})
