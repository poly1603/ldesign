/**
 * 插件系统导出
 */

// 导出内置插件
export { cachePlugin } from './builtin/cache-plugin'

// 导出插件配置类型
export type { CachePluginConfig } from './builtin/cache-plugin'

export { performancePlugin } from './builtin/performance-plugin'
export type { PerformancePluginConfig } from './builtin/performance-plugin'

// 导出插件注册表
export {
  createPluginRegistry,
  PluginRegistry,
  PluginStatus,
} from './registry'
// 导出插件类型
export type {
  I18nPlugin,
  PluginEvents,
  PluginInfo,
} from './registry'
