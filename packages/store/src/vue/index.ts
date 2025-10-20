/**
 * Vue 3 集成模块
 * 提供 Vue 3 的 Provider/Inject 模式支持和组合式 API
 */

export type {
  ActionHookReturn,
  BatchHookReturn,
  GetterHookReturn,
  PersistHookReturn,
  StateHookReturn,
  StoreHookReturn,
  UseStoreOptions,
} from '../types/hooks'

// 类型定义
export type {
  ProviderPluginOptions,
  StoreDefinition,
  StoreProviderContext,
  StoreProviderOptions,
  StoreRegistration,
  StoreFactory as VueStoreFactory, // 重命名以避免与 core 模块冲突
} from '../types/provider'

// 常量
export { STORE_PROVIDER_KEY } from '../types/provider'

// 组合式 API
export {
  useAction,
  useAsyncAction,
  useBatch,
  useComputed,
  useGetter,
  usePersist,
  useReactiveState,
  useSimpleStore,
  useState,
  useStore,
} from './composables'

// 指令
export {
  createStoreDirectivesPlugin,
  storeDirectives,
  vAction,
  vLoading,
  vStore,
} from './directives'
// 辅助工具
export {
  createAutoStorePlugin,
  createReactiveStore,
  createSimpleStore,
  createStores,
  globalStoreManager,
  StoreManager,
} from './helpers'

export type { SimpleStoreOptions } from './helpers'

// Provider 组件和相关功能
export {
  createStoreProviderPlugin,
  StoreProvider,
  useStoreProvider,
  useStoreRegistration,
} from './StoreProvider'
