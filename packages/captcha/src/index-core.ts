/**
 * @ldesign/captcha 核心功能入口文件
 * 仅包含核心验证码功能，不包含框架适配器
 */

// 核心类导出
export { BaseCaptcha } from './core/base-captcha'
export { CaptchaManager } from './core/captcha-manager'
export { EventEmitter } from './core/event-emitter'

// 验证码类型导出
export { SlidePuzzleCaptcha } from './captcha/slide-puzzle'
export { ClickTextCaptcha } from './captcha/click-text'
export { RotateSliderCaptcha } from './captcha/rotate-slider'
export { ClickCaptcha } from './captcha/click'

// 工具函数导出
export {
  random,
  clamp,
  normalizeAngle,
  angleDifference,
  degreesToRadians,
  radiansToDegrees,
  isPointInRect,
  isPointInCircle,
  distance,
  createCanvas,
  loadImage,
  getRelativePosition,
  isTouchSupported,
  debounce,
  throttle
} from './utils'

// 主题管理器导出
export { ThemeManager } from './utils/theme-manager'

// 类型定义导出
export * from './types'

// 样式导出（通过CSS文件）
import './styles/index.less'

// 版本信息
export const version = '1.0.0'

// 导入验证码类
import { SlidePuzzleCaptcha } from './captcha/slide-puzzle'
import { ClickTextCaptcha } from './captcha/click-text'
import { RotateSliderCaptcha } from './captcha/rotate-slider'
import { ClickCaptcha } from './captcha/click'
import { CaptchaManager } from './core/captcha-manager'

// 默认导出
export default {
  version,
  SlidePuzzleCaptcha,
  ClickTextCaptcha,
  RotateSliderCaptcha,
  ClickCaptcha,
  CaptchaManager
}
