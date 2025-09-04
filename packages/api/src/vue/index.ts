/**
 * Vue 集成模块入口
 * 导出所有 Vue 相关的功能
 */

// Vue 插件
export {
  ApiVuePlugin,
  createApiVuePlugin,
  installApiVuePlugin,
  getApiEngineFromApp,
  API_ENGINE_INJECTION_KEY,
} from './plugin'
export type { ApiVuePluginOptions } from './plugin'

// 组合式 API
export {
  useApi,
  useApiCall,
  useBatchApiCall,
  useSystemApi,
  useApiCleanup,
} from './composables'
export type {
  ApiCallState,
  UseApiCallOptions,
} from './composables'

// Engine 插件集成
export {
  createApiEnginePlugin,
  defaultApiEnginePlugin,
  apiPlugin,
  createDevelopmentApiEnginePlugin,
  createProductionApiEnginePlugin,
  createApiEnginePluginByEnv,
} from './engine'
export type { ApiEnginePluginOptions } from './engine'

// 重新导出核心类型
export type {
  ApiEngine,
  ApiEngineConfig,
  ApiPlugin,
  ApiMethodConfig,
  ApiCallOptions,
  CacheConfig,
  DebounceConfig,
  DeduplicationConfig,
  CacheStats,
  SystemApiMethodName,
  LoginParams,
  LoginResult,
  UserInfo,
  MenuItem,
  CaptchaInfo,
} from '../types'

// 重新导出系统 API 常量
export { SYSTEM_API_METHODS } from '../types'
