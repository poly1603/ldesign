/**
 * 高性能响应式系统
 * 提供批量更新、智能缓存、虚拟代理等优化功能
 */

import type { ReactiveEffect, UnwrapRef } from 'vue'
import { customRef, reactive, readonly, shallowRef, triggerRef } from 'vue'

/**
 * 批量更新管理器
 * 将多个状态更新合并为一次，减少渲染次数
 */
export class BatchUpdateManager {
  private static instance: BatchUpdateManager
  private updateQueue: Set<() => void> = new Set()
  private isFlushPending = false
  private flushPromise: Promise<void> | null = null

  static getInstance(): BatchUpdateManager {
    if (!this.instance) {
      this.instance = new BatchUpdateManager()
    }
    return this.instance
  }

  /**
   * 添加更新到队列
   */
  queueUpdate(updater: () => void): void {
    this.updateQueue.add(updater)
    this.scheduleFlush()
  }

  /**
   * 调度刷新 - 使用queueMicrotask优化性能
   */
  private scheduleFlush(): void {
    if (!this.isFlushPending) {
      this.isFlushPending = true
      // 使用 queueMicrotask 代替 Promise.resolve 提升性能
      if (typeof queueMicrotask !== 'undefined') {
        this.flushPromise = new Promise<void>(resolve => {
          queueMicrotask(() => {
            this.flush()
            resolve()
          })
        })
      } else {
        // 降级到 Promise.resolve
        this.flushPromise = Promise.resolve().then(() => this.flush())
      }
    }
  }

  /**
   * 执行所有更新（优化版：减少迭代开销）
   */
  private flush(): void {
    const updates = Array.from(this.updateQueue)
    this.updateQueue.clear()
    this.isFlushPending = false
    this.flushPromise = null

    // 优化：使用 for 循环替代 forEach（性能更好）
    const len = updates.length
    for (let i = 0; i < len; i++) {
      try {
        updates[i]()
      } catch (error) {
        console.error('Batch update error:', error)
      }
    }
  }

  /**
   * 等待所有更新完成
   */
  async waitForFlush(): Promise<void> {
    if (this.flushPromise) {
      await this.flushPromise
    }
  }

  /**
   * 立即执行所有更新
   */
  flushSync(): void {
    if (this.isFlushPending) {
      this.flush()
    }
  }
}

/**
 * 智能缓存管理器
 * 使用WeakMap避免内存泄漏
 */
export class SmartCacheManager<K extends object = object, V = any> {
  private cache = new WeakMap<K, { value: V; timestamp: number }>()
  private ttl: number
  private maxSize?: number
  private accessCount = new WeakMap<K, number>()

  constructor(ttl = 5000, maxSize?: number) {
    this.ttl = ttl
    this.maxSize = maxSize
  }

  /**
   * 获取缓存值
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key)

    if (!entry) {
      return undefined
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return undefined
    }

    // 更新访问计数
    const count = this.accessCount.get(key) || 0
    this.accessCount.set(key, count + 1)

    return entry.value
  }

  /**
   * 设置缓存值
   */
  set(key: K, value: V): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    })

    // 初始化访问计数
    if (!this.accessCount.has(key)) {
      this.accessCount.set(key, 0)
    }
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    this.accessCount.delete(key)
    return this.cache.delete(key)
  }

  /**
   * 清空缓存
   */
  clear(): void {
    // WeakMap 无法遍历，只能依赖垃圾回收
    // 创建新的 WeakMap 实例
    this.cache = new WeakMap()
    this.accessCount = new WeakMap()
  }

  /**
   * 获取或设置缓存
   */
  getOrSet(key: K, factory: () => V): V {
    let value = this.get(key)

    if (value === undefined) {
      value = factory()
      this.set(key, value)
    }

    return value
  }
}

/**
 * 虚拟代理模式
 * 延迟初始化和按需加载
 */
export class VirtualProxy<T extends object> {
  private target: T | null = null
  private factory: () => Promise<T>
  private isInitialized = false
  private initPromise: Promise<T> | null = null

  constructor(factory: () => T | Promise<T>) {
    this.factory = async () => {
      const result = factory()
      return result instanceof Promise ? await result : result
    }
  }

  /**
   * 获取代理对象
   */
  getProxy(): T {
    return new Proxy({} as T, {
      get: (_, prop: string | symbol) => {
        if (!this.isInitialized) {
          this.initialize()
        }

        if (this.target) {
          return Reflect.get(this.target, prop)
        }

        // 返回 Promise 以支持异步初始化
        return this.initPromise?.then(target => Reflect.get(target, prop))
      },

      set: (_, prop: string | symbol, value: any) => {
        if (!this.isInitialized) {
          this.initialize()
        }

        if (this.target) {
          return Reflect.set(this.target, prop, value)
        }

        return false
      },

      has: (_, prop: string | symbol) => {
        if (!this.isInitialized) {
          this.initialize()
        }

        if (this.target) {
          return Reflect.has(this.target, prop)
        }

        return false
      }
    })
  }

