/**
 * 函数式 Store 创建器
 * 提供函数式的 Store 定义方式
 */

import type { Store, StoreDefinition } from 'pinia'
import type {
  ActionDefinition,
  CacheOptions,
  GetterDefinition,
  PersistOptions,
  StateDefinition,
} from '../types'
import { defineStore as piniaDefineStore } from 'pinia'
import { PerformanceOptimizer } from './PerformanceOptimizer'

/**
 * 函数式 Store 定义选项
 */
export interface FunctionalStoreOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> {
  id: string
  state: () => TState
  actions?: TActions
  getters?: TGetters
  persist?: boolean | PersistOptions
  cache?: CacheOptions
  devtools?: boolean
}

/**
 * 函数式 Store 实例
 */
export interface FunctionalStoreInstance<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
> {
  readonly $id: string
  readonly $state: TState
  readonly $actions: TActions
  readonly $getters: TGetters

  // 状态管理方法
  $reset: () => void
  $patch: ((partialState: Partial<TState>) => void) & ((mutator: (state: TState) => void) => void)

  // 订阅方法
  $subscribe: (callback: (mutation: any, state: TState) => void, options?: { detached?: boolean }) => () => void
  $onAction: (callback: (context: any) => void) => () => void

  // 生命周期方法
  $dispose: () => void

  // 性能优化方法
  $persist: () => void
  $hydrate: () => void
  $clearPersisted: () => void
  $getCache: (key: string) => any
  $setCache: (key: string, value: any, ttl?: number) => void
  $deleteCache: (key: string) => boolean
  $clearCache: () => void

  // 工具方法
  getStore: () => Store<string, TState, TGetters, TActions>
  getStoreDefinition: () => StoreDefinition<string, TState, TGetters, TActions>
}

/**
 * 创建函数式 Store
 */
export function createFunctionalStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
>(
  options: FunctionalStoreOptions<TState, TActions, TGetters>
): () => FunctionalStoreInstance<TState, TActions, TGetters> {
  // 创建性能优化器实例，用于缓存和持久化功能
  const optimizer = new PerformanceOptimizer({
    cache: options.cache, // 缓存配置选项
    // 处理持久化配置，确保类型正确
    persistence: typeof options.persist === 'object' ? options.persist : undefined,
  })

  // 创建 Pinia Store 定义，这是 Pinia 的标准方式
  const storeDefinition = piniaDefineStore(options.id, {
    state: options.state,
    actions: options.actions || ({} as TActions),
    getters: options.getters || ({} as TGetters),
  })

  // 返回 Store 工厂函数
  return (): FunctionalStoreInstance<TState, TActions, TGetters> => {
    const store = storeDefinition()
    const cleanupFunctions: (() => void)[] = []

    // 如果启用持久化，自动恢复状态
    if (options.persist) {
      const persistedState = optimizer.persistence.load(options.id)
      if (persistedState) {
        ; (store as any).$patch(persistedState)
      }
    }

    const instance: FunctionalStoreInstance<TState, TActions, TGetters> = {
      $id: options.id,

      get $state() {
        return store.$state as TState
      },

      get $actions() {
        return options.actions || ({} as TActions)
      },

      get $getters() {
        return options.getters || ({} as TGetters)
      },

      $reset() {
        store.$reset()
      },

      $patch(partialStateOrMutator: Partial<TState> | ((state: TState) => void)) {
        if (typeof partialStateOrMutator === 'function') {
          ; (store as any).$patch(partialStateOrMutator)
        } else {
          ; (store as any).$patch(partialStateOrMutator)
        }
      },

      $subscribe(callback, subscribeOptions) {
        const unsubscribe = store.$subscribe(callback as any, subscribeOptions)

        if (!subscribeOptions?.detached) {
          cleanupFunctions.push(unsubscribe)
        }

        return unsubscribe
      },

      $onAction(callback) {
        const unsubscribe = store.$onAction(callback as any)
        cleanupFunctions.push(unsubscribe)
        return unsubscribe
      },

      $dispose() {
        // 执行所有清理函数
        cleanupFunctions.forEach(cleanup => cleanup())
        cleanupFunctions.length = 0

        // 清理性能优化器
        optimizer.dispose()
      },

      $persist() {
        if (options.persist) {
          optimizer.persistence.save(options.id, store.$state)
        }
      },

      $hydrate() {
        if (options.persist) {
          const persistedState = optimizer.persistence.load(options.id)
          if (persistedState) {
            ; (store as any).$patch(persistedState)
          }
        }
      },

      $clearPersisted() {
        optimizer.persistence.remove(options.id)
      },

      $getCache(key: string) {
        return optimizer.cache.get(`${options.id}:${key}`)
      },

      $setCache(key: string, value: any, ttl?: number) {
        optimizer.cache.set(`${options.id}:${key}`, value, ttl)
      },

      $deleteCache(key: string) {
        return optimizer.cache.delete(`${options.id}:${key}`)
      },

      $clearCache() {
        optimizer.cache.clear()
      },

      getStore() {
        return store
      },

      getStoreDefinition() {
        return storeDefinition
      },
    }

    return instance
  }
}

/**
 * 简化的函数式 Store 创建器
 */
export function defineStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
>(
  id: string,
  state: () => TState,
  actions?: TActions,
  getters?: TGetters
): () => FunctionalStoreInstance<TState, TActions, TGetters> {
  return createFunctionalStore({
    id,
    state,
    actions,
    getters,
  })
}

/**
 * 带配置的函数式 Store 创建器
 */
export function defineStoreWithOptions<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
>(
  options: FunctionalStoreOptions<TState, TActions, TGetters>
): () => FunctionalStoreInstance<TState, TActions, TGetters> {
  return createFunctionalStore(options)
}
