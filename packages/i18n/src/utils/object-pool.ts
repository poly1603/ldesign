/**
 * 对象池工具
 *
 * 通过复用对象减少内存分配和垃圾回收压力
 *
 * @author LDesign Team
 * @version 2.0.0
 */

/**
 * 对象池接口
 */
export interface ObjectPool<T> {
  /** 从池中获取对象 */
  acquire: () => T
  /** 将对象归还到池中 */
  release: (obj: T) => void
  /** 清空池 */
  clear: () => void
  /** 获取池的大小 */
  size: () => number
}

/**
 * 通用对象池实现
 *
 * 优化特性：
 * - 使用 WeakMap 跟踪对象状态，避免内存泄漏
 * - 懒加载初始化，减少启动开销
 * - 自动调整池大小
 */
export class GenericObjectPool<T> implements ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset?: (obj: T) => void
  private maxSize: number
  private minSize: number
  private acquireCount = 0
  private releaseCount = 0
  // 使用 WeakMap 跟踪对象状态
  private objectStates = new WeakMap<any, { inUse: boolean, acquireTime: number }>()

  constructor(
    factory: () => T,
    options: {
      initialSize?: number
      maxSize?: number
      minSize?: number
      reset?: (obj: T) => void
      lazyInit?: boolean
    } = {},
  ) {
    this.factory = factory
    this.reset = options.reset
    this.maxSize = options.maxSize || 100
    this.minSize = options.minSize || 5

    // 支持懒加载初始化
    if (!options.lazyInit) {
      // 预创建对象
      const initialSize = options.initialSize || 10
      for (let i = 0; i < initialSize; i++) {
        this.pool.push(this.factory())
      }
    }
  }

  acquire(): T {
    this.acquireCount++
    let obj: T

    if (this.pool.length > 0) {
      obj = this.pool.pop()!
    }
    else {
      obj = this.factory()
    }

    // 跟踪对象状态
    if (typeof obj === 'object' && obj !== null) {
      this.objectStates.set(obj as any, {
        inUse: true,
        acquireTime: Date.now(),
      })
    }

    return obj
  }

  release(obj: T): void {
    this.releaseCount++

    // 更新对象状态
    if (typeof obj === 'object' && obj !== null) {
      const state = this.objectStates.get(obj as any)
      if (state) {
        state.inUse = false
      }
    }

    if (this.pool.length < this.maxSize) {
      if (this.reset) {
        this.reset(obj)
      }
      this.pool.push(obj)
    }

    // 自动调整池大小：如果池太大，缩减到最小值
    if (this.pool.length > this.maxSize * 1.5) {
      this.shrink()
    }
  }

  clear(): void {
    this.pool = []
    this.acquireCount = 0
    this.releaseCount = 0
  }

  size(): number {
    return this.pool.length
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    poolSize: number
    acquireCount: number
    releaseCount: number
    hitRate: number
  } {
    const hitRate = this.acquireCount > 0
      ? this.releaseCount / this.acquireCount
      : 0

    return {
      poolSize: this.pool.length,
      acquireCount: this.acquireCount,
      releaseCount: this.releaseCount,
      hitRate,
    }
  }

  /**
   * 缩小池大小
   */
  private shrink(): void {
    const targetSize = Math.max(this.minSize, Math.floor(this.maxSize * 0.5))
    if (this.pool.length > targetSize) {
      this.pool.length = targetSize
    }
  }
}

/**
 * 数组对象池
 */
export class ArrayPool<T = any> implements ObjectPool<T[]> {
  private pool: T[][] = []
  private maxSize: number

  constructor(options: { initialSize?: number, maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 100
    const initialSize = options.initialSize || 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push([])
    }
  }

  acquire(): T[] {
    return this.pool.length > 0 ? this.pool.pop()! : []
  }

  release(arr: T[]): void {
    if (this.pool.length < this.maxSize) {
      arr.length = 0 // 清空数组
      this.pool.push(arr)
    }
  }

  clear(): void {
    this.pool = []
  }

  size(): number {
    return this.pool.length
  }
}

/**
 * 对象字面量池
 */
export class ObjectLiteralPool implements ObjectPool<Record<string, any>> {
  private pool: Record<string, any>[] = []
  private maxSize: number

  constructor(options: { initialSize?: number, maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 100
    const initialSize = options.initialSize || 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push({})
    }
  }

  acquire(): Record<string, any> {
    return this.pool.length > 0 ? this.pool.pop()! : {}
  }

  release(obj: Record<string, any>): void {
    if (this.pool.length < this.maxSize) {
      // 清空对象
      for (const key in obj) {
        delete obj[key]
      }
      this.pool.push(obj)
    }
  }

  clear(): void {
    this.pool = []
  }

  size(): number {
    return this.pool.length
  }
}

/**
 * 字符串构建器池
 */
export class StringBuilderPool {
  private pool: string[][] = []
  private maxSize: number

