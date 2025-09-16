/**
 * 生产环境配置文件
 * 
 * 此文件展示了生产环境的代理配置和优化设置
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import path from 'node:path'
import { defineConfig } from '@ldesign/launcher'

const r = (p: string) => path.resolve(process.cwd(), p)

export default defineConfig({
  // 生产环境特定配置
  mode: 'production',

  server: {
    port: 3000,
    open: false, // 生产环境不自动打开浏览器
    host: 'localhost' // 生产环境限制访问
  },

  // 生产环境智能代理配置
  proxy: {
    // API 服务代理
    api: {
      target: process.env.VITE_API_BASE_URL || 'https://api.ldesign.com',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Forwarded-Proto': 'https',
        'X-Environment': 'production',
        'X-Service': 'ldesign-api'
      },
      timeout: 30000
    },

    // 静态资源代理 - CDN
    assets: {
      target: process.env.VITE_CDN_BASE_URL || 'https://cdn.ldesign.com',
      pathPrefix: '/static',
      cache: {
        maxAge: 31536000, // 生产环境长缓存
        etag: true
      }
    },

    // WebSocket 代理
    websocket: {
      target: process.env.VITE_WS_BASE_URL || 'https://ws.ldesign.com',
      pathPrefix: '/socket'
    },

    // 上传服务代理
    upload: {
      target: process.env.VITE_UPLOAD_BASE_URL || 'https://upload.ldesign.com',
      pathPrefix: '/upload',
      timeout: 60000,
      maxFileSize: '50MB'
    },

    // 全局代理配置
    global: {
      timeout: 30000,
      verbose: false, // 生产环境不显示详细日志
      secure: true, // 启用 SSL 验证
      environment: 'production'
    }
  },

  // 生产环境构建配置
  build: {
    outDir: 'dist',
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: true, // 生产环境压缩代码
    emptyOutDir: true, // 清空输出目录
    rollupOptions: {
      external: [
        // 外部化 Node.js 模块
        'fs', 'path', 'os', 'util', 'stream',
        'node:fs', 'node:path', 'node:os', 'node:util', 'node:stream',
        'node:fs/promises', 'node:process'
      ],
      output: {
        // 代码分割
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

  // 生产环境优化配置
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      '@ldesign/api',
      '@ldesign/http'
    ]
  },

  // 路径别名配置（生产环境使用构建后的文件）
  resolve: {
    alias: {
      '@': r('./src'),
      // Workspace 别名 - 生产环境也需要这些别名
      '@ldesign/api': r('../packages/api/src'),
      '@ldesign/crypto': r('../packages/crypto/src'),
      '@ldesign/http': r('../packages/http/src'),
      '@ldesign/size': r('../packages/size/src'),
      '@ldesign/i18n': r('../packages/i18n/src'),
      '@ldesign/router': r('../packages/router/src'),
      '@ldesign/device': r('../packages/device/src'),
      '@ldesign/color': r('../packages/color/src'),
      '@ldesign/cache': r('../packages/cache/src'),
      '@ldesign/store': r('../packages/store/src'),
      '@ldesign/template': r('../packages/template/src'),
      '@ldesign/engine': r('../packages/engine/src'),
      '@ldesign/builder': r('../packages/builder/src'),
      '@ldesign/launcher': r('../packages/launcher/src'),
      '@ldesign/api/vue': r('../packages/api/src/vue'),
      '@ldesign/crypto/vue': r('../packages/crypto/src/vue'),
      '@ldesign/http/vue': r('../packages/http/src/vue'),
      '@ldesign/size/vue': r('../packages/size/src/vue'),
      '@ldesign/i18n/vue': r('../packages/i18n/src/vue'),
      '@ldesign/router/vue': r('../packages/router/src/vue'),
      '@ldesign/device/vue': r('../packages/device/src/vue'),
      '@ldesign/color/vue': r('../packages/color/src/vue'),
      '@ldesign/cache/vue': r('../packages/cache/src/vue'),
      '@ldesign/store/vue': r('../packages/store/src/vue'),
      '@ldesign/template/vue': r('../packages/template/src/vue'),
      '@ldesign/engine/vue': r('../packages/engine/src/vue'),
      '@ldesign/builder/vue': r('../packages/builder/src/vue'),
      '@ldesign/launcher/vue': r('../packages/launcher/src/vue')
    }
  },

  // 生产环境特定的 launcher 配置
  launcher: {
    logLevel: 'warn', // 生产环境只显示警告
    autoRestart: false, // 生产环境不自动重启
    debug: false, // 关闭调试模式

    // 生产环境钩子
    hooks: {
      beforeStart: async () => {
        console.log('🚀 生产环境服务器启动前准备...')
      },
      afterStart: async () => {
        console.log('✅ 生产环境服务器启动完成！')
      },
      onError: async (error) => {
        console.error('❌ 生产环境服务器错误:', error.message)
      }
    }
  },

  // 生产环境 CSS 配置
  css: {
    devSourcemap: false, // 生产环境不生成 CSS sourcemap
    preprocessorOptions: {
      less: {
        additionalData: `@import "${r('./src/styles/variables.less')}";`,
        javascriptEnabled: true
      }
    }
  },

  // 生产环境环境变量 - 暂时注释掉避免冲突
  // define: {
  //   __DEV__: false,
  //   __ENVIRONMENT__: '"production"',
  //   __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'https://api.ldesign.com')
  // }
})
