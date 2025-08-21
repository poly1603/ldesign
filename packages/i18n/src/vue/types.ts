import type { App, ComputedRef, Ref } from 'vue'

import type {
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  TranslationFunction,
  TranslationOptions,
  TranslationParams,
} from '../core/types'

// Vue 类型已从 'vue' 导入，移除重复定义

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
  changeLanguage: (_locale: string) => Promise<void>
  /** 检查翻译键是否存在 */
  exists: (_key: string, _locale?: string) => boolean
  /** 获取所有翻译键 */
  getKeys: (_locale?: string) => string[]
  /** I18n 实例 */
  i18n: I18nInstance
}

/**
 * 翻译选项
 */
export interface UseTranslationOptions {
  /** 默认值 */
  defaultValue?: string
  /** 是否立即执行 */
  immediate?: boolean
  /** 错误处理 */
  onError?: (error: Error) => void
  /** 成功回调 */
  onSuccess?: (result: string) => void
}

/**
 * 异步翻译返回类型
 */
export interface UseAsyncTranslationReturn {
  /** 翻译结果 */
  data: Ref<string | null>
  /** 加载状态 */
  loading: Ref<boolean>
  /** 错误状态 */
  error: Ref<Error | null>
  /** 执行翻译 */
  execute: (key: string, params?: TranslationParams) => Promise<void>
  /** 重置状态 */
  reset: () => void
}

/**
 * 格式化翻译返回类型
 */
export interface UseFormattedTranslationReturn {
  /** 格式化的翻译结果 */
  formatted: ComputedRef<string>
  /** 原始翻译结果 */
  raw: ComputedRef<string>
  /** 更新参数 */
  updateParams: (newParams: TranslationParams) => void
}

/**
 * 翻译验证返回类型
 */
export interface UseTranslationValidationReturn {
  /** 是否有效 */
  isValid: ComputedRef<boolean>
  /** 验证错误 */
  errors: ComputedRef<string[]>
  /** 缺失的键 */
  missingKeys: ComputedRef<string[]>
  /** 验证翻译键 */
  validate: (keys: string | string[]) => void
}

/**
 * 翻译缓存返回类型
 */
export interface UseTranslationCacheReturn {
  /** 缓存的翻译 */
  cached: ComputedRef<Record<string, string>>
  /** 缓存统计 */
  stats: ComputedRef<{ hits: number, misses: number, size: number }>
  /** 清除缓存 */
  clear: () => void
  /** 预加载翻译 */
  preload: (keys: string[]) => Promise<void>
}

/**
 * 翻译历史返回类型
 */
export interface UseTranslationHistoryReturn {
  /** 翻译历史 */
  history: ComputedRef<Array<{ key: string, result: string, timestamp: number }>>
  /** 添加到历史 */
  addToHistory: (key: string, result: string) => void
  /** 清除历史 */
  clearHistory: () => void
  /** 获取最近的翻译 */
  getRecent: (count?: number) => Array<{ key: string, result: string, timestamp: number }>
}

/**
 * Vue I18n 插件上下文
 */
export interface VueI18nPluginContext {
  /** Vue 应用实例 */
  readonly app: App
  /** I18n 实例 */
  readonly i18n: I18nInstance
  /** 插件选项 */
  readonly options: VueI18nOptions
}

/**
 * Vue I18n 插件接口（统一架构）
 */
export interface VueI18nPluginInterface {
  /** 插件名称 */
  readonly name: string
  /** 插件版本 */
  readonly version?: string
  /** 插件描述 */
  readonly description?: string
  /** 插件作者 */
  readonly author?: string
  /** 依赖插件 */
  readonly dependencies?: readonly string[]
  /** 对等依赖 */
  readonly peerDependencies?: readonly string[]
  /** 可选依赖 */
  readonly optionalDependencies?: readonly string[]

  /** 安装插件 */
  install: (context: VueI18nPluginContext) => void | Promise<void>
  /** 卸载插件 */
  uninstall?: (context: VueI18nPluginContext) => void | Promise<void>

  /** 生命周期钩子 */
  beforeInstall?: (context: VueI18nPluginContext) => void | Promise<void>
  afterInstall?: (context: VueI18nPluginContext) => void | Promise<void>
  beforeUninstall?: (context: VueI18nPluginContext) => void | Promise<void>
  afterUninstall?: (context: VueI18nPluginContext) => void | Promise<void>

  /** 插件配置 */
  readonly config?: Record<string, any>
}

/**
 * Vue I18n 插件实例（兼容旧版本）
 */
export interface VueI18nPlugin {
  /** I18n 实例 */
  global: I18nInstance
  /** 安装插件 */
  install: (_app: App, _options?: VueI18nOptions) => void | Promise<void>
  /** 插件管理器 */
  plugins?: VueI18nPluginManager
}

/**
 * Vue I18n 插件管理器
 */
export interface VueI18nPluginManager {
  /** 设置上下文 */
  setContext: (app: App, i18n: I18nInstance, options: VueI18nOptions) => void
  /** 注册插件 */
  register: (plugin: VueI18nPluginInterface) => Promise<void>
  /** 卸载插件 */
  unregister: (name: string) => Promise<void>
  /** 获取插件 */
  get: (name: string) => VueI18nPluginInterface | undefined
  /** 获取所有插件 */
  getAll: () => VueI18nPluginInterface[]
  /** 检查插件是否已注册 */
  isRegistered: (name: string) => boolean
  /** 检查依赖 */
  checkDependencies: (plugin: VueI18nPluginInterface) => {
    satisfied: boolean
    missing: string[]
    conflicts: string[]
  }
  /** 清理所有插件 */
  clear: () => Promise<void>
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
// Vue模块扩展暂时注释掉，避免模块解析问题
// declare module 'vue' {
//   interface ComponentCustomProperties extends I18nContext { }
//
//   interface GlobalProperties extends I18nContext { }
// }

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
