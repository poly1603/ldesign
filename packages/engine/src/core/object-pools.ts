/**
 * 集中式对象池管理
 * 为常用对象类型提供对象池，减少GC压力和内存抖动
 */

import type { Logger } from '../types'

/**
 * 通用对象池接口
 */
export interface PoolableObject {
  reset?: () => void
}

/**
 * 对象池基类
 */
export class ObjectPool<T extends object> {
  protected pool: T[] = []
  protected inUse = new WeakSet<T>()
  protected factory: () => T
  protected resetter: (obj: T) => void
  protected maxSize: number
  protected stats = {
    created: 0,
    acquired: 0,
    released: 0,
    reused: 0
  }

  constructor(
    factory: () => T,
    resetter: (obj: T) => void,
    maxSize = 100
  ) {
    this.factory = factory
    this.resetter = resetter
    this.maxSize = maxSize
  }

  /**
   * 获取对象
   */
  acquire(): T {
    let obj: T

    if (this.pool.length > 0) {
      obj = this.pool.pop()!
      this.stats.reused++
    } else {
      obj = this.factory()
      this.stats.created++
    }

    this.inUse.add(obj)
    this.stats.acquired++

    return obj
  }

  /**
   * 释放对象
   */
  release(obj: T): void {
    if (!this.inUse.has(obj)) {
      console.warn('Attempting to release object not from this pool')
      return
    }

    this.inUse.delete(obj)

    if (this.pool.length < this.maxSize) {
      this.resetter(obj)
      this.pool.push(obj)
      this.stats.released++
    }
  }

  /**
   * 预填充池
   */
  prefill(count: number): void {
    const fillCount = Math.min(count, this.maxSize - this.pool.length)
    for (let i = 0; i < fillCount; i++) {
      const obj = this.factory()
      this.stats.created++
      this.pool.push(obj)
    }
  }

  /**
   * 清空池
   */
  clear(): void {
    this.pool = []
    this.stats = {
      created: 0,
      acquired: 0,
      released: 0,
      reused: 0
    }
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    poolSize: number
    created: number
    acquired: number
    released: number
    reused: number
    reuseRate: number
  } {
    const total = this.stats.created + this.stats.reused
    const reuseRate = total > 0 ? (this.stats.reused / total) * 100 : 0

    return {
      poolSize: this.pool.length,
      created: this.stats.created,
      acquired: this.stats.acquired,
      released: this.stats.released,
      reused: this.stats.reused,
      reuseRate
    }
  }
}

/**
 * 任务对象池
 */
export class TaskPool<T = any> extends ObjectPool<{
  id: string
  type: string
  data: T
  priority: number
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  error?: Error
}> {
  constructor(maxSize = 100) {
    super(
      () => ({
        id: '',
        type: '',
        data: null as T,
        priority: 0,
        status: 'pending'
      }),
      (task) => {
        task.id = ''
        task.type = ''
        task.data = null as T
        task.priority = 0
        task.status = 'pending'
        task.result = undefined
        task.error = undefined
      },
      maxSize
    )
  }

  /**
   * 创建任务
   */
  createTask(
    id: string,
    type: string,
    data: T,
    priority = 0
  ): ReturnType<ObjectPool<any>['acquire']> {
    const task = this.acquire()
    task.id = id
    task.type = type
    task.data = data
    task.priority = priority
    return task
  }
}

/**
 * 通知对象池
 */
export class NotificationPool extends ObjectPool<{
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  content: string
  duration: number
  timestamp: number
  actions?: Array<{ label: string; action: () => void }>
}> {
  constructor(maxSize = 50) {
    super(
      () => ({
        id: '',
        type: 'info',
        title: '',
        content: '',
        duration: 3000,
        timestamp: 0
      }),
      (notification) => {
        notification.id = ''
        notification.type = 'info'
        notification.title = ''
        notification.content = ''
        notification.duration = 3000
        notification.timestamp = 0
        notification.actions = undefined
      },
      maxSize
    )
  }

  /**
   * 创建通知
   */
  createNotification(
    id: string,
    type: 'success' | 'error' | 'warning' | 'info',
    title: string,
    content: string,
    duration = 3000
  ): ReturnType<ObjectPool<any>['acquire']> {
    const notification = this.acquire()
    notification.id = id
    notification.type = type
    notification.title = title
    notification.content = content
    notification.duration = duration
    notification.timestamp = Date.now()
    return notification
  }
}

