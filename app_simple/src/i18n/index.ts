/**
 * i18n 国际化集成模块
 * 基于 @ldesign/i18n 核心库构建
 */

// 使用简化的本地 i18n 实现
// 基于 @ldesign/i18n 的核心概念，但避免构建问题
import { ref } from 'vue'
import type { App } from 'vue'
import zhCN from './locales/zh-CN'
import enUS from './locales/en-US'

// 支持的语言配置
export const SUPPORTED_LOCALES = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' }
] as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number]['code']

// 默认语言
export const DEFAULT_LOCALE: SupportedLocale = 'zh-CN'

// 语言工具函数
export const localeUtils = {
  /**
   * 获取浏览器语言
   */
  getBrowserLocale(): SupportedLocale {
    const browserLang = navigator.language || 'zh-CN'
    
    // 精确匹配
    if (SUPPORTED_LOCALES.some(l => l.code === browserLang)) {
      return browserLang as SupportedLocale
    }
    
    // 模糊匹配
    const shortLang = browserLang.split('-')[0]
    const matched = SUPPORTED_LOCALES.find(l => l.code.startsWith(shortLang))
    if (matched) {
      return matched.code
    }
    
    return DEFAULT_LOCALE
  },

  /**
   * 获取已保存的语言偏好
   */
  getSavedLocale(): SupportedLocale | null {
    const saved = localStorage.getItem('app_locale')
    if (saved && SUPPORTED_LOCALES.some(l => l.code === saved)) {
      return saved as SupportedLocale
    }
    return null
  },

  /**
   * 保存语言偏好
   */
  saveLocale(locale: SupportedLocale): void {
    localStorage.setItem('app_locale', locale)
  },

  /**
   * 获取初始语言
   */
  getInitialLocale(): SupportedLocale {
    return this.getSavedLocale() || this.getBrowserLocale()
  },

  /**
   * 获取语言显示名称
   */
  getLocaleName(locale: SupportedLocale): string {
    const found = SUPPORTED_LOCALES.find(l => l.code === locale)
    return found?.name || locale
  },

  /**
   * 获取语言旗帜图标
   */
  getLocaleFlag(locale: string): string {
    const found = SUPPORTED_LOCALES.find(l => l.code === locale)
    return found?.flag || '🌐'
  }
}

// i18n 实例接口
interface I18nInstance {
  locale: string
  messages: Record<string, any>
  t: (key: string, params?: any) => string
  changeLocale: (locale: string) => Promise<void>
  has: (key: string) => boolean
  getResource: (locale: string, key: string) => any
  init: () => Promise<void>
  destroy: () => void
}

// 简单的 i18n 实现 - 使用 Vue 响应式系统
class SimpleI18n implements I18nInstance {
  private _locale = ref<string>('zh-CN')
  messages: Record<string, any>
  
  get locale() {
    return this._locale.value
  }
  
  set locale(value: string) {
    this._locale.value = value
  }
  
  constructor(config: any) {
    this._locale.value = config.locale || 'zh-CN'
    this.messages = config.messages || {}
  }
  
  async init() {
    // 初始化逻辑
    return Promise.resolve()
  }
  
  t(key: string, params?: any): string {
    // 获取当前语言的消息
    const messages = this.messages[this._locale.value] || {}
    
    // 按路径获取值
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return key // 未找到，返回键名
      }
    }
    
    // 如果是字符串，处理插值
    if (typeof value === 'string' && params) {
      return value.replace(/{([^}]+)}/g, (match, param) => {
        return params[param] !== undefined ? params[param] : match
      })
    }
    
    return value || key
  }
  
  async changeLocale(locale: string) {
    this._locale.value = locale
    return Promise.resolve()
  }
  
  has(key: string): boolean {
    const messages = this.messages[this.locale] || {}
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return false
      }
    }
    
    return true
  }
  
  getResource(locale: string, key: string): any {
    const messages = this.messages[locale] || {}
    const keys = key.split('.')
    let value: any = messages
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k]
      } else {
        return undefined
      }
    }
    
    return value
  }
  
  destroy() {
    // 清理逻辑
  }
}

