/**
 * i18n 配置
 * 使用 @ldesign/i18n 包
 */

import { createVueI18n, useVueI18n } from '@ldesign/i18n'
import type { I18nEnginePluginOptions } from '@ldesign/i18n'
import zhCN from '@/locales/zh-CN'
import enUS from '@/locales/en-US'

// 创建 i18n 实例
const i18nPlugin = createVueI18n({
  locale: localStorage.getItem('app-locale') || 'zh-CN',
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  },
  detectBrowserLanguage: false,
  cache: {
    enabled: true,
    maxSize: 1000
  }
})

// 导出 i18n 实例
export const i18n = i18nPlugin.i18n

// 导出 useI18n composable
export function useI18n() {
  const instance = useVueI18n()
  
  // 添加自定义 setLocale 方法，保存到 localStorage
  const originalSetLocale = instance.setLocale
  instance.setLocale = async (locale: string) => {
    await originalSetLocale(locale)
    localStorage.setItem('app-locale', locale)
    
    // 更新 HTML lang 属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale.split('-')[0]
    }
  }
  
  return instance
}

// 创建 Engine 插件
export function createI18nEnginePlugin(options: I18nEnginePluginOptions = {}) {
  // 合并配置
  const config = {
    locale: localStorage.getItem('app-locale') || 'zh-CN',
    fallbackLocale: 'en-US',
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS
    },
    ...options
  }
  
  // 使用 @ldesign/i18n 的 createVueI18n
  const vuePlugin = createVueI18n(config)
  const { i18n } = vuePlugin
  
  // 保存原始 setLocale
  const originalSetLocale = i18n.setLocale.bind(i18n)
  
  // 重写 setLocale 以保存到 localStorage
  i18n.setLocale = async (locale: string) => {
    await originalSetLocale(locale)
    localStorage.setItem('app-locale', locale)
    
    // 更新 HTML lang 属性
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale.split('-')[0]
    }
  }
  
  // 存储 Vue plugin 的引用以供后续使用
  let installedToVueApp = false
  
  return {
    name: '@ldesign/i18n',
    version: '2.0.0',
    
    // Engine 插件的 install 方法
    async install(engine: any) {
      // 引擎插件只需要注册 API
      // Vue 插件部分将在 setupApp 中处理
      
      // 注册到引擎的 API
      if (engine.api) {
        engine.api.i18n = i18n
      }
      
      console.log(`✅ [@ldesign/i18n] Engine plugin registered (locale: ${i18n.locale})`)
    },
    
    async onReady() {
      console.log('✅ [@ldesign/i18n] Initialized')
    },
    
    api: {
      t: i18n.t.bind(i18n),
      getCurrentLocale: () => i18n.locale,
      changeLocale: i18n.setLocale.bind(i18n),
      getAvailableLocales: () => i18n.getAvailableLocales()
    },
    
    // 暴露 Vue 插件供 setupApp 使用
    vuePlugin
  }
}

// 导出默认实例
export default {
  i18n,
  useI18n,
  createI18nEnginePlugin
}
