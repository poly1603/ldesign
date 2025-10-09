/**
 * Vue DevTools 集成
 * 提供开发工具支持，包括翻译键追踪、性能监控等
 */

import type { App } from 'vue'
import type { VueI18n } from './types'

/**
 * DevTools 配置选项
 */
export interface DevToolsOptions {
  /** 是否启用 DevTools 集成 */
  enabled?: boolean
  /** 是否追踪翻译键使用情况 */
  trackTranslations?: boolean
  /** 是否监控性能 */
  trackPerformance?: boolean
  /** 是否记录缺失的翻译 */
  trackMissing?: boolean
  /** 是否在控制台显示详细日志 */
  verbose?: boolean
  /** 是否启用翻译覆盖率分析 */
  trackCoverage?: boolean
  /** 是否启用未使用翻译检测 */
  trackUnused?: boolean
  /** 是否启用翻译质量检查 */
  trackQuality?: boolean
  /** 是否启用自动报告 */
  autoReport?: boolean
  /** 报告间隔（毫秒） */
  reportInterval?: number
}

/**
 * 翻译使用统计
 */
interface TranslationStats {
  /** 翻译键 */
  key: string
  /** 使用次数 */
  count: number
  /** 最后使用时间 */
  lastUsed: number
  /** 使用的语言 */
  locales: Set<string>
  /** 是否缺失 */
  missing: boolean
  /** 使用的参数集合 */
  params: Array<Record<string, any>>
  /** 总翻译时间 */
  totalTime?: number
}

/**
 * 性能统计
 */
interface PerformanceStats {
  /** 翻译调用次数 */
  translationCalls: number
  /** 平均翻译时间 */
  averageTranslationTime: number
  /** 缓存命中率 */
  cacheHitRate: number
  /** 语言切换次数 */
  languageChanges: number
}

/**
 * DevTools 状态管理器
 */
class I18nDevTools {
  private app: App | null = null
  private i18n: VueI18n | null = null
  private options: DevToolsOptions
  private translationStats = new Map<string, TranslationStats>()
  private performanceStats: PerformanceStats = {
    translationCalls: 0,
    averageTranslationTime: 0,
    cacheHitRate: 0,
    languageChanges: 0
  }
  private missingTranslations = new Set<string>()

  constructor(options: DevToolsOptions = {}) {
    this.options = {
      enabled: process.env.NODE_ENV === 'development',
      trackTranslations: true,
      trackPerformance: true,
      trackMissing: true,
      verbose: false,
      ...options
    }
  }

  /**
   * 安装 DevTools
   */
  install(app: App, i18n: VueI18n) {
    if (!this.options.enabled) {
      return
    }

    this.app = app
    this.i18n = i18n

    // 注册 Vue DevTools 插件
    if (typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
      this.registerVueDevTools()
    }

    // 包装翻译函数以进行追踪
    this.wrapTranslationFunctions()

    // 设置全局错误处理
    this.setupGlobalErrorHandling()

    // 暴露到全局对象（开发模式）
    if (typeof window !== 'undefined') {
      (window as any).__I18N_DEVTOOLS__ = this
    }

    this.log('I18n DevTools 已启用')
  }

  /**
   * 注册 Vue DevTools 插件
   */
  private registerVueDevTools() {
    const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__

    if (!hook) return

    hook.on('app:init', (app: App) => {
      if (app === this.app) {
        this.log('Vue DevTools 集成已激活')
      }
    })

    // 添加自定义面板
    hook.addTimelineLayer({
      id: 'i18n',
      label: 'I18n',
      color: 0x722ED1
    })
  }

  /**
   * 包装翻译函数
   */
  private wrapTranslationFunctions() {
    if (!this.i18n) return

    const originalT = this.i18n.t
    const originalTe = this.i18n.te

    // 包装 t 函数
    this.i18n.t = (key: string, params?: Record<string, unknown>) => {
      const startTime = performance.now()

      try {
        const result = originalT.call(this.i18n, key, params)
        const endTime = performance.now()

        this.trackTranslation(key, endTime - startTime, false, params)
        return result
      } catch (error) {
        this.trackTranslation(key, 0, true, params)
        throw error
      }
    }

    // 包装 te 函数
    this.i18n.te = (key: string, locale?: string) => {
      const exists = originalTe.call(this.i18n, key, locale)

      if (!exists && this.options.trackMissing) {
        this.trackMissingTranslation(key, locale)
      }

      return exists
    }
  }

