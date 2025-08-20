/**
 * Vue I18n 增强功能演示应用入口
 */

import { createApp } from 'vue'
import { createI18n } from '@ldesign/i18n/vue'
import App from './App.vue'

// 导入翻译文件
import zhCN from './locales/zh-CN.json'
import en from './locales/en.json'

// 创建 I18n 实例
const i18n = createI18n({
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    'en': en,
  },
  // 启用开发模式功能
  development: {
    enabled: process.env.NODE_ENV === 'development',
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
})

// 创建 Vue 应用
const app = createApp(App)

// 安装 I18n 插件
app.use(i18n)

// 挂载应用
app.mount('#app')

// 开发模式下的全局调试
if (process.env.NODE_ENV === 'development') {
  // 将 i18n 实例暴露到全局，方便调试
  ;(window as any).__I18N__ = i18n
  
  console.log('🌍 Vue I18n Enhanced Demo')
  console.log('Available locales:', i18n.getAvailableLanguages())
  console.log('Current locale:', i18n.getCurrentLanguage())
  console.log('I18n instance available at window.__I18N__')
}
