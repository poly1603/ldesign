import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 11000,
    open: true,
    host: true,
  },
  resolve: {
    alias: {
      // 源码路径别名 - 指向实际的源码目录
      '@': resolve(__dirname, '../../src'),
      '@/types': resolve(__dirname, '../../src/types'),
      '@/core': resolve(__dirname, '../../src/core'),
      '@/utils': resolve(__dirname, '../../src/utils'),
      '@/cropper': resolve(__dirname, '../../src/cropper'),
      '@/adapters': resolve(__dirname, '../../src/adapters'),
      '@/config': resolve(__dirname, '../../src/config'),
      '@/themes': resolve(__dirname, '../../src/themes'),
      '@/i18n': resolve(__dirname, '../../src/i18n'),
      '@/presets': resolve(__dirname, '../../src/presets'),
      '@/performance': resolve(__dirname, '../../src/performance'),
      '@/advanced': resolve(__dirname, '../../src/advanced'),
      '@/workers': resolve(__dirname, '../../src/workers'),
      '@/ui': resolve(__dirname, '../../src/ui'),
      '@/interaction': resolve(__dirname, '../../src/interaction'),
      '@/styles': resolve(__dirname, '../../src/styles')
    }
  }
})
