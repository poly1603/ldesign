/**
 * @ldesign/launcher 标准配置模板
 * 
 * 用于 examples/ 下所有示例项目的开发和构建
 * 
 * 使用方法：
 * 1. 复制此文件到你的示例项目根目录，重命名为 launcher.config.ts
 * 2. 修改 framework 字段为你使用的框架
 * 3. 根据需要调整其他配置
 * 4. 运行 pnpm dev / pnpm build / pnpm preview
 */

import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // ========================================
  // 必填：框架类型
  // ========================================
  // 可选值：'vue' | 'vue2' | 'react' | 'angular' | 'svelte' | 'solid' | 'lit' | 'preact' | 'qwik'
  framework: 'vue',
  
  // ========================================
  // 基础配置
  // ========================================
  
  // 项目根目录（相对于配置文件）
  root: process.cwd(),
  
  // 入口文件
  entry: 'src/main.ts',
  
  // HTML 模板
  template: 'index.html',
  
  // 公共资源目录
  publicDir: 'public',
  
  // 输出目录
  outDir: 'dist',
  
  // ========================================
  // 开发服务器配置
  // ========================================
  server: {
    // 端口号
    port: 3000,
    
    // 主机地址
    host: '0.0.0.0',
    
    // 是否自动打开浏览器
    open: true,
    
    // HTTPS 配置
    https: false,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, '')
      }
    },
    
    // CORS 配置
    cors: true,
    
    // HMR 配置
    hmr: {
      overlay: true,
      port: 3001
    }
  },
  
  // ========================================
  // 构建配置
  // ========================================
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 资源目录
    assetsDir: 'assets',
    
    // 是否生成 source map
    sourcemap: false,
    
    // 是否压缩代码
    minify: true,
    
    // 分包策略
    chunkSizeWarningLimit: 500,
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ldesign': ['@ldesign/engine-vue', '@ldesign/router-vue']
        }
      }
    }
  },
  
  // ========================================
  // 预览服务器配置
  // ========================================
  preview: {
    port: 4173,
    host: '0.0.0.0',
    open: true,
    https: false
  },
  
  // ========================================
  // 路径别名
  // ========================================
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@utils': '/src/utils',
      '@assets': '/src/assets'
    },
    
    // 扩展名
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.svelte']
  },
  
  // ========================================
  // CSS 配置
  // ========================================
  css: {
    // 预处理器选项
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        javascriptEnabled: true
      }
    },
    
    // CSS 模块化
    modules: {
      localsConvention: 'camelCase',
      scopeBehaviour: 'local'
    }
  },
  
  // ========================================
  // 环境变量
  // ========================================
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __DEV__: process.env.NODE_ENV === 'development'
  },
  
  // ========================================
  // 优化配置
  // ========================================
  optimizeDeps: {
    include: ['vue', '@ldesign/engine-vue'],
    exclude: []
  },
  
  // ========================================
  // 插件
  // ========================================
  plugins: [
    // 自定义 Vite 插件
  ]
})
