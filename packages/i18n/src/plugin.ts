/**
 * @ldesign/i18n - Optimized Plugin
 * 极简、高性能的 i18n 插件实现
 */

import type { I18nConfig } from './types'
import { type App, inject, ref, type Ref, watchEffect } from 'vue'
import { OptimizedI18n } from './core/i18n-optimized'

export interface I18nPluginOptions extends Omit<I18nConfig, 'locale'> {
  /**
   * 语言设置 - 支持 string 或 Ref<string>
   * 如果传入 Ref，将直接使用（共享模式）
   * 如果传入 string 或不传，将创建新的 Ref（独立模式）
   */
  locale?: string | Ref<string>
  
  /**
   * 是否持久化语言设置
   * @default true
   */
  persist?: boolean
  
  /**
   * localStorage 的 key
   * @default 'ldesign-locale'
   */
  storageKey?: string
}

/**
 * 判断是否为 Ref
 */
const isRef = <T>(v: any): v is Ref<T> => {
  return v && typeof v === 'object' && 'value' in v && '_rawValue' in v
}

/**
 * 创建优化的 i18n 插件
 */
export function createI18nPlugin(options: I18nPluginOptions = {}) {
  const { 
    persist = true, 
    storageKey = 'ldesign-locale',
    ...i18nConfig 
  } = options
  
  // 1. 智能处理 locale
  let locale: Ref<string>
  
  if (isRef(options.locale)) {
    // 传入的是 Ref，直接使用（共享模式）
    locale = options.locale
  } else {
    // 传入的是 string 或未传入，创建新 Ref（独立模式）
    let initialLocale = options.locale || 'zh-CN'
    
    // 从 localStorage 恢复
    if (persist && typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey)
      if (saved) initialLocale = saved
    }
    
    locale = ref(initialLocale)
  }
  
  // 2. 创建 i18n 实例
  const i18n = new OptimizedI18n({
    ...i18nConfig,
    locale: locale.value
  })
  
  // 初始化
  i18n.init().catch(console.error)
  
  // 3. 单次监听（性能优化）
  const watchers: Array<() => void> = []
  
  const startWatcher = () => {
    const stopWatcher = watchEffect(() => {
      const currentLocale = locale.value
      if (currentLocale !== i18n.locale) {
        i18n.setLocale(currentLocale)
        
        // 持久化
        if (persist && typeof window !== 'undefined') {
          localStorage.setItem(storageKey, currentLocale)
        }
        
        // 同步到 HTML lang 属性
        if (typeof document !== 'undefined') {
          document.documentElement.lang = currentLocale.split('-')[0]
        }
      }
    })
    watchers.push(stopWatcher)
  }
  
  startWatcher()
  
  // 4. 绑定 t 函数上下文（避免 this 问题）
  const t = i18n.t.bind(i18n)
  
  // 5. 返回极简 API
  return {
    name: '@ldesign/i18n',
    locale,  // 直接暴露 ref
    t,       // 翻译函数
    i18n,    // 完整实例（可选使用）
    
    // 便捷方法
    setLocale: (newLocale: string) => {
      locale.value = newLocale
    },
    
    // 销毁方法
    destroy: () => {
      // 清理所有 watchers
      watchers.forEach(stop => stop())
      watchers.length = 0
      i18n.destroy()
    },
    
    // Vue 插件安装
    install(app: App) {
      // 智能共享：如果没有传入 Ref，尝试自动共享
      if (!isRef(options.locale)) {
        // 尝试从 app context 获取共享的 locale
        const sharedLocale = app._context?.provides?.locale as Ref<string> | undefined
        
        if (sharedLocale && sharedLocale.value !== undefined) {
          // 发现共享的 locale，使用它
          locale = sharedLocale
          this.locale = sharedLocale
          
          // 重新绑定 i18n 实例到共享的 locale
          const stopSharedWatcher = watchEffect(() => {
            const currentLocale = sharedLocale.value
            if (currentLocale !== i18n.locale) {
              i18n.setLocale(currentLocale)
              
              if (persist && typeof window !== 'undefined') {
                localStorage.setItem(storageKey, currentLocale)
              }
            }
          })
          watchers.push(stopSharedWatcher)
        } else {
          // 没有共享的 locale，提供自己的
          app.provide('locale', locale)
        }
      }
      
      // 提供 i18n 实例
      app.provide('i18n', this)
      
      // 全局属性（可选）
      app.config.globalProperties.$t = t
      app.config.globalProperties.$i18n = this
    }
  }
}

/**
 * 在组件中使用 i18n
 */
export function useI18n() {
  const i18n = inject<ReturnType<typeof createI18nPlugin>>('i18n')
  
  if (!i18n) {
    console.warn('[i18n] No i18n instance found. Did you forget to install the plugin?')
    return {
      locale: ref('zh-CN'),
      t: (key: string) => key,
      setLocale: () => {}
    }
  }
  
  return i18n
}