/**
 * @ldesign/api 主入口文件
 * 导出所有公共 API
 */

// 核心功能
export { ApiEngineImpl } from './core/ApiEngine'
export {
  createApiEngine,
  createApiEngineWithDefaults,
  createDevelopmentApiEngine,
  createProductionApiEngine,
  createTestApiEngine,
  createApiEngineByEnv,
  createApiEngineWithPlugins,
  createSingletonApiEngine,
  destroySingletonApiEngine,
} from './core/factory'

// 类型定义
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
  CacheItem,
  DebounceManager,
  DeduplicationManager,
  SystemApiMethodName,
  LoginParams,
  LoginResult,
  UserInfo,
  MenuItem,
  CaptchaInfo,
} from './types'

// 系统 API 常量和方法
export { SYSTEM_API_METHODS } from './types'
export { systemApiPlugin, createCustomSystemApiPlugin } from './plugins/systemApi'

// 工具类
export { CacheManager } from './utils/CacheManager'
export { DebounceManagerImpl } from './utils/DebounceManager'
export { DeduplicationManagerImpl } from './utils/DeduplicationManager'

// 工具函数
export {
  createDebounceFunction,
  createKeyedDebounceFunction,
  debounce,
  keyedDebounce,
} from './utils/DebounceManager'

export {
  createDeduplicatedFunction,
  deduplicate,
  classBasedDeduplicate,
  globalDeduplicationManager,
  deduplicateGlobally,
} from './utils/DeduplicationManager'

// Vue 集成（仅在 Vue 环境中可用）
export {
  createApiEnginePlugin,
  defaultApiEnginePlugin,
  apiPlugin,
  createDevelopmentApiEnginePlugin,
  createProductionApiEnginePlugin,
  createApiEnginePluginByEnv,
} from './vue/engine'
export type { ApiEnginePluginOptions } from './vue/engine'

/**
 * 版本信息
 */
export const version = '1.0.0'

/**
 * 默认导出：创建 API 引擎的便捷函数
 */
export { createApiEngine as default }
