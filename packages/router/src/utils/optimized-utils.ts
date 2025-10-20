/**
 * 优化的工具函数集合 - 减少内存占用和临时对象创建
 */

/**
 * 字符串操作优化
 */
export class StringUtils {
  // 字符串缓冲池，复用字符串
  private static stringPool = new Map<string, string>()
  private static readonly MAX_POOL_SIZE = 1000
  
  /**
   * 字符串内部化 - 复用相同字符串
   */
  static intern(str: string): string {
    if (!str) return str
    
    let interned = this.stringPool.get(str)
    if (!interned) {
      if (this.stringPool.size >= this.MAX_POOL_SIZE) {
        // 清理最早的 10%
        const toDelete = Math.floor(this.MAX_POOL_SIZE * 0.1)
        const keys = Array.from(this.stringPool.keys())
        for (let i = 0; i < toDelete && i < keys.length; i++) {
          const key = keys[i]
          if (key !== undefined) {
            this.stringPool.delete(key)
          }
        }
      }
      this.stringPool.set(str, str)
      interned = str
    }
    return interned
  }
  
  /**
   * 高效的路径拼接 - 避免创建临时字符串
   */
  static joinPath(...segments: string[]): string {
    // 使用单次遍历和单次 join，避免多次字符串操作
    const cleaned = []
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (segment && segment !== '/') {
        cleaned.push(segment.replace(/^\/+|\/+$/g, ''))
      }
    }
    return `/${  cleaned.join('/')}`
  }
  
  /**
   * 路径分割优化 - 复用数组
   */
  private static segmentCache = new Map<string, string[]>()
  
  static splitPath(path: string): string[] {
    let segments = this.segmentCache.get(path)
    if (!segments) {
      segments = path.split('/').filter(Boolean)
      if (this.segmentCache.size < 100) {
        this.segmentCache.set(path, segments)
      }
    }
    return segments.slice() // 返回副本，避免外部修改
  }
  
  /**
   * 查询字符串解析优化
   */
  private static queryCache = new Map<string, Record<string, string>>()
  
  static parseQuery(queryString: string): Record<string, string> {
    if (!queryString) return {}
    
    const cached = this.queryCache.get(queryString)
    if (cached) return { ...cached } // 返回副本
    
    const query: Record<string, string> = Object.create(null)
    const pairs = queryString.replace(/^\?/, '').split('&')
    
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]
      if (!pair) continue
      
      const eqIndex = pair.indexOf('=')
      if (eqIndex === -1) {
        query[decodeURIComponent(pair)] = ''
      } else {
        const key = decodeURIComponent(pair.slice(0, eqIndex))
        const value = decodeURIComponent(pair.slice(eqIndex + 1))
        query[key] = value
      }
    }
    
    // 缓存结果
    if (this.queryCache.size < 50) {
      this.queryCache.set(queryString, query)
    }
    
    return query
  }
  
  /**
   * 清理缓存
   */
  static clearCaches(): void {
    this.stringPool.clear()
    this.segmentCache.clear()
    this.queryCache.clear()
  }
}

/**
 * 对象操作优化
 */
export class ObjectUtils {
  // 对象池，复用空对象
  private static emptyObjects: any[] = []
  private static readonly MAX_POOL_SIZE = 50
  
  /**
   * 获取空对象 - 从池中获取或创建新的
   */
  static getEmptyObject(): any {
    return this.emptyObjects.pop() || Object.create(null)
  }
  
  /**
   * 释放对象回池
   */
  static releaseObject(obj: any): void {
    if (!obj || typeof obj !== 'object') return
    
    // 清理对象属性
    for (const key in obj) {
      delete obj[key]
    }
    
    // 放回池中
    if (this.emptyObjects.length < this.MAX_POOL_SIZE) {
      this.emptyObjects.push(obj)
    }
  }
  
  /**
   * 浅克隆优化 - 避免 Object.assign 的开销
   */
  static shallowClone<T extends object>(obj: T): T {
    if (!obj) return obj
    
    const clone = this.getEmptyObject()
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clone[key] = obj[key]
      }
    }
    return clone
  }
  
  /**
   * 深度冻结优化 - 使用迭代代替递归
   */
  static deepFreeze<T extends object>(obj: T): T {
    const toFreeze: object[] = [obj]
    const frozen = new WeakSet()
    
    while (toFreeze.length > 0) {
      const current = toFreeze.pop()!
      
      if (frozen.has(current)) continue
      
      Object.freeze(current)
      frozen.add(current)
      
      for (const key in current) {
        const value = (current as any)[key]
        if (value && typeof value === 'object' && !frozen.has(value)) {
          toFreeze.push(value)
        }
      }
    }
    
    return obj
  }
  
  /**
   * 对象差异比较 - 优化内存使用
   */
  static diff(oldObj: any, newObj: any): { added: string[], removed: string[], modified: string[] } {
    const added: string[] = []
    const removed: string[] = []
    const modified: string[] = []
    
    // 使用 Set 优化查找
    const oldKeys = new Set(Object.keys(oldObj || {}))
    const newKeys = new Set(Object.keys(newObj || {}))
    
    // 查找新增和修改的键
    for (const key of newKeys) {
      if (!oldKeys.has(key)) {
        added.push(key)
      } else if (oldObj[key] !== newObj[key]) {
        modified.push(key)
      }
    }
    
    // 查找删除的键
    for (const key of oldKeys) {
      if (!newKeys.has(key)) {
        removed.push(key)
      }
    }
    
    return { added, removed, modified }
  }
  
  /**
   * 清理对象池
   */
  static clearCache(): void {
    this.emptyObjects.length = 0
  }
}

