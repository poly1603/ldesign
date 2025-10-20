/**
 * Bug修复和错误处理增强
 * 解决内存泄漏、循环依赖、异步竞态等问题
 */

import type { EffectScope, WatchStopHandle } from 'vue'
import { effectScope, onScopeDispose } from 'vue'

/**
 * 循环依赖检测器
 */
export class CircularDependencyDetector {
  private static dependencies = new Map<string, Set<string>>()
  private static currentPath: string[] = []

  /**
   * 开始依赖追踪
   */
  static startTracking(id: string): void {
    if (this.currentPath.includes(id)) {
      const cycle = [...this.currentPath, id]
      const cycleStart = cycle.indexOf(id)
      const cyclePath = cycle.slice(cycleStart).join(' -> ')

      throw new Error(
        `Circular dependency detected: ${cyclePath}\n` +
        `This can cause infinite loops and memory leaks.\n` +
        `Please refactor your store dependencies.`
      )
    }

    this.currentPath.push(id)
  }

  /**
   * 结束依赖追踪
   */
  static endTracking(id: string): void {
    const index = this.currentPath.indexOf(id)
    if (index >= 0) {
      this.currentPath.splice(index, 1)
    }
  }

  /**
   * 添加依赖关系
   */
  static addDependency(from: string, to: string): void {
    if (!this.dependencies.has(from)) {
      this.dependencies.set(from, new Set())
    }

    this.dependencies.get(from)!.add(to)

    // 检查是否形成循环
    this.checkCycle(from)
  }

  /**
   * 检查循环依赖
   */
  private static checkCycle(start: string, visited = new Set<string>(), path: string[] = []): void {
    if (visited.has(start)) {
      if (path.includes(start)) {
        const cycleStart = path.indexOf(start)
        const cycle = path.slice(cycleStart).concat(start)

        console.warn(
          `Warning: Potential circular dependency detected: ${cycle.join(' -> ')}`
        )
      }
      return
    }

    visited.add(start)
    path.push(start)

    const deps = this.dependencies.get(start)
    if (deps) {
      deps.forEach(dep => {
        this.checkCycle(dep, visited, [...path])
      })
    }
  }

  /**
   * 清理依赖记录
   */
  static clear(): void {
    this.dependencies.clear()
    this.currentPath = []
  }

  /**
   * 获取依赖图
   */
  static getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencies)
  }
}

/**
 * 内存泄漏防护器
 */
export class MemoryLeakGuard {
  private static scopes = new WeakMap<object, EffectScope>()
  private static watchers = new WeakMap<object, Set<WatchStopHandle>>()
  private static timers = new WeakMap<object, Set<NodeJS.Timeout>>()
  private static listeners = new WeakMap<object, Map<EventTarget, Map<string, EventListener>>>()

  /**
   * 创建受保护的作用域
   */
  static createScope(owner: object): EffectScope {
    const scope = effectScope()
    this.scopes.set(owner, scope)

    // 在作用域销毁时清理
    scope.run(() => {
      onScopeDispose(() => {
        this.cleanup(owner)
      })
    })

    return scope
  }

  /**
   * 在作用域内运行
   */
  static runInScope<T>(owner: object, fn: () => T): T {
    let scope = this.scopes.get(owner)

    if (!scope) {
      scope = this.createScope(owner)
    }

    return scope.run(fn)!
  }

  /**
   * 添加监听器
   */
  static addWatcher(owner: object, watcher: WatchStopHandle): void {
    if (!this.watchers.has(owner)) {
      this.watchers.set(owner, new Set())
    }

    this.watchers.get(owner)!.add(watcher)
  }

  /**
   * 添加定时器
   */
  static addTimer(owner: object, timer: NodeJS.Timeout): void {
    if (!this.timers.has(owner)) {
      this.timers.set(owner, new Set())
    }

    this.timers.get(owner)!.add(timer)
  }

  /**
   * 添加事件监听器
   */
  static addEventListener(
    owner: object,
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    if (!this.listeners.has(owner)) {
      this.listeners.set(owner, new Map())
    }

    const ownerListeners = this.listeners.get(owner)!

    if (!ownerListeners.has(target)) {
      ownerListeners.set(target, new Map())
    }

    const targetListeners = ownerListeners.get(target)!

    // 移除旧的监听器
    if (targetListeners.has(type)) {
      const oldListener = targetListeners.get(type)!
      target.removeEventListener(type, oldListener, options)
    }

    // 添加新的监听器
    target.addEventListener(type, listener, options)
    targetListeners.set(type, listener)
  }

