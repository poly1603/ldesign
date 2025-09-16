/**
 * @ldesign/cropper - 常量定义
 * 
 * 定义图片裁剪插件的所有常量
 */

import type { CropperConfig, ControlPointStyle, GridConfig, MaskConfig, ToolbarConfig, CropOptions } from '../types';

// ============================================================================
// 基础常量
// ============================================================================

/** 版本号 */
export const VERSION = '0.1.0';

/** 插件名称 */
export const PLUGIN_NAME = '@ldesign/cropper';

/** 最小裁剪尺寸 */
export const MIN_CROP_SIZE = 10;

/** 最大图片尺寸 (50MB) */
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024;

/** 默认渲染帧率 */
export const DEFAULT_FRAME_RATE = 60;

/** 控制点大小 */
export const CONTROL_POINT_SIZE = 8;

/** 控制点触摸区域大小 */
export const CONTROL_POINT_TOUCH_SIZE = 20;

// ============================================================================
// 宽高比预设
// ============================================================================

/** 预设宽高比 */
export const ASPECT_RATIOS = {
  FREE: 'free' as const,
  SQUARE: '1:1' as const,
  LANDSCAPE_4_3: '4:3' as const,
  LANDSCAPE_16_9: '16:9' as const,
  LANDSCAPE_3_2: '3:2' as const,
  PORTRAIT_9_16: '9:16' as const,
  PORTRAIT_3_4: '3:4' as const,
  PORTRAIT_2_3: '2:3' as const
};

/** 宽高比数值映射 */
export const ASPECT_RATIO_VALUES = {
  [ASPECT_RATIOS.SQUARE]: 1,
  [ASPECT_RATIOS.LANDSCAPE_4_3]: 4 / 3,
  [ASPECT_RATIOS.LANDSCAPE_16_9]: 16 / 9,
  [ASPECT_RATIOS.LANDSCAPE_3_2]: 3 / 2,
  [ASPECT_RATIOS.PORTRAIT_9_16]: 9 / 16,
  [ASPECT_RATIOS.PORTRAIT_3_4]: 3 / 4,
  [ASPECT_RATIOS.PORTRAIT_2_3]: 2 / 3
};

// ============================================================================
// 图像格式常量
// ============================================================================

/** 支持的图像格式 */
export const SUPPORTED_IMAGE_FORMATS = ['jpeg', 'jpg', 'png', 'webp', 'gif'] as const;

/** MIME 类型映射 */
export const MIME_TYPE_MAP = {
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif'
} as const;

/** 默认图像质量 */
export const DEFAULT_IMAGE_QUALITY = {
  jpeg: 0.9,
  png: 1.0,
  webp: 0.9,
  gif: 1.0
} as const;

// ============================================================================
// 事件常量
// ============================================================================

/** 事件类型 */
export const EVENTS = {
  IMAGE_LOAD: 'imageLoad',
  IMAGE_ERROR: 'imageError',
  CROP_START: 'cropStart',
  CROP_MOVE: 'cropMove',
  CROP_END: 'cropEnd',
  CROP_CHANGE: 'cropChange',
  TRANSFORM_START: 'transformStart',
  TRANSFORM_MOVE: 'transformMove',
  TRANSFORM_END: 'transformEnd',
  READY: 'ready',
  DESTROY: 'destroy'
} as const;

// ============================================================================
// CSS 类名常量
// ============================================================================

/** CSS 类名前缀 */
export const CSS_PREFIX = 'ldesign-cropper';

/** CSS 类名 */
export const CSS_CLASSES = {
  CONTAINER: `${CSS_PREFIX}`,
  CANVAS: `${CSS_PREFIX}__canvas`,
  OVERLAY: `${CSS_PREFIX}__overlay`,
  CROP_AREA: `${CSS_PREFIX}__crop-area`,
  CONTROL_POINT: `${CSS_PREFIX}__control-point`,
  CONTROL_POINT_NW: `${CSS_PREFIX}__control-point--nw`,
  CONTROL_POINT_N: `${CSS_PREFIX}__control-point--n`,
  CONTROL_POINT_NE: `${CSS_PREFIX}__control-point--ne`,
  CONTROL_POINT_E: `${CSS_PREFIX}__control-point--e`,
  CONTROL_POINT_SE: `${CSS_PREFIX}__control-point--se`,
  CONTROL_POINT_S: `${CSS_PREFIX}__control-point--s`,
  CONTROL_POINT_SW: `${CSS_PREFIX}__control-point--sw`,
  CONTROL_POINT_W: `${CSS_PREFIX}__control-point--w`,
  CONTROL_POINT_ROTATE: `${CSS_PREFIX}__control-point--rotate`,
  GRID: `${CSS_PREFIX}__grid`,
  MASK: `${CSS_PREFIX}__mask`,
  TOOLBAR: `${CSS_PREFIX}__toolbar`,
  LOADING: `${CSS_PREFIX}--loading`,
  ERROR: `${CSS_PREFIX}--error`,
  DRAGGING: `${CSS_PREFIX}--dragging`,
  RESIZING: `${CSS_PREFIX}--resizing`,
  ROTATING: `${CSS_PREFIX}--rotating`
} as const;

