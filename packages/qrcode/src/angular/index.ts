/**
 * Angular QR Code Library
 * 导出Angular相关的组件、服务和模块
 */

export { QRCodeComponent } from './qrcode.component'
export { QRCodeService, createQRCodeService } from './qrcode.service'
export { QRCodeModule } from './qrcode.module'

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
