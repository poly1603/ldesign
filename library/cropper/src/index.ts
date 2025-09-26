/**
 * @ldesign/cropper 主入口文件
 * 
 * 导出所有公共API和类型定义
 */

// ============================================================================
// 核心类导出
// ============================================================================

export { Cropper } from './core/Cropper';
export { ImageLoader } from './core/ImageLoader';
export { CanvasRenderer } from './core/CanvasRenderer';
export { CropAreaManager } from './core/CropAreaManager';
export { TransformManager } from './core/TransformManager';
export { EventManager } from './core/EventManager';
export { ControlPointManager } from './core/ControlPointManager';
export { ConfigManager } from './core/ConfigManager';
export { ThemeManager } from './core/ThemeManager';

// ============================================================================
// UI组件导出
// ============================================================================

export {
  BaseComponent,
  Button,
  Toolbar,
  CropToolbar,
  createButton,
  createToolbar,
  createCropToolbar,
  applyUITheme,
  removeUITheme,
  getCurrentBreakpoint,
  watchBreakpoint,
  DEFAULT_BREAKPOINTS,
  DEFAULT_UI_THEME
} from './ui';

// ============================================================================
// 多框架适配器导出
// ============================================================================

export {
  // Vue 3 适配器
  Vue3Adapter,
  createVue3Adapter,
  vueAdapter,
  useVueCropper,

  // React 适配器
  ReactCropperAdapter,
  createReactAdapter,
  reactAdapter,
  useReactCropper,
  ReactLCropper,

  // Angular 适配器
  AngularCropperAdapter,
  createAngularAdapter,
  angularAdapter,
  LCropperModule,
  LCropperComponent,
  LCropperDirective,
  LCropperService,
  CropDataPipe,

  // 适配器工厂和工具
  CropperAdapterFactory,
  adapterFactory,
  AdapterRegistry,
  globalAdapterRegistry,
  detectFramework,
  createAutoAdapter,
  getAdapter,
  registerAdapter,
  createFrameworkComponent,
  isFrameworkSupported,
  getSupportedFrameworks
} from './adapters';

// ============================================================================
// 类型定义导出
// ============================================================================

export type {
  // 基础几何类型
  Point,
  Size,
  Rect,
  Matrix,
  BoundingBox,

  // 裁剪相关类型
  CropArea,
  CropShape,
  CropMode,

  // 控制点类型
  ControlPoint,
  ControlPointType,
  ControlPointDirection,
  ControlPointStyle,

  // 图片相关类型
  ImageInfo,
  ImageTransform,

  // 配置类型
  CropperConfig,
  RenderConfig,

  // 事件类型
  CropperEvent,
  MouseEventData,
  TouchEventData,
  KeyboardEventData,
  GestureEvent,

  // 导出类型
  ExportOptions,
  ExportResult,

  // 配置和主题类型
  ConfigManagerOptions,
  ThemeManagerOptions,
  ThemeConfig,
  ThemeColors,
  ThemeSpacing
} from './types';

// UI组件类型导出
export type {
  // 基础UI类型
  UIComponent,
  UIEvent,
  UIEventHandler,
  UIEventType,

  // 组件接口
  ButtonComponent,
  PanelComponent,
  ToolbarComponent,
  ToolbarItem,
  SliderComponent,
  InputComponent,
  SelectComponent,
  SelectOption,
  SwitchComponent,
  TooltipComponent,
  ModalComponent,

  // 裁剪器专用组件
  CropToolbarComponent,
  CropTool,
  CropToolGroup,
  ControlPanelComponent,
  ControlPanelConfig,
  ControlItem,
  StatusIndicatorComponent,
  ProgressComponent,

  // 布局类型
  LayoutType,
  LayoutConfig,
  Breakpoint,
  ResponsiveConfig,

  // 主题集成
  UIThemeConfig,
  ComponentTheme,

  // 联合类型
  AnyUIComponent
} from './types/ui';

// 适配器类型导出
export type {
  // 通用适配器类型
  FrameworkType,
  BaseAdapter,
  ComponentAdapter,
  AdapterConfig,
  AdapterFactory,
  AdapterEvent,
  AdapterEventType,
  AdapterEventHandler,
  FrameworkDetection,
  AdapterRegistration,

  // Vue 适配器类型
  VueCropperProps,
  VueCropperEvents,
  VueCropperComposable,
  VueAdapter,

  // React 适配器类型
  ReactCropperProps,
  ReactCropperHook,
  ReactAdapter,

  // Angular 适配器类型
  AngularCropperInputs,
  AngularCropperOutputs,
  AngularCropperService,
  AngularAdapter
} from './types/adapters';

// ============================================================================
// 工具函数导出
// ============================================================================

export {
  // 数学工具
  clamp,
  lerp,
  distance,
  angle,
  rotatePoint,
  scalePoint,
  translatePoint,
  getRectCenter,
  getRectCorners,
  isPointInRect,
  isRectIntersecting,
  getBoundingRect,
  transformPoint,
  transformRect,
  createIdentityMatrix,
  createTranslationMatrix,
  createScaleMatrix,
  createRotationMatrix,
  multiplyMatrix,
  invertMatrix,
  applyMatrixToPoint
} from './utils/math';