/**
 * HTTP请求对象池
 */
export class RequestPool extends ObjectPool<{
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers: Record<string, string>
  body?: any
  timeout: number
  retries: number
  timestamp: number
}> {
  constructor(maxSize = 50) {
    super(
      () => ({
        url: '',
        method: 'GET',
        headers: {},
        timeout: 30000,
        retries: 3,
        timestamp: 0
      }),
      (request) => {
        request.url = ''
        request.method = 'GET'
        request.headers = {}
        request.body = undefined
        request.timeout = 30000
        request.retries = 3
        request.timestamp = 0
      },
      maxSize
    )
  }

  /**
   * 创建请求
   */
  createRequest(
    url: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET',
    options: {
      headers?: Record<string, string>
      body?: any
      timeout?: number
      retries?: number
    } = {}
  ): ReturnType<ObjectPool<any>['acquire']> {
    const request = this.acquire()
    request.url = url
    request.method = method
    request.headers = options.headers || {}
    request.body = options.body
    request.timeout = options.timeout || 30000
    request.retries = options.retries ?? 3
    request.timestamp = Date.now()
    return request
  }
}

/**
 * 集中式对象池管理器
 */
export class ObjectPoolManager {
  private pools = new Map<string, ObjectPool<any>>()
  private logger?: Logger

  constructor(logger?: Logger) {
    this.logger = logger
    this.initializeDefaultPools()
  }

  /**
   * 初始化默认对象池
   */
  private initializeDefaultPools(): void {
    // 任务池
    this.register('task', new TaskPool())

    // 通知池
    this.register('notification', new NotificationPool())

    // 请求池
    this.register('request', new RequestPool())

    this.logger?.debug('Default object pools initialized')
  }

  /**
   * 注册对象池
   */
  register<T extends object>(name: string, pool: ObjectPool<T>): void {
    if (this.pools.has(name)) {
      this.logger?.warn(`Object pool '${name}' already registered`)
      return
    }

    this.pools.set(name, pool)
    this.logger?.debug(`Object pool '${name}' registered`)
  }

  /**
   * 获取对象池
   */
  get<T extends object>(name: string): ObjectPool<T> | undefined {
    return this.pools.get(name)
  }

  /**
   * 获取对象（自动从对应池中获取）
   */
  acquire<T extends object>(poolName: string): T | undefined {
    const pool = this.pools.get(poolName)
    if (!pool) {
      this.logger?.warn(`Object pool '${poolName}' not found`)
      return undefined
    }

    return pool.acquire() as T
  }

  /**
   * 释放对象（自动返回到对应池）
   */
  release<T extends object>(poolName: string, obj: T): void {
    const pool = this.pools.get(poolName)
    if (!pool) {
      this.logger?.warn(`Object pool '${poolName}' not found`)
      return
    }

    pool.release(obj)
  }

  /**
   * 获取所有池的统计信息
   */
  getAllStats(): Record<string, ReturnType<ObjectPool<any>['getStats']>> {
    const stats: Record<string, ReturnType<ObjectPool<any>['getStats']>> = {}

    for (const [name, pool] of this.pools) {
      stats[name] = pool.getStats()
    }

    return stats
  }

  /**
   * 清空所有对象池
   */
  clearAll(): void {
    for (const pool of this.pools.values()) {
      pool.clear()
    }

    this.logger?.debug('All object pools cleared')
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAll()
    this.pools.clear()
  }
}

/**
 * 创建对象池管理器
 */
export function createObjectPoolManager(logger?: Logger): ObjectPoolManager {
  return new ObjectPoolManager(logger)
}

/**
 * 对象池装饰器
 * 自动从池中获取和释放对象
 */
export function Pooled(poolName: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
      const poolManager = getGlobalObjectPoolManager()
      const obj = poolManager.acquire(poolName)

      try {
        const result = originalMethod.call(this, obj, ...args)
        return result
      } finally {
        if (obj) {
          poolManager.release(poolName, obj)
        }
      }
    }

    return descriptor
  }
}

// 全局对象池管理器
let globalObjectPoolManager: ObjectPoolManager | undefined

export function getGlobalObjectPoolManager(): ObjectPoolManager {
  if (!globalObjectPoolManager) {
    globalObjectPoolManager = createObjectPoolManager()
  }
  return globalObjectPoolManager
}

export function setGlobalObjectPoolManager(manager: ObjectPoolManager): void {
  globalObjectPoolManager = manager
}




