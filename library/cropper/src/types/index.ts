/**
 * @file 裁剪器类型定义
 * @description 定义裁剪器的所有类型、接口和枚举
 */

// ============================================================================
// 基础类型
// ============================================================================

/**
 * 坐标点
 */
export interface Point {
  x: number
  y: number
}

/**
 * 尺寸
 */
export interface Size {
  width: number
  height: number
}

/**
 * 矩形区域
 */
export interface Rect extends Point, Size {}

/**
 * 边界框
 */
export interface BoundingBox {
  left: number
  top: number
  right: number
  bottom: number
}

// ============================================================================
// 枚举类型
// ============================================================================

/**
 * 裁剪形状
 */
export enum CropShape {
  RECTANGLE = 'rectangle',
  CIRCLE = 'circle',
  ELLIPSE = 'ellipse',
}

/**
 * 图片格式
 */
export enum ImageFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
}

/**
 * 裁剪器事件类型
 */
export enum CropperEventType {
  // 图片相关事件
  IMAGE_LOADED = 'imageLoaded',
  IMAGE_ERROR = 'imageError',
  
  // 裁剪相关事件
  CROP_START = 'cropStart',
  CROP_MOVE = 'cropMove',
  CROP_END = 'cropEnd',
  CROP_CHANGE = 'cropChange',
  
  // 变换相关事件
  ZOOM_CHANGE = 'zoomChange',
  ROTATION_CHANGE = 'rotationChange',
  FLIP_CHANGE = 'flipChange',
  
  // 交互事件
  DRAG_START = 'dragStart',
  DRAG_MOVE = 'dragMove',
  DRAG_END = 'dragEnd',
  
  // 生命周期事件
  READY = 'ready',
  DESTROY = 'destroy',
  RESET = 'reset',
}

/**
 * 拖拽类型
 */
export enum DragType {
  MOVE = 'move',
  RESIZE_N = 'resize-n',
  RESIZE_S = 'resize-s',
  RESIZE_E = 'resize-e',
  RESIZE_W = 'resize-w',
  RESIZE_NE = 'resize-ne',
  RESIZE_NW = 'resize-nw',
  RESIZE_SE = 'resize-se',
  RESIZE_SW = 'resize-sw',
}

/**
 * 预设裁剪比例
 */
export enum AspectRatio {
  FREE = 0,
  SQUARE = 1,
  RATIO_4_3 = 4 / 3,
  RATIO_3_4 = 3 / 4,
  RATIO_16_9 = 16 / 9,
  RATIO_9_16 = 9 / 16,
  RATIO_3_2 = 3 / 2,
  RATIO_2_3 = 2 / 3,
}

// ============================================================================
// 配置接口
// ============================================================================

/**
 * 裁剪器配置选项
 */
export interface CropperOptions {
  /** 容器元素或选择器 */
  container: HTMLElement | string
  
  /** 裁剪形状 */
  shape?: CropShape
  
  /** 宽高比 */
  aspectRatio?: number
  
  /** 初始裁剪区域 */
  initialCrop?: Partial<Rect>
  
  /** 最小裁剪尺寸 */
  minCropSize?: Size
  
  /** 最大裁剪尺寸 */
  maxCropSize?: Size
  
  /** 是否可拖拽移动 */
  movable?: boolean
  
  /** 是否可调整大小 */
  resizable?: boolean
  
  /** 是否可缩放 */
  zoomable?: boolean
  
  /** 是否可旋转 */
  rotatable?: boolean
  
  /** 缩放范围 */
  zoomRange?: [number, number]
  
  /** 背景颜色 */
  backgroundColor?: string
  
  /** 遮罩透明度 */
  maskOpacity?: number
  
  /** 网格线 */
  guides?: boolean
  
  /** 中心线 */
  centerLines?: boolean
  
  /** 响应式 */
  responsive?: boolean
  
