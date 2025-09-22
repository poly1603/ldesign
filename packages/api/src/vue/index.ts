/**
 * Vue 集成模块入口
 * 导出所有 Vue 相关的功能
 */

// 重新导出核心工厂与辅助创建方法
export {
  createApiEngine,
  createApiEngineByEnv,
  createApiEngineWithDefaults,
  createApiEngineWithPlugins,
  createDevelopmentApiEngine,
  createProductionApiEngine,
  createSingletonApiEngine,
  createTestApiEngine,
  destroySingletonApiEngine,
  createSystemApiEngine,
  createSystemApiEngineByEnv,
} from '../core/factory'

// 重新导出系统 API 插件
export {
  createCustomSystemApiPlugin,
  systemApiPlugin,
} from '../plugins/systemApi'

// 重新导出核心类型
export type {
  ApiCallOptions,
  ApiEngine,
  ApiEngineConfig,
  ApiMethodConfig,
  ApiPlugin,
  CacheConfig,
  CacheStats,
  CaptchaInfo,
  DebounceConfig,
  DeduplicationConfig,
  LoginParams,
  LoginResult,
  MenuItem,
  SystemApiMethodName,
  UserInfo,
} from '../types'
// 重新导出系统 API 常量
export { SYSTEM_API_METHODS } from '../types'

// 组合式 API
export {
  useApi,
  useApiCall,
  useRequest,
  useApiCleanup,
  useBatchApiCall,
  useSystemApi,
  useApiPolling,
  usePaginatedApi,
  useInfiniteApi,
  useMutation,
} from './composables'
export type {
  ApiCallState,
  UseApiCallOptions,
  UseMutationOptions,
} from './composables'

// Engine 插件集成
export {
  apiPlugin,
  createApiEnginePlugin,
  createApiEnginePluginByEnv,
  createDevelopmentApiEnginePlugin,
  createProductionApiEnginePlugin,
  defaultApiEnginePlugin,
} from './engine'
export type { ApiEnginePluginOptions } from './engine'

// Vue 插件
export {
  API_ENGINE_INJECTION_KEY,
  ApiVuePlugin,
  createApiVuePlugin,
  getApiEngineFromApp,
  installApiVuePlugin,
} from './plugin'

export type { ApiVuePluginOptions } from './plugin'

// Vue 工具函数
export {
  useIntersectionObserver,
  useDebouncedRef,
  useApiMethod,
  useApiAvailable,
  useApiStatus,
} from './utils'
export type { UseIntersectionOptions } from './utils'

// Vue 指令
export { vIntersect } from './directives'

// 版本信息
export { version } from '../version'
