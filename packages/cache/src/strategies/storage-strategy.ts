import type {
  StorageStrategyConfig,
  StorageStrategyResult,
  StorageEngine,
  SetOptions,
  DataType,
} from '../types'

/**
 * 智能存储策略
 */
export class StorageStrategy {
  private config: Required<StorageStrategyConfig>

  constructor(config?: Partial<StorageStrategyConfig>) {
    this.config = {
      enabled: config?.enabled ?? true,
      sizeThresholds: {
        small: 1024, // 1KB
        medium: 64 * 1024, // 64KB
        large: 1024 * 1024, // 1MB
        ...config?.sizeThresholds,
      },
      ttlThresholds: {
        short: 5 * 60 * 1000, // 5分钟
        medium: 24 * 60 * 60 * 1000, // 24小时
        long: 7 * 24 * 60 * 60 * 1000, // 7天
        ...config?.ttlThresholds,
      },
      enginePriority: config?.enginePriority || [
        'localStorage',
        'sessionStorage',
        'indexedDB',
        'memory',
        'cookie',
      ],
    }
  }

  /**
   * 选择最适合的存储引擎
   */
  async selectEngine(
    key: string,
    value: any,
    options?: SetOptions
  ): Promise<StorageStrategyResult> {
    if (!this.config.enabled) {
      return {
        engine: this.config.enginePriority[0],
        reason: 'Strategy disabled, using default engine',
        confidence: 0.5,
      }
    }

    const dataType = this.getDataType(value)
    const dataSize = this.calculateDataSize(value)
    const ttl = options?.ttl

    // 基于数据大小的策略
    const sizeBasedEngine = this.selectBySize(dataSize)

    // 基于TTL的策略
    const ttlBasedEngine = this.selectByTTL(ttl)

    // 基于数据类型的策略
    const typeBasedEngine = this.selectByDataType(dataType)

    // 综合评分
    const scores = this.calculateEngineScores({
      sizeBasedEngine,
      ttlBasedEngine,
      typeBasedEngine,
      dataSize,
      ttl,
      dataType,
    })

    // 选择得分最高的引擎
    const bestEngine = this.getBestEngine(scores)

    return {
      engine: bestEngine.engine,
      reason: bestEngine.reason,
      confidence: bestEngine.confidence,
    }
  }

  /**
   * 基于数据大小选择引擎
   */
  private selectBySize(size: number): StorageEngine {
    const { sizeThresholds } = this.config

    if (size <= sizeThresholds.small) {
      return 'localStorage' // 小数据优先使用 localStorage
    } else if (size <= sizeThresholds.medium) {
      return 'sessionStorage' // 中等数据使用 sessionStorage
    } else if (size <= sizeThresholds.large) {
      return 'indexedDB' // 大数据使用 IndexedDB
    } else {
      return 'indexedDB' // 超大数据也使用 IndexedDB
    }
  }

  /**
   * 基于TTL选择引擎
   */
  private selectByTTL(ttl?: number): StorageEngine {
    if (!ttl) {
      return 'localStorage' // 永久存储使用 localStorage
    }

    const { ttlThresholds } = this.config

    if (ttl <= ttlThresholds.short) {
      return 'memory' // 短期缓存使用内存
    } else if (ttl <= ttlThresholds.medium) {
      return 'sessionStorage' // 中期缓存使用 sessionStorage
    } else {
      return 'localStorage' // 长期缓存使用 localStorage
    }
  }

  /**
   * 基于数据类型选择引擎
   */
  private selectByDataType(dataType: DataType): StorageEngine {
    switch (dataType) {
      case 'string':
      case 'number':
      case 'boolean':
        return 'localStorage' // 简单类型优先使用 localStorage

      case 'object':
      case 'array':
        return 'indexedDB' // 复杂对象使用 IndexedDB

      case 'binary':
        return 'indexedDB' // 二进制数据使用 IndexedDB

      default:
        return 'localStorage'
    }
  }

