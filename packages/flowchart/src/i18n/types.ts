/**
 * 国际化模块类型定义
 */

/**
 * 支持的语言代码
 */
export type SupportedLocale = 
  | 'zh-CN'    // 简体中文
  | 'zh-TW'    // 繁体中文
  | 'en-US'    // 美式英语
  | 'en-GB'    // 英式英语
  | 'ja-JP'    // 日语
  | 'ko-KR'    // 韩语
  | 'fr-FR'    // 法语
  | 'de-DE'    // 德语
  | 'es-ES'    // 西班牙语
  | 'it-IT'    // 意大利语
  | 'pt-BR'    // 巴西葡萄牙语
  | 'ru-RU'    // 俄语
  | 'ar-SA'    // 阿拉伯语
  | 'hi-IN'    // 印地语
  | 'th-TH'    // 泰语
  | 'vi-VN'    // 越南语

/**
 * 语言信息
 */
export interface LocaleInfo {
  /** 语言代码 */
  code: SupportedLocale
  /** 语言名称（本地化） */
  name: string
  /** 语言名称（英文） */
  englishName: string
  /** 是否为右到左语言 */
  rtl: boolean
  /** 语言方向 */
  direction: 'ltr' | 'rtl'
  /** 国家/地区代码 */
  country: string
  /** 货币代码 */
  currency: string
  /** 日期格式 */
  dateFormat: string
  /** 时间格式 */
  timeFormat: string
  /** 数字格式 */
  numberFormat: NumberFormatOptions
  /** 是否已加载 */
  loaded: boolean
}

/**
 * 数字格式选项
 */
export interface NumberFormatOptions {
  /** 小数分隔符 */
  decimalSeparator: string
  /** 千位分隔符 */
  thousandsSeparator: string
  /** 小数位数 */
  decimalPlaces: number
  /** 货币符号 */
  currencySymbol: string
  /** 货币位置 */
  currencyPosition: 'before' | 'after'
}

/**
 * 翻译资源
 */
export interface TranslationResource {
  /** 语言代码 */
  locale: SupportedLocale
  /** 命名空间 */
  namespace: string
  /** 翻译键值对 */
  translations: Record<string, any>
  /** 资源版本 */
  version: string
  /** 最后更新时间 */
  lastUpdated: number
}

/**
 * 翻译键路径
 */
export type TranslationKey = string

/**
 * 翻译参数
 */
export interface TranslationParams {
  [key: string]: string | number | boolean | Date
}

/**
 * 翻译选项
 */
export interface TranslationOptions {
  /** 默认值 */
  defaultValue?: string
  /** 参数替换 */
  params?: TranslationParams
  /** 计数（用于复数形式） */
  count?: number
  /** 上下文 */
  context?: string
  /** 命名空间 */
  namespace?: string
  /** 是否转义HTML */
  escapeHtml?: boolean
}

/**
 * 复数规则
 */
export interface PluralRule {
  /** 语言代码 */
  locale: SupportedLocale
  /** 复数形式数量 */
  forms: number
  /** 复数规则函数 */
  rule: (count: number) => number
}

/**
 * 日期时间格式化选项
 */
export interface DateTimeFormatOptions {
  /** 日期样式 */
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  /** 时间样式 */
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  /** 时区 */
  timeZone?: string
  /** 年份格式 */
  year?: 'numeric' | '2-digit'
  /** 月份格式 */
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow'
  /** 日期格式 */
  day?: 'numeric' | '2-digit'
  /** 小时格式 */
  hour?: 'numeric' | '2-digit'
  /** 分钟格式 */
  minute?: 'numeric' | '2-digit'
  /** 秒格式 */
  second?: 'numeric' | '2-digit'
  /** 12/24小时制 */
  hour12?: boolean
}

/**
 * 货币格式化选项
 */
export interface CurrencyFormatOptions {
  /** 货币代码 */
  currency: string
  /** 货币显示方式 */
  currencyDisplay?: 'symbol' | 'code' | 'name'
  /** 最小小数位数 */
  minimumFractionDigits?: number
  /** 最大小数位数 */
  maximumFractionDigits?: number
}