  /**
   * 清理资源
   */
  static cleanup(owner: object): void {
    // 停止作用域
    const scope = this.scopes.get(owner)
    if (scope) {
      scope.stop()
      this.scopes.delete(owner)
    }

    // 停止监听器
    const watchers = this.watchers.get(owner)
    if (watchers) {
      watchers.forEach(stop => stop())
      this.watchers.delete(owner)
    }

    // 清理定时器
    const timers = this.timers.get(owner)
    if (timers) {
      timers.forEach(timer => clearTimeout(timer))
      this.timers.delete(owner)
    }

    // 移除事件监听器
    const listeners = this.listeners.get(owner)
    if (listeners) {
      listeners.forEach((targetListeners, target) => {
        targetListeners.forEach((listener, type) => {
          target.removeEventListener(type, listener)
        })
      })
      this.listeners.delete(owner)
    }
  }

  /**
   * 检查是否有泄漏
   */
  static hasLeaks(owner: object): boolean {
    return !!(
      this.scopes.has(owner) ||
      this.watchers.has(owner) ||
      this.timers.has(owner) ||
      this.listeners.has(owner)
    )
  }
}

/**
 * 异步竞态条件处理器
 */
export class AsyncRaceConditionHandler {
  private static requestMap = new WeakMap<object, Map<string, AbortController>>()
  private static versionMap = new WeakMap<object, Map<string, number>>()

  /**
   * 执行异步操作（自动取消旧的）
   */
  static async execute<T>(
    owner: object,
    key: string,
    executor: (signal: AbortSignal) => Promise<T>
  ): Promise<T> {
    // 取消之前的请求
    this.cancel(owner, key)

    // 创建新的控制器
    const controller = new AbortController()

    if (!this.requestMap.has(owner)) {
      this.requestMap.set(owner, new Map())
    }

    this.requestMap.get(owner)!.set(key, controller)

    // 增加版本号
    if (!this.versionMap.has(owner)) {
      this.versionMap.set(owner, new Map())
    }

    const versionMap = this.versionMap.get(owner)!
    const version = (versionMap.get(key) || 0) + 1
    versionMap.set(key, version)

    try {
      const result = await executor(controller.signal)

      // 检查是否是最新版本
      const currentVersion = versionMap.get(key)
      if (currentVersion !== version) {
        throw new Error('Stale request')
      }

      return result
    } finally {
      // 清理
      const requests = this.requestMap.get(owner)
      if (requests?.get(key) === controller) {
        requests.delete(key)
      }
    }
  }

  /**
   * 取消请求
   */
  static cancel(owner: object, key: string): void {
    const requests = this.requestMap.get(owner)
    const controller = requests?.get(key)

    if (controller) {
      controller.abort()
      requests!.delete(key)
    }
  }

  /**
   * 取消所有请求
   */
  static cancelAll(owner: object): void {
    const requests = this.requestMap.get(owner)

    if (requests) {
      requests.forEach(controller => controller.abort())
      requests.clear()
    }
  }

  /**
   * 防抖执行
   */
  static debounce<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout | null = null

    return function (this: any, ...args: Parameters<T>) {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(() => {
        fn.apply(this, args)
        timeoutId = null
      }, delay)
    }
  }

  /**
   * 节流执行
   */
  static throttle<T extends (...args: any[]) => any>(
    fn: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false

    return function (this: any, ...args: Parameters<T>) {
      if (!inThrottle) {
        fn.apply(this, args)
        inThrottle = true

        setTimeout(() => {
          inThrottle = false
        }, limit)
      }
    }
  }

  /**
   * 并发控制
   */
  static createConcurrencyLimiter(maxConcurrent: number) {
    let running = 0
    const queue: (() => void)[] = []

    const run = async <T>(fn: () => Promise<T>): Promise<T> => {
      if (running >= maxConcurrent) {
        await new Promise<void>(resolve => {
          queue.push(resolve)
        })
      }

      running++

      try {
        return await fn()
      } finally {
        running--

        const next = queue.shift()
        if (next) {
          next()
        }
      }
    }

    return { run }
  }
}

/**
 * 错误处理增强
 */
export class EnhancedErrorHandler {
  private static errorHandlers = new Map<string, ErrorHandler>()
  private static globalHandler: GlobalErrorHandler | null = null

  /**
   * 注册错误处理器
   */
  static register(type: string, handler: ErrorHandler): void {
    this.errorHandlers.set(type, handler)
  }

  /**
   * 设置全局错误处理器
   */
  static setGlobalHandler(handler: GlobalErrorHandler): void {
    this.globalHandler = handler
  }

