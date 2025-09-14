/**
 * Vite 配置文件 - 用于示例项目开发服务器
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname),
  base: './',
  
  server: {
    port: 20000,
    open: true,
    host: true
  },
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true
      }
    }
  },
  
  resolve: {
    alias: {
      '@': resolve(__dirname, '../../src'),
      '@ldesign/datepicker': resolve(__dirname, '../../src')
    }
  }
});
