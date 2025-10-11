/**
 * 缓存模块的主导出文件
 * 统一的缓存管理器，整合了所有缓存功能
 */

export {
  type CacheConfig,
  type CacheItem,
  UnifiedCacheManager as CacheManager, // 向后兼容
  type CacheStats,
  CacheStrategy,
  createUnifiedCacheManager as createCacheManager, // 向后兼容
  createUnifiedCacheManager,
  UnifiedCacheManager
} from './unified-cache-manager'
