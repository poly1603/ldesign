/**
 * LDesign Launcher 配置文件
 * 
 * 这是 app_simple 项目的优化配置
 */

import { defineConfig } from '@ldesign/launcher'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  // 服务器配置
  server: {
    port: 3000,
    host: true,
    open: false,
    cors: true,
    fs: {
      allow: ['..']
    }
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  },

  // 路径解析
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
      '@ldesign/api': resolve(__dirname, '../../packages/api/src'),
      '@ldesign/cache': resolve(__dirname, '../../packages/cache/src'),
      '@ldesign/color': resolve(__dirname, '../../packages/color/src'),
      '@ldesign/crypto': resolve(__dirname, '../../packages/crypto/src'),
      '@ldesign/engine': resolve(__dirname, '../../packages/engine/src'),
      '@ldesign/http': resolve(__dirname, '../../packages/http/src'),
      '@ldesign/i18n': resolve(__dirname, '../../packages/i18n/src'),
      '@ldesign/router': resolve(__dirname, '../../packages/router/src'),
      '@ldesign/store': resolve(__dirname, '../../packages/store/src'),
      '@ldesign/template': resolve(__dirname, '../../packages/template/src')
    }
  },

  // 插件配置
  plugins: [
    vue()
  ],

  // 构建配置
  build: {
    outDir: 'site',
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'pinia'],
          'ldesign-core': [
            '@ldesign/api',
            '@ldesign/cache',
            '@ldesign/router',
            '@ldesign/store'
          ]
        }
      }
    }
  },

  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'pinia', 'lucide-vue-next'],
    exclude: [
      '@ldesign/api',
      '@ldesign/cache',
      '@ldesign/color',
      '@ldesign/crypto',
      '@ldesign/engine',
      '@ldesign/http',
      '@ldesign/i18n',
      '@ldesign/router',
      '@ldesign/store',
      '@ldesign/template'
    ]
  },

  // Launcher 特定配置
  launcher: {
    logLevel: 'info',
    mode: 'development',
    debug: false,
    // 启用自动重启
    autoRestart: true,
    // 启用性能监控
    performance: {
      enabled: true,
      interval: 2000
    },
    // 启用资源管理
    resourceManagement: {
      enabled: true,
      autoCleanup: true
    }
  }
})
