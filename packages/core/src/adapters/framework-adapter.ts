/**
 * 框架适配器接口定义
 * 
 * 提供统一的框架集成抽象层,使不同框架能够以一致的方式集成引擎核心功能
 * 
 * @module adapters/framework-adapter
 */

import type { CoreEngine } from '../types/engine'

/**
 * 框架信息
 */
export interface FrameworkInfo {
  /** 框架名称 */
  readonly name: 'react' | 'vue' | 'svelte' | 'solid' | 'angular' | string
  /** 框架版本 */
  readonly version: string
  /** 框架特性标识 */
  readonly features?: {
    /** 是否支持响应式系统 */
    reactive?: boolean
    /** 是否支持组件系统 */
    components?: boolean
    /** 是否支持指令系统 */
    directives?: boolean
    /** 是否支持插槽/children */
    slots?: boolean
  }
}

/**
 * 生命周期钩子映射
 * 
 * 将引擎的生命周期钩子映射到框架特定的钩子
 */
export interface LifecycleHookMap {
  /** 挂载前 */
  beforeMount?: string
  /** 已挂载 */
  mounted?: string
  /** 更新前 */
  beforeUpdate?: string
  /** 已更新 */
  updated?: string
  /** 卸载前 */
  beforeUnmount?: string
  /** 已卸载 */
  unmounted?: string
}

/**
 * 取消订阅函数
 */
export type Unsubscribe = () => void

/**
 * 响应式状态接口
 * 
 * 提供框架无关的响应式状态抽象
 */
export interface ReactiveState<T> {
  /** 当前值 */
  value: T
  /** 获取只读值 */
  readonly(): Readonly<T>
  /** 更新值 */
  update(updater: (prev: T) => T): void
  /** 重置为初始值 */
  reset?(): void
}

/**
 * 状态适配器接口
 * 
 * 连接引擎状态管理器和框架响应式系统
 */
export interface StateAdapter {
  /**
   * 创建响应式状态
   * 
   * @param initialValue - 初始值
   * @returns 响应式状态对象
   * 
   * @example
   * ```typescript
   * const state = adapter.createReactiveState({ count: 0 })
   * state.value.count++ // 触发响应式更新
   * ```
   */
  createReactiveState<T>(initialValue: T): ReactiveState<T>

  /**
   * 监听状态变化
   * 
   * @param getter - 获取状态的函数
   * @param callback - 状态变化时的回调
   * @returns 取消监听的函数
   * 
   * @example
   * ```typescript
   * const unwatch = adapter.watch(
   *   () => state.value.count,
   *   (newValue) => console.log('count changed:', newValue)
   * )
   * ```
   */
  watch<T>(getter: () => T, callback: (value: T, oldValue?: T) => void): Unsubscribe

  /**
   * 批量更新状态
   * 
   * 在批量更新期间,多次状态变化只触发一次响应式更新
   * 
   * @param fn - 批量更新函数
   * 
   * @example
   * ```typescript
   * adapter.batch(() => {
   *   state.value.count++
   *   state.value.name = 'new'
   * }) // 只触发一次更新
   * ```
   */
  batch(fn: () => void): void

  /**
   * 计算属性(可选)
   * 
   * @param getter - 计算函数
   * @returns 计算属性
   */
  computed?<T>(getter: () => T): ReactiveState<T>
}

/**
 * 事件处理器
 */
export type EventHandler<T = any> = (payload: T) => void | Promise<void>

/**
 * 事件适配器接口
 * 
 * 提供框架特定的事件系统集成
 */
export interface EventAdapter {
  /**
   * 发射事件
   * 
   * @param event - 事件名称
   * @param payload - 事件数据
   */
  emit(event: string, payload?: any): void

  /**
   * 监听事件
   * 
   * @param event - 事件名称
   * @param handler - 事件处理器
   * @returns 取消监听的函数
   */
  on(event: string, handler: EventHandler): Unsubscribe

  /**
   * 一次性监听事件
   * 
   * @param event - 事件名称
   * @param handler - 事件处理器
   * @returns 取消监听的函数
   */
  once(event: string, handler: EventHandler): Unsubscribe

