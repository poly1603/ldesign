/**
 * API Engine 健康检查器
 * 提供系统健康状态监控和诊断功能
 */

export interface HealthCheckConfig {
  /** 是否启用 */
  enabled?: boolean
  /** 检查间隔（毫秒） */
  interval?: number
  /** 超时阈值（毫秒） */
  timeoutThreshold?: number
  /** 错误率阈值（0-1） */
  errorRateThreshold?: number
  /** 内存使用阈值（字节） */
  memoryThreshold?: number
}

export interface HealthStatus {
  /** 健康状态 */
  status: 'healthy' | 'degraded' | 'unhealthy'
  /** 检查时间 */
  timestamp: number
  /** 详细信息 */
  details: {
    /** 平均响应时间 */
    avgResponseTime: number
    /** 错误率 */
    errorRate: number
    /** 内存使用情况 */
    memoryUsage: number
    /** 活跃请求数 */
    activeRequests: number
    /** 缓存命中率 */
    cacheHitRate: number
  }
  /** 问题列表 */
  issues: Array<{
    severity: 'warning' | 'critical'
    message: string
    metric: string
    value: number
    threshold: number
  }>
}

export interface HealthMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  totalResponseTime: number
  activeRequests: number
  cacheHits: number
  cacheMisses: number
}

/**
 * 健康检查器实现
 */
