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

// 渚挎嵎鍑芥暟
export { downloadQRCode } from './helpers'

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

// 新功能模块
export {
  QRDataValidator,
  ValidatorPresets,
  type ValidationResult,
} from './features/validation'

export {
  BatchDownloader,
  batchDownload,
  type BatchDownloadOptions,
  type BatchItem,
} from './features/batch-download'

export {
  ThemeManager,
  themeManager,
  presetThemes,
  applyTheme,
  getTheme,
  registerTheme,
  getAllThemes,
} from './features/themes'

// 高级类型
export type {
  StrictLogoOptions,
  StrictQRCodeOptions,
  ThemeConfig,
  PresetThemes,
  ValidationOptions,
  DownloadOptions,
  BatchGenerateOptions,
  QRCodeElement,
} from './types/advanced'

export {
  TypeSafeConverter,
  RuntimeTypeChecker,
  isCanvasRenderingContext2D,
  isSVGElement,
  isHTMLImageElement,
  isHTMLCanvasElement,
  isQRCodeGenerationSuccess,
  isQRCodeGenerationError,
} from './types/advanced'
// Vue集成
export * from './vue'

// React集成 (需要单独导入)
// export * from './react'

// Angular集成 (需要单独导入)
// export * from './angular'

// 版本信息
// 注意：这里应该从 package.json 动态读取版本，但在构建时会被替换
export const version = '1.0.1'

// 默认导出
export default {
  version,
  generateQRCode,
  QRCodeGenerator,
  detectFramework,
  // 新功能
  QRDataValidator,
  BatchDownloader,
  ThemeManager,
  themeManager,
  presetThemes,
}
