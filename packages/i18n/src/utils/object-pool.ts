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
  acquire(): T
  /** 将对象归还到池中 */
  release(obj: T): void
  /** 清空池 */
  clear(): void
  /** 获取池的大小 */
  size(): number
}

/**
 * 通用对象池实现
 */
export class GenericObjectPool<T> implements ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset?: (obj: T) => void
  private maxSize: number

  constructor(
    factory: () => T,
    options: {
      initialSize?: number
      maxSize?: number
      reset?: (obj: T) => void
    } = {}
  ) {
    this.factory = factory
    this.reset = options.reset
    this.maxSize = options.maxSize || 100

    // 预创建对象
    const initialSize = options.initialSize || 10
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory())
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      if (this.reset) {
        this.reset(obj)
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
 * 数组对象池
 */
export class ArrayPool<T = any> implements ObjectPool<T[]> {
  private pool: T[][] = []
  private maxSize: number

  constructor(options: { initialSize?: number; maxSize?: number } = {}) {
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

  constructor(options: { initialSize?: number; maxSize?: number } = {}) {
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

  constructor(options: { initialSize?: number; maxSize?: number } = {}) {
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
 * 预定义的全局对象池
 */
export const globalPools = {
  arrays: new ArrayPool({ initialSize: 20, maxSize: 200 }),
  objects: new ObjectLiteralPool({ initialSize: 20, maxSize: 200 }),
  stringBuilders: new StringBuilderPool({ initialSize: 10, maxSize: 100 }),
}

// 注册到全局管理器
const manager = GlobalPoolManager.getInstance()
manager.registerPool('arrays', globalPools.arrays)
manager.registerPool('objects', globalPools.objects)
manager.registerPool('stringBuilders', globalPools.stringBuilders)

/**
 * 便捷函数：使用对象池执行操作
 */
export function withPooledArray<T, R>(
  fn: (arr: T[]) => R,
  pool: ArrayPool<T> = globalPools.arrays as ArrayPool<T>
): R {
  const arr = pool.acquire()
  try {
    return fn(arr)
  } finally {
    pool.release(arr)
  }
}

/**
 * 便捷函数：使用对象池执行操作
 */
export function withPooledObject<R>(
  fn: (obj: Record<string, any>) => R,
  pool: ObjectLiteralPool = globalPools.objects
): R {
  const obj = pool.acquire()
  try {
    return fn(obj)
  } finally {
    pool.release(obj)
  }
}

/**
 * 便捷函数：使用字符串构建器
 */
export function buildString(
  fn: (builder: string[]) => void,
  pool: StringBuilderPool = globalPools.stringBuilders
): string {
  const builder = pool.acquire()
  try {
    fn(builder)
    return builder.join('')
  } finally {
    pool.release(builder)
  }
}

