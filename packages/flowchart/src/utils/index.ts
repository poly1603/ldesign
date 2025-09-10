/**
 * 工具函数导出文件
 * 统一导出所有工具函数
 */

// 几何计算工具
export {
  distance,
  angle,
  radiansToDegrees,
  degreesToRadians,
  pointToLineDistance,
  pointInRectangle,
  pointInCircle,
  pointInEllipse,
  pointInPolygon,
  getRectangleCenter,
  rectangleIntersection,
  rectanglesIntersect,
  cubicBezierPoint,
  quadraticBezierPoint,
  bezierPoint,
  lineIntersection,
  circleIntersection,
  vectorLength,
  normalizeVector,
  dotProduct,
  crossProduct,
  rotatePoint,
  clampPointToRectangle
} from './geometry.js';

// Canvas工具
export {
  createHighDPICanvas,
  clearCanvas,
  applyStyle,
  drawRoundedRect,
  drawArrow,
  drawDashedLine,
  measureText,
  drawCenteredText,
  drawMultilineText,
  worldToScreen,
  screenToWorld,
  getCanvasCoordinates,
  saveCanvasState,
  restoreCanvasState,
  setCanvasTransform,
  resetCanvasTransform
} from './canvas.js';

// 事件工具
export {
  SimpleEventEmitter,
  debounce,
  throttle,
  getMousePosition,
  getTouchPosition,
  isMobileDevice,
  isTouchSupported,
  preventDefault,
  stopPropagation,
  isKeyboardShortcut,
  createCustomEvent,
  addEventListener,
  removeEventListener,
  delegate,
  waitForEvent
} from './events.js';

// DOM工具
export {
  createElement,
  querySelector,
  querySelectorAll,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setStyle,
  getComputedStyle,
  getBoundingRect,
  isInViewport,
  scrollToElement,
  removeElement,
  clearElement,
  insertHTML,
  createFragment,
  waitForDOMReady,
  getData,
  setData,
  removeData
} from './dom.js';

// 通用工具
export {
  clamp,
  lerp,
  generateId,
  deepClone,
  isEmpty,
  formatNumber,
  toCamelCase,
  toKebabCase,
  delay,
  retry
} from './common.js';
