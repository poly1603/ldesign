import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // Launcher 基础配置
  launcher: {
    preset: 'ldesign',
    mode: 'development',
    logLevel: 'info',
    autoRestart: false,
    debug: false
  },

  // 开发服务器配置
  server: {
    port: 3333,
    host: 'localhost',
    open: false,
    https: false,
    cors: true
  },

  // 预览服务器配置
  preview: {
    port: 4443,
    host: '0.0.0.0',
    open: false,
    https: false,
    cors: true
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
    target: 'es2020',
    emptyOutDir: true,
    watch: false,
    reportCompressedSize: true
  },

  // 依赖优化配置
  optimizeDeps: {
    force: false
  }
})