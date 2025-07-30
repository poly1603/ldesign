import { ref, computed, inject, onUnmounted } from 'vue'
import type { UseI18nReturn } from './types'
import type { I18nInstance } from '@/core/types'

/**
 * I18n 注入键
 */
export const I18N_INJECTION_KEY = Symbol('i18n')

/**
 * Vue I18n 组合式 API
 * @returns I18n 相关的响应式状态和方法
 */
export function useI18n(): UseI18nReturn {
  // 从 Vue 应用中注入 I18n 实例
  const i18n = inject<I18nInstance>(I18N_INJECTION_KEY)
  
  if (!i18n) {
    throw new Error(
      'useI18n() must be called within a component that has access to the I18n plugin. ' +
      'Make sure you have installed the I18n plugin using app.use(i18nPlugin).'
    )
  }

  // 创建响应式的当前语言
  const locale = ref(i18n.getCurrentLanguage())
  
  // 创建响应式的可用语言列表
  const availableLanguages = computed(() => i18n.getAvailableLanguages())

  // 语言变更监听器
  const handleLanguageChange = (newLocale: string) => {
    locale.value = newLocale
  }

  // 监听语言变更事件
  i18n.on('languageChanged', handleLanguageChange)

  // 组件卸载时清理监听器
  onUnmounted(() => {
    i18n.off('languageChanged', handleLanguageChange)
  })

  // 切换语言的方法
  const changeLanguage = async (newLocale: string) => {
    await i18n.changeLanguage(newLocale)
  }

  // 检查翻译键是否存在
  const exists = (key: string, targetLocale?: string) => {
    return i18n.exists(key, targetLocale)
  }

  // 获取所有翻译键
  const getKeys = (targetLocale?: string) => {
    return i18n.getKeys(targetLocale)
  }

  return {
    t: i18n.t,
    locale,
    availableLanguages,
    changeLanguage,
    exists,
    getKeys,
    i18n
  }
}

/**
 * 创建局部 I18n 实例的组合式 API
 * @param i18nInstance 自定义的 I18n 实例
 * @returns I18n 相关的响应式状态和方法
 */
export function useI18nWithInstance(i18nInstance: I18nInstance): UseI18nReturn {
  // 创建响应式的当前语言
  const locale = ref(i18nInstance.getCurrentLanguage())
  
  // 创建响应式的可用语言列表
  const availableLanguages = computed(() => i18nInstance.getAvailableLanguages())

  // 语言变更监听器
  const handleLanguageChange = (newLocale: string) => {
    locale.value = newLocale
  }

  // 监听语言变更事件
  i18nInstance.on('languageChanged', handleLanguageChange)

  // 组件卸载时清理监听器
  onUnmounted(() => {
    i18nInstance.off('languageChanged', handleLanguageChange)
  })

  // 切换语言的方法
  const changeLanguage = async (newLocale: string) => {
    await i18nInstance.changeLanguage(newLocale)
  }

  // 检查翻译键是否存在
  const exists = (key: string, targetLocale?: string) => {
    return i18nInstance.exists(key, targetLocale)
  }

  // 获取所有翻译键
  const getKeys = (targetLocale?: string) => {
    return i18nInstance.getKeys(targetLocale)
  }

  return {
    t: i18nInstance.t,
    locale,
    availableLanguages,
    changeLanguage,
    exists,
    getKeys,
    i18n: i18nInstance
  }
}

/**
 * 获取当前语言的组合式 API
 * @returns 当前语言的响应式引用
 */
export function useLocale() {
  const { locale } = useI18n()
  return locale
}

/**
 * 获取可用语言列表的组合式 API
 * @returns 可用语言列表的计算属性
 */
export function useAvailableLanguages() {
  const { availableLanguages } = useI18n()
  return availableLanguages
}

/**
 * 语言切换的组合式 API
 * @returns 语言切换相关的状态和方法
 */
export function useLanguageSwitcher() {
  const { locale, availableLanguages, changeLanguage } = useI18n()
  
  // 切换状态
  const isChanging = ref(false)
  
  // 切换语言的包装方法
  const switchLanguage = async (newLocale: string) => {
    if (isChanging.value || locale.value === newLocale) {
      return
    }
    
    try {
      isChanging.value = true
      await changeLanguage(newLocale)
    } finally {
      isChanging.value = false
    }
  }
  
  return {
    locale,
    availableLanguages,
    isChanging,
    switchLanguage
  }
}

/**
 * 翻译函数的组合式 API
 * @returns 翻译函数
 */
export function useTranslation() {
  const { t } = useI18n()
  return t
}

/**
 * 批量翻译的组合式 API
 * @param keys 翻译键数组
 * @returns 翻译结果的计算属性
 */
export function useBatchTranslation(keys: string[]) {
  const { t, locale } = useI18n()
  
  return computed(() => {
    const result: Record<string, string> = {}
    for (const key of keys) {
      result[key] = t(key)
    }
    return result
  })
}

/**
 * 条件翻译的组合式 API
 * @param condition 条件函数或响应式引用
 * @param trueKey 条件为真时的翻译键
 * @param falseKey 条件为假时的翻译键
 * @returns 翻译结果的计算属性
 */
export function useConditionalTranslation(
  condition: (() => boolean) | { value: boolean },
  trueKey: string,
  falseKey: string
) {
  const { t, locale } = useI18n()
  
  return computed(() => {
    const isTrue = typeof condition === 'function' ? condition() : condition.value
    return t(isTrue ? trueKey : falseKey)
  })
}
