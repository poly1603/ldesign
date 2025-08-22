/**
 * Vue 3 集成模块
 * 提供 Vue 3 的 Provider/Inject 模式支持和组合式 API
 */

// 类型定义
export type {
  ProviderPluginOptions,
  StoreDefinition,
  StoreFactory,
  StoreProviderContext,
  StoreProviderOptions,
  StoreRegistration,
} from '../types/provider'

// 常量
export { STORE_PROVIDER_KEY } from '../types/provider'

// 组合式 API
export {
  useAction,
  useBatch,
  useGetter,
  usePersist,
  useState,
  useStore,
} from './composables'

// Provider 组件和相关功能
export {
  createStoreProviderPlugin,
  StoreProvider,
  useStoreProvider,
  useStoreRegistration,
} from './StoreProvider'

export type {
  ActionHookReturn,
  BatchHookReturn,
  GetterHookReturn,
  PersistHookReturn,
  StateHookReturn,
  StoreHookReturn,
  UseStoreOptions,
} from '@/types/hooks'
