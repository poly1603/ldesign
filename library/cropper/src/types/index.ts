/**
 * @file 核心类型定义
 * @description 定义图片裁剪器的所有核心类型、接口和枚举
 */

// ==================== 枚举定义 ====================

/**
 * 裁剪形状枚举
 */
export enum CropShape {
  /** 矩形 */
  RECTANGLE = 'rectangle',
  /** 圆形 */
  CIRCLE = 'circle',
  /** 椭圆 */
  ELLIPSE = 'ellipse',
  /** 多边形 */
  POLYGON = 'polygon',
  /** 自定义路径 */
  CUSTOM = 'custom'
}

/**
 * 图片格式枚举
 */
export enum ImageFormat {
  /** PNG格式 */
  PNG = 'image/png',
  /** JPEG格式 */
  JPEG = 'image/jpeg',
  /** WebP格式 */
  WEBP = 'image/webp',
  /** GIF格式 */
  GIF = 'image/gif',
  /** BMP格式 */
  BMP = 'image/bmp'
}

/**
 * 事件类型枚举
 */
export enum CropperEventType {
  /** 裁剪器就绪 */
  READY = 'ready',
  /** 图片加载完成 */
  IMAGE_LOADED = 'imageLoaded',
  /** 图片加载失败 */
  IMAGE_ERROR = 'imageError',
  /** 开始裁剪 */
  CROP_START = 'cropStart',
  /** 裁剪中 */
  CROP_MOVE = 'cropMove',
  /** 裁剪结束 */
  CROP_END = 'cropEnd',
  /** 裁剪区域变化 */
  CROP_CHANGE = 'cropChange',
  /** 缩放变化 */
  ZOOM_CHANGE = 'zoomChange',
  /** 旋转变化 */
  ROTATION_CHANGE = 'rotationChange',
  /** 翻转变化 */
  FLIP_CHANGE = 'flipChange',
  /** 重置 */
  RESET = 'reset',
  /** 销毁 */
  DESTROY = 'destroy'
}

/**
 * 主题类型枚举
 */
export enum ThemeType {
  /** 浅色主题 */
  LIGHT = 'light',
  /** 深色主题 */
  DARK = 'dark',
  /** 自动主题 */
  AUTO = 'auto'
}

/**
 * 工具栏位置枚举
 */
export enum ToolbarPosition {
  /** 顶部 */
  TOP = 'top',
  /** 底部 */
  BOTTOM = 'bottom',
  /** 左侧 */
  LEFT = 'left',
  /** 右侧 */
  RIGHT = 'right'
}

// ==================== 基础类型定义 ====================

/**
 * 尺寸接口
 */
export interface Size {
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
}

/**
 * 基础点坐标接口
 */
export interface Position {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
}

/**
 * 点坐标接口（别名）
 */
export interface Point extends Position {}

/**
 * 矩形区域接口
 */
export interface Rectangle extends Position, Size {}

/**
 * 矩形区域接口（别名）
 */
export interface Rect extends Rectangle {}

/**
 * 变换矩阵接口
 */
export interface Transform {
  /** 缩放X */
  scaleX: number
  /** 缩放Y */
  scaleY: number
  /** 旋转角度 */
  rotation: number
  /** 平移X */
  translateX: number
  /** 平移Y */
  translateY: number
  /** 倾斜X */
  skewX?: number
  /** 倾斜Y */
  skewY?: number
}

/**
 * 边界框接口
 */
export interface BoundingBox {
  /** 左边界 */
  left: number
  /** 上边界 */
  top: number
  /** 右边界 */
  right: number
  /** 下边界 */
  bottom: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
}

/**
 * 宽高比类型
 */
export type AspectRatio = number | 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '9:16'

/**
 * 颜色类型
 */
export type Color = string

/**
 * 图片源类型
 */
export type ImageSource = string | File | HTMLImageElement | HTMLCanvasElement | ImageData

// ==================== 裁剪相关接口 ====================

/**
 * 裁剪数据接口
 */