/**
 * 资源加载器接口
 */
export interface ResourceLoader {
  /** 加载器名称 */
  name: string
  /** 支持的协议 */
  protocols: string[]
  /** 加载资源 */
  load(url: string, locale: SupportedLocale, namespace: string): Promise<TranslationResource>
  /** 检查资源是否存在 */
  exists(url: string, locale: SupportedLocale, namespace: string): Promise<boolean>
  /** 获取资源元数据 */
  getMetadata(url: string, locale: SupportedLocale, namespace: string): Promise<ResourceMetadata>
}

/**
 * 资源元数据
 */
export interface ResourceMetadata {
  /** 资源大小 */
  size: number
  /** 最后修改时间 */
  lastModified: number
  /** 资源版本 */
  version: string
  /** 资源哈希 */
  hash?: string
}

/**
 * 国际化配置
 */
export interface I18nConfig {
  /** 默认语言 */
  defaultLocale: SupportedLocale
  /** 当前语言 */
  currentLocale?: SupportedLocale
  /** 回退语言 */
  fallbackLocale: SupportedLocale
  /** 支持的语言列表 */
  supportedLocales: SupportedLocale[]
  /** 资源路径模板 */
  resourcePath: string
  /** 默认命名空间 */
  defaultNamespace: string
  /** 命名空间分隔符 */
  namespaceSeparator: string
  /** 键路径分隔符 */
  keySeparator: string
  /** 参数插值分隔符 */
  interpolation: {
    prefix: string
    suffix: string
    escapeValue: boolean
  }
  /** 复数分隔符 */
  pluralSeparator: string
  /** 上下文分隔符 */
  contextSeparator: string
  /** 是否启用调试 */
  debug: boolean
  /** 缓存配置 */
  cache: {
    enabled: boolean
    maxSize: number
    ttl: number
  }
  /** 预加载配置 */
  preload: {
    enabled: boolean
    locales: SupportedLocale[]
    namespaces: string[]
  }
  /** 懒加载配置 */
  lazyLoad: {
    enabled: boolean
    threshold: number
  }
}

/**
 * 国际化管理器接口
 */
export interface I18nManager {
  /** 初始化 */
  initialize(config: I18nConfig): Promise<void>
  
  /** 语言管理 */
  getCurrentLocale(): SupportedLocale
  setCurrentLocale(locale: SupportedLocale): Promise<void>
  getSupportedLocales(): LocaleInfo[]
  getLocaleInfo(locale: SupportedLocale): LocaleInfo | null
  
  /** 资源管理 */
  loadResource(locale: SupportedLocale, namespace: string): Promise<void>
  unloadResource(locale: SupportedLocale, namespace: string): void
  isResourceLoaded(locale: SupportedLocale, namespace: string): boolean
  
  /** 翻译功能 */
  t(key: TranslationKey, options?: TranslationOptions): string
  exists(key: TranslationKey, options?: { namespace?: string }): boolean
  
  /** 格式化功能 */
  formatDate(date: Date, options?: DateTimeFormatOptions): string
  formatTime(date: Date, options?: DateTimeFormatOptions): string
  formatDateTime(date: Date, options?: DateTimeFormatOptions): string
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string
  formatCurrency(amount: number, options?: CurrencyFormatOptions): string
  formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit): string
  
  /** 复数处理 */
  plural(key: TranslationKey, count: number, options?: TranslationOptions): string
  
  /** 事件监听 */
  on(event: I18nEvent, listener: I18nEventListener): void
  off(event: I18nEvent, listener: I18nEventListener): void
  emit(event: I18nEvent, ...args: any[]): void
}

/**
 * 国际化事件
 */
export type I18nEvent = 
  | 'localeChanged'
  | 'resourceLoaded'
  | 'resourceUnloaded'
  | 'translationMissing'
  | 'error'

/**
 * 事件监听器
 */
export type I18nEventListener = (...args: any[]) => void

/**
 * 语言检测器接口
 */
export interface LanguageDetector {
  /** 检测器名称 */
  name: string
  /** 检测优先级 */
  priority: number
  /** 检测语言 */
  detect(): SupportedLocale | null
  /** 缓存语言设置 */
  cache(locale: SupportedLocale): void
}

