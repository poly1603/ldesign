import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/router': resolve(__dirname, '../src'),
      '@ldesign/device': resolve(__dirname, '../../device/src'),
      '@ldesign/engine': resolve(__dirname, '../../engine/src'),
      '@ldesign/template': resolve(__dirname, '../../template/src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `
          @import "@/styles/variables.less";
          @import "@/styles/mixins.less";
        `
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue'],
          'router-vendor': ['@ldesign/router'],
          'ldesign-vendor': ['@ldesign/device', '@ldesign/engine', '@ldesign/template']
        }
      }
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
})
