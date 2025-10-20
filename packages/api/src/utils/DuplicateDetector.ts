/**
 * 请求重复检测工具
 * 检测和防止短时间内的重复请求
 */

/**
 * 请求记录
 */
interface RequestRecord {
  key: string
  timestamp: number
  count: number
}

/**
 * 重复检测配置
 */
export interface DuplicateDetectorConfig {
  /** 检测时间窗口（毫秒） */
  timeWindow?: number
  /** 时间窗口内允许的最大重复次数 */
  maxDuplicates?: number
  /** 是否启用 */
  enabled?: boolean
  /** 是否自动清理过期记录 */
  autoCleanup?: boolean
  /** 清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 重复检测统计
 */
export interface DuplicateStats {
  /** 总请求数 */
  totalRequests: number
  /** 重复请求数 */
  duplicateRequests: number
  /** 被阻止的请求数 */
  blockedRequests: number
  /** 当前追踪的请求数 */
  trackedRequests: number
  /** 重复率 */
  duplicateRate: number
}

/**
 * 请求重复检测器
 */
export class DuplicateDetector {
  private config: Required<DuplicateDetectorConfig>
  private records = new Map<string, RequestRecord>()
  private stats = {
    totalRequests: 0,
    duplicateRequests: 0,
    blockedRequests: 0,
  }

  private cleanupTimer: ReturnType<typeof setInterval> | null = null

  constructor(config: DuplicateDetectorConfig = {}) {
    this.config = {
      timeWindow: 1000, // 1秒
      maxDuplicates: 1, // 允许1次重复
      enabled: true,
      autoCleanup: true,
      cleanupInterval: 5000, // 5秒清理一次
      ...config,
    }

    if (this.config?.autoCleanup) {
      this.startCleanup()
    }
  }

  /**
   * 检测请求是否重复
   */
  isDuplicate(key: string): boolean {
    if (!this.config?.enabled) {
      return false
    }

    this.stats.totalRequests++

    const now = Date.now()
    const record = this.records.get(key)

    if (!record) {
      // 首次请求
      this.records.set(key, {
        key,
        timestamp: now,
        count: 1,
      })
      return false
    }

    // 检查是否在时间窗口内
    const elapsed = now - record.timestamp

    if (elapsed > this.config?.timeWindow) {
      // 超出时间窗口，重置记录
      this.records.set(key, {
        key,
        timestamp: now,
        count: 1,
      })
      return false
    }

    // 在时间窗口内，增加计数
    record.count++
    this.stats.duplicateRequests++

    // 检查是否超过最大重复次数
    if (record.count > this.config?.maxDuplicates) {
      this.stats.blockedRequests++
      return true
    }

    return false
  }

  /**
   * 标记请求完成
   */
  markComplete(_key: string): void {
    // 可以选择立即删除记录，或等待自动清理
    // 这里选择等待自动清理以保持检测准确性
  }

  /**
   * 清除指定请求记录
   */
  clear(key: string): void {
    this.records.delete(key)
  }

  /**
   * 清除所有记录
   */
  clearAll(): void {
    this.records.clear()
  }

  /**
   * 获取统计信息
   */
  getStats(): DuplicateStats {
    return {
      ...this.stats,
      trackedRequests: this.records.size,
      duplicateRate:
        this.stats.totalRequests > 0
          ? this.stats.duplicateRequests / this.stats.totalRequests
          : 0,
    }
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      duplicateRequests: 0,
      blockedRequests: 0,
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DuplicateDetectorConfig>): void {
    Object.assign(this.config, config)

    if (config.autoCleanup !== undefined) {
      if (config.autoCleanup && !this.cleanupTimer) {
        this.startCleanup()
      }
      else if (!config.autoCleanup && this.cleanupTimer) {
        this.stopCleanup()
      }
    }

    if (config.cleanupInterval && this.cleanupTimer) {
      this.stopCleanup()
      this.startCleanup()
    }
  }

  /**
   * 启动自动清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config?.cleanupInterval)
  }

  /**
   * 停止自动清理
   */
  private stopCleanup(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * 清理过期记录
   */
  private cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, record] of this.records.entries()) {
      if (now - record.timestamp > this.config?.timeWindow) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.records.delete(key))
  }

  /**
   * 销毁检测器
   */
  destroy(): void {
    this.stopCleanup()
    this.clearAll()
    this.resetStats()
  }
}

/**
 * 创建重复检测器
 */
export function createDuplicateDetector(
  config?: DuplicateDetectorConfig,
): DuplicateDetector {
  return new DuplicateDetector(config)
}

/**
 * 全局重复检测器
 */
let globalDetector: DuplicateDetector | null = null

/**
 * 获取全局重复检测器
 */
export function getGlobalDuplicateDetector(): DuplicateDetector {
  if (!globalDetector) {
    globalDetector = new DuplicateDetector()
  }
  return globalDetector
}

/**
 * 设置全局重复检测器
 */
export function setGlobalDuplicateDetector(detector: DuplicateDetector): void {
  globalDetector = detector
}

/**
 * 便捷函数：检测重复
 */
export function checkDuplicate(key: string): boolean {
  return getGlobalDuplicateDetector().isDuplicate(key)
}
