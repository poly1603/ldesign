/**
 * Vue I18n 调试工具
 *
 * 提供：
 * - 翻译键检查
 * - 缺失翻译检测
 * - 参数验证
 * - 实时调试面板
 * - 翻译覆盖率分析
 */

import type { I18nInstance, TranslationParams } from '../core/types'
import { computed, reactive } from 'vue'

/**
 * 调试级别
 */
export enum DebugLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

/**
 * 调试消息接口
 */
export interface DebugMessage {
  id: string
  level: DebugLevel
  message: string
  key?: string
  params?: TranslationParams
  timestamp: number
  stackTrace?: string
  context?: any
}

/**
 * 翻译覆盖率信息
 */
export interface TranslationCoverage {
  totalKeys: number
  usedKeys: Set<string>
  unusedKeys: Set<string>
  missingKeys: Set<string>
  coverageRate: number
}

/**
 * 调试器配置
 */
export interface DebuggerConfig {
  enabled: boolean
  level: DebugLevel
  maxMessages: number
  trackCoverage: boolean
  validateParams: boolean
  checkMissingKeys: boolean
  autoLog: boolean
}

/**
 * I18n 调试器
 */
export class I18nDebugger {
  private i18n: I18nInstance
  private config = reactive<DebuggerConfig>({
    enabled: false,
    level: DebugLevel.INFO,
    maxMessages: 1000,
    trackCoverage: true,
    validateParams: true,
    checkMissingKeys: true,
    autoLog: true,
  })

  private messages = reactive<DebugMessage[]>([])
  private coverage = reactive<TranslationCoverage>({
    totalKeys: 0,
    usedKeys: new Set(),
    unusedKeys: new Set(),
    missingKeys: new Set(),
    coverageRate: 0,
  })

  private messageIdCounter = 0

  constructor(i18n: I18nInstance) {
    this.i18n = i18n
    this.setupDebugging()
    this.initializeCoverage()
  }

  /**
   * 设置调试
   */
  private setupDebugging(): void {
    // 包装原始翻译方法
    const originalT = this.i18n.t.bind(this.i18n)

    this.i18n.t = (key: string, params?: TranslationParams, options?: any): any => {
      if (this.config.enabled) {
        this.debugTranslation(key, params)
      }

      try {
        const result = originalT(key, params, options)

        if (this.config.enabled && this.config.trackCoverage) {
          this.trackKeyUsage(key)
        }

        return result
      }
      catch (error) {
        if (this.config.enabled) {
          this.logError(`Translation failed for key "${key}"`, error as Error, { key, params })
        }
        throw error
      }
    }
  }

  /**
   * 初始化覆盖率跟踪
   */
  private initializeCoverage(): void {
    if (!this.config.trackCoverage)
      return

    try {
      // 获取所有可用的翻译键
      const allKeys = this.getAllTranslationKeys()
      this.coverage.totalKeys = allKeys.length
      this.coverage.unusedKeys = new Set(allKeys)
      this.updateCoverageRate()
    }
    catch (error) {
      this.logError('Failed to initialize coverage tracking', error as Error)
    }
  }

  /**
   * 获取所有翻译键
   */
  private getAllTranslationKeys(): string[] {
    // 这里需要根据实际的 I18n 实现来获取所有键
    // 暂时返回空数组，实际实现时需要遍历所有语言包
    return []
  }

  /**
   * 调试翻译
   */
  private debugTranslation(key: string, params?: TranslationParams): void {
    // 检查缺失的翻译键
    if (this.config.checkMissingKeys && !this.i18n.exists(key)) {
      this.logWarn(`Missing translation key: "${key}"`, { key, params })
      this.coverage.missingKeys.add(key)
    }

    // 验证参数
    if (this.config.validateParams && params) {
      this.validateTranslationParams(key, params)
    }

    // 记录调试信息
    if (this.shouldLog(DebugLevel.DEBUG)) {
      this.logDebug(`Translating key: "${key}"`, { key, params })
    }
  }

  /**
   * 验证翻译参数
   */
  private validateTranslationParams(key: string, params: TranslationParams): void {
    // 检查参数类型
    if (typeof params !== 'object' || params === null) {
      this.logWarn(`Invalid params type for key "${key}": expected object, got ${typeof params}`, {
        key,
        params,
      })
      return
    }

    // 检查参数值
    for (const [paramKey, paramValue] of Object.entries(params)) {
      if (paramValue === undefined) {
        this.logWarn(`Undefined parameter "${paramKey}" for key "${key}"`, { key, params })
      }
      else if (paramValue === null) {
        this.logInfo(`Null parameter "${paramKey}" for key "${key}"`, { key, params })
      }
    }
  }

  /**
   * 跟踪键使用情况
   */
  private trackKeyUsage(key: string): void {
    if (!this.coverage.usedKeys.has(key)) {
      this.coverage.usedKeys.add(key)
      this.coverage.unusedKeys.delete(key)
      this.updateCoverageRate()
    }
  }

