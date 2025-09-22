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
// Vue插件安装函数
import type { App } from 'vue'
import type { CreateEngineOptions, Engine } from './types'

// 高级缓存管理器导出
export {
  AdvancedCacheManager,
  type AutoUpdateConfig,
  type CacheStatistics,
  type LayeredCacheConfig,
  type PreloadConfig
} from './cache/advanced-cache'
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

export { createAndMountApp, createApp, createEngine } from './core/factory'

// Dialog弹窗系统导出
export * from './dialog'

export {
  commonDirectives,
  createDirectiveManager,
} from './directives/directive-manager'

export { createErrorManager, errorHandlers } from './errors/error-manager'

// 错误恢复系统导出
export {
  commonRecoveryStrategies,
  createErrorRecoveryManager,
  type ErrorContext,
  ErrorRecoveryManager,
  type ErrorReport as ErrorRecoveryReport,
  type FallbackStrategy,
  type RecoveryStrategy,
  type RetryStrategy
} from './errors/error-recovery'

export { createEventManager, ENGINE_EVENTS } from './events/event-manager'

// 请求拦截器导出
export {
  createRequestInterceptor,
  type ErrorInterceptorFn,
  type InterceptorFn,
  type ProgressEvent,
  type RequestConfig,
  requestInterceptor,
  RequestInterceptorManager,
  type ResponseData
} from './interceptors/request-interceptor'

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

// 增强配置管理系统导出
export {
  type ConfigChangeEvent,
  type ConfigLoader,
  type ConfigObject,
  type ConfigSchema,
  type ConfigValidator,
  ConfigValidators,
  type ConfigValue,
  createEnhancedConfigManager,
  EnhancedConfigManager,
  EnvironmentConfigLoader,
  JsonConfigLoader,
  MemoryConfigLoader
} from './utils/config-manager'

// 日志系统导出
export {
  ConsoleLogHandler,
  createModuleLogger,
  EnhancedLogger,
  ErrorTracker,
  type LogContext,
  type LogEntry,
  logger,
  type ErrorReport as LoggingErrorReport,
  type LogHandler,
  LogLevel,
  LogLevelNames,
  logMethod,
  logPerformance,
  MemoryLogHandler,
  RemoteLogHandler
} from './utils/logging-system'

// 内存管理工具导出
export {
  createManagedPromise,
  GlobalMemoryManager,
  ListenerManager,
  managedLifecycle,
  MemoryLeakDetector,
  memoryManager,
  ReferenceTracker,
  ResourceManager,
  TimerManager
} from './utils/memory-manager'

// 性能分析工具导出
export {
  BatchProcessor,
  debounce,
  globalPerformanceAnalyzer,
  measurePerformance,
  ObjectPool,
  PerformanceAnalyzer,
  type PerformanceMeasure,
  type PerformanceReport,
  throttle
} from './utils/performance-analyzer'

// 类型安全工具导出
export {
  createTypedConfigManager,
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isPromise,
  isString,
  isValidObject,
  PromiseUtil,
  safeAsync,
  safeDeepClone,
  safeFilter,
  safeGet,
  safeGetNested,
  safeJsonParse,
  safeJsonStringify,
  safeMap,
  safeMerge,
  TypedConfigWrapper
} from './utils/type-safety'

// 打包优化工具导出
export {
  BundleOptimizer,
  globalBundleOptimizer,
  LazyLoad,
  dynamicImport,
  preloadCriticalModules
} from './utils/bundle-optimizer'

// Vue集成导出
export * from './vue'

// 版本信息
export const version = '0.1.0'

export async function install(app: App, options: CreateEngineOptions = {}): Promise<Engine> {
  // 动态导入避免循环依赖
  const { createEngine } = await import('./core/factory')
  const engine = createEngine(options)
  engine.install(app)
  return engine
}
