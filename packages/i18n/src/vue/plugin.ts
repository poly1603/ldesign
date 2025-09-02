/**
 * Vue 3 插件集成
 * 提供类似 vue-i18n 的 API 和功能
 */

import type { App, Plugin, InjectionKey } from 'vue'
import { inject, reactive, computed, ref, watch } from 'vue'
import type { I18n } from '../core/i18n'
import type { CreateI18nOptions } from '../core/createI18n'
import { createI18n } from '../core/createI18n'

/**
 * Vue I18n 实例的注入键
 */
export const I18nInjectionKey: InjectionKey<VueI18n> = Symbol('i18n')

/**
 * Vue I18n 实例接口
 */
export interface VueI18n {
  /** 核心 I18n 实例 */
  global: I18n
  /** 当前语言 */
  locale: string
  /** 可用语言列表 */
  availableLocales: string[]
  /** 翻译函数 */
  t: (key: string, params?: Record<string, unknown>) => string
  /** 检查键是否存在 */
  te: (key: string, locale?: string) => boolean
  /** 切换语言 */
  setLocale: (locale: string) => Promise<void>
  /** 添加语言包 */
  setLocaleMessage: (locale: string, messages: Record<string, unknown>) => void
  /** 获取语言包 */
  getLocaleMessage: (locale: string) => Record<string, unknown>
}

/**
 * 创建 Vue I18n 实例
 * @param options 配置选项
 * @returns Vue I18n 实例
 */
export function createVueI18n(options: CreateI18nOptions): VueI18n {
  // 创建响应式状态
  const state = reactive({
    locale: options.locale || 'en',
    availableLocales: [] as string[]
  })

  // 添加语言变化监听器到选项中
  const enhancedOptions = {
    ...options,
    onLanguageChanged: (newLocale: string) => {
      state.locale = newLocale
      // 如果用户也提供了回调，也要调用
      if (options.onLanguageChanged) {
        options.onLanguageChanged(newLocale)
      }
    }
  }

  // 创建核心 I18n 实例
  const i18n = createI18n(enhancedOptions)

  // 初始化可用语言列表
  const updateAvailableLocales = () => {
    if (i18n.loader && typeof i18n.loader.getAvailableLocales === 'function') {
      state.availableLocales = i18n.loader.getAvailableLocales()
    } else {
      // 如果加载器没有 getAvailableLocales 方法，使用默认值
      state.availableLocales = [options.locale || 'en']
    }
  }

  // 翻译函数
  const t = (key: string, params?: Record<string, unknown>): string => {
    return i18n.t(key, params as any)
  }

  // 检查键是否存在
  const te = (key: string, locale?: string): boolean => {
    return i18n.exists(key, locale)
  }

  // 切换语言
  const setLocale = async (locale: string): Promise<void> => {
    await i18n.changeLanguage(locale)
    state.locale = locale
  }

  // 添加语言包
  const setLocaleMessage = (locale: string, messages: Record<string, unknown>): void => {
    // 这里需要扩展核心 I18n 类来支持动态添加语言包
    console.warn('setLocaleMessage: 动态添加语言包功能待实现')
  }

  // 获取语言包
  const getLocaleMessage = (locale: string): Record<string, unknown> => {
    // 这里需要扩展核心 I18n 类来支持获取语言包
    console.warn('getLocaleMessage: 获取语言包功能待实现')
    return {}
  }

  // 初始化
  i18n.init().then(() => {
    updateAvailableLocales()
  })

  return {
    global: i18n,
    get locale() {
      return state.locale
    },
    get availableLocales() {
      return state.availableLocales
    },
    t,
    te,
    setLocale,
    setLocaleMessage,
    getLocaleMessage
  }
}

/**
 * Vue I18n 插件
 * @param options 配置选项
 * @returns Vue 插件
 */
export function createI18nPlugin(options: CreateI18nOptions): Plugin {
  return {
    install(app: App) {
      const i18n = createVueI18n(options)

      // 提供全局实例
      app.provide(I18nInjectionKey, i18n)

      // 添加全局属性
      app.config.globalProperties.$i18n = i18n
      app.config.globalProperties.$t = i18n.t
      app.config.globalProperties.$te = i18n.te
    }
  }
}

/**
 * 使用 I18n 的组合式 API
 * @returns I18n 实例和相关方法
 */
export function useI18n() {
  const i18n = inject(I18nInjectionKey)

  if (!i18n) {
    throw new Error('useI18n() 必须在安装了 I18n 插件的 Vue 应用中使用')
  }

  return {
    locale: computed(() => i18n.locale),
    availableLocales: computed(() => i18n.availableLocales),
    t: i18n.t,
    te: i18n.te,
    setLocale: i18n.setLocale,
    setLocaleMessage: i18n.setLocaleMessage,
    getLocaleMessage: i18n.getLocaleMessage
  }
}

/**
 * 默认导出
 */
export default {
  createVueI18n,
  createI18nPlugin,
  useI18n,
  I18nInjectionKey
}
