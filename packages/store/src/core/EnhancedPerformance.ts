/**
 * 增强版性能优化模块
 * 提供懒加载、预加载、内存管理、并发控制等高级性能优化功能
 */


/**
 * 懒加载管理器
 * 支持按需加载数据，减少初始加载时间
 */
export class LazyLoadManager<T = any> {
  private loaders = new Map<string, () => Promise<T>>()
  private cache = new Map<string, T>()
  private loading = new Map<string, Promise<T>>()

  /**
   * 注册懒加载器
   */
  register(key: string, loader: () => Promise<T>): void {
    this.loaders.set(key, loader)
  }

  /**
   * 加载数据
   */
  async load(key: string): Promise<T> {
    // 检查缓存
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }

    // 检查是否正在加载
    if (this.loading.has(key)) {
      return this.loading.get(key)!
    }

    // 获取加载器
    const loader = this.loaders.get(key)
    if (!loader) {
      throw new Error(`No loader registered for key: ${key}`)
    }

    // 开始加载
    const loadPromise = loader().then(data => {
      this.cache.set(key, data)
      this.loading.delete(key)
      return data
    }).catch(error => {
      this.loading.delete(key)
      throw error
    })

    this.loading.set(key, loadPromise)
    return loadPromise
  }

  /**
   * 预加载数据
   */
  async preload(keys: string[]): Promise<void> {
    await Promise.all(keys.map(key => this.load(key).catch(() => {})))
  }

  /**
   * 清除缓存
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key)
      this.loading.delete(key)
    } else {
      this.cache.clear()
      this.loading.clear()
    }
  }

  /**
   * 是否已加载
   */
  isLoaded(key: string): boolean {
    return this.cache.has(key)
  }

  /**
   * 是否正在加载
   */
  isLoading(key: string): boolean {
    return this.loading.has(key)
  }
}

/**
 * 预加载管理器
 * 支持预测性加载，提前加载可能需要的数据
 */
export class PreloadManager {
  private queue: Array<{ priority: number; task: () => Promise<any> }> = []
  private isProcessing = false
  private maxConcurrent = 3
  private activeCount = 0

  constructor(options?: { maxConcurrent?: number }) {
    if (options?.maxConcurrent) {
      this.maxConcurrent = options.maxConcurrent
    }
  }

  /**
   * 添加预加载任务
   */
  add(task: () => Promise<any>, priority = 0): void {
    this.queue.push({ priority, task })
    this.queue.sort((a, b) => b.priority - a.priority)
    this.process()
  }

  /**
   * 处理预加载队列
   */
  private async process(): Promise<void> {
    if (this.isProcessing || this.activeCount >= this.maxConcurrent) {
      return
    }

    this.isProcessing = true

    while (this.queue.length > 0 && this.activeCount < this.maxConcurrent) {
      const item = this.queue.shift()
      if (item) {
        this.activeCount++
        item.task()
          .catch(error => console.warn('Preload failed:', error))
          .finally(() => {
            this.activeCount--
            this.process()
          })
      }
    }

    this.isProcessing = false
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
  }

  /**
   * 获取队列大小
   */
  get size(): number {
    return this.queue.length
  }
}

/**
 * 内存管理器
 * 监控和管理内存使用，防止内存泄漏
 */
export class MemoryManager {
  private references = new Map<string, any>()
  private weakReferences = new WeakMap<any, string>()
  private memoryLimit = 50 * 1024 * 1024 // 50MB
  private checkInterval: number | null = null

  constructor(options?: { memoryLimit?: number; autoCleanup?: boolean }) {
    if (options?.memoryLimit) {
      this.memoryLimit = options.memoryLimit
    }

    if (options?.autoCleanup) {
      this.startAutoCleanup()
    }
  }

  /**
   * 注册对象引用
   */
  register(key: string, value: any): void {
    this.references.set(key, value)
    if (typeof value === 'object' && value !== null) {
      this.weakReferences.set(value, key)
    }
  }

  /**
   * 获取对象引用
   */
  get(key: string): any {
    return this.references.get(key)
  }

  /**
   * 清理无效引用
   */
  cleanup(): void {
    // 清理不再使用的引用
    const keysToDelete: string[] = []
    for (const [key, value] of this.references) {
      if (!value || (typeof value === 'object' && !this.weakReferences.has(value))) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.references.delete(key))
  }

