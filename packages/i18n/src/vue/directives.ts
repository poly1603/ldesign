/**
 * Vue I18n 指令
 * 提供便捷的指令式国际化功能
 */

import type { Directive, DirectiveBinding } from 'vue'
import { I18nInjectionKey } from './plugin'

/**
 * v-t 指令的绑定值类型
 */
interface VTBinding {
  /** 翻译键 */
  key: string
  /** 翻译参数 */
  params?: Record<string, unknown>
  /** 指定语言 */
  locale?: string
}

/**
 * v-t 指令 - 用于元素文本的翻译
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <p v-t="'hello'"></p>
 *   
 *   <!-- 带参数 -->
 *   <p v-t="{ key: 'welcome', params: { name: 'John' } }"></p>
 *   
 *   <!-- 指定语言 -->
 *   <p v-t="{ key: 'hello', locale: 'en' }"></p>
 *   
 *   <!-- 修饰符用法 -->
 *   <p v-t.preserve="'hello'"></p> <!-- 保留原有内容 -->
 * </template>
 * ```
 */
export const vT: Directive<HTMLElement, string | VTBinding> = {
  mounted(el, binding, vnode) {
    updateElement(el, binding, vnode)
  },

  updated(el, binding, vnode) {
    updateElement(el, binding, vnode)
  }
}

/**
 * 更新元素内容
 */
function updateElement(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>, vnode: any) {
  // 获取 I18n 实例
  const i18n = vnode.appContext?.provides?.[I18nInjectionKey as any]

  if (!i18n) {
    console.warn('v-t 指令需要在安装了 I18n 插件的 Vue 应用中使用')
    return
  }

  // 解析绑定值
  let key: string
  let params: Record<string, unknown> | undefined
  let locale: string | undefined

  if (typeof binding.value === 'string') {
    key = binding.value
  } else if (binding.value && typeof binding.value === 'object') {
    key = binding.value.key
    params = binding.value.params
    locale = binding.value.locale
  } else {
    console.warn('v-t 指令的值必须是字符串或对象')
    return
  }

  // 执行翻译
  try {
    const translatedText = i18n.t(key, params)

    // 检查是否有 preserve 修饰符
    if (binding.modifiers.preserve) {
      // 保留原有内容，只替换特定部分
      const originalContent = el.getAttribute('data-original-content') || el.textContent
      if (!el.getAttribute('data-original-content')) {
        el.setAttribute('data-original-content', originalContent || '')
      }
      el.textContent = translatedText
    } else {
      // 直接替换内容
      el.textContent = translatedText
    }
  } catch (error) {
    console.warn('翻译失败:', error)
  }
}

/**
 * v-t-html 指令 - 用于元素 HTML 内容的翻译
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- HTML 内容翻译 -->
 *   <div v-t-html="'rich_content'"></div>
 *   
 *   <!-- 带参数的 HTML 翻译 -->
 *   <div v-t-html="{ key: 'rich_welcome', params: { name: 'John' } }"></div>
 * </template>
 * ```
 */
export const vTHtml: Directive<HTMLElement, string | VTBinding> = {
  mounted(el, binding, vnode) {
    updateElementHtml(el, binding, vnode)
  },

  updated(el, binding, vnode) {
    updateElementHtml(el, binding, vnode)
  }
}

/**
 * 更新元素 HTML 内容
 */
function updateElementHtml(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>, vnode: any) {
  // 获取 I18n 实例
  const i18n = vnode.appContext?.provides?.[I18nInjectionKey as any]

  if (!i18n) {
    console.warn('v-t-html 指令需要在安装了 I18n 插件的 Vue 应用中使用')
    return
  }

  // 解析绑定值
  let key: string
  let params: Record<string, unknown> | undefined

  if (typeof binding.value === 'string') {
    key = binding.value
  } else if (binding.value && typeof binding.value === 'object') {
    key = binding.value.key
    params = binding.value.params
  } else {
    console.warn('v-t-html 指令的值必须是字符串或对象')
    return
  }

  // 执行翻译
  try {
    const translatedHtml = i18n.t(key, params)
    el.innerHTML = translatedHtml
  } catch (error) {
    console.warn('HTML 翻译失败:', error)
  }
}

/**
 * v-t-title 指令 - 用于元素 title 属性的翻译
 * 
 * @example
 * ```vue
 * <template>
 *   <!-- title 属性翻译 -->
 *   <button v-t-title="'button_tooltip'">按钮</button>
 *   
 *   <!-- 带参数的 title 翻译 -->
 *   <img v-t-title="{ key: 'image_alt', params: { name: 'logo' } }" />
 * </template>
 * ```
 */
export const vTTitle: Directive<HTMLElement, string | VTBinding> = {
  mounted(el, binding, vnode) {
    updateElementTitle(el, binding, vnode)
  },

  updated(el, binding, vnode) {
    updateElementTitle(el, binding, vnode)
  }
}

/**
 * 更新元素 title 属性
 */
