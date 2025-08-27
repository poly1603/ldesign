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

export { createApp, createEngine } from './core/factory'

export {
  commonDirectives,
  createDirectiveManager,
} from './directives/directive-manager'

export { createErrorManager, errorHandlers } from './errors/error-manager'

export { createEventManager, ENGINE_EVENTS } from './events/event-manager'

export { createLogger, logFormatters, logTransports } from './logger/logger'

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

export { createPluginManager } from './plugins/plugin-manager'

// 预设配置导出
export * from './presets'

export {
  createSecurityManager,
  SecurityEventType,
} from './security/security-manager'

export { createStateManager, stateModules } from './state/state-manager'

// 类型导出
export type * from './types'
export type { RouterConfig, StoreConfig } from './types/engine'

// 工具函数导出
export * from './utils'

// Vue集成导出
export * from './vue'

// 扩展模块导出
export * from './extensions'

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
