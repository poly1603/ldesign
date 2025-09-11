import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    host: true,
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },

  // 路径别名配置
  resolve: {
    alias: {
      '@ldesign/chart': resolve(__dirname, '../../src/index.ts'),
      '@': resolve(__dirname, 'src'),
    },
  },

  // 优化配置
  optimizeDeps: {
    include: ['echarts'],
  },

  // CSS 配置
  css: {
    devSourcemap: true,
  },
})
