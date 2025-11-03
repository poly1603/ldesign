/**
 * 依赖注入容器实现
 * 提供服务注册和解析功能
 */

import type {
  DIContainer,
  ServiceConstructor,
  ServiceFactory,
  ServiceLifetime,
  ServiceProvider,
} from '../types'

interface ServiceRegistration<T = any> {
  provider: ServiceProvider<T>
  lifetime: ServiceLifetime
  instance?: T
}

export class CoreDIContainer implements DIContainer {
  private services = new Map<string | symbol, ServiceRegistration>()
  private parent?: DIContainer

  constructor(parent?: DIContainer) {
    this.parent = parent
  }

  /**
   * 注册服务
   */
  register<T = any>(
    token: string | symbol,
    provider: ServiceProvider<T>,
    lifetime: ServiceLifetime = 'transient'
  ): void {
    this.services.set(token, {
      provider,
      lifetime,
    })
  }

  /**
   * 解析服务
   */
  resolve<T = any>(token: string | symbol): T {
    const registration = this.services.get(token)

    if (!registration) {
      // 尝试从父容器解析
      if (this.parent) {
        return this.parent.resolve<T>(token)
      }
      throw new Error(`Service "${String(token)}" not registered`)
    }

    // 单例模式：返回已存在的实例
    if (registration.lifetime === 'singleton' && registration.instance) {
      return registration.instance as T
    }

    // 创建实例
    const instance = this.createInstance<T>(registration.provider)

    // 保存单例实例
    if (registration.lifetime === 'singleton') {
      registration.instance = instance
    }

    return instance
  }

  /**
   * 检查服务是否已注册
   */
  has(token: string | symbol): boolean {
    return this.services.has(token) || (this.parent?.has(token) ?? false)
  }

  /**
   * 移除服务
   */
  remove(token: string | symbol): boolean {
    return this.services.delete(token)
  }

  /**
   * 清空容器
   */
  clear(): void {
    this.services.clear()
  }

  /**
   * 创建子容器
   */
  createScope(): DIContainer {
    return new CoreDIContainer(this)
  }

  /**
   * 创建实例
   */
  private createInstance<T>(provider: ServiceProvider<T>): T {
    // 如果是构造函数
    if (this.isConstructor(provider)) {
      return new provider()
    }

    // 如果是工厂函数
    if (typeof provider === 'function') {
      return (provider as ServiceFactory<T>)(this)
    }

    // 如果是实例
    return provider as T
  }

  /**
   * 检查是否是构造函数
   */
  private isConstructor(fn: any): fn is ServiceConstructor {
    return typeof fn === 'function' && fn.prototype && fn.prototype.constructor === fn
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   */
  async destroy(): Promise<void> {
    this.services.clear()
  }
}

/**
 * 创建依赖注入容器
 */
export function createDIContainer(parent?: DIContainer): DIContainer {
  return new CoreDIContainer(parent)
}

