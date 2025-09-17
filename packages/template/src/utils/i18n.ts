/**
 * 国际化（i18n）系统
 * 
 * 提供多语言支持、动态切换、懒加载等功能
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

/**
 * 语言包类型
 */
export interface LanguagePack {
  [key: string]: string | LanguagePack
}

/**
 * 语言配置
 */
export interface LanguageConfig {
  /** 语言代码 */
  code: string
  /** 语言名称 */
  name: string
  /** 本地化名称 */
  nativeName: string
  /** 是否从右到左 */
  rtl?: boolean
  /** 日期格式 */
  dateFormat?: string
  /** 时间格式 */
  timeFormat?: string
  /** 数字格式配置 */
  numberFormat?: {
    decimal: string
    thousands: string
    currency: string
  }
  /** 复数规则函数 */
  pluralRule?: (count: number) => number
}

/**
 * i18n配置选项
 */
export interface I18nOptions {
  /** 默认语言 */
  defaultLocale?: string
  /** 备用语言 */
  fallbackLocale?: string
  /** 初始消息 */
  messages?: Record<string, LanguagePack>
  /** 是否启用懒加载 */
  lazyLoad?: boolean
  /** 语言包加载器 */
  loader?: (locale: string) => Promise<LanguagePack>
  /** 是否缓存加载的语言包 */
  cache?: boolean
  /** 是否检测浏览器语言 */
  detectBrowserLanguage?: boolean
  /** 是否持久化语言选择 */
  persistLocale?: boolean
  /** 持久化存储键名 */
  storageKey?: string
  /** 是否启用调试模式 */
  debug?: boolean
  /** 缺失翻译处理器 */
  missingHandler?: (key: string, locale: string) => string
  /** 是否警告缺失翻译 */
  warnMissing?: boolean
}

/**
 * 翻译选项
 */
export interface TranslateOptions {
  /** 插值参数 */
  params?: Record<string, any>
  /** 默认值 */
  defaultValue?: string
  /** 复数计数 */
  count?: number
  /** 上下文 */
  context?: string
  /** 是否转义HTML */
  escapeHtml?: boolean
}

/**
 * 格式化选项
 */
export interface FormatOptions {
  /** 日期格式选项 */
  dateOptions?: Intl.DateTimeFormatOptions
  /** 数字格式选项 */
  numberOptions?: Intl.NumberFormatOptions
  /** 货币代码 */
  currency?: string
  /** 时区 */
  timeZone?: string
}

/**
 * i18n实例接口
 */
export interface I18nInstance {
  /** 当前语言 */
  locale: Ref<string>
  /** 可用语言列表 */
  availableLocales: ComputedRef<string[]>
  /** 消息对象 */
  messages: Ref<Record<string, LanguagePack>>
  /** 翻译函数 */
  t: (key: string, options?: TranslateOptions) => string
  /** 复数翻译函数 */
  tc: (key: string, count: number, options?: TranslateOptions) => string
  /** 存在检查函数 */
  te: (key: string, locale?: string) => boolean
  /** 日期格式化函数 */
  d: (date: Date | number | string, options?: FormatOptions) => string
  /** 数字格式化函数 */
  n: (value: number, options?: FormatOptions) => string
  /** 货币格式化函数 */
  c: (value: number, currency?: string, options?: FormatOptions) => string
  /** 设置语言 */
  setLocale: (locale: string) => Promise<void>
  /** 添加语言包 */
  addMessages: (locale: string, messages: LanguagePack) => void
  /** 合并语言包 */
  mergeMessages: (locale: string, messages: LanguagePack) => void
  /** 获取语言配置 */
  getLocaleConfig: (locale: string) => LanguageConfig | undefined
  /** 加载语言包 */
  loadLanguage: (locale: string) => Promise<void>
  /** 刷新翻译 */
  refresh: () => void
}

/**
 * 内置语言配置
 */
