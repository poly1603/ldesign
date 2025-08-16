import type { InjectionKey } from 'vue'
import type { Pinia, Store } from 'pinia'

/**
 * Provider 配置选项
 */
export interface StoreProviderOptions {
  /** Pinia 实例 */
  pinia?: Pinia
  /** 预定义的 Store */
  stores?: Record<string, any>
  /** 是否全局注册 */
  global?: boolean
  /** 是否启用开发工具 */
  devtools?: boolean
}

/**
 * Store 注册信息
 */
export interface StoreRegistration {
  /** Store ID */
  id: string
  /** Store 工厂函数 */
  factory: () => Store
  /** 是否单例 */
  singleton?: boolean
  /** 是否懒加载 */
  lazy?: boolean
}

/**
 * Provider 上下文
 */
export interface StoreProviderContext {
  /** Pinia 实例 */
  pinia: Pinia
  /** 注册的 Store */
  stores: Map<string, StoreRegistration>
  /** Store 实例缓存 */
  instances: Map<string, Store>
  /** 注册 Store */
  register: (id: string, registration: StoreRegistration) => void
  /** 获取 Store */
  getStore: <T extends Store = Store>(id: string) => T | undefined
  /** 创建 Store 实例 */
  createStore: <T extends Store = Store>(id: string) => T | undefined
  /** 销毁 Store 实例 */
  destroyStore: (id: string) => void
  /** 清理所有 Store */
  cleanup: () => void
}

/**
 * Provider 注入键
 */
export const STORE_PROVIDER_KEY: InjectionKey<StoreProviderContext> =
  Symbol('store-provider')

/**
 * Store 工厂函数类型
 */
export type StoreFactory<T extends Store = Store> = () => T

/**
 * Store 定义类型
 */
export interface StoreDefinition<T extends Store = Store> {
  id: string
  factory: StoreFactory<T>
  options?: {
    singleton?: boolean
    lazy?: boolean
  }
}

/**
 * Provider 插件选项
 */
export interface ProviderPluginOptions {
  /** 是否自动安装 Pinia */
  autoInstallPinia?: boolean
  /** 默认 Store 配置 */
  defaultStoreOptions?: {
    singleton?: boolean
    lazy?: boolean
  }
}

/**
 * Vue 应用扩展
 */
// declare module '@vue/runtime-core' {
//   interface ComponentCustomProperties {
//     $stores: StoreProviderContext
//   }
// }
