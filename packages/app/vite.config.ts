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
      '@components': resolve(__dirname, 'src/components'),
      '@views': resolve(__dirname, 'src/views'),
      '@templates': resolve(__dirname, 'src/templates'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@assets': resolve(__dirname, 'src/assets'),
      '@styles': resolve(__dirname, 'src/styles'),
      // LDesign包别名，直接指向源码
      '@ldesign/engine': resolve(__dirname, '../engine/src'),
      '@ldesign/router': resolve(__dirname, '../router/src'),
      '@ldesign/store': resolve(__dirname, '../store/src'),
      '@ldesign/i18n': resolve(__dirname, '../i18n/src'),
      '@ldesign/template': resolve(__dirname, '../template/src'),
      '@ldesign/color': resolve(__dirname, '../color/src'),
      '@ldesign/crypto': resolve(__dirname, '../crypto/src'),
      '@ldesign/device': resolve(__dirname, '../device/src'),
      '@ldesign/http': resolve(__dirname, '../http/src'),
      '@ldesign/watermark': resolve(__dirname, '../watermark/src')
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "@/styles/variables.less";`
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
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
    include: [
      'vue',
      'pinia'
    ]
  }
})
