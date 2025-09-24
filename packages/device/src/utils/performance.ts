/**
 * 性能优化工具集
 *
 * 提供防抖、节流、缓存等性能优化功能
 */

/**
 * 防抖函数
 *
 * 在事件被触发n毫秒后再执行回调，如果在这n毫秒内又被触发，则重新计时
 *
 * @param func 要防抖的函数
 * @param wait 延迟执行毫秒数
 * @param immediate 是否立即执行
 * @returns 防抖后的函数
 */
export type DebouncedFunction<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
  cancel: () => void
}

export type ThrottledFunction<T extends (...args: any[]) => any> = ((...args: Parameters<T>) => void) & {
  cancel: () => void
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false,
): DebouncedFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let result: ReturnType<T>

  const debounced = function (this: any, ...args: Parameters<T>) {
    // eslint-disable-next-line ts/no-this-alias
    const context = this

    const later = () => {
      timeout = null
      if (!immediate) {
        result = func.apply(context, args)
      }
    }

    const callNow = immediate && !timeout

    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(later, wait)

    if (callNow) {
      result = func.apply(context, args)
    }

    return result
  }

  // 添加取消方法
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  return debounced as DebouncedFunction<T>
}

/**
 * 节流函数
 *
 * 在一个单位时间内，只能触发一次函数。如果这个单位时间内触发多次函数，只有一次生效
 *
 * @param func 要节流的函数
 * @param wait 延迟执行毫秒数
 * @param options 配置选项
 * @param options.leading 是否在延迟开始前调用
 * @param options.trailing 是否在延迟结束后调用
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean, trailing?: boolean } = {},
): ThrottledFunction<T> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let context: any
  let args: Parameters<T> | null = null
  let result: ReturnType<T>
  let previous = 0

  const { leading = true, trailing = true } = options

  const later = () => {
    previous = leading === false ? 0 : Date.now()
    timeout = null
    if (args) {
      result = func.apply(context, args)
      context = args = null
    }
  }

  const throttled = function (this: any, ...newArgs: Parameters<T>) {
    const now = Date.now()

    if (!previous && leading === false) {
      previous = now
    }

    const remaining = wait - (now - previous)
    // eslint-disable-next-line ts/no-this-alias
    context = this
    args = newArgs

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      result = func.apply(context, args)
      context = args = null
    }
    else if (!timeout && trailing !== false) {
      timeout = setTimeout(later, remaining)
    }

    return result
  }

  // 添加取消方法
  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout)
    }
    previous = 0
    timeout = context = args = null
  }

  return throttled as ThrottledFunction<T>
}

/**
 * 内存缓存类
 *
 * 提供简单的内存缓存功能，支持过期时间和大小限制
 */
export class MemoryCache<T = any> {
  private cache: Map<string, { value: T, expiry?: number }>
  private maxSize: number
  private defaultTTL?: number

  constructor(options: { maxSize?: number, defaultTTL?: number } = {}) {
    this.cache = new Map()
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.defaultTTL
  }

  /**
   * 获取缓存值
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)

    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问顺序（LRU）
    this.cache.delete(key)
    this.cache.set(key, item)

    return item.value
  }

  /**
   * 设置缓存值
   */
  set(key: string, value: T, ttl?: number): void {
    // 如果达到最大容量，删除最旧的项（LRU）
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }

    const expiry = ttl || this.defaultTTL
      ? Date.now() + (ttl || this.defaultTTL!)
      : undefined

