import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['__tests__/setup.ts'],
    globals: true,
    // 仅运行本包内的单元测试
    include: [
      '__tests__/**/*.{test,spec}.ts',
      '__tests__/**/*.{test,spec}.tsx',
      '__tests__/**/*.{test,spec}.js',
      '__tests__/**/*.{test,spec}.jsx',
    ],
    // 确保每个测试用例之间重置 mock，实现测试隔离
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    // 排除非单元测试目录与外部用例
    exclude: [
      'e2e/**',
      'examples/**',
      'node_modules/**',
      '**/node_modules/**',
    ],
  },
})
