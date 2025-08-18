/**
 * I18n 管理器注册表
 *
 * 提供统一的管理器注册和访问机制，支持依赖注入和生命周期管理
 */

import type { ErrorManager } from './errors'
import type { PerformanceManager } from './performance'
import type { Detector, Loader, LRUCache, Storage } from './types'

/**
 * 管理器接口
 */
export interface Manager {
  /** 管理器名称 */
  readonly name: string
  /** 初始化管理器 */
  init?: () => Promise<void> | void
  /** 销毁管理器 */
  destroy?: () => Promise<void> | void
  /** 获取管理器状态 */
  getStatus?: () => 'idle' | 'initializing' | 'ready' | 'error' | 'destroyed'
}

/**
 * 管理器工厂接口
 */
export interface ManagerFactory<T extends Manager> {
  /** 创建管理器实例 */
  create: (...args: any[]) => T
  /** 管理器类型名称 */
  readonly type: string
}

/**
 * 管理器注册表
 */
export class ManagerRegistry {
  private managers = new Map<string, Manager>()
  private factories = new Map<string, ManagerFactory<any>>()
  private dependencies = new Map<string, string[]>()
  private initializationOrder: string[] = []

  /**
   * 注册管理器工厂
   * @param factory 管理器工厂
   * @param dependencies 依赖的管理器名称列表
   */
  registerFactory<T extends Manager>(
    factory: ManagerFactory<T>,
    dependencies: string[] = []
  ): void {
    this.factories.set(factory.type, factory)
    this.dependencies.set(factory.type, dependencies)
  }

  /**
   * 注册管理器实例
   * @param manager 管理器实例
   * @param dependencies 依赖的管理器名称列表
   */
  registerManager(manager: Manager, dependencies: string[] = []): void {
    this.managers.set(manager.name, manager)
    this.dependencies.set(manager.name, dependencies)
  }

  /**
   * 获取管理器
   * @param name 管理器名称
   */
  getManager<T extends Manager>(name: string): T | undefined {
    return this.managers.get(name) as T
  }

  /**
   * 创建管理器（如果有工厂）
   * @param type 管理器类型
   * @param args 创建参数
   */
  createManager<T extends Manager>(
    type: string,
    ...args: any[]
  ): T | undefined {
    const factory = this.factories.get(type)
    if (!factory) {
      return undefined
    }

    const manager = factory.create(...args)
    this.registerManager(manager)
    return manager
  }

  /**
   * 检查管理器是否存在
   * @param name 管理器名称
   */
  hasManager(name: string): boolean {
    return this.managers.has(name)
  }

  /**
   * 移除管理器
   * @param name 管理器名称
   */
  async removeManager(name: string): Promise<boolean> {
    const manager = this.managers.get(name)
    if (!manager) {
      return false
    }

    // 销毁管理器
    if (manager.destroy) {
      await manager.destroy()
    }

    this.managers.delete(name)
    this.dependencies.delete(name)

    // 从初始化顺序中移除
    const index = this.initializationOrder.indexOf(name)
    if (index > -1) {
      this.initializationOrder.splice(index, 1)
    }

    return true
  }

  /**
   * 初始化所有管理器（按依赖顺序）
   */
  async initializeAll(): Promise<void> {
    // 计算初始化顺序
    this.calculateInitializationOrder()

    // 按顺序初始化
    for (const name of this.initializationOrder) {
      const manager = this.managers.get(name)
      if (manager?.init) {
        await manager.init()
      }
    }
  }

  /**
   * 销毁所有管理器（按相反顺序）
   */
  async destroyAll(): Promise<void> {
    // 按相反顺序销毁
    const destroyOrder = [...this.initializationOrder].reverse()

    for (const name of destroyOrder) {
      await this.removeManager(name)
    }

    this.initializationOrder = []
  }

  /**
   * 获取所有管理器的状态
   */
  getStatus(): Record<string, string> {
    const status: Record<string, string> = {}

    for (const [name, manager] of this.managers) {
      status[name] = manager.getStatus?.() || 'unknown'
    }

    return status
  }

  /**
   * 计算初始化顺序（拓扑排序）
   */
  private calculateInitializationOrder(): void {
    const visited = new Set<string>()
    const visiting = new Set<string>()
    const order: string[] = []

    const visit = (name: string) => {
      if (visiting.has(name)) {
        throw new Error(`循环依赖检测到: ${name}`)
      }

      if (visited.has(name)) {
        return
      }

      visiting.add(name)

      const deps = this.dependencies.get(name) || []
      for (const dep of deps) {
        if (this.managers.has(dep) || this.factories.has(dep)) {
          visit(dep)
        }
      }

      visiting.delete(name)
      visited.add(name)
      order.push(name)
    }

    // 访问所有管理器
    for (const name of this.managers.keys()) {
      visit(name)
    }

    this.initializationOrder = order
  }

  /**
   * 获取管理器列表
   */
  getManagerNames(): string[] {
    return Array.from(this.managers.keys())
  }

  /**
   * 获取工厂列表
   */
  getFactoryTypes(): string[] {
    return Array.from(this.factories.keys())
  }

  /**
   * 清空注册表
   */
  clear(): void {
    this.managers.clear()
    this.factories.clear()
    this.dependencies.clear()
    this.initializationOrder = []
  }
}

/**
 * I18n 核心管理器
 */
export class I18nCoreManager implements Manager {
  readonly name = 'i18n-core'
  private status: 'idle' | 'initializing' | 'ready' | 'error' | 'destroyed' =
    'idle'

  constructor(
    public readonly loader: Loader,
    public readonly storage: Storage,
    public readonly detector: Detector,
    public readonly cache: LRUCache<string>,
    public readonly performanceManager: PerformanceManager,
    public readonly errorManager: ErrorManager
  ) {}

  async init(): Promise<void> {
    this.status = 'initializing'
    try {
      // 初始化各个组件
      if ('init' in this.loader && typeof this.loader.init === 'function') {
        await this.loader.init()
      }

      this.status = 'ready'
    } catch (error) {
      this.status = 'error'
      throw error
    }
  }

  async destroy(): Promise<void> {
    this.status = 'destroyed'

    // 清理资源
    this.cache.clear()
    this.performanceManager.resetMetrics()
    this.errorManager.resetStats()
  }

  getStatus() {
    return this.status
  }
}

/**
 * 全局管理器注册表
 */
export const globalRegistry = new ManagerRegistry()

/**
 * 管理器装饰器：自动注册管理器
 */
export function registerManager(dependencies: string[] = []) {
  return function <T extends Manager>(constructor: new (...args: any[]) => T) {
    const factory: ManagerFactory<T> = {
      type: constructor.name,
      create: (...args: any[]) => new constructor(...args),
    }

    globalRegistry.registerFactory(factory, dependencies)
    return constructor
  }
}

/**
 * 依赖注入装饰器
 */
export function inject(managerName: string) {
  return function (target: any, propertyKey: string) {
    // 在运行时注入依赖
    Object.defineProperty(target, propertyKey, {
      get() {
        return globalRegistry.getManager(managerName)
      },
      enumerable: true,
      configurable: true,
    })
  }
}
