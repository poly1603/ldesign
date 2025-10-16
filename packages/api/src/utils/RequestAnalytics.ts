/**
 * 请求统计和分析
 * 提供详细的请求统计、性能分析和异常监控
 */

/**
 * 请求记录
 */
export interface RequestRecord {
  /** 请求ID */
  id: string
  /** 方法名 */
  methodName: string
  /** 开始时间 */
  startTime: number
  /** 结束时间 */
  endTime?: number
  /** 持续时间（毫秒） */
  duration?: number
  /** 状态 */
  status: 'pending' | 'success' | 'error' | 'cancelled'
  /** 错误信息 */
  error?: string
  /** 是否来自缓存 */
  fromCache?: boolean
  /** 重试次数 */
  retryCount?: number
  /** 请求大小（字节） */
  requestSize?: number
  /** 响应大小（字节） */
  responseSize?: number
}

/**
 * 方法统计
 */
export interface MethodStats {
  /** 方法名 */
  methodName: string
  /** 总请求数 */
  totalRequests: number
  /** 成功请求数 */
  successRequests: number
  /** 失败请求数 */
  errorRequests: number
  /** 取消请求数 */
  cancelledRequests: number
  /** 缓存命中数 */
  cacheHits: number
  /** 平均响应时间（毫秒） */
  averageResponseTime: number
  /** 最小响应时间（毫秒） */
  minResponseTime: number
  /** 最大响应时间（毫秒） */
  maxResponseTime: number
  /** 成功率 */
  successRate: number
  /** 最后请求时间 */
  lastRequestTime: number
}

/**
 * 请求分析配置
 */
export interface RequestAnalyticsConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 最大记录数 */
  maxRecords?: number
  /** 记录保留时间（毫秒） */
  recordRetention?: number
  /** 是否记录请求详情 */
  recordDetails?: boolean
  /** 自动清理间隔（毫秒） */
  cleanupInterval?: number
}

/**
 * 请求分析器
 */
export class RequestAnalytics {
  private config: Required<RequestAnalyticsConfig>
  private records: RequestRecord[] = []
  private methodStats = new Map<string, MethodStats>()
  private cleanupTimer?: ReturnType<typeof setInterval>

  constructor(config: RequestAnalyticsConfig = {}) {
    this.config = {
      enabled: true,
      maxRecords: 1000,
      recordRetention: 60 * 60 * 1000, // 1小时
      recordDetails: true,
      cleanupInterval: 5 * 60 * 1000, // 5分钟
      ...config,
    }

    if (this.config?.enabled && this.config?.cleanupInterval > 0) {
      this.startCleanup()
    }
  }

  /**
   * 开始记录请求
   */
  startRequest(id: string, methodName: string): void {
    if (!this.config?.enabled) {
      return
    }

    const record: RequestRecord = {
      id,
      methodName,
      startTime: Date.now(),
      status: 'pending',
    }

    if (this.config?.recordDetails) {
      this.records.push(record)

      // 限制记录数量
      if (this.records.length > this.config?.maxRecords) {
        this.records.shift()
      }
    }

    // 初始化方法统计
    if (!this.methodStats.has(methodName)) {
      this.methodStats.set(methodName, {
        methodName,
        totalRequests: 0,
        successRequests: 0,
        errorRequests: 0,
        cancelledRequests: 0,
        cacheHits: 0,
        averageResponseTime: 0,
        minResponseTime: Number.POSITIVE_INFINITY,
        maxResponseTime: 0,
        successRate: 0,
        lastRequestTime: Date.now(),
      })
    }

    const stats = this.methodStats.get(methodName)!
    stats.totalRequests++
    stats.lastRequestTime = Date.now()
  }

  /**
   * 结束请求（成功）
   */
  endRequest(
    id: string,
    options: {
      fromCache?: boolean
      retryCount?: number
      requestSize?: number
      responseSize?: number
    } = {},
  ): void {
    if (!this.config?.enabled) {
      return
    }

    const record = this.findRecord(id)
    if (!record) {
      return
    }

    const endTime = Date.now()
    const duration = endTime - record.startTime

    record.endTime = endTime
    record.duration = duration
    record.status = 'success'
    record.fromCache = options.fromCache
    record.retryCount = options.retryCount
    record.requestSize = options.requestSize
    record.responseSize = options.responseSize

    // 更新方法统计
    const stats = this.methodStats.get(record.methodName)
    if (stats) {
      stats.successRequests++
      if (options.fromCache) {
        stats.cacheHits++
      }

      // 更新响应时间统计
      this.updateResponseTimeStats(stats, duration)
      this.updateSuccessRate(stats)
    }
  }

