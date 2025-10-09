import type { ConcurrencyConfig, RequestConfig, ResponseData } from '../types'

/**
 * 请求任务接口
 */
interface RequestTask<T = any> {
  id: string
  execute: () => Promise<ResponseData<T>>
  resolve: (value: ResponseData<T>) => void
  reject: (error: any) => void
  config: RequestConfig
}

/**
 * 并发控制管理器
 */
export class ConcurrencyManager {
  private config: Required<ConcurrencyConfig>
  private activeRequests = new Set<string>()
  private requestQueue: RequestTask[] = []
  private requestCounter = 0
  private processingQueue = false // 防止重复处理队列
  private deduplicationManager: DeduplicationManager
  private keyGenerator: DeduplicationKeyGenerator

  constructor(config: ConcurrencyConfig = {}) {
    this.config = {
      maxConcurrent: config.maxConcurrent ?? 10,
      maxQueueSize: config.maxQueueSize ?? 100,
      deduplication: config.deduplication ?? true,
    }

    // 初始化去重管理器
    this.deduplicationManager = new DeduplicationManager()
    this.keyGenerator = new DeduplicationKeyGenerator({
      includeMethod: true,
      includeUrl: true,
      includeParams: true,
      includeData: false, // 默认不包含请求体，避免大数据影响性能
    })
  }

  /**
   * 执行请求（带并发控制和去重）
   */
  async execute<T = any>(
    requestFn: () => Promise<ResponseData<T>>,
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
    // 如果启用了去重功能
    if (this.config.deduplication) {
      const deduplicationKey = this.keyGenerator.generate(config)

      // 使用去重管理器执行请求
      return this.deduplicationManager.execute(
        deduplicationKey,
        () => this.executeWithConcurrencyControl(requestFn, config),
      )
    }

    // 否则直接使用并发控制
    return this.executeWithConcurrencyControl(requestFn, config)
  }

  /**
   * 带并发控制的请求执行
   */
  private async executeWithConcurrencyControl<T = any>(
    requestFn: () => Promise<ResponseData<T>>,
    config: RequestConfig,
  ): Promise<ResponseData<T>> {
    return new Promise<ResponseData<T>>((resolve, reject) => {
      const taskId = this.generateTaskId()

      const task: RequestTask<T> = {
        id: taskId,
        execute: requestFn,
        resolve,
        reject,
        config,
      }

      // 检查队列大小限制
      if (this.requestQueue.length >= this.config.maxQueueSize) {
        reject(new Error('Request queue is full'))
        return
      }

      // 如果当前并发数未达到限制，直接执行
      if (this.activeRequests.size < this.config.maxConcurrent) {
        this.executeTask(task)
      }
      else {
        // 否则加入队列
        this.requestQueue.push(task)
      }
    })
  }

  /**
   * 执行任务
   */
  private async executeTask<T>(task: RequestTask<T>): Promise<void> {
    this.activeRequests.add(task.id)

    try {
      const result = await task.execute()
      task.resolve(result)
    }
    catch (error) {
      task.reject(error)
    }
    finally {
      this.activeRequests.delete(task.id)
      this.processQueue()
    }
  }

  /**
   * 处理队列中的下一个任务（优化版）
   */
  private processQueue(): void {
    // 防止重复处理
    if (this.processingQueue) {
      return
    }

    this.processingQueue = true

    try {
      // 批量处理多个任务，直到达到并发限制
      while (
        this.requestQueue.length > 0
        && this.activeRequests.size < this.config.maxConcurrent
      ) {
        const nextTask = this.requestQueue.shift()
        if (nextTask) {
          this.executeTask(nextTask)
        }
      }
    }
    finally {
      this.processingQueue = false
    }
  }

  /**
   * 取消所有排队的请求
   */
  cancelQueue(reason = 'Queue cancelled'): void {
    const queuedTasks = this.requestQueue.splice(0)
    queuedTasks.forEach((task) => {
      task.reject(new Error(reason))
    })
  }

