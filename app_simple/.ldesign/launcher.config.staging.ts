import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 继承基础配置中的 launcher 预设和 alias 配置
  launcher: {
    preset: 'ldesign'
  },

  // 服务器配置 - 预发布环境
  server: {
    port: 3332,
    host: '0.0.0.0',
    https: false,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://staging-api.ldesign.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 预览服务器配置
  preview: {
    port: 4442,
    host: '0.0.0.0'  // 允许外部访问
  },

  // 构建配置 - 预发布环境
  build: {
    outDir: 'dist-staging', // 预发布环境输出目录
    chunkSizeWarningLimit: 1200, // 预发布环境适中控制
    sourcemap: true, // 预发布环境保留 sourcemap 便于调试
    minify: true, // 预发布环境压缩

    // 项目特定的分包策略
    rollupOptions: {
      // 让 Vite 自动处理代码分割
    }
  },

  // 开发工具配置
  define: {
    __DEV__: false,
    __STAGING__: true,
    __PROD__: false,
    __TEST__: false
  },

  // 环境变量
  env: {
    VITE_APP_ENV: 'staging',
    VITE_API_BASE_URL: 'https://staging-api.ldesign.com/api',
    VITE_APP_TITLE: 'LDesign App - 预发布环境'
  },

  // 插件配置
  plugins: [],

  // CSS 配置
  css: {
    devSourcemap: true, // 预发布环境启用 CSS sourcemap
    preprocessorOptions: {
      less: {
        additionalData: `@import "@/styles/variables.less";`
      }
    }
  },

  // 优化配置
  optimizeDeps: {
    include: ['vue', 'vue-router', 'axios', 'crypto-js'],
    exclude: ['@ldesign/engine']
  }
})
