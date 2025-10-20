/**
 * 性能优化插件
 * 提供缓存优化、性能监控和自动调优功能
 */

import type { ApiEngine, ApiPlugin } from '../types'
import type { PerformanceMonitor } from '../utils/PerformanceMonitor'
import { createPerformanceMonitor, setGlobalPerformanceMonitor } from '../utils/PerformanceMonitor'

/**
 * 性能优化插件配置
 */
export interface PerformancePluginConfig {
  /** 是否启用性能监控 */
  enableMonitoring?: boolean
  /** 性能监控配置 */
  monitoring?: {
    /** 是否收集详细指标 */
    collectDetailedMetrics?: boolean
    /** 最大保存的调用记录数 */
    maxRecords?: number
    /** 性能报告生成间隔 (毫秒) */
    reportInterval?: number
    /** 慢查询阈值 (毫秒) */
    slowQueryThreshold?: number
    /** 是否在控制台输出性能警告 */
    logWarnings?: boolean
  }
  /** 缓存优化配置 */
  cacheOptimization?: {
    /** 是否启用LRU缓存 */
    enableLRU?: boolean
    /** 是否启用缓存预热 */
    enableWarmup?: boolean
    /** 预热数据 */
    warmupData?: Array<{ key: string, data: unknown, ttl?: number }>
    /** 是否启用智能缓存 */
    enableSmartCache?: boolean
  }
  /** 自动调优配置 */
  autoTuning?: {
    /** 是否启用自动调优 */
    enabled?: boolean
    /** 调优检查间隔 (毫秒) */
    checkInterval?: number
    /** 性能阈值 */
    thresholds?: {
      /** 平均响应时间阈值 (毫秒) */
      averageResponseTime?: number
      /** 错误率阈值 */
      errorRate?: number
      /** 缓存命中率阈值 */
      cacheHitRate?: number
    }
  }
}

/**
 * 性能优化插件
 */
