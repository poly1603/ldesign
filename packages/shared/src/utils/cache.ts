/**
 * 缓存工具函数
 */

/**
 * 缓存项接口
 */
export interface CacheItem<T = any> {
  value: T
  expireTime?: number
  createTime: number
}

/**
 * 缓存配置接口
 */
export interface CacheOptions {
  /** 默认过期时间（毫秒） */
  defaultTTL?: number
  /** 最大缓存数量 */
  maxSize?: number
  /** 是否启用 LRU 策略 */
  enableLRU?: boolean
}

/**
 * 内存缓存类
 */
export class MemoryCache<T = any> {
  private cache = new Map<string, CacheItem<T>>()
  private accessOrder = new Map<string, number>()
  private accessCounter = 0
  private options: Required<CacheOptions>

  constructor(options: CacheOptions = {}) {
    this.options = {
      defaultTTL: 5 * 60 * 1000, // 5分钟
      maxSize: 100,
      enableLRU: true,
      ...options,
    }
  }

  /**
   * 设置缓存
   */
  set(key: string, value: T, ttl?: number): void {
    const now = Date.now()
    const expireTime = ttl ? now + ttl : now + this.options.defaultTTL

    // 如果启用 LRU 且达到最大容量，删除最少使用的项
    if (this.options.enableLRU && this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evictLRU()
    }

    this.cache.set(key, {
      value,
      expireTime,
      createTime: now,
    })

    // 更新访问顺序
    if (this.options.enableLRU) {
      this.accessOrder.set(key, ++this.accessCounter)
    }
  }

  /**
   * 获取缓存
   */
  get(key: string): T | undefined {
    const item = this.cache.get(key)
    
    if (!item) {
      return undefined
    }

    // 检查是否过期
    if (item.expireTime && Date.now() > item.expireTime) {
      this.delete(key)
      return undefined
    }

    // 更新访问顺序
    if (this.options.enableLRU) {
      this.accessOrder.set(key, ++this.accessCounter)
    }

    return item.value
  }

  /**
   * 检查缓存是否存在
   */
  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    // 检查是否过期
    if (item.expireTime && Date.now() > item.expireTime) {
      this.delete(key)
      return false
    }

    return true
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    this.accessOrder.delete(key)
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear()
    this.accessOrder.clear()
    this.accessCounter = 0
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * 获取所有缓存值
   */
  values(): T[] {
    return Array.from(this.cache.values()).map(item => item.value)
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, item] of this.cache.entries()) {
      if (item.expireTime && now > item.expireTime) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.delete(key))
  }

  /**
   * 驱逐最少使用的缓存项
   */
  private evictLRU(): void {
    if (!this.options.enableLRU || this.cache.size === 0) {
      return
    }

    let lruKey = ''
    let lruAccess = Infinity

    for (const [key, access] of this.accessOrder.entries()) {
      if (access < lruAccess) {
        lruAccess = access
        lruKey = key
      }
    }

    if (lruKey) {
      this.delete(lruKey)
    }
  }

  /**
   * 获取缓存统计信息
   */
  stats(): {
    size: number
    maxSize: number
    hitRate: number
    memoryUsage: number
  } {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: 0, // 需要额外实现命中率统计
      memoryUsage: this.estimateMemoryUsage(),
    }
  }

  /**
   * 估算内存使用量（字节）
   * 优化版本：使用缓存避免重复序列化
   */
  private estimateMemoryUsage(): number {
    let size = 0

    for (const [key, item] of this.cache.entries()) {
      // 键的大小
      size += key.length * 2 // 字符串按 UTF-16 计算

      // 值的大小估算（避免每次都序列化）
      const value = item.value
      if (typeof value === 'string') {
        size += value.length * 2
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        size += 8
      } else if (value === null || value === undefined) {
        size += 4
      } else if (Array.isArray(value)) {
        size += value.length * 8 + 16 // 数组元素指针 + 数组对象开销
      } else if (typeof value === 'object') {
        // 对象粗略估算：键值对数量 * 平均大小
        const keys = Object.keys(value)
        size += keys.length * 32 + 24 // 每个属性约32字节 + 对象开销
      }

      // CacheItem 对象开销
      size += 32 // expireTime, createTime, value 引用
    }

    return size
  }
}

/**
 * LRU 缓存类
 */
export class LRUCache<T = any> extends MemoryCache<T> {
  constructor(maxSize: number = 100, defaultTTL?: number) {
    super({
      maxSize,
      defaultTTL,
      enableLRU: true,
    })
  }
}

/**
 * 缓存装饰器
 */
export function cached<T extends (...args: any[]) => any>(
  options: {
    key?: (...args: Parameters<T>) => string
    ttl?: number
    cache?: MemoryCache
  } = {}
) {
  const cache = options.cache || new MemoryCache()
  const keyGenerator = options.key || ((...args) => JSON.stringify(args))

  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: Parameters<T>) {
      const cacheKey = `${propertyKey}:${keyGenerator(...args)}`
      
      // 尝试从缓存获取
      const cachedResult = cache.get(cacheKey)
      if (cachedResult !== undefined) {
        return cachedResult
      }

      // 执行原方法
      const result = originalMethod.apply(this, args)

      // 如果是 Promise，缓存解析后的值
      if (result instanceof Promise) {
        return result.then((resolvedValue) => {
          cache.set(cacheKey, resolvedValue, options.ttl)
          return resolvedValue
        })
      }

      // 缓存结果
      cache.set(cacheKey, result, options.ttl)
      return result
    }

    return descriptor
  }
}

/**
 * 函数缓存包装器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: {
    key?: (...args: Parameters<T>) => string
    ttl?: number
    maxSize?: number
  } = {}
): T {
  const cache = new MemoryCache({
    defaultTTL: options.ttl,
    maxSize: options.maxSize || 100,
  })
  
  const keyGenerator = options.key || ((...args) => JSON.stringify(args))

  return ((...args: Parameters<T>) => {
    const cacheKey = keyGenerator(...args)
    
    // 尝试从缓存获取
    const cachedResult = cache.get(cacheKey)
    if (cachedResult !== undefined) {
      return cachedResult
    }

    // 执行原函数
    const result = fn(...args)

    // 如果是 Promise，缓存解析后的值
    if (result instanceof Promise) {
      return result.then((resolvedValue) => {
        cache.set(cacheKey, resolvedValue)
        return resolvedValue
      })
    }

    // 缓存结果
    cache.set(cacheKey, result)
    return result
  }) as T
}

/**
 * 默认缓存实例
 */
export const defaultCache = new MemoryCache()

/**
 * 创建缓存实例
 */
export function createCache<T = any>(options?: CacheOptions): MemoryCache<T> {
  return new MemoryCache<T>(options)
}

/**
 * 创建 LRU 缓存实例
 */
export function createLRUCache<T = any>(maxSize: number = 100, defaultTTL?: number): LRUCache<T> {
  return new LRUCache<T>(maxSize, defaultTTL)
}
