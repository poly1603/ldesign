/**
 * 统一的日志系统
 * 📝 整合了所有日志功能，提供高性能、可扩展的日志解决方案
 *
 * 合并了以下文件：
 * - logger/logger.ts
 * - utils/logging-system.ts
 */

import type { Logger as ILogger, LogEntry, LoggerOptions, LogLevel } from '../types/logger'

// ============================================
// 类型定义
// ============================================

export interface LogConfig extends LoggerOptions {
  // 基础配置
  level?: LogLevel
  enabled?: boolean
  maxLogs?: number

  // 输出配置
  console?: boolean
  remote?: boolean
  file?: boolean

  // 远程日志配置
  remoteUrl?: string
  remoteHeaders?: Record<string, string>
  remoteBatchSize?: number
  remoteInterval?: number

  // 格式化配置
  format?: 'json' | 'text' | 'pretty'
  timestamp?: boolean
  context?: boolean

  // 性能配置
  async?: boolean
  bufferSize?: number
  flushInterval?: number

  // 过滤器
  filters?: Array<(entry: LogEntry) => boolean>

  // 插件
  plugins?: LogPlugin[]
}

export interface LogPlugin {
  name: string
  process: (entry: LogEntry) => LogEntry | null
  flush?: () => void
}

export interface LogTransport {
  name: string
  write: (entry: LogEntry) => void | Promise<void>
  flush?: () => void | Promise<void>
}

export interface LogStats {
  total: number
  byLevel: Record<LogLevel, number>
  errors: number
  dropped: number
  buffered: number
}

// ============================================
// 统一日志系统
// ============================================

export class UnifiedLogger implements ILogger {
  private config: Required<LogConfig>
  private logs: LogEntry[] = []
  private buffer: LogEntry[] = []
  private transports: Map<string, LogTransport> = new Map()
  private plugins: LogPlugin[] = []
  private stats: LogStats
  private flushTimer?: NodeJS.Timeout
  private remoteQueue: LogEntry[] = []
  private remoteTimer?: NodeJS.Timeout

  // 内存优化：限制数组最大长度
  private readonly MAX_LOGS_ABSOLUTE = 1000 // 绝对上限
  private readonly MAX_BUFFER = 200 // 缓冲区上限
  private readonly MAX_REMOTE_QUEUE = 500 // 远程队列上限

  constructor(config: LogConfig = {}) {
    this.config = this.normalizeConfig(config)
    this.stats = this.initStats()

    // 初始化传输器
    this.initTransports()

    // 初始化插件 - 防御性：限制插件数量
    if (config.plugins) {
      this.plugins = config.plugins.slice(0, 10) // 最多10个插件
    }

    // 启动定期刷新
    if (this.config?.async && this.config?.flushInterval > 0) {
      this.startFlushTimer()
    }

    // 启动远程日志批量发送
    if (this.config?.remote && this.config?.remoteInterval > 0) {
      this.startRemoteTimer()
    }
  }

  /**
   * 标准化配置 - 优化版：更严格的默认值
   */
  private normalizeConfig(config: LogConfig): Required<LogConfig> {
    return {
      level: config.level ?? 'warn',
      enabled: config.enabled ?? true,
      maxLogs: Math.min(config.maxLogs ?? 100, this.MAX_LOGS_ABSOLUTE), // 限制最大日志数
      console: config.console ?? true,
      remote: config.remote ?? false,
      file: config.file ?? false,
      remoteUrl: config.remoteUrl ?? '',
      remoteHeaders: config.remoteHeaders ?? {},
      remoteBatchSize: Math.min(config.remoteBatchSize ?? 50, 100), // 限制批次大小
      remoteInterval: Math.max(config.remoteInterval ?? 10000, 5000), // 最小5秒间隔
      format: config.format ?? 'text',
      timestamp: config.timestamp ?? false,
      context: config.context ?? false,
      async: config.async ?? false,
      bufferSize: Math.min(config.bufferSize ?? 50, this.MAX_BUFFER), // 限制缓冲区大小
      flushInterval: Math.max(config.flushInterval ?? 2000, 1000), // 最小1秒刷新
      filters: config.filters?.slice(0, 5) ?? [], // 最多5个过滤器
      plugins: config.plugins?.slice(0, 10) ?? [], // 最多10个插件
      showTimestamp: config.showTimestamp ?? false,
      showContext: config.showContext ?? false,
      prefix: config.prefix ?? ''
    }
  }

