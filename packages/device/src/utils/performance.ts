/**
 * 性能优化工具集
 *
 * 提供防抖、节流、缓存等性能优化功能
 * 重复的工具函数已从 index.ts 导入，避免代码冗余
 */

// 从 index.ts 导入通用工具函数，避免重复实现
export { debounce, memoize, throttle } from './index'

// 类型导出
export type DebouncedFunction<T extends (...args: unknown[]) => unknown> = ((...args: Parameters<T>) => void) & {
 cancel: () => void
}

export type ThrottledFunction<T extends (...args: unknown[]) => unknown> = ((...args: Parameters<T>) => void) & {
 cancel: () => void
}

/**
 * 懒加载管理器
 *
 * 提供模块和资源的懒加载功能
 */
export class LazyLoader<T = unknown> {
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
   const cached = this.cache.get(name)
   if (cached !== undefined) return cached
  }

  // 检查是否正在加载
  if (this.loading.has(name)) {
   const loading = this.loading.get(name)
   if (loading) return loading
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
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
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
  reject: (error: unknown) => void
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
   if (this.options.maxBatchSize && this.batch.length >= this.options.maxBatchSize) {
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
