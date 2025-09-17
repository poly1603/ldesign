import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx({
      // 启用 TSX 支持
      transformOn: true,
      mergeProps: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // '@ldesign/template': resolve(__dirname, '../src'), // 注释掉，使用构建后的包
    },
  },

  server: {
    port: 5174,
    open: true,
    host: true,
    cors: true,
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'es2020',
    minify: 'esbuild',
  },

  css: {
    devSourcemap: true,
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue', 'vue-router'],
  },

  // ESBuild配置
  esbuild: {
    target: 'es2020',
    keepNames: true,
  },

  // 定义全局变量
  define: {
    'process.env': {},
    'global': 'globalThis',
  },
})