  /**
   * 初始化统计信息
   */
  private initStats(): LogStats {
    return {
      total: 0,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0
      },
      errors: 0,
      dropped: 0,
      buffered: 0
    }
  }

  /**
   * 初始化传输器
   */
  private initTransports(): void {
    // 控制台传输器
    if (this.config?.console) {
      this.transports.set('console', new ConsoleTransport(this.config))
    }

    // 远程传输器
    if (this.config?.remote && this.config?.remoteUrl) {
      this.transports.set('remote', new RemoteTransport(this.config))
    }

    // 文件传输器（浏览器环境使用 IndexedDB）
    if (this.config?.file && typeof window !== 'undefined') {
      this.transports.set('file', new IndexedDBTransport(this.config))
    }
  }

  // ============================================
  // 核心日志方法
  // ============================================

  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args)
  }

  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args)
  }

  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args)
  }

  error(message: string, error?: unknown, ...args: unknown[]): void {
    this.log('error', message, error, ...args)
  }

  /**
   * 核心日志方法
   */
  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (!this.config?.enabled) return
    if (!this.shouldLog(level)) return

    // 创建日志条目
    let entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data: args.length > 0 ? args : undefined
    }

    // 应用插件
    for (const plugin of this.plugins) {
      const result = plugin.process(entry)
      if (!result) return // 插件过滤掉了日志
      entry = result
    }

    // 应用过滤器
    for (const filter of this.config?.filters) {
      if (!filter(entry)) {
        this.stats.dropped++
        return
      }
    }

    // 更新统计
    this.updateStats(level)

    // 异步模式：加入缓冲区
    if (this.config?.async) {
      // 检查缓冲区大小限制
      if (this.buffer.length >= this.MAX_BUFFER) {
        // 强制刷新
        this.flush()
      }

      this.buffer.push(entry)
      this.stats.buffered++

      if (this.buffer.length >= this.config?.bufferSize) {
        this.flush()
      }
    } else {
      // 同步模式：立即写入
      this.writeEntry(entry)
    }

    // 保存到历史记录
    this.addToHistory(entry)
  }

  /**
   * 写入日志条目
   */
  private writeEntry(entry: LogEntry): void {
    // 写入到所有传输器
    for (const transport of this.transports.values()) {
      try {
        transport.write(entry)
      } catch (error) {
        this.stats.errors++
        // 避免递归
        if (this.config?.console) {
          console.error('Logger transport error:', error)
        }
      }
    }
  }

  /**
   * 添加到历史记录 - 优化版：使用环形缓冲区避免数组扩容
   */
  private addToHistory(entry: LogEntry): void {
    // 双重限制：配置的maxLogs和绝对上限
    const effectiveMax = Math.min(this.config?.maxLogs, this.MAX_LOGS_ABSOLUTE)

    if (this.logs.length >= effectiveMax) {
      // 已满：移除最旧的，添加新的
      this.logs.shift()
    }

    this.logs.push(entry)
  }

  /**
   * 检查是否应该记录
   */
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const configIndex = levels.indexOf(this.config?.level)
    const levelIndex = levels.indexOf(level)
    return levelIndex >= configIndex
  }

  /**
   * 更新统计信息
   */
  private updateStats(level: LogLevel): void {
    this.stats.total++
    this.stats.byLevel[level]++
  }

  // ============================================
  // 批处理和刷新
  // ============================================

  /**
   * 刷新缓冲区
   */
  flush(): void {
    if (this.buffer.length === 0) return

    const entries = this.buffer.splice(0, this.buffer.length)
    this.stats.buffered = 0

    for (const entry of entries) {
      this.writeEntry(entry)
    }

    // 刷新所有传输器
    for (const transport of this.transports.values()) {
      if (transport.flush) {
        transport.flush()
      }
    }

    // 刷新插件
    for (const plugin of this.plugins) {
      if (plugin.flush) {
        plugin.flush()
      }
    }
  }

  /**
   * 启动定期刷新
   */
  private startFlushTimer(): void {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.config?.flushInterval)
  }

  /**
   * 启动远程日志定时器
   */
  private startRemoteTimer(): void {
    this.remoteTimer = setInterval(() => {
      this.flushRemote()
    }, this.config?.remoteInterval)
  }

  /**
   * 刷新远程日志 - 优化版：限制队列大小避免无限增长
   */
  private async flushRemote(): Promise<void> {
    if (this.remoteQueue.length === 0) return

    // 检查队列大小限制
    if (this.remoteQueue.length > this.MAX_REMOTE_QUEUE) {
      // 队列过大：移除最旧的日志
      const excess = this.remoteQueue.length - this.MAX_REMOTE_QUEUE
      this.remoteQueue.splice(0, excess)
      this.stats.dropped += excess
    }

    const batch = this.remoteQueue.splice(0, this.config?.remoteBatchSize)

    try {
      await fetch(this.config?.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config?.remoteHeaders
        },
        body: JSON.stringify(batch)
      })
    } catch {
      this.stats.errors++
      // 恢复失败的日志到队列（但限制数量）
      const toRestore = batch.slice(0, Math.min(batch.length, 50))
      this.remoteQueue.unshift(...toRestore)

      // 超过部分丢弃
      if (batch.length > toRestore.length) {
        this.stats.dropped += (batch.length - toRestore.length)
      }
    }
  }

  // ============================================
  // 高级功能
  // ============================================

  /**
   * 创建子日志器
   */
  child(context: Record<string, unknown>): UnifiedLogger {
    const childConfig = { ...this.config }
    const childLogger = new UnifiedLogger(childConfig)

    // 添加上下文插件
    childLogger.use({
      name: 'context',
      process(entry: LogEntry): LogEntry {
        return {
          ...entry,
          context: { ...context, ...entry.context }
        }
      }
    })

    return childLogger
  }

  /**
   * 使用插件
   */
  use(plugin: LogPlugin): void {
    this.plugins.push(plugin)
  }

  /**
   * 添加传输器
   */
  addTransport(name: string, transport: LogTransport): void {
    this.transports.set(name, transport)
  }

  /**
   * 移除传输器
   */
  removeTransport(name: string): void {
    this.transports.delete(name)
  }

  /**
   * 设置日志级别
   */
  setLevel(level: LogLevel): void {
    if (this.config) {
      this.config.level = level
    }
  }

  /**
   * 获取日志级别
   */
  getLevel(): LogLevel {
    return this.config?.level
  }

  /**
   * 获取日志历史
   */
  getLogs(filter?: Partial<LogEntry>): LogEntry[] {
    if (!filter) return [...this.logs]

    return this.logs.filter(log => {
      if (filter.level && log.level !== filter.level) return false
      if (filter.message && !log.message.includes(filter.message)) return false
      return true
    })
  }

  /**
   * 清空日志
   */
  clearLogs(): void {
    // 使用更高效的方式清空数组
    this.logs.length = 0
    this.buffer.length = 0
    this.remoteQueue.length = 0

    // 清理插件缓存
    for (const plugin of this.plugins) {
      if (typeof plugin.flush === 'function') {
        plugin.flush()
      }
    }
  }

  /**
   * 清空日志（别名方法，与 Logger 接口兼容）
   */
  clear(): void {
    this.clearLogs()
    this.resetStats()
  }

  /**
   * 设置最大日志数
   */
  setMaxLogs(max: number): void {
    if (this.config) {
      this.config.maxLogs = max
    }
    // 如果当前日志数超过新限制，删除老日志
    while (this.logs.length > max) {
      this.logs.shift()
    }
  }

  /**
   * 获取最大日志数
   */
  getMaxLogs(): number {
    return this.config?.maxLogs
  }

  /**
   * 获取统计信息
   */
  getStats(): LogStats {
    return { ...this.stats }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = this.initStats()
  }

  /**
   * 销毁日志器
   */
  destroy(): void {
    // 清理定时器
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = undefined
    }

    if (this.remoteTimer) {
      clearInterval(this.remoteTimer)
      this.remoteTimer = undefined
    }

    // 最后一次刷新
    this.flush()

    // 清理日志数据
    this.clearLogs()

    // 清理传输器
    for (const transport of this.transports.values()) {
      if (typeof (transport as any).destroy === 'function') {
        (transport as any).destroy()
      }
    }
    this.transports.clear()

    // 清理插件
    for (const plugin of this.plugins) {
      if (typeof plugin.flush === 'function') {
        plugin.flush()
      }
    }
    this.plugins.length = 0
  }
}

