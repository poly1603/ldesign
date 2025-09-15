/**
 * @ldesign/api - 通用系统接口管理包
 * 统一导出核心工厂、类型、系统插件与 Vue 集成能力
 */

// 核心功能
export { ApiEngineImpl } from './core/ApiEngine'

// 核心工厂与辅助创建方法

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
} from './core/factory'

export {
  createCustomSystemApiPlugin,
  systemApiPlugin,
} from './plugins/systemApi'
export { createRestApiPlugin } from './plugins/rest'
export { createGraphqlApiPlugin, gql } from './plugins/graphql'
export { createOfflineCachePlugin } from './plugins/offlineCache'
export { createRateLimitPlugin } from './plugins/rateLimit'
export { createLoggingPlugin } from './plugins/logging'

// 核心类型
export type {
  ApiCallOptions,
  ApiEngine,
  ApiEngineConfig,
  ApiMethodConfig,
  ApiPlugin,
  CacheConfig,
  CacheItem,
  CacheStats,
  CaptchaInfo,
  DebounceConfig,
  DebounceManager,
  DeduplicationConfig,
  DeduplicationManager,
  LoginParams,
  LoginResult,
  MenuItem,
  SystemApiMethodName,
  UserInfo,
} from './types'

// 系统 API 常量和方法
export { SYSTEM_API_METHODS } from './types'

// 认证中间件插件
export { authMiddlewaresPlugin, createAuthMiddlewaresPlugin } from './plugins/auth'

// 工具类
export { CacheManager } from './utils/CacheManager'
export { renameKeysShallow, renameKeysDeep } from './utils/object'

/**
 * @ldesign/api 主入口文件
 * 导出所有公共 API
 */

export { DebounceManagerImpl } from './utils/DebounceManager'
// 工具函数
export {
  createDebounceFunction,
  createKeyedDebounceFunction,
  debounce,
  keyedDebounce,
} from './utils/DebounceManager'

export { DeduplicationManagerImpl } from './utils/DeduplicationManager'

export {
  classBasedDeduplicate,
  createDeduplicatedFunction,
  deduplicate,
  deduplicateGlobally,
  globalDeduplicationManager,
} from './utils/DeduplicationManager'

// 类型辅助（可选的强类型注册表）
export type { TypedApiEngine } from './types/typed'
export { withTypedApi } from './types/typed'

// Vue 集成：组合式 API、Engine 集成、插件、工具
export {
  useApi,
  useApiCall,
  useApiCleanup,
  useBatchApiCall,
  useSystemApi,
  useApiPolling,
  usePaginatedApi,
  useInfiniteApi,
  useMutation,
} from './vue/composables'
export type { ApiCallState, UseApiCallOptions } from './vue/composables'

export {
  apiPlugin,
  createApiEnginePlugin,
  createApiEnginePluginByEnv,
  createDevelopmentApiEnginePlugin,
  createProductionApiEnginePlugin,
  defaultApiEnginePlugin,
} from './vue/engine'
export type { ApiEnginePluginOptions } from './vue/engine'

export {
  API_ENGINE_INJECTION_KEY,
  ApiVuePlugin,
  createApiVuePlugin,
  getApiEngineFromApp,
  installApiVuePlugin,
} from './vue/plugin'
export type { ApiVuePluginOptions } from './vue/plugin'

export { useIntersectionObserver } from './vue/utils'
export { vIntersect } from './vue/directives'

/**
 * 版本信息
 */
export { version } from './version'
