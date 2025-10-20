/**
 * Hooks 模块
 * 提供类似 React Hook 的使用方式
 */

// 类型定义
export type {
  ActionHookReturn,
  BatchHookReturn,
  GetterHookReturn,
  PersistHookReturn,
  StateHookReturn,
  StoreHookReturn,
  UseStoreOptions,
} from '../types/hooks'

// Store 创建 Hooks
export {
  createAsyncAction,
  createComputed,
  createStore as createHookStore, // 重命名以避免与 core 模块冲突
  createPersistedState,
  createState,
} from './createStore'

// Store 使用 Hooks
export {
  useActionState,
  useDebounce,
  useLocalStorage,
  useSelector,
  useSessionStorage,
  useStateWatch,
  useStoreHook,
  useThrottle,
} from './useStoreHooks'
