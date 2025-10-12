/**
 * 内存优化器
 * 
 * 统一的内存管理和优化模块，减少内存占用
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

import { TimeUtils } from '../utils/common'

/**
 * 内存使用情况
 */
export interface MemoryUsage {
  used: number
  total: number
  percentage: number
  details: {
    cache: number
    translations: number
    objects: number
    strings: number
  }
}

/**
 * 内存优化配置
 */
export interface MemoryOptimizerConfig {
  maxMemory?: number // 最大内存使用量（MB）
  gcInterval?: number // 垃圾回收间隔（ms）
  enableAutoGC?: boolean // 启用自动垃圾回收
  compressThreshold?: number // 压缩阈值（MB）
  enableCompression?: boolean // 启用压缩
  poolSize?: number // 对象池大小
  cacheLimit?: number // 缓存项限制
  stringIntern?: boolean // 字符串驻留
}

/**
 * 弱引用缓存
 */
class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>()
  
  set(key: K, value: V): void {
    this.cache.set(key, value)
  }
  
  get(key: K): V | undefined {
    return this.cache.get(key)
  }
  
  has(key: K): boolean {
    return this.cache.has(key)
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key)
  }
}

/**
 * LRU缓存（固定大小）
 */
class LRUCache<K, V> {
  private cache = new Map<K, V>()
  private maxSize: number
  
  constructor(maxSize: number) {
    this.maxSize = maxSize
  }
  
  set(key: K, value: V): void {
    // 删除已存在的键以更新位置
    this.cache.delete(key)
    
    // 如果达到最大大小，删除最旧的项
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, value)
  }
  
  get(key: K): V | undefined {
    const value = this.cache.get(key)
    if (value !== undefined) {
      // 更新访问顺序
      this.cache.delete(key)
      this.cache.set(key, value)
    }
    return value
  }
  
  has(key: K): boolean {
    return this.cache.has(key)
  }
  
  delete(key: K): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  get size(): number {
    return this.cache.size
  }
}

/**
 * 字符串池（减少重复字符串）
 */
class StringPool {
  private pool = new Map<string, string>()
  private refCount = new Map<string, number>()
  
  intern(str: string): string {
    if (this.pool.has(str)) {
      const interned = this.pool.get(str)!
      this.refCount.set(str, (this.refCount.get(str) || 0) + 1)
      return interned
    }
    
    this.pool.set(str, str)
    this.refCount.set(str, 1)
    return str
  }
  
  release(str: string): void {
    const count = this.refCount.get(str) || 0
    if (count <= 1) {
      this.pool.delete(str)
      this.refCount.delete(str)
    } else {
      this.refCount.set(str, count - 1)
    }
  }
  
  clear(): void {
    this.pool.clear()
    this.refCount.clear()
  }
  
  get size(): number {
    return this.pool.size
  }
}

/**
 * 压缩工具
 */
class CompressionUtil {
  /**
   * 简单的字符串压缩（使用重复模式）
   */
  static compress(str: string): string {
    if (str.length < 100) return str // 短字符串不压缩
    
    // 简单的RLE压缩
    let compressed = ''
    let count = 1
    
    for (let i = 0; i < str.length; i++) {
      if (str[i] === str[i + 1]) {
        count++
      } else {
        compressed += count > 1 ? `${count}${str[i]}` : str[i]
        count = 1
      }
    }
    
    // 只有压缩后更小才返回压缩结果
    return compressed.length < str.length ? compressed : str
  }
  
  /**
   * 解压字符串
   */
  static decompress(str: string): string {
    let decompressed = ''
    let count = ''
    
    for (let i = 0; i < str.length; i++) {
      if (/\d/.test(str[i])) {
        count += str[i]
      } else {
        const repeatCount = count ? parseInt(count) : 1
        decompressed += str[i].repeat(repeatCount)
        count = ''
      }
    }
    
    return decompressed
  }
  
  /**
   * 压缩对象（JSON）
   */
  static compressObject(obj: any): string {
    const json = JSON.stringify(obj)
    return this.compress(json)
  }
  
  /**
   * 解压对象
   */
  static decompressObject(compressed: string): any {
    const json = this.decompress(compressed)
    return JSON.parse(json)
  }
}

/**
 * 内存优化器
 */
export class MemoryOptimizer {
  private config: Required<MemoryOptimizerConfig>
  private lruCache: LRUCache<string, any>
  private weakCache = new WeakCache<object, any>()
  private stringPool = new StringPool()
  private gcTimer?: NodeJS.Timeout
  private lastGC = 0
  private stats = {
    gcCount: 0,
    compressionCount: 0,
    evictionCount: 0,
    poolHits: 0,
    poolMisses: 0,
  }
  
  constructor(config: MemoryOptimizerConfig = {}) {
    this.config = {
      maxMemory: config.maxMemory ?? 50, // 50MB
      gcInterval: config.gcInterval ?? 60000, // 1分钟
      enableAutoGC: config.enableAutoGC ?? true,
      compressThreshold: config.compressThreshold ?? 1, // 1MB
      enableCompression: config.enableCompression ?? true,
      poolSize: config.poolSize ?? 1000,
      cacheLimit: config.cacheLimit ?? 500,
      stringIntern: config.stringIntern ?? true,
    }
    
    this.lruCache = new LRUCache(this.config.cacheLimit)
    
    if (this.config.enableAutoGC) {
      this.startAutoGC()
    }
  }
  
