/**
 * Vue 3 I18n 指令系统
 *
 * 提供功能完整的 v-t 指令，支持：
 * - 基础翻译
 * - 插值翻译
 * - 复数处理
 * - 条件渲染
 * - HTML 渲染
 * - 动态更新
 * - 错误处理
 * - 性能优化
 */

import type { Directive, DirectiveBinding } from 'vue'
import type { I18nInstance, TranslationParams } from '../core/types'
import type { EnhancedI18nInstance } from '../types/enhanced'

/**
 * 指令绑定值类型
 */
export interface VTDirectiveValue {
  /** 翻译键 */
  key: string
  /** 翻译参数 */
  params?: TranslationParams
  /** 翻译选项 */
  options?: {
    /** 是否转义HTML */
    escapeValue?: boolean
    /** 是否渲染为HTML */
    html?: boolean
    /** 默认值 */
    defaultValue?: string
    /** 目标语言 */
    locale?: string
  }
  /** 条件渲染 */
  condition?: boolean | (() => boolean)
  /** 复数计数 */
  count?: number
  /** 元素属性（用于设置属性而非文本内容） */
  attr?: string
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 指令元素数据
 */
interface DirectiveElementData {
  /** 原始显示状态 */
  originalDisplay?: string
  /** 原始可见性 */
  originalVisibility?: string
  /** 是否已隐藏 */
  isHidden?: boolean
  /** 最后的翻译结果 */
  lastTranslation?: string
  /** 绑定的I18n实例 */
  i18nInstance?: I18nInstance | EnhancedI18nInstance<any>
  /** 语言变更监听器 */
  languageChangeListener?: (...args: unknown[]) => void
}

/**
 * 元素数据映射
 */
const elementDataMap = new WeakMap<HTMLElement, DirectiveElementData>()

/**
 * 解析指令值
 */
function parseDirectiveValue(value: string | VTDirectiveValue): VTDirectiveValue {
  if (typeof value === 'string') {
    return { key: value }
  }
  return value
}

/**
 * 检查条件是否满足
 */
function checkCondition(condition?: boolean | (() => boolean)): boolean {
  if (condition === undefined)
    return true
  if (typeof condition === 'boolean')
    return condition
  if (typeof condition === 'function')
    return condition()
  return true
}

/**
 * 获取翻译文本
 */
function getTranslation(
  i18n: I18nInstance | EnhancedI18nInstance<any>,
  directiveValue: VTDirectiveValue,
): string {
  const { key, params, options, count } = directiveValue

  try {
    // 处理复数
    if (count !== undefined) {
      const pluralParams = { ...params, count }
      return (i18n.t as any)(key, pluralParams, options)
    }

    return (i18n.t as any)(key, params, options)
  }
  catch (error) {
    console.error(`[v-t] Translation error for key "${key}":`, error)
    return options?.defaultValue || key
  }
}

/**
 * 更新元素内容
 */
function updateElement(
  el: HTMLElement,
  binding: DirectiveBinding<any>,
  i18n: I18nInstance | EnhancedI18nInstance<any>,
): void {
  const directiveValue = parseDirectiveValue(binding.value)
  const elementData = elementDataMap.get(el) || {}

  // 检查条件
  if (!checkCondition(directiveValue.condition)) {
    hideElement(el, elementData)
    return
  }

  // 显示元素（如果之前被隐藏）
  showElement(el, elementData)

  // 获取翻译
  const translation = getTranslation(i18n, directiveValue)

  // 避免不必要的更新
  if (elementData.lastTranslation === translation) {
    return
  }

  elementData.lastTranslation = translation

  // 调试模式
  if (directiveValue.debug) {
    console.warn(`[v-t] Updating element with key "${directiveValue.key}":`, translation)
  }

  // 更新元素内容
  if (directiveValue.attr) {
    // 设置属性
    el.setAttribute(directiveValue.attr, translation)
  }
  else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
    // 设置表单元素的占位符
    (el as HTMLInputElement).placeholder = translation
  }
  else if (directiveValue.options?.html) {
    // 渲染HTML内容
    el.innerHTML = translation
  }
  else {
    // 设置文本内容
    el.textContent = translation
  }

