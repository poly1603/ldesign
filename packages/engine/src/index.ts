/**
 * @ldesign/engine - Vue3应用引擎
 *
 * 🚀 一个强大而简洁的Vue3应用引擎，通过统一的API配置所有功能
 *
 * @example
 * ```typescript
 * import { createEngineApp } from '@ldesign/engine'
 *
 * const engine = await createEngineApp({
 *   rootComponent: App,
 *   mountElement: '#app',
 *   config: {
 *     name: 'My App',
 *     version: '1.0.0',
 *     debug: true
 *   },
 *   features: {
 *     enableCaching: true,
 *     enablePerformanceMonitoring: true
 *   },
 *   plugins: [routerPlugin, storePlugin]
 * })
 * ```
 */

// 插件状态管理
export {
  createSharedState,
  useDark,
  useLocale,
  usePluginState,
  usePluginStates,
  useSize,
  useTheme
} from './composables/use-plugin-state'

// ==================== 核心导出 ====================
// 统一的应用创建函数
export {
  createAndMountEngineApp,
  createEngineApp,
  type EngineAppOptions
} from './core/create-engine-app'

// 模块加载器（新增 - 支持动态导入和Tree-Shaking）
export {
  createModuleLoader,
  ModuleLoader,
  type ModuleLoaderConfig,
  type ModuleMetadata,
  type ModuleLoadOptions,
  getGlobalModuleLoader,
  setGlobalModuleLoader,
  LazyModule
} from './core/module-loader'

// 对象池管理（新增 - 减少GC压力）
export {
  createObjectPoolManager,
  ObjectPoolManager,
  ObjectPool,
  TaskPool,
  NotificationPool,
  RequestPool,
  getGlobalObjectPoolManager,
  setGlobalObjectPoolManager,
  Pooled
} from './core/object-pools'

// ==================== Locale 模块导出 ====================
export {
  createLocaleAwarePlugin,
  type CreateLocaleAwarePluginOptions,
  createLocaleManager,
  createSimpleLocaleAwarePlugin,
  type LocaleAwarePlugin,
  LocaleManager,
  type LocaleManagerOptions
} from './locale'

// 性能监控模块
export * from './performance/performance-monitor'

// 性能分析器（新增 - 函数和组件性能追踪）
export {
  createProfiler,
  Profiler,
  type ProfilerConfig,
  type FunctionCallRecord,
  type ComponentRenderRecord,
  type PerformanceProfileReport,
  Profile,
  getGlobalProfiler,
  setGlobalProfiler
} from './performance/profiler'

// ==================== 插件导出 ====================
export { createI18nEnginePlugin } from './plugins/i18n'

export type { I18nEnginePluginOptions } from './plugins/i18n'

// 配置类型
export type {
  ConfigManager,
  EngineConfig
} from './types/config'

// ==================== 类型导出 ====================
// 引擎核心类型
export type { Engine } from './types/engine'

// 日志类型
export type {
  LogEntry,
  Logger,
  LogLevel
} from './types/logger'

// 中间件类型
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  MiddlewareRequest,
  MiddlewareResponse
} from './types/middleware'
// 插件系统类型
export type {
  Plugin,
  PluginContext,
  PluginInfo,
  PluginMetadata,
  PluginStatus
} from './types/plugin'

// 常用工具函数
export {
  debounce,
  deepClone,
  generateId,
  throttle,
  // 新增 - LRU缓存
  createLRUCache,
  LRUCache,
  type LRUCacheOptions
} from './utils/index'

// 智能缓存策略（新增）
export {
  SmartCacheStrategy,
  createSmartCacheStrategy,
  type SmartCacheConfig
} from './cache/smart-cache'

// ==================== 实用工具导出 ====================
// Vue组合式 API
export {
  useCache,
  useConfig,
  useEngine,
  useErrorHandler,
  useEvents,
  useLogger,
  useNotification,
  usePerformance,
  usePlugins
} from './vue/composables'

// ==================== 版本信息 ====================
export const version = '1.0.0'
