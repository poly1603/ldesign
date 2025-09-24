import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 继承基础配置中的 launcher 预设和 alias 配置
  launcher: {
    preset: 'ldesign'
  },

  // 服务器配置 - 测试环境
  server: {
    port: 3013,
    host: '0.0.0.0',
    https: false,
    open: false,
    cors: true,
    proxy: {
      '/api': {
        target: 'https://test-api.ldesign.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 预览服务器配置
  preview: {
    port: 8890,
    host: '0.0.0.0'  // 允许外部访问
  },

  // 构建配置 - 测试环境
  build: {
    outDir: 'dist-test', // 测试环境输出目录
    chunkSizeWarningLimit: 2000, // 测试环境放宽限制便于调试
    sourcemap: true, // 测试环境保留 sourcemap
    minify: false, // 测试环境不压缩便于调试

    // 简化的分包策略便于调试
    rollupOptions: {
      // 让 Vite 自动处理代码分割
    }
  },

  // 开发工具配置
  define: {
    __DEV__: false,
    __STAGING__: false,
    __PROD__: false,
    __TEST__: true
  },

  // 环境变量
  env: {
    VITE_APP_ENV: 'test',
    VITE_API_BASE_URL: 'https://test-api.ldesign.com/api',
    VITE_APP_TITLE: 'LDesign App - 测试环境'
  },

  // 插件配置
  plugins: [],

  // CSS 配置
  css: {
    devSourcemap: true, // 测试环境启用 CSS sourcemap
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
