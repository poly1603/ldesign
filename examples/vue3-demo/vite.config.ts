/**
 * Vite 配置文件
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@ldesign/chart': resolve(__dirname, '../../packages/chart/src'),
      '@ldesign/chart/vue': resolve(__dirname, '../../packages/chart/vue.ts')
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
          'vue-vendor': ['vue', 'vue-router'],
          'chart-vendor': ['echarts', '@ldesign/chart']
        }
      }
    }
  },
  
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `
          @import "@/styles/variables.less";
        `
      }
    }
  },
  
  optimizeDeps: {
    include: ['vue', 'vue-router', 'echarts']
  }
})