  /**
   * 更新覆盖率
   */
  private updateCoverageRate(): void {
    if (this.coverage.totalKeys === 0) {
      this.coverage.coverageRate = 0
    }
    else {
      this.coverage.coverageRate = this.coverage.usedKeys.size / this.coverage.totalKeys
    }
  }

  /**
   * 记录错误
   */
  logError(message: string, error?: Error, context?: any): void {
    this.addMessage(DebugLevel.ERROR, message, context, error?.stack)
    if (this.config.autoLog) {
      console.error(`[I18n Debug] ${message}`, context, error)
    }
  }

  /**
   * 记录警告
   */
  logWarn(message: string, context?: any): void {
    this.addMessage(DebugLevel.WARN, message, context)
    if (this.config.autoLog) {
      console.warn(`[I18n Debug] ${message}`, context)
    }
  }

  /**
   * 记录信息
   */
  logInfo(message: string, context?: any): void {
    this.addMessage(DebugLevel.INFO, message, context)
    if (this.config.autoLog) {
      // eslint-disable-next-line no-console
      console.info(`[I18n Debug] ${message}`, context)
    }
  }

  /**
   * 记录调试信息
   */
  logDebug(message: string, context?: any): void {
    this.addMessage(DebugLevel.DEBUG, message, context)
    if (this.config.autoLog) {
      // eslint-disable-next-line no-console
      console.debug(`[I18n Debug] ${message}`, context)
    }
  }

  /**
   * 添加消息
   */
  private addMessage(level: DebugLevel, message: string, context?: any, stackTrace?: string): void {
    if (!this.shouldLog(level))
      return

    const debugMessage: DebugMessage = {
      id: `debug-${++this.messageIdCounter}`,
      level,
      message,
      timestamp: Date.now(),
      stackTrace,
      context,
    }

    if (context?.key) {
      debugMessage.key = context.key
    }
    if (context?.params) {
      debugMessage.params = context.params
    }

    this.messages.unshift(debugMessage)

    // 限制消息数量
    if (this.messages.length > this.config.maxMessages) {
      this.messages.splice(this.config.maxMessages)
    }
  }

  /**
   * 检查是否应该记录日志
   */
  private shouldLog(level: DebugLevel): boolean {
    if (!this.config.enabled)
      return false

    const levels = [DebugLevel.ERROR, DebugLevel.WARN, DebugLevel.INFO, DebugLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(this.config.level)
    const messageLevelIndex = levels.indexOf(level)

    return messageLevelIndex <= currentLevelIndex
  }

  /**
   * 启用调试
   */
  enable(): void {
    this.config.enabled = true
    this.logInfo('I18n debugging enabled')
  }

  /**
   * 禁用调试
   */
  disable(): void {
    this.config.enabled = false
  }

  /**
   * 设置调试级别
   */
  setLevel(level: DebugLevel): void {
    this.config.level = level
    this.logInfo(`Debug level set to: ${level}`)
  }

  /**
   * 清除所有消息
   */
  clearMessages(): void {
    this.messages.length = 0
    this.logInfo('Debug messages cleared')
  }

  /**
   * 获取配置
   */
  getConfig(): DebuggerConfig {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<DebuggerConfig>): void {
    Object.assign(this.config, newConfig)
    this.logInfo('Debug configuration updated', newConfig)
  }

  /**
   * 获取覆盖率报告
   */
  getCoverageReport(): TranslationCoverage {
    return {
      ...this.coverage,
      usedKeys: new Set(this.coverage.usedKeys),
      unusedKeys: new Set(this.coverage.unusedKeys),
      missingKeys: new Set(this.coverage.missingKeys),
    }
  }

  /**
   * 导出调试报告
   */
  exportReport(): string {
    const report = {
      timestamp: new Date().toISOString(),
      config: this.getConfig(),
      messages: [...this.messages],
      coverage: this.getCoverageReport(),
    }

    return JSON.stringify(report, (key, value) => {
      // 处理 Set 对象
      if (value instanceof Set) {
        return Array.from(value)
      }
      return value
    }, 2)
  }

  /**
   * 获取响应式状态
   */
  getReactiveState() {
    return {
      config: computed(() => this.config),
      messages: computed(() => this.messages),
      coverage: computed(() => this.coverage),
      errorCount: computed(() => this.messages.filter(m => m.level === DebugLevel.ERROR).length),
      warningCount: computed(() => this.messages.filter(m => m.level === DebugLevel.WARN).length),
    }
  }
}

/**
 * 创建调试器
 */
export function createDebugger(i18n: I18nInstance): I18nDebugger {
  return new I18nDebugger(i18n)
}

/**
 * 调试器选项
 */
export interface DebuggerOptions {
  enabled?: boolean
  level?: DebugLevel
  maxMessages?: number
  trackCoverage?: boolean
  validateParams?: boolean
  checkMissingKeys?: boolean
  autoLog?: boolean
}
