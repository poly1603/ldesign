/**
 * i18n Composable
 * 
 * 提供简单优雅的多语言功能
 */

import { inject, computed, ref, triggerRef } from 'vue'
import type { I18n } from '@ldesign/i18n'
import { SUPPORTED_LOCALES, type SupportedLocale } from '../config/i18n.config'

// 全局共享的 locale ref
let globalLocale: any = null

/**
 * 使用 i18n
 * 
 * @example
 * ```vue
 * <script setup>
 * const { t, locale, changeLocale } = useI18n()
 * </script>
 * 
 * <template>
 *   <div>{{ t('common.welcome') }}</div>
 *   <select @change="changeLocale($event.target.value)">
 *     <option value="zh-CN">中文</option>
 *     <option value="en-US">English</option>
 *   </select>
 * </template>
 * ```
 */
export function useI18n() {
  // 注入 i18n 实例
  const i18n = inject<I18n>('i18n')
  
  if (!i18n) {
    throw new Error('i18n is not installed. Please make sure to install i18n plugin.')
  }

  // 全局共享的 locale ref，所有组件共用
  if (!globalLocale) {
    globalLocale = ref(i18n.locale || 'zh-CN')
  }
  
  const locale = computed({
    get: () => globalLocale.value,
    set: (value: string) => {
      globalLocale.value = value
      i18n.locale = value
    }
  })

  // 翻译函数 - 需要响应式地返回翻译结果
  const t = (key: string, params?: Record<string, any>) => {
    // 使用 locale.value 触发响应式依赖
    const _ = locale.value
    return i18n.t(key, params)
  }

  // 批量翻译
  const tm = (key: string) => {
    return i18n.tm(key)
  }

  // 复数翻译
  const tc = (key: string, count: number, params?: Record<string, any>) => {
    return i18n.tc(key, count, params)
  }

  // 日期格式化
  const d = (date: Date | number | string, format?: string) => {
    return i18n.d(date, format)
  }

  // 数字格式化
  const n = (number: number, format?: string) => {
    return i18n.n(number, format)
  }

  // 切换语言
  const changeLocale = async (newLocale: SupportedLocale) => {
    if (newLocale === locale.value) return
    
    try {
      // 直接切换语言，i18n 内部会处理加载
      await i18n.changeLanguage(newLocale)
      // 更新全局的 locale ref，触发所有组件重新渲染
      globalLocale.value = newLocale
      console.log(`Language changed to: ${newLocale}`)
    } catch (error) {
      console.error(`Failed to change locale to ${newLocale}:`, error)
    }
  }

  // 检查是否支持某语言
  const isLocaleSupported = (locale: string): locale is SupportedLocale => {
    return locale in SUPPORTED_LOCALES
  }

  // 获取所有支持的语言
  const availableLocales = computed(() => {
    return Object.keys(SUPPORTED_LOCALES) as SupportedLocale[]
  })

  // 获取语言显示名称
  const getLocaleName = (locale: SupportedLocale) => {
    return SUPPORTED_LOCALES[locale]
  }

  return {
    // 核心功能
    t,
    tm,
    tc,
    d,
    n,
    
    // 语言管理
    locale,
    changeLocale,
    isLocaleSupported,
    availableLocales,
    getLocaleName,
    
    // 原始 i18n 实例（高级用法）
    i18n,
  }
}

/**
 * 用于语言切换器组件
 */
export function useLocaleSelector() {
  const { locale, availableLocales, getLocaleName, changeLocale } = useI18n()
  
  const localeOptions = computed(() => {
    return availableLocales.value.map(locale => ({
      value: locale,
      label: getLocaleName(locale),
    }))
  })

  return {
    currentLocale: locale,
    localeOptions,
    changeLocale,
  }
}