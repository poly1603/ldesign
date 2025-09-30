/**
 * Vite 配置文件
 * 用于开发环境的前端构建
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true
      }
    })
  ],

  // 开发服务器配置
  server: {
    port: 3001,
    host: '0.0.0.0',
    cors: true,
    proxy: {
      // 代理 API 请求到后端服务器
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      },
      // 代理 WebSocket 连接到后端服务器
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          utils: ['./src/composables/useApi', './src/composables/useWebSocket']
        }
      }
    }
  },

  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src')
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `
          // 自动导入设计系统变量
          @import "@/styles/variables.less";
        `
      }
    }
  },

  // 环境变量
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue', 'vue-router']
  },

  // 预览服务器配置
  preview: {
    port: 3002,
    host: '0.0.0.0',
    cors: true
  }
})
