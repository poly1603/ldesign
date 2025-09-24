/**
 * @ldesign/engine/core - 核心模块
 * 
 * 提供引擎核心功能，包括引擎创建、管理器注册等
 */

// 核心引擎
export { EngineImpl } from './core/engine'
export { createAndMountApp, createApp, createEngine } from './core/factory'

// 基础管理器
export { createConfigManager, ConfigManagerImpl } from './config/config-manager'
export { createEventManager, ENGINE_EVENTS } from './events/event-manager'
export { createLogger } from './logger/logger'

// 类型导出
export type {
  Engine,
  EngineConfig,
  CreateEngineOptions,
  ConfigManager,
  EventManager,
} from './types'
