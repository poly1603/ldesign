/**
 * @ldesign/engine/core - 核心模块
 *
 * 提供引擎核心功能，不包含 Vue 集成。
 * 适用于需要轻量级引擎或非 Vue 环境的场景。
 *
 * @example
 * ```typescript
 * import { createEngine } from '@ldesign/engine/core'
 *
 * const engine = createEngine({
 *   config: { app: { name: 'My App' } }
 * })
 * ```
 */

// 核心引擎
export { EngineImpl } from './core/engine'
export { createAndMountApp, createApp, createEngine } from './core/factory'

// 基础管理器
export { ConfigManagerImpl, createConfigManager } from './config/config-manager'
export { createEventManager, ENGINE_EVENTS } from './events/event-manager'
export { createLogger } from './logger/logger'
export { createStateManager } from './state/state-manager'
export { createErrorManager } from './errors/error-manager'
export { createMiddlewareManager } from './middleware/middleware-manager'
export { createPluginManager } from './plugins/plugin-manager'

// 核心类型导出
export type {
  ConfigManager,
  CreateEngineOptions,
  Engine,
  EngineConfig,
  EventManager,
  Logger,
  LogLevel,
  StateManager,
  ErrorManager,
  MiddlewareManager,
  PluginManager,
  Plugin,
  PluginContext,
  Middleware,
  MiddlewareContext,
} from './types'

// 版本信息
export const version = '0.1.0'
