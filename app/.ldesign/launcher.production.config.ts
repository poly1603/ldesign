/**
 * 生产环境配置文件
 *
 * 主要配置生产环境特有的代理设置，其他配置继承自 launcher.config.ts
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 生产环境服务器配置
  server: {
    port: 3000,
    open: false, // 生产环境不自动打开浏览器
    host: 'localhost'
  },

  // 生产环境代理配置 - 主要差异化配置
  proxy: {
    // API 服务代理 - 生产环境
    api: {
      target: process.env.VITE_API_BASE_URL || 'https://api.ldesign.com',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Environment': 'production',
        'X-Service': 'ldesign-api'
      },
      timeout: 30000
    },

    // 静态资源代理 - 生产环境 CDN
    assets: {
      target: process.env.VITE_CDN_BASE_URL || 'https://cdn.ldesign.com',
      pathPrefix: '/assets',
      cache: {
        maxAge: 31536000, // 生产环境长缓存
        etag: true
      }
    },

    // WebSocket 代理 - 生产环境
    websocket: {
      target: process.env.VITE_WS_BASE_URL || 'https://ws.ldesign.com',
      pathPrefix: '/ws'
    },

    // 全局代理配置
    global: {
      timeout: 30000,
      verbose: false, // 生产环境不显示详细日志
      secure: true // 启用 SSL 验证
    }
  },

  // 生产环境构建配置
  build: {
    sourcemap: false,
    minify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router'],
          ldesign: [
            '@ldesign/api',
            '@ldesign/http',
            '@ldesign/cache',
            '@ldesign/crypto'
          ]
        }
      }
    }
  },

  // 生产环境环境变量
  define: {
    __DEV__: false,
    __ENVIRONMENT__: '"production"'
  }
})
