/**
 * 统一的 Store 工厂
 * 提供多种 Store 创建方式的统一入口
 */

import type {
  ActionDefinition,
  GetterDefinition,
  StateDefinition,
  StoreOptions,
} from '../types'
import type { Constructor } from '../types/decorators'
import type { BaseStore } from './BaseStore'
import { type CompositionStoreInstance, type CompositionStoreOptions, type CompositionStoreSetup, createCompositionStore } from './CompositionStore'
import { createFunctionalStore, type FunctionalStoreInstance, type FunctionalStoreOptions } from './FunctionalStore'

/**
 * Store 创建方式枚举
 */
export enum StoreType {
  CLASS = 'class',
  FUNCTIONAL = 'functional',
  COMPOSITION = 'composition',
}

/**
 * 类式 Store 选项
 */
export interface ClassStoreOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> extends Partial<StoreOptions<TState, TActions, TGetters>> {
  type: StoreType.CLASS
  storeClass: Constructor<BaseStore<TState, TActions, TGetters>>
}

/**
 * 函数式 Store 选项
 */
export interface FunctionalStoreFactoryOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> extends FunctionalStoreOptions<TState, TActions, TGetters> {
  type: StoreType.FUNCTIONAL
}

/**
 * Composition Store 选项
 */
export interface CompositionStoreFactoryOptions<T = any> extends CompositionStoreOptions {
  type: StoreType.COMPOSITION
  setup: CompositionStoreSetup<T>
}

/**
 * 统一的 Store 选项类型
 */
export type UnifiedStoreOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
  T = any
> =
  | ClassStoreOptions<TState, TActions, TGetters>
  | FunctionalStoreFactoryOptions<TState, TActions, TGetters>
  | CompositionStoreFactoryOptions<T>

/**
 * Store 工厂类
 *
 * 统一管理不同类型的 Store 创建，支持类式、函数式、组合式等多种 Store 类型。
 * 提供统一的创建接口、实例管理和类型安全保障。
 *
 * @example
 * ```typescript
 * // 创建函数式 Store
 * const store = StoreFactory.create({
 *   type: StoreType.FUNCTIONAL,
 *   id: 'user-store',
 *   state: () => ({ name: '', age: 0 }),
 *   actions: {
 *     setName(name: string) { this.name = name }
 *   }
 * })
 * ```
 */
export class StoreFactory {
  private static instances = new Map<string, any>()
  private static definitions = new Map<string, any>()

  /**
   * 创建 Store 实例（用于兼容）
   */
  createStore<
    TState extends StateDefinition = StateDefinition,
    TActions extends ActionDefinition = ActionDefinition,
    TGetters extends GetterDefinition = GetterDefinition,
    T = any
  >(
    options: UnifiedStoreOptions<TState, TActions, TGetters, T>
  ): any {
    return StoreFactory.create(options)
  }

