import { defineConfig } from 'vite';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';
import vue from '@vitejs/plugin-vue';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    vue(),
    react(),
    typescript({
      tsconfig: './tsconfig.json'
    }),
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        vue: resolve(__dirname, 'src/integrations/vue/index.ts'),
        react: resolve(__dirname, 'src/integrations/react/index.ts'),
        angular: resolve(__dirname, 'src/integrations/angular/index.ts')
      },
      name: 'LDesignCropper',
      formats: ['es', 'cjs', 'umd']
    },
    
    rollupOptions: {
      external: [
        'vue',
        'react',
        'react-dom',
        '@angular/core',
        '@angular/common',
        'rxjs'
      ],
      
      output: {
        globals: {
          'vue': 'Vue',
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@angular/core': 'ng.core',
          '@angular/common': 'ng.common',
          'rxjs': 'rxjs'
        },
        
        // 自定义文件名
        entryFileNames: (chunkInfo) => {
          const { name, format } = chunkInfo;
          
          if (format === 'es') {
            return `esm/${name}.js`;
          } else if (format === 'cjs') {
            return `cjs/${name}.cjs`;
          } else if (format === 'umd') {
            return `${name}.umd.js`;
          }
          
          return `${name}.${format}.js`;
        },
        
        chunkFileNames: (chunkInfo) => {
          const { format } = chunkInfo;
          
          if (format === 'es') {
            return 'esm/[name]-[hash].js';
          } else if (format === 'cjs') {
            return 'cjs/[name]-[hash].cjs';
          }
          
          return '[name]-[hash].js';
        }
      }
    },
    
    // 优化配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: /^!/
      }
    },
    
    // 源码映射
    sourcemap: true,
    
    // 目标环境
    target: ['es2015', 'chrome60', 'firefox55', 'safari12', 'edge79'],
    
    // CSS 配置
    cssCodeSplit: false,
    
    // 输出目录
    outDir: 'dist',
    emptyOutDir: true
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true
  },
  
  // 预览服务器配置
  preview: {
    port: 4173,
    open: true
  },
  
  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests'),
      '@examples': resolve(__dirname, 'examples')
    }
  },
  
  // 环境变量
  define: {
    __VERSION__: JSON.stringify(process.env.npm_package_version || '0.1.0'),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  
  // 优化依赖
  optimizeDeps: {
    include: [
      'vue',
      'react',
      'react-dom'
    ],
    exclude: [
      '@angular/core',
      '@angular/common'
    ]
  }
});