  /**
   * 计算各引擎得分
   */
  private calculateEngineScores(factors: {
    sizeBasedEngine: StorageEngine
    ttlBasedEngine: StorageEngine
    typeBasedEngine: StorageEngine
    dataSize: number
    ttl?: number
    dataType: DataType
  }): Record<StorageEngine, number> {
    const scores: Record<StorageEngine, number> = {
      localStorage: 0,
      sessionStorage: 0,
      cookie: 0,
      indexedDB: 0,
      memory: 0,
    }

    // TTL权重 (50%) - 提高TTL的权重
    scores[factors.ttlBasedEngine] += 0.5

    // 大小权重 (30%)
    scores[factors.sizeBasedEngine] += 0.3

    // 数据类型权重 (15%)
    scores[factors.typeBasedEngine] += 0.15

    // 引擎优先级权重 (5%)
    this.config.enginePriority.forEach((engine, index) => {
      const priorityScore =
        (this.config.enginePriority.length - index) /
        this.config.enginePriority.length
      scores[engine] += 0.05 * priorityScore
    })

    // 特殊情况调整
    this.applySpecialRules(scores, factors)

    return scores
  }

  /**
   * 应用特殊规则
   */
  private applySpecialRules(
    scores: Record<StorageEngine, number>,
    factors: {
      dataSize: number
      ttl?: number
      dataType: DataType
    }
  ): void {
    // Cookie 大小限制严格
    if (factors.dataSize > 4 * 1024) {
      scores.cookie = 0
    }

    // 二进制数据不适合 Cookie
    if (factors.dataType === 'binary') {
      scores.cookie = 0
    }

    // 非常短期的数据优先使用内存
    if (factors.ttl && factors.ttl < 5000) {
      // 小于5秒
      scores.memory += 0.8
      scores.localStorage -= 0.3
      scores.sessionStorage -= 0.3
    }

    // 大数据优先使用 IndexedDB
    if (factors.dataSize > 100 * 1024) {
      // 大于100KB
      scores.indexedDB += 0.5
      scores.localStorage -= 0.3
      scores.sessionStorage -= 0.3
    }

    // 复杂对象和数组优先使用 IndexedDB
    if (factors.dataType === 'object' || factors.dataType === 'array') {
      scores.indexedDB += 0.6
      scores.localStorage -= 0.4
      scores.sessionStorage -= 0.2
    }
  }

  /**
   * 获取最佳引擎
   */
  private getBestEngine(scores: Record<StorageEngine, number>): {
    engine: StorageEngine
    reason: string
    confidence: number
  } {
    let bestEngine: StorageEngine = 'localStorage'
    let bestScore = 0

    for (const [engine, score] of Object.entries(scores) as [
      StorageEngine,
      number
    ][]) {
      if (score > bestScore) {
        bestScore = score
        bestEngine = engine
      }
    }

    const reason = this.generateReason(bestEngine, scores)
    const confidence = Math.min(bestScore, 1.0)

    return { engine: bestEngine, reason, confidence }
  }

  /**
   * 生成选择原因
   */
  private generateReason(
    engine: StorageEngine,
    scores: Record<StorageEngine, number>
  ): string {
    const score = scores[engine]

    switch (engine) {
      case 'localStorage':
        return `选择 localStorage：适合持久化存储中小型数据 (得分: ${score.toFixed(
          2
        )})`

      case 'sessionStorage':
        return `选择 sessionStorage：适合会话级存储中等大小数据 (得分: ${score.toFixed(
          2
        )})`

      case 'cookie':
        return `选择 Cookie：适合需要服务器交互的小数据 (得分: ${score.toFixed(
          2
        )})`

      case 'indexedDB':
        return `选择 IndexedDB：适合大量结构化数据存储 (得分: ${score.toFixed(
          2
        )})`

      case 'memory':
        return `选择内存缓存：适合临时高频访问数据 (得分: ${score.toFixed(2)})`

      default:
        return `选择 ${engine} (得分: ${score.toFixed(2)})`
    }
  }

  /**
   * 获取数据类型
   */
  private getDataType(value: any): DataType {
    if (value === null || value === undefined) return 'string'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'number') return 'number'
    if (typeof value === 'boolean') return 'boolean'
    if (Array.isArray(value)) return 'array'
    if (value instanceof ArrayBuffer || value instanceof Uint8Array)
      return 'binary'
    return 'object'
  }

  /**
   * 计算数据大小
   */
  private calculateDataSize(value: any): number {
    try {
      const serialized = JSON.stringify(value)
      return new Blob([serialized]).size
    } catch {
      return 0
    }
  }

  /**
   * 更新策略配置
   */
  updateConfig(config: Partial<StorageStrategyConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      sizeThresholds: {
        ...this.config.sizeThresholds,
        ...config.sizeThresholds,
      },
      ttlThresholds: {
        ...this.config.ttlThresholds,
        ...config.ttlThresholds,
      },
    }
  }

  /**
   * 获取当前配置
   */
  getConfig(): StorageStrategyConfig {
    return { ...this.config }
  }
}
