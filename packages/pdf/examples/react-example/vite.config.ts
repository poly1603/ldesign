import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

/**
 * Vite配置文件
 * 配置React开发环境和构建设置
 */
export default defineConfig({
  plugins: [
    react({
      // React插件配置
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: [
          // 支持装饰器语法
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          // 支持类属性语法
          ['@babel/plugin-proposal-class-properties', { loose: true }]
        ]
      }
    })
  ],
  
  // 路径解析配置
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@types': resolve(__dirname, 'src/types'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@ldesign/pdf': resolve(__dirname, '../../src')
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json']
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    proxy: {
      // API代理配置（如果需要）
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 预览服务器配置
  preview: {
    port: 3001,
    host: true,
    open: true
  },
  
  // 构建配置
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          // 将React相关库打包到单独的chunk
          react: ['react', 'react-dom'],
          // 将PDF相关库打包到单独的chunk
          pdf: ['@ldesign/pdf']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 构建分析
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },
  
  // 依赖优化配置
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@ldesign/pdf'
    ],
    exclude: [
      // 排除某些依赖的预构建
    ]
  },
  
  // CSS配置
  css: {
    modules: {
      localsConvention: 'camelCase'
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    },
    devSourcemap: true
  },
  
  // 环境变量配置
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  },
  
  // 公共基础路径
  base: './',
  
  // 静态资源处理
  assetsInclude: ['**/*.pdf'],
  
  // Worker配置
  worker: {
    format: 'es'
  },
  
  // 实验性功能
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      } else {
        return { relative: true };
      }
    }
  },
  
  // ESBuild配置
  esbuild: {
    target: 'es2020',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsxInject: `import React from 'react'`
  },
  
  // 日志级别
  logLevel: 'info',
  
  // 清除控制台
  clearScreen: false
});