const BUILT_IN_LOCALES: Record<string, LanguageConfig> = {
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '¥'
    },
    pluralRule: () => 0
  },
  'en-US': {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: 'hh:mm:ss A',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '$'
    },
    pluralRule: (count: number) => count === 1 ? 0 : 1
  },
  'ja-JP': {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    dateFormat: 'YYYY年MM月DD日',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '¥'
    },
    pluralRule: () => 0
  },
  'ko-KR': {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    dateFormat: 'YYYY년 MM월 DD일',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '.',
      thousands: ',',
      currency: '₩'
    },
    pluralRule: () => 0
  },
  'ar-SA': {
    code: 'ar-SA',
    name: 'Arabic',
    nativeName: 'العربية',
    rtl: true,
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm:ss',
    numberFormat: {
      decimal: '٫',
      thousands: '٬',
      currency: 'ر.س'
    },
    pluralRule: (count: number) => {
      if (count === 0) return 0
      if (count === 1) return 1
      if (count === 2) return 2
      if (count % 100 >= 3 && count % 100 <= 10) return 3
      if (count % 100 >= 11 && count % 100 <= 99) return 4
      return 5
    }
  }
}

/**
 * 默认语言包
 */
const DEFAULT_MESSAGES: Record<string, LanguagePack> = {
  'zh-CN': {
    common: {
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      delete: '删除',
      edit: '编辑',
      add: '添加',
      search: '搜索',
      reset: '重置',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      warning: '警告',
      info: '信息'
    },
    template: {
      selectTemplate: '选择模板',
      noTemplates: '暂无可用模板',
      loadingTemplate: '正在加载模板...',
      templateError: '模板加载失败',
      switchTemplate: '切换模板',
      currentTemplate: '当前模板',
      defaultTemplate: '默认模板',
      customTemplate: '自定义模板'
    },
    error: {
      notFound: '未找到',
      unauthorized: '未授权',
      forbidden: '禁止访问',
      serverError: '服务器错误',
      networkError: '网络错误',
      timeout: '请求超时',
      unknown: '未知错误'
    },
    validation: {
      required: '此字段为必填项',
      email: '请输入有效的邮箱地址',
      minLength: '最少需要 {min} 个字符',
      maxLength: '最多允许 {max} 个字符',
      pattern: '格式不正确',
      number: '请输入数字',
      url: '请输入有效的URL'
    }
  },
  'en-US': {
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      reset: 'Reset',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Info'
    },
    template: {
      selectTemplate: 'Select Template',
      noTemplates: 'No templates available',
      loadingTemplate: 'Loading template...',
      templateError: 'Failed to load template',
      switchTemplate: 'Switch Template',
      currentTemplate: 'Current Template',
      defaultTemplate: 'Default Template',
      customTemplate: 'Custom Template'
    },
    error: {
      notFound: 'Not Found',
      unauthorized: 'Unauthorized',
      forbidden: 'Forbidden',
      serverError: 'Server Error',
      networkError: 'Network Error',
      timeout: 'Request Timeout',
      unknown: 'Unknown Error'
    },
    validation: {
      required: 'This field is required',
      email: 'Please enter a valid email',
      minLength: 'Minimum {min} characters required',
      maxLength: 'Maximum {max} characters allowed',
      pattern: 'Invalid format',
      number: 'Please enter a number',
      url: 'Please enter a valid URL'
    }
  }
}

/**
 * 创建i18n实例
 */
