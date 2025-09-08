/**
 * LDesign QR Code Library
 * 通用的Web端二维码生成库，支持多种前端框架
 */

// 核心功能
export { QRCodeGenerator } from './core/generator'
export { LogoProcessor, createLogoProcessor } from './core/logo'
export { StyleProcessor } from './core/styles'
export { createQRCodeInstance } from './core/instance'
export type { QRCodeInstance } from './core/instance'

// 便捷函数
export { download } from './helpers'

// 原生JavaScript API
export {
  generateQRCode,
  SimpleQRCodeGenerator,
  downloadQRCode,
  generateQRCodeBatch,
} from './vanilla'
export type { SimpleQRCodeOptions } from './vanilla'

// 框架适配器
export {
  detectFramework,
  generateQRCodeAuto,
  createFrameworkFactory,
  getFrameworkBestPractices,
  checkFrameworkCompatibility,
  createCrossFrameworkConfig,
} from './adapters'
export type { FrameworkDetection, AdapterOptions } from './adapters'

// 类型定义
export type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  LogoOptions,
  StyleOptions,
  ColorOptions,
  GradientColor,
  ColorStop,
  PerformanceMetric,
} from './types'

// 工具函数
export {
  isValidColor,
  validateOptions,
  getDefaultOptions,
  generateCacheKey,
  createError,
  PerformanceMonitor,
  calculateActualSize,
} from './utils'
// Vue集成
export * from './vue'

// React集成 (需要单独导入)
// export * from './react'

// Angular集成 (需要单独导入)
// export * from './angular'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version,
  generateQRCode,
  QRCodeGenerator,
  detectFramework,
}
