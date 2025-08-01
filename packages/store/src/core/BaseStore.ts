import type { Store, StoreDefinition } from 'pinia'
import type {
  ActionDefinition,
  DecoratorMetadata,
  GetterDefinition,
  BaseStore as IBaseStore,
  StateDefinition,
  StoreOptions,
} from '@/types'
import { defineStore } from 'pinia'
import { DECORATOR_METADATA_KEY } from '@/types/decorators'

/**
 * 基础 Store 类
 * 提供类式的 Store 定义方式，支持装饰器
 */
export abstract class BaseStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition,
> implements IBaseStore<TState, TActions, TGetters> {
  /** Store ID */
  public readonly $id: string

  /** Pinia Store 实例 */
  private _store?: Store<string, TState, TGetters, TActions>

  /** Store 定义 */
  private _storeDefinition?: StoreDefinition<string, TState, TGetters, TActions>

  /** 构造阶段标记 */
  public _isConstructing = true

  /** 初始状态 */
  private _initialState?: TState

  constructor(id: string, options?: Partial<StoreOptions<TState, TActions, TGetters>>) {
    this.$id = id
    this._initializeStore(options)
    this._isConstructing = false
  }

  /**
   * 获取状态
   */
  get $state(): TState {
    return this._store?.$state as TState || {} as TState
  }

  /**
   * 获取 Actions
   */
  get $actions(): TActions {
    const actions = {} as TActions
    const metadata = this._getDecoratorMetadata()

    metadata
      .filter(meta => meta.type === 'action')
      .forEach((meta) => {
        const method = (this as any)[meta.key]
        if (typeof method === 'function') {
          actions[meta.key as keyof TActions] = method.bind(this) as any
        }
      })

    return actions
  }

  /**
   * 获取 Getters
   */
  get $getters(): TGetters {
    const getters = {} as TGetters
    const metadata = this._getDecoratorMetadata()

    metadata
      .filter(meta => meta.type === 'getter')
      .forEach((meta) => {
        const getter = (this as any)[meta.key]
        if (typeof getter === 'function') {
          getters[meta.key as keyof TGetters] = getter.bind(this) as any
        }
      })

    return getters
  }

  /**
   * 重置状态
   */
  $reset(): void {
    if (this._store && this._initialState) {
      this._store.$patch(this._initialState)
    }
    else {
      this._store?.$reset()
    }
  }

  /**
   * 部分更新状态
   */
  $patch(partialState: Partial<TState>): void {
    this._store?.$patch(partialState as any)
  }

  /**
   * 订阅状态变化
   */
  $subscribe(callback: (mutation: any, state: TState) => void): () => void {
    return this._store?.$subscribe(callback as any) || (() => {})
  }

  /**
   * 订阅 Action
   */
  $onAction(callback: (context: any) => void): () => void {
    return this._store?.$onAction(callback) || (() => {})
  }

  /**
   * 获取 Pinia Store 实例
   */
  getStore(): Store<string, TState, TGetters, TActions> | undefined {
    return this._store
  }

  /**
   * 获取 Store 定义
   */
  getStoreDefinition(): StoreDefinition<string, TState, TGetters, TActions> | undefined {
    return this._storeDefinition
  }

  /**
   * 初始化 Store
   */
  private _initializeStore(options?: Partial<StoreOptions<TState, TActions, TGetters>>): void {
    const metadata = this._getDecoratorMetadata()

    // 构建状态
    const state = this._buildState(metadata, options?.state)

    // 保存初始状态
    this._initialState = state()

    // 构建 Actions
    const actions = this._buildActions(metadata, options?.actions)

    // 构建 Getters
    const getters = this._buildGetters(metadata, options?.getters)

    // 创建 Store 定义
    this._storeDefinition = defineStore(this.$id, {
      state,
      actions,
      getters,
    })

    // 创建 Store 实例
    this._store = this._storeDefinition()
  }

  /**
   * 构建状态
   */
  private _buildState(
    metadata: DecoratorMetadata[],
    customState?: () => TState,
  ): () => TState {
    return () => {
      const state = customState?.() || {} as TState

      // 添加装饰器定义的状态
      metadata
        .filter(meta => meta.type === 'state')
        .forEach((meta) => {
          const value = (this as any)[meta.key]
          if (value !== undefined) {
            (state as any)[meta.key] = value
          }
        })

      return state
    }
  }

  /**
   * 构建 Actions
   */
  private _buildActions(
    metadata: DecoratorMetadata[],
    customActions?: TActions,
  ): TActions {
    const actions = { ...customActions } as TActions

    metadata
      .filter(meta => meta.type === 'action')
      .forEach((meta) => {
        const method = (this as any)[meta.key]
        if (typeof method === 'function') {
          // 绑定 this 上下文并包装方法以支持 $onAction
          const boundMethod = (...args: any[]) => {
            return method.apply(this, args)
          }
          actions[meta.key as keyof TActions] = boundMethod as any
        }
      })

    return actions
  }

  /**
   * 构建 Getters
   */
  private _buildGetters(
    metadata: DecoratorMetadata[],
    customGetters?: TGetters,
  ): TGetters {
    const getters = { ...customGetters } as TGetters

    metadata
      .filter(meta => meta.type === 'getter')
      .forEach((meta) => {
        const getter = (this as any)[meta.key]
        if (typeof getter === 'function') {
          getters[meta.key as keyof TGetters] = getter.bind(this) as any
        }
      })

    return getters
  }

  /**
   * 获取装饰器元数据
   */
  private _getDecoratorMetadata(): DecoratorMetadata[] {
    return Reflect.getMetadata(DECORATOR_METADATA_KEY, this.constructor) || []
  }
}
