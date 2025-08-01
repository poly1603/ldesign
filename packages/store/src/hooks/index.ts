/**
 * Hooks 模块
 * 提供类似 React Hook 的使用方式
 */

// Store 创建 Hooks
export {
  createStore,
  createState,
  createComputed,
  createAsyncAction,
  createPersistedState,
} from './createStore'

// Store 使用 Hooks
export {
  useStoreHook,
  useSelector,
  useStateWatch,
  useActionState,
  useDebounce,
  useThrottle,
  useLocalStorage,
  useSessionStorage,
} from './useStoreHooks'

// 类型定义
export type {
  UseStoreOptions,
  StoreHookReturn,
  StateHookReturn,
  ActionHookReturn,
  GetterHookReturn,
  BatchHookReturn,
  PersistHookReturn,
} from '@/types/hooks'
