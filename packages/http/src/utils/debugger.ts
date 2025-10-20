import type { HttpClient, HttpError, RequestConfig, ResponseData } from '../types'

/**
 * 调试日志级别
 */
export enum DebugLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

/**
 * 请求日志
 */
export interface RequestLog {
  /** 请求 ID */
  id: string
  /** 请求配置 */
  config: RequestConfig
  /** 请求时间 */
  timestamp: number
  /** 请求方法 */
  method: string
  /** 请求 URL */
  url: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求数据 */
  data?: any
}

/**
 * 响应日志
 */
export interface ResponseLog {
  /** 请求 ID */
  requestId: string
  /** 响应数据 */
  response?: ResponseData
  /** 错误信息 */
  error?: HttpError
  /** 响应时间 */
  timestamp: number
  /** 耗时（毫秒） */
  duration: number
  /** 状态码 */
  status?: number
  /** 响应大小（字节） */
  size?: number
}

/**
 * 调试事件
 */
export interface DebugEvent {
  /** 事件类型 */
  type: 'request' | 'response' | 'error' | 'cache_hit' | 'cache_miss' | 'retry' | 'custom'
  /** 事件数据 */
  data: any
  /** 事件时间 */
  timestamp: number
  /** 事件级别 */
  level: DebugLevel
}

/**
 * 调试器配置
 */
export interface DebuggerConfig {
  /** 调试级别 */
  level?: DebugLevel
  /** 是否记录请求 */
  logRequests?: boolean
  /** 是否记录响应 */
  logResponses?: boolean
  /** 是否记录请求头 */
  logHeaders?: boolean
  /** 是否记录请求体 */
  logBody?: boolean
  /** 是否记录响应体 */
  logResponseBody?: boolean
  /** 最大日志数量 */
  maxLogs?: number
  /** 是否在控制台输出 */
  console?: boolean
  /** 自定义日志处理器 */
  handler?: (event: DebugEvent) => void
  /** 是否记录性能指标 */
  performance?: boolean
  /** 是否记录缓存命中 */
  cacheTracking?: boolean
}

/**
 * 性能指标
 */
export interface PerformanceMetrics {
  /** DNS 查询时间 */
  dnsTime?: number
  /** TCP 连接时间 */
  tcpTime?: number
  /** TLS 握手时间 */
  tlsTime?: number
  /** 请求时间 */
  requestTime?: number
  /** 响应时间 */
  responseTime?: number
  /** 总时间 */
  totalTime: number
  /** 请求大小 */
  requestSize?: number
  /** 响应大小 */
  responseSize?: number
}

/**
 * HTTP 调试器
 *
 * 提供详细的请求日志、性能分析和调试功能
 *
 * @example
 * ```typescript
 * const  = new HttpDebugger({
 *   level: DebugLevel.DEBUG,
 *   logRequests: true,
 *   logResponses: true,
 *   performance: true,
 * })
 *
 * // 应用到客户端
 * .apply(httpClient)
 *
 * // 获取日志
 * const logs = .getLogs()
 *
 * // 获取性能报告
 * const report = .getPerformanceReport()
 *
 * // 导出日志
 * const exported = .exportLogs()
 * ```
 */
export class HttpDebugger {
  private config: Required<DebuggerConfig>
  private requestLogs: Map<string, RequestLog> = new Map()
  private responseLogs: ResponseLog[] = []
  private events: DebugEvent[] = []
  private performanceData: Map<string, PerformanceMetrics> = new Map()
  private isApplied = false

  constructor(config: DebuggerConfig = {}) {
    this.config = {
      level: config.level ?? DebugLevel.INFO,
      logRequests: config.logRequests ?? true,
      logResponses: config.logResponses ?? true,
      logHeaders: config.logHeaders ?? true,
      logBody: config.logBody ?? false,
      logResponseBody: config.logResponseBody ?? false,
      maxLogs: config.maxLogs ?? 1000,
      console: config.console ?? true,
      handler: config.handler || (() => {}),
      performance: config.performance ?? true,
      cacheTracking: config.cacheTracking ?? true,
    } as Required<DebuggerConfig>
  }

