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

// ==================== 核心导出 ====================
// 统一的应用创建函数
export {
  createAndMountEngineApp,
  createEngineApp,
  type EngineAppOptions
} from './core/create-engine-app'

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
  throttle
} from './utils/index'

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

// ==================== 插件导出 ====================
export { createI18nEnginePlugin } from './plugins/i18n'
export type { I18nEnginePluginOptions } from './plugins/i18n'

// ==================== 版本信息 ====================
export const version = '1.0.0'
