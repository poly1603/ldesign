/**
 * Vue 3 集成模块
 * 提供 Vue 3 的 Provider/Inject 模式支持和组合式 API
 */

// Provider 组件和相关功能
export {
  StoreProvider,
  useStoreProvider,
  useStoreRegistration,
  createStoreProviderPlugin,
} from './StoreProvider'

// 组合式 API
export {
  useStore,
  useState,
  useAction,
  useGetter,
  useBatch,
  usePersist,
} from './composables'

// 类型定义
export type {
  StoreProviderOptions,
  StoreProviderContext,
  StoreRegistration,
  StoreFactory,
  StoreDefinition,
  ProviderPluginOptions,
} from '@/types/provider'

export type {
  UseStoreOptions,
  StoreHookReturn,
  StateHookReturn,
  ActionHookReturn,
  GetterHookReturn,
  BatchHookReturn,
  PersistHookReturn,
} from '@/types/hooks'

// 常量
export { STORE_PROVIDER_KEY } from '@/types/provider'
