/**
 * 完整演示应用入口
 * 
 * 展示 @ldesign/i18n 的所有功能：
 * - 基础国际化
 * - Vue 3 集成
 * - 插件系统
 * - 性能监控
 * - 调试工具
 * - SSR 支持
 */

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createI18n, cachePlugin, performancePlugin } from '@ldesign/i18n/vue'
import App from './App.vue'

// 导入翻译文件
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// 导入路由
import { routes } from './router'

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 创建 I18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'en': en,
    'ja': ja,
  },
  // 开发模式配置
  development: {
    enabled: import.meta.env.DEV,
    performance: {
      enabled: true,
      slowThreshold: 5,
      maxLogs: 1000,
    },
    debug: {
      enabled: true,
      level: 'info',
      trackCoverage: true,
      validateParams: true,
      checkMissingKeys: true,
    },
  },
  // SSR 配置
  ssr: {
    enabled: false, // 在这个演示中禁用 SSR
  },
})

// 注册插件
async function setupPlugins() {
  try {
    // 注册缓存插件
    await i18n.plugins.register(cachePlugin, {
      maxSize: 500,
      ttl: 5 * 60 * 1000, // 5分钟
      lru: true,
      preloadKeys: [
        'app.title',
        'nav.home',
        'nav.features',
        'nav.examples',
        'nav.docs',
      ],
      enableMetrics: true,
    })

    // 注册性能监控插件
    await i18n.plugins.register(performancePlugin, {
      enabled: import.meta.env.DEV,
      slowThreshold: 10,
      maxRecords: 1000,
      sampleRate: 1.0,
      collectStackTrace: import.meta.env.DEV,
      reportInterval: 30000, // 30秒
    })

    console.log('✅ I18n plugins registered successfully')
  }
  catch (error) {
    console.error('❌ Failed to register I18n plugins:', error)
  }
}

// 创建 Vue 应用
const app = createApp(App)

// 安装插件
app.use(router)
app.use(i18n)

// 设置插件并启动应用
setupPlugins().then(() => {
  // 挂载应用
  app.mount('#app')

  // 开发模式下的全局调试
  if (import.meta.env.DEV) {
    // 将实例暴露到全局，方便调试
    ;(window as any).__I18N__ = i18n
    ;(window as any).__ROUTER__ = router
    ;(window as any).__APP__ = app

    console.log('🌍 @ldesign/i18n Complete Demo')
    console.log('Available locales:', i18n.getAvailableLanguages())
    console.log('Current locale:', i18n.getCurrentLanguage())
    console.log('Plugin stats:', i18n.plugins.getStats())
    console.log('Global instances available:')
    console.log('  - window.__I18N__ (I18n instance)')
    console.log('  - window.__ROUTER__ (Vue Router)')
    console.log('  - window.__APP__ (Vue App)')
  }
})

// 错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

// 警告处理
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue Warning:', msg)
  console.warn('Component:', instance)
  console.warn('Trace:', trace)
}