  /**
   * 开始自动清理
   */
  startAutoCleanup(interval = 60000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }
    this.checkInterval = window.setInterval(() => this.cleanup(), interval)
  }

  /**
   * 停止自动清理
   */
  stopAutoCleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  /**
   * 获取内存使用估算
   */
  estimateMemoryUsage(): number {
    let total = 0
    for (const [, value] of this.references) {
      if (value) {
        total += this.estimateSize(value)
      }
    }
    return total
  }

  /**
   * 估算对象大小
   */
  private estimateSize(obj: any): number {
    if (obj === null || obj === undefined) return 0
    if (typeof obj === 'boolean') return 4
    if (typeof obj === 'number') return 8
    if (typeof obj === 'string') return obj.length * 2
    if (obj instanceof Date) return 8
    if (obj instanceof RegExp) return obj.toString().length * 2
    if (typeof obj === 'object') {
      let size = 0
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          size += key.length * 2
          size += this.estimateSize(obj[key])
        }
      }
      return size
    }
    return 0
  }

  /**
   * 检查内存限制
   */
  checkMemoryLimit(): boolean {
    return this.estimateMemoryUsage() < this.memoryLimit
  }
}

/**
 * 并发控制器
 * 控制并发操作数量，防止资源过度消耗
 */
export class ConcurrencyController {
  private queue: Array<{
    task: () => Promise<any>
    resolve: (value: any) => void
    reject: (reason?: any) => void
  }> = []
  private activeCount = 0
  private maxConcurrent: number

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent
  }

  /**
   * 执行任务
   */
  async execute<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push({ task, resolve, reject })
      this.process()
    })
  }

  /**
   * 处理队列
   */
  private async process(): Promise<void> {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return
    }

    const item = this.queue.shift()
    if (!item) return

    this.activeCount++

    try {
      const result = await item.task()
      item.resolve(result)
    } catch (error) {
      item.reject(error)
    } finally {
      this.activeCount--
      this.process()
    }
  }

  /**
   * 获取活跃任务数
   */
  getActiveCount(): number {
    return this.activeCount
  }

  /**
   * 获取队列长度
   */
  getQueueLength(): number {
    return this.queue.length
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue.forEach(item => {
      item.reject(new Error('Queue cleared'))
    })
    this.queue = []
  }

  /**
   * 更新最大并发数
   */
  setMaxConcurrent(max: number): void {
    this.maxConcurrent = max
    // 触发处理以应用新的并发限制
    for (let i = 0; i < max - this.activeCount; i++) {
      this.process()
    }
  }
}

/**
 * 虚拟化管理器
 * 支持大数据集的虚拟化处理，减少DOM渲染压力
 */
export class VirtualizationManager<T = any> {
  private data: T[] = []
  private pageSize = 50
  private currentPage = 0
  private totalPages = 0

  constructor(options?: { pageSize?: number }) {
    if (options?.pageSize) {
      this.pageSize = options.pageSize
    }
  }

  /**
   * 设置数据
   */
  setData(data: T[]): void {
    this.data = data
    this.totalPages = Math.ceil(data.length / this.pageSize)
    this.currentPage = 0
  }

  /**
   * 获取当前页数据
   */
  getCurrentPage(): T[] {
    const start = this.currentPage * this.pageSize
    const end = start + this.pageSize
    return this.data.slice(start, end)
  }

  /**
   * 获取指定页数据
   */
  getPage(page: number): T[] {
    if (page < 0 || page >= this.totalPages) {
      throw new Error('Page out of range')
    }
    const start = page * this.pageSize
    const end = start + this.pageSize
    return this.data.slice(start, end)
  }

  /**
   * 下一页
   */
  nextPage(): T[] | null {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++
      return this.getCurrentPage()
    }
    return null
  }

  /**
   * 上一页
   */
  prevPage(): T[] | null {
    if (this.currentPage > 0) {
      this.currentPage--
      return this.getCurrentPage()
    }
    return null
  }

  /**
   * 跳转到指定页
   */
  goToPage(page: number): T[] {
    if (page < 0 || page >= this.totalPages) {
      throw new Error('Page out of range')
    }
    this.currentPage = page
    return this.getCurrentPage()
  }

  /**
   * 获取可见范围数据
   */
  getVisibleRange(start: number, end: number): T[] {
    return this.data.slice(start, end)
  }

  /**
   * 获取元信息
   */
  getMetadata() {
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      pageSize: this.pageSize,
      totalItems: this.data.length,
      hasNext: this.currentPage < this.totalPages - 1,
      hasPrev: this.currentPage > 0
    }
  }
}

/**
 * 计算优化器
 * 优化复杂计算，避免重复计算
 */
