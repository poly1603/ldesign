/**
 * @ldesign/router 插件模块导出
 */

// 动画插件
export {
  ANIMATION_PRESETS,
  AnimationManager,
  createAnimationConfig,
  createAnimationPlugin,
  getAnimationDuration,
  supportsAnimations,
} from './animation'
export type { AnimationPluginOptions } from './animation'

// 缓存插件
export {
  CacheManager,
  createCacheConfig,
  createCachePlugin,
  supportsCaching,
} from './cache'
export type { CachePluginOptions } from './cache'

// 性能监控插件
export {
  createPerformanceConfig,
  createPerformancePlugin,
  getPagePerformance,
  PerformanceEventType,
  PerformanceManager,
  supportsPerformanceAPI,
  withPerformanceMonitoring,
} from './performance'
export type { PerformancePluginOptions } from './performance'

// 预加载插件
export {
  createPreloadConfig,
  createPreloadPlugin,
  HoverPreloadStrategy,
  IdlePreloadStrategy,
  PreloadManager,
  supportsPreload,
  VisibilityPreloadStrategy,
} from './preload'
export type { PreloadPluginOptions } from './preload'

// 插件集合导出 - 所有插件函数已通过单独的 export 导出
