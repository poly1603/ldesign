/**
 * HTTP Engine 集成
 *
 * 这个模块提供了与 LDesign Engine 的完整集成，包括：
 * - Engine 插件
 * - 插件配置选项
 * - 默认插件实例
 */

// 导出插件相关
export {
  createHttpEnginePlugin,
  createHttpEnginePlugin as createHttpPlugin, // 别名导出
  defaultHttpEnginePlugin,
  httpPlugin,
} from './plugin'

// 导出类型定义
export type { HttpEnginePluginOptions } from './plugin'