  /**
   * 创建 Store 实例
   *
   * 根据配置选项创建不同类型的 Store，支持类式、函数式、组合式三种类型。
   * 自动管理 Store 实例，避免重复创建。
   *
   * @template TState - 状态定义类型
   * @template TActions - 动作定义类型
   * @template TGetters - 计算属性定义类型
   * @template T - 返回类型
   *
   * @param options - 统一的 Store 配置选项
   * @param options.type - Store 类型（class/functional/composition）
   * @param options.id - Store 唯一标识符
   * @param options.state - 状态初始化函数
   * @param options.actions - 动作方法定义
   * @param options.getters - 计算属性定义
   *
   * @returns 创建的 Store 实例
   *
   * @throws {Error} 当 Store 类型未知时抛出错误
   *
   * @example
   * ```typescript
   * const userStore = StoreFactory.create({
   *   type: StoreType.FUNCTIONAL,
   *   id: 'user-store',
   *   state: () => ({ name: '', age: 0 }),
   *   actions: {
   *     setName(name: string) { this.name = name }
   *   }
   * })
   * ```
   */
  static create<
    TState extends StateDefinition = StateDefinition,
    TActions extends ActionDefinition = ActionDefinition,
    TGetters extends GetterDefinition = GetterDefinition,
    T = any
  >(
    options: UnifiedStoreOptions<TState, TActions, TGetters, T>
  ): any {
    // 从配置选项中提取 Store ID
    const id = (options as any).id

    // 验证 ID 是否存在，ID 是必需的
    if (!id) {
      throw new Error('Store id is required')
    }

    // 检查是否已经创建过相同 ID 的 Store，避免重复创建
    if (this.definitions.has(id)) {
      console.warn(`Store with id "${id}" already exists. Returning existing definition.`)
      return this.definitions.get(id)
    }

    // 声明 Store 定义变量，将根据类型创建不同的实现
    let storeDefinition: any

    // 根据 Store 类型创建相应的实现
    switch (options.type) {
      case StoreType.CLASS: {
        const classOptions = options as ClassStoreOptions<TState, TActions, TGetters>
        storeDefinition = () => {
          if (!this.instances.has(id)) {
            const StoreClass = classOptions.storeClass
            this.instances.set(id, new StoreClass(id, classOptions))
          }
          return this.instances.get(id)
        }
        break
      }

      case StoreType.FUNCTIONAL: {
        const functionalOptions = options as FunctionalStoreFactoryOptions<TState, TActions, TGetters>
        storeDefinition = createFunctionalStore(functionalOptions)
        break
      }

      case StoreType.COMPOSITION: {
        const compositionOptions = options as CompositionStoreFactoryOptions<T>
        storeDefinition = createCompositionStore(compositionOptions, compositionOptions.setup)
        break
      }

      default:
        throw new Error(`Unknown store type: ${(options as any).type}`)
    }

    this.definitions.set(id, storeDefinition)
    return storeDefinition
  }

  /**
   * 获取已创建的 Store 定义
   */
  static get(id: string): any {
    return this.definitions.get(id)
  }

  /**
   * 检查 Store 是否存在
   */
  static has(id: string): boolean {
    return this.definitions.has(id)
  }

  /**
   * 删除 Store
   */
  static delete(id: string): boolean {
    const instance = this.instances.get(id)
    if (instance && typeof instance.$dispose === 'function') {
      instance.$dispose()
    }

    this.instances.delete(id)
    return this.definitions.delete(id)
  }

  /**
   * 清空所有 Store
   */
  static clear(): void {
    // 清理所有实例
    for (const instance of this.instances.values()) {
      if (instance && typeof instance.$dispose === 'function') {
        instance.$dispose()
      }
    }

    this.instances.clear()
    this.definitions.clear()
  }

  /**
   * 获取所有 Store ID
   */
  static getIds(): string[] {
    return Array.from(this.definitions.keys())
  }

  /**
   * 获取 Store 统计信息
   */
  static getStats(): {
    totalStores: number
    activeInstances: number
    storeIds: string[]
  } {
    return {
      totalStores: this.definitions.size,
      activeInstances: this.instances.size,
      storeIds: this.getIds(),
    }
  }
}

/**
 * 便捷的 Store 创建函数
 */

/**
 * 创建类式 Store
 */
export function createClassStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
>(
  id: string,
  storeClass: Constructor<BaseStore<TState, TActions, TGetters>>,
  options?: Partial<StoreOptions<TState, TActions, TGetters>>
): () => BaseStore<TState, TActions, TGetters> {
  return StoreFactory.create({
    type: StoreType.CLASS,
    id,
    storeClass,
    ...options,
  })
}

/**
 * 创建函数式 Store
 */
export function createStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
>(
  options: FunctionalStoreOptions<TState, TActions, TGetters>
): () => FunctionalStoreInstance<TState, TActions, TGetters> {
  return StoreFactory.create({
    type: StoreType.FUNCTIONAL,
    ...options,
  })
}

/**
 * 创建 Composition Store
 */
export function createCompositionStoreFactory<T = any>(
  id: string,
  setup: CompositionStoreSetup<T>,
  options?: Omit<CompositionStoreOptions, 'id'>
): () => CompositionStoreInstance<T> {
  return StoreFactory.create({
    type: StoreType.COMPOSITION,
    id,
    setup,
    ...options,
  })
}

/**
 * 通用的 Store 创建函数
 */
export function defineStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
  T = any
>(
  options: UnifiedStoreOptions<TState, TActions, TGetters, T>
): any {
  return StoreFactory.create(options)
}

// 导出工厂实例
export { StoreFactory as factory }