// ============================================
// 传输器实现
// ============================================

/**
 * 控制台传输器
 */
class ConsoleTransport implements LogTransport {
  name = 'console'

  constructor(private config: Required<LogConfig>) { }

  write(entry: LogEntry): void {
    const { level, message, data } = entry
    const timestamp = this.config?.timestamp
      ? new Date(entry.timestamp).toISOString()
      : ''

    const prefix = this.config?.format === 'pretty'
      ? this.getPrettyPrefix(level, timestamp)
      : timestamp

    const dataArray = Array.isArray(data) ? data : []
    const args = [prefix, message, ...dataArray]

    switch (level) {
      case 'debug':

        break
      case 'info':
        console.info(...args)
        break
      case 'warn':
        console.warn(...args)
        break
      case 'error':
        console.error(...args)
        break
    }
  }

  private getPrettyPrefix(level: LogLevel, timestamp: string): string {
    const colors = {
      debug: '\x1B[36m', // Cyan
      info: '\x1B[32m', // Green
      warn: '\x1B[33m', // Yellow
      error: '\x1B[31m' // Red
    }

    const reset = '\x1B[0m'
    const color = colors[level]

    return `${color}[${level.toUpperCase()}]${reset} ${timestamp}`
  }
}

/**
 * 远程传输器
 */
