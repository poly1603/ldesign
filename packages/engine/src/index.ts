/**
 * @ldesign/engine - Vue3应用引擎
 *
 * 🚀 一个强大的Vue3应用引擎，提供插件系统、中间件支持、全局管理等核心功能
 *
 * @example
 * ```typescript
 * import { createEngine } from '@ldesign/engine'
 *
 * const engine = createEngine({
 *   config: {
 *     app: { name: 'My App', version: '1.0.0' },
 *     debug: true
 *   }
 * })
 *
 * engine.createApp(App).mount('#app')
 * ```
 */

// 管理器导出
export {
  CacheManagerImpl,
  CacheStrategy,
  createCacheManager,
} from './cache/cache-manager'
export {
  ConfigManagerImpl,
  createConfigManager,
  defaultConfigSchema,
  NamespacedConfigManager,
} from './config/config-manager'

// 常量导出
export * from './constants'

// 核心导出
export { EngineImpl } from './core/engine'

export { createApp, createAndMountApp, createEngine } from './core/factory'

// Dialog弹窗系统导出
export * from './dialog'

export {
  commonDirectives,
  createDirectiveManager,
} from './directives/directive-manager'

export { createErrorManager, errorHandlers } from './errors/error-manager'

export { createEventManager, ENGINE_EVENTS } from './events/event-manager'

export { createLogger, logFormatters, logTransports } from './logger/logger'

// 消息系统导出
// 选择性导出消息模块以避免冲突
export {
  calculateMessagePosition,
  createMessageManager,
  createMessageQueue,
  generateMessageId,
  getViewportSize,
  messageDebounce,
  messageDeepClone,
  MessageManager,
  messageThrottle,
  validateMessageConfig,
} from './message'

export type {
  MessageConfig,
  MessageInstance,
  MessageManagerConfig,
  MessagePosition,
  MessageType,
} from './message'

// 新增中间件系统导出
export {
  commonMiddleware,
  createMiddlewareManager,
} from './middleware/middleware-manager'

export {
  createNotificationManager,
  notificationTypes,
} from './notifications/notification-manager'

export {
  createPerformanceManager,
  PerformanceEventType,
} from './performance/performance-manager'

// 新增插件系统导出
export { createPluginManager } from './plugins/plugin-manager'

// 预设配置导出
export * from './presets'

export {
  createSecurityManager,
  SecurityEventType,
} from './security/security-manager'

export { createStateManager, stateModules } from './state/state-manager'

// 类型导出
// 选择性导出类型以避免冲突
export type {
  // 配置类型
  ConfigManager,

  // 指令类型
  DirectiveManager,
  // 引擎类型
  EngineConfig,
  EngineDirective,
  // 通知类型
  NotificationManager as EngineNotificationManager,
  NotificationOptions as EngineNotificationOptions,
  NotificationProgress as EngineNotificationProgress,
  EnhancedEngineConfig,

  // 环境类型
  EnvironmentManager,

  // 事件类型
  EventManager,
  EventMap,
  I18nAdapter,

  // 生命周期类型
  LifecycleManager,
  NotificationAction,
  NotificationPosition,
  NotificationTheme,
  NotificationType,
  // 性能类型
  PerformanceManager,
  // 适配器类型
  RouterAdapter,
  // 安全类型
  SecurityManager,
  StateAdapter,
  // 基础类型
  Stats,
  ThemeAdapter,
} from './types'

// 工具函数导出
export * from './utils'

// Vue集成导出
export * from './vue'

// 版本信息
export const version = '0.1.0'

// Vue插件安装函数
export async function install(app: any, options: any = {}) {
  // 动态导入避免循环依赖
  const { createEngine } = await import('./core/factory')
  const engine = createEngine(options)
  engine.install(app)
  return engine
}
