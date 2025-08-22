/**
 * LDesign QRCode - 主入口文件
 * 导出所有公共API
 */

// 核心生成器
export { createQRCodeGenerator, defaultGenerator, QRCodeGenerator } from './core/generator'

export { LogoProcessor } from './core/logo'
export { StyleProcessor } from './core/styles'
// 便捷函数
export {
  downloadQRCode,
  generateQRCode,
  generateQRCodeCanvas,
  generateQRCodeImage,
  generateQRCodeSVG,
} from './helpers'

// 核心类型
export type {
  ColorStop,
  ColorValue,
  CornerStyle,
  DotStyle,
  GeneratorConfig,
  GradientOptions,
  GradientType,
  LogoOptions,
  LogoShape,
  PerformanceMetric,
  QRCodeError,
  QRCodeErrorCorrectionLevel,
  QRCodeEvents,
  QRCodeFormat,
  QRCodeOptions,
  QRCodeProps,
  QRCodeResult,
  StyleOptions,
  UseQRCodeReturn,
  ValidationResult,
} from './types'

// 工具函数
export {
  calculateActualSize,
  canvasToDataURL,
  createError,
  DEFAULT_OPTIONS,
  downloadFile,
  generateCacheKey,
  getDefaultOptions,
  isValidColor,
  mergeOptions,
  PerformanceMonitor,
  validateQRCodeOptions,
} from './utils'
// Vue组件和Hook
export { default as QRCode } from './vue/QRCode.vue'

export {
  useBatchQRCode,
  useQRCode,
  useQRCodeGenerator,
  useReactiveQRCode,
} from './vue/useQRCode'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version,
}
