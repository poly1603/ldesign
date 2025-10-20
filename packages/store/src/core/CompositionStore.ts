/**
 * Composition API 风格的 Store
 * 提供类似 Vue 3 Composition API 的 Store 定义方式
 */

import type { Store, StoreDefinition } from 'pinia'
import type { ComputedRef, Ref, UnwrapNestedRefs } from 'vue'
import type { CacheOptions, PersistOptions } from '../types'
import { defineStore } from 'pinia'
import { computed, onUnmounted, reactive, ref, watch } from 'vue'
import { PerformanceOptimizer } from './PerformanceOptimizer'

/**
 * Composition Store 上下文
 */
export interface CompositionStoreContext {
  // 状态创建函数
  state: <T>(initialValue: T) => Ref<T>

  // 计算属性创建函数
  computed: <T>(getter: () => T) => ComputedRef<T>

  // 响应式对象创建函数
  reactive: <T extends object>(obj: T) => UnwrapNestedRefs<T>

  // 监听器
  watch: typeof watch

  // 生命周期
  onUnmounted: typeof onUnmounted

  // 缓存方法
  cache: {
    get: (key: string) => any
    set: (key: string, value: any, ttl?: number) => void
    delete: (key: string) => boolean
    clear: () => void
  }

  // 持久化方法
  persist: {
    save: () => void
    load: () => void
    clear: () => void
  }
}

/**
 * Composition Store 设置函数类型
 */
export type CompositionStoreSetup<T = any> = (context: CompositionStoreContext) => T

/**
 * Composition Store 选项
 */
export interface CompositionStoreOptions {
  id: string
  persist?: boolean | PersistOptions
  cache?: CacheOptions
  devtools?: boolean
}

/**
 * Composition Store 实例
 */
export interface CompositionStoreInstance<T = any> {
  readonly $id: string
  readonly $state: T

  // 状态管理方法
  $reset: () => void
  $patch: ((partialState: Partial<T>) => void) & ((mutator: (state: T) => void) => void)

  // 订阅方法
  $subscribe: (callback: (mutation: any, state: T) => void, options?: { detached?: boolean }) => () => void
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
  getStore: () => Store<string, any, any, any>
  getStoreDefinition: () => StoreDefinition<string, any, any, any>
}

/**
 * 创建 Composition Store
 */
export function createCompositionStore<T = any>(
  options: CompositionStoreOptions,
  setup: CompositionStoreSetup<T>
): () => CompositionStoreInstance<T> {
  // 创建性能优化器
  const optimizer = new PerformanceOptimizer({
    cache: options.cache,
    persistence: typeof options.persist === 'object' ? options.persist : undefined,
  })

  // 使用WeakMap存储状态，避免内存泄漏
  const stateCache = new WeakMap<any, { initial: any; current: T }>()
  // 存储初始状态的副本，而不是工厂函数
  let initialStateCopy: any = null

  // 创建 Pinia Store 定义，使用 setup 语法
  const storeDefinition = defineStore(options.id, () => {
    // 存储清理函数，用于组件卸载时清理资源
    const cleanupFunctions: (() => void)[] = []

    // 创建 Composition API 上下文，提供 Vue 3 的响应式 API
    const context: CompositionStoreContext = {
      // 创建响应式状态，使用 ref 包装
      state: <T>(initialValue: T) => ref(initialValue) as Ref<T>,

      // 创建计算属性，使用 computed 包装
      computed: <T>(getter: () => T) => computed(getter),

      // 创建响应式对象，使用 reactive 包装
      reactive: <T extends object>(obj: T) => reactive(obj) as UnwrapNestedRefs<T>,

      // 提供 watch 功能
      watch,

      // 提供生命周期钩子，同时添加到清理函数列表
      onUnmounted: (fn: () => void) => {
        cleanupFunctions.push(fn)
        onUnmounted(fn)
      },

      cache: {
        get: (key: string) => optimizer.cache.get(`${options.id}:${key}`),
        set: (key: string, value: any, ttl?: number) => optimizer.cache.set(`${options.id}:${key}`, value, ttl),
        delete: (key: string) => optimizer.cache.delete(`${options.id}:${key}`),
        clear: () => optimizer.cache.clear(),
      },

      persist: {
        save: () => {
          // 延迟获取 storeState，确保它已经被初始化
          const currentState = storeDefinition().$state
          optimizer.persistence.save(options.id, currentState)
        },
        load: () => {
          const persistedState = optimizer.persistence.load(options.id)
          if (persistedState) {
            const currentState = storeDefinition().$state
            if (typeof currentState === 'object' && currentState !== null) {
              Object.assign(currentState as Record<string, any>, persistedState)
            }
          }
        },
        clear: () => optimizer.persistence.remove(options.id),
      },
    }

    // 执行设置函数
    const storeState = setup(context)

    // 保存初始状态的深拷贝（用于 $reset）
    if (!initialStateCopy && typeof storeState === 'object' && storeState !== null) {
      initialStateCopy = JSON.parse(JSON.stringify(storeState))
    }

    // 使用WeakMap缓存状态
    stateCache.set(storeDefinition, { initial: initialStateCopy, current: storeState })

    // 如果启用持久化，自动恢复状态
    if (options.persist) {
      const persistedState = optimizer.persistence.load(options.id)
      if (persistedState && typeof storeState === 'object' && storeState !== null) {
        Object.assign(storeState as Record<string, any>, persistedState)
      }
    }

    return storeState
  })

  // 返回 Store 工厂函数
  return (): CompositionStoreInstance<T> => {
    const store = storeDefinition()
    const cleanupFunctions: (() => void)[] = []

    const instance: CompositionStoreInstance<T> = {
      $id: options.id,

      get $state() {
        const cached = stateCache.get(storeDefinition)
        return cached?.current || ({} as T)
      },

      $reset() {
        const cached = stateCache.get(storeDefinition)
        if (cached?.initial && typeof cached.initial === 'object') {
          // 深拷贝初始状态来重置
          const resetState = JSON.parse(JSON.stringify(cached.initial))
          Object.assign(store.$state, resetState)
          // 更新缓存的当前状态
          cached.current = resetState
        }
      },

      $patch(partialStateOrMutator: any) {
        const cached = stateCache.get(storeDefinition)
        if (typeof partialStateOrMutator === 'function') {
          ; (store as any).$patch(partialStateOrMutator)
          // 更新缓存状态
          if (cached?.current) {
            partialStateOrMutator(cached.current)
          }
        } else {
          ; (store as any).$patch(partialStateOrMutator)
          // 更新缓存状态
          if (cached?.current && typeof cached.current === 'object') {
            Object.assign(cached.current, partialStateOrMutator)
          }
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
          optimizer.persistence.save(options.id, instance.$state)
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
 * 简化的 Composition Store 创建器
 */
export function defineCompositionStore<T = any>(
  id: string,
  setup: CompositionStoreSetup<T>
): () => CompositionStoreInstance<T> {
  return createCompositionStore({ id }, setup)
}

/**
 * 带配置的 Composition Store 创建器
 */
export function defineCompositionStoreWithOptions<T = any>(
  options: CompositionStoreOptions,
  setup: CompositionStoreSetup<T>
): () => CompositionStoreInstance<T> {
  return createCompositionStore(options, setup)
}
