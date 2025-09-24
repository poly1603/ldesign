/**
 * @ldesign/api - UMD 构建专用入口文件
 * 为浏览器环境和库模式提供精简的 API 界面
 */

// 核心引擎实现
export { ApiEngineImpl } from './core/ApiEngine'

// 主要的 API 创建工厂函数
export {
  createApiEngine,
  createApiEngineByEnv,
  createApiEngineWithDefaults,
  createApiEngineWithPlugins,
  createDevelopmentApiEngine,
  createProductionApiEngine,
  createSingletonApiEngine,
  createSystemApiEngine,
  createSystemApiEngineByEnv,
  createTestApiEngine,
  destroySingletonApiEngine,
} from './core/factory'

// 认证中间件插件
export { authMiddlewaresPlugin, createAuthMiddlewaresPlugin } from './plugins/auth'

// REST API 插件
export { createRestApiPlugin } from './plugins/rest'

// 系统 API 插件
export {
  createCustomSystemApiPlugin,
  systemApiPlugin,
} from './plugins/systemApi'

// 核心类型（仅类型导出）
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
} from './types'

// 系统 API 常量
export { SYSTEM_API_METHODS } from './types'

// 类型辅助
export type { TypedApiEngine } from './types/typed'
export { withTypedApi } from './types/typed'

// 主要工具类
export { CacheManager } from './utils/CacheManager'
// 版本信息
export { version } from './version'

// Vue 组合式 API
export {
  useApi,
  useApiCall,
  useApiCleanup,
  useApiPolling,
  useBatchApiCall,
  useInfiniteApi,
  useMutation,
  usePaginatedApi,
  useSystemApi,
} from './vue/composables'
export type { ApiCallState, UseApiCallOptions } from './vue/composables'

export { vIntersect } from './vue/directives'
// Vue Engine 插件集成
export {
  apiPlugin,
  createApiEnginePlugin,
  createApiEnginePluginByEnv,
  createDevelopmentApiEnginePlugin,
  createProductionApiEnginePlugin,
  defaultApiEnginePlugin,
} from './vue/engine'

export type { ApiEnginePluginOptions } from './vue/engine'

// Vue 插件
export {
  API_ENGINE_INJECTION_KEY,
  ApiVuePlugin,
  createApiVuePlugin,
  getApiEngineFromApp,
  installApiVuePlugin,
} from './vue/plugin'
export type { ApiVuePluginOptions } from './vue/plugin'

// Vue 工具函数和指令
export { useIntersectionObserver } from './vue/utils'
