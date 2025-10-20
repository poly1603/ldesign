import type { Store, StoreDefinition } from 'pinia'
import type {
  ActionContext,
  ActionDefinition,
  DecoratorMetadata,
  GetterDefinition,
  IBaseStore,
  MutationCallback,
  StateDefinition,
  StoreOptions,
} from '../types'
import { defineStore } from 'pinia'
import { DECORATOR_METADATA_KEY } from '../types/decorators'
import { PerformanceOptimizer } from './PerformanceOptimizer'

/**
 * 基础 Store 类
 *
 * 提供类式的 Store 定义方式，支持装饰器和类型安全的状态管理。
 * 是所有类式 Store 的基类，集成了状态管理、动作执行、计算属性、
 * 缓存、持久化等功能。
 *
 * @template TState - 状态定义类型，必须继承自 StateDefinition
 * @template TActions - 动作定义类型，必须继承自 ActionDefinition
 * @template TGetters - 计算属性定义类型，必须继承自 GetterDefinition
 *
 * @example
 * ```typescript
 * class UserStore extends BaseStore<
 *   () => { name: string; age: number },
 *   { setName: (name: string) => void },
 *   { displayName: (state: any) => string }
 * > {
 *   constructor() {
 *     super('user', {
 *       state: () => ({ name: '', age: 0 }),
 *       actions: {
 *         setName(name: string) {
 *           this.name = name
 *         }
 *       },
 *       getters: {
 *         displayName: (state) => `User: ${state.name}`
 *       }
 *     })
 *   }
 * }
 * ```
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

  /** 静态元数据缓存（类级别共享，减少内存占用） */
  private static _metadataCache = new WeakMap<new (...args: any[]) => any, DecoratorMetadata[]>()

  /** 缓存的 actions 对象 */
  private _cachedActions?: TActions
  /** actions 缓存版本号，用于失效缓存 */
  private _actionsCacheVersion = 0

  /** 缓存的 getters 对象 */
  private _cachedGetters?: TGetters
  /** getters 缓存版本号，用于失效缓存 */
  private _gettersCacheVersion = 0

  /** 清理函数列表 */
  private _cleanupFunctions: (() => void)[] = []

  /** 性能优化器 */
  private _optimizer: PerformanceOptimizer

  /**
   * 创建 BaseStore 实例
   *
   * @param id - Store 的唯一标识符，用于在 Pinia 中注册
   * @param options - Store 配置选项，包含状态、动作、计算属性等定义
   * @param options.state - 状态初始化函数
   * @param options.actions - 动作方法定义对象
   * @param options.getters - 计算属性定义对象
   * @param options.cache - 缓存配置选项
   * @param options.persist - 持久化配置选项
   *
   * @example
   * ```typescript
   * constructor() {
   *   super('user-store', {
   *     state: () => ({ name: '', age: 0 }),
   *     actions: {
   *       setName(name: string) { this.name = name }
   *     },
   *     getters: {
   *       displayName: (state) => `User: ${state.name}`
   *     }
   *   })
   * }
   * ```
   */
  constructor(
    id: string,
    options?: Partial<StoreOptions<TState, TActions, TGetters>>,
  ) {
    // 设置 Store 的唯一标识符
    this.$id = id

    // 创建性能优化器实例，用于缓存和持久化功能
    this._optimizer = new PerformanceOptimizer({
      cache: options?.cache, // 缓存配置选项
      // 处理持久化配置，确保类型正确
      persistence: typeof options?.persist === 'object' ? options.persist : undefined,
    })

    // 初始化 Store，创建 Pinia store 实例并设置状态、动作、计算属性
    this._initializeStore(options)

    // 标记构造阶段完成，允许装饰器正常工作
    this._isConstructing = false
  }

  /**
   * 获取当前 Store 的状态对象
   *
   * 返回响应式的状态对象，可以直接读取和修改状态值。
   * 状态的修改会自动触发相关的响应式更新。
   *
   * @returns 当前 Store 的状态对象
   *
   * @example
   * ```typescript
   * const userStore = new UserStore()
   *  // 读取状态
   * userStore.$state.name = 'John'      // 修改状态
   * ```
   */
  get $state(): TState {
    return (this._store?.$state as TState) || ({} as TState)
  }

  /**
   * 获取当前 Store 的所有动作方法
   *
   * 返回包含所有动作方法的对象，这些方法已经绑定了正确的上下文。
   * 动作方法用于修改状态，支持同步和异步操作。
   * 使用缓存避免重复构建对象。
   *
   * @returns 包含所有动作方法的对象
   *
   * @example
   * ```typescript
   * const userStore = new UserStore()
   * userStore.$actions.setName('John')  // 调用动作方法
   * ```
   */
  get $actions(): TActions {
    // 使用带版本控制的缓存
    const currentVersion = this._actionsCacheVersion
    if (this._cachedActions && currentVersion > 0) {
      return this._cachedActions
    }

    const actions = {} as TActions
    const metadata = this._getDecoratorMetadata()

    metadata
      .filter(meta => meta.type === 'action')
      .forEach((meta) => {
        const method = (this as any)[meta.key]
        if (typeof method === 'function') {
          // 使用WeakMap存储绑定的方法，避免重复创建
          actions[meta.key as keyof TActions] = method.bind(this) as any
        }
      })

    // 缓存结果并更新版本
    this._cachedActions = actions
    this._actionsCacheVersion = currentVersion + 1
    return actions
  }

  /**
   * 获取当前 Store 的所有计算属性
   *
   * 返回包含所有计算属性的对象，这些属性会根据状态的变化自动重新计算。
   * 计算属性是只读的，用于派生状态值。
   * 使用缓存避免重复构建对象。
   *
   * @returns 包含所有计算属性的对象
   *
   * @example
   * ```typescript
   * const userStore = new UserStore()
   *  // 获取计算属性值
   * ```
   */
  get $getters(): TGetters {
    // 使用带版本控制的缓存
    const currentVersion = this._gettersCacheVersion
    if (this._cachedGetters && currentVersion > 0) {
      return this._cachedGetters
    }

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

    // 缓存结果并更新版本
    this._cachedGetters = getters
    this._gettersCacheVersion = currentVersion + 1
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
   *
   * 支持两种更新方式：
   * 1. 传入部分状态对象，会与当前状态合并
   * 2. 传入修改函数，可以直接修改状态
   *
   * @param partialState - 部分状态对象，会与当前状态合并
   * @param mutator - 状态修改函数，接收当前状态作为参数
   *
   * @example
   * ```typescript
   * // 方式1：传入部分状态对象
   * userStore.$patch({ name: 'John' })
   *
   * // 方式2：传入修改函数
   * userStore.$patch((state) => {
   *   state.name = 'John'
   *   state.age = 25
   * })
   * ```
   */
  $patch(partialState: Partial<TState>): void
  $patch(mutator: (state: TState) => void): void
  $patch(partialStateOrMutator: Partial<TState> | ((state: TState) => void)): void {
    // 如果 Store 未初始化，直接返回
    if (!this._store) return

    // 判断传入的参数类型，支持两种更新方式
    if (typeof partialStateOrMutator === 'function') {
      // 函数形式的 $patch：直接传递修改函数给 Pinia
      // 使用 any 类型断言避免 TypeScript 复杂类型推导问题
      ; (this._store as any).$patch(partialStateOrMutator)
    } else {
      // 对象形式的 $patch：将部分状态对象合并到当前状态
      ; (this._store as any).$patch((state: any) => {
        // 使用 Object.assign 将新的状态属性合并到现有状态中
        Object.assign(state, partialStateOrMutator)
      })
    }
  }

  /**
   * 订阅状态变化
   */
  $subscribe(
    callback: MutationCallback<TState>,
    options?: { detached?: boolean }
  ): () => void {
    if (!this._store) {
      return () => { }
    }

    const unsubscribe = this._store.$subscribe(callback as any, options)

    // 如果不是分离模式，添加到清理函数列表
    if (!options?.detached) {
      this._addCleanup(unsubscribe)
    }

    return unsubscribe
  }

  /**
   * 订阅 Action
   */
  $onAction(callback: (context: ActionContext<TState, TActions>) => void): () => void {
    if (!this._store) {
      return () => { }
    }

    const unsubscribe = this._store.$onAction(callback as any)
    this._addCleanup(unsubscribe)
    return unsubscribe
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
  getStoreDefinition():
    | StoreDefinition<string, TState, TGetters, TActions>
    | undefined {
    return this._storeDefinition
  }

  /**
   * 销毁 Store，清理资源
   */
  $dispose(): void {
    // 执行所有清理函数
    this._cleanupFunctions.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.error('Cleanup function error:', error)
      }
    })
    this._cleanupFunctions.length = 0

    // 清理性能优化器
    this._optimizer.dispose()

    // 清理实例级缓存（元数据缓存是类级别的，不需要清理）
    this._cachedActions = undefined
    this._cachedGetters = undefined
    this._actionsCacheVersion = 0
    this._gettersCacheVersion = 0
    this._initialState = undefined

    // 清理 Pinia Store
    this._store = undefined
    this._storeDefinition = undefined
  }

  /**
   * 持久化状态到存储
   */
  $persist(): void {
    if (this._store) {
      this._optimizer.persistence.save(this.$id, this._store.$state)
    }
  }

  /**
   * 从存储恢复状态
   */
  $hydrate(): void {
    const persistedState = this._optimizer.persistence.load(this.$id)
    if (persistedState && this._store) {
      ; (this._store as any).$patch(persistedState)
    }
  }

  /**
   * 清除持久化状态
   */
  $clearPersisted(): void {
    this._optimizer.persistence.remove(this.$id)
  }

  /**
   * 获取缓存值
   */
  $getCache(key: string): any {
    return this._optimizer.cache.get(`${this.$id}:${key}`)
  }

  /**
   * 设置缓存值
   */
  $setCache(key: string, value: any, ttl?: number): void {
    this._optimizer.cache.set(`${this.$id}:${key}`, value, ttl)
  }

  /**
   * 删除缓存值
   */
  $deleteCache(key: string): boolean {
    return this._optimizer.cache.delete(`${this.$id}:${key}`)
  }

  /**
   * 清空所有缓存
   */
  $clearCache(): void {
    this._optimizer.cache.clear()
  }

  /**
   * 添加清理函数
   */
  protected _addCleanup(cleanup: () => void): void {
    this._cleanupFunctions.push(cleanup)
  }

  /**
   * 初始化 Store
   */
  private _initializeStore(
    options?: Partial<StoreOptions<TState, TActions, TGetters>>,
  ): void {
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
      const state = customState?.() || ({} as TState)

      // 添加装饰器定义的状态
      metadata
        .filter(meta => meta.type === 'state')
        .forEach((meta) => {
          const value = (this as any)[meta.key]
          if (value !== undefined) {
            ; (state as any)[meta.key] = value
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
   * 获取装饰器元数据（类级别缓存）
   * 使用 WeakMap 在所有实例间共享元数据，减少内存占用
   */
  private _getDecoratorMetadata(): DecoratorMetadata[] {
    const ctor = this.constructor as new (...args: any[]) => any

    // 检查类级别缓存
    if (!BaseStore._metadataCache.has(ctor)) {
      const metadata = Reflect.getMetadata(DECORATOR_METADATA_KEY, ctor) || []
      BaseStore._metadataCache.set(ctor, metadata)
    }

    return BaseStore._metadataCache.get(ctor)!
  }
}
