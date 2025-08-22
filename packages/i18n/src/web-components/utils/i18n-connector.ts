/**
 * I18n连接器工具
 *
 * 为Web Components提供与全局i18n实例的连接和响应式更新能力
 */

import type { I18nInstance, LanguageInfo } from '../../core/types'

/**
 * 全局i18n实例接口扩展
 */
declare global {
  interface Window {
    i18n?: I18nInstance
  }
}

/**
 * I18n连接器事件类型
 */
export interface I18nConnectorEvents {
  'language-changed': CustomEvent<{ locale: string, previousLocale: string }>
  'i18n-ready': CustomEvent<{ i18n: I18nInstance }>
  'i18n-error': CustomEvent<{ error: Error, message: string }>
}

/**
 * I18n连接器配置
 */
export interface I18nConnectorConfig {
  /** 是否自动重试连接 */
  autoRetry?: boolean
  /** 重试间隔（毫秒） */
  retryInterval?: number
  /** 最大重试次数 */
  maxRetries?: number
  /** 是否启用调试日志 */
  debug?: boolean
}

/**
 * I18n连接器类
 *
 * 提供Web Components与全局i18n实例的连接和事件管理
 */
export class I18nConnector {
  private static instance: I18nConnector | null = null
  private i18n: I18nInstance | null = null
  private listeners = new Set<(locale: string) => void>()
  private config: Required<I18nConnectorConfig>
  private retryCount = 0
  private retryTimer: number | null = null
  private isReady = false

  private constructor(config: I18nConnectorConfig = {}) {
    this.config = {
      autoRetry: true,
      retryInterval: 1000,
      maxRetries: 10,
      debug: false,
      ...config,
    }

    this.init()
  }

  /**
   * 获取单例实例
   */
  static getInstance(config?: I18nConnectorConfig): I18nConnector {
    if (!I18nConnector.instance) {
      I18nConnector.instance = new I18nConnector(config)

      // 如果全局 i18n 实例已经存在，立即连接
      if (typeof window !== 'undefined' && (window as any).i18n) {
        I18nConnector.instance.connect((window as any).i18n)
      }
    }
    return I18nConnector.instance
  }

  /**
   * 初始化连接器
   */
  private init(): void {
    this.tryConnect()

    // 监听全局i18n实例的变化
    if (typeof window !== 'undefined') {
      // 监听window.i18n的设置
      this.watchWindowI18n()

      // 监听自定义事件
      window.addEventListener('i18n-instance-ready', this.handleI18nReady.bind(this))
    }
  }

  /**
   * 尝试连接到全局i18n实例
   */
  private tryConnect(): void {
    if (typeof window === 'undefined') {
      this.log('Window is not available, skipping connection')
      return
    }

    // 尝试从window.i18n获取实例
    if (window.i18n && typeof window.i18n.t === 'function') {
      this.connectToI18n(window.i18n)
      return
    }

    // 如果启用自动重试且未达到最大重试次数
    if (this.config.autoRetry && this.retryCount < this.config.maxRetries) {
      this.retryCount++
      this.log(`I18n instance not found, retrying in ${this.config.retryInterval}ms (${this.retryCount}/${this.config.maxRetries})`)

      this.retryTimer = window.setTimeout(() => {
        this.tryConnect()
      }, this.config.retryInterval)
    }
    else {
      this.log('I18n instance not found and max retries reached')
      this.emitError(new Error('I18n instance not available'), 'Failed to connect to i18n instance')
    }
  }

  /**
   * 连接到i18n实例
   */
  private connectToI18n(i18n: I18nInstance): void {
    if (this.i18n === i18n) {
      return // 已经连接到同一个实例
    }

    // 清理之前的连接
    this.disconnect()

    this.i18n = i18n
    this.isReady = true
    this.retryCount = 0

    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    // 监听语言变化事件
    this.i18n.on('languageChanged', this.handleLanguageChanged.bind(this))

    this.log('Connected to i18n instance successfully')
    this.emitReady(i18n)
  }

  /**
   * 断开连接
   */
  private disconnect(): void {
    if (this.i18n) {
      this.i18n.off('languageChanged', this.handleLanguageChanged.bind(this))
      this.i18n = null
    }
    this.isReady = false
  }

  /**
   * 监听window.i18n的变化
   */
  private watchWindowI18n(): void {
    // 使用Proxy监听window.i18n的设置
    let originalI18n = window.i18n

    Object.defineProperty(window, 'i18n', {
      get: () => originalI18n,
      set: (value: I18nInstance) => {
        originalI18n = value
        if (value && typeof value.t === 'function') {
          this.connectToI18n(value)
        }
      },
      configurable: true,
    })
  }

