/**
 * LDesign QRCode - 主入口文件
 * 导出所有公共API
 */

// 核心类型
export type {
  QRCodeFormat,
  QRCodeErrorCorrectionLevel,
  LogoShape,
  DotStyle,
  CornerStyle,
  GradientType,
  ColorValue,
  ColorStop,
  GradientOptions,
  LogoOptions,
  StyleOptions,
  QRCodeOptions,
  QRCodeResult,
  PerformanceMetric,
  QRCodeError,
  ValidationResult,
  GeneratorConfig,
  QRCodeEvents,
  QRCodeProps,
  UseQRCodeReturn
} from './types'

// 核心生成器
export { QRCodeGenerator, defaultGenerator, createQRCodeGenerator } from './core/generator'
export { LogoProcessor } from './core/logo'
export { StyleProcessor } from './core/styles'

// 工具函数
export {
  DEFAULT_OPTIONS,
  isValidColor,
  validateQRCodeOptions,
  getDefaultOptions,
  mergeOptions,
  calculateActualSize,
  generateCacheKey,
  PerformanceMonitor,
  canvasToDataURL,
  downloadFile,
  createError
} from './utils'

// Vue组件和Hook
export { default as QRCode } from './vue/QRCode.vue'
export {
  useQRCode,
  useQRCodeGenerator,
  useReactiveQRCode,
  useBatchQRCode
} from './vue/useQRCode'

// 便捷函数
export {
  generateQRCode,
  generateQRCodeCanvas,
  generateQRCodeSVG,
  generateQRCodeImage,
  downloadQRCode
} from './helpers'

// 版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version
}
