/**
 * Vue Store 辅助工具
 * 提供更简单的 Store 创建和使用方式
 */

import type { StateTree, Store } from 'pinia'
import type { App } from 'vue'
import { defineStore } from 'pinia'

/**
 * 简化的 Store 定义选项
 */
export interface SimpleStoreOptions<T extends StateTree = StateTree> {
  /** Store ID */
  id: string
  /** 初始状态 */
  state?: T | (() => T)
  /** 动作定义 */
  actions?: Record<string, (...args: any[]) => any>
  /** 计算属性定义 */
  getters?: Record<string, (state: T) => any>
  /** 是否持久化 */
  persist?: boolean
  /** 持久化键 */
  persistKey?: string
  /** 持久化存储 */
  persistStorage?: Storage
}

/**
 * 创建简化的 Store
 */
export function createSimpleStore<T extends StateTree = StateTree>(options: SimpleStoreOptions<T>) {
  const { id, state, actions = {}, getters = {}, persist, persistKey, persistStorage } = options

  // 创建 Pinia Store
  const useStore = defineStore(id, {
    state: typeof state === 'function' ? state as () => T : () => (state || {} as T),
    actions: actions as any,
    getters: getters as any,
  })

  // 添加持久化支持
  if (persist) {
    const originalUseStore = useStore
    const enhancedUseStore = () => {
      const store = originalUseStore()

      // 添加持久化方法
      if (!(store as any).$persist) {
        const storageKey = persistKey || `store:${id}`
        const storage = persistStorage || localStorage

        ;(store as any).$persist = {
          save() {
            try {
              const serialized = JSON.stringify(store.$state)
              storage.setItem(storageKey, serialized)
            } catch (error) {
              console.error('Failed to save store state:', error)
            }
          },

          load() {
            try {
              const serialized = storage.getItem(storageKey)
              if (serialized && serialized !== 'undefined' && serialized !== 'null') {
                const parsed = JSON.parse(serialized)
                ;(store.$patch as any)(parsed)
              }
            } catch (error) {
              console.error('Failed to load store state:', error)
            }
          },

          clear() {
            try {
              storage.removeItem(storageKey)
            } catch (error) {
              console.error('Failed to clear store state:', error)
            }
          }
        }

        // 自动加载
        ;(store as any).$persist.load()
      }

      return store
    }

    return enhancedUseStore
  }

  return useStore
}

/**
 * Store 管理器
 * 提供全局 Store 管理功能
 */
export class StoreManager {
  private stores = new Map<string, () => Store>()
  private instances = new Map<string, Store>()

  /**
   * 注册 Store
   */
  register<T extends Store = Store>(id: string, storeFactory: () => T): void {
    this.stores.set(id, storeFactory)
  }

  /**
   * 获取 Store 实例
   */
  get<T extends Store = Store>(id: string): T | undefined {
    // 从缓存获取
    if (this.instances.has(id)) {
      return this.instances.get(id) as T
    }

    // 创建新实例
    const factory = this.stores.get(id)
    if (factory) {
      const instance = factory() as T
      this.instances.set(id, instance)
      return instance
    }

    console.warn(`Store "${id}" not found`)
    return undefined
  }

  /**
   * 销毁 Store 实例
   */
  destroy(id: string): void {
    this.instances.delete(id)
  }

  /**
   * 清理所有 Store
   */
  clear(): void {
    this.instances.clear()
  }

  /**
   * 获取所有注册的 Store ID
   */
  getRegisteredIds(): string[] {
    return Array.from(this.stores.keys())
  }

  /**
   * 获取所有活跃的 Store ID
   */
  getActiveIds(): string[] {
    return Array.from(this.instances.keys())
  }
}

/**
 * 全局 Store 管理器实例
 */
export const globalStoreManager = new StoreManager()

/**
 * Vue 插件：自动注册 Store
 */
export function createAutoStorePlugin(stores: Record<string, () => Store>) {
  return {
    install(app: App) {
      // 注册所有 Store
      Object.entries(stores).forEach(([id, factory]) => {
        globalStoreManager.register(id, factory)
      })

      // 添加全局属性
      app.config.globalProperties.$storeManager = globalStoreManager
    }
  }
}

/**
 * 批量创建 Store
 */
export function createStores(definitions: Record<string, SimpleStoreOptions>) {
  const stores: Record<string, () => Store> = {}

  Object.entries(definitions).forEach(([id, options]) => {
    stores[id] = createSimpleStore({ ...options, id })
  })

  return stores
}

/**
 * 响应式 Store 状态
 */
export function createReactiveStore<T extends StateTree = StateTree>(
  id: string,
  initialState: T,
  options: {
    actions?: Record<string, (state: T, ...args: any[]) => any>
    getters?: Record<string, (state: T) => any>
    persist?: boolean
  } = {}
) {
  return createSimpleStore<T>({
    id,
    state: () => initialState,
    actions: options.actions || {},
    getters: options.getters || {},
    persist: options.persist,
  })
}