  /**
   * 存储值（自动优化）
   */
  set(key: string, value: any, weak = false): void {
    // 字符串驻留
    if (this.config.stringIntern && typeof value === 'string') {
      value = this.stringPool.intern(value)
    }
    
    // 压缩大对象
    if (this.config.enableCompression && this.shouldCompress(value)) {
      value = CompressionUtil.compressObject(value)
    }
    
    // 根据类型选择存储方式
    if (weak && typeof value === 'object' && value !== null) {
      this.weakCache.set({ key } as any, value)
    } else {
      this.lruCache.set(key, value)
    }
  }
  
  /**
   * 获取值
   */
  get(key: string, weak = false): any {
    let value: any
    
    if (weak) {
      value = this.weakCache.get({ key } as any)
    } else {
      value = this.lruCache.get(key)
    }
    
    // 解压
    if (value && typeof value === 'string' && value.startsWith('{')) {
      try {
        value = CompressionUtil.decompressObject(value)
      } catch {
        // 不是压缩的对象
      }
    }
    
    return value
  }
  
  /**
   * 删除值
   */
  delete(key: string): boolean {
    // 释放字符串池引用
    const value = this.lruCache.get(key)
    if (typeof value === 'string' && this.config.stringIntern) {
      this.stringPool.release(value)
    }
    
    return this.lruCache.delete(key)
  }
  
  /**
   * 清空缓存
   */
  clear(): void {
    this.lruCache.clear()
    this.stringPool.clear()
    this.forceGC()
  }
  
  /**
   * 获取内存使用情况
   */
  getMemoryUsage(): MemoryUsage {
    const used = this.estimateMemoryUsage()
    const total = this.config.maxMemory * 1024 * 1024
    
    return {
      used,
      total,
      percentage: (used / total) * 100,
      details: {
        cache: this.lruCache.size * 1000, // 估算
        translations: 0,
        objects: this.lruCache.size,
        strings: this.stringPool.size,
      }
    }
  }
  
  /**
   * 优化内存
   */
  optimize(): void {
    const usage = this.getMemoryUsage()
    
    // 如果内存使用超过80%，执行激进的优化
    if (usage.percentage > 80) {
      this.aggressiveOptimize()
    } else if (usage.percentage > 60) {
      this.moderateOptimize()
    }
    
    this.forceGC()
  }
  
  /**
   * 获取统计信息
   */
  getStats(): typeof this.stats {
    return { ...this.stats }
  }
  
  // 私有方法
  
  private shouldCompress(value: any): boolean {
    if (typeof value !== 'object' || value === null) return false
    
    const size = JSON.stringify(value).length
    return size > this.config.compressThreshold * 1024 * 1024
  }
  
  private estimateMemoryUsage(): number {
    // 简单估算
    let total = 0
    
    // LRU缓存
    total += this.lruCache.size * 1000
    
    // 字符串池
    total += this.stringPool.size * 100
    
    return total
  }
  
  private startAutoGC(): void {
    this.gcTimer = setInterval(() => {
      this.autoGC()
    }, this.config.gcInterval)
  }
  
  private autoGC(): void {
    const now = TimeUtils.now()
    if (now - this.lastGC < this.config.gcInterval) return
    
    this.lastGC = now
    this.optimize()
    this.stats.gcCount++
  }
  
  private forceGC(): void {
    if (typeof global !== 'undefined' && global.gc) {
      global.gc()
    }
  }
  
  private moderateOptimize(): void {
    // 清理部分缓存
    const targetSize = Math.floor(this.config.cacheLimit * 0.8)
    while (this.lruCache.size > targetSize) {
      const firstKey = (this.lruCache as any).cache.keys().next().value
      if (firstKey) {
        this.delete(firstKey)
        this.stats.evictionCount++
      } else {
        break
      }
    }
  }
  
  private aggressiveOptimize(): void {
    // 清理大部分缓存
    const targetSize = Math.floor(this.config.cacheLimit * 0.5)
    while (this.lruCache.size > targetSize) {
      const firstKey = (this.lruCache as any).cache.keys().next().value
      if (firstKey) {
        this.delete(firstKey)
        this.stats.evictionCount++
      } else {
        break
      }
    }
    
    // 清理字符串池
    this.stringPool.clear()
  }
  
  /**
   * 销毁
   */
  destroy(): void {
    if (this.gcTimer) {
      clearInterval(this.gcTimer)
      this.gcTimer = undefined
    }
    
    this.clear()
  }
}

/**
 * 全局内存优化器实例
 */
let globalOptimizer: MemoryOptimizer | null = null

/**
 * 获取全局内存优化器
 */
export function getGlobalMemoryOptimizer(): MemoryOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new MemoryOptimizer()
  }
  return globalOptimizer
}

/**
 * 创建内存优化器
 */
export function createMemoryOptimizer(config?: MemoryOptimizerConfig): MemoryOptimizer {
  return new MemoryOptimizer(config)
}

/**
 * 内存优化装饰器
 */
export function memoryOptimized(config?: MemoryOptimizerConfig) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const optimizer = createMemoryOptimizer(config)
    
    descriptor.value = function (...args: any[]) {
      // 优化参数
      const optimizedArgs = args.map(arg => {
        if (typeof arg === 'string' && arg.length > 100) {
          return CompressionUtil.compress(arg)
        }
        return arg
      })
      
      // 执行原方法
      const result = originalMethod.apply(this, optimizedArgs)
      
      // 优化结果
      if (result && typeof result === 'object') {
        return CompressionUtil.compressObject(result)
      }
      
      return result
    }
    
    return descriptor
  }
}