  /**
   * 追踪翻译使用情况
   */
  private trackTranslation(key: string, duration: number, missing: boolean, params?: Record<string, unknown>) {
    if (!this.options.trackTranslations) return

    const currentLocale = this.i18n?.locale.value || 'unknown'

    // 更新翻译统计
    const stats = this.translationStats.get(key) || {
      key,
      count: 0,
      lastUsed: 0,
      locales: new Set(),
      missing: false,
      params: [],
      totalTime: 0
    }

    stats.count++
    stats.lastUsed = Date.now()
    stats.locales.add(currentLocale)
    stats.missing = missing
    if (params) {
      stats.params.push(params)
    }
    stats.totalTime = (stats.totalTime || 0) + duration

    this.translationStats.set(key, stats)

    // 更新性能统计
    this.performanceStats.translationCalls++
    this.performanceStats.averageTranslationTime =
      (this.performanceStats.averageTranslationTime + duration) / 2

    // 发送到 Vue DevTools
    this.sendToDevTools('translation', {
      key,
      duration,
      missing,
      locale: currentLocale,
      timestamp: Date.now()
    })

    if (this.options.verbose) {
      this.log(`翻译: ${key} (${duration.toFixed(2)}ms)`, missing ? 'warn' : 'info')
    }
  }

  /**
   * 追踪缺失的翻译
   */
  private trackMissingTranslation(key: string, locale?: string) {
    const fullKey = locale ? `${key}@${locale}` : key

    if (!this.missingTranslations.has(fullKey)) {
      this.missingTranslations.add(fullKey)

      this.sendToDevTools('missing-translation', {
        key,
        locale: locale || this.i18n?.locale.value,
        timestamp: Date.now()
      })

      console.warn(`[I18n DevTools] 缺失翻译: ${key}`, { locale })
    }
  }

  /**
   * 设置全局错误处理
   */
  private setupGlobalErrorHandling() {
    if (typeof window !== 'undefined') {
      // 设置全局缺失翻译处理器
      (window as any).__I18N_MISSING_HANDLER__ = (data: any) => {
        this.sendToDevTools('missing-report', data)
        this.log('收到缺失翻译报告', 'warn', data)
      }
    }
  }

  /**
   * 发送数据到 Vue DevTools
   */
  private sendToDevTools(event: string, data: any) {
    if (typeof window === 'undefined') return

    const hook = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__
    if (!hook) return

    hook.addTimelineEvent({
      layerId: 'i18n',
      event: {
        time: Date.now(),
        title: event,
        data
      }
    })
  }

  /**
   * 获取翻译统计
   */
  getTranslationStats() {
    return {
      translations: Array.from(this.translationStats.values()),
      performance: this.performanceStats,
      missing: Array.from(this.missingTranslations),
      summary: {
        totalTranslations: this.translationStats.size,
        totalCalls: this.performanceStats.translationCalls,
        missingCount: this.missingTranslations.size,
        averageTime: this.performanceStats.averageTranslationTime
      }
    }
  }

  /**
   * 翻译覆盖率分析
   */
  analyzeCoverage() {
    if (!this.i18n) return null

    const allKeys = new Set<string>()
    const usedKeys = new Set(this.translationStats.keys())

    // 获取所有可用的翻译键
    const availableLocales = this.i18n.getAvailableLanguages()

    // 这里需要实现获取所有键的逻辑
    // 由于无法直接访问所有键，我们使用已使用的键作为基础
    const coverage = {
      total: Math.max(allKeys.size, usedKeys.size),
      used: usedKeys.size,
      unused: Math.max(0, allKeys.size - usedKeys.size),
      percentage: allKeys.size > 0 ? (usedKeys.size / allKeys.size) * 100 : 100,
      unusedKeys: Array.from(allKeys).filter(key => !usedKeys.has(key)),
      locales: availableLocales
    }

    this.log('翻译覆盖率分析完成', 'info', coverage)
    return coverage
  }

