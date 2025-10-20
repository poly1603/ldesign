/**
 * 简化的Store API
 * 提供更直观的使用方式、自动类型推导、链式调用等功能
 */

import type { StoreDefinition } from 'pinia';
import type { Ref, UnwrapRef } from 'vue'
import { defineStore } from 'pinia';
import { computed, reactive, ref, watch, watchEffect } from 'vue'
import { batchUpdate } from './ReactiveSystem'

/**
 * Store 构建器
 * 支持链式调用的流畅API
 */
export class StoreBuilder<
  Id extends string = string,
  S extends Record<string, any> = Record<string, never>,
  G extends Record<string, any> = Record<string, never>,
  A extends Record<string, any> = Record<string, never>
> {
  private id: Id
  private state: S = {} as S
  private getters: G = {} as G
  private actions: A = {} as A
  private persist: boolean | PersistOptions = false
  private devtools: boolean | DevToolsOptions = true
  private plugins: StorePlugin[] = []

  constructor(id: Id) {
    this.id = id
  }

  /**
   * 添加状态
   */
  useState<K extends string, V>(
    key: K,
    initialValue: V | (() => V)
  ): StoreBuilder<Id, S & Record<K, V>, G, A> {
    const value = typeof initialValue === 'function'
      ? (initialValue as () => V)()
      : initialValue

    ;(this.state as any)[key] = value

    return this as any
  }

  /**
   * 批量添加状态
   */
  useStates<T extends Record<string, any>>(
    states: T | (() => T)
  ): StoreBuilder<Id, S & T, G, A> {
    const stateObj = typeof states === 'function' ? states() : states
    Object.assign(this.state, stateObj)

    return this as any
  }

  /**
   * 添加计算属性
   */
  useComputed<K extends string, V>(
    key: K,
    getter: (state: S & G) => V
  ): StoreBuilder<Id, S, G & Record<K, V>, A> {
    ;(this.getters as any)[key] = getter

    return this as any
  }

  /**
   * 批量添加计算属性
   */
  useComputeds<T extends Record<string, (state: S & G) => any>>(
    getters: T
  ): StoreBuilder<Id, S, G & { [K in keyof T]: ReturnType<T[K]> }, A> {
    Object.assign(this.getters, getters)

    return this as any
  }

  /**
   * 添加方法
   */
  useAction<K extends string, F extends (...args: any[]) => any>(
    key: K,
    action: (this: S & G & A, ...args: Parameters<F>) => ReturnType<F>
  ): StoreBuilder<Id, S, G, A & Record<K, F>> {
    ;(this.actions as any)[key] = action

    return this as any
  }

  /**
   * 批量添加方法
   */
  useActions<T extends Record<string, (...args: any[]) => any>>(
    actions: T
  ): StoreBuilder<Id, S, G, A & T> {
    Object.assign(this.actions, actions)

    return this as any
  }

  /**
   * 启用持久化
   */
  usePersist(options?: boolean | PersistOptions): this {
    this.persist = options ?? true
    return this
  }

  /**
   * 配置开发工具
   */
  useDevtools(options?: boolean | DevToolsOptions): this {
    this.devtools = options ?? true
    return this
  }

  /**
   * 添加插件
   */
  usePlugin(plugin: StorePlugin): this {
    this.plugins.push(plugin)
    return this
  }

  /**
   * 构建Store
   */
  build(): SimpleStore<S, G, A> {
    const store = createSimpleStore(this.id, {
      state: this.state,
      getters: this.getters,
      actions: this.actions,
      persist: this.persist,
      devtools: this.devtools,
      plugins: this.plugins
    })

    return store
  }
}

/**
 * 持久化配置
 */
export interface PersistOptions {
  key?: string
  storage?: Storage
  paths?: string[]
  serializer?: {
    serialize: (value: any) => string
    deserialize: (value: string) => any
  }
}

/**
 * 开发工具配置
 */
