/**
 * 路由插件系统
 *
 * 提供各种增强功能的插件
 */

// 增强组件插件
export {
  EnhancedComponentsPlugin,
  createDefaultConfirmDialog,
  createDefaultEventTracker,
  createDefaultLayoutResolver,
  createDefaultPermissionChecker,
  createEnhancementConfig,
} from './enhanced-components-plugin'

export type {
  ComponentEnhancementConfig,
  ComponentSize,
  LinkVariant,
  PreloadStrategy,
} from '../components/types'

// 性能监控插件
export {
  RouterPerformancePlugin,
  createPerformancePlugin,
} from './performance-plugin'

export type { PerformanceConfig, PerformanceData } from './performance-plugin'

// 缓存插件
export { RouterCachePlugin, createCachePlugin } from './cache-plugin'

export type { CacheConfig, CacheStrategy } from './cache-plugin'
