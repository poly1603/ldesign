/**
 * @ldesign/captcha - 功能完整的网页验证码插件库
 * 
 * 支持多种验证方式：
 * - 滑动拼图验证
 * - 按顺序点击文字验证
 * - 滑动滑块图片回正验证
 * - 点击验证
 * 
 * @author LDesign Team
 * @license MIT
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

// 工具函数导出（排除适配器相关）
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

// 声明全局类型（如果需要）
declare global {
  interface Window {
    LDesignCaptcha?: typeof import('./index')
  }
}
