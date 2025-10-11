/**
 * Vue I18n 类型定义
 */

import type { ComputedRef, InjectionKey } from 'vue'
import type { I18n } from '../core/i18n'

/**
 * I18n 注入键类型
 */
export type I18nInjectionKey = I18n

/**
 * I18n 注入键
 */
export const I18N_INJECTION_KEY: InjectionKey<I18nInjectionKey> = Symbol('i18n')

/**
 * Vue I18n 实例接口
 */
export interface VueI18n {
  /** 核心 I18n 实例（用于高级用法） */
  global: any
  /** 当前语言 */
  locale: ComputedRef<string>
  /** 可用语言列表 */
  availableLocales: ComputedRef<string[]>
  /** 翻译函数 */
  t: (key: string, params?: Record<string, unknown>) => string
  /** 键存在检查函数 */
  te: (key: string, locale?: string) => boolean
  /** 设置语言（别名） */
  setLocale: (locale: string) => Promise<void>
  /** 设置语言包 */
  setLocaleMessage: (locale: string, message: Record<string, unknown>) => void
  /** 获取语言包 */
  getLocaleMessage: (locale: string) => Record<string, unknown>
  /** 获取当前语言 */
  getCurrentLanguage: () => string
  /** 获取可用语言 */
  getAvailableLanguages: () => string[]
  /** 切换语言（与 setLocale 等效） */
  changeLanguage?: (locale: string) => Promise<void>
  /** 检查键是否存在（别名） */
  exists?: (key: string, locale?: string) => boolean
}

/**
 * I18n 插件选项
 */
export interface I18nPluginOptions {
  /** 默认语言 */
  locale: string
  /** 降级语言 */
  fallbackLocale?: string
  /** 语言包 */
  messages?: Record<string, Record<string, unknown>>
  /** 存储类型 */
  storage?: 'localStorage' | 'sessionStorage' | 'memory' | 'none'
  /** 存储键名 */
  storageKey?: string
  /** 是否自动检测语言 */
  autoDetect?: boolean
  /** 预加载的语言列表 */
  preload?: string[]
  /** 缓存配置 */
  cache?: {
    enabled: boolean
    maxSize: number
    maxMemory: number
    defaultTTL: number
    enableTTL: boolean
    cleanupInterval: number
    memoryPressureThreshold: number
  }
  /** 语言变化回调 */
  onLanguageChanged?: (locale: string) => void
  /** 加载错误回调 */
  onLoadError?: (error: Error) => void
}

/**
 * Engine 插件选项
 */
export interface I18nEnginePluginOptions extends I18nPluginOptions {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 预设配置 */
  preset?: I18nPreset
  /** 是否启用开发工具 */
  devtools?: boolean
  /** 是否启用性能监控 */
  performance?: boolean
  /** 错误处理配置 */
  errorHandling?: {
    enableGlobalHandler?: boolean
    enableReporting?: boolean
    reportEndpoint?: string
  }
  /** 功能模块开关 */
  features?: {
    /** 是否安装内置组件，默认 true */
    components?: boolean
    /** 是否安装内置指令，默认 true */
    directives?: boolean
  }
  /** 仅启用的语言列表（白名单） */
  enabledLanguages?: string[]
  /** 禁用的语言列表（黑名单） */
  disabledLanguages?: string[]
  /** 是否使用内置翻译 */
  useBuiltIn?: boolean
  /** 是否优先使用内置翻译 */
  preferBuiltIn?: boolean
  /** 是否回退到内置翻译 */
  fallbackToBuiltIn?: boolean
  /** 内置翻译命名空间 */
  builtInNamespace?: string
  /** 合并选项 */
  mergeOptions?: any
}

/**
 * I18n 预设类型
 */
export type I18nPreset =
  | 'spa' // 单页应用
  | 'mpa' // 多页应用
  | 'mobile' // 移动端应用
  | 'desktop' // 桌面应用
  | 'admin' // 管理后台
  | 'blog' // 博客网站
  | 'ecommerce' // 电商网站

/**
 * 组合式 API 返回类型
 */
export interface UseI18nReturn {
  /** 当前语言（响应式） */
  locale: import('vue').ComputedRef<string>
  /** 可用语言列表（响应式） */
  availableLocales: import('vue').ComputedRef<string[]>
  /** 翻译函数 */
  t: (key: string, params?: Record<string, unknown>) => string
  /** 键存在检查函数 */
  te: (key: string, locale?: string) => boolean
  /** 设置语言 */
  setLocale: (locale: string) => Promise<void>
  /** 设置语言包 */
  setLocaleMessage: (locale: string, message: Record<string, unknown>) => void
  /** 获取语言包 */
  getLocaleMessage: (locale: string) => Record<string, unknown>
}

/**
 * 指令绑定值类型
 */
export type DirectiveBinding =
  | string
  | {
    key: string
    params?: Record<string, unknown>
    locale?: string
  }

/**
 * 语言信息接口
 */
export interface LanguageInfo {
  /** 语言代码 */
  code: string
  /** 显示名称 */
  name: string
  /** 国旗 emoji */
  flag: string
  /** 本地化名称 */
  nativeName?: string
  /** 是否为 RTL 语言 */
  rtl?: boolean
}

/**
 * 翻译上下文接口
 */
export interface TranslationContext {
  /** 命名空间 */
  namespace?: string
  /** 作用域翻译函数 */
  scopedT?: (key: string, params?: Record<string, unknown>) => string
  /** 作用域键存在检查函数 */
  scopedTe?: (key: string, locale?: string) => boolean
}

/**
 * 插件状态接口
 */
export interface I18nPluginState {
  /** I18n 实例 */
  i18n: I18n | null
  /** 是否已安装 */
  installed: boolean
  /** 插件选项 */
  options: I18nPluginOptions | null
}

/**
 * Vue 全局属性扩展
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    /** I18n 实例 */
    $i18n: VueI18n
    /** 翻译函数 */
    $t: (key: string, params?: Record<string, unknown>) => string
    /** 键存在检查函数 */
    $te: (key: string, locale?: string) => boolean
  }
}

/**
 * 导出所有类型
 */
export type {
  I18n,
} from '../core/i18n'