export function createI18n(options: I18nOptions = {}): I18nInstance {
  // 配置
  const config = {
    defaultLocale: options.defaultLocale || 'zh-CN',
    fallbackLocale: options.fallbackLocale || 'en-US',
    lazyLoad: options.lazyLoad !== false,
    cache: options.cache !== false,
    detectBrowserLanguage: options.detectBrowserLanguage !== false,
    persistLocale: options.persistLocale !== false,
    storageKey: options.storageKey || 'ldesign-locale',
    debug: options.debug || false,
    warnMissing: options.warnMissing !== false,
    missingHandler: options.missingHandler || ((key: string) => key),
    loader: options.loader
  }
  
  // 检测浏览器语言
  const detectLocale = (): string => {
    if (config.persistLocale) {
      const stored = localStorage.getItem(config.storageKey)
      if (stored) return stored
    }
    
    if (config.detectBrowserLanguage) {
      const browserLang = navigator.language || navigator.languages[0]
      if (browserLang) {
        // 尝试精确匹配
        if (DEFAULT_MESSAGES[browserLang]) return browserLang
        // 尝试语言代码匹配
        const langCode = browserLang.split('-')[0] as string
        const matched = Object.keys(DEFAULT_MESSAGES).find(key => 
          key.startsWith(langCode)
        )
        if (matched) return matched
      }
    }
    
    return config.defaultLocale
  }
  
  // 状态
  const locale = ref(detectLocale())
  const messages = ref<Record<string, LanguagePack>>(
    options.messages || DEFAULT_MESSAGES
  )
  const loadedLocales = new Set<string>()
  const loadingLocales = new Map<string, Promise<void>>()
  
  // 计算属性
  const availableLocales = computed(() => Object.keys(messages.value))
  
  // 获取消息
  const getMessage = (key: string, targetLocale?: string): any => {
    const loc = targetLocale || locale.value
    const keys = key.split('.')
    let message: any = messages.value[loc]
    
    for (const k of keys) {
      if (message && typeof message === 'object') {
        message = message[k]
      } else {
        message = undefined
        break
      }
    }
    
    // 尝试备用语言
    if (message === undefined && loc !== config.fallbackLocale) {
      return getMessage(key, config.fallbackLocale)
    }
    
    return message
  }
  
  // 插值替换
  const interpolate = (message: string, params?: Record<string, any>): string => {
    if (!params) return message
    
    return message.replace(/{(\w+)}/g, (match, key) => {
      return params[key] !== undefined ? String(params[key]) : match
    })
  }
  
  // 翻译函数
  const t = (key: string, options: TranslateOptions = {}): string => {
    let message = getMessage(key)
    
    // 处理上下文
    if (options.context) {
      const contextKey = `${key}_${options.context}`
      const contextMessage = getMessage(contextKey)
      if (contextMessage !== undefined) {
        message = contextMessage
      }
    }
    
    // 处理复数
    if (options.count !== undefined) {
      const localeConfig = BUILT_IN_LOCALES[locale.value]
      if (localeConfig?.pluralRule) {
        const pluralIndex = localeConfig.pluralRule(options.count)
        const pluralKey = `${key}_${pluralIndex}`
        const pluralMessage = getMessage(pluralKey)
        if (pluralMessage !== undefined) {
          message = pluralMessage
        }
      }
    }
    
    // 处理缺失
    if (message === undefined) {
      if (config.warnMissing && config.debug) {
        console.warn(`[i18n] Missing translation: ${key} for locale: ${locale.value}`)
      }
      message = options.defaultValue || config.missingHandler(key, locale.value)
    }
    
    // 插值
    if (typeof message === 'string') {
      message = interpolate(message, { ...options.params, count: options.count })
      
      // HTML转义
      if (options.escapeHtml) {
        message = message
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;')
      }
    }
    
    return String(message)
  }
  
  // 复数翻译
  const tc = (key: string, count: number, options: TranslateOptions = {}): string => {
    return t(key, { ...options, count })
  }
  
  // 检查翻译是否存在
  const te = (key: string, targetLocale?: string): boolean => {
    return getMessage(key, targetLocale) !== undefined
  }
  
  // 日期格式化
  const d = (date: Date | number | string, options: FormatOptions = {}): string => {
    const dateObj = date instanceof Date ? date : new Date(date)
    const localeConfig = BUILT_IN_LOCALES[locale.value]
    
    try {
      return new Intl.DateTimeFormat(locale.value, {
        timeZone: options.timeZone,
        ...options.dateOptions
      }).format(dateObj)
    } catch (error) {
      if (config.debug) {
        console.error('[i18n] Date formatting error:', error)
      }
      return dateObj.toLocaleDateString(locale.value)
    }
  }
  
  // 数字格式化
  const n = (value: number, options: FormatOptions = {}): string => {
    try {
      return new Intl.NumberFormat(locale.value, options.numberOptions).format(value)
    } catch (error) {
      if (config.debug) {
        console.error('[i18n] Number formatting error:', error)
      }
      return String(value)
    }
  }
  
  // 货币格式化
  const c = (value: number, currency?: string, options: FormatOptions = {}): string => {
    const localeConfig = BUILT_IN_LOCALES[locale.value]
    const currencyCode = currency || localeConfig?.numberFormat?.currency || 'USD'
    
    try {
      return new Intl.NumberFormat(locale.value, {
        style: 'currency',
        currency: currencyCode,
        ...options.numberOptions
      }).format(value)
    } catch (error) {
      if (config.debug) {
        console.error('[i18n] Currency formatting error:', error)
      }
      return `${currencyCode} ${value}`
    }
  }
  
  // 加载语言包
  const loadLanguage = async (targetLocale: string): Promise<void> => {
    // 检查是否已加载
    if (loadedLocales.has(targetLocale)) return
    
    // 检查是否正在加载
    const loading = loadingLocales.get(targetLocale)
    if (loading) return loading
    
    // 开始加载
    const loader = config.loader
    if (loader) {
      const loadPromise = (async () => {
        try {
          const pack = await loader(targetLocale)
          messages.value[targetLocale] = pack
          loadedLocales.add(targetLocale)
        } catch (error) {
          console.error(`[i18n] Failed to load language pack for ${targetLocale}:`, error)
          throw error
        } finally {
          loadingLocales.delete(targetLocale)
        }
      })()
      
      loadingLocales.set(targetLocale, loadPromise)
      return loadPromise
    }
  }
  
  // 设置语言
  const setLocale = async (targetLocale: string): Promise<void> => {
    // 懒加载语言包
    if (config.lazyLoad && !messages.value[targetLocale]) {
      await loadLanguage(targetLocale)
    }
    
    locale.value = targetLocale
    
    // 持久化
    if (config.persistLocale) {
      localStorage.setItem(config.storageKey, targetLocale)
    }
    
    // 更新HTML语言属性
    document.documentElement.setAttribute('lang', targetLocale)
    
    // 更新文字方向
    const localeConfig = BUILT_IN_LOCALES[targetLocale]
    if (localeConfig?.rtl) {
      document.documentElement.setAttribute('dir', 'rtl')
    } else {
      document.documentElement.setAttribute('dir', 'ltr')
    }
  }
  
  // 添加消息
  const addMessages = (targetLocale: string, pack: LanguagePack): void => {
    messages.value[targetLocale] = pack
    loadedLocales.add(targetLocale)
  }
  
  // 合并消息
  const mergeMessages = (targetLocale: string, pack: LanguagePack): void => {
    const existing = messages.value[targetLocale] || {}
    messages.value[targetLocale] = deepMerge(existing, pack)
    loadedLocales.add(targetLocale)
  }
  
  // 获取语言配置
  const getLocaleConfig = (targetLocale: string): LanguageConfig | undefined => {
    return BUILT_IN_LOCALES[targetLocale]
  }
  
  // 刷新翻译（触发响应式更新）
  const refresh = (): void => {
    messages.value = { ...messages.value }
  }
  
  // 初始化
  setLocale(locale.value)
  
  return {
    locale,
    availableLocales,
    messages,
    t,
    tc,
    te,
    d,
    n,
    c,
    setLocale,
    addMessages,
    mergeMessages,
    getLocaleConfig,
    loadLanguage,
    refresh
  }
}

/**
 * 深度合并对象
 */
function deepMerge(target: any, source: any): any {
  const result = { ...target }
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])
      ) {
        result[key] = deepMerge(result[key] || {}, source[key])
      } else {
        result[key] = source[key]
      }
    }
  }
  
  return result
}

/**
 * 全局i18n实例
 */
let globalI18n: I18nInstance | null = null

/**
 * 安装全局i18n
 */
export function installI18n(options?: I18nOptions): I18nInstance {
  if (!globalI18n) {
    globalI18n = createI18n(options)
  }
  return globalI18n
}

/**
 * 使用全局i18n
 */
export function useI18n(): I18nInstance {
  if (!globalI18n) {
    throw new Error('[i18n] Global i18n instance not installed. Call installI18n() first.')
  }
  return globalI18n
}
