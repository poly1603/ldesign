/**
 * 路由插件系统
 *
 * 提供各种增强功能的插件
 */

export type {
  ComponentEnhancementConfig,
  ComponentSize,
  LinkVariant,
  PreloadStrategy,
} from '../components/types'

// 缓存插件
export { createCachePlugin, RouterCachePlugin } from './cache-plugin'

export type { CacheConfig, CacheStrategy } from './cache-plugin'

// 增强组件插件
export {
  createDefaultConfirmDialog,
  createDefaultEventTracker,
  createDefaultLayoutResolver,
  createDefaultPermissionChecker,
  createEnhancementConfig,
  EnhancedComponentsPlugin,
} from './components'

// 性能监控插件
export {
  createPerformancePlugin,
  RouterPerformancePlugin,
} from './performance-plugin'

export type { PerformanceConfig, PerformanceData } from './performance-plugin'
