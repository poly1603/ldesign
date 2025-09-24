import { defineConfig } from '../../../packages/launcher/dist/index.js'

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
    minify: 'esbuild',
    emptyOutDir: true
  },

  // 别名配置
  resolve: {
    alias: {
      '@': '/src',
      '@ldesign/pdf-reader': '../../src/index.ts'
    }
  },

  // 插件配置
  plugins: [],

  // 优化配置
  optimizeDeps: {
    exclude: ['pdfjs-dist']
  },

  // 构建配置
  define: {
    global: 'globalThis'
  }
})
