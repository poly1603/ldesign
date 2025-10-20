/**
 * 性能优化配置模块
 * 
 * 提供全局性能优化配置和预设
 */

import type { ThrottleConfig } from '../utils/event-throttle'
import type { SerializationCacheConfig } from '../utils/serialization-cache'

/**
 * 性能优化配置接口
 */
export interface PerformanceOptimizationConfig {
  /** 序列化缓存配置 */
  serializationCache?: SerializationCacheConfig
  /** 事件节流配置 */
  eventThrottle?: ThrottleConfig
  /** 是否启用批量操作优化 */
  batchOptimization?: boolean
  /** 是否启用内存优化 */
  memoryOptimization?: boolean
  /** 是否启用性能监控 */
  performanceMonitoring?: boolean
}

/**
 * 性能预设类型
 */
export type PerformancePreset = 'low' | 'balanced' | 'high' | 'extreme'

/**
 * 预设配置映射
 */
export const PERFORMANCE_PRESETS: Record<PerformancePreset, PerformanceOptimizationConfig> = {
  /**
   * 低性能模式 - 最小化内存使用和CPU开销
   * 适用于资源受限的环境
   */
  low: {
    serializationCache: {
      maxSize: 100,
      ttl: 3000,
      enableStats: false,
    },
    eventThrottle: {
      batchSize: 20,
      flushInterval: 200,
      enabled: true,
    },
    batchOptimization: true,
    memoryOptimization: true,
    performanceMonitoring: false,
  },

  /**
   * 平衡模式 - 性能和资源使用的平衡
   * 适用于大多数应用场景（默认）
   */
  balanced: {
    serializationCache: {
      maxSize: 500,
      ttl: 5000,
      enableStats: true,
    },
    eventThrottle: {
      batchSize: 10,
      flushInterval: 100,
      enabled: true,
    },
    batchOptimization: true,
    memoryOptimization: true,
    performanceMonitoring: true,
  },

  /**
   * 高性能模式 - 优先考虑性能
   * 适用于性能关键型应用
   */
  high: {
    serializationCache: {
      maxSize: 1000,
      ttl: 10000,
      enableStats: true,
    },
    eventThrottle: {
      batchSize: 5,
      flushInterval: 50,
      enabled: true,
    },
    batchOptimization: true,
    memoryOptimization: true,
    performanceMonitoring: true,
  },

  /**
   * 极致性能模式 - 最大化性能，不考虑资源开销
   * 适用于高性能计算场景
   */
  extreme: {
    serializationCache: {
      maxSize: 5000,
      ttl: 30000,
      enableStats: true,
    },
    eventThrottle: {
      batchSize: 1,
      flushInterval: 10,
      enabled: true,
    },
    batchOptimization: true,
    memoryOptimization: false, // 极致性能下不限制内存
    performanceMonitoring: true,
  },
}

/**
 * 默认性能配置
 */
export const DEFAULT_PERFORMANCE_CONFIG: PerformanceOptimizationConfig = PERFORMANCE_PRESETS.balanced

/**
 * 性能配置管理器
 */
export class PerformanceConfigManager {
  private config: PerformanceOptimizationConfig

