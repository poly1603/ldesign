/**
 * 适配器模块导出
 * 提供跨框架适配支持
 */

// 适配器工厂
export * from './adapter-factory'

// 便捷导出
export {
  createAdapter,
  createAutoAdapter,
  defaultAdapterFactory,
  detectCurrentFramework,
  getSupportedFrameworks,
  isFrameworkSupported,
} from './adapter-factory'
// 基础适配器
export * from './base-adapter'
export * from './react-adapter'

// 类型定义
export * from './types'

export * from './vanilla-adapter'

// 框架适配器
export * from './vue-adapter'