/**
 * 数组操作优化
 */
export class ArrayUtils {
  // 数组池
  private static arrayPool: any[][] = []
  private static readonly MAX_POOL_SIZE = 30
  
  /**
   * 获取空数组
   */
  static getArray<T>(): T[] {
    return this.arrayPool.pop() || []
  }
  
  /**
   * 释放数组
   */
  static releaseArray(arr: any[]): void {
    if (!Array.isArray(arr)) return
    
    arr.length = 0
    
    if (this.arrayPool.length < this.MAX_POOL_SIZE) {
      this.arrayPool.push(arr)
    }
  }
  
  /**
   * 数组去重优化 - 使用 Set
   */
  static unique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr))
  }
  
  /**
   * 数组分片处理 - 避免大数组一次性处理
   */
  static* chunk<T>(arr: T[], size: number): Generator<T[]> {
    for (let i = 0; i < arr.length; i += size) {
      yield arr.slice(i, i + size)
    }
  }
  
  /**
   * 高效的数组过滤 - 复用结果数组
   */
  static filter<T>(arr: T[], predicate: (item: T, index: number) => boolean): T[] {
    const result = this.getArray<T>()
    
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i]
      if (item !== undefined && predicate(item, i)) {
        result.push(item)
      }
    }
    
    return result
  }
  
  /**
   * 二分查找 - 用于有序数组
   */
  static binarySearch<T>(arr: T[], target: T, compareFn?: (a: T, b: T) => number): number {
    let left = 0
    let right = arr.length - 1
    
    const compare = compareFn || ((a, b) => a < b ? -1 : a > b ? 1 : 0)
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const midValue = arr[mid]
      if (midValue === undefined) return -1
      
      const cmp = compare(midValue, target)
      
      if (cmp === 0) return mid
      if (cmp < 0) left = mid + 1
      else right = mid - 1
    }
    
    return -1
  }
  
  /**
   * 清理数组池
   */
  static clearCache(): void {
    this.arrayPool.length = 0
  }
}

/**
 * 函数工具优化
 */
export class FunctionUtils {
  // 缓存函数结果
  private static memoCache = new WeakMap<Function, Map<string, any>>()
  
  /**
   * 记忆化函数 - 缓存计算结果
   */
  static memoize<T extends (...args: any[]) => any>(fn: T): T {
    let cache = this.memoCache.get(fn)
    if (!cache) {
      cache = new Map()
      this.memoCache.set(fn, cache)
    }
    
    return ((...args: any[]) => {
      const key = JSON.stringify(args)
      
      if (cache!.has(key)) {
        return cache!.get(key)
      }
      
      const result = fn(...args)
      
      // 限制缓存大小
      if (cache!.size >= 100) {
        const firstKey = cache!.keys().next().value
        if (firstKey !== undefined) {
          cache!.delete(firstKey)
        }
      }
      
      cache!.set(key, result)
      return result
    }) as T
  }
  
  /**
   * 防抖优化 - 复用定时器
   */
  private static debounceTimers = new WeakMap<Function, ReturnType<typeof setTimeout>>()
  
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const prevTimer = this.debounceTimers.get(fn)
      if (prevTimer !== undefined) {
        clearTimeout(prevTimer)
      }
      
      const timer = setTimeout(() => {
        this.debounceTimers.delete(fn)
        fn(...args)
      }, delay)
      
      this.debounceTimers.set(fn, timer)
    }
  }
  
  /**
   * 节流优化 - 使用时间戳
   */
  private static throttleTimestamps = new WeakMap<Function, number>()
  
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    return (...args: Parameters<T>) => {
      const now = Date.now()
      const lastCall = this.throttleTimestamps.get(fn) || 0
      
      if (now - lastCall >= limit) {
        this.throttleTimestamps.set(fn, now)
        fn(...args)
      }
    }
  }
  
  /**
   * 一次性函数 - 确保函数只执行一次
   */
  private static onceFlags = new WeakSet<Function>()
  
  static once<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => {
      if (!this.onceFlags.has(fn)) {
        this.onceFlags.add(fn)
        return fn(...args)
      }
    }) as T
  }
  
  /**
   * 清理缓存
   */
  static clearCache(): void {
    this.memoCache = new WeakMap()
  }
}

