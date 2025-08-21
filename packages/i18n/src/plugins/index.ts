/**
 * 插件系统导出
 */

// 通用插件
export { cachePlugin } from './builtin/cache-plugin'
export type { CachePluginConfig } from './builtin/cache-plugin'

export { performancePlugin } from './builtin/performance-plugin'
export type { PerformancePluginConfig } from './builtin/performance-plugin'

// 插件注册表
export {
  createPluginRegistry,
  PluginRegistry,
  PluginStatus,
} from './registry'
export type {
  I18nPlugin,
  PluginEvents,
  PluginInfo,
} from './registry'

// Vue 插件
export * from './vue'

// Engine 插件
export * from './engine'