export interface DevToolsOptions {
  name?: string
  actions?: boolean
  timeline?: boolean
}

/**
 * Store 插件
 */
export interface StorePlugin {
  name: string
  install: (store: any) => void
}

/**
 * 简化的Store接口
 */
export interface SimpleStore<
  S extends Record<string, any> = Record<string, never>,
  G extends Record<string, any> = Record<string, never>,
  A extends Record<string, any> = Record<string, never>
> {
  // 状态
  state: UnwrapRef<S>

  // 计算属性
  getters: Readonly<G>

  // 方法
  actions: A

  // 工具方法
  $reset: () => void
  $patch: (patch: Partial<S> | ((state: S) => void)) => void
  $subscribe: (callback: (mutation: any, state: S) => void) => () => void
  $onAction: (callback: (action: any) => void) => () => void
  $dispose: () => void

  // 快捷方法
  get: <K extends keyof S>(key: K) => S[K]
  set: <K extends keyof S>(key: K, value: S[K]) => void
  update: <K extends keyof S>(key: K, updater: (value: S[K]) => S[K]) => void
  watch: <T>(source: () => T, callback: (value: T) => void) => () => void
  watchAll: (callback: (state: S) => void) => () => void

  // 批量操作
  batch: (updater: () => void) => void
  transaction: (updater: () => void | Promise<void>) => Promise<void>

  // 状态快照
  snapshot: () => S
  restore: (snapshot: S) => void

  // 导出/导入
  export: () => string
  import: (data: string) => void
}

/**
 * 创建简化的Store
 */
export function createSimpleStore<
  S extends Record<string, any>,
  G extends Record<string, any>,
  A extends Record<string, any>
>(
  id: string,
  options: {
    state: S | (() => S)
    getters?: G
    actions?: A
    persist?: boolean | PersistOptions
    devtools?: boolean | DevToolsOptions
    plugins?: StorePlugin[]
  }
): SimpleStore<S, G, A> {
  // 创建响应式状态
  const state = reactive(
    typeof options.state === 'function' ? options.state() : options.state
  ) as UnwrapRef<S>

  // 初始状态快照（用于重置）
  // 使用 structuredClone 提升性能（如果支持）
  const initialState = typeof structuredClone !== 'undefined'
    ? structuredClone(state)
    : JSON.parse(JSON.stringify(state))

  // 创建计算属性
  const getters: any = {}
  if (options.getters) {
    for (const [key, getter] of Object.entries(options.getters)) {
      getters[key] = computed(() => (getter as any)(state))
    }
  }

  // 创建方法
  const actions: any = {}
  if (options.actions) {
    for (const [key, action] of Object.entries(options.actions)) {
      actions[key] = action.bind({
        ...Object.fromEntries(Object.entries(state as any)),
        ...getters,
        ...actions
      })
    }
  }

  // 订阅管理
  const subscriptions = new Set<(...args: any[]) => any>()
  const actionSubscriptions = new Set<(...args: any[]) => any>()

  // Store 实例
  const store: SimpleStore<S, G, A> = {
    state,
    getters: getters as G,
    actions: actions as A,

    // 重置状态
    $reset() {
      batchUpdate(() => {
        Object.assign(state as any, initialState)
      })
    },

    // 修改状态
    $patch(patch) {
      batchUpdate(() => {
        if (typeof patch === 'function') {
          patch(state as S)
        } else {
          Object.assign(state as any, patch)
        }
      })
    },

    // 订阅状态变化
    $subscribe(callback) {
      subscriptions.add(callback)

      const unwatch = watchEffect(() => {
        callback({ type: 'direct' }, state as S)
      })

      return () => {
        subscriptions.delete(callback)
        unwatch()
      }
    },

    // 订阅动作
    $onAction(callback) {
      actionSubscriptions.add(callback)

      return () => {
        actionSubscriptions.delete(callback)
      }
    },

    // 销毁Store
    $dispose() {
      subscriptions.clear()
      actionSubscriptions.clear()
    },

    // 获取状态值
    get(key) {
      return (state as any)[key as string]
    },

    // 设置状态值
    set(key, value) {
      (state as any)[key as string] = value
    },

    // 更新状态值
    update(key, updater) {
      (state as any)[key as string] = updater((state as any)[key as string])
    },

    // 监听特定值
    watch(source, callback) {
      return watch(source, callback)
    },

    // 监听所有状态
    watchAll(callback) {
      return watch(() => state as any, callback, { deep: true })
    },

    // 批量更新
    batch(updater) {
      batchUpdate(updater)
    },

    // 事务操作
    async transaction(updater) {
      const snapshot = this.snapshot()

      try {
        await updater()
      } catch (error) {
        // 回滚
        this.restore(snapshot)
        throw error
      }
    },

    // 创建快照
    snapshot() {
      return (typeof structuredClone !== 'undefined'
        ? structuredClone(state)
        : JSON.parse(JSON.stringify(state))) as S
    },

    // 恢复快照
    restore(snapshot) {
      batchUpdate(() => {
        Object.assign(state as any, snapshot)
      })
    },

    // 导出状态
    export() {
      return JSON.stringify(state)
    },

    // 导入状态
    import(data) {
      const imported = JSON.parse(data)
      batchUpdate(() => {
        Object.assign(state as any, imported)
      })
    }
  }

  // 应用持久化
  if (options.persist) {
    applyPersistence(store, options.persist === true ? {} : options.persist)
  }

  // 应用开发工具
  if (options.devtools) {
    applyDevtools(store, options.devtools === true ? {} : options.devtools)
  }

  // 应用插件
  if (options.plugins) {
    options.plugins.forEach(plugin => plugin.install(store))
  }

  return store
}

