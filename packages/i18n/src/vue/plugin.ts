/**
 * Vue 3 插件集成
 * 提供类似 vue-i18n 的 API 和功能
 */

import type { App, Plugin, InjectionKey } from 'vue'
import { inject, reactive, computed, ref, watch } from 'vue'
import type { CreateI18nOptions } from '../core/createI18n'
import { createI18n } from '../core/createI18n'
import type { VueI18n } from './types'

/**
 * Vue I18n 实例的注入键
 */
export const I18nInjectionKey: InjectionKey<VueI18n> = Symbol('i18n')

/**
 * Vue I18n 实例接口
 */
// 使用 ./types 中的 VueI18n 接口

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
    // 在 Vue 集成中，默认不进行自动检测，尊重传入的 locale
    autoDetect: options.autoDetect ?? false,
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
  const updateAvailableLocales = async () => {
    const loaderAny = i18n.loader as any
    if (loaderAny && typeof loaderAny.getAvailableLocales === 'function') {
      try {
        // 以正确的 this 绑定调用
        const result = loaderAny.getAvailableLocales()
        // 处理同步和异步结果
        if (result instanceof Promise) {
          state.availableLocales = await result
        } else if (Array.isArray(result)) {
          state.availableLocales = result
        } else {
          console.warn('[Vue I18n] getAvailableLocales returned non-array:', result)
          state.availableLocales = [options.locale || 'en']
        }
      } catch (error) {
        console.warn('[Vue I18n] Failed to get available locales:', error)
        state.availableLocales = [options.locale || 'en']
      }
    } else {
      state.availableLocales = [options.locale || 'en']
    }
  }

  // 翻译函数
  // 直接透传核心翻译函数，便于测试比较引用
  const t = i18n.t.bind(i18n) as (key: string, params?: Record<string, unknown>) => string

  // 检查键是否存在（保持与核心一致的签名）
  const te = i18n.exists.bind(i18n) as (key: string, locale?: string) => boolean

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
  i18n.init().then(async () => {
    await updateAvailableLocales()
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
    getLocaleMessage,
    getCurrentLanguage: () => state.locale,
    getAvailableLanguages: () => {
      // 确保返回字符串数组，而不是 LanguageInfo 对象数组
      if (Array.isArray(state.availableLocales)) {
        return state.availableLocales
      }
      // 如果 state.availableLocales 不是数组，返回空数组
      return []
    },
    changeLanguage: setLocale
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

  // 创建响应式的翻译函数
  const t = (key: string, params?: Record<string, unknown>): string => {
    // 通过访问 locale 来触发响应式更新
    i18n.locale
    return i18n.t(key, params)
  }

  // 创建响应式的键存在检查函数
  const te = (key: string, locale?: string): boolean => {
    // 通过访问 locale 来触发响应式更新
    i18n.locale
    return i18n.te(key, locale)
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

// 重新导出类型，供外部模块引用
export type { VueI18n } from './types'
