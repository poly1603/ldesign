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

// 基础管理器 - 最常用的管理器
export { createConfigManager } from './config/config-manager'
// 常量
export * from './constants'

export { EngineImpl } from './core/engine'
// 核心功能 - 最常用的导出
export { createAndMountApp, createApp, createEngine } from './core/factory'
// DevTools 集成
export { createDevToolsIntegration, DevToolsIntegration } from './devtools'

export type { DevToolsInspectorState, DevToolsOptions, DevToolsTimelineEvent } from './devtools'
export { createEventManager, ENGINE_EVENTS } from './events/event-manager'

// 🔥 HMR支持 - 热模块替换
export { createHMRManager, HMRManager } from './hmr/hmr-manager'

export type { HMRModule, HMROptions, HMRUpdateEvent } from './hmr/hmr-manager'

// 日志系统
export {
  createLogger,
  createUnifiedLogger,
  defaultLogger,
  ErrorTrackingPlugin,
  type LogConfig,
  Logger,
  type LogPlugin,
  type LogStats,
  type LogTransport,
  PerformancePlugin,
  SamplingPlugin,
  UnifiedLogger
} from './logger'

// 📊 性能仪表板
export { createPerformanceDashboard, PerformanceDashboard } from './performance/performance-dashboard'
export type { DashboardOptions, PerformanceMetrics } from './performance/performance-dashboard'

// 🛍️ 插件市场
export { createPluginMarketplace, PluginMarketplace } from './plugins/plugin-marketplace'
export type {
  MarketplaceOptions,
  MarketplacePlugin,
  PluginMetadata,
  SearchOptions
} from './plugins/plugin-marketplace'

// 预设配置
export { presets } from './presets'
// 基础类型导出
export type {
  ConfigManager,
  CreateEngineOptions,
  Engine,
  EngineConfig,
  EventManager,
} from './types'

export type { LogEntry, LoggerOptions, LogLevel } from './types/logger'
// 常用工具函数
export { debounce, deepClone, generateId, throttle } from './utils/index'

// Vue集成 - 最常用的Vue功能
export { useEngine } from './vue/composables/useEngine'

// 版本信息
export const version = '0.2.0'

export async function install(app: App, options: CreateEngineOptions = {}): Promise<Engine> {
  // 动态导入避免循环依赖
  const { createEngine } = await import('./core/factory')
  const engine = createEngine(options)
  engine.install(app)
  return engine
}
