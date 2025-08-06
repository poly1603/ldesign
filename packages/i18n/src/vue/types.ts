import type { App, ComputedRef, Ref } from 'vue'
import type {
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  TranslationFunction,
  TranslationOptions,
  TranslationParams,
} from '../core/types'

/**
 * Vue I18n 插件选项
 */
export interface VueI18nOptions extends I18nOptions {
  /** 是否注入全局属性 $t */
  globalInjection?: boolean
  /** 全局属性名称 */
  globalPropertyName?: string
}

/**
 * Vue I18n 组合式 API 返回类型
 */
export interface UseI18nReturn {
  /** 翻译函数 */
  t: TranslationFunction
  /** 当前语言（响应式） */
  locale: Ref<string>
  /** 可用语言列表（响应式） */
  availableLanguages: ComputedRef<LanguageInfo[]>
  /** 切换语言 */
  changeLanguage: (locale: string) => Promise<void>
  /** 检查翻译键是否存在 */
  exists: (key: string, locale?: string) => boolean
  /** 获取所有翻译键 */
  getKeys: (locale?: string) => string[]
  /** I18n 实例 */
  i18n: I18nInstance
}

/**
 * Vue I18n 插件实例
 */
export interface VueI18nPlugin {
  /** I18n 实例 */
  global: I18nInstance
  /** 安装插件 */
  install: (app: App, options?: VueI18nOptions) => void
}

/**
 * Vue 组件中的 I18n 上下文
 */
export interface I18nContext {
  /** 翻译函数 */
  $t: TranslationFunction
  /** I18n 实例 */
  $i18n: I18nInstance
}

/**
 * Vue 应用扩展
 */
declare module 'vue' {
  interface ComponentCustomProperties extends I18nContext { }

  interface GlobalProperties extends I18nContext { }
}

/**
 * Vue I18n 指令选项
 */
export interface I18nDirectiveOptions {
  /** 翻译键 */
  key: string
  /** 插值参数 */
  params?: TranslationParams
  /** 翻译选项 */
  options?: TranslationOptions
}

/**
 * Vue I18n 指令绑定值
 */
export type I18nDirectiveBinding = string | I18nDirectiveOptions