  /** 触摸支持 */
  touchEnabled?: boolean
  
  /** 自动裁剪 */
  autoCrop?: boolean
  
  /** 预览配置 */
  preview?: PreviewOptions
  
  /** 事件回调 */
  onReady?: (event: CropperEvent) => void
  onCropStart?: (event: CropperEvent) => void
  onCropMove?: (event: CropperEvent) => void
  onCropEnd?: (event: CropperEvent) => void
  onZoomChange?: (event: CropperEvent) => void
  onRotationChange?: (event: CropperEvent) => void
}

/**
 * 预览配置
 */
export interface PreviewOptions {
  /** 预览容器 */
  container?: HTMLElement | string
  
  /** 预览尺寸 */
  size?: Size
  
  /** 是否实时预览 */
  realtime?: boolean
}

// ============================================================================
// 数据接口
// ============================================================================

/**
 * 裁剪数据
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
  
  /** 是否水平翻转 */
  flipX?: boolean
  
  /** 是否垂直翻转 */
  flipY?: boolean
}

/**
 * 图片信息
 */
export interface ImageInfo {
  /** 原始宽度 */
  naturalWidth: number
  
  /** 原始高度 */
  naturalHeight: number
  
  /** 显示宽度 */
  width: number
  
  /** 显示高度 */
  height: number
  
  /** 宽高比 */
  aspectRatio: number
  
  /** 图片源 */
  src: string
  
  /** 文件大小 */
  size?: number
  
  /** 文件类型 */
  type?: string
}

/**
 * 变换状态
 */
export interface TransformState {
  /** 缩放比例 */
  scale: number
  
  /** 旋转角度 */
  rotation: number
  
  /** 水平翻转 */
  flipX: boolean
  
  /** 垂直翻转 */
  flipY: boolean
  
  /** 平移 */
  translate: Point
}

// ============================================================================
// 事件接口
// ============================================================================

/**
 * 裁剪器事件
 */
export interface CropperEvent {
  /** 事件类型 */
  type: CropperEventType
  
  /** 事件目标 */
  target: any
  
  /** 裁剪数据 */
  cropData?: CropData
  
  /** 图片信息 */
  imageInfo?: ImageInfo
  
  /** 变换状态 */
  transformState?: TransformState
  
  /** 原始事件 */
  originalEvent?: Event
  
  /** 额外数据 */
  [key: string]: any
}

/**
 * 事件监听器
 */
export type EventListener = (event: CropperEvent) => void

/**
 * 事件监听器映射
 */
export type EventListenerMap = {
  [K in CropperEventType]?: EventListener[]
}

// ============================================================================
// 输出接口
// ============================================================================

/**
 * 裁剪输出选项
 */
export interface CropOutputOptions {
  /** 输出格式 */
  format?: ImageFormat
  
  /** 输出质量 (0-1) */
  quality?: number
  
  /** 输出尺寸 */
  size?: Size
  
  /** 是否填充背景 */
  fillBackground?: boolean
  
  /** 背景颜色 */
  backgroundColor?: string
}

/**
 * 兼容性检查结果
 */
export interface CompatibilityResult {
  /** 是否支持 */
  supported: boolean
  
  /** 功能支持情况 */
  features: {
    canvas: boolean
    fileReader: boolean
    blob: boolean
    touch: boolean
    webgl: boolean
  }
  
  /** 错误信息 */
  errors?: string[]
}

// ============================================================================
// 工具类型
// ============================================================================

/**
 * 图片源类型
 */
export type ImageSource = string | File | HTMLImageElement | HTMLCanvasElement

/**
 * 容器类型
 */
export type ContainerElement = HTMLElement | string

/**
 * 可选的裁剪数据
 */
export type PartialCropData = Partial<CropData>

/**
 * 事件处理器映射
 */
export type EventHandlerMap = {
  [K in CropperEventType]?: (event: CropperEvent) => void
}
