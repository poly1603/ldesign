import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 基础配置
  root: '.',
  
  // 服务器配置
  server: {
    port: 3001,
    host: 'localhost',
    open: true,
    cors: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'esbuild',
    target: 'esnext',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue']
        }
      }
    }
  },
  
  // 预览配置
  preview: {
    port: 4174,
    host: 'localhost',
    open: true
  },
  
  // 插件配置
  plugins: [
    // Vue 插件会自动检测并启用
  ],
  
  // 别名配置
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  
  // CSS 配置
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },
  
  // 优化配置
  optimizeDeps: {
    include: ['vue']
  }
})