  /**
   * 处理错误
   */
  static handle(error: Error, context?: ErrorContext): void {
    // 尝试特定处理器
    const handler = this.errorHandlers.get(error.constructor.name)

    if (handler) {
      try {
        handler(error, context)
        return
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    }

    // 使用全局处理器
    if (this.globalHandler) {
      this.globalHandler(error, context)
    } else {
      console.error('Unhandled error:', error, context)
    }
  }

  /**
   * 包装函数以捕获错误
   */
  static wrap<T extends (...args: any[]) => any>(
    fn: T,
    context?: ErrorContext
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn.apply(this, args)

        // 处理Promise
        if (result instanceof Promise) {
          return result.catch(error => {
            this.handle(error, context)
            throw error
          })
        }

        return result
      } catch (error) {
        this.handle(error as Error, context)
        throw error
      }
    }) as T
  }

  /**
   * 创建安全的异步函数
   */
  static safeAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    fallback?: any
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn.apply(this, args)
      } catch (error) {
        this.handle(error as Error)

        if (fallback !== undefined) {
          return typeof fallback === 'function' ? fallback(error) : fallback
        }

        throw error
      }
    }) as T
  }
}

/**
 * 类型安全增强
 */
export class TypeSafetyEnhancer {
  /**
   * 运行时类型检查
   */
  static validateType<T>(
    value: unknown,
    validator: TypeValidator<T>
  ): value is T {
    return validator.validate(value)
  }

  /**
   * 创建类型守卫
   */
  static createGuard<T>(
    validator: (value: unknown) => boolean
  ): (value: unknown) => value is T {
    return (value): value is T => validator(value)
  }

  /**
   * 安全的类型转换
   */
  static safeCast<T>(
    value: unknown,
    type: Constructor<T>,
    fallback?: T
  ): T {
    if (value instanceof type) {
      return value
    }

    if (fallback !== undefined) {
      return fallback
    }

    throw new TypeError(
      `Expected instance of ${type.name}, got ${typeof value}`
    )
  }

  /**
   * 深度冻结对象
   */
  static deepFreeze<T extends object>(obj: T): Readonly<T> {
    Object.freeze(obj)

    Object.getOwnPropertyNames(obj).forEach(prop => {
      const value = (obj as any)[prop]

      if (value && typeof value === 'object') {
        this.deepFreeze(value)
      }
    })

    return obj as Readonly<T>
  }

  /**
   * 创建不可变对象
   */
  static createImmutable<T extends object>(obj: T): Immutable<T> {
    return new Proxy(this.deepFreeze({ ...obj }), {
      set() {
        throw new Error('Cannot modify immutable object')
      },

      deleteProperty() {
        throw new Error('Cannot delete property from immutable object')
      }
    }) as Immutable<T>
  }
}

/**
 * 资源清理器
 */
export class ResourceCleaner {
  private cleanupTasks = new Set<CleanupTask>()

  /**
   * 注册清理任务
   */
  register(task: CleanupTask): void {
    this.cleanupTasks.add(task)
  }

  /**
   * 执行清理
   */
  async cleanup(): Promise<void> {
    const tasks = Array.from(this.cleanupTasks)
    this.cleanupTasks.clear()

    // 并行执行所有清理任务
    await Promise.all(
      tasks.map(async task => {
        try {
          await task()
        } catch (error) {
          console.error('Cleanup task failed:', error)
        }
      })
    )
  }

  /**
   * 创建可清理的资源
   */
  createDisposable<T>(
    resource: T,
    cleanup: (resource: T) => void | Promise<void>
  ): Disposable<T> {
    this.register(() => cleanup(resource))

    return {
      resource,
      dispose: async () => {
        await cleanup(resource)
        this.cleanupTasks.delete(() => cleanup(resource))
      }
    }
  }
}

// 类型定义
interface ErrorHandler {
  (error: Error, context?: ErrorContext): void
}

interface GlobalErrorHandler {
  (error: Error, context?: ErrorContext): void
}

interface ErrorContext {
  store?: string
  action?: string
  state?: any
  [key: string]: any
}

interface TypeValidator<T> {
  validate: (value: unknown) => value is T
}

interface Constructor<T> {
  new (...args: any[]): T
}

type Immutable<T> = {
  readonly [K in keyof T]: T[K] extends object ? Immutable<T[K]> : T[K]
}

type CleanupTask = () => void | Promise<void>

interface Disposable<T> {
  resource: T
  dispose: () => Promise<void>
}

// 导出便捷函数
export const detectCircularDependency = CircularDependencyDetector.startTracking.bind(CircularDependencyDetector)
export const endCircularDependencyDetection = CircularDependencyDetector.endTracking.bind(CircularDependencyDetector)
export const guardMemoryLeak = MemoryLeakGuard.createScope.bind(MemoryLeakGuard)
export const cleanupResources = MemoryLeakGuard.cleanup.bind(MemoryLeakGuard)
export const handleAsyncRace = AsyncRaceConditionHandler.execute.bind(AsyncRaceConditionHandler)
export const handleError = EnhancedErrorHandler.handle.bind(EnhancedErrorHandler)
export const validateType = TypeSafetyEnhancer.validateType.bind(TypeSafetyEnhancer)