export {
  // 验证工具
  isValidPoint,
  isValidSize,
  isValidRect,
  isValidMatrix,
  isValidCropArea,
  isValidImageInfo,
  isValidConfig,
  isString,
  isNumber,
  isBoolean,
  isObject,
  isArray,
  isFunction,
  isHTMLElement,
  isImageElement,
  isCanvasElement,
  isFileInput,
  isValidImageFile,
  isValidUrl
} from './utils/validation';

export {
  // DOM工具
  createElement,
  addClass,
  removeClass,
  hasClass,
  setStyle,
  getStyle,
  getElementSize,
  getElementPosition,
  addEventListener,
  removeEventListener,
  preventDefault,
  stopPropagation,
  getEventPosition,
  isElementVisible,
  scrollIntoView
} from './utils/dom';

export {
  // 图片工具
  loadImageFromUrl,
  loadImageFromFile,
  getImageInfo,
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  convertImageFormat,
  compressImage,
  getImageDataUrl,
  createImageFromDataUrl,
  validateImageFormat,
  calculateImageSize
} from './utils/image';

export {
  // Canvas工具
  createCanvas,
  setCanvasPixelRatio,
  clearCanvas,
  fillCanvasBackground,
  drawImage,
  drawTransformedImage,
  drawRect,
  drawCircle,
  drawEllipse,
  drawMask,
  drawCircularMask,
  drawGrid,
  drawRuleOfThirds,
  drawCenterLines
} from './utils/canvas';

export {
  // 变换工具
  applyTransformToContext,
  createTransformMatrix,
  combineTransforms,
  decomposeTransform,
  normalizeAngle,
  getTransformOrigin,
  calculateBounds,
  optimizeTransform
} from './utils/transform';

export {
  // 事件工具
  normalizeEvent,
  getPointerPosition,
  isMouseEvent,
  isTouchEvent,
  isKeyboardEvent,
  createEventThrottler,
  createEventDebouncer,
  addGlobalEventListener,
  removeGlobalEventListener
} from './utils/event';

export {
  // 性能工具
  globalPerformanceMonitor,
  globalResourceManager
} from './utils/performance';

export {
  // 设备检测工具
  isMobile,
  isTablet,
  isDesktop,
  isTouchDevice,
  getDevicePixelRatio,
  getViewportSize,
  getScreenSize,
  supportsWebGL,
  supportsCanvas,
  supportsFileAPI
} from './utils/device';

export {
  // 颜色工具
  hexToRgb,
  rgbToHex,
  hslToRgb,
  rgbToHsl,
  parseColor,
  formatColor,
  getContrastColor,
  blendColors,
  adjustBrightness,
  adjustSaturation
} from './utils/color';

// ============================================================================
// 默认配置导出
// ============================================================================

export { DEFAULT_CROPPER_CONFIG } from './core/Cropper';
export { DEFAULT_RENDER_CONFIG, DEFAULT_RENDER_STYLE } from './core/CanvasRenderer';
export { DEFAULT_CROP_AREA_CONFIG } from './core/CropAreaManager';
export { DEFAULT_TRANSFORM_CONFIG } from './core/TransformManager';
export { DEFAULT_EVENT_CONFIG } from './core/EventManager';
export { DEFAULT_CONTROL_POINT_CONFIG } from './core/ControlPointManager';

// ============================================================================
// 版本信息
// ============================================================================

export const VERSION = '1.0.0';
export const BUILD_DATE = new Date().toISOString();

// ============================================================================
// 便捷创建函数
// ============================================================================

/**
 * 创建裁剪器实例的便捷函数
 * @param container 容器元素或选择器
 * @param config 配置选项
 * @returns 裁剪器实例
 */
export function createCropper(
  container: string | HTMLElement,
  config?: Partial<CropperConfig>
): Cropper {
  return new Cropper(container, config);
}

/**
 * 检查浏览器兼容性
 * @returns 兼容性检查结果
 */
export function checkCompatibility(): {
  supported: boolean;
  features: {
    canvas: boolean;
    fileAPI: boolean;
    touch: boolean;
    webGL: boolean;
  };
  warnings: string[];
} {
  const features = {
    canvas: supportsCanvas(),
    fileAPI: supportsFileAPI(),
    touch: isTouchDevice(),
    webGL: supportsWebGL()
  };

  const warnings: string[] = [];

  if (!features.canvas) {
    warnings.push('Canvas API not supported');
  }

  if (!features.fileAPI) {
    warnings.push('File API not supported - file upload may not work');
  }

  const supported = features.canvas; // Canvas是必需的

  return {
    supported,
    features,
    warnings
  };
}

/**
 * 获取库信息
 * @returns 库信息
 */
export function getLibraryInfo(): {
  name: string;
  version: string;
  buildDate: string;
  author: string;
  license: string;
  repository: string;
} {
  return {
    name: '@ldesign/cropper',
    version: VERSION,
    buildDate: BUILD_DATE,
    author: 'LDESIGN Team',
    license: 'MIT',
    repository: 'https://github.com/ldesign/cropper'
  };
}