  /**
   * 初始化目标对象
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized || this.initPromise) {
      return
    }

    this.initPromise = this.factory()
    this.target = await this.initPromise
    this.isInitialized = true
  }

  /**
   * 强制初始化
   */
  async forceInit(): Promise<T> {
    await this.initialize()
    return this.target!
  }

  /**
   * 是否已初始化
   */
  get initialized(): boolean {
    return this.isInitialized
  }
}

/**
 * 计算属性优化器
 * 智能缓存计算结果
 */
export class ComputedOptimizer<T = any> {
  private cache: T | undefined
  private isDirty = true
  private deps = new Set<ReactiveEffect>()
  private getter: () => T
  private setter?: (value: T) => void

  constructor(getter: () => T, setter?: (value: T) => void) {
    this.getter = getter
    this.setter = setter
  }

  /**
   * 获取计算值
   */
  get value(): T {
    if (this.isDirty) {
      this.cache = this.getter()
      this.isDirty = false
    }

    return this.cache!
  }

  /**
   * 设置计算值
   */
  set value(newValue: T) {
    if (this.setter) {
      this.setter(newValue)
    } else {
      console.warn('Computed value is readonly')
    }
  }

  /**
   * 标记为脏数据
   */
  invalidate(): void {
    this.isDirty = true
  }

  /**
   * 创建响应式计算属性
   */
  toRef() {
    return customRef((track, trigger) => {
      return {
        get: () => {
          track()
          return this.value
        },
        set: (newValue: T) => {
          this.value = newValue
          trigger()
        }
      }
    })
  }
}

/**
 * 响应式状态优化器
 */
export class ReactiveOptimizer {
  private batchManager = BatchUpdateManager.getInstance()
  private computedCache = new SmartCacheManager<object, any>()
  private proxyCache = new WeakMap<object, any>()

  /**
   * 创建优化的响应式状态
   */
  createOptimizedReactive<T extends object>(target: T): UnwrapRef<T> {
    // 检查缓存
    const cached = this.proxyCache.get(target)
    if (cached) {
      return cached
    }

    // 创建响应式代理
    const proxy = reactive(target) as UnwrapRef<T>

    // 缓存代理
    this.proxyCache.set(target, proxy)

    return proxy
  }

  /**
   * 创建浅响应式状态
   */
  createShallowReactive<T>(value: T) {
    const ref = shallowRef(value)

    return {
      value: ref.value,

      setValue(newValue: T) {
        ref.value = newValue
        triggerRef(ref)
      },

      trigger() {
        triggerRef(ref)
      }
    }
  }

  /**
   * 创建只读状态
   */
  createReadonly<T extends object>(target: T): Readonly<T> {
    return readonly(target) as Readonly<T>
  }

  /**
   * 批量更新状态
   */
  batchUpdate(updater: () => void): void {
    this.batchManager.queueUpdate(updater)
  }

  /**
   * 同步批量更新
   */
  batchUpdateSync(updater: () => void): void {
    updater()
    this.batchManager.flushSync()
  }

  /**
   * 创建优化的计算属性
   */
  createComputed<T>(getter: () => T, setter?: (value: T) => void): ComputedOptimizer<T> {
    return new ComputedOptimizer(getter, setter)
  }

  /**
   * 创建虚拟代理
   */
  createVirtualProxy<T extends object>(factory: () => T | Promise<T>): T {
    const proxy = new VirtualProxy(factory)
    return proxy.getProxy()
  }
}

/**
 * 内存管理器
 * 自动清理未使用的响应式对象
 */
export class MemoryManager {
  private cleanupCallbacks = new Map<string, () => void>()
  private registry = typeof (globalThis as any).FinalizationRegistry !== 'undefined'
    ? new (globalThis as any).FinalizationRegistry((id: string) => {
        // 执行注册的清理回调
        const callback = this.cleanupCallbacks.get(id)
        if (callback) {
          try {
            callback()
          } catch (error) {
            console.error(`Memory cleanup error for ${id}:`, error)
          } finally {
            this.cleanupCallbacks.delete(id)
          }
        }
      })
    : null

  private weakRefs = new Map<object, any>()
  private cleanupTimers = new Map<string, NodeJS.Timeout>()

  /**
   * 注册对象进行自动清理
   */
  register(obj: object, id: string, cleanup?: () => void): void {
    // 创建弱引用
    if (typeof (globalThis as any).WeakRef !== 'undefined') {
      const weakRef = new (globalThis as any).WeakRef(obj)
      this.weakRefs.set(obj, weakRef)
    }

    // 注册清理回调
    if (this.registry) {
      this.registry.register(obj, id, obj) // 传入token用于后续unregister
      if (cleanup) {
        this.cleanupCallbacks.set(id, cleanup)
      }
    }

    // 设置定时检查（减少频率到5分钟）
    this.scheduleCleanup(id)
  }