// ============================================================================
// 默认配置
// ============================================================================

/** 默认控制点样式 */
export const DEFAULT_CONTROL_POINT_STYLE: ControlPointStyle = {
  size: CONTROL_POINT_SIZE,
  color: '#ffffff',
  borderColor: '#1890ff',
  borderWidth: 2,
  borderRadius: 2
};

/** 默认网格配置 */
export const DEFAULT_GRID_CONFIG: GridConfig = {
  show: true,
  type: 'thirds',
  color: '#ffffff',
  opacity: 0.5,
  lineWidth: 1
};

/** 默认遮罩配置 */
export const DEFAULT_MASK_CONFIG: MaskConfig = {
  show: true,
  color: '#000000',
  opacity: 0.5
};

/** 默认工具栏配置 */
export const DEFAULT_TOOLBAR_CONFIG: ToolbarConfig = {
  show: true,
  position: 'top',
  tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'flip-horizontal', 'flip-vertical', 'reset', 'download'],
  draggable: false
};

/** 默认裁剪选项 */
export const DEFAULT_CROP_OPTIONS: CropOptions = {
  minSize: { width: MIN_CROP_SIZE, height: MIN_CROP_SIZE },
  maintainAspectRatio: false,
  allowedShapes: ['rect'],
  allowRotation: true,
  allowScale: true,
  allowFlip: true
};

/** 默认配置 */
export const DEFAULT_CONFIG: CropperConfig = {
  theme: 'light',
  language: 'zh-CN',
  responsive: true,
  touchSupport: true,
  keyboardSupport: true,
  controlPointStyle: DEFAULT_CONTROL_POINT_STYLE,
  grid: DEFAULT_GRID_CONFIG,
  mask: DEFAULT_MASK_CONFIG,
  toolbar: DEFAULT_TOOLBAR_CONFIG,
  cropOptions: DEFAULT_CROP_OPTIONS,
  performance: {
    maxImageSize: MAX_IMAGE_SIZE,
    frameRate: DEFAULT_FRAME_RATE,
    hardwareAcceleration: true
  }
};

// ============================================================================
// 键盘快捷键
// ============================================================================

/** 键盘快捷键 */
export const KEYBOARD_SHORTCUTS = {
  UNDO: ['ctrl+z', 'cmd+z'],
  REDO: ['ctrl+y', 'cmd+y', 'ctrl+shift+z', 'cmd+shift+z'],
  RESET: ['ctrl+r', 'cmd+r'],
  EXPORT: ['ctrl+s', 'cmd+s'],
  ZOOM_IN: ['ctrl+=', 'cmd+=', 'ctrl+plus', 'cmd+plus'],
  ZOOM_OUT: ['ctrl+-', 'cmd+-', 'ctrl+minus', 'cmd+minus'],
  ZOOM_FIT: ['ctrl+0', 'cmd+0'],
  ROTATE_LEFT: ['ctrl+left', 'cmd+left'],
  ROTATE_RIGHT: ['ctrl+right', 'cmd+right'],
  FLIP_HORIZONTAL: ['ctrl+h', 'cmd+h'],
  FLIP_VERTICAL: ['ctrl+v', 'cmd+v'],
  MOVE_UP: ['up'],
  MOVE_DOWN: ['down'],
  MOVE_LEFT: ['left'],
  MOVE_RIGHT: ['right'],
  ESCAPE: ['escape']
} as const;

// ============================================================================
// 错误消息
// ============================================================================

/** 错误消息 */
export const ERROR_MESSAGES = {
  INVALID_IMAGE_SOURCE: '无效的图像源',
  IMAGE_LOAD_FAILED: '图像加载失败',
  IMAGE_TOO_LARGE: '图像文件过大',
  UNSUPPORTED_FORMAT: '不支持的图像格式',
  CANVAS_NOT_SUPPORTED: '浏览器不支持 Canvas',
  EXPORT_FAILED: '导出失败',
  INVALID_CROP_AREA: '无效的裁剪区域',
  INVALID_ASPECT_RATIO: '无效的宽高比',
  OPERATION_NOT_ALLOWED: '操作不被允许'
} as const;

// ============================================================================
// 性能相关常量
// ============================================================================

/** 性能阈值 */
export const PERFORMANCE_THRESHOLDS = {
  /** 大图片阈值 (10MB) */
  LARGE_IMAGE_SIZE: 10 * 1024 * 1024,
  /** 高分辨率阈值 */
  HIGH_RESOLUTION: 4096,
  /** 最大 Canvas 尺寸 */
  MAX_CANVAS_SIZE: 16384,
  /** 内存使用警告阈值 (100MB) */
  MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024
} as const;

// ============================================================================
// 动画相关常量
// ============================================================================

/** 动画持续时间 */
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500
} as const;

/** 缓动函数 */
export const EASING = {
  LINEAR: 'linear',
  EASE: 'ease',
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out'
} as const;
