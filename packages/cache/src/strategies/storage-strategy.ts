import type {
  DataType,
  SetOptions,
  StorageEngine,
  StorageStrategyConfig,
  StorageStrategyResult,
} from '../types'

/**
 * 智能存储策略
 *
 * 优化版本，包含缓存和性能改进
 */
export class StorageStrategy {
  private config: Required<StorageStrategyConfig>

  // 性能优化：缓存计算结果
  private readonly strategyCache = new Map<string, StorageStrategyResult>()
  private readonly maxCacheSize = 1000
  private cacheHits = 0
  private cacheMisses = 0

  // 性能优化：预计算的权重
  private readonly engineWeights: Record<StorageEngine, number>

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

    // 预计算引擎优先级权重
    this.engineWeights = this.precomputeEngineWeights()
  }

  /**
   * 预计算引擎优先级权重
   *
   * 性能优化：避免每次计算时重复计算权重
   */
  private precomputeEngineWeights(): Record<StorageEngine, number> {
    const weights: Record<StorageEngine, number> = {
      localStorage: 0,
      sessionStorage: 0,
      cookie: 0,
      indexedDB: 0,
      memory: 0,
    }

    this.config?.enginePriority.forEach((engine, index) => {
      const priorityScore = (this.config?.enginePriority.length - index) / this.config?.enginePriority.length
      weights[engine] = 0.05 * priorityScore
    })

    return weights
  }

  /**
   * 生成缓存键
   *
   * 基于数据特征生成缓存键，用于策略结果缓存
   */
  private generateCacheKey(dataSize: number, ttl: number | undefined, dataType: DataType): string {
    return `${dataSize}:${ttl || 0}:${dataType}`
  }

  /**
   * 选择最适合的存储引擎
   *
   * 优化版本：包含结果缓存和快速路径
   */
  async selectEngine(
    key: string,
    value: any,
    options?: SetOptions,
  ): Promise<StorageStrategyResult> {
    if (!this.config?.enabled) {
      return {
        engine: this.config?.enginePriority[0],
        reason: 'Strategy disabled, using default engine',
        confidence: 0.5,
      }
    }

    // 性能优化：快速计算数据特征
    const dataType = this.getDataType(value)
    const dataSize = this.fastCalculateDataSize(value, dataType)
    const ttl = options?.ttl

    // 性能优化：检查缓存
    const cacheKey = this.generateCacheKey(dataSize, ttl, dataType)
    const cachedResult = this.strategyCache.get(cacheKey)

    if (cachedResult) {
      this.cacheHits++
      return { ...cachedResult } // 返回副本避免修改缓存
    }

    this.cacheMisses++

    // 性能优化：快速路径 - 处理常见情况
    const quickResult = this.tryQuickPath(dataSize, ttl, dataType)
    if (quickResult) {
      this.cacheResult(cacheKey, quickResult)
      return quickResult
    }

    // 完整计算路径
    const result = this.calculateFullStrategy(dataSize, ttl, dataType)
    this.cacheResult(cacheKey, result)

    return result
  }

  /**
   * 快速计算数据大小
   *
   * 性能优化：根据数据类型使用不同的计算策略
   */
  private fastCalculateDataSize(value: any, dataType: DataType): number {
    // 处理 null 和 undefined
    if (value === null || value === undefined) {
      return 4 // 估算大小
    }

    switch (dataType) {
      case 'string':
        return (value as string).length * 2 // 估算UTF-16编码
      case 'number':
        return 8 // 64位数字
      case 'boolean':
        return 1
      case 'object':
      case 'array':
        // 对于复杂对象，使用快速估算避免完整序列化
        return this.estimateObjectSize(value)
      default:
        return JSON.stringify(value).length * 2
    }
  }

  /**
   * 估算对象大小
   *
   * 性能优化：避免完整序列化，使用启发式方法
   */
  private estimateObjectSize(obj: any): number {
    if (obj === null || obj === undefined) {
      return 0
    }

    const visited = new WeakSet()

    const estimate = (value: any, depth = 0): number => {
      // 防止深度递归和循环引用
      if (depth > 10 || (typeof value === 'object' && value !== null && visited.has(value))) {
        return 100 // 估算值
      }

      if (typeof value === 'object' && value !== null) {
        visited.add(value)
      }

      switch (typeof value) {
        case 'string':
          return value.length * 2
        case 'number':
          return 8
        case 'boolean':
          return 1
        case 'object':
          if (value === null) {
            return 0
          }
          if (Array.isArray(value)) {
            return value.reduce((acc, item) => acc + estimate(item, depth + 1), 0)
          }
          return Object.keys(value).reduce((acc, key) => {
            return acc + key.length * 2 + estimate(value[key], depth + 1)
          }, 0)
        default:
          return 50 // 默认估算
      }
    }

    return estimate(obj)
  }

  /**
   * 快速路径检查
   *
   * 性能优化：处理常见情况，避免复杂计算
   */
  private tryQuickPath(dataSize: number, ttl: number | undefined, dataType: DataType): StorageStrategyResult | null {
    // 超大数据直接使用 IndexedDB
    if (dataSize > this.config?.sizeThresholds.large) {
      return {
        engine: 'indexedDB',
        reason: 'Large data size requires IndexedDB',
        confidence: 0.9,
      }
    }

    // 超短TTL使用内存
    if (ttl && ttl < 5000) {
      return {
        engine: 'memory',
        reason: 'Very short TTL, using memory for best performance',
        confidence: 0.95,
      }
    }

    // Cookie大小限制
    if (dataSize > 4096) {
      // 不能使用cookie，但不直接返回结果，让完整算法处理
      return null
    }

    // 简单类型小数据
    if (dataSize <= this.config?.sizeThresholds.small && (dataType === 'string' || dataType === 'number' || dataType === 'boolean')) {
      return {
        engine: 'localStorage',
        reason: 'Small simple data, localStorage is optimal',
        confidence: 0.8,
      }
    }

    return null // 需要完整计算
  }

  /**
   * 缓存策略结果
   *
   * 性能优化：LRU缓存管理
   */
  private cacheResult(cacheKey: string, result: StorageStrategyResult): void {
    // 简单的LRU实现：当缓存满时删除最旧的条目
    if (this.strategyCache.size >= this.maxCacheSize) {
      const firstKey = this.strategyCache.keys().next().value
      if (firstKey) {
        this.strategyCache.delete(firstKey)
      }
    }

    this.strategyCache.set(cacheKey, { ...result })
  }

  /**
   * 获取缓存统计信息
   *
   * 用于性能监控
   */
  getCacheStats(): { hits: number, misses: number, hitRate: number, cacheSize: number } {
    const total = this.cacheHits + this.cacheMisses
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      hitRate: total > 0 ? this.cacheHits / total : 0,
      cacheSize: this.strategyCache.size,
    }
  }

  /**
   * 基于数据大小选择引擎
   */
  private selectBySize(size: number): StorageEngine {
    const { sizeThresholds } = this.config

    if (size <= sizeThresholds.small) {
      return 'localStorage' // 小数据优先使用 localStorage
    }
    else if (size <= sizeThresholds.medium) {
      return 'sessionStorage' // 中等数据使用 sessionStorage
    }
    else if (size <= sizeThresholds.large) {
      return 'indexedDB' // 大数据使用 IndexedDB
    }
    else {
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
    }
    else if (ttl <= ttlThresholds.medium) {
      return 'sessionStorage' // 中期缓存使用 sessionStorage
    }
    else {
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
   * 完整策略计算
   *
   * 当快速路径无法处理时使用的完整计算逻辑
   */
  private calculateFullStrategy(dataSize: number, ttl: number | undefined, dataType: DataType): StorageStrategyResult {
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
    return this.getBestEngine(scores)
  }

  /**
   * 计算各引擎得分
   *
   * 性能优化：使用预计算的权重
   */
  private calculateEngineScores(factors: {
    sizeBasedEngine: StorageEngine
    ttlBasedEngine: StorageEngine
    typeBasedEngine: StorageEngine
    dataSize: number
    ttl?: number
    dataType: DataType
  }): Record<StorageEngine, number> {
    // 性能优化：使用预计算的基础权重
    const scores: Record<StorageEngine, number> = { ...this.engineWeights }

    // TTL权重 (50%) - 提高TTL的权重
    scores[factors.ttlBasedEngine] += 0.5

    // 大小权重 (30%)
    scores[factors.sizeBasedEngine] += 0.3

    // 数据类型权重 (15%)
    scores[factors.typeBasedEngine] += 0.15

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
    },
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
      number,
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
    scores: Record<StorageEngine, number>,
  ): string {
    const score = scores[engine]

    switch (engine) {
      case 'localStorage':
        return `选择 localStorage：适合持久化存储中小型数据 (得分: ${score.toFixed(
          2,
        )})`

      case 'sessionStorage':
        return `选择 sessionStorage：适合会话级存储中等大小数据 (得分: ${score.toFixed(
          2,
        )})`

      case 'cookie':
        return `选择 Cookie：适合需要服务器交互的小数据 (得分: ${score.toFixed(
          2,
        )})`

      case 'indexedDB':
        return `选择 IndexedDB：适合大量结构化数据存储 (得分: ${score.toFixed(
          2,
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
    if (value === null || value === undefined) { return 'string' }
    if (typeof value === 'string') { return 'string' }
    if (typeof value === 'number') { return 'number' }
    if (typeof value === 'boolean') { return 'boolean' }
    if (Array.isArray(value)) { return 'array' }
    if (value instanceof ArrayBuffer || value instanceof Uint8Array) { return 'binary' }
    return 'object'
  }

  /**
   * 计算数据大小
   */
  private calculateDataSize(value: any): number {
    try {
      const serialized = JSON.stringify(value)
      return new Blob([serialized]).size
    }
    catch {
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
        ...this.config?.sizeThresholds,
        ...config.sizeThresholds,
      },
      ttlThresholds: {
        ...this.config?.ttlThresholds,
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
