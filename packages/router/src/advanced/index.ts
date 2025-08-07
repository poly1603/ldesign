/**
 * 高级功能模块导出
 *
 * 这个模块包含路由器的高级功能，包括：
 * - 路由预加载
 * - 路由缓存
 * - 性能监控
 * - 路由过渡动画
 */

export { createRoutePreloader } from '../preloader'
export { createRouteCacheManager } from '../cache'
export { createPerformanceMonitor } from '../performance'

// 高级功能相关类型
export type {
  PreloadStrategy,
  RouteCacheConfig,
  RouteTransition,
} from '../types'

// 性能监控类型
export type { PerformanceMetrics, NavigationPerformance } from '../performance'