export interface CropData {
  /** X坐标 */
  x: number
  /** Y坐标 */
  y: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
  /** 裁剪形状 */
  shape: CropShape
  /** 旋转角度 */
  rotation?: number
  /** 缩放比例 */
  scale?: number
  /** 水平翻转 */
  flipX?: boolean
  /** 垂直翻转 */
  flipY?: boolean
}

/**
 * 导出选项接口
 */
export interface ExportOptions {
  /** 图片格式 */
  format?: ImageFormat
  /** 图片质量 (0-1) */
  quality?: number
  /** 输出宽度 */
  width?: number
  /** 输出高度 */
  height?: number
  /** 背景颜色 */
  backgroundColor?: Color
  /** 是否保持透明度 */
  preserveTransparency?: boolean
}

/**
 * 多边形配置接口
 */
export interface PolygonConfig {
  /** 边数 */
  sides: number
  /** 起始角度 */
  startAngle?: number
}

/**
 * 自定义路径配置接口
 */
export interface CustomPathConfig {
  /** SVG路径字符串 */
  path: string
  /** 路径宽度 */
  width?: number
  /** 路径高度 */
  height?: number
}

// ==================== 配置接口 ====================

/**
 * 键盘快捷键配置接口
 */
export interface KeyboardConfig {
  /** 是否启用键盘快捷键 */
  enabled: boolean
  /** 快捷键映射 */
  shortcuts: Record<string, string>
}

/**
 * 触摸配置接口
 */
export interface TouchConfig {
  /** 是否启用触摸支持 */
  enabled: boolean
  /** 双指缩放 */
  pinchToZoom: boolean
  /** 双击适应 */
  doubleTapToFit: boolean
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled: boolean
  /** 动画持续时间 */
  duration: number
  /** 缓动函数 */
  easing: string
}

/**
 * 工具栏配置接口
 */
export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show: boolean
  /** 工具栏位置 */
  position: ToolbarPosition
  /** 工具列表 */
  tools: string[]
}

/**
 * 主配置接口
 */
export interface CropperConfig {
  /** 主题 */
  theme?: ThemeType
  /** 是否响应式 */
  responsive?: boolean
  /** 宽高比 */
  aspectRatio?: AspectRatio
  /** 最小裁剪尺寸 */
  minCropSize?: Size
  /** 最大裁剪尺寸 */
  maxCropSize?: Size
  /** 裁剪形状 */
  shape?: CropShape
  /** 是否显示网格 */
  showGrid?: boolean
  /** 网格线数量 */
  gridLines?: number
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  /** 键盘配置 */
  keyboard?: KeyboardConfig
  /** 触摸配置 */
  touch?: TouchConfig
  /** 动画配置 */
  animation?: AnimationConfig
  /** 多边形配置 */
  polygon?: PolygonConfig
  /** 自定义路径配置 */
  customPath?: CustomPathConfig
}

// ==================== 事件相关接口 ====================

/**
 * 事件监听器类型
 */
export type EventListener<T = any> = (event: CropperEvent<T>) => void

/**
 * 事件接口
 */
export interface CropperEvent<T = any> {
  /** 事件类型 */
  type: CropperEventType
  /** 事件数据 */
  data?: T
  /** 时间戳 */
  timestamp: number
  /** 是否可取消 */
  cancelable?: boolean
  /** 是否已取消 */
  cancelled?: boolean
}

// ==================== 构造函数选项 ====================

/**
 * Cropper构造函数选项
 */
export interface CropperOptions extends CropperConfig {
  /** 容器元素或选择器 */
  container: HTMLElement | string
}

// ==================== 兼容性检查结果 ====================

/**
 * 功能支持检查结果
 */
export interface FeatureSupport {
  /** Canvas支持 */
  canvas: boolean
  /** FileReader支持 */
  fileReader: boolean
  /** Blob支持 */
  blob: boolean
  /** 触摸支持 */
  touch: boolean
  /** ResizeObserver支持 */
  resizeObserver: boolean
  /** IntersectionObserver支持 */
  intersectionObserver: boolean
}

/**
 * 兼容性检查结果
 */
export interface CompatibilityResult {
  /** 是否支持 */
  supported: boolean
  /** 功能支持详情 */
  features: FeatureSupport
  /** 不支持的原因 */
  reasons?: string[]
}
