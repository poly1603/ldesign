import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/form': resolve(__dirname, '../../src'),
      // 为了让 form 包内部的 @ 导入能正确解析到 form 包的 src 目录
      '@/core': resolve(__dirname, '../../src/core'),
      '@/types': resolve(__dirname, '../../src/types'),
      '@/utils': resolve(__dirname, '../../src/utils'),
      '@/validators': resolve(__dirname, '../../src/validators'),
      '@/vue': resolve(__dirname, '../../src/vue'),
      '@/styles': resolve(__dirname, '../../src/styles'),
      '@/legacy': resolve(__dirname, '../../src/legacy')
    }
  },
  server: {
    port: 3002,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