  /**
   * 应用到 HTTP 客户端
   */
  apply(client: HttpClient): void {
    if (this.isApplied) {
      throw new Error('HttpDebugger is already applied')
    }

    // 添加请求拦截器
    client.interceptors.request.use((config) => {
      this.logRequest(config)
      return config
    })

    // 添加响应拦截器
    client.interceptors.response.use(
      (response) => {
        this.logResponse(response)
        return response
      },
      (error) => {
        this.logError(error)
        return Promise.reject(error)
      },
    )

    this.isApplied = true
  }

  /**
   * 记录请求
   */
  private logRequest(config: RequestConfig): void {
    if (!this.config?.logRequests) {
      return
    }

    const id = this.generateId()
    const log: RequestLog = {
      id,
      config,
      timestamp: Date.now(),
      method: config.method || 'GET',
      url: config.url || '',
      headers: this.config?.logHeaders ? config.headers : undefined,
      data: this.config?.logBody ? config.data : undefined,
    }

    this.requestLogs.set(id, log)

    // 开始性能计时
    if (this.config?.performance) {
      this.performanceData.set(id, {
        totalTime: 0,
      })
    }

    // 记录事件
    this.recordEvent({
      type: 'request',
      data: log,
      timestamp: Date.now(),
      level: DebugLevel.DEBUG,
    })

    // 控制台输出
    if (this.config?.console && this.config?.level >= DebugLevel.DEBUG) {
      console.debug(`[HTTP Request] ${config.method} ${config.url}`, log)
    }
  }

  /**
   * 记录响应
   */
  private logResponse(response: ResponseData): void {
    if (!this.config?.logResponses) {
      return
    }

    const requestId = this.findRequestId(response.config)
    const requestLog = requestId ? this.requestLogs.get(requestId) : null
    const timestamp = Date.now()
    const duration = requestLog ? timestamp - requestLog.timestamp : 0

    const log: ResponseLog = {
      requestId: requestId || 'unknown',
      response: this.config?.logResponseBody ? response : {
        ...response,
        data: '[Response Body Hidden]',
      },
      timestamp,
      duration,
      status: response.status,
      size: this.estimateSize(response.data),
    }

    this.responseLogs.push(log)
    this.trimLogs()

    // 更新性能数据
    if (this.config?.performance && requestId) {
      const metrics = this.performanceData.get(requestId)
      if (metrics) {
        metrics.totalTime = duration
        metrics.responseSize = log.size
      }
    }

    // 记录事件
    this.recordEvent({
      type: 'response',
      data: log,
      timestamp,
      level: DebugLevel.DEBUG,
    })

    // 控制台输出
    if (this.config?.console && this.config?.level >= DebugLevel.DEBUG) {
      console.debug(`[HTTP Response] ${response.config.method} ${response.config.url} - ${response.status} (${duration}ms)`, log)
    }
  }

  /**
   * 记录错误
   */
  private logError(error: HttpError): void {
    const requestId = error.config ? this.findRequestId(error.config) : null
    const requestLog = requestId ? this.requestLogs.get(requestId) : null
    const timestamp = Date.now()
    const duration = requestLog ? timestamp - requestLog.timestamp : 0

    const log: ResponseLog = {
      requestId: requestId || 'unknown',
      error,
      timestamp,
      duration,
      status: error.response?.status,
    }

    this.responseLogs.push(log)
    this.trimLogs()

    // 记录事件
    this.recordEvent({
      type: 'error',
      data: log,
      timestamp,
      level: DebugLevel.ERROR,
    })

    // 控制台输出
    if (this.config?.console && this.config?.level >= DebugLevel.ERROR) {
      console.error(
        `[HTTP Error] ${error.config?.method} ${error.config?.url} - ${error.message} (${duration}ms)`,
        log,
      )
    }
  }

  /**
   * 记录事件
   */
  recordEvent(event: DebugEvent): void {
    this.events.push(event)

    // 限制事件数量
    if (this.events.length > this.config?.maxLogs) {
      this.events.shift()
    }

    // 调用自定义处理器
    this.config?.handler(event)
  }

  /**
   * 获取所有请求日志
   */
  getRequestLogs(): RequestLog[] {
    return Array.from(this.requestLogs.values())
  }

