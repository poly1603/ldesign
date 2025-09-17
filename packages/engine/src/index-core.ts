/**
 * @ldesign/engine - 核心导出
 * 
 * 精简版导出，只包含最常用的核心功能。
 * 重量级模块请通过子路径按需引入：
 * - @ldesign/engine/notifications
 * - @ldesign/engine/dialog  
 * - @ldesign/engine/performance
 * - @ldesign/engine/logging
 * - @ldesign/engine/config
 * - @ldesign/engine/cache
 */

// 核心引擎
export { EngineImpl } from './core/engine'
export { createEngine, createApp, createAndMountApp } from './core/factory'

// 基础管理器（精简导出）
export { createConfigManager } from './config/config-manager'
export { createEventManager, ENGINE_EVENTS } from './events/event-manager'
export { createStateManager } from './state/state-manager'
export { createPluginManager } from './plugins/plugin-manager'
export { createMiddlewareManager } from './middleware/middleware-manager'
export { createDirectiveManager } from './directives/directive-manager'
export { createErrorManager } from './errors/error-manager'
export { createLogger } from './logger/logger'

// 类型导出（不占体积）
export type {
  Engine,
  EngineConfig,
  CreateEngineOptions,
  Plugin,
  PluginContext,
  PluginManager,
  Middleware,
  MiddlewareContext,
  MiddlewareManager,
  EventManager,
  EventMap,
  ConfigManager,
  StateManager,
  DirectiveManager,
  ErrorManager,
  Logger,
  LogLevel,
} from './types'

// 工具函数（精简版）
export {
  isValidObject,
  isString,
  isNumber,
  isBoolean,
  isFunction,
  isArray,
  isPromise,
  safeDeepClone,
  safeMerge,
} from './utils/type-safety'

// Vue集成
export * from './vue'

// 版本信息
export const version = '1.0.0-alpha.1'