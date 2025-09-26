/**
 * 开发环境配置文件
 *
 * 主要配置开发环境特有的代理设置，其他配置继承自 launcher.config.ts
 *
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  // 继承基础配置中的 launcher 预设和 alias 配置
  launcher: {
    preset: 'ldesign'
  },

  // 开发环境别名配置 - 指向源码目录
  resolve: {
    alias: [
      // 用户自定义别名（在所有阶段都生效）
      { find: '@components', replacement: './src/components', stages: ['dev', 'build', 'preview'] },
      { find: '@utils', replacement: './src/utils', stages: ['dev', 'build', 'preview'] },
      { find: '@assets', replacement: './src/assets', stages: ['dev', 'build', 'preview'] },
      { find: '@styles', replacement: './src/styles', stages: ['dev', 'build', 'preview'] },

      // CSS文件别名 - 开发时指向源码样式文件
      { find: '@ldesign/color/es/exports/vue.css', replacement: resolve(__dirname, '../../packages/color/src/styles/index.css'), stages: ['dev'] },
      { find: '@ldesign/i18n/es/index.css', replacement: resolve(__dirname, '../../packages/i18n/src/styles/index.css'), stages: ['dev'] },
      { find: '@ldesign/size/es/index.css', replacement: resolve(__dirname, '../../packages/size/src/styles/index.css'), stages: ['dev'] },
      { find: '@ldesign/template/es/index.css', replacement: resolve(__dirname, '../../packages/template/src/styles/index.css'), stages: ['dev'] },

      // @ldesign 包的开发时别名 - 指向源码目录（仅在 dev 阶段）
      { find: '@ldesign/api', replacement: resolve(__dirname, '../../packages/api/src'), stages: ['dev'] },
      { find: '@ldesign/builder', replacement: resolve(__dirname, '../../packages/builder/src'), stages: ['dev'] },
      { find: '@ldesign/cache', replacement: resolve(__dirname, '../../packages/cache/src'), stages: ['dev'] },
      { find: '@ldesign/color/exports/vue', replacement: resolve(__dirname, '../../packages/color/src/exports/vue'), stages: ['dev'] },
      { find: '@ldesign/color/vue', replacement: resolve(__dirname, '../../packages/color/src/vue'), stages: ['dev'] },
      { find: '@ldesign/color', replacement: resolve(__dirname, '../../packages/color/src'), stages: ['dev'] },
      { find: '@ldesign/crypto', replacement: resolve(__dirname, '../../packages/crypto/src'), stages: ['dev'] },
      { find: '@ldesign/device/vue', replacement: resolve(__dirname, '../../packages/device/src/vue'), stages: ['dev'] },
      { find: '@ldesign/device', replacement: resolve(__dirname, '../../packages/device/src'), stages: ['dev'] },
      { find: '@ldesign/engine', replacement: resolve(__dirname, '../../packages/engine/src'), stages: ['dev'] },
      { find: '@ldesign/http', replacement: resolve(__dirname, '../../packages/http/src'), stages: ['dev'] },
      { find: '@ldesign/i18n/vue', replacement: resolve(__dirname, '../../packages/i18n/src/vue'), stages: ['dev'] },
      { find: '@ldesign/i18n', replacement: resolve(__dirname, '../../packages/i18n/src'), stages: ['dev'] },
      { find: '@ldesign/kit', replacement: resolve(__dirname, '../../packages/kit/src'), stages: ['dev'] },
      { find: '@ldesign/launcher', replacement: resolve(__dirname, '../../packages/launcher/src'), stages: ['dev'] },
      { find: '@ldesign/router', replacement: resolve(__dirname, '../../packages/router/src'), stages: ['dev'] },
      { find: '@ldesign/shared', replacement: resolve(__dirname, '../../packages/shared/src'), stages: ['dev'] },
      { find: '@ldesign/size', replacement: resolve(__dirname, '../../packages/size/src'), stages: ['dev'] },
      { find: '@ldesign/store', replacement: resolve(__dirname, '../../packages/store/src'), stages: ['dev'] },
      { find: '@ldesign/template', replacement: resolve(__dirname, '../../packages/template/src'), stages: ['dev'] },
    ]
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
    outDir: 'dist-dev', // 开发环境输出目录
    sourcemap: true
  },

  // 开发环境环境变量
  define: {
    __DEV__: true,
    __ENVIRONMENT__: '"development"'
  }
})
