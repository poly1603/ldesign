import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/engine': resolve(__dirname, '../../packages/engine/src'),
      '@ldesign/router': resolve(__dirname, '../../packages/router/src'),
      '@ldesign/template': resolve(__dirname, '../../packages/template/src'),
    },
  },
  server: {
    port: 3001,
    host: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'pinia'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['vue', 'pinia'],
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
})
