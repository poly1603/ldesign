/**
 * 开发环境配置文件
 *
 * 主要配置开发环境特有的代理设置，其他配置继承自 launcher.config.ts
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 继承基础配置中的 launcher 预设和 alias 配置
  launcher: {
    preset: 'ldesign'
  },

  // 开发环境服务器配置 - 测试通知功能 v3
  server: {
    port: 3340, // 测试重启功能 - 终极测试！
    open: true, // 开发环境自动打开浏览器
    host: '0.0.0.0' // 允许外部访问
  },

  // 开发环境代理配置 - 主要差异化配置
  proxy: {
    // API 服务代理 - 开发环境
    api: {
      target: process.env.VITE_DEV_API_URL || 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Development': 'true',
        'X-Debug-Mode': 'enabled'
      }
    },

    // 静态资源代理 - 开发环境
    assets: {
      target: process.env.VITE_DEV_STATIC_URL || 'http://localhost:9000',
      pathPrefix: '/assets'
    },

    // WebSocket 代理 - 开发环境
    websocket: {
      target: process.env.VITE_DEV_WS_URL || 'http://localhost:8080',
      pathPrefix: '/ws'
    },

    // Mock 服务代理 - 仅开发环境
    mock: {
      target: process.env.VITE_DEV_MOCK_URL || 'http://localhost:3001',
      pathPrefix: '/mock'
    },

    // 全局代理配置
    global: {
      timeout: 15000,
      verbose: true, // 开发环境显示详细日志
      secure: false
    }
  },

  // 开发环境特定配置
  build: {
    sourcemap: true
  },

  // 开发环境环境变量
  define: {
    __DEV__: true,
    __ENVIRONMENT__: '"development"'
  }
})
