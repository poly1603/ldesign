/**
 * @file 主入口文件
 * @description 导出所有公共API
 */

// 核心类
export { Cropper } from './core/Cropper'
export { ImageProcessor } from './core/ImageProcessor'
export { CropBox } from './core/CropBox'
export { InteractionManager } from './core/InteractionManager'

// 类型定义
export type {
  CropperOptions,
  CropData,
  ImageInfo,
  ImageSource,
  TransformState,
  CropOutputOptions,
  CompatibilityResult,
  Size,
  Point,
  Rect,
  BoundingBox,
  PreviewOptions,
  CropperEvent,
  EventListener,
  EventListenerMap,
  EventHandlerMap,
  PartialCropData,
  ContainerElement,
} from './types'

// 枚举
export {
  CropShape,
  ImageFormat,
  CropperEventType,
  DragType,
  AspectRatio,
} from './types'

// 工具函数
export {
  // 数学工具
  degToRad,
  radToDeg,
  clamp,
  distance,
  rotatePoint,
  getRectCenter,
  getRectBounds,
  isPointInRect,
  isPointInCircle,
  fitSize,
  scaleSize,
  getRotatedBounds,
  constrainRect,
  adjustRectByAspectRatio,
  intersectRect,
  rectsIntersect,
  getRectArea,
  normalizeAngle,
  snapToRightAngle,

  // DOM 工具
  getElement,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setStyle,
  getBoundingRect,
  getOffset,
  getSize,
  getPointerPosition,
  getRelativePosition,
  preventDefault,
  addEventListener,
  removeEventListener,
  isTouchSupported,
  isMobile,
  getDevicePixelRatio,
  createCanvas,
  getCanvasContext,
  setupHighDPICanvas,
  downloadFile,
  readFileAsDataURL,
  loadImage,
  isElementInViewport,
  getScrollPosition,
  setTransform,

  // 事件工具
  EventEmitter,
  debounce,
  throttle,
  isMouseEvent,
  isTouchEvent,
  isPointerEvent,
  getEventKeys,
  hasModifierKey,
  createCustomEvent,
  delegate,
  once,
  waitForEvent,
  addEventListeners,
  isEventFromElement,
  getEventPath,
  stopEvent,
  isEventPrevented,
  simulateEvent,

  // 兼容性检查
  checkCompatibility,
  checkCanvasSupport,
  checkFileReaderSupport,
  checkBlobSupport,
  checkTouchSupport,
  checkWebGLSupport,
  checkObjectURLSupport,
  checkAnimationFrameSupport,
  checkTransformSupport,
  checkFilterSupport,
  checkPointerEventsSupport,
  checkIntersectionObserverSupport,
  checkResizeObserverSupport,
  checkPassiveEventSupport,
  getBrowserInfo,
  isMobileDevice,
  isIOSDevice,
  isAndroidDevice,
  getDeviceType,
  getFeatureReport,

  // 图片处理工具
  loadImageSource,
  getImageInfo,
  imageToCanvas,
  resizeImage,
  rotateImage,
  flipImage,
  cropImage,
  canvasToBlob,
  canvasToDataURL,
  getImageFormat,
  isSupportedImageFormat,
  getImageDominantColor,
  getImageBrightness,
  applyImageFilter,
  createThumbnail,
} from './utils'

// 默认导出主类
export default Cropper

// 版本信息
export const VERSION = '1.0.0'

// 兼容性检查
export const isSupported = checkCompatibility().supported

/**
 * 创建裁剪器实例的便捷方法
 */
export function createCropper(options: CropperOptions): Cropper {
  return new Cropper(options)
}

/**
 * 检查浏览器兼容性
 */
export function checkBrowserCompatibility(): CompatibilityResult {
  return checkCompatibility()
}

/**
 * 获取库信息
 */
export function getLibraryInfo(): {
  name: string
  version: string
  author: string
  license: string
  repository: string
} {
  return {
    name: '@ldesign/cropper',
    version: VERSION,
    author: 'LDesign Team',
    license: 'MIT',
    repository: 'https://github.com/ldesign/cropper',
  }
}