export function createPerformancePlugin(config: PerformancePluginConfig = {}): ApiPlugin & {
  warmupCache: (engine: ApiEngine, warmupData: Array<{ key: string, data: unknown, ttl?: number }>) => void
  startAutoTuning: (engine: ApiEngine, autoTuningConfig: NonNullable<PerformancePluginConfig['autoTuning']>) => void
  performAutoTuning: (engine: ApiEngine, thresholds: any) => void
} {
  let performanceMonitor: PerformanceMonitor | null = null
  let autoTuningTimer: NodeJS.Timeout | undefined

  return {
    name: 'performance',
    version: '1.0.0',

    async install(engine: ApiEngine) {
      // 初始化性能监控
      if (config.enableMonitoring !== false) {
        performanceMonitor = createPerformanceMonitor({
          enabled: true,
          collectDetailedMetrics: config.monitoring?.collectDetailedMetrics ?? true,
          maxRecords: config.monitoring?.maxRecords ?? 1000,
          reportInterval: config.monitoring?.reportInterval ?? 60000,
          slowQueryThreshold: config.monitoring?.slowQueryThreshold ?? 1000,
          logWarnings: config.monitoring?.logWarnings ?? true,
        })

        // 设置为全局监控器
        setGlobalPerformanceMonitor(performanceMonitor)

        // 设置到引擎
        if ('setPerformanceMonitor' in engine) {
          (engine as any).setPerformanceMonitor(performanceMonitor)
        }
      }

      // 缓存优化
      if (config.cacheOptimization?.enableLRU) {
        // 更新缓存配置为LRU
        if (engine.config.cache) {
          engine.config.cache.storage = 'lru'
        }
      }

      // 缓存预热
      if (config.cacheOptimization?.enableWarmup && config.cacheOptimization.warmupData) {
        setTimeout(() => {
          this.warmupCache(engine, config.cacheOptimization!.warmupData!)
        }, 1000) // 延迟1秒执行预热
      }

      // 启动自动调优
      if (config.autoTuning?.enabled) {
        this.startAutoTuning(engine, config.autoTuning)
      }

      // 添加性能优化中间件
      const existingRequestMiddlewares = engine.config.middlewares?.request || []
      const existingResponseMiddlewares = engine.config.middlewares?.response || []

      engine.config.middlewares = {
        ...engine.config.middlewares,
        request: [
          ...existingRequestMiddlewares,
          // 请求优化中间件
          async (config: any) => {
            // 添加请求时间戳
            config.__startTime = performance.now()
            return config
          },
        ],
        response: [
          ...existingResponseMiddlewares,
          // 响应优化中间件
          async (response: any) => {
            // 计算响应时间
            const startTime = response.config?.__startTime
            if (startTime) {
              const responseTime = performance.now() - startTime
              response.__responseTime = responseTime

              // 记录慢查询
              if (responseTime > (config.monitoring?.slowQueryThreshold ?? 1000)) {
                console.warn(`🐌 Slow response detected: ${responseTime.toFixed(2)}ms`)
              }
            }
            return response
          },
        ],
      }
    },

    async uninstall() {
      if (performanceMonitor) {
        performanceMonitor.destroy()
        performanceMonitor = null
        setGlobalPerformanceMonitor(null)
      }

      if (autoTuningTimer) {
        clearInterval(autoTuningTimer)
        autoTuningTimer = undefined
      }
    },

    // 缓存预热
    warmupCache(engine: ApiEngine, warmupData: Array<{ key: string, data: unknown, ttl?: number }>) {
      try {
        if ('cacheManager' in engine) {
          const cacheManager = (engine as any).cacheManager
          if (cacheManager && typeof cacheManager.warmup === 'function') {
            cacheManager.warmup(warmupData)
            
          }
        }
      }
      catch (error) {
        console.warn('Cache warmup failed:', error)
      }
    },

    // 启动自动调优
    startAutoTuning(engine: ApiEngine, autoTuningConfig: NonNullable<PerformancePluginConfig['autoTuning']>) {
      const checkInterval = autoTuningConfig.checkInterval ?? 5 * 60 * 1000 // 5分钟
      const thresholds = {
        averageResponseTime: 1000,
        errorRate: 0.05,
        cacheHitRate: 0.8,
        ...autoTuningConfig.thresholds,
      }

      autoTuningTimer = setInterval(() => {
        this.performAutoTuning(engine, thresholds)
      }, checkInterval)
    },

    // 执行自动调优
    performAutoTuning(engine: ApiEngine, thresholds: any) {
      if (!performanceMonitor)
        return

      try {
        const report = performanceMonitor.generateReport()
        const recommendations: string[] = []

        // 检查平均响应时间
        if (report.overall.averageTime > thresholds.averageResponseTime) {
          recommendations.push('平均响应时间过长，建议启用更积极的缓存策略')

          // 自动调整缓存TTL
          if (engine.config.cache && engine.config.cache.ttl) {
            const newTTL = Math.min(engine.config.cache.ttl * 1.5, 30 * 60 * 1000) // 最大30分钟
            engine.config.cache.ttl = newTTL
            
          }
        }

        // 检查错误率
        if (report.overall.errorRate > thresholds.errorRate) {
          recommendations.push('错误率过高，建议启用更积极的重试策略')

          // 自动调整重试配置
          if (engine.config.retry) {
            engine.config.retry.retries = Math.min((engine.config.retry.retries || 0) + 1, 5)
            engine.config.retry.delay = Math.max((engine.config.retry.delay || 0) * 1.2, 500)
            
          }
        }

        // 检查缓存命中率
        if ('cacheManager' in engine) {
          const cacheManager = (engine as any).cacheManager
          if (cacheManager && typeof cacheManager.getEnhancedStats === 'function') {
            const cacheStats = cacheManager.getEnhancedStats()
            const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses)

            if (hitRate < thresholds.cacheHitRate) {
              recommendations.push('缓存命中率过低，建议增加缓存大小或调整缓存策略')

              // 自动调整缓存大小
              if (engine.config.cache) {
                engine.config.cache.maxSize = Math.min((engine.config.cache.maxSize || 100) * 1.5, 1000)
                
              }
            }
          }
        }

        // 输出调优建议
        if (recommendations.length > 0) {
          console.group('🔧 Auto-tuning Recommendations')
          recommendations.forEach(rec => console.log(rec))
          console.groupEnd()
        }
      }
      catch (error) {
        console.warn('Auto-tuning failed:', error)
      }
    },
  }
}

/**
 * 默认性能优化插件实例
 */
export const performancePlugin = createPerformancePlugin()

/**
 * 创建带配置的性能优化插件
 */
export function withPerformance(config: PerformancePluginConfig = {}) {
  return createPerformancePlugin(config)
}

/**
 * 性能优化工具函数
 */
export const PerformanceUtils = {
  /**
   * 创建性能监控器
   */
  createMonitor: createPerformanceMonitor,

  /**
   * 获取性能报告
   */
  getReport(monitor: PerformanceMonitor) {
    return monitor.generateReport()
  },

  /**
   * 重置性能统计
   */
  resetStats(monitor: PerformanceMonitor) {
    monitor.reset()
  },

  /**
   * 检查是否为慢查询
   */
  isSlowQuery(duration: number, threshold = 1000): boolean {
    return duration > threshold
  },

  /**
   * 格式化性能指标
   */
  formatMetrics(metrics: any) {
    return {
      averageTime: `${metrics.averageTime.toFixed(2)}ms`,
      successRate: `${(metrics.successRate * 100).toFixed(1)}%`,
      callCount: metrics.callCount,
    }
  },
}