  /**
   * 翻译质量检查
   */
  checkQuality() {
    const issues: Array<{
      type: 'missing_interpolation' | 'unused_interpolation' | 'inconsistent_format' | 'empty_translation'
      key: string
      locale?: string
      message: string
    }> = []

    // 检查翻译统计中的问题
    this.translationStats.forEach((stats, key) => {
      // 检查是否有缺失的翻译
      if (stats.missing) {
        issues.push({
          type: 'empty_translation',
          key,
          message: '翻译内容为空或缺失'
        })
      }

      // 检查插值参数的一致性
      const paramSets = stats.params
      if (paramSets.length > 1) {
        const firstParams = Object.keys(paramSets[0] || {}).sort()
        const inconsistent = paramSets.some(params => {
          const currentParams = Object.keys(params || {}).sort()
          return JSON.stringify(firstParams) !== JSON.stringify(currentParams)
        })

        if (inconsistent) {
          issues.push({
            type: 'inconsistent_format',
            key,
            message: '插值参数在不同调用中不一致'
          })
        }
      }
    })

    this.log(`翻译质量检查完成，发现 ${issues.length} 个问题`, issues.length > 0 ? 'warn' : 'info', issues)
    return issues
  }

  /**
   * 生成开发报告
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      translations: {
        total: this.translationStats.size,
        details: Array.from(this.translationStats.entries()).map(([key, data]) => ({
          key,
          count: data.count,
          lastUsed: data.lastUsed,
          missing: data.missing,
          locales: Array.from(data.locales),
          avgParams: data.params.length
        }))
      },
      missing: {
        total: this.missingTranslations.size,
        keys: Array.from(this.missingTranslations)
      },
      performance: {
        ...this.performanceStats,
        slowestTranslations: Array.from(this.translationStats.entries())
          .sort(([, a], [, b]) => (b.totalTime || 0) - (a.totalTime || 0))
          .slice(0, 10)
          .map(([key, data]) => ({
            key,
            avgTime: (data.totalTime || 0) / data.count,
            count: data.count
          }))
      },
      coverage: this.options.trackCoverage ? this.analyzeCoverage() : null,
      quality: this.options.trackQuality ? this.checkQuality() : null
    }

    this.log('开发报告生成完成', 'info', {
      translations: report.translations.total,
      missing: report.missing.total,
      avgTime: report.performance.averageTranslationTime
    })

    return report
  }

  /**
   * 清除统计数据
   */
  clearStats() {
    this.translationStats.clear()
    this.missingTranslations.clear()
    this.performanceStats = {
      translationCalls: 0,
      averageTranslationTime: 0,
      cacheHitRate: 0,
      languageChanges: 0
    }
    this.log('统计数据已清除')
  }

  /**
   * 日志输出
   */
  private log(message: string, level: 'info' | 'warn' | 'error' = 'info', data?: any) {
    if (!this.options.verbose && level === 'info') return

    const prefix = '[I18n DevTools]'
    const args = data ? [message, data] : [message]

    switch (level) {
      case 'warn':
        console.warn(prefix, ...args)
        break
      case 'error':
        console.error(prefix, ...args)
        break
      default:
        console.log(prefix, ...args)
    }
  }
}

/**
 * 全局 DevTools 实例
 */
let devToolsInstance: I18nDevTools | null = null

/**
 * 安装 I18n DevTools
 */
export function installI18nDevTools(app: App, i18n: VueI18n, options?: DevToolsOptions) {
  if (devToolsInstance) {
    console.warn('[I18n DevTools] 已经安装过 DevTools')
    return devToolsInstance
  }

  devToolsInstance = new I18nDevTools(options)
  devToolsInstance.install(app, i18n)

  return devToolsInstance
}

/**
 * 获取 DevTools 实例
 */
export function getI18nDevTools(): I18nDevTools | null {
  return devToolsInstance
}

/**
 * 导出类型（仅导出本地定义的类型）
 */
// DevToolsOptions 已在本文件中定义，不需要重复导出
// export type {
//   DevToolsOptions
// }