/**
 * 翻译缺失处理器
 */
export interface MissingTranslationHandler {
  /** 处理器名称 */
  name: string
  /** 处理缺失的翻译 */
  handle(
    locale: SupportedLocale,
    namespace: string,
    key: TranslationKey,
    defaultValue?: string
  ): string
}

/**
 * 插值处理器
 */
export interface InterpolationProcessor {
  /** 处理器名称 */
  name: string
  /** 处理插值 */
  process(
    template: string,
    params: TranslationParams,
    locale: SupportedLocale
  ): string
}

/**
 * 后处理器
 */
export interface PostProcessor {
  /** 处理器名称 */
  name: string
  /** 处理类型 */
  type: 'postProcessor'
  /** 处理翻译结果 */
  process(
    value: string,
    key: TranslationKey,
    options: TranslationOptions,
    translator: I18nManager
  ): string
}

/**
 * 国际化中间件
 */
export interface I18nMiddleware {
  /** 中间件名称 */
  name: string
  /** 执行中间件 */
  execute(
    context: I18nContext,
    next: () => Promise<string>
  ): Promise<string>
}

/**
 * 国际化上下文
 */
export interface I18nContext {
  /** 语言代码 */
  locale: SupportedLocale
  /** 翻译键 */
  key: TranslationKey
  /** 翻译选项 */
  options: TranslationOptions
  /** 命名空间 */
  namespace: string
  /** 原始值 */
  value?: string
}

/**
 * 翻译验证器
 */
export interface TranslationValidator {
  /** 验证器名称 */
  name: string
  /** 验证翻译 */
  validate(
    key: TranslationKey,
    value: string,
    locale: SupportedLocale,
    namespace: string
  ): ValidationResult
}

/**
 * 验证结果
 */
export interface ValidationResult {
  /** 是否有效 */
  valid: boolean
  /** 错误信息 */
  errors: ValidationError[]
  /** 警告信息 */
  warnings: ValidationWarning[]
}

/**
 * 验证错误
 */
export interface ValidationError {
  /** 错误代码 */
  code: string
  /** 错误消息 */
  message: string
  /** 错误位置 */
  position?: number
  /** 错误详情 */
  details?: any
}

/**
 * 验证警告
 */
export interface ValidationWarning {
  /** 警告代码 */
  code: string
  /** 警告消息 */
  message: string
  /** 警告位置 */
  position?: number
}

/**
 * 翻译统计
 */
export interface TranslationStats {
  /** 总翻译数 */
  totalTranslations: number
  /** 已翻译数 */
  translatedCount: number
  /** 缺失翻译数 */
  missingCount: number
  /** 翻译完成率 */
  completionRate: number
  /** 按语言统计 */
  byLocale: Record<SupportedLocale, LocaleStats>
  /** 按命名空间统计 */
  byNamespace: Record<string, NamespaceStats>
}

/**
 * 语言统计
 */
export interface LocaleStats {
  /** 语言代码 */
  locale: SupportedLocale
  /** 总翻译数 */
  totalTranslations: number
  /** 已翻译数 */
  translatedCount: number
  /** 缺失翻译数 */
  missingCount: number
  /** 翻译完成率 */
  completionRate: number
}

/**
 * 命名空间统计
 */
export interface NamespaceStats {
  /** 命名空间 */
  namespace: string
  /** 总翻译数 */
  totalTranslations: number
  /** 按语言统计 */
  byLocale: Record<SupportedLocale, number>
}

/**
 * 国际化事件数据
 */
export interface I18nEventData {
  'localeChanged': {
    oldLocale: SupportedLocale
    newLocale: SupportedLocale
  }
  'resourceLoaded': {
    locale: SupportedLocale
    namespace: string
    resource: TranslationResource
  }
  'resourceUnloaded': {
    locale: SupportedLocale
    namespace: string
  }
  'translationMissing': {
    locale: SupportedLocale
    namespace: string
    key: TranslationKey
    defaultValue?: string
  }
  'error': {
    error: Error
    context?: any
  }
}