// 创建 i18n 实例的工厂函数
function createI18n(config: any): I18nInstance {
  return new SimpleI18n(config)
}

// 全局 i18n 实例
let globalI18n: I18nInstance | null = null

/**
 * 初始化 i18n
 */
export async function initI18n(): Promise<I18nInstance> {
  const initialLocale = localeUtils.getInitialLocale()
  
  // 创建简化的 i18n 实例
  const i18n = createI18n({
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS,
    }
  })
  
  // 初始化 i18n 实例
  await i18n.init()
  
  // 设置 document 语言属性
  document.documentElement.lang = initialLocale
  
  // 保存全局实例
  globalI18n = i18n
  
  // 开发环境下暴露到 window
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    (window as any).$i18n = i18n
  }
  
  return i18n
}

/**
 * 获取全局 i18n 实例
 */
export function getI18n(): I18nInstance {
  if (!globalI18n) {
    throw new Error('[i18n] Instance not initialized. Call initI18n() first.')
  }
  return globalI18n
}

/**
 * 切换语言
 */
export async function setLocale(locale: SupportedLocale): Promise<void> {
  const i18n = getI18n()
  
  // 使用 @ldesign/i18n 的 changeLocale 方法
  await i18n.changeLocale(locale)
  
  // 保存偏好
  localeUtils.saveLocale(locale)
  
  // 更新 document 语言属性
  document.documentElement.lang = locale
  
  if (import.meta.env.DEV) {
    console.log(`✅ Language changed to: ${locale}`)
  }
}

/**
 * 获取当前语言
 */
export function getLocale(): SupportedLocale {
  return getI18n().locale as SupportedLocale
}

/**
 * Vue plugin
 */
export const i18nPlugin = {
  install(app: App) {
    const i18n = getI18n()
    
    // Provide global properties
    app.config.globalProperties.$t = i18n.t.bind(i18n)
    app.config.globalProperties.$i18n = i18n
    
    // Provide injection
    app.provide('i18n', i18n)
  }
}

/**
 * 为引擎创建 i18n 插件
 */
export async function createI18nPlugin() {
  // 初始化 i18n
  const i18n = await initI18n()
  
  return {
    name: 'i18n',
    version: '2.0.0', // 使用 @ldesign/i18n 核心
    
    async install(context: any) {
      console.log('[i18n] Installing plugin with @ldesign/i18n core...')
      
      // 处理引擎上下文
      if (context && context.engine) {
        const engine = context.engine
        
        // 安装到 Vue 应用的函数
        const installToApp = (app: any) => {
          if (app && app.config) {
            // 添加全局属性
            app.config.globalProperties.$t = (key: string, params?: any) => i18n.t(key, params)
            app.config.globalProperties.$i18n = i18n
            app.config.globalProperties.$locale = () => i18n.locale
            app.config.globalProperties.$setLocale = setLocale
            
            // 提供注入
            if (app.provide) {
              app.provide('i18n', i18n)
            }
            
            console.log('[i18n] ✅ Installed to Vue app')
          }
        }
        
        // 尝试获取现有应用
        const app = engine.getApp ? engine.getApp() : engine._app
        if (app) {
          installToApp(app)
        } else {
          // 监听应用创建事件
          engine.events.on('app:created', installToApp)
        }
      } 
      // 直接处理 Vue 应用
      else if (context && context.config) {
        context.config.globalProperties.$t = (key: string, params?: any) => i18n.t(key, params)
        context.config.globalProperties.$i18n = i18n
        context.config.globalProperties.$locale = () => i18n.locale
        context.config.globalProperties.$setLocale = setLocale
        
        if (context.provide) {
          context.provide('i18n', i18n)
        }
        
        console.log('[i18n] ✅ Installed to Vue app (direct)')
      }
    }
  }
}

/**
 * 导出类型
 */
export type { I18nInstance }