  /**
   * 处理i18n实例就绪事件
   */
  private handleI18nReady(event: Event): void {
    const customEvent = event as CustomEvent<{ i18n: I18nInstance }>
    this.connectToI18n(customEvent.detail.i18n)
  }

  /**
   * 处理语言变化事件
   */
  private handleLanguageChanged(...args: unknown[]): void {
    const newLocale = args[0] as string
    const previousLocale = args[1] as string || ''

    this.log(`Language changed: ${previousLocale} -> ${newLocale}`)

    // 通知所有监听器
    this.listeners.forEach((listener) => {
      try {
        listener(newLocale)
      }
      catch (error) {
        this.log('Error in language change listener:', error)
      }
    })

    // 发出全局事件
    this.emitLanguageChanged(newLocale, previousLocale)
  }

  /**
   * 添加语言变化监听器
   */
  addLanguageChangeListener(listener: (locale: string) => void): () => void {
    this.listeners.add(listener)

    // 返回移除监听器的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 移除语言变化监听器
   */
  removeLanguageChangeListener(listener: (locale: string) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * 获取当前i18n实例
   */
  getI18n(): I18nInstance | null {
    return this.i18n
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.isReady && this.i18n !== null
  }

  /**
   * 手动连接到i18n实例
   */
  connect(i18n: I18nInstance): void {
    this.connectToI18n(i18n)
  }

  /**
   * 获取当前语言
   */
  getCurrentLanguage(): string {
    return this.i18n?.getCurrentLanguage() || 'en'
  }

  /**
   * 获取可用语言列表
   */
  getAvailableLanguages(): LanguageInfo[] {
    return this.i18n?.getAvailableLanguages() || []
  }

  /**
   * 翻译文本
   */
  translate(key: string, params?: Record<string, any>, options?: any): string {
    if (!this.i18n) {
      this.log(`Translation attempted but i18n not connected: ${key}`)
      return key // 返回key作为fallback
    }

    try {
      return this.i18n.t(key, params, options)
    }
    catch (error) {
      this.log(`Translation error for key "${key}":`, error)
      return options?.defaultValue || key
    }
  }

  /**
   * 切换语言
   */
  async changeLanguage(locale: string): Promise<void> {
    if (!this.i18n) {
      throw new Error('I18n instance not connected')
    }

    try {
      await this.i18n.changeLanguage(locale)
    }
    catch (error) {
      this.log(`Language change error:`, error)
      throw error
    }
  }

  /**
   * 发出语言变化事件
   */
  private emitLanguageChanged(locale: string, previousLocale: string): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('language-changed', {
        detail: { locale, previousLocale },
        bubbles: true,
      })
      window.dispatchEvent(event)
    }
  }

  /**
   * 发出i18n就绪事件
   */
  private emitReady(i18n: I18nInstance): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('i18n-ready', {
        detail: { i18n },
        bubbles: true,
      })
      window.dispatchEvent(event)
    }
  }

  /**
   * 发出错误事件
   */
  private emitError(error: Error, message: string): void {
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('i18n-error', {
        detail: { error, message },
        bubbles: true,
      })
      window.dispatchEvent(event)
    }
  }

  /**
   * 调试日志
   */
  private log(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.warn(`[I18nConnector] ${message}`, ...args)
    }
  }

  /**
   * 销毁连接器
   */
  destroy(): void {
    this.disconnect()
    this.listeners.clear()

    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('i18n-instance-ready', this.handleI18nReady.bind(this))
    }

    I18nConnector.instance = null
  }
}

/**
 * 获取全局i18n连接器实例
 */
export function getI18nConnector(config?: I18nConnectorConfig): I18nConnector {
  return I18nConnector.getInstance(config)
}

/**
 * 便捷的翻译函数
 */
export function t(key: string, params?: Record<string, any>, options?: any): string {
  return getI18nConnector().translate(key, params, options)
}

/**
 * 便捷的语言切换函数
 */
export async function changeLanguage(locale: string): Promise<void> {
  return getI18nConnector().changeLanguage(locale)
}

/**
 * 便捷的当前语言获取函数
 */
export function getCurrentLanguage(): string {
  return getI18nConnector().getCurrentLanguage()
}

/**
 * 便捷的可用语言获取函数
 */
export function getAvailableLanguages(): LanguageInfo[] {
  return getI18nConnector().getAvailableLanguages()
}
