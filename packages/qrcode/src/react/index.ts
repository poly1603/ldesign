/**
 * React QR Code Library
 * 导出React相关的组件和Hook
 */

export { QRCode } from './QRCode'
export type { QRCodeProps, QRCodeRef } from './QRCode'

export { useQRCode, useQRCodeSimple } from './useQRCode'
export type { UseQRCodeReturn } from './useQRCode'

// 重新导出核心类型和工具
export type {
  QRCodeOptions,
  QRCodeResult,
  QRCodeError,
  PerformanceMetric,
  LogoOptions,
  StyleOptions,
  ColorOptions,
  GradientColor,
  ColorStop,
} from '../types'

export {
  QRCodeGenerator,
  createQRCodeInstance,
} from '../core'

export {
  isValidColor,
  validateOptions,
  getDefaultOptions,
  generateCacheKey,
  createError,
  PerformanceMonitor,
} from '../utils'
