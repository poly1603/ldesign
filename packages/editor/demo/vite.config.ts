import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // 设置 alias 指向编辑器源码目录
      '@ldesign/editor': resolve(__dirname, '../src'),
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, '../src/types'),
      '@/utils': resolve(__dirname, '../src/utils'),
      '@/core': resolve(__dirname, '../src/core'),
      '@/plugins': resolve(__dirname, '../src/plugins'),
      '@/renderers': resolve(__dirname, '../src/renderers'),
      '@/themes': resolve(__dirname, '../src/themes')
    }
  },
  server: {
    port: 4000,
    open: true,
    host: true
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  optimizeDeps: {
    include: ['vue', '@vue/runtime-core']
  }
})
