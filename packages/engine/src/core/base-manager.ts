/**
 * 基础管理器类
 * 为所有管理器提供通用的基础功能
 */

import type { Engine } from '../types/engine'

/**
 * 基础管理器接口
 */
export interface IBaseManager {
  /**
   * 管理器名称
   */
  readonly name: string

  /**
   * 初始化管理器
   */
  initialize: () => Promise<void> | void

  /**
   * 销毁管理器
   */
  destroy: () => Promise<void> | void

  /**
   * 获取管理器状态
   */
  getStatus: () => 'idle' | 'initializing' | 'ready' | 'error' | 'destroyed'
}

/**
 * 基础管理器抽象类
 * 提供管理器的通用实现
 */
export abstract class AbstractBaseManager<T = any> implements IBaseManager {
  protected engine: Engine
  protected _status: 'idle' | 'initializing' | 'ready' | 'error' | 'destroyed' = 'idle'
  protected _initialized = false
  protected config: T

  constructor(engine: Engine, public readonly name: string, config?: T) {
    this.engine = engine
    this.config = config || ({} as T)
  }

  /**
   * 获取管理器状态
   */
  getStatus(): 'idle' | 'initializing' | 'ready' | 'error' | 'destroyed' {
    return this._status
  }

  /**
   * 检查是否已初始化
   */
  get isInitialized(): boolean {
    return this._initialized
  }

  /**
   * 检查是否已准备就绪
   */
  get isReady(): boolean {
    return this._status === 'ready'
  }

  /**
   * 初始化管理器
   */
  async initialize(): Promise<void> {
    if (this._initialized) {
      return
    }

    try {
      this._status = 'initializing'
      await this.onInitialize()
      this._status = 'ready'
      this._initialized = true
    } catch (error) {
      this._status = 'error'
      throw error
    }
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    if (this._status === 'destroyed') {
      return
    }

    try {
      await this.onDestroy()
      this._status = 'destroyed'
      this._initialized = false
    } catch (error) {
      this._status = 'error'
      throw error
    }
  }

  /**
   * 子类需要实现的初始化逻辑
   */
  protected abstract onInitialize(): Promise<void> | void

  /**
   * 子类需要实现的销毁逻辑
   */
  protected abstract onDestroy(): Promise<void> | void

  /**
   * 记录日志
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.engine.logger) {
      this.engine.logger[level](`[${this.name}] ${message}`, ...args)
    } else {
      console[level](`[${this.name}] ${message}`, ...args)
    }
  }

  /**
   * 触发事件
   */
  protected emit(event: string, data?: any): void {
    if (this.engine.events) {
      this.engine.events.emit(`${this.name}:${event}`, data)
    }
  }

  /**
   * 监听事件
   */
  protected on(event: string, handler: (data?: any) => void): void {
    if (this.engine.events) {
      this.engine.events.on(`${this.name}:${event}`, handler)
    }
  }

  /**
   * 移除事件监听
   */
  protected off(event: string, handler?: (data?: any) => void): void {
    if (this.engine.events) {
      this.engine.events.off(`${this.name}:${event}`, handler)
    }
  }
}

/**
 * 基础管理器类
 * 提供管理器的具体实现
 */
export class BaseManager<T = any> extends AbstractBaseManager<T> {
  constructor(name: string, config?: T, engine?: Engine) {
    super(engine!, name, config)
  }

  protected async onInitialize(): Promise<void> {
    // 默认实现，子类可以重写
  }

  protected async onDestroy(): Promise<void> {
    // 默认实现，子类可以重写
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<T>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * 获取基础统计信息
   */
  getStats(): { name: string; status: ReturnType<IBaseManager['getStatus']>; initialized: boolean } {
    return {
      name: this.name,
      status: this.getStatus(),
      initialized: this.isInitialized,
    }
  }

  /**
   * 记录日志
   */
  protected log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    if (this.engine?.logger) {
      this.engine.logger[level](`[${this.name}] ${message}`, ...args)
    } else {
      console[level](`[${this.name}] ${message}`, ...args)
    }
  }

  /**
   * 记录错误
   */
  protected error(message: string, ...args: any[]): void {
    this.log('error', message, ...args)
  }
}

/**
 * 管理器工厂函数类型
 */
export type ManagerFactory<T extends IBaseManager> = (engine: Engine) => T

/**
 * 创建管理器的辅助函数
 */
export function createManager<T extends IBaseManager>(
  factory: ManagerFactory<T>,
  engine: Engine
): T {
  return factory(engine)
}

/**
 * 管理器注册表
 */
export class ManagerRegistry {
  private managers = new Map<string, IBaseManager>()

  /**
   * 注册管理器
   */
  register<T extends IBaseManager>(name: string, manager: T): void {
    if (this.managers.has(name)) {
      throw new Error(`Manager "${name}" is already registered`)
    }
    this.managers.set(name, manager)
  }

  /**
   * 获取管理器
   */
  get<T extends IBaseManager>(name: string): T | undefined {
    return this.managers.get(name) as T | undefined
  }

  /**
   * 检查管理器是否存在
   */
  has(name: string): boolean {
    return this.managers.has(name)
  }

  /**
   * 移除管理器
   */
  unregister(name: string): boolean {
    return this.managers.delete(name)
  }

  /**
   * 获取所有管理器名称
   */
  getNames(): string[] {
    return Array.from(this.managers.keys())
  }

  /**
   * 获取所有管理器
   */
  getAll(): IBaseManager[] {
    return Array.from(this.managers.values())
  }

  /**
   * 清空所有管理器
   */
  clear(): void {
    this.managers.clear()
  }

  /**
   * 初始化所有管理器
   */
  async initializeAll(): Promise<void> {
    const managers = this.getAll()
    await Promise.all(managers.map(manager => manager.initialize()))
  }

  /**
   * 销毁所有管理器
   */
  async destroyAll(): Promise<void> {
    const managers = this.getAll()
    await Promise.all(managers.map(manager => manager.destroy()))
  }
}