  constructor(options: { initialSize?: number, maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 50
    const initialSize = options.initialSize || 5
    for (let i = 0; i < initialSize; i++) {
      this.pool.push([])
    }
  }

  acquire(): string[] {
    return this.pool.length > 0 ? this.pool.pop()! : []
  }

  release(builder: string[]): void {
    if (this.pool.length < this.maxSize) {
      builder.length = 0
      this.pool.push(builder)
    }
  }

  build(builder: string[]): string {
    const result = builder.join('')
    this.release(builder)
    return result
  }

  clear(): void {
    this.pool = []
  }

  size(): number {
    return this.pool.length
  }
}

/**
 * 全局对象池管理器
 */
export class GlobalPoolManager {
  private static instance: GlobalPoolManager
  private pools = new Map<string, ObjectPool<any>>()

  private constructor() {}

  static getInstance(): GlobalPoolManager {
    if (!GlobalPoolManager.instance) {
      GlobalPoolManager.instance = new GlobalPoolManager()
    }
    return GlobalPoolManager.instance
  }

  registerPool<T>(name: string, pool: ObjectPool<T>): void {
    this.pools.set(name, pool)
  }

  getPool<T>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name)
  }

  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear()
    }
  }

  getStats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const [name, pool] of this.pools.entries()) {
      stats[name] = pool.size()
    }
    return stats
  }
}

/**
 * 参数对象池（专用于 TranslationParams）
 */
export class ParamsPool implements ObjectPool<Record<string, any>> {
  private pool: Record<string, any>[] = []
  private maxSize: number

  constructor(options: { initialSize?: number, maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 50
    const initialSize = options.initialSize || 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push({})
    }
  }

  acquire(): Record<string, any> {
    return this.pool.length > 0 ? this.pool.pop()! : {}
  }

  release(params: Record<string, any>): void {
    if (this.pool.length < this.maxSize) {
      // 清空对象属性
      for (const key in params) {
        delete params[key]
      }
      this.pool.push(params)
    }
  }

  clear(): void {
    this.pool = []
  }

  size(): number {
    return this.pool.length
  }
}

/**
 * Map对象池
 */
export class MapPool<K = any, V = any> implements ObjectPool<Map<K, V>> {
  private pool: Map<K, V>[] = []
  private maxSize: number

  constructor(options: { initialSize?: number, maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 50
    const initialSize = options.initialSize || 5
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new Map())
    }
  }

  acquire(): Map<K, V> {
    return this.pool.length > 0 ? this.pool.pop()! : new Map()
  }

  release(map: Map<K, V>): void {
    if (this.pool.length < this.maxSize) {
      map.clear()
      this.pool.push(map)
    }
  }

  clear(): void {
    this.pool = []
  }

  size(): number {
    return this.pool.length
  }
}

/**
 * Set对象池
 */
export class SetPool<T = any> implements ObjectPool<Set<T>> {
  private pool: Set<T>[] = []
  private maxSize: number

  constructor(options: { initialSize?: number, maxSize?: number } = {}) {
    this.maxSize = options.maxSize || 50
    const initialSize = options.initialSize || 5
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new Set())
    }
  }

  acquire(): Set<T> {
    return this.pool.length > 0 ? this.pool.pop()! : new Set()
  }

  release(set: Set<T>): void {
    if (this.pool.length < this.maxSize) {
      set.clear()
      this.pool.push(set)
    }
  }

  clear(): void {
    this.pool = []
  }

  size(): number {
    return this.pool.length
  }
}

/**
 * 预定义的全局对象池
 */
export const globalPools = {
  arrays: new ArrayPool({ initialSize: 20, maxSize: 200 }),
  objects: new ObjectLiteralPool({ initialSize: 20, maxSize: 200 }),
  stringBuilders: new StringBuilderPool({ initialSize: 10, maxSize: 100 }),
  params: new ParamsPool({ initialSize: 15, maxSize: 150 }),
  maps: new MapPool({ initialSize: 10, maxSize: 100 }),
  sets: new SetPool({ initialSize: 10, maxSize: 100 }),
}

// 注册到全局管理器
const manager = GlobalPoolManager.getInstance()
manager.registerPool('arrays', globalPools.arrays)
manager.registerPool('objects', globalPools.objects)
manager.registerPool('stringBuilders', globalPools.stringBuilders)
manager.registerPool('params', globalPools.params)
manager.registerPool('maps', globalPools.maps)
manager.registerPool('sets', globalPools.sets)

/**
 * 便捷函数：使用对象池执行操作
 */
export function withPooledArray<T, R>(
  fn: (arr: T[]) => R,
  pool: ArrayPool<T> = globalPools.arrays as ArrayPool<T>,
): R {
  const arr = pool.acquire()
  try {
    return fn(arr)
  }
  finally {
    pool.release(arr)
  }
}

/**
 * 便捷函数：使用对象池执行操作
 */
export function withPooledObject<R>(
  fn: (obj: Record<string, any>) => R,
  pool: ObjectLiteralPool = globalPools.objects,
): R {
  const obj = pool.acquire()
  try {
    return fn(obj)
  }
  finally {
    pool.release(obj)
  }
}

/**
 * 便捷函数：使用字符串构建器
 */
export function buildString(
  fn: (builder: string[]) => void,
  pool: StringBuilderPool = globalPools.stringBuilders,
): string {
  const builder = pool.acquire()
  try {
    fn(builder)
    return builder.join('')
  }
  finally {
    pool.release(builder)
  }
}