function updateElementTitle(el: HTMLElement, binding: DirectiveBinding<string | VTBinding>, vnode: any) {
  // 获取 I18n 实例
  const i18n = vnode.appContext?.provides?.[I18nInjectionKey as any]

  if (!i18n) {
    console.warn('v-t-title 指令需要在安装了 I18n 插件的 Vue 应用中使用')
    return
  }

  // 解析绑定值
  let key: string
  let params: Record<string, unknown> | undefined

  if (typeof binding.value === 'string') {
    key = binding.value
  } else if (binding.value && typeof binding.value === 'object') {
    key = binding.value.key
    params = binding.value.params
  } else {
    console.warn('v-t-title 指令的值必须是字符串或对象')
    return
  }

  // 执行翻译
  try {
    const translatedTitle = i18n.t(key, params)
    el.setAttribute('title', translatedTitle)
  } catch (error) {
    console.warn('title 翻译失败:', error)
  }
}

/**
 * v-t-plural 指令的绑定值类型
 */
interface VTPluralBinding {
  /** 翻译键 */
  key: string
  /** 数量值 */
  count: number
  /** 翻译参数 */
  params?: Record<string, unknown>
  /** 指定语言 */
  locale?: string
}

/**
 * v-t-plural 指令 - 用于复数化翻译
 *
 * @example
 * ```vue
 * <template>
 *   <!-- 基础用法 -->
 *   <p v-t-plural="{ key: 'item', count: 5 }"></p>
 *
 *   <!-- 带参数 -->
 *   <p v-t-plural="{ key: 'user.message', count: 3, params: { name: 'John' } }"></p>
 *
 *   <!-- 指定语言 -->
 *   <p v-t-plural="{ key: 'item', count: 1, locale: 'en' }"></p>
 * </template>
 * ```
 */
export const vTPlural: Directive<HTMLElement, VTPluralBinding> = {
  mounted(el, binding, vnode) {
    updateElementPlural(el, binding, vnode)
  },

  updated(el, binding, vnode) {
    updateElementPlural(el, binding, vnode)
  }
}

/**
 * 更新元素复数化内容
 */
function updateElementPlural(el: HTMLElement, binding: DirectiveBinding<VTPluralBinding>, vnode: any) {
  // 获取 I18n 实例
  const i18n = vnode.appContext?.provides?.[I18nInjectionKey as any]

  if (!i18n) {
    console.warn('v-t-plural 指令需要在安装了 I18n 插件的 Vue 应用中使用')
    return
  }

  // 解析绑定值
  const { key, count, params, locale } = binding.value

  if (!key || typeof count !== 'number') {
    console.warn('v-t-plural 指令需要提供 key 和 count 属性')
    return
  }

  // 执行复数化翻译
  try {
    const translatedText = translatePlural(i18n, key, count, params, locale)
    el.textContent = translatedText
  } catch (error) {
    console.warn('复数化翻译失败:', error)
  }
}

/**
 * 复数化翻译函数
 */
function translatePlural(
  i18n: any,
  key: string,
  count: number,
  params?: Record<string, unknown>,
  locale?: string
): string {
  const currentLocale = locale || i18n.getCurrentLanguage()

  // 获取复数规则
  const getPluralRule = (count: number, locale: string): string => {
    try {
      const pluralRules = new Intl.PluralRules(locale)
      return pluralRules.select(count)
    } catch (error) {
      // 默认英语规则
      if (count === 0) return 'zero'
      if (count === 1) return 'one'
      if (count === 2) return 'two'
      return 'other'
    }
  }

  const rule = getPluralRule(count, currentLocale)

  // 构建参数对象
  const translationParams = {
    ...params,
    count
  }

  // 尝试复数化键名
  const pluralKeys = [
    `${key}.${rule}`,
    `${key}.other`,
    key
  ]

  for (const pluralKey of pluralKeys) {
    if (i18n.te(pluralKey)) {
      const text = i18n.t(pluralKey, translationParams)

      // 如果是基础键名，可能包含管道分隔的复数形式
      if (pluralKey === key && text.includes('|')) {
        return processPipeDelimitedPlural(text, count)
      }

      return text
    }
  }

  // 降级处理
  return `${key} (${count})`
}

/**
 * 处理管道分隔的复数形式
 */
function processPipeDelimitedPlural(text: string, count: number): string {
  const parts = text.split('|').map(part => part.trim())

  if (parts.length === 1) {
    return text
  }

  // 简单的二元复数形式 "item | items"
  if (parts.length === 2) {
    return count === 1 ? parts[0] : parts[1]
  }

  // 复杂的多元复数形式 "no items | one item | {count} items"
  if (parts.length >= 3) {
    if (count === 0 && parts[0]) return parts[0]
    if (count === 1 && parts[1]) return parts[1]
    return parts[2] || parts[parts.length - 1]
  }

  return text
}

/**
 * 安装所有指令到 Vue 应用
 *
 * @param app Vue 应用实例
 */
export function installDirectives(app: any) {
  app.directive('t', vT)
  app.directive('t-html', vTHtml)
  app.directive('t-title', vTTitle)
  app.directive('t-plural', vTPlural)
}

/**
 * 所有指令的映射
 */
export const directives = {
  vT,
  vTHtml,
  vTTitle,
  vTPlural
} as const

/**
 * 默认导出所有指令
 */
export default {
  vT,
  vTHtml,
  vTTitle,
  vTPlural,
  installDirectives,
  directives
}
