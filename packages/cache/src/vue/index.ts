// 类型导出
export type { CacheOptions, UseCacheOptions } from '../types'
export {
  CACHE_MANAGER_KEY,
  CacheProvider,
  provideCacheManager,
  useCacheManager,
} from './cache-provider'
// Vue 3 集成导出
export { useCache } from './use-cache'
// 便捷的组合式函数
export {
  useCacheAsync,
  useCacheBoolean,
  useCacheCounter,
  useCacheList,
  useCacheObject,
} from './use-cache-helpers'

export { useCacheStats } from './use-cache-stats'
