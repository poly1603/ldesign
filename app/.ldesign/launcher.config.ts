import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: {
    port: 3011,
    open: false,
    host: '0.0.0.0',
    https: false // 暂时禁用HTTPS来测试页面空白问题
  },
  // 测试配置热重启 - 暂时注释掉避免冲突
  // define: {
  //   __TEST_CONFIG_RELOAD__: '"test-value"'
  // },

  // 智能代理配置 - 专业的服务类型配置
  proxy: {
    // API 服务代理
    api: {
      target: 'http://localhost:8080',
      pathPrefix: '/api',
      rewrite: true,
      headers: {
        'X-Service': 'ldesign-api'
      }
    },

    // 静态资源代理
    assets: {
      target: 'http://localhost:9000',
      pathPrefix: '/assets'
    },

    // WebSocket 代理
    websocket: {
      target: 'http://localhost:8080',
      pathPrefix: '/ws'
    },

    // 全局代理配置
    global: {
      timeout: 10000,
      verbose: false, // 基础配置不显示详细日志
      secure: false
    }
  },

  // 路径别名配置 - 无需手动写r函数，defineConfig会自动处理相对路径
  resolve: {
    alias: {
      // Map workspace Vue entrypoints for vite dep-scan
      '@ldesign/api/vue': '../packages/api/src/vue',
      '@ldesign/crypto/vue': '../packages/crypto/src/vue',
      '@ldesign/http/vue': '../packages/http/src/vue',
      '@ldesign/size/vue': '../packages/size/src/vue',
      '@ldesign/i18n/vue': '../packages/i18n/src/vue',
      '@ldesign/router/vue': '../packages/router/src/vue',
      '@ldesign/device/vue': '../packages/device/src/vue',
      '@ldesign/color/vue': '../packages/color/src/vue',
      '@ldesign/cache/vue': '../packages/cache/src/vue',
      '@ldesign/cache': '../packages/cache/src',
      '@ldesign/engine/vue': '../packages/engine/src/vue',
      '@ldesign/chart/vue': '../packages/chart/src/vue',
      '@ldesign/store/vue': '../packages/store/src/vue',
      // Map http root to source to avoid exports subpath issues
      '@ldesign/http': '../packages/http/src',
      '@ldesign/color': '../packages/color/src',
      '@': './src'
    }
  },

  optimizeDeps: {
    exclude: ['alova', 'alova/GlobalFetch', 'axios']
  }
})
