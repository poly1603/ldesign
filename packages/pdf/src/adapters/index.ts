/**
 * 适配器模块导出
 * 提供跨框架适配支持
 */

// 基础适配器
export * from './base-adapter'

// 框架适配器
export * from './vue-adapter'
export * from './react-adapter'
export * from './vanilla-adapter'

// 适配器工厂
export * from './adapter-factory'

// 类型定义
export * from './types'

// 便捷导出
export {
  createAdapter,
  createAutoAdapter,
  isFrameworkSupported,
  getSupportedFrameworks,
  detectCurrentFramework,
  defaultAdapterFactory
} from './adapter-factory'