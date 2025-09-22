/**
 * LDesign QR Code Library - Core Build
 * 核心功能构建版本，不包含框架特定代码
 */

// 核心功能
export { QRCodeGenerator } from './core/generator'
export { LogoProcessor, createLogoProcessor } from './core/logo'
export { StyleProcessor } from './core/styles'
export { createQRCodeInstance } from './core/instance'
export type { QRCodeInstance } from './core/instance'

// 便捷函数
export { downloadQRCode } from './helpers'

// 原生JavaScript API
export {
  generateQRCode,
  SimpleQRCodeGenerator,
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
  getDefaultOptions,
  generateCacheKey,
  createError,
  PerformanceMonitor,
  calculateActualSize,
  validateOptions,
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

// 版本信息
export const version = '1.0.1'

// 默认导出
export default {
  version,
}
