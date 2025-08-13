/**
 * @ldesign/router 插件模块导出
 */

// 动画插件
export {
  createAnimationPlugin,
  AnimationManager,
  ANIMATION_PRESETS,
  createAnimationConfig,
  supportsAnimations,
  getAnimationDuration,
} from './animation'
export type { AnimationPluginOptions } from './animation'

// 缓存插件
export {
  createCachePlugin,
  CacheManager,
  createCacheConfig,
  supportsCaching,
} from './cache'
export type { CachePluginOptions } from './cache'

// 预加载插件
export {
  createPreloadPlugin,
  PreloadManager,
  HoverPreloadStrategy,
  VisibilityPreloadStrategy,
  IdlePreloadStrategy,
  createPreloadConfig,
  supportsPreload,
} from './preload'
export type { PreloadPluginOptions } from './preload'

// 性能监控插件
export {
  createPerformancePlugin,
  PerformanceManager,
  PerformanceEventType,
  withPerformanceMonitoring,
  createPerformanceConfig,
  supportsPerformanceAPI,
  getPagePerformance,
} from './performance'
export type { PerformancePluginOptions } from './performance'

// 默认导出
export default {
  animation: { createAnimationPlugin },
  cache: { createCachePlugin },
  preload: { createPreloadPlugin },
  performance: { createPerformancePlugin },
}
