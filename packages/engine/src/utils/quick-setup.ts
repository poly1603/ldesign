/**
 * 快速设置工具
 * 🚀 提供简化的API，让使用更简单
 */

import type { CacheConfig } from '../cache/cache-manager'
import type { LogConfig } from '../logger/logger'
import { createCacheManager } from '../cache/cache-manager'
import { createUnifiedLogger } from '../logger/logger'
import { createPerformanceManager } from '../performance/performance-manager'

/**
 * 快速创建缓存管理器 - 使用优化的默认配置
 */
export function quickCache<T = unknown>(options?: {
  maxSize?: number
  ttl?: number
  persistent?: boolean
}) {
  const config: CacheConfig<T> = {
    maxSize: options?.maxSize ?? 50, // 更小的默认缓存
    defaultTTL: options?.ttl ?? 5 * 60 * 1000, // 5分钟TTL
    strategy: 'lru' as CacheConfig<T>['strategy'],
    enableStats: false, // 默认关闭统计
    maxMemory: 5 * 1024 * 1024, // 5MB内存限制
    cleanupInterval: 30000, // 30秒清理
    layers: options?.persistent
      ? {
          localStorage: {
            enabled: true,
            prefix: 'qc_',
            maxSize: 2 * 1024 * 1024 // 2MB
          }
        }
      : {}
  }

  return createCacheManager<T>(config)
}

/**
 * 快速创建日志器 - 使用优化的默认配置
 */
export function quickLogger(options?: {
  level?: 'debug' | 'info' | 'warn' | 'error'
  console?: boolean
  prefix?: string
}) {
  const config: LogConfig = {
    level: options?.level ?? 'warn', // 生产环境默认只记录警告
    enabled: true,
    maxLogs: 50, // 减少日志存储
    console: options?.console ?? true,
    remote: false,
    file: false,
    format: 'text', // 简单格式
    timestamp: false,
    context: false,
    async: false,
    bufferSize: 20, // 小缓冲区
  }

  const logger = createUnifiedLogger(config)

  // 添加前缀支持
  if (options?.prefix) {
    const originalDebug = logger.debug.bind(logger)
    const originalInfo = logger.info.bind(logger)
    const originalWarn = logger.warn.bind(logger)
    const originalError = logger.error.bind(logger)

    logger.debug = (msg: string, ...args: unknown[]) => originalDebug(`[${options.prefix}] ${msg}`, ...args)
    logger.info = (msg: string, ...args: unknown[]) => originalInfo(`[${options.prefix}] ${msg}`, ...args)
    logger.warn = (msg: string, ...args: unknown[]) => originalWarn(`[${options.prefix}] ${msg}`, ...args)
    logger.error = (msg: string, error?: unknown, ...args: unknown[]) =>
      originalError(`[${options.prefix}] ${msg}`, error, ...args)
  }

  return logger
}

/**
 * 快速创建性能管理器 - 使用优化的默认配置
 */
export function quickPerformance(options?: {
  monitoring?: boolean
  fpsTracking?: boolean
  memoryTracking?: boolean
}) {
  const perf = createPerformanceManager({
    responseTime: { good: 200, poor: 2000 },
    fps: { good: 50, poor: 25 },
    memory: { warning: 50, critical: 100 }, // MB
    bundleSize: { warning: 250, critical: 500 } // KB
  })

  // 根据选项启动监控
  if (options?.monitoring) {
    // 延迟启动以避免初始化时的性能影响
    setTimeout(() => {
      perf.startMonitoring()
    }, 1000)
  }

  return perf
}

/**
 * 一键设置所有优化的管理器
 */
export interface QuickSetupResult {
  cache: ReturnType<typeof quickCache>
  logger: ReturnType<typeof quickLogger>
  performance: ReturnType<typeof quickPerformance>
  cleanup: () => void
}

export function quickSetup(options?: {
  cache?: Parameters<typeof quickCache>[0]
  logger?: Parameters<typeof quickLogger>[0]
  performance?: Parameters<typeof quickPerformance>[0]
}): QuickSetupResult {
  const cache = quickCache(options?.cache)
  const logger = quickLogger(options?.logger)
  const performance = quickPerformance(options?.performance)

  // 提供统一的清理方法
  const cleanup = () => {
    cache.clear()
    cache.destroy()
    performance.clearData()
    if (performance.isMonitoring()) {
      performance.stopMonitoring()
    }
    logger.clear()
    logger.destroy()
  }

  return {
    cache,
    logger,
    performance,
    cleanup
  }
}

/**
 * 创建轻量级缓存 - 最小化内存占用
 */
export function lightCache<T = unknown>() {
  return quickCache<T>({
    maxSize: 20,
    ttl: 60 * 1000, // 1分钟
    persistent: false
  })
}

/**
 * 创建轻量级日志器 - 只记录错误
 */
export function lightLogger(prefix?: string) {
  return quickLogger({
    level: 'error',
    console: true,
    prefix
  })
}

// 导出便捷的单例
let _defaultCache: ReturnType<typeof lightCache> | undefined
let _defaultLogger: ReturnType<typeof lightLogger> | undefined

export function getDefaultCache() {
  if (!_defaultCache) {
    _defaultCache = lightCache()
  }
  return _defaultCache
}

export function getDefaultLogger() {
  if (!_defaultLogger) {
    _defaultLogger = lightLogger()
  }
  return _defaultLogger
}

// 导出给 createEngineApp 使用的函数
export function createQuickLogger(options?: {
  level?: 'debug' | 'info' | 'warn' | 'error'
  maxLogs?: number
  showTimestamp?: boolean
  showContext?: boolean
  prefix?: string
}) {
  return quickLogger({
    level: options?.level,
    console: true,
    prefix: options?.prefix
  })
}

export function createQuickCacheManager<T = unknown>(options?: {
  maxSize?: number
  defaultTTL?: number
  cleanupInterval?: number
  enableMemoryLimit?: boolean
  memoryLimit?: number
}) {
  return quickCache<T>({
    maxSize: options?.maxSize,
    ttl: options?.defaultTTL,
    persistent: false
  })
}

export function createQuickPerformanceManager(options?: {
  sampleRate?: number
  monitorMemory?: boolean
  monitorNetwork?: boolean
  monitorComponents?: boolean
  reportInterval?: number
}) {
  return quickPerformance({
    monitoring: true,
    fpsTracking: options?.monitorComponents ?? false,
    memoryTracking: options?.monitorMemory ?? false
  })
}