  /**
   * 获取状态信息
   */
  getStatus(): {
    activeCount: number
    queuedCount: number
    maxConcurrent: number
    maxQueueSize: number
    deduplication: DeduplicationStats
  } {
    return {
      activeCount: this.activeRequests.size,
      queuedCount: this.requestQueue.length,
      maxConcurrent: this.config.maxConcurrent,
      maxQueueSize: this.config.maxQueueSize,
      deduplication: this.deduplicationManager.getStats(),
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ConcurrencyConfig>): void {
    Object.assign(this.config, config)

    // 如果降低了最大并发数，需要处理队列
    this.processQueue()
  }

  /**
   * 获取当前配置
   */
  getConfig(): Required<ConcurrencyConfig> {
    return { ...this.config }
  }

  /**
   * 获取去重统计信息
   */
  getDeduplicationStats(): DeduplicationStats {
    return this.deduplicationManager.getStats()
  }

  /**
   * 重置去重统计信息
   */
  resetDeduplicationStats(): void {
    this.deduplicationManager.resetStats()
  }

  /**
   * 检查请求是否正在去重处理中
   */
  isRequestDeduplicating(config: RequestConfig): boolean {
    const key = this.keyGenerator.generate(config)
    return this.deduplicationManager.isRunning(key)
  }

  /**
   * 取消特定的去重请求
   */
  cancelDeduplicatedRequest(config: RequestConfig): void {
    const key = this.keyGenerator.generate(config)
    this.deduplicationManager.cancel(key)
  }

  /**
   * 等待特定去重请求完成
   */
  async waitForDeduplicatedRequest<T = any>(config: RequestConfig): Promise<ResponseData<T> | null> {
    const key = this.keyGenerator.generate(config)
    return this.deduplicationManager.waitFor<T>(key)
  }

  /**
   * 获取所有去重任务信息
   */
  getDeduplicationTasksInfo(): Array<{
    key: string
    createdAt: number
    refCount: number
    duration: number
  }> {
    return this.deduplicationManager.getAllTaskInfo()
  }

  /**
   * 清理超时的去重任务
   */
  cleanupTimeoutDeduplicationTasks(timeoutMs: number = 30000): number {
    return this.deduplicationManager.cleanupTimeoutTasks(timeoutMs)
  }

  /**
   * 配置去重键生成器
   */
  configureDeduplicationKeyGenerator(config: DeduplicationKeyConfig): void {
    this.keyGenerator = new DeduplicationKeyGenerator(config)
  }

  /**
   * 生成任务 ID
   */
  private generateTaskId(): string {
    return `task_${++this.requestCounter}_${Date.now()}`
  }
}

/**
 * 去重任务信息
 */
interface DeduplicationTask<T = any> {
  /** 任务 Promise */
  promise: Promise<ResponseData<T>>
  /** 创建时间 */
  createdAt: number
  /** 引用计数 */
  refCount: number
  /** 任务键 */
  key: string
}

/**
 * 去重统计信息
 */
export interface DeduplicationStats {
  /** 执行的请求数 */
  executions: number
  /** 去重的请求数 */
  duplications: number
  /** 节省的请求数 */
  savedRequests: number
  /** 去重率 */
  deduplicationRate: number
  /** 当前待处理请求数 */
  pendingCount: number
}

/**
 * 请求去重管理器（优化版）
 *
 * 优化点：
 * 1. 添加自动清理机制，防止内存泄漏
 * 2. 实现 LRU 策略，限制缓存大小
 * 3. 优化内存占用
 */
export class DeduplicationManager {
  private pendingRequests = new Map<string, DeduplicationTask>()
  private stats = {
    executions: 0,
    duplications: 0,
    savedRequests: 0,
  }

  // 配置项
  private maxPendingRequests = 1000 // 最大待处理请求数
  private cleanupInterval = 30000 // 清理间隔（30秒）
  private requestTimeout = 60000 // 请求超时时间（60秒）
  private cleanupTimer?: ReturnType<typeof setTimeout>

  constructor() {
    // 启动自动清理
    this.startAutoCleanup()
  }

  /**
   * 执行请求（带去重和自动清理）
   */
  async execute<T = any>(
    key: string,
    requestFn: () => Promise<ResponseData<T>>,
  ): Promise<ResponseData<T>> {
    // 检查是否有相同的请求正在进行
    const existingTask = this.pendingRequests.get(key)
    if (existingTask) {
      // 增加引用计数
      existingTask.refCount++
      this.stats.duplications++
      this.stats.savedRequests++

      return existingTask.promise as Promise<ResponseData<T>>
    }

    // 检查是否达到最大待处理请求数
    if (this.pendingRequests.size >= this.maxPendingRequests) {
      // 清理最旧的请求
      this.cleanupOldestRequest()
    }

    // 创建新的请求
    const requestPromise = requestFn().finally(() => {
      // 请求完成后清理
      this.pendingRequests.delete(key)
    })

    const task: DeduplicationTask<T> = {
      promise: requestPromise,
      createdAt: Date.now(),
      refCount: 1,
      key,
    }

    this.pendingRequests.set(key, task)
    this.stats.executions++

    return requestPromise
  }