  // 更新元素数据
  elementDataMap.set(el, elementData)
}

/**
 * 隐藏元素
 */
function hideElement(el: HTMLElement, elementData: DirectiveElementData): void {
  if (elementData.isHidden)
    return

  // 保存原始状态
  elementData.originalDisplay = el.style.display
  elementData.originalVisibility = el.style.visibility

  // 隐藏元素
  el.style.display = 'none'
  elementData.isHidden = true

  elementDataMap.set(el, elementData)
}

/**
 * 显示元素
 */
function showElement(el: HTMLElement, elementData: DirectiveElementData): void {
  if (!elementData.isHidden)
    return

  // 恢复原始状态
  el.style.display = elementData.originalDisplay || ''
  el.style.visibility = elementData.originalVisibility || ''
  elementData.isHidden = false

  elementDataMap.set(el, elementData)
}

/**
 * 设置语言变更监听器
 */
function setupLanguageListener(
  el: HTMLElement,
  binding: DirectiveBinding<any>,
  i18n: I18nInstance | EnhancedI18nInstance<any>,
): void {
  const elementData = elementDataMap.get(el) || {}

  // 移除旧的监听器
  if (elementData.languageChangeListener) {
    i18n.off('languageChanged', elementData.languageChangeListener)
  }

  // 创建新的监听器
  const listener = () => {
    updateElement(el, binding, i18n)
  }

  // 添加监听器
  i18n.on('languageChanged', listener)

  // 保存监听器引用
  elementData.languageChangeListener = listener
  elementData.i18nInstance = i18n
  elementDataMap.set(el, elementData)
}

/**
 * 清理元素数据
 */
function cleanupElement(el: HTMLElement): void {
  const elementData = elementDataMap.get(el)
  if (!elementData)
    return

  // 移除语言变更监听器
  if (elementData.languageChangeListener && elementData.i18nInstance) {
    elementData.i18nInstance.off('languageChanged', elementData.languageChangeListener)
  }

  // 清理元素数据
  elementDataMap.delete(el)
}

/**
 * 创建 v-t 指令
 */
export function createVTDirective(i18n: I18nInstance | EnhancedI18nInstance<any>): Directive<HTMLElement, string | VTDirectiveValue> {
  return {
    mounted(el, binding) {
      setupLanguageListener(el, binding, i18n)
      updateElement(el, binding, i18n)
    },

    updated(el, binding) {
      updateElement(el, binding, i18n)
    },

    unmounted(el) {
      cleanupElement(el)
    },
  }
}

/**
 * 默认的 v-t 指令（需要从注入中获取 i18n 实例）
 */
export const vT: Directive<HTMLElement, string | VTDirectiveValue> = {
  mounted(el, binding, vnode) {
    // 从组件实例中获取 i18n
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n) {
      console.error('[v-t] I18n instance not found. Make sure the I18n plugin is installed.')
      return
    }

    setupLanguageListener(el, binding, i18n)
    updateElement(el, binding, i18n)
  },

  updated(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n)
      return

    updateElement(el, binding, i18n)
  },

  unmounted(el) {
    cleanupElement(el)
  },
}

/**
 * v-t-html 指令 - 专门用于HTML内容翻译
 */
export const vTHtml: Directive<HTMLElement, string | VTDirectiveValue> = {
  mounted(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n) {
      console.error('[v-t-html] I18n instance not found.')
      return
    }

    const directiveValue = parseDirectiveValue(binding.value)
    directiveValue.options = { ...directiveValue.options, html: true }

    const newBinding = { ...binding, value: directiveValue }
    setupLanguageListener(el, newBinding, i18n)
    updateElement(el, newBinding, i18n)
  },

  updated(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n)
      return

    const directiveValue = parseDirectiveValue(binding.value)
    directiveValue.options = { ...directiveValue.options, html: true }

    const newBinding = { ...binding, value: directiveValue }
    updateElement(el, newBinding, i18n)
  },

  unmounted(el) {
    cleanupElement(el)
  },
}