  /**
   * 取消监听事件
   * 
   * @param event - 事件名称
   * @param handler - 事件处理器(可选,不传则取消所有)
   */
  off(event: string, handler?: EventHandler): void
}

/**
 * 框架适配器接口
 * 
 * 定义框架集成的标准接口,所有框架适配器必须实现此接口
 * 
 * @template TApp - 应用实例类型
 * @template TComponent - 组件类型
 * @template TElement - DOM元素类型
 */
export interface FrameworkAdapter<
  TApp = any,
  TComponent = any,
  TElement = Element
> {
  /** 框架信息 */
  readonly info: FrameworkInfo

  /**
   * 创建应用实例
   * 
   * @param rootComponent - 根组件
   * @param options - 创建选项
   * @returns 应用实例
   */
  createApp(rootComponent: TComponent, options?: any): TApp

  /**
   * 挂载应用
   * 
   * @param app - 应用实例
   * @param mountElement - 挂载元素(选择器或DOM元素)
   * @returns Promise
   */
  mount(app: TApp, mountElement: string | TElement): Promise<void>

  /**
   * 卸载应用
   * 
   * @param app - 应用实例
   * @returns Promise
   */
  unmount(app: TApp): Promise<void>

  /**
   * 注册引擎到应用
   * 
   * 将引擎实例注入到框架的依赖注入系统中
   * 
   * @param app - 应用实例
   * @param engine - 引擎实例
   */
  registerEngine(app: TApp, engine: CoreEngine): void

  /**
   * 创建状态适配器
   * 
   * @returns 状态适配器实例
   */
  createStateAdapter(): StateAdapter

  /**
   * 创建事件适配器
   * 
   * @returns 事件适配器实例
   */
  createEventAdapter(): EventAdapter

  /**
   * 映射生命周期钩子
   * 
   * @returns 生命周期钩子映射
   */
  mapLifecycleHooks(): LifecycleHookMap

  /**
   * 获取应用实例(可选)
   * 
   * @param app - 应用实例
   * @returns 应用实例的内部表示
   */
  getAppInstance?(app: TApp): any

  /**
   * 注册全局组件(可选)
   * 
   * @param app - 应用实例
   * @param name - 组件名称
   * @param component - 组件
   */
  registerComponent?(app: TApp, name: string, component: any): void

  /**
   * 注册全局指令(可选)
   * 
   * @param app - 应用实例
   * @param name - 指令名称
   * @param directive - 指令
   */
  registerDirective?(app: TApp, name: string, directive: any): void

  /**
   * 提供全局属性(可选)
   * 
   * @param app - 应用实例
   * @param key - 属性键
   * @param value - 属性值
   */
  provideGlobalProperty?(app: TApp, key: string, value: any): void
}

/**
 * 框架适配器工厂函数类型
 */
export type FrameworkAdapterFactory<T extends FrameworkAdapter = FrameworkAdapter> = () => T

/**
 * 框架适配器注册表
 */
export class FrameworkAdapterRegistry {
  private static adapters = new Map<string, FrameworkAdapterFactory>()

  /**
   * 注册框架适配器
   * 
   * @param name - 框架名称
   * @param factory - 适配器工厂函数
   */
  static register(name: string, factory: FrameworkAdapterFactory): void {
    this.adapters.set(name.toLowerCase(), factory)
  }

  /**
   * 获取框架适配器
   * 
   * @param name - 框架名称
   * @returns 适配器实例
   */
  static get(name: string): FrameworkAdapter | undefined {
    const factory = this.adapters.get(name.toLowerCase())
    return factory ? factory() : undefined
  }

  /**
   * 检查框架是否已注册
   * 
   * @param name - 框架名称
   * @returns 是否已注册
   */
  static has(name: string): boolean {
    return this.adapters.has(name.toLowerCase())
  }

  /**
   * 获取所有已注册的框架
   * 
   * @returns 框架名称列表
   */
  static getAll(): string[] {
    return Array.from(this.adapters.keys())
  }
}