/**
 * 应用持久化
 */
function applyPersistence(store: any, options: PersistOptions): void {
  const key = options.key || 'store'
  const storage = options.storage || localStorage
  const paths = options.paths
  const serializer = options.serializer || {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  }

  // 从存储恢复
  try {
    const saved = storage.getItem(key)
    if (saved) {
      const data = serializer.deserialize(saved)

      if (paths) {
        // 只恢复指定路径
        paths.forEach(path => {
          const keys = path.split('.')
          let target = store.state
          let source = data

          for (let i = 0; i < keys.length - 1; i++) {
            target = target[keys[i]]
            source = source?.[keys[i]]
          }

          if (source && keys.length > 0) {
            target[keys[keys.length - 1]] = source[keys[keys.length - 1]]
          }
        })
      } else {
        // 恢复所有状态
        Object.assign(store.state, data)
      }
    }
  } catch (error) {
    console.error('Failed to restore state:', error)
  }

  // 监听变化并保存（使用防抖避免频繁写入）
  let saveTimeout: ReturnType<typeof setTimeout> | null = null
  const debouncedSave = () => {
    if (saveTimeout) clearTimeout(saveTimeout)

    saveTimeout = setTimeout(() => {
      try {
        let dataToSave = store.state

        if (paths) {
          // 只保存指定路径
          dataToSave = {}
          paths.forEach(path => {
            const keys = path.split('.')
            let source = store.state
            let target: any = dataToSave

            for (let i = 0; i < keys.length - 1; i++) {
              source = source[keys[i]]
              if (!target[keys[i]]) {
                target[keys[i]] = {}
              }
              target = target[keys[i]]
            }

            if (keys.length > 0) {
              target[keys[keys.length - 1]] = source[keys[keys.length - 1]]
            }
          })
        }

        storage.setItem(key, serializer.serialize(dataToSave))
      } catch (error) {
        console.error('Failed to persist state:', error)
      }
    }, 300) // 300ms 防抖延迟
  }

  store.$subscribe(debouncedSave)
}

/**
 * 应用开发工具
 */