/**
 * v-t-attr 指令 - 用于翻译元素属性
 */
export const vTAttr: Directive<HTMLElement, { attr: string } & (string | VTDirectiveValue)> = {
  mounted(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n) {
      console.error('[v-t-attr] I18n instance not found.')
      return
    }

    const { attr, ...directiveValue } = binding.value as any
    const value = typeof directiveValue === 'string'
      ? { key: directiveValue, attr }
      : { ...directiveValue, attr }

    const newBinding = { ...binding, value }
    setupLanguageListener(el, newBinding, i18n)
    updateElement(el, newBinding, i18n)
  },

  updated(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n)
      return

    const { attr, ...directiveValue } = binding.value as any
    const value = typeof directiveValue === 'string'
      ? { key: directiveValue, attr }
      : { ...directiveValue, attr }

    const newBinding = { ...binding, value }
    updateElement(el, newBinding, i18n)
  },

  unmounted(el) {
    cleanupElement(el)
  },
}

/**
 * v-t-plural 指令 - 专门用于复数翻译
 */
export const vTPlural: Directive<HTMLElement, { count: number } & (string | VTDirectiveValue)> = {
  mounted(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n) {
      console.error('[v-t-plural] I18n instance not found.')
      return
    }

    const { count, ...directiveValue } = binding.value as any
    const value = typeof directiveValue === 'string'
      ? { key: directiveValue, count }
      : { ...directiveValue, count }

    const newBinding = { ...binding, value }
    setupLanguageListener(el, newBinding, i18n)
    updateElement(el, newBinding, i18n)
  },

  updated(el, binding, vnode) {
    const i18n = vnode.appContext?.app.config.globalProperties.$i18n
    if (!i18n)
      return

    const { count, ...directiveValue } = binding.value as any
    const value = typeof directiveValue === 'string'
      ? { key: directiveValue, count }
      : { ...directiveValue, count }

    const newBinding = { ...binding, value }
    updateElement(el, newBinding, i18n)
  },

  unmounted(el) {
    cleanupElement(el)
  },
}

/**
 * 指令修饰符处理
 */
export interface DirectiveModifiers {
  /** 渲染为HTML */
  html?: boolean
  /** 转义HTML */
  escape?: boolean
  /** 调试模式 */
  debug?: boolean
  /** 隐藏而非显示错误 */
  silent?: boolean
}

/**
 * 处理指令修饰符
 */
function handleModifiers(
  binding: DirectiveBinding<string | VTDirectiveValue>,
  modifiers: DirectiveModifiers,
): VTDirectiveValue {
  const directiveValue = parseDirectiveValue(binding.value)

  if (modifiers.html) {
    directiveValue.options = { ...directiveValue.options, html: true }
  }

  if (modifiers.escape) {
    directiveValue.options = { ...directiveValue.options, escapeValue: true }
  }

  if (modifiers.debug) {
    directiveValue.debug = true
  }

  return directiveValue
}

/**
 * 创建支持修饰符的指令
 */
export function createModifiableVTDirective(i18n: I18nInstance): Directive<HTMLElement, string | VTDirectiveValue> {
  return {
    mounted(el, binding) {
      const modifiedValue = handleModifiers(binding, binding.modifiers as DirectiveModifiers)
      setupLanguageListener(el, { ...binding, value: modifiedValue }, i18n)
      updateElement(el, { ...binding, value: modifiedValue }, i18n)
    },

    updated(el, binding) {
      const modifiedValue = handleModifiers(binding, binding.modifiers as DirectiveModifiers)
      updateElement(el, { ...binding, value: modifiedValue }, i18n)
    },

    unmounted(el) {
      cleanupElement(el)
    },
  }
}
