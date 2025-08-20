/**
 * 增强的 TypeScript 类型定义
 *
 * 提供：
 * - 类型安全的翻译键
 * - 智能参数推导
 * - 条件类型支持
 * - 模板字面量类型
 * - 高级工具类型
 */

import type { Ref } from 'vue'

/**
 * 字符串字面量工具类型
 */
export type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never

/**
 * 深度键路径提取
 */
export type DeepKeyPaths<T, K extends keyof T = keyof T> = K extends string | number
  ? T[K] extends Record<string, any>
  ? `${K}` | `${K}.${DeepKeyPaths<T[K]>}`
  : `${K}`
  : never

/**
 * 根据键路径获取值类型
 */
export type DeepKeyValue<T, P extends string> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
  ? DeepKeyValue<T[K], Rest>
  : never
  : P extends keyof T
  ? T[P]
  : never

/**
 * 提取翻译参数
 */
export type ExtractParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
  ? { [K in Param]: string | number } & ExtractParams<Rest>
  : Record<string, never>

/**
 * 翻译键约束
 */
export type TranslationKey<T = any> = T extends Record<string, any>
  ? DeepKeyPaths<T>
  : string

/**
 * 翻译参数约束
 */
export type TranslationParams<T extends string = string> = ExtractParams<T>

/**
 * 条件翻译类型
 */
export type ConditionalTranslation<
  TKey extends string,
  TParams extends Record<string, any> = Record<string, never>,
  TResult = string,
> = TParams extends Record<string, never>
  ? (key: TKey) => TResult
  : (key: TKey, params: TParams) => TResult

/**
 * 复数翻译类型
 */
export type PluralTranslation<TKey extends string> = (
  key: TKey,
  count: number,
  params?: Record<string, any>
) => string

/**
 * 异步翻译类型
 */
export type AsyncTranslation<TKey extends string, TParams = Record<string, any>> = (
  key: TKey,
  params?: TParams
) => Promise<string>

/**
 * 翻译函数重载
 */
export interface TranslationFunction<TMessages = any> {
  // 基础翻译
  <TKey extends TranslationKey<TMessages>>(key: TKey): string

  // 带参数翻译
  <TKey extends TranslationKey<TMessages>>(
    key: TKey,
    params: TranslationParams<TKey extends string ? TKey : string>
  ): string

  // 带选项翻译
  <TKey extends TranslationKey<TMessages>>(
    key: TKey,
    params: TranslationParams<TKey extends string ? TKey : string>,
    options: {
      defaultValue?: string
      count?: number
      context?: string
    }
  ): string
}

/**
 * 响应式翻译类型
 */
export interface ReactiveTranslationFunction<TMessages = any> {
  <TKey extends TranslationKey<TMessages>>(
    key: TKey | (() => TKey),
    params?: TranslationParams<TKey extends string ? TKey : string> | (() => TranslationParams<TKey extends string ? TKey : string>)
  ): {
    value: string
    isLoading: boolean
    error: Error | null
    refresh: () => Promise<void>
  }
}

/**
 * 批量翻译类型
 */
export interface BatchTranslationFunction<TMessages = any> {
  <TKeys extends TranslationKey<TMessages>[]>(
    keys: TKeys | (() => TKeys),
    params?: Record<string, any> | (() => Record<string, any>)
  ): {
    translations: Record<string, string>
    isLoading: boolean
    errors: Record<string, Error>
    refresh: () => Promise<void>
  }
}

/**
 * 语言切换器类型
 */
export interface LanguageSwitcher {
  currentLanguage: string
  availableLanguages: string[]
  isChanging: boolean
  switchLanguage: (locale: string) => Promise<void>
  addLanguage: (locale: string, messages: Record<string, any>) => void
  removeLanguage: (locale: string) => void
}

/**
 * 翻译验证器类型
 */
export interface TranslationValidator<TMessages = any> {
  validateKey: <TKey extends TranslationKey<TMessages>>(key: TKey) => boolean
  validateParams: <TKey extends TranslationKey<TMessages>>(
    key: TKey,
    params: TranslationParams<TKey extends string ? TKey : string>
  ) => boolean
  getRequiredParams: <TKey extends TranslationKey<TMessages>>(key: TKey) => string[]
  getMissingParams: <TKey extends TranslationKey<TMessages>>(
    key: TKey,
    params: Record<string, any>
  ) => string[]
}

