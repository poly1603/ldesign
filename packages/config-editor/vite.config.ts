/**
 * Vite 配置文件
 * 
 * 用于前端界面开发和构建
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],

  // 开发服务器配置
  server: {
    port: 3001,
    host: 'localhost',
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist/client',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vue: ['vue'],
          vendor: ['axios']
        }
      }
    }
  },

  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@/types': resolve(__dirname, 'src/types'),
      '@/utils': resolve(__dirname, 'src/utils'),
      '@/components': resolve(__dirname, 'src/components'),
      '@/views': resolve(__dirname, 'src/views'),
      '@/server': resolve(__dirname, 'src/server'),
      '@/core': resolve(__dirname, 'src/core')
    },
    extensions: ['.ts', '.js', '.vue', '.json', '.less', '.css']
  },

  // CSS 配置
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

  // 环境变量配置
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
    global: 'globalThis',
    'process.env': {}
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue', 'axios'],
    exclude: ['@ldesign/config-editor']
  }
})
