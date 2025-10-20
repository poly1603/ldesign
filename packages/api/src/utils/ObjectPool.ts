/**
 * 对象池 - 用于复用对象，减少GC压力
 */

/**
 * 对象池配置
 */
export interface ObjectPoolConfig {
  /** 最大池大小 */
  maxSize: number
  /** 初始化大小 */
  initialSize?: number
  /** 创建对象的工厂函数 */
  factory: () => any
  /** 重置对象的函数 */
  reset: (obj: any) => void
  /** 验证对象是否可用 */
  validate?: (obj: any) => boolean
}

/**
 * 通用对象池
 */
export class ObjectPool<T extends object = any> {
  private pool: T[] = []
  private inUse = new WeakSet<T>()
  private config: Required<ObjectPoolConfig>
  private stats = {
    created: 0,
    borrowed: 0,
    returned: 0,
    destroyed: 0,
  }

  constructor(config: ObjectPoolConfig) {
    this.config = {
      initialSize: 0,
      validate: () => true,
      ...config,
    }
    
    // 预创建对象
    this.initialize()
  }

  /**
   * 初始化对象池
   */
  private initialize(): void {
    const { initialSize, factory } = this.config
    for (let i = 0; i < initialSize; i++) {
      const obj = factory()
      this.pool.push(obj)
      this.stats.created++
    }
  }

  /**
   * 从池中获取对象
   */
  acquire(): T {
    this.stats.borrowed++
    
    // 尝试从池中获取
    while (this.pool.length > 0) {
      const obj = this.pool.pop()!
      
      // 验证对象是否可用
      if (this.config.validate(obj)) {
        this.inUse.add(obj)
        return obj
      } else {
        this.stats.destroyed++
      }
    }
    
    // 池中没有可用对象，创建新的
    const newObj = this.config.factory()
    this.inUse.add(newObj)
    this.stats.created++
    return newObj
  }

  /**
   * 释放对象回池
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      return // 对象不是从这个池借出的
    }
    
    this.inUse.delete(obj)
    this.stats.returned++
    
    // 重置对象
    try {
      this.config.reset(obj)
      
      // 如果池未满，将对象放回池中
      if (this.pool.length < this.config.maxSize) {
        this.pool.push(obj)
      } else {
        this.stats.destroyed++
      }
    } catch {
      // 重置失败，丢弃对象
      this.stats.destroyed++
    }
  }

  /**
   * 获取池状态
   */
  getStats() {
    return {
      poolSize: this.pool.length,
      ...this.stats,
      efficiency: this.stats.borrowed > 0 
        ? (this.stats.borrowed - this.stats.created) / this.stats.borrowed 
        : 0,
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
    this.inUse = new WeakSet<T>()
  }

  /**
   * 调整池大小
   */
  resize(newMaxSize: number): void {
    this.config.maxSize = newMaxSize
    
    // 如果新大小更小，移除多余的对象
    while (this.pool.length > newMaxSize) {
      this.pool.pop()
      this.stats.destroyed++
    }
  }
}

/**
 * 专用配置对象池
 */
export class ConfigObjectPool {
  private static instance: ConfigObjectPool
  private pool: Array<Record<string, any>> = []
  private readonly maxSize = 500

  static getInstance(): ConfigObjectPool {
    if (!ConfigObjectPool.instance) {
      ConfigObjectPool.instance = new ConfigObjectPool()
    }
    return ConfigObjectPool.instance
  }

  acquire(): Record<string, any> {
    return this.pool.pop() || {}
  }

  release(obj: Record<string, any>): void {
    // 清空对象
    for (const key in obj) {
      delete obj[key]
    }
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
  }
}

/**
 * 专用数组池
 */
export class ArrayPool<T = any> {
  private static pools = new Map<number, ArrayPool>()
  private pool: T[][] = []
  private readonly maxSize = 100

  static getInstance<T>(initialCapacity: number = 10): ArrayPool<T> {
    if (!ArrayPool.pools.has(initialCapacity)) {
      ArrayPool.pools.set(initialCapacity, new ArrayPool<T>())
    }
    return ArrayPool.pools.get(initialCapacity) as ArrayPool<T>
  }

  acquire(size?: number): T[] {
    const arr = this.pool.pop() || []
    if (size !== undefined) {
      arr.length = size
    }
    return arr
  }

  release(arr: T[]): void {
    // 清空数组
    arr.length = 0
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(arr)
    }
  }
}

/**
 * Promise结果包装器池
 */
export class PromiseResultPool {
  private static instance: PromiseResultPool
  private pool: Array<{ value?: any, error?: any }> = []
  private readonly maxSize = 200

  static getInstance(): PromiseResultPool {
    if (!PromiseResultPool.instance) {
      PromiseResultPool.instance = new PromiseResultPool()
    }
    return PromiseResultPool.instance
  }

  acquire(): { value?: any, error?: any } {
    return this.pool.pop() || {}
  }

  release(obj: { value?: any, error?: any }): void {
    delete obj.value
    delete obj.error
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(obj)
    }
  }
}

/**
 * 字符串构建器池（用于高频字符串拼接）
 */
export class StringBuilderPool {
  private static instance: StringBuilderPool
  private pool: Array<{ parts: string[], length: number }> = []
  private readonly maxSize = 50

  static getInstance(): StringBuilderPool {
    if (!StringBuilderPool.instance) {
      StringBuilderPool.instance = new StringBuilderPool()
    }
    return StringBuilderPool.instance
  }

  acquire(): StringBuilder {
    const builder = this.pool.pop() || { parts: [], length: 0 }
    return new StringBuilder(builder, this)
  }

  release(builder: { parts: string[], length: number }): void {
    builder.parts.length = 0
    builder.length = 0
    
    if (this.pool.length < this.maxSize) {
      this.pool.push(builder)
    }
  }
}

/**
 * 字符串构建器
 */
export class StringBuilder {
  constructor(
    private builder: { parts: string[], length: number },
    private pool: StringBuilderPool
  ) {}

  append(str: string): this {
    this.builder.parts.push(str)
    this.builder.length += str.length
    return this
  }

  toString(): string {
    const result = this.builder.parts.join('')
    this.pool.release(this.builder)
    return result
  }
}

/**
 * 创建带对象池的函数包装器
 */
export function withObjectPool<T extends (...args: any[]) => any>(
  fn: T,
  poolConfig: Partial<ObjectPoolConfig>
): T {
  const pool = new ObjectPool({
    maxSize: 100,
    factory: () => ({}),
    reset: (obj) => {
      for (const key in obj) {
        delete obj[key]
      }
    },
    ...poolConfig,
  })

  return ((...args: Parameters<T>) => {
    const context = pool.acquire()
    try {
      const result = fn.apply(context, args)
      return result
    } finally {
      pool.release(context)
    }
  }) as T
}