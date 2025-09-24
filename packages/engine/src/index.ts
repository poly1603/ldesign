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
 *
 * @example 按需导入
 * ```typescript
 * // 只导入核心功能
 * import { createEngine } from '@ldesign/engine/core'
 *
 * // 只导入管理器
 * import { createCacheManager } from '@ldesign/engine/managers'
 *
 * // 只导入工具函数
 * import { debounce, throttle } from '@ldesign/engine/utils'
 *
 * // 只导入Vue集成
 * import { useEngine } from '@ldesign/engine/vue'
 * ```
 */

import type { App } from 'vue'
import type { CreateEngineOptions, Engine } from './types'

// 核心功能 - 最常用的导出
export { createEngine, createApp, createAndMountApp } from './core/factory'
export { EngineImpl } from './core/engine'

// 基础管理器 - 最常用的管理器
export { createConfigManager } from './config/config-manager'
export { createEventManager, ENGINE_EVENTS } from './events/event-manager'
export { createLogger } from './logger/logger'

// 常用工具函数
export { debounce, throttle, deepClone, generateId } from './utils/index'

// Vue集成 - 最常用的Vue功能
export { useEngine } from './vue/composables/useEngine'

// 常量
export * from './constants'

// 基础类型导出
export type {
  Engine,
  EngineConfig,
  CreateEngineOptions,
  ConfigManager,
  EventManager,
} from './types'

// 版本信息
export const version = '0.1.0'

export async function install(app: App, options: CreateEngineOptions = {}): Promise<Engine> {
  // 动态导入避免循环依赖
  const { createEngine } = await import('./core/factory')
  const engine = createEngine(options)
  engine.install(app)
  return engine
}
