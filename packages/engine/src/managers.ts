/**
 * @ldesign/engine/managers - 管理器模块
 *
 * 提供各种功能管理器
 */

export { AdvancedCacheManager } from './cache/advanced-cache'
// 缓存管理
export { CacheManagerImpl, createCacheManager } from './cache/cache-manager'

// DevTools 集成
export { createDevToolsIntegration, DevToolsIntegration } from './devtools'

// 错误管理
export { createErrorManager, errorHandlers } from './errors/error-manager'

export { createErrorRecoveryManager, ErrorRecoveryManager } from './errors/error-recovery'

// 中间件管理
export { commonMiddleware, createMiddlewareManager } from './middleware/middleware-manager'

// 通知管理
export { createNotificationManager, notificationTypes } from './notifications/notification-manager'

// 性能管理
export { createPerformanceManager, PerformanceEventType } from './performance/performance-manager'

// 插件管理
export { createPluginManager } from './plugins/plugin-manager'

// 安全管理
export { createSecurityManager, SecurityEventType } from './security/security-manager'
// 状态管理
export { createStateManager, stateModules } from './state/state-manager'

// 类型导出
export type {
  CacheManager,
  ErrorManager,
  MiddlewareManager,
  NotificationManager,
  PerformanceManager,
  PluginManager,
  SecurityManager,
  StateManager,
} from './types'

export type { DevToolsOptions, DevToolsTimelineEvent, DevToolsInspectorState } from './devtools'
