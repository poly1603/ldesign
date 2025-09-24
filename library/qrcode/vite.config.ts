import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'LDesignQRCode',
      fileName: (format) => `index.${format === 'es' ? 'js' : format}`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['vue', 'qrcode', 'jszip'],
      output: {
        globals: {
          vue: 'Vue',
          qrcode: 'QRCode',
          jszip: 'JSZip'
        },
        // 清理输出
        banner: '/* @ldesign/qrcode */',
        // 避免警告
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: 'terser',
    // 清理输出目录
    emptyOutDir: true,
    // 优化构建
    target: 'es2015',
    // 减少构建警告
    chunkSizeWarningLimit: 1000
  },

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/examples/**/tests/e2e/**',
      '**/*.spec.ts' // 排除Playwright测试文件
    ]
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})
