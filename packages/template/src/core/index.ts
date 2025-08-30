/**
 * 核心模块导出
 * @ldesign/template 核心功能模块
 */

// 核心类导出
export { TemplateManager, createTemplateManager } from './template-manager'
export { TemplateScanner, createTemplateScanner } from './scanner'
export { TemplateLoader, createTemplateLoader } from './template-loader'
export { DeviceAdapter, createDeviceAdapter } from './device-adapter'

// 类型导出
export type * from '../types'

// 接口导出
export type {
  ScanOptions,
  ScanResult,
} from './scanner'

export type {
  LoadOptions,
} from './template-loader'

export type {
  DeviceInfo,
  DeviceChangeCallback,
} from './device-adapter'