class RemoteTransport implements LogTransport {
  name = 'remote'
  private queue: LogEntry[] = []
  private maxQueueSize = 10000 // 防止队列无限增长

  constructor(private config: Required<LogConfig>) { }

  write(entry: LogEntry): void {
    // 防止队列无限增长导致内存泄漏
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift() // 移除最旧的条目
    }

    this.queue.push(entry)

    if (this.queue.length >= this.config?.remoteBatchSize) {
      this.flush()
    }
  }

  async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const batch = this.queue.splice(0, this.queue.length)

    try {
      await fetch(this.config?.remoteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config?.remoteHeaders
        },
        body: JSON.stringify(batch)
      })
    } catch (error) {
      // 恢复失败的日志，但限制数量
      const restoreCount = Math.min(batch.length, this.maxQueueSize - this.queue.length)
      this.queue.unshift(...batch.slice(0, restoreCount))
      throw error
    }
  }

  // 添加销毁方法
  destroy(): void {
    this.queue.length = 0
  }
}

/**
 * IndexedDB 传输器（用于浏览器环境的文件存储）
 */
class IndexedDBTransport implements LogTransport {
  name = 'indexeddb'
  private db?: IDBDatabase
  private dbName = 'LoggerDB'
  private storeName = 'logs'
  private cleanupTimer?: NodeJS.Timeout

  constructor(private config: Required<LogConfig>) {
    this.initDB()
    // 定期清理旧日志
    this.cleanupTimer = setInterval(() => {
      this.cleanup()
    }, 60000) // 每分钟清理一次
  }

