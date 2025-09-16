/**
 * 开发环境配置文件示例
 * 
 * 此文件展示了如何使用多环境配置和代理配置功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  // 开发环境特定配置
  mode: 'development',

  server: {
    port: 3353,
    open: true, // 开发环境自动打开浏览器
    host: '0.0.0.0', // 允许外部访问
    // https: false // 暂时禁用HTTPS来测试
  },

  // 开发环境智能代理配置
  proxy: {
    // API 服务代理
    api: {
      target: process.env.VITE_DEV_API_URL || 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Forwarded-Host': 'localhost',
        'X-Development': 'true',
        'X-Debug-Mode': 'enabled'
      },
      timeout: 10000
    },

    // 静态资源代理
    assets: {
      target: process.env.VITE_DEV_STATIC_URL || 'http://localhost:9000',
      pathPrefix: '/static',
      cache: {
        maxAge: 300, // 开发环境短缓存
        etag: true
      }
    },

    // WebSocket 代理
    websocket: {
      target: process.env.VITE_DEV_WS_URL || 'http://localhost:8080',
      pathPrefix: '/socket'
    },

    // 上传服务代理
    upload: {
      target: process.env.VITE_DEV_UPLOAD_URL || 'http://localhost:9001',
      pathPrefix: '/upload',
      timeout: 30000,
      maxFileSize: '100MB'
    },

    // 自定义代理规则
    custom: [
      {
        path: /^\/mock\/.*/, // 正则表达式匹配
        target: process.env.VITE_DEV_MOCK_URL || 'http://localhost:3001',
        options: {
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/mock/, '')
        }
      },
      {
        path: '/auth',
        target: process.env.VITE_DEV_AUTH_URL || 'http://localhost:8081',
        options: {
          headers: {
            'X-Auth-Service': 'development'
          }
        }
      }
    ],

    // 全局代理配置
    global: {
      timeout: 15000,
      verbose: true, // 开发环境显示详细日志
      secure: false,
      environment: 'development'
    }
  },

  // 开发环境构建配置
  build: {
    sourcemap: true, // 开发环境生成 sourcemap
    minify: false, // 开发环境不压缩
    watch: true // 启用监听模式
  },

  // 开发环境优化配置
  optimizeDeps: {
    force: true, // 强制重新构建依赖
    include: [
      // 预构建的依赖
      'vue',
      'vue-router',
      '@ldesign/api',
      '@ldesign/http'
    ]
  },

  // 路径别名配置 - 基础alias由defineConfig自动处理
  resolve: {
    alias: {
      // 开发环境特定别名
      '@dev': '../dev',
      '@mock': '../mock'
    }
  },

  // 开发环境特定的 launcher 配置
  launcher: {
    logLevel: 'debug', // 开发环境详细日志
    autoRestart: true, // 启用自动重启
    debug: true, // 启用调试模式

    // 开发环境钩子
    hooks: {
      beforeStart: async () => {
        console.log('🚀 开发服务器启动前准备...')
      },
      afterStart: async () => {
        console.log('✅ 开发服务器启动完成！')
        console.log('📝 开发环境配置已加载')
      },
      onError: async (error) => {
        console.error('❌ 开发服务器错误:', error.message)
      }
    }
  },

  // 开发环境 CSS 配置
  css: {
    devSourcemap: true, // CSS sourcemap
    preprocessorOptions: {
      less: {
        additionalData: `@import "./src/styles/variables.less";`,
        javascriptEnabled: true
      }
    }
  },

  // 开发环境环境变量
  define: {
    __DEV__: true,
    __ENVIRONMENT__: '"development"',
    __API_BASE_URL__: '"http://localhost:8080"'
  }
})
