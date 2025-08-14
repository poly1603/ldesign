// 核心引擎
export { ApiEngineImpl as ApiEngine, createApiEngine } from './core/api-engine'
export { CacheManager } from './core/cache-manager'

export { DebounceManager } from './core/debounce-manager'
export { DeduplicationManager } from './core/deduplication-manager'
export { PluginManager } from './core/plugin-manager'
// 内置插件
export {
  createSystemApiPlugin,
  SYSTEM_API_METHODS,
  type SystemApiConfig,
  type SystemApiEndpoints,
  type SystemApiMethodName,
  systemApiPlugin,
} from './plugins/system-apis'
// 核心导出
export * from './types'

export * from './utils'

// 便捷创建函数
export function createApi(config?: import('./types').ApiEngineConfig) {
  // eslint-disable-next-line ts/no-require-imports
  const { createApiEngine } = require('./core/api-engine')
  return createApiEngine(config)
}

// 默认导出
export default {
  createApi,
}