  /**
   * 启动自动清理
   */
  private startAutoCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupTimeoutTasks(this.requestTimeout)
    }, this.cleanupInterval)
  }

  /**
   * 清理最旧的请求（LRU）
   */
  private cleanupOldestRequest(): void {
    let oldestKey: string | null = null
    let oldestTime = Number.POSITIVE_INFINITY

    for (const [key, task] of this.pendingRequests) {
      if (task.createdAt < oldestTime) {
        oldestTime = task.createdAt
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.pendingRequests.delete(oldestKey)
    }
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
    this.pendingRequests.clear()
  }

  /**
   * 取消指定请求
   */
  cancel(key: string): void {
    this.pendingRequests.delete(key)
  }

  /**
   * 取消所有请求
   */
  cancelAll(): void {
    this.pendingRequests.clear()
  }

  /**
   * 获取待处理请求数量
   */
  getPendingCount(): number {
    return this.pendingRequests.size
  }

  /**
   * 获取所有待处理请求的键
   */
  getPendingKeys(): string[] {
    return Array.from(this.pendingRequests.keys())
  }

  /**
   * 检查请求是否正在进行
   */
  isRunning(key: string): boolean {
    return this.pendingRequests.has(key)
  }

  /**
   * 获取任务信息
   */
  getTaskInfo(key: string): {
    key: string
    createdAt: number
    refCount: number
    duration: number
  } | null {
    const task = this.pendingRequests.get(key)
    if (!task) {
      return null
    }

    return {
      key: task.key,
      createdAt: task.createdAt,
      refCount: task.refCount,
      duration: Date.now() - task.createdAt,
    }
  }

  /**
   * 获取所有任务信息
   */
  getAllTaskInfo(): Array<{
    key: string
    createdAt: number
    refCount: number
    duration: number
  }> {
    return Array.from(this.pendingRequests.values()).map(task => ({
      key: task.key,
      createdAt: task.createdAt,
      refCount: task.refCount,
      duration: Date.now() - task.createdAt,
    }))
  }

  /**
   * 获取统计信息
   */
  getStats(): DeduplicationStats {
    const totalRequests = this.stats.executions + this.stats.duplications
    return {
      executions: this.stats.executions,
      duplications: this.stats.duplications,
      savedRequests: this.stats.savedRequests,
      deduplicationRate: totalRequests > 0 ? this.stats.duplications / totalRequests : 0,
      pendingCount: this.pendingRequests.size,
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      executions: 0,
      duplications: 0,
      savedRequests: 0,
    }
  }

  /**
   * 等待指定请求完成
   */
  async waitFor<T = any>(key: string): Promise<ResponseData<T> | null> {
    const task = this.pendingRequests.get(key)
    if (!task) {
      return null
    }

    try {
      return await task.promise as ResponseData<T>
    }
    catch {
      return null
    }
  }

  /**
   * 等待所有请求完成
   */
  async waitForAll(): Promise<void> {
    const promises = Array.from(this.pendingRequests.values()).map(
      task => task.promise.catch(() => { }), // 忽略错误，只等待完成
    )

    await Promise.all(promises)
  }

  /**
   * 获取引用计数最高的请求
   */
  getMostReferencedTask(): {
    key: string
    refCount: number
  } | null {
    let maxRefCount = 0
    let mostReferencedKey = ''

    for (const [key, task] of this.pendingRequests) {
      if (task.refCount > maxRefCount) {
        maxRefCount = task.refCount
        mostReferencedKey = key
      }
    }

    return maxRefCount > 0 ? { key: mostReferencedKey, refCount: maxRefCount } : null
  }

  /**
   * 获取运行时间最长的请求
   */
  getLongestRunningTask(): {
    key: string
    duration: number
  } | null {
    let maxDuration = 0
    let longestKey = ''

    const now = Date.now()
    for (const [key, task] of this.pendingRequests) {
      const duration = now - task.createdAt
      if (duration > maxDuration) {
        maxDuration = duration
        longestKey = key
      }
    }

    return maxDuration > 0 ? { key: longestKey, duration: maxDuration } : null
  }

  /**
   * 清理超时的请求
   */
  cleanupTimeoutTasks(timeoutMs: number): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, task] of this.pendingRequests) {
      if (now - task.createdAt > timeoutMs) {
        this.pendingRequests.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }
}

