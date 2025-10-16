/**
 * 日志管理模块
 * 
 * 提供请求响应日志记录、管理和导出功能
 */

import type { HttpError, RequestConfig, ResponseData } from '../types'

/**
 * 调试日志级别
 */
export enum LogLevel {
  NONE = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 3,
  DEBUG = 4,
  TRACE = 5,
}

/**
 * 日志条目类型
 */
export type LogEntryType = 
  | 'request' 
  | 'response' 
  | 'error' 
  | 'cache_hit' 
  | 'cache_miss' 
  | 'retry' 
  | 'redirect'
  | 'abort'
  | 'custom'

/**
 * 基础日志条目
 */
export interface BaseLogEntry {
  /** 日志ID */
  id: string
  /** 日志类型 */
  type: LogEntryType
  /** 日志级别 */
  level: LogLevel
  /** 时间戳 */
  timestamp: number
  /** 会话ID */
  sessionId?: string
  /** 追踪ID */
  traceId?: string
  /** 标签 */
  tags?: string[]
  /** 元数据 */
  metadata?: Record<string, any>
}

/**
 * 请求日志条目
 */
export interface RequestLogEntry extends BaseLogEntry {
  type: 'request'
  /** 请求配置 */
  config: RequestConfig
  /** 请求方法 */
  method: string
  /** 请求URL */
  url: string
  /** 请求头 */
  headers?: Record<string, string>
  /** 请求体 */
  body?: any
  /** 请求大小 */
  size?: number
}

/**
 * 响应日志条目
 */
export interface ResponseLogEntry extends BaseLogEntry {
  type: 'response'
  /** 关联的请求ID */
  requestId: string
  /** 响应状态 */
  status: number
  /** 响应头 */
  headers?: Record<string, string>
  /** 响应体 */
  body?: any
  /** 响应大小 */
  size?: number
  /** 持续时间 */
  duration: number
  /** 响应数据 */
  response?: ResponseData
}

/**
 * 错误日志条目
 */
export interface ErrorLogEntry extends BaseLogEntry {
  type: 'error'
  /** 关联的请求ID */
  requestId?: string
  /** 错误信息 */
  message: string
  /** 错误堆栈 */
  stack?: string
  /** 错误代码 */
  code?: string | number
  /** HTTP错误 */
  httpError?: HttpError
}

/**
 * 缓存日志条目
 */
export interface CacheLogEntry extends BaseLogEntry {
  type: 'cache_hit' | 'cache_miss'
  /** 缓存键 */
  cacheKey: string
  /** 缓存策略 */
  strategy?: string
  /** 缓存年龄 */
  age?: number
  /** 缓存大小 */
  size?: number
}

/**
 * 日志条目联合类型
 */
export type LogEntry = 
  | RequestLogEntry
  | ResponseLogEntry
  | ErrorLogEntry
  | CacheLogEntry
  | BaseLogEntry

/**
 * 日志过滤器
 */
export interface LogFilter {
  /** 日志类型 */
  types?: LogEntryType[]
  /** 日志级别 */
  minLevel?: LogLevel
  /** 开始时间 */
  startTime?: number
  /** 结束时间 */
  endTime?: number
  /** URL模式 */
  urlPattern?: string | RegExp
  /** 状态码范围 */
  statusRange?: [number, number]
  /** 标签 */
  tags?: string[]
  /** 会话ID */
  sessionId?: string
  /** 追踪ID */
  traceId?: string
}

/**
 * 日志存储配置
 */
export interface LogStorageConfig {
  /** 最大日志数量 */
  maxEntries?: number
  /** 最大存储大小（字节） */
  maxSize?: number
  /** 日志过期时间（毫秒） */
  ttl?: number
  /** 是否持久化 */
  persist?: boolean
  /** 持久化键名 */
  persistKey?: string
}

/**
 * 日志存储器
 */