export class HealthChecker {
  private config: Required<HealthCheckConfig>
  private metrics: HealthMetrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalResponseTime: 0,
    activeRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
  }

  private checkTimer: ReturnType<typeof setInterval> | null = null
  private lastStatus: HealthStatus | null = null
  private listeners: Array<(status: HealthStatus) => void> = []

  constructor(config: HealthCheckConfig = {}) {
    this.config = {
      enabled: true,
      interval: 30000, // 30秒
      timeoutThreshold: 5000, // 5秒
      errorRateThreshold: 0.1, // 10%
      memoryThreshold: 100 * 1024 * 1024, // 100MB
      ...config,
    }

    if (this.config?.enabled) {
      this.startHealthCheck()
    }
  }

  /**
   * 记录请求开始
   */
  requestStart(): void {
    this.metrics.activeRequests++
    this.metrics.totalRequests++
  }

  /**
   * 记录请求成功
   */
  requestSuccess(responseTime: number): void {
    this.metrics.activeRequests--
    this.metrics.successfulRequests++
    this.metrics.totalResponseTime += responseTime
  }

  /**
   * 记录请求失败
   */
  requestFailure(responseTime: number): void {
    this.metrics.activeRequests--
    this.metrics.failedRequests++
    this.metrics.totalResponseTime += responseTime
  }

  /**
   * 记录缓存命中
   */
  cacheHit(): void {
    this.metrics.cacheHits++
  }

  /**
   * 记录缓存未命中
   */
  cacheMiss(): void {
    this.metrics.cacheMisses++
  }

  /**
   * 执行健康检查
   */
  check(): HealthStatus {
    const now = Date.now()
    const issues: HealthStatus['issues'] = []

    // 计算指标
    const totalRequests = this.metrics.totalRequests || 1
    const avgResponseTime
      = totalRequests > 0 ? this.metrics.totalResponseTime / totalRequests : 0
    const errorRate
      = totalRequests > 0 ? this.metrics.failedRequests / totalRequests : 0
    const cacheHitRate
      = this.metrics.cacheHits + this.metrics.cacheMisses > 0
        ? this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses)
        : 0

    // 估算内存使用（简化版）
    const memoryUsage = this.estimateMemoryUsage()

    // 检查平均响应时间
    if (avgResponseTime > this.config?.timeoutThreshold) {
      issues.push({
        severity: avgResponseTime > this.config?.timeoutThreshold * 2 ? 'critical' : 'warning',
        message: 'Average response time is too high',
        metric: 'avgResponseTime',
        value: avgResponseTime,
        threshold: this.config?.timeoutThreshold,
      })
    }

    // 检查错误率
    if (errorRate > this.config?.errorRateThreshold) {
      issues.push({
        severity: errorRate > this.config?.errorRateThreshold * 2 ? 'critical' : 'warning',
        message: 'Error rate is too high',
        metric: 'errorRate',
        value: errorRate,
        threshold: this.config?.errorRateThreshold,
      })
    }

    // 检查内存使用
    if (memoryUsage > this.config?.memoryThreshold) {
      issues.push({
        severity: memoryUsage > this.config?.memoryThreshold * 1.5 ? 'critical' : 'warning',
        message: 'Memory usage is too high',
        metric: 'memoryUsage',
        value: memoryUsage,
        threshold: this.config?.memoryThreshold,
      })
    }

    // 确定健康状态
    let status: HealthStatus['status'] = 'healthy'
    if (issues.length > 0) {
      const hasCritical = issues.some(issue => issue.severity === 'critical')
      status = hasCritical ? 'unhealthy' : 'degraded'
    }

    const healthStatus: HealthStatus = {
      status,
      timestamp: now,
      details: {
        avgResponseTime,
        errorRate,
        memoryUsage,
        activeRequests: this.metrics.activeRequests,
        cacheHitRate,
      },
      issues,
    }

    this.lastStatus = healthStatus
    this.notifyListeners(healthStatus)

    return healthStatus
  }

  /**
   * 获取最后的健康状态
   */
  getLastStatus(): HealthStatus | null {
    return this.lastStatus
  }

  /**
   * 添加状态变化监听器
   */
  onStatusChange(listener: (status: HealthStatus) => void): () => void {
    this.listeners.push(listener)

    // 返回取消监听的函数
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(status: HealthStatus): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status)
      }
      catch (error) {
        console.error('Error in health status listener:', error)
      }
    })
  }

  /**
   * 启动健康检查
   */
  private startHealthCheck(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
    }

    // 立即执行一次检查
    this.check()

    // 定期检查
    this.checkTimer = setInterval(() => {
      this.check()
    }, this.config?.interval)
  }

  /**
   * 停止健康检查
   */
  stopHealthCheck(): void {
    if (this.checkTimer) {
      clearInterval(this.checkTimer)
      this.checkTimer = null
    }
  }

  /**
   * 重置统计数据
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      totalResponseTime: 0,
      activeRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
    }
  }

  /**
   * 获取当前指标
   */
  getMetrics(): HealthMetrics {
    return { ...this.metrics }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<HealthCheckConfig>): void {
    Object.assign(this.config, config)

    if (config.enabled !== undefined) {
      if (config.enabled) {
        this.startHealthCheck()
      }
      else {
        this.stopHealthCheck()
      }
    }
    else if (config.interval !== undefined) {
      // 重启检查以应用新的间隔
      if (this.config?.enabled) {
        this.startHealthCheck()
      }
    }
  }

  /**
   * 估算内存使用（简化版）
   */
  private estimateMemoryUsage(): number {
    // 在浏览器环境中尝试使用 performance.memory
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize || 0
    }

    // 在 Node.js 环境中尝试使用 process.memoryUsage
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed
    }

    // 无法获取内存信息，返回0
    return 0
  }

  /**
   * 生成健康报告
   */
  generateReport(): {
    summary: string
    status: HealthStatus
    recommendations: string[]
  } {
    const status = this.lastStatus || this.check()
    const recommendations: string[] = []

    // 生成建议
    status.issues.forEach((issue) => {
      switch (issue.metric) {
        case 'avgResponseTime':
          recommendations.push(
            'Consider enabling caching or optimizing slow API endpoints',
          )
          break
        case 'errorRate':
          recommendations.push(
            'Review error logs and implement retry strategies',
          )
          break
        case 'memoryUsage':
          recommendations.push(
            'Consider reducing cache size or implementing memory cleanup',
          )
          break
      }
    })

    // 生成总结
    const summary = `Health Status: ${status.status.toUpperCase()} - ${status.issues.length} issue(s) detected`

    return {
      summary,
      status,
      recommendations: [...new Set(recommendations)], // 去重
    }
  }

  /**
   * 销毁健康检查器
   */
  destroy(): void {
    this.stopHealthCheck()
    this.listeners = []
    this.resetMetrics()
  }
}

/**
 * 创建健康检查器
 */
export function createHealthChecker(config?: HealthCheckConfig): HealthChecker {
  return new HealthChecker(config)
}
