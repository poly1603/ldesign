/**
 * 高级功能模块导出
 *
 * 这个模块包含路由器的高级功能，包括：
 * - 路由缓存管理
 * - 路由预加载
 * - 性能监控
 */

// 高级功能相关类型
export type {
  PreloadStrategy,
  RouteCacheConfig,
  RouteTransition,
} from '../types'

// 缓存管理
export { createRouteCacheManager, RouteCacheManager } from './cache'

// 性能监控
export { createPerformanceMonitor, PerformanceMonitor } from './performance'

// 类型导出
export type { NavigationPerformance, PerformanceMetrics } from './performance'

// 预加载
export { createRoutePreloader, RoutePreloader } from './preloader'