export class ComputationOptimizer {
  private computations = new Map<string, {
    fn: (...args: any[]) => any
    cache: Map<string, { value: any; timestamp: number }>
    ttl: number
  }>()

  /**
   * 注册计算函数
   */
  register(key: string, fn: (...args: any[]) => any, ttl = 5000): void {
    this.computations.set(key, {
      fn,
      cache: new Map(),
      ttl
    })
  }

  /**
   * 执行计算
   */
  compute(key: string, ...args: any[]): any {
    const computation = this.computations.get(key)
    if (!computation) {
      throw new Error(`No computation registered for key: ${key}`)
    }

    const cacheKey = JSON.stringify(args)
    const cached = computation.cache.get(cacheKey)
    const now = Date.now()

    if (cached && now - cached.timestamp < computation.ttl) {
      return cached.value
    }

    const value = computation.fn(...args)
    computation.cache.set(cacheKey, { value, timestamp: now })

    // 清理过期缓存
    for (const [k, v] of computation.cache) {
      if (now - v.timestamp > computation.ttl) {
        computation.cache.delete(k)
      }
    }

    return value
  }

  /**
   * 清除缓存
   */
  clearCache(key?: string): void {
    if (key) {
      const computation = this.computations.get(key)
      if (computation) {
        computation.cache.clear()
      }
    } else {
      for (const computation of this.computations.values()) {
        computation.cache.clear()
      }
    }
  }

  /**
   * 移除计算函数
   */
  unregister(key: string): boolean {
    return this.computations.delete(key)
  }
}

/**
 * 请求合并器
 * 合并相同的请求，减少网络开销
 */
export class RequestMerger {
  private pending = new Map<string, Promise<any>>()
  private cache = new Map<string, { data: any; timestamp: number }>()
  private ttl = 5000

  constructor(options?: { ttl?: number }) {
    if (options?.ttl) {
      this.ttl = options.ttl
    }
  }

  /**
   * 执行请求
   */
  async execute<T>(
    key: string,
    request: () => Promise<T>,
    options?: { force?: boolean; ttl?: number }
  ): Promise<T> {
    // 检查缓存
    if (!options?.force) {
      const cached = this.cache.get(key)
      if (cached && Date.now() - cached.timestamp < (options?.ttl || this.ttl)) {
        return cached.data
      }
    }

    // 检查是否有正在进行的请求
    const pending = this.pending.get(key)
    if (pending) {
      return pending
    }

    // 执行新请求
    const promise = request().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() })
      this.pending.delete(key)
      return data
    }).catch(error => {
      this.pending.delete(key)
      throw error
    })

    this.pending.set(key, promise)
    return promise
  }

  /**
   * 清除缓存
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * 取消请求
   */
  cancel(key: string): void {
    this.pending.delete(key)
  }
}

/**
 * 增强版性能优化器
 * 整合所有性能优化功能
 */
export class EnhancedPerformanceOptimizer {
  public readonly lazyLoad: LazyLoadManager
  public readonly preload: PreloadManager
  public readonly memory: MemoryManager
  public readonly concurrency: ConcurrencyController
  public readonly virtualization: VirtualizationManager
  public readonly computation: ComputationOptimizer
  public readonly requestMerger: RequestMerger

  constructor(options?: {
    maxConcurrent?: number
    memoryLimit?: number
    pageSize?: number
    requestTTL?: number
  }) {
    this.lazyLoad = new LazyLoadManager()
    this.preload = new PreloadManager({ maxConcurrent: options?.maxConcurrent })
    this.memory = new MemoryManager({
      memoryLimit: options?.memoryLimit,
      autoCleanup: true
    })
    this.concurrency = new ConcurrencyController(options?.maxConcurrent)
    this.virtualization = new VirtualizationManager({ pageSize: options?.pageSize })
    this.computation = new ComputationOptimizer()
    this.requestMerger = new RequestMerger({ ttl: options?.requestTTL })
  }

  /**
   * 性能监控
   */
  getMetrics() {
    return {
      memoryUsage: this.memory.estimateMemoryUsage(),
      activeTasks: this.concurrency.getActiveCount(),
      queuedTasks: this.concurrency.getQueueLength(),
      preloadQueue: this.preload.size
    }
  }

  /**
   * 清理所有资源
   */
  dispose(): void {
    this.lazyLoad.clear()
    this.preload.clear()
    this.memory.stopAutoCleanup()
    this.concurrency.clear()
    this.computation.clearCache()
    this.requestMerger.clearCache()
  }
}
