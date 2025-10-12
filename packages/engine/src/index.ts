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
  createEngineApp,
  createAndMountEngineApp,
  type EngineAppOptions 
} from './core/create-engine-app'

// ==================== 类型导出 ====================
// 引擎核心类型
export type { Engine } from './types/engine'

// 插件系统类型
export type {
  Plugin,
  PluginContext,
  PluginMetadata,
  PluginInfo,
  PluginStatus
} from './types/plugin'

// 中间件类型
export type {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  MiddlewareRequest,
  MiddlewareResponse
} from './types/middleware'

// 配置类型
export type {
  EngineConfig,
  ConfigManager
} from './types/config'

// 日志类型
export type {
  LogLevel,
  LogEntry,
  Logger
} from './types/logger'

// ==================== 实用工具导出 ====================
// Vue组合式 API
export { 
  useEngine,
  useNotification,
  useLogger,
  useCache,
  useEvents,
  usePerformance,
  useConfig,
  useErrorHandler,
  usePlugins 
} from './vue/composables'

// 常用工具函数
export { 
  debounce, 
  throttle, 
  deepClone, 
  generateId 
} from './utils/index'

// ==================== 版本信息 ====================
export const version = '1.0.0'