  private async initDB(): Promise<void> {
    const request = indexedDB.open(this.dbName, 1)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(this.storeName)) {
        const store = db.createObjectStore(this.storeName, {
          keyPath: 'id',
          autoIncrement: true
        })
        store.createIndex('timestamp', 'timestamp')
        store.createIndex('level', 'level')
      }
    }

    this.db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async write(entry: LogEntry): Promise<void> {
    if (!this.db) await this.initDB()
    if (!this.db) return

    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    store.add(entry)

    // 清理旧日志
    await this.cleanup()
  }

  private async cleanup(): Promise<void> {
    if (!this.db) return

    const transaction = this.db.transaction([this.storeName], 'readwrite')
    const store = transaction.objectStore(this.storeName)
    const count = await this.getCount(store)

    if (count > this.config?.maxLogs) {
      const deleteCount = count - this.config?.maxLogs
      const request = store.openCursor()
      let deleted = 0

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result
        if (cursor && deleted < deleteCount) {
          cursor.delete()
          deleted++
          cursor.continue()
        }
      }
    }
  }

  private getCount(store: IDBObjectStore): Promise<number> {
    return new Promise((resolve, reject) => {
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  // 添加销毁方法
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    if (this.db) {
      this.db.close()
      this.db = undefined
    }
  }
}

// ============================================
// 内置插件
// ============================================

/**
 * 性能插件 - 记录日志耗时
 */
export class PerformancePlugin implements LogPlugin {
  name = 'performance'
  private timings = new Map<string, number>()
  private maxTimings = 1000 // 限制缓存大小

  process(entry: LogEntry): LogEntry {
    const start = performance.now()
    const id = `${entry.timestamp}-${entry.level}`

    // 限制 Map 大小防止内存泄漏
    if (this.timings.size >= this.maxTimings) {
      const firstKey = this.timings.keys().next().value
      if (firstKey !== undefined) {
        this.timings.delete(firstKey)
      }
    }

    this.timings.set(id, start)

    return {
      ...entry,
      metadata: {
        ...entry.metadata,
        logTime: performance.now() - start
      }
    }
  }

  flush(): void {
    this.timings.clear()
  }
}

/**
 * 错误追踪插件 - 增强错误信息
 */
export class ErrorTrackingPlugin implements LogPlugin {
  name = 'error-tracking'

  process(entry: LogEntry): LogEntry {
    if (entry.level !== 'error') return entry

    const dataArray = Array.isArray(entry.data) ? entry.data : [entry.data]
    const error = dataArray[0]
    if (error instanceof Error) {
      return {
        ...entry,
        metadata: {
          ...entry.metadata,
          errorStack: error.stack,
          errorName: error.name,
          errorMessage: error.message
        }
      }
    }

    return entry
  }
}

/**
 * 采样插件 - 按比例采样日志
 */
export class SamplingPlugin implements LogPlugin {
  name = 'sampling'

  constructor(private sampleRate: number = 1) { }

  process(entry: LogEntry): LogEntry | null {
    if (Math.random() <= this.sampleRate) {
      return entry
    }
    return null
  }
}

// ============================================
// 工厂函数
// ============================================

export function createUnifiedLogger(config?: LogConfig): UnifiedLogger {
  return new UnifiedLogger(config)
}

/**
 * 创建日志器（兼容 LogLevel 字符串和 LogConfig 对象）
 * @param levelOrConfig 日志级别字符串或配置对象
 */
export function createLogger(levelOrConfig?: LogLevel | LogConfig): UnifiedLogger {
  if (typeof levelOrConfig === 'string') {
    return new UnifiedLogger({ level: levelOrConfig })
  }
  return new UnifiedLogger(levelOrConfig)
}

// 向后兼容
export { UnifiedLogger as Logger }

// ============================================
// getLogger 工厂函数
// ============================================

// 全局日志器实例缓存
const loggerInstances = new Map<string, UnifiedLogger>()

/**
 * 获取或创建命名日志器实例
 * @param name 日志器名称
 * @param config 可选的配置
 * @returns 日志器实例
 */
export function getLogger(name: string = 'default', config?: LogConfig): UnifiedLogger {
  // 如果已存在，直接返回
  if (loggerInstances.has(name) && !config) {
    const existing = loggerInstances.get(name)
    if (existing) return existing
  }

  // 创建新实例
  const logger = new UnifiedLogger({
    ...config,
    // 添加默认前缀
    format: config?.format ?? 'pretty'
  })

  // 缓存实例
  loggerInstances.set(name, logger)

  return logger
}