  constructor(config?: PerformanceOptimizationConfig | PerformancePreset) {
    if (typeof config === 'string') {
      this.config = { ...PERFORMANCE_PRESETS[config] }
    }
    else if (config) {
      this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config }
    }
    else {
      this.config = { ...DEFAULT_PERFORMANCE_CONFIG }
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): Readonly<PerformanceOptimizationConfig> {
    return { ...this.config }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<PerformanceOptimizationConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 应用预设
   */
  applyPreset(preset: PerformancePreset): void {
    this.config = { ...PERFORMANCE_PRESETS[preset] }
  }

  /**
   * 重置为默认配置
   */
  reset(): void {
    this.config = { ...DEFAULT_PERFORMANCE_CONFIG }
  }

  /**
   * 获取序列化缓存配置
   */
  getSerializationCacheConfig(): SerializationCacheConfig | undefined {
    return this.config?.serializationCache
  }

  /**
   * 获取事件节流配置
   */
  getEventThrottleConfig(): ThrottleConfig | undefined {
    return this.config?.eventThrottle
  }

  /**
   * 检查是否启用批量操作优化
   */
  isBatchOptimizationEnabled(): boolean {
    return this.config?.batchOptimization ?? true
  }

  /**
   * 检查是否启用内存优化
   */
  isMemoryOptimizationEnabled(): boolean {
    return this.config?.memoryOptimization ?? true
  }

  /**
   * 检查是否启用性能监控
   */
  isPerformanceMonitoringEnabled(): boolean {
    return this.config?.performanceMonitoring ?? true
  }

  /**
   * 根据环境自动选择预设
   */
  autoSelectPreset(): PerformancePreset {
    // 检测环境
    const isBrowser = typeof window !== 'undefined'
    // eslint-disable-next-line node/prefer-global/process
    const isNode = typeof globalThis !== 'undefined' && typeof (globalThis as any).process?.versions === 'object'

    // 检测性能指标
    if (isBrowser) {
      // 浏览器环境 - 根据设备性能选择
      const memory = (performance as any).memory
      if (memory) {
        const usedMemoryPercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        if (usedMemoryPercent > 0.8) {
          return 'low' // 内存紧张，使用低性能模式
        }
      }

      // 检查硬件并发数
      const cores = navigator.hardwareConcurrency || 1
      if (cores >= 8) {
        return 'high' // 多核心，使用高性能模式
      }
      else if (cores >= 4) {
        return 'balanced' // 中等核心数
      }
      else {
        return 'low' // 少核心
      }
    }
    else if (isNode) {
      // Node.js 环境 - 根据内存和CPU选择
      try {
        const os = (globalThis as any).require?.('node:os')
        const totalMemory = os.totalmem()
        const freeMemory = os.freemem()
        const cpuCount = os.cpus().length

        const memoryUsage = 1 - (freeMemory / totalMemory)

        if (cpuCount >= 8 && memoryUsage < 0.7) {
          return 'extreme' // 高配服务器
        }
        else if (cpuCount >= 4 && memoryUsage < 0.8) {
          return 'high' // 中高配
        }
        else if (cpuCount >= 2) {
          return 'balanced' // 中配
        }
        else {
          return 'low' // 低配
        }
      }
      catch {
        return 'balanced' // 默认平衡模式
      }
    }

    return 'balanced' // 默认平衡模式
  }

  /**
   * 导出配置为JSON
   */
  toJSON(): string {
    return JSON.stringify(this.config, null, 2)
  }

  /**
   * 从JSON加载配置
   */
  fromJSON(json: string): void {
    try {
      const config = JSON.parse(json)
      this.config = { ...DEFAULT_PERFORMANCE_CONFIG, ...config }
    }
    catch (error) {
      console.error('Failed to load performance config from JSON:', error)
    }
  }
}

/**
 * 创建性能配置管理器
 */
export function createPerformanceConfig(
  config?: PerformanceOptimizationConfig | PerformancePreset,
): PerformanceConfigManager {
  return new PerformanceConfigManager(config)
}

/**
 * 全局性能配置实例
 */
export const globalPerformanceConfig = createPerformanceConfig()

/**
 * 获取当前性能配置
 */
export function getPerformanceConfig(): Readonly<PerformanceOptimizationConfig> {
  return globalPerformanceConfig.getConfig()
}

/**
 * 更新全局性能配置
 */
export function updatePerformanceConfig(config: Partial<PerformanceOptimizationConfig>): void {
  globalPerformanceConfig.updateConfig(config)
}

/**
 * 应用性能预设
 */
export function applyPerformancePreset(preset: PerformancePreset): void {
  globalPerformanceConfig.applyPreset(preset)
}

/**
 * 自动配置性能
 */
export function autoConfigurePerformance(): PerformancePreset {
  const preset = globalPerformanceConfig.autoSelectPreset()
  globalPerformanceConfig.applyPreset(preset)
  return preset
}