export class LogStorage {
  private entries: Map<string, LogEntry> = new Map()
  private entryOrder: string[] = []
  private currentSize = 0
  private config: Required<LogStorageConfig>

  constructor(config: LogStorageConfig = {}) {
    this.config = {
      maxEntries: config.maxEntries ?? 1000,
      maxSize: config.maxSize ?? 10 * 1024 * 1024, // 10MB
      ttl: config.ttl ?? 24 * 60 * 60 * 1000, // 24小时
      persist: config.persist ?? false,
      persistKey: config.persistKey ?? 'http-debug-logs',
    }

    if (this.config.persist) {
      this.loadFromStorage()
    }
  }

  /**
   * 添加日志条目
   */
  add(entry: LogEntry): void {
    // 移除过期条目
    this.removeExpired()

    // 估算条目大小
    const entrySize = this.estimateSize(entry)

    // 检查大小限制
    while (
      (this.entries.size >= this.config.maxEntries ||
       this.currentSize + entrySize > this.config.maxSize) &&
      this.entryOrder.length > 0
    ) {
      this.removeOldest()
    }

    // 添加新条目
    this.entries.set(entry.id, entry)
    this.entryOrder.push(entry.id)
    this.currentSize += entrySize

    // 持久化
    if (this.config.persist) {
      this.saveToStorage()
    }
  }

  /**
   * 获取日志条目
   */
  get(id: string): LogEntry | undefined {
    return this.entries.get(id)
  }

  /**
   * 查询日志条目
   */
  query(filter: LogFilter = {}): LogEntry[] {
    return Array.from(this.entries.values())
      .filter(entry => this.matchesFilter(entry, filter))
      .sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * 删除日志条目
   */
  remove(id: string): boolean {
    const entry = this.entries.get(id)
    if (!entry) {
      return false
    }

    this.entries.delete(id)
    const index = this.entryOrder.indexOf(id)
    if (index !== -1) {
      this.entryOrder.splice(index, 1)
    }
    
    this.currentSize -= this.estimateSize(entry)
    
    if (this.config.persist) {
      this.saveToStorage()
    }

    return true
  }

  /**
   * 清空所有日志
   */
  clear(): void {
    this.entries.clear()
    this.entryOrder = []
    this.currentSize = 0

    if (this.config.persist) {
      this.removeFromStorage()
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    totalEntries: number
    totalSize: number
    oldestEntry?: LogEntry
    newestEntry?: LogEntry
    typeDistribution: Record<LogEntryType, number>
    levelDistribution: Record<string, number>
  } {
    const entries = Array.from(this.entries.values())
    const typeDistribution: Record<string, number> = {}
    const levelDistribution: Record<string, number> = {}

    entries.forEach(entry => {
      typeDistribution[entry.type] = (typeDistribution[entry.type] || 0) + 1
      levelDistribution[LogLevel[entry.level]] = 
        (levelDistribution[LogLevel[entry.level]] || 0) + 1
    })

    const sortedEntries = entries.sort((a, b) => a.timestamp - b.timestamp)

    return {
      totalEntries: this.entries.size,
      totalSize: this.currentSize,
      oldestEntry: sortedEntries[0],
      newestEntry: sortedEntries[sortedEntries.length - 1],
      typeDistribution: typeDistribution as Record<LogEntryType, number>,
      levelDistribution,
    }
  }

  /**
   * 导出日志
   */
  export(format: 'json' | 'csv' = 'json'): string {
    const entries = this.query()

    if (format === 'json') {
      return JSON.stringify(entries, null, 2)
    }

    // CSV格式
    const headers = [
      'id',
      'type',
      'level',
      'timestamp',
      'method',
      'url',
      'status',
      'duration',
      'message',
    ]

    const rows = entries.map(entry => {
      const row: any[] = [
        entry.id,
        entry.type,
        LogLevel[entry.level],
        new Date(entry.timestamp).toISOString(),
      ]

      if ('method' in entry) {
        row.push(entry.method)
      } else {
        row.push('')
      }

      if ('url' in entry) {
        row.push(entry.url)
      } else {
        row.push('')
      }

      if ('status' in entry) {
        row.push(entry.status)
      } else {
        row.push('')
      }

      if ('duration' in entry) {
        row.push(entry.duration)
      } else {
        row.push('')
      }

      if ('message' in entry) {
        row.push(entry.message)
      } else {
        row.push('')
      }

      return row
    })

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(v => JSON.stringify(v ?? '')).join(',')),
    ].join('\n')

    return csv
  }

