/**
 * Vite 配置文件
 * 基于 JavaScript 的地图示例应用配置
 */

import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3001,
    open: true,
    host: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  // 路径解析 - 设置 alias 为 src
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'src': resolve(__dirname, 'src'),
      '@ldesign/map': resolve(__dirname, '../../src')
    }
  },
  
  // 优化配置
  optimizeDeps: {
    include: ['@ldesign/map']
  }
})
