/**
 * 依赖注入类型定义
 */

/**
 * 服务生命周期
 */
export type ServiceLifetime = 'singleton' | 'transient' | 'scoped'

/**
 * 服务构造函数
 */
export type ServiceConstructor<T = any> = new (...args: any[]) => T

/**
 * 服务工厂函数
 */
export type ServiceFactory<T = any> = (container: DIContainer) => T

/**
 * 服务提供者
 */
export type ServiceProvider<T = any> = ServiceConstructor<T> | ServiceFactory<T> | T

/**
 * 依赖注入容器接口
 */
export interface DIContainer {
  /** 注册服务 */
  register<T = any>(
    token: string | symbol,
    provider: ServiceProvider<T>,
    lifetime?: ServiceLifetime
  ): void

  /** 解析服务 */
  resolve<T = any>(token: string | symbol): T

  /** 检查服务是否已注册 */
  has(token: string | symbol): boolean

  /** 移除服务 */
  remove(token: string | symbol): boolean

  /** 清空容器 */
  clear(): void

  /** 创建子容器 */
  createScope(): DIContainer

  /** 初始化和销毁 */
  init?(): Promise<void>
  destroy?(): Promise<void>
}