  /**
   * 匹配过滤器
   */
  private matchesFilter(entry: LogEntry, filter: LogFilter): boolean {
    // 类型过滤
    if (filter.types && !filter.types.includes(entry.type)) {
      return false
    }

    // 级别过滤
    if (filter.minLevel !== undefined && entry.level < filter.minLevel) {
      return false
    }

    // 时间范围过滤
    if (filter.startTime && entry.timestamp < filter.startTime) {
      return false
    }
    if (filter.endTime && entry.timestamp > filter.endTime) {
      return false
    }

    // URL模式过滤
    if (filter.urlPattern && 'url' in entry) {
      const pattern = filter.urlPattern
      if (typeof pattern === 'string') {
        if (!entry.url?.includes(pattern)) {
          return false
        }
      } else if (!pattern.test(entry.url || '')) {
        return false
      }
    }

    // 状态码范围过滤
    if (filter.statusRange && 'status' in entry) {
      const [min, max] = filter.statusRange
      const status = entry.status as number
      if (status < min || status > max) {
        return false
      }
    }

    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      if (!entry.tags || !filter.tags.some(tag => entry.tags?.includes(tag))) {
        return false
      }
    }

    // 会话ID过滤
    if (filter.sessionId && entry.sessionId !== filter.sessionId) {
      return false
    }

    // 追踪ID过滤
    if (filter.traceId && entry.traceId !== filter.traceId) {
      return false
    }

    return true
  }

  /**
   * 移除最旧的条目
   */
  private removeOldest(): void {
    if (this.entryOrder.length === 0) {
      return
    }

    const oldestId = this.entryOrder.shift()!
    const entry = this.entries.get(oldestId)
    
    if (entry) {
      this.currentSize -= this.estimateSize(entry)
      this.entries.delete(oldestId)
    }
  }

  /**
   * 移除过期条目
   */
  private removeExpired(): void {
    if (this.config.ttl <= 0) {
      return
    }

    const now = Date.now()
    const expiredIds: string[] = []

    this.entries.forEach((entry, id) => {
      if (now - entry.timestamp > this.config.ttl) {
        expiredIds.push(id)
      }
    })

    expiredIds.forEach(id => this.remove(id))
  }

  /**
   * 估算条目大小
   */
  private estimateSize(entry: LogEntry): number {
    try {
      return JSON.stringify(entry).length
    } catch {
      return 1024 // 默认1KB
    }
  }

  /**
   * 从存储加载
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const data = localStorage.getItem(this.config.persistKey)
      if (!data) {
        return
      }

      const parsed = JSON.parse(data) as LogEntry[]
      parsed.forEach(entry => {
        this.add(entry)
      })
    } catch (error) {
      console.error('Failed to load logs from storage:', error)
    }
  }

  /**
   * 保存到存储
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      const entries = Array.from(this.entries.values())
      localStorage.setItem(this.config.persistKey, JSON.stringify(entries))
    } catch (error) {
      console.error('Failed to save logs to storage:', error)
    }
  }

  /**
   * 从存储移除
   */
  private removeFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return
    }

    try {
      localStorage.removeItem(this.config.persistKey)
    } catch (error) {
      console.error('Failed to remove logs from storage:', error)
    }
  }
}

/**
 * 创建日志存储器
 */
export function createLogStorage(config?: LogStorageConfig): LogStorage {
  return new LogStorage(config)
}