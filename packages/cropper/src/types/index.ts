/**
 * @file 图片裁剪器类型定义
 * @description 定义图片裁剪器的所有类型接口和枚举
 */

/**
 * 裁剪形状类型
 */
export enum CropShape {
  /** 矩形裁剪 */
  RECTANGLE = 'rectangle',
  /** 圆形裁剪 */
  CIRCLE = 'circle',
  /** 椭圆裁剪 */
  ELLIPSE = 'ellipse',
  /** 圆角矩形裁剪 */
  ROUNDED_RECTANGLE = 'rounded-rectangle',
  /** 三角形裁剪 */
  TRIANGLE = 'triangle',
  /** 菱形裁剪 */
  DIAMOND = 'diamond',
  /** 六边形裁剪 */
  HEXAGON = 'hexagon',
  /** 星形裁剪 */
  STAR = 'star',
  /** 自由形状裁剪 */
  FREEFORM = 'freeform',
}

/**
 * 图片格式类型
 */
export enum ImageFormat {
  /** JPEG 格式 */
  JPEG = 'image/jpeg',
  /** PNG 格式 */
  PNG = 'image/png',
  /** WebP 格式 */
  WEBP = 'image/webp',
  /** BMP 格式 */
  BMP = 'image/bmp',
}

/**
 * 裁剪质量类型
 */
export enum CropQuality {
  /** 低质量 */
  LOW = 0.3,
  /** 中等质量 */
  MEDIUM = 0.7,
  /** 高质量 */
  HIGH = 0.9,
  /** 最高质量 */
  HIGHEST = 1.0,
}

/**
 * 坐标点接口
 */
export interface Point {
  /** X 坐标 */
  x: number
  /** Y 坐标 */
  y: number
}

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
 * 矩形区域接口
 */
export interface Rectangle extends Point, Size { }

/**
 * 裁剪区域接口
 */
export interface CropArea {
  /** 裁剪区域的 X 坐标 */
  x: number
  /** 裁剪区域的 Y 坐标 */
  y: number
  /** 裁剪区域的宽度 */
  width: number
  /** 裁剪区域的高度 */
  height: number
  /** 裁剪形状 */
  shape: CropShape
  /** 旋转角度（度） */
  rotation?: number
  /** 是否水平翻转 */
  flipX?: boolean
  /** 是否垂直翻转 */
  flipY?: boolean
}

/**
 * 变换矩阵接口
 */
export interface Transform {
  /** 缩放比例 */
  scale: number
  /** 旋转角度（弧度） */
  rotation: number
  /** X 轴平移 */
  translateX: number
  /** Y 轴平移 */
  translateY: number
  /** 是否水平翻转 */
  flipX: boolean
  /** 是否垂直翻转 */
  flipY: boolean
}

/**
 * 图片信息接口
 */
export interface ImageInfo {
  /** 图片源 */
  src: string
  /** 原始宽度 */
  naturalWidth: number
  /** 原始高度 */
  naturalHeight: number
  /** 显示宽度 */
  displayWidth: number
  /** 显示高度 */
  displayHeight: number
  /** 图片格式 */
  format: ImageFormat
  /** 文件大小（字节） */
  size?: number
  /** 最后修改时间 */
  lastModified?: number
}

/**
 * 裁剪配置接口
 */
export interface CropperConfig {
  /** 裁剪形状 */
  shape?: CropShape
  /** 初始裁剪区域 */
  initialCrop?: Partial<CropArea>
  /** 最小裁剪尺寸 */
  minSize?: Size
  /** 最大裁剪尺寸 */
  maxSize?: Size
  /** 宽高比限制 */
  aspectRatio?: number
  /** 是否保持宽高比 */
  keepAspectRatio?: boolean
  /** 是否允许调整大小 */
  resizable?: boolean
  /** 是否允许移动 */
  movable?: boolean
  /** 是否允许旋转 */
  rotatable?: boolean
  /** 是否显示网格线 */
  showGrid?: boolean
  /** 网格线数量 */
  gridLines?: number
  /** 是否显示中心线 */
  showCenterLines?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 遮罩透明度 */
  maskOpacity?: number
  /** 是否启用触摸支持 */
  touchEnabled?: boolean
  /** 是否启用鼠标滚轮缩放 */
  wheelZoom?: boolean
  /** 最小缩放比例 */
  minZoom?: number
  /** 最大缩放比例 */
  maxZoom?: number
  /** 缩放步长 */
  zoomStep?: number
}

/**
 * 输出配置接口
 */
export interface OutputConfig {
  /** 输出格式 */
  format?: ImageFormat
  /** 输出质量 */
  quality?: number | CropQuality
  /** 输出宽度 */
  width?: number
  /** 输出高度 */
  height?: number
  /** 是否填充背景 */
  fillBackground?: boolean
  /** 背景颜色 */
  backgroundColor?: string
  /** 是否平滑缩放 */
  smoothScaling?: boolean
}

/**
 * 主题配置接口
 */
export interface ThemeConfig {
  /** 主题名称 */
  name: string
  /** 主色调 */
  primaryColor?: string
  /** 边框颜色 */
  borderColor?: string
  /** 控制点颜色 */
  handleColor?: string
  /** 网格线颜色 */
  gridColor?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 遮罩颜色 */
  maskColor?: string
  /** 文字颜色 */
  textColor?: string
  /** 工具栏背景色 */
  toolbarBackground?: string
  /** 按钮颜色 */
  buttonColor?: string
  /** 按钮悬停颜色 */
  buttonHoverColor?: string
}

/**
 * 国际化配置接口
 */
export interface I18nConfig {
  /** 语言代码 */
  locale: string
  /** 翻译文本 */
  messages: Record<string, string>
}

/**
 * 事件类型枚举
 */
export enum CropperEventType {
  /** 裁剪区域改变 */
  CROP_CHANGE = 'cropChange',
  /** 图片加载开始 */
  IMAGE_LOAD_START = 'imageLoadStart',
  /** 图片加载完成 */
  IMAGE_LOADED = 'imageLoaded',
  /** 图片加载失败 */
  IMAGE_ERROR = 'imageError',
  /** 裁剪器准备就绪 */
  READY = 'ready',
  /** 开始裁剪 */
  CROP_START = 'cropStart',
  /** 裁剪结束 */
  CROP_END = 'cropEnd',
  /** 缩放改变 */
  ZOOM_CHANGE = 'zoomChange',
  /** 旋转改变 */
  ROTATION_CHANGE = 'rotationChange',
  /** 翻转改变 */
  FLIP_CHANGE = 'flipChange',
  /** 重置 */
  RESET = 'reset',
  /** 配置改变 */
  CONFIG_CHANGE = 'configChange',
}

/**
 * 事件数据接口
 */
export interface CropperEventData {
  /** 事件类型 */
  type: CropperEventType
  /** 裁剪区域 */
  cropArea?: CropArea
  /** 变换信息 */
  transform?: Transform
  /** 图片信息 */
  imageInfo?: ImageInfo
  /** 错误信息 */
  error?: Error
  /** 额外数据 */
  data?: any
}

/**
 * 事件监听器类型
 */
export type CropperEventListener = (event: CropperEventData) => void

/**
 * 裁剪器实例接口
 */
export interface CropperInstance {
  /** 设置图片 */
  setImage(src: string | File | HTMLImageElement): Promise<void>
  /** 获取裁剪结果 */
  getCroppedCanvas(config?: OutputConfig): HTMLCanvasElement
  /** 获取裁剪数据 */
  getCropData(): CropArea
  /** 设置裁剪数据 */
  setCropData(cropArea: Partial<CropArea>): void
  /** 缩放 */
  zoom(ratio: number): void
  /** 旋转 */
  rotate(angle: number): void
  /** 翻转 */
  flip(horizontal?: boolean, vertical?: boolean): void
  /** 水平缩放 */
  scaleX(scale: number): void
  /** 垂直缩放 */
  scaleY(scale: number): void
  /** 设置形状 */
  setShape(shape: CropShape): void
  /** 设置宽高比 */
  setAspectRatio(aspectRatio: number | null): void
  /** 重置 */
  reset(): void
  /** 销毁 */
  destroy(): void
  /** 添加事件监听器 */
  on(event: CropperEventType, listener: CropperEventListener): void
  /** 移除事件监听器 */
  off(event: CropperEventType, listener: CropperEventListener): void
  /** 触发事件 */
  emit(event: CropperEventType, data?: any): void
}

/**
 * 工具栏配置接口
 */
/**
 * 工具栏工具类型
 */
export type ToolbarTool =
  | 'zoom-in'
  | 'zoom-out'
  | 'rotate-left'
  | 'rotate-right'
  | 'flip-horizontal'
  | 'flip-vertical'
  | 'reset'
  | 'crop'
  | 'shape-selector'
  | 'aspect-ratio'
  | 'mask-opacity'
  | 'export-format'
  | 'download'
  | 'move-up'
  | 'move-down'
  | 'move-left'
  | 'move-right'
  | 'move-up-left'
  | 'move-up-right'
  | 'move-down-left'
  | 'move-down-right'
  | 'filter-selector'
  | 'crop-style-selector'
  | 'background-selector'

export interface ToolbarConfig {
  /** 是否显示工具栏 */
  show?: boolean
  /** 工具栏位置 */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** 显示的工具按钮 */
  tools?: ToolbarTool[]
  /** 自定义样式类名 */
  className?: string
  /** 主题色 */
  theme?: 'light' | 'dark'
  /** 自定义工具按钮 */
  customTools?: Array<{
    name: string
    icon: string
    tooltip: string
    action: () => void
  }>
}

/**
 * 完整的裁剪器选项接口
 */
export interface CropperOptions extends CropperConfig {
  /** 容器元素 */
  container: HTMLElement | string
  /** 主题配置 */
  theme?: ThemeConfig
  /** 国际化配置 */
  i18n?: I18nConfig
  /** 工具栏配置 */
  toolbar?: ToolbarConfig
  /** 是否启用调试模式 */
  debug?: boolean
  /** 性能配置 */
  performance?: {
    /** 是否启用硬件加速 */
    hardwareAcceleration?: boolean
    /** 渲染帧率限制 */
    maxFPS?: number
    /** 内存限制（MB） */
    memoryLimit?: number
  }
}