  /**
   * 手动清理对象
   */
  unregister(obj: object): void {
    this.weakRefs.delete(obj)
    if (this.registry) {
      this.registry.unregister(obj)
    }
  }

  /**
   * 调度清理检查
   */
  private scheduleCleanup(id: string): void {
    // 清除旧的定时器
    const existingTimer = this.cleanupTimers.get(id)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新的定时器（延长到5分钟以减少性能开销）
    const timer = setTimeout(() => {
      this.performCleanup(id)
      this.cleanupTimers.delete(id)
    }, 300000) // 5分钟后检查

    this.cleanupTimers.set(id, timer)
  }

  /**
   * 执行清理
   */
  private performCleanup(id: string): void {
    // 检查弱引用是否还有效
    for (const [obj, weakRef] of Array.from(this.weakRefs.entries())) {
      if (weakRef && typeof weakRef.deref === 'function') {
        const target = weakRef.deref()
        if (!target) {
          // 对象已被垃圾回收，清理相关资源
          this.weakRefs.delete(obj)
          const cleanup = this.cleanupCallbacks.get(id)
          if (cleanup) {
            try {
              cleanup()
            } catch (error) {
              console.error(`Cleanup error for ${id}:`, error)
            }
            this.cleanupCallbacks.delete(id)
          }
        }
      }
    }
  }

  /**
   * 清理所有资源
   */
  dispose(): void {
    // 清理所有定时器
    this.cleanupTimers.forEach(timer => clearTimeout(timer))
    this.cleanupTimers.clear()
    
    // 执行所有待清理的回调
    for (const [id, cleanup] of this.cleanupCallbacks.entries()) {
      try {
        cleanup()
      } catch (error) {
        console.error(`Dispose cleanup error for ${id}:`, error)
      }
    }
    this.cleanupCallbacks.clear()
    
    // 清理弱引用
    this.weakRefs = new Map()
  }
}

/**
 * 依赖追踪器
 * 优化依赖收集和触发
 */
export class DependencyTracker {
  private dependencies = new Map<string, Set<ReactiveEffect>>()
  private effectScopes = new WeakMap<object, Set<string>>()

  /**
   * 收集依赖
   */
  track(target: object, key: string, effect: ReactiveEffect): void {
    const id = this.getTargetKey(target, key)

    if (!this.dependencies.has(id)) {
      this.dependencies.set(id, new Set())
    }

    this.dependencies.get(id)!.add(effect)

    // 记录作用域
    if (!this.effectScopes.has(target)) {
      this.effectScopes.set(target, new Set())
    }

    this.effectScopes.get(target)!.add(key)
  }

  /**
   * 触发更新（优化版：减少 Set 复制开销）
   */
  trigger(target: object, key: string): void {
    const id = this.getTargetKey(target, key)
    const effects = this.dependencies.get(id)

    if (effects && effects.size > 0) {
      // 优化：直接遍历，只在需要时复制
      if (effects.size === 1) {
        // 单个 effect 时不需要复制
        const effect = effects.values().next().value
        if (effect.scheduler) {
          effect.scheduler()
        } else {
          effect.run()
        }
      } else {
        // 多个 effects 时才复制避免循环依赖
        const effectsToRun = Array.from(effects)
        const len = effectsToRun.length
        for (let i = 0; i < len; i++) {
          const effect = effectsToRun[i]
          if (effect.scheduler) {
            effect.scheduler()
          } else {
            effect.run()
          }
        }
      }
    }
  }

  /**
   * 清理依赖
   */
  cleanup(target: object, key?: string): void {
    if (key) {
      const id = this.getTargetKey(target, key)
      this.dependencies.delete(id)
    } else {
      // 清理整个对象的依赖
      const keys = this.effectScopes.get(target)
      if (keys) {
        keys.forEach(k => {
          const id = this.getTargetKey(target, k)
          this.dependencies.delete(id)
        })
        this.effectScopes.delete(target)
      }
    }
  }

  /**
   * 生成唯一标识
   */
  private getTargetKey(target: object, key: string): string {
    // 使用 WeakMap 会更好，但这里简化处理
    return `${target.constructor.name}_${key}`
  }
}

// 导出单例实例
export const batchUpdateManager = BatchUpdateManager.getInstance()
export const reactiveOptimizer = new ReactiveOptimizer()
export const memoryManager = new MemoryManager()
export const dependencyTracker = new DependencyTracker()

// 导出便捷函数
export function batchUpdate(updater: () => void): void {
  batchUpdateManager.queueUpdate(updater)
}

export function batchUpdateSync(updater: () => void): void {
  updater()
  batchUpdateManager.flushSync()
}

export async function waitForUpdates(): Promise<void> {
  await batchUpdateManager.waitForFlush()
}
