/**
 * Store Engine 集成模块
 *
 * 提供 Store 与 LDesign Engine 的集成功能
 */

export {
  createStoreEnginePlugin,
  createDefaultStoreEnginePlugin,
  createPerformanceStoreEnginePlugin,
  createDebugStoreEnginePlugin
} from './plugin'

export type {
  StoreEnginePluginOptions,
  EnginePluginContext
} from './plugin'

// 默认导出主要的插件创建函数
export { createStoreEnginePlugin as default } from './plugin'