/**
 * 速率限制管理器
 */
export class RateLimitManager {
  private requests: number[] = []
  private maxRequests: number
  private timeWindow: number

  constructor(maxRequests = 100, timeWindow = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindow
  }

  /**
   * 检查是否可以发送请求
   */
  canMakeRequest(): boolean {
    const now = Date.now()

    // 清理过期的请求记录
    this.requests = this.requests.filter(
      timestamp => now - timestamp < this.timeWindow,
    )

    return this.requests.length < this.maxRequests
  }

  /**
   * 记录请求
   */
  recordRequest(): void {
    this.requests.push(Date.now())
  }

  /**
   * 获取下次可以请求的时间
   */
  getNextAvailableTime(): number {
    if (this.canMakeRequest()) {
      return 0
    }

    const oldestRequest = Math.min(...this.requests)
    return oldestRequest + this.timeWindow - Date.now()
  }

  /**
   * 等待直到可以发送请求
   */
  async waitForAvailability(): Promise<void> {
    const waitTime = this.getNextAvailableTime()
    if (waitTime > 0) {
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
  }

  /**
   * 重置计数器
   */
  reset(): void {
    this.requests = []
  }

  /**
   * 获取当前状态
   */
  getStatus(): {
    currentRequests: number
    maxRequests: number
    timeWindow: number
    nextAvailableTime: number
  } {
    return {
      currentRequests: this.requests.length,
      maxRequests: this.maxRequests,
      timeWindow: this.timeWindow,
      nextAvailableTime: this.getNextAvailableTime(),
    }
  }
}

/**
 * 创建并发管理器
 */
export function createConcurrencyManager(
  config?: ConcurrencyConfig,
): ConcurrencyManager {
  return new ConcurrencyManager(config)
}

/**
 * 去重键生成器配置
 */
export interface DeduplicationKeyConfig {
  /** 是否包含请求方法 */
  includeMethod?: boolean
  /** 是否包含URL */
  includeUrl?: boolean
  /** 是否包含查询参数 */
  includeParams?: boolean
  /** 是否包含请求体 */
  includeData?: boolean
  /** 是否包含请求头 */
  includeHeaders?: boolean
  /** 要包含的特定请求头 */
  specificHeaders?: string[]
  /** 自定义键生成函数 */
  customGenerator?: (config: RequestConfig) => string
}

/**
 * 智能去重键生成器（优化版）
 *
 * 优化点：
 * 1. 添加键缓存，避免重复计算
 * 2. 使用 WeakMap 自动管理缓存生命周期
 * 3. 优化序列化性能
 */
export class DeduplicationKeyGenerator {
  private config: Required<Omit<DeduplicationKeyConfig, 'customGenerator'>> & Pick<DeduplicationKeyConfig, 'customGenerator'>
  // 使用 WeakMap 缓存键，自动垃圾回收
  private keyCache = new WeakMap<RequestConfig, string>()
  // 对于非对象配置，使用普通 Map（带 LRU）
  private stringKeyCache = new Map<string, string>()
  private maxCacheSize = 1000

  constructor(config: DeduplicationKeyConfig = {}) {
    this.config = {
      includeMethod: true,
      includeUrl: true,
      includeParams: true,
      includeData: false,
      includeHeaders: false,
      specificHeaders: [],
      customGenerator: config.customGenerator,
      ...config,
    }
  }

  /**
   * 生成去重键（优化版 - 带缓存）
   */
  generate(requestConfig: RequestConfig): string {
    // 尝试从缓存获取
    const cached = this.keyCache.get(requestConfig)
    if (cached) {
      return cached
    }

    // 生成新键
    const key = this.generateKey(requestConfig)

    // 缓存结果
    this.keyCache.set(requestConfig, key)

    // 同时缓存到字符串 Map（用于相同配置的不同对象实例）
    this.cacheStringKey(key)

    return key
  }

