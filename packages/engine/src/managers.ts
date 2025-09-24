/**
 * @ldesign/engine/managers - 管理器模块
 * 
 * 提供各种功能管理器
 */

// 缓存管理
export { CacheManagerImpl, createCacheManager } from './cache/cache-manager'
export { AdvancedCacheManager } from './cache/advanced-cache'

// 状态管理
export { createStateManager, stateModules } from './state/state-manager'

// 性能管理
export { createPerformanceManager, PerformanceEventType } from './performance/performance-manager'

// 安全管理
export { createSecurityManager, SecurityEventType } from './security/security-manager'

// 插件管理
export { createPluginManager } from './plugins/plugin-manager'

// 中间件管理
export { createMiddlewareManager, commonMiddleware } from './middleware/middleware-manager'

// 通知管理
export { createNotificationManager, notificationTypes } from './notifications/notification-manager'

// 错误管理
export { createErrorManager, errorHandlers } from './errors/error-manager'
export { createErrorRecoveryManager, ErrorRecoveryManager } from './errors/error-recovery'

// 类型导出
export type {
  CacheManager,
  StateManager,
  PerformanceManager,
  SecurityManager,
  PluginManager,
  MiddlewareManager,
  NotificationManager,
  ErrorManager,
} from './types'