/**
 * 异步工具优化
 */
export class AsyncUtils {
  // Promise 池
  private static promisePool: Promise<any>[] = []
  private static resolvedPromise = Promise.resolve()
  
  /**
   * 获取已解决的 Promise
   */
  static getResolvedPromise<T>(value?: T): Promise<T> {
    return value === undefined ? this.resolvedPromise as Promise<T> : Promise.resolve(value)
  }
  
  /**
   * 批量并发控制
   */
  static async parallelLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = []
    const executing: Promise<void>[] = []
    
    for (const item of items) {
      const promise = Promise.resolve().then(() => fn(item)).then(
        result => { results.push(result) }
      )
      
      executing.push(promise as any)
      
      if (executing.length >= limit) {
        await Promise.race(executing)
        executing.splice(executing.findIndex(p => p), 1)
      }
    }
    
    await Promise.all(executing)
    return results
  }
  
  /**
   * 超时 Promise
   */
  static withTimeout<T>(
    promise: Promise<T>,
    timeout: number,
    error?: Error
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(error || new Error(`Promise timed out after ${timeout}ms`))
      }, timeout)
      
      promise.then(
        value => {
          clearTimeout(timer)
          resolve(value)
        },
        err => {
          clearTimeout(timer)
          reject(err)
        }
      )
    })
  }
  
  /**
   * 重试机制
   */
  static async retry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: any
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
        }
      }
    }
    
    throw lastError
  }
  
  /**
   * 清理Promise池
   */
  static clearCache(): void {
    this.promisePool.length = 0
  }
}

/**
 * 内存管理工具
 */
export class MemoryUtils {
  private static measurements: number[] = []
  // private static readonly _MAX_MEASUREMENTS = 100 // 保留用于未来功能
  
  /**
   * 测量函数内存使用
   */
  static async measureMemory<T>(fn: () => T | Promise<T>): Promise<{
    result: T
    memoryUsed: number
    time: number
  }> {
    const startMemory = this.getMemoryUsage()
    const startTime = performance.now()
    
    const result = await fn()
    
    const endTime = performance.now()
    const endMemory = this.getMemoryUsage()
    
    return {
      result,
      memoryUsed: endMemory - startMemory,
      time: endTime - startTime
    }
  }
  
  /**
   * 获取当前内存使用
   */
  static getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }
  
  /**
   * 内存泄漏检测
   */
  private static leakDetectors = new Map<string, { count: number, lastSize: number }>()
  
  static detectLeak(key: string, size: number): boolean {
    const detector = this.leakDetectors.get(key) || { count: 0, lastSize: 0 }
    
    if (size > detector.lastSize * 1.5 && detector.count > 5) {
      console.warn(`Potential memory leak detected: ${key}`)
      return true
    }
    
    detector.count++
    detector.lastSize = size
    this.leakDetectors.set(key, detector)
    
    // 清理旧的检测器
    if (this.leakDetectors.size > 100) {
      const firstKey = this.leakDetectors.keys().next().value
      if (firstKey !== undefined) {
        this.leakDetectors.delete(firstKey)
      }
    }
    
    return false
  }
  
  /**
   * 手动触发垃圾回收（如果可用）
   */
  static gc(): void {
    if (typeof globalThis !== 'undefined' && typeof (globalThis as any).gc === 'function') {
      (globalThis as any).gc()
    }
  }
  
  /**
   * 清理所有缓存
   */
  static clearAllCaches(): void {
    StringUtils.clearCaches()
    ArrayUtils.clearCache()
    ObjectUtils.clearCache()
    FunctionUtils.clearCache()
    AsyncUtils.clearCache()
    this.measurements.length = 0
    this.leakDetectors.clear()
  }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
  private static marks = new Map<string, number>()
  private static measures = new Map<string, number[]>()
  
  /**
   * 开始标记
   */
  static mark(name: string): void {
    this.marks.set(name, performance.now())
  }
  
  /**
   * 测量并记录
   */
  static measure(name: string, startMark: string): number {
    const start = this.marks.get(startMark)
    if (!start) return 0
    
    const duration = performance.now() - start
    
    let measures = this.measures.get(name)
    if (!measures) {
      measures = []
      this.measures.set(name, measures)
    }
    
    measures.push(duration)
    
    // 限制记录数量
    if (measures.length > 100) {
      measures.shift()
    }
    
    return duration
  }
  
  /**
   * 获取统计信息
   */
  static getStats(name: string): {
    count: number
    total: number
    average: number
    min: number
    max: number
  } | null {
    const measures = this.measures.get(name)
    if (!measures || measures.length === 0) return null
    
    const total = measures.reduce((a, b) => a + b, 0)
    
    return {
      count: measures.length,
      total,
      average: total / measures.length,
      min: Math.min(...measures),
      max: Math.max(...measures)
    }
  }
  
  /**
   * 清理监控数据
   */
  static clear(): void {
    this.marks.clear()
    this.measures.clear()
  }
}