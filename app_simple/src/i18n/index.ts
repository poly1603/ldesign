/**
 * i18n 国际化集成模块
 * 使用 @ldesign/i18n 核心概念，但简化实现以避免构建问题
 * 
 * 未来当 @ldesign/i18n 构建完成后，可以直接引入使用
 */

// 从源文件引入 @ldesign/i18n 的核心功能
import { OptimizedI18n } from '@ldesign/i18n/src/core/i18n-optimized'
import type { I18nInstance, I18nConfig } from '@ldesign/i18n/src/types'
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

// 全局 i18n 实例
let globalI18n: I18nInstance | null = null

/**
 * 初始化 i18n
 * 使用 @ldesign/i18n 的 OptimizedI18n 类
 */
export async function initI18n(): Promise<I18nInstance> {
  const initialLocale = localeUtils.getInitialLocale()
  
  // 使用 OptimizedI18n 创建 i18n 实例
  const config: I18nConfig = {
    locale: initialLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages: {
      'zh-CN': zhCN,
      'en-US': enUS,
    },
    // 启用优化特性
    cache: {
      enabled: true,
      maxSize: 100
    },
    // 错误处理
    onMissingKey: (key: string) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation for key: ${key}`)
      }
      return key
    }
  }
  
  // 创建并初始化 i18n 实例
  const i18n = new OptimizedI18n(config)
  await i18n.init()
  
  // 设置 document 语言属性
  document.documentElement.lang = initialLocale
  
  // 保存全局实例
  globalI18n = i18n
  
  // 监听语言变化
  i18n.on('localeChanged', ({ locale }) => {
    if (locale) {
      document.documentElement.lang = locale
      localeUtils.saveLocale(locale as SupportedLocale)
    }
  })
  
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
  
  // 使用 @ldesign/i18n 的 setLocale 方法
  await i18n.setLocale(locale)
  
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
 * 为引擎创建 i18n 插件
 * 简化版本，避免动态导入问题
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
        const installToApp = (app: App) => {
          if (app && app.config) {
            // 添加全局属性
            app.config.globalProperties.$t = i18n.t.bind(i18n)
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
        context.config.globalProperties.$t = i18n.t.bind(i18n)
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
 * Vue Composable
 */
export function useI18n() {
  return {
    i18n: getI18n(),
    t: (key: string, params?: any) => getI18n().t(key, params),
    locale: ref(getI18n().locale),
    setLocale,
    getLocale
  }
}

/**
 * 导出类型
 */
export type { I18nInstance }