    this.cache.set(key, { value, expiry })
  }

  /**
   * 删除缓存值
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * 获取缓存大小
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * 检查是否存在缓存
   */
  has(key: string): boolean {
    const item = this.cache.get(key)

    if (!item) {
      return false
    }

    // 检查是否过期
    if (item.expiry && Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 清理过期缓存
   */
  prune(): void {
    const now = Date.now()

    for (const [key, item] of this.cache.entries()) {
      if (item.expiry && now > item.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * 创建一个带缓存的函数
 *
 * @param fn 要缓存的函数
 * @param options 缓存选项
 * @param options.maxSize 缓存最大大小
 * @param options.ttl 缓存过期时间（毫秒）
 * @param options.getKey 自定义键生成函数
 * @returns 带缓存的函数
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    maxSize?: number
    ttl?: number
    getKey?: (...args: Parameters<T>) => string
  } = {},
): T {
  const cache = new MemoryCache<ReturnType<T>>({
    maxSize: options.maxSize || 50,
    defaultTTL: options.ttl,
  })

  const getKey = options.getKey || ((...args: Parameters<T>) => JSON.stringify(args))

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = getKey(...args)

    // 尝试从缓存获取
    const cached = cache.get(key)
    if (cached !== undefined) {
      return cached
    }

    // 执行函数并缓存结果
    const result = fn(...args)
    cache.set(key, result)

    return result
  }) as T
}

/**
 * 懒加载管理器
 *
 * 提供模块和资源的懒加载功能
 */
export class LazyLoader<T = any> {
  private loaders: Map<string, () => Promise<T>>
  private cache: Map<string, T>
  private loading: Map<string, Promise<T>>

  constructor() {
    this.loaders = new Map()
    this.cache = new Map()
    this.loading = new Map()
  }

  /**
   * 注册懒加载器
   */
  register(name: string, loader: () => Promise<T>): void {
    this.loaders.set(name, loader)
  }

  /**
   * 加载资源
   */
  async load(name: string): Promise<T> {
    // 检查缓存
    if (this.cache.has(name)) {
      return this.cache.get(name)!
    }

    // 检查是否正在加载
    if (this.loading.has(name)) {
      return this.loading.get(name)!
    }

    // 获取加载器
    const loader = this.loaders.get(name)
    if (!loader) {
      throw new Error(`Loader for "${name}" not found`)
    }

    // 开始加载
    const loadingPromise = loader().then(
      (resource) => {
        this.cache.set(name, resource)
        this.loading.delete(name)
        return resource
      },
      (error) => {
        this.loading.delete(name)
        throw error
      },
    )

    this.loading.set(name, loadingPromise)
    return loadingPromise
  }

  /**
   * 预加载资源
   */
  async preload(names: string[]): Promise<void> {
    await Promise.all(names.map(name => this.load(name)))
  }

  /**
   * 检查是否已加载
   */
  isLoaded(name: string): boolean {
    return this.cache.has(name)
  }

  /**
   * 检查是否正在加载
   */
  isLoading(name: string): boolean {
    return this.loading.has(name)
  }

  /**
   * 清除缓存
   */
  clear(name?: string): void {
    if (name) {
      this.cache.delete(name)
    }
    else {
      this.cache.clear()
    }
  }
}

/**
 * 请求动画帧节流
 *
 * 使用 requestAnimationFrame 进行节流，适用于动画和滚动事件
 *
 * @param callback 要节流的回调函数
 * @returns 节流后的函数
 */
export function rafThrottle<T extends (...args: any[]) => any>(
  callback: T,
): ThrottledFunction<T> {
  let requestId: number | null = null

  const throttled = (...args: Parameters<T>) => {
    if (requestId === null) {
      requestId = requestAnimationFrame(() => {
        callback(...args)
        requestId = null
      })
    }
  }

  // 添加取消方法
  throttled.cancel = () => {
    if (requestId !== null) {
      cancelAnimationFrame(requestId)
      requestId = null
    }
  }

  return throttled as ThrottledFunction<T>
}

/**
 * 批处理执行器
 *
 * 将多个调用合并为一次批量执行
 */
export class BatchExecutor<T, R> {
  private batch: T[] = []
  private timer: ReturnType<typeof setTimeout> | null = null
  private promises: Array<{
    resolve: (value: R) => void
    reject: (error: any) => void
  }> = []

  constructor(
    private executor: (batch: T[]) => Promise<R[]> | R[],
    private options: {
      maxBatchSize?: number
      maxWaitTime?: number
    } = {},
  ) {
    this.options.maxBatchSize = options.maxBatchSize || 10
    this.options.maxWaitTime = options.maxWaitTime || 10
  }

  /**
   * 添加到批处理队列
   */
  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push(item)
      this.promises.push({ resolve, reject })

      // 如果达到批处理大小限制，立即执行
      if (this.batch.length >= this.options.maxBatchSize!) {
        this.flush()
      }
      else {
        // 否则等待一段时间
        this.scheduleFlush()
      }
    })
  }

  /**
   * 调度批处理执行
   */
  private scheduleFlush(): void {
    if (this.timer)
      return

    this.timer = setTimeout(() => {
      this.flush()
    }, this.options.maxWaitTime)
  }

  /**
   * 执行批处理
   */
  private async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    if (this.batch.length === 0)
      return

    const batch = this.batch
    const promises = this.promises

    this.batch = []
    this.promises = []

    try {
      const results = await this.executor(batch)

      results.forEach((result, index) => {
        promises[index].resolve(result)
      })
    }
    catch (error) {
      promises.forEach((promise) => {
        promise.reject(error)
      })
    }
  }

  /**
   * 强制执行批处理
   */
  forceFlush(): Promise<void> {
    return this.flush()
  }
}