  /**
   * 获取所有响应日志
   */
  getResponseLogs(): ResponseLog[] {
    return [...this.responseLogs]
  }

  /**
   * 获取所有事件
   */
  getEvents(): DebugEvent[] {
    return [...this.events]
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport(): {
    totalRequests: number
    averageDuration: number
    slowestRequest: ResponseLog | null
    fastestRequest: ResponseLog | null
    errorRate: number
    totalDataTransferred: number
  } {
    const logs = this.responseLogs
    const totalRequests = logs.length
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0)
    const averageDuration = totalRequests > 0 ? totalDuration / totalRequests : 0

    const slowestRequest = logs.reduce((slowest, log) =>
      log.duration > (slowest?.duration || 0) ? log : slowest, logs[0] || null)

    const fastestRequest = logs.reduce((fastest, log) =>
      log.duration < (fastest?.duration || Number.POSITIVE_INFINITY) ? log : fastest, logs[0] || null)

    const errors = logs.filter(log => log.error).length
    const errorRate = totalRequests > 0 ? errors / totalRequests : 0

    const totalDataTransferred = logs.reduce((sum, log) => sum + (log.size || 0), 0)

    return {
      totalRequests,
      averageDuration,
      slowestRequest,
      fastestRequest,
      errorRate,
      totalDataTransferred,
    }
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    this.requestLogs.clear()
    this.responseLogs = []
    this.events = []
    this.performanceData.clear()
  }

  /**
   * 导出日志
   */
  exportLogs(): string {
    return JSON.stringify({
      requests: this.getRequestLogs(),
      responses: this.getResponseLogs(),
      events: this.getEvents(),
      performance: this.getPerformanceReport(),
      timestamp: Date.now(),
    }, null, 2)
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<DebuggerConfig>): void {
    Object.assign(this.config, config)
  }

  /**
   * 获取配置
   */
  getConfig(): DebuggerConfig {
    return { ...this.config }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  }

  /**
   * 查找请求 ID
   */
  private findRequestId(config: RequestConfig): string | null {
    for (const [id, log] of this.requestLogs.entries()) {
      if (log.config === config) {
        return id
      }
    }
    return null
  }

  /**
   * 估算数据大小
   */
  private estimateSize(data: any): number {
    if (!data) {
      return 0
    }

    if (typeof data === 'string') {
      return data.length
    }

    if (data instanceof Blob) {
      return data.size
    }

    if (data instanceof ArrayBuffer) {
      return data.byteLength
    }

    // JSON 序列化估算
    try {
      return JSON.stringify(data).length
    }
    catch {
      return 0
    }
  }

  /**
   * 修剪日志
   */
  private trimLogs(): void {
    if (this.responseLogs.length > this.config?.maxLogs) {
      this.responseLogs = this.responseLogs.slice(-this.config?.maxLogs)
    }

    if (this.requestLogs.size > this.config?.maxLogs) {
      const excess = this.requestLogs.size - this.config?.maxLogs
      const keys = Array.from(this.requestLogs.keys())
      for (let i = 0; i < excess; i++) {
        this.requestLogs.delete(keys[i])
      }
    }
  }
}

/**
 * 创建 HTTP 调试器
 */
export function createHttpDebugger(config?: DebuggerConfig): HttpDebugger {
  return new HttpDebugger(config)
}

/**
 * 创建调试拦截器
 */
export function createDebugInterceptor(config?: DebuggerConfig) {
  const httpDebugger = new HttpDebugger(config)

  return {
    request: (config: RequestConfig) => {
      httpDebugger.recordEvent({
        type: 'request',
        data: config,
        timestamp: Date.now(),
        level: DebugLevel.DEBUG,
      })
      return config
    },
    response: (response: ResponseData) => {
      httpDebugger.recordEvent({
        type: 'response',
        data: response,
        timestamp: Date.now(),
        level: DebugLevel.DEBUG,
      })
      return response
    },
    error: (error: HttpError) => {
      httpDebugger.recordEvent({
        type: 'error',
        data: error,
        timestamp: Date.now(),
        level: DebugLevel.ERROR,
      })
      return Promise.reject(error)
    },
    debugger: httpDebugger,
  }
}
