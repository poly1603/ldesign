/**
 * 语言信息接口
 */
export interface LanguageInfo {
  /** 语言显示名称 */
  name: string
  /** 本地语言名称 */
  nativeName: string
  /** ISO 639-1 语言代码 */
  code: string
  /** ISO 3166-1 区域代码 */
  region?: string
  /** 文本方向 */
  direction: 'ltr' | 'rtl'
  /** 默认日期格式 */
  dateFormat: string
}

/**
 * 缓存配置接口
 */
export interface CacheOptions {
  /** 是否启用缓存 */
  enabled: boolean
  /** 最大缓存条目数 */
  maxSize: number
}

/**
 * I18n 配置选项接口
 */
export interface I18nOptions {
  /** 默认语言 */
  defaultLocale: string
  /** 降级语言 */
  fallbackLocale?: string
  /** 存储方式 */
  storage?: 'localStorage' | 'sessionStorage' | 'none'
  /** 存储键名 */
  storageKey?: string
  /** 是否自动检测浏览器语言 */
  autoDetect?: boolean
  /** 预加载的语言列表 */
  preload?: string[]
  /** 缓存配置 */
  cache?: CacheOptions
  /** 语言切换回调 */
  onLanguageChanged?: (locale: string) => void
  /** 加载错误回调 */
  onLoadError?: (locale: string, error: Error) => void
}

/**
 * 翻译参数类型
 */
export type TranslationParams = Record<string, any>

/**
 * 嵌套对象类型
 */
export type NestedObject = {
  [key: string]: string | NestedObject
}

/**
 * 语言包类型
 */
export interface LanguagePackage {
  /** 语言信息 */
  info: LanguageInfo
  /** 翻译内容 */
  translations: NestedObject
}

/**
 * 加载器接口
 */
export interface Loader {
  /** 加载语言包 */
  load(locale: string): Promise<LanguagePackage>
  /** 预加载语言包 */
  preload(locale: string): Promise<void>
  /** 检查语言包是否已加载 */
  isLoaded(locale: string): boolean
}

/**
 * 存储接口
 */
export interface Storage {
  /** 获取存储的语言 */
  getLanguage(): string | null
  /** 设置存储的语言 */
  setLanguage(locale: string): void
  /** 清除存储的语言 */
  clearLanguage(): void
}

/**
 * 语言检测器接口
 */
export interface Detector {
  /** 检测浏览器语言 */
  detect(): string[]
}

/**
 * 复数规则类型
 */
export type PluralRule = (count: number) => number

/**
 * 复数规则映射
 */
export interface PluralRules {
  [locale: string]: PluralRule
}

/**
 * 插值选项
 */
export interface InterpolationOptions {
  /** 插值前缀 */
  prefix?: string
  /** 插值后缀 */
  suffix?: string
  /** 转义HTML */
  escapeValue?: boolean
}

/**
 * 翻译选项
 */
export interface TranslationOptions extends InterpolationOptions {
  /** 默认值 */
  defaultValue?: string
  /** 计数（用于复数） */
  count?: number
  /** 上下文 */
  context?: string
}

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  /** 缓存值 */
  value: T
  /** 创建时间 */
  timestamp: number
  /** 访问次数 */
  accessCount: number
}

/**
 * LRU 缓存接口
 */
export interface LRUCache<T = any> {
  /** 获取缓存项 */
  get(key: string): T | undefined
  /** 设置缓存项 */
  set(key: string, value: T): void
  /** 删除缓存项 */
  delete(key: string): boolean
  /** 清空缓存 */
  clear(): void
  /** 获取缓存大小 */
  size(): number
}

/**
 * 事件类型
 */
export type I18nEventType = 'languageChanged' | 'loaded' | 'loadError'

/**
 * 事件监听器
 */
export type I18nEventListener = (...args: any[]) => void

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on(event: I18nEventType, listener: I18nEventListener): void
  /** 移除事件监听器 */
  off(event: I18nEventType, listener: I18nEventListener): void
  /** 触发事件 */
  emit(event: I18nEventType, ...args: any[]): void
}

/**
 * 翻译函数类型
 */
export type TranslationFunction = <T = string>(
  key: string,
  params?: TranslationParams,
  options?: TranslationOptions
) => T

/**
 * 批量翻译结果
 */
export interface BatchTranslationResult {
  [key: string]: string
}

/**
 * I18n 实例接口
 */
export interface I18nInstance extends EventEmitter {
  /** 初始化 */
  init(): Promise<void>
  /** 切换语言 */
  changeLanguage(locale: string): Promise<void>
  /** 翻译函数 */
  t: TranslationFunction
  /** 批量翻译 */
  batchTranslate(keys: string[], params?: TranslationParams): BatchTranslationResult
  /** 获取可用语言列表 */
  getAvailableLanguages(): LanguageInfo[]
  /** 获取当前语言 */
  getCurrentLanguage(): string
  /** 预加载语言 */
  preloadLanguage(locale: string): Promise<void>
  /** 检查语言是否已加载 */
  isLanguageLoaded(locale: string): boolean
  /** 销毁实例 */
  destroy(): void
}
