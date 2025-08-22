// 类型导出
export type { CacheOptions, UseCacheOptions } from '../types'
export {
  CacheProvider,
  provideCacheManager,
  useCacheManager,
} from './cache-provider'
// Vue 3 集成导出
export { useCache } from './use-cache'

export { useCacheStats } from './use-cache-stats'