  /**
   * 结束请求（失败）
   */
  endRequestWithError(id: string, error: string): void {
    if (!this.config?.enabled) {
      return
    }

    const record = this.findRecord(id)
    if (!record) {
      return
    }

    const endTime = Date.now()
    const duration = endTime - record.startTime

    record.endTime = endTime
    record.duration = duration
    record.status = 'error'
    record.error = error

    // 更新方法统计
    const stats = this.methodStats.get(record.methodName)
    if (stats) {
      stats.errorRequests++
      this.updateSuccessRate(stats)
    }
  }

  /**
   * 取消请求
   */
  cancelRequest(id: string): void {
    if (!this.config?.enabled) {
      return
    }

    const record = this.findRecord(id)
    if (!record) {
      return
    }

    const endTime = Date.now()
    const duration = endTime - record.startTime

    record.endTime = endTime
    record.duration = duration
    record.status = 'cancelled'

    // 更新方法统计
    const stats = this.methodStats.get(record.methodName)
    if (stats) {
      stats.cancelledRequests++
    }
  }

  /**
   * 获取方法统计
   */
  getMethodStats(methodName: string): MethodStats | null {
    return this.methodStats.get(methodName) || null
  }

  /**
   * 获取所有方法统计
   */
  getAllMethodStats(): MethodStats[] {
    return Array.from(this.methodStats.values())
  }

  /**
   * 获取总体统计
   */
  getOverallStats(): {
    totalRequests: number
    successRequests: number
    errorRequests: number
    cancelledRequests: number
    cacheHits: number
    averageResponseTime: number
    successRate: number
  } {
    let totalRequests = 0
    let successRequests = 0
    let errorRequests = 0
    let cancelledRequests = 0
    let cacheHits = 0
    let totalResponseTime = 0
    let responseTimeCount = 0

    this.methodStats.forEach((stats) => {
      totalRequests += stats.totalRequests
      successRequests += stats.successRequests
      errorRequests += stats.errorRequests
      cancelledRequests += stats.cancelledRequests
      cacheHits += stats.cacheHits

      if (stats.averageResponseTime > 0) {
        totalResponseTime += stats.averageResponseTime * stats.successRequests
        responseTimeCount += stats.successRequests
      }
    })

    return {
      totalRequests,
      successRequests,
      errorRequests,
      cancelledRequests,
      cacheHits,
      averageResponseTime:
        responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0,
      successRate:
        totalRequests > 0 ? successRequests / totalRequests : 0,
    }
  }

  /**
   * 获取最慢的请求
   */
  getSlowestRequests(limit: number = 10): RequestRecord[] {
    return this.records
      .filter(r => r.status === 'success' && r.duration !== undefined)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, limit)
  }

  /**
   * 获取失败的请求
   */
  getFailedRequests(limit?: number): RequestRecord[] {
    const failed = this.records.filter(r => r.status === 'error')
    return limit ? failed.slice(0, limit) : failed
  }

  /**
   * 清除统计数据
   */
  clear(): void {
    this.records = []
    this.methodStats.clear()
  }

  /**
   * 销毁分析器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.clear()
  }

  /**
   * 查找记录
   */
  private findRecord(id: string): RequestRecord | undefined {
    return this.records.find(r => r.id === id)
  }

  /**
   * 更新响应时间统计
   */
  private updateResponseTimeStats(stats: MethodStats, duration: number): void {
    stats.minResponseTime = Math.min(stats.minResponseTime, duration)
    stats.maxResponseTime = Math.max(stats.maxResponseTime, duration)

    // 计算移动平均
    const count = stats.successRequests
    stats.averageResponseTime
      = (stats.averageResponseTime * (count - 1) + duration) / count
  }

  /**
   * 更新成功率
   */
  private updateSuccessRate(stats: MethodStats): void {
    const total = stats.successRequests + stats.errorRequests
    stats.successRate = total > 0 ? stats.successRequests / total : 0
  }

  /**
   * 启动清理
   */
  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, this.config?.cleanupInterval)
  }

  /**
   * 清理过期记录
   */
  private cleanup(): void {
    const now = Date.now()
    const threshold = now - this.config?.recordRetention

    this.records = this.records.filter(r => r.startTime >= threshold)
  }
}

/**
 * 创建请求分析器
 */
export function createRequestAnalytics(
  config?: RequestAnalyticsConfig,
): RequestAnalytics {
  return new RequestAnalytics(config)
}

