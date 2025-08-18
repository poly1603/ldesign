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
  defaultLocale?: string
  /** 降级语言 */
  fallbackLocale?: string
  /** 存储方式 */
  storage?: 'localStorage' | 'sessionStorage' | 'none' | 'memory'
  /** 存储键名 */
  storageKey?: string
  /** 是否自动检测浏览器语言 */
  autoDetect?: boolean
  /** 预加载的语言列表 */
  preload?: string[]
  /** 缓存配置 */
  cache?: CacheOptions
  /** 语言切换回调 */
  onLanguageChanged?: (_locale: string) => void
  /** 加载错误回调 */
  onLoadError?: (_locale: string, _error: Error) => void
}

/**
 * 翻译参数类型
 */
export type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined | Record<string, unknown>
>

/**
 * 嵌套对象类型
 */
export interface NestedObject {
  [key: string]:
    | string
    | NestedObject
    | string[]
    | number
    | boolean
    | null
    | undefined
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
  load: (_locale: string) => Promise<LanguagePackage>
  /** 预加载语言包 */
  preload: (_locale: string) => Promise<void>
  /** 检查语言包是否已加载 */
  isLoaded: (_locale: string) => boolean
  /** 获取已加载的语言包 */
  getLoadedPackage?: (_locale: string) => LanguagePackage | undefined
}

/**
 * 存储接口
 */
export interface Storage {
  /** 获取存储的语言 */
  getLanguage: () => string | null
  /** 设置存储的语言 */
  setLanguage: (_locale: string) => void
  /** 清除存储的语言 */
  clearLanguage: () => void
}

/**
 * 语言检测器接口
 */
export interface Detector {
  /** 检测浏览器语言 */
  detect: () => string[]
}

/**
 * 复数规则类型
 */
export type PluralRule = (_count: number) => number

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
export interface CacheItem<T = unknown> {
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
export interface LRUCache<T = unknown> {
  /** 获取缓存项 */
  get: (_key: string) => T | undefined
  /** 设置缓存项 */
  set: (_key: string, _value: T) => void
  /** 删除缓存项 */
  delete: (_key: string) => boolean
  /** 清空缓存 */
  clear: () => void
  /** 获取缓存大小 */
  size: () => number
}

/**
 * 事件类型
 */
export type I18nEventType = 'languageChanged' | 'loaded' | 'loadError'

/**
 * 事件监听器
 */
export type I18nEventListener = (..._args: unknown[]) => void

/**
 * 事件发射器接口
 */
export interface EventEmitter {
  /** 添加事件监听器 */
  on: (_event: I18nEventType, _listener: I18nEventListener) => void
  /** 移除事件监听器 */
  off: (_event: I18nEventType, _listener: I18nEventListener) => void
  /** 触发事件 */
  emit: (_event: I18nEventType, ..._args: unknown[]) => void
}

/**
 * 翻译函数类型
 */
export type TranslationFunction = <T = string>(
  _key: string,
  _params?: TranslationParams,
  _options?: TranslationOptions
) => T

/**
 * 批量翻译结果
 */
export interface BatchTranslationResult {
  /** 翻译结果映射 */
  translations: Record<string, string>
  /** 成功翻译的键数量 */
  successCount: number
  /** 失败翻译的键数量 */
  failureCount: number
  /** 失败的键列表 */
  failedKeys: string[]
}

/**
 * I18n 实例接口
 */
export interface I18nInstance extends EventEmitter {
  /** 初始化 */
  init: () => Promise<void>
  /** 切换语言 */
  changeLanguage: (_locale: string) => Promise<void>
  /** 翻译函数 */
  t: TranslationFunction
  /** 批量翻译 */
  batchTranslate: (
    _keys: string[],
    _params?: TranslationParams
  ) => BatchTranslationResult
  /** 获取可用语言列表 */
  getAvailableLanguages: () => LanguageInfo[]
  /** 获取当前语言 */
  getCurrentLanguage: () => string
  /** 获取当前语言信息 */
  getCurrentLanguageInfo: () => LanguageInfo | undefined
  /** 预加载语言 */
  preloadLanguage: (_locale: string) => Promise<void>
  /** 检查语言是否已加载 */
  isLanguageLoaded: (_locale: string) => boolean
  /** 检查翻译键是否存在 */
  exists: (_key: string, _locale?: string) => boolean
  /** 获取所有翻译键 */
  getKeys: (_locale?: string) => string[]
  /** 检查是否已初始化 */
  isReady: () => boolean
  /** 销毁实例 */
  destroy: () => Promise<void>
  /** 加载器实例（内部使用） */
  loader?: Loader
  /** 获取性能指标 */
  getPerformanceMetrics?: () => any
  /** 生成性能报告 */
  generatePerformanceReport?: () => string
  /** 获取优化建议 */
  getOptimizationSuggestions?: () => string[]
  /** 预热缓存 */
  warmUpCache?: (_keys: string[]) => void
  /** 清理缓存 */
  cleanupCache?: () => void
}
