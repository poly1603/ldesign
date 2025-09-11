import { defineConfig } from '@ldesign/launcher';

export default defineConfig({
  // Angular 构建需要特殊配置
  build: {
    target: 'es2020',
    minify: 'esbuild',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Angular 应用通常需要保留动态导入
      output: {
        manualChunks: {
          vendor: ['@angular/core', '@angular/common', '@angular/platform-browser'],
          rxjs: ['rxjs']
        }
      }
    }
  },
  
  // 开发服务器配置
  server: {
    port: 5173,
    host: true,
    open: true,
  },
  
  // 优化配置
  optimizeDeps: {
    include: [
      '@angular/core',
      '@angular/common',
      '@angular/platform-browser',
      '@angular/platform-browser-dynamic',
      '@angular/router',
      'rxjs',
      'zone.js'
    ]
  },
  
  // TypeScript 配置
  esbuild: {
    target: 'es2020',
    // Angular 装饰器需要保留元数据
    keepNames: true,
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
        useDefineForClassFields: false
      }
    }
  },
  
  // 定义全局变量
  define: {
    ngDevMode: true,
    ngI18nClosureMode: false
  }
});
