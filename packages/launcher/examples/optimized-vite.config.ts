/**
 * 优化后的 Vite 配置示例
 * 展示如何使用 @ldesign/launcher 提供的性能优化工具
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import react from '@vitejs/plugin-react'
import { 
  createViteOptimizer, 
  createOptimizedViteConfig 
} from '@ldesign/launcher/plugins/vite-optimizer'

export default defineConfig({
  // 合并优化的基础配置
  ...createOptimizedViteConfig({
    optimizeDeps: true,    // 启用依赖预构建优化
    incremental: true      // 启用增量构建
  }),

  // 添加框架插件
  plugins: [
    vue(),
    // react(),

    // 添加 Vite 优化插件
    ...createViteOptimizer({
      // 启用构建分析（生产构建时生成报告）
      analyze: process.env.ANALYZE === 'true',
      
      // 启用智能代码分割
      smartSplit: true,
      
      // 设置 chunk 大小限制 (KB)
      chunkSizeLimit: 500,
      
      // 生成 gzip 压缩分析
      gzipReport: true,
      
      // 分析报告输出目录
      analyzeDir: 'dist/stats'
    })
  ],

  // 自定义配置可以覆盖优化配置
  build: {
    // 目标环境
    target: 'es2020',
    
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    
    // Rollup 选项
    rollupOptions: {
      output: {
        // 自定义 chunk 分割（会与智能分割合并）
        manualChunks(id) {
          // 可以添加项目特定的分割规则
          if (id.includes('/src/utils/')) {
            return 'utils'
          }
        }
      }
    }
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    
    // 启用 CORS
    cors: true,
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

// 使用环境变量控制分析
// 构建时启用分析: ANALYZE=true npm run build