  /**
   * 实际生成键的逻辑
   */
  private generateKey(requestConfig: RequestConfig): string {
    if (this.config.customGenerator) {
      return this.config.customGenerator(requestConfig)
    }

    const parts: string[] = []

    if (this.config.includeMethod && requestConfig.method) {
      parts.push(`method:${requestConfig.method.toUpperCase()}`)
    }

    if (this.config.includeUrl && requestConfig.url) {
      parts.push(`url:${requestConfig.url}`)
    }

    if (this.config.includeParams && requestConfig.params) {
      const paramsStr = this.serializeParams(requestConfig.params)
      if (paramsStr) {
        parts.push(`params:${paramsStr}`)
      }
    }

    if (this.config.includeData && requestConfig.data) {
      const dataStr = this.serializeData(requestConfig.data)
      if (dataStr) {
        parts.push(`data:${dataStr}`)
      }
    }

    if (this.config.includeHeaders && requestConfig.headers) {
      const headersStr = this.serializeHeaders(requestConfig.headers)
      if (headersStr) {
        parts.push(`headers:${headersStr}`)
      }
    }

    if (this.config.specificHeaders.length > 0 && requestConfig.headers) {
      const specificHeadersStr = this.serializeSpecificHeaders(
        requestConfig.headers,
        this.config.specificHeaders,
      )
      if (specificHeadersStr) {
        parts.push(`specific-headers:${specificHeadersStr}`)
      }
    }

    return parts.join('|')
  }

  /**
   * 缓存字符串键（LRU）
   */
  private cacheStringKey(key: string): void {
    // 如果缓存已满，删除最旧的项
    if (this.stringKeyCache.size >= this.maxCacheSize) {
      const firstKey = this.stringKeyCache.keys().next().value
      if (firstKey) {
        this.stringKeyCache.delete(firstKey)
      }
    }
    this.stringKeyCache.set(key, key)
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.stringKeyCache.clear()
  }

  /**
   * 序列化参数（优化版 - 减少对象创建）
   */
  private serializeParams(params: Record<string, any>): string {
    try {
      const keys = Object.keys(params).sort()
      // 直接构建字符串，避免创建中间对象
      const parts: string[] = []
      for (const key of keys) {
        parts.push(`${key}:${JSON.stringify(params[key])}`)
      }
      return parts.join(',')
    }
    catch {
      return String(params)
    }
  }

  /**
   * 序列化数据（优化版）
   */
  private serializeData(data: any): string {
    try {
      if (data instanceof FormData) {
        // FormData 特殊处理
        const entries: string[] = []
        for (const [key, value] of data.entries()) {
          entries.push(`${key}:${typeof value === 'string' ? value : '[File]'}`)
        }
        return entries.sort().join(',')
      }

      if (typeof data === 'object' && data !== null) {
        // 直接构建字符串，避免创建排序后的对象
        const keys = Object.keys(data).sort()
        const parts: string[] = []
        for (const key of keys) {
          parts.push(`${key}:${JSON.stringify(data[key])}`)
        }
        return parts.join(',')
      }

      return String(data)
    }
    catch {
      return String(data)
    }
  }

  /**
   * 序列化请求头（优化版）
   */
  private serializeHeaders(headers: Record<string, string>): string {
    try {
      // 排除一些动态的请求头
      const excludeHeaders = new Set(['authorization', 'x-request-id', 'x-timestamp'])
      const parts: string[] = []

      const keys = Object.keys(headers).sort()
      for (const key of keys) {
        if (!excludeHeaders.has(key.toLowerCase())) {
          parts.push(`${key}:${headers[key]}`)
        }
      }

      return parts.join(',')
    }
    catch {
      return String(headers)
    }
  }

  /**
   * 序列化特定请求头（优化版）
   */
  private serializeSpecificHeaders(
    headers: Record<string, string>,
    specificHeaders: string[],
  ): string {
    try {
      const parts: string[] = []
      const sortedHeaders = [...specificHeaders].sort()

      for (const header of sortedHeaders) {
        if (headers[header] !== undefined) {
          parts.push(`${header}:${headers[header]}`)
        }
      }

      return parts.join(',')
    }
    catch {
      return ''
    }
  }
}

/**
 * 创建去重管理器
 */
export function createDeduplicationManager(): DeduplicationManager {
  return new DeduplicationManager()
}

/**
 * 创建去重键生成器
 */
export function createDeduplicationKeyGenerator(
  config?: DeduplicationKeyConfig,
): DeduplicationKeyGenerator {
  return new DeduplicationKeyGenerator(config)
}

/**
 * 创建速率限制管理器
 */
export function createRateLimitManager(
  maxRequests?: number,
  timeWindow?: number,
): RateLimitManager {
  return new RateLimitManager(maxRequests, timeWindow)
}
