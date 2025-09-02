/**
 * Vite 配置文件
 * 
 * 用于开发服务器和构建配置
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 根目录
  root: './src',
  
  // 公共基础路径
  base: './',
  
  // 开发服务器配置
  server: {
    port: 3333,
    host: true,
    open: true,
    cors: true,
    hmr: {
      overlay: true,
    },
  },
  
  // 预览服务器配置
  preview: {
    port: 3334,
    host: true,
    cors: true,
  },
  
  // 构建配置
  build: {
    outDir: '../www',
    emptyOutDir: true,
    sourcemap: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['@stencil/core'],
        },
      },
    },
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@global': resolve(__dirname, 'src/global'),
      '@theme': resolve(__dirname, 'src/theme'),
    },
  },
  
  // CSS 配置
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          // 可以在这里定义全局 Less 变量
        },
      },
    },
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // 插件配置
  plugins: [],
  
  // 依赖优化
  optimizeDeps: {
    include: ['@stencil/core'],
    exclude: [],
  },
  
  // 环境变量
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __TEST__: JSON.stringify(process.env.NODE_ENV === 'test'),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
  },
  
  // 日志级别
  logLevel: 'info',
  
  // 清除屏幕
  clearScreen: false,
});
