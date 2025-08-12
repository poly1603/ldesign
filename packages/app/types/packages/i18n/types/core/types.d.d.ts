/**
 * 语言信息接口
 */
interface LanguageInfo {
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
interface CacheOptions {
  /** 是否启用缓存 */
  enabled: boolean
  /** 最大缓存条目数 */
  maxSize: number
}
/**
 * I18n 配置选项接口
 */
interface I18nOptions {
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
 * 嵌套对象类型
 */
interface NestedObject {
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
interface LanguagePackage {
  /** 语言信息 */
  info: LanguageInfo
  /** 翻译内容 */
  translations: NestedObject
}

export type {
  CacheOptions,
  I18nOptions,
  LanguageInfo,
  LanguagePackage,
  NestedObject,
}