/**
 * 性能监控类型
 */
export interface PerformanceMonitor {
  readonly metrics: {
    translationCount: number
    averageTime: number
    slowTranslations: Array<{
      key: string
      time: number
      timestamp: number
    }>
    cacheHitRate: number
    memoryUsage: number
  }
  start: () => void
  stop: () => void
  clear: () => void
  exportReport: () => string
}

/**
 * 调试器类型
 */
export interface Debugger {
  readonly isEnabled: boolean
  readonly messages: Array<{
    level: 'error' | 'warn' | 'info' | 'debug'
    message: string
    timestamp: number
    context?: any
  }>
  readonly coverage: {
    totalKeys: number
    usedKeys: Set<string>
    unusedKeys: Set<string>
    missingKeys: Set<string>
    coverageRate: number
  }
  enable: () => void
  disable: () => void
  clearMessages: () => void
  logError: (message: string, error?: Error, context?: any) => void
  logWarn: (message: string, context?: any) => void
  logInfo: (message: string, context?: any) => void
  logDebug: (message: string, context?: any) => void
}

/**
 * I18n 实例类型增强
 */
export interface EnhancedI18nInstance<TMessages = any> {
  // 基础翻译
  t: TranslationFunction<TMessages>

  // 响应式翻译
  rt: ReactiveTranslationFunction<TMessages>

  // 批量翻译
  bt: BatchTranslationFunction<TMessages>

  // 语言管理
  locale: string
  availableLanguages: string[]
  fallbackLocale: string

  // 语言操作
  changeLanguage: (locale: string) => Promise<void>
  loadLanguage: (locale: string) => Promise<void>
  addLanguage: (locale: string, messages: TMessages) => void
  removeLanguage: (locale: string) => void

  // 工具方法
  exists: <TKey extends TranslationKey<TMessages>>(key: TKey) => boolean
  getLanguageData: (locale: string) => TMessages | undefined

  // 开发工具
  validator: TranslationValidator<TMessages>
  performance: PerformanceMonitor
  debugger: Debugger

  // 事件系统
  on: (event: string, handler: (...args: any[]) => void) => () => void
  off: (event: string, handler: (...args: any[]) => void) => void
  emit: (event: string, ...args: any[]) => void
}

/**
 * Vue Composition API 类型
 */
export interface UseI18nReturn<TMessages = any> {
  t: TranslationFunction<TMessages>
  locale: Ref<string>
  availableLanguages: Ref<string[]>
  isChanging: Ref<boolean>
  changeLanguage: (locale: string) => Promise<void>
  i18n: EnhancedI18nInstance<TMessages>
}

/**
 * 组件属性类型
 */
export interface TranslationTextProps<TMessages = any> {
  keyPath: TranslationKey<TMessages>
  params?: TranslationParams<TranslationKey<TMessages> extends string ? TranslationKey<TMessages> : string>
  tag?: string
  html?: boolean
  fallback?: string
  namespace?: string
}

export interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'select'
  size?: 'small' | 'medium' | 'large'
  showFlag?: boolean
  showCode?: boolean
  nameDisplay?: 'native' | 'english' | 'both'
  theme?: 'light' | 'dark' | 'auto'
  disabled?: boolean
}

/**
 * 插件配置类型
 */
export interface I18nPluginConfig<TMessages = any> {
  locale: string
  fallbackLocale?: string
  messages: Record<string, TMessages>
  development?: {
    enabled?: boolean
    performance?: {
      enabled?: boolean
      slowThreshold?: number
    }
    debug?: {
      enabled?: boolean
      level?: 'error' | 'warn' | 'info' | 'debug'
      trackCoverage?: boolean
    }
  }
  ssr?: {
    enabled?: boolean
    detection?: {
      acceptLanguage?: boolean
      path?: boolean
      query?: string
      cookie?: string
    }
  }
}

/**
 * 工具类型
 */
export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export type RequiredKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? never : K
}[keyof T]

export type OptionalKeys<T> = {
  [K in keyof T]-?: Record<string, never> extends Pick<T, K> ? K : never
}[keyof T]

export type PickRequired<T> = Pick<T, RequiredKeys<T>>
export type PickOptional<T> = Pick<T, OptionalKeys<T>>

/**
 * 模块声明增强
 */
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $t: TranslationFunction
    $i18n: EnhancedI18nInstance
  }
}
