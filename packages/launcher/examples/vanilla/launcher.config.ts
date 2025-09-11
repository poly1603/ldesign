import { defineConfig } from '@ldesign/launcher';

export default defineConfig({
  // 开发服务器配置
  server: {
    port: 3001,
    host: true,
    open: true
  },

  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    target: 'es2020'
  },

  // 路径别名
  resolve: {
    alias: {
      '@': './src',
      '@assets': './src/assets',
      '@utils': './src/utils'
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "@/styles/variables.scss";'
      }
    }
  },

  // 静态资源处理
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.gif'],

  // 优化配置
  optimizeDeps: {
    include: []
  }
});