function applyDevtools(_store: any, _options: DevToolsOptions): void {
  if (typeof window !== 'undefined' && (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__) {
    // 集成 Vue DevTools
    
  }
}

/**
 * 创建Store（快捷函数）
 */
export function store<Id extends string>(id: Id): StoreBuilder<Id> {
  return new StoreBuilder(id)
}

/**
 * 定义Store（Pinia兼容）
 */
export function defineSimpleStore<Id extends string, S extends Record<string, any>, G, A>(
  id: Id,
  setup: () => { state: S; getters?: G; actions?: A }
): StoreDefinition<Id, S, G, A> {
  return defineStore(id, setup) as any
}

/**
 * 自动类型推导辅助函数
 */
export function inferStoreType<T extends SimpleStore<any, any, any>>(store: T): T {
  return store
}

/**
 * 组合多个Store
 */
export function combineStores<T extends Record<string, SimpleStore<any, any, any>>>(
  stores: T
): CombinedStore<T> {
  const combined = {
    stores,

    // 获取所有状态
    get state() {
      const result: any = {}
      for (const [key, store] of Object.entries(stores)) {
        result[key] = store.state
      }
      return result
    },

    // 重置所有Store
    resetAll() {
      Object.values(stores).forEach(store => store.$reset())
    },

    // 批量操作
    batch(updater: () => void) {
      batchUpdate(updater)
    },

    // 创建快照
    snapshot() {
      const result: any = {}
      for (const [key, store] of Object.entries(stores)) {
        result[key] = store.snapshot()
      }
      return result
    },

    // 恢复快照
    restore(snapshot: any) {
      batchUpdate(() => {
        for (const [key, store] of Object.entries(stores)) {
          if (snapshot[key]) {
            store.restore(snapshot[key])
          }
        }
      })
    }
  }

  return combined as CombinedStore<T>
}

/**
 * 组合Store类型
 */
export interface CombinedStore<T extends Record<string, SimpleStore<any, any, any>>> {
  stores: T
  state: {
    [K in keyof T]: T[K] extends SimpleStore<infer S, any, any> ? S : never
  }
  resetAll: () => void
  batch: (updater: () => void) => void
  snapshot: () => any
  restore: (snapshot: any) => void
}

/**
 * 创建异步Store
 */
export function createAsyncStore<T>(
  id: string,
  loader: () => Promise<T>
): AsyncStore<T> {
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const data = ref<T | null>(null)

  const load = async () => {
    loading.value = true
    error.value = null

    try {
      data.value = await loader()
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  const reload = () => load()

  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  return {
    loading: loading as Ref<boolean>,
    error: error as Ref<Error | null>,
    data: data as Ref<T | null>,
    load,
    reload,
    reset
  }
}

/**
 * 异步Store类型
 */
export interface AsyncStore<T> {
  loading: Ref<boolean>
  error: Ref<Error | null>
  data: Ref<T | null>
  load: () => Promise<void>
  reload: () => Promise<void>
  reset: () => void
}

/**
 * Store 注册中心（支持依赖注入）
 * 注意：与 core/StoreFactory 不同，这是一个简单的依赖注入容器
 */
export class SimpleStoreRegistry {
  private stores = new Map<string, any>()

  /**
   * 注册Store
   */
  register<T>(id: string, factory: () => T): void {
    this.stores.set(id, factory)
  }

  /**
   * 获取Store
   */
  get<T>(id: string): T {
    const factory = this.stores.get(id)

    if (!factory) {
      throw new Error(`Store "${id}" not found`)
    }

    return factory()
  }

  /**
   * 检查是否存在
   */
  has(id: string): boolean {
    return this.stores.has(id)
  }

  /**
   * 清空所有Store
   */
  clear(): void {
    this.stores.clear()
  }
}

// 导出全局注册中心实例
export const storeRegistry = new SimpleStoreRegistry()

// 导出便捷函数
export { store as $ } // 超短别名
