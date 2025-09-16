/**
 * @ldesign/cropper - 核心类型定义
 * 
 * 定义图片裁剪插件的所有核心接口和类型
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/** 坐标点 */
export interface Point {
  x: number;
  y: number;
}

/** 尺寸 */
export interface Size {
  width: number;
  height: number;
}

/** 矩形区域 */
export interface Rect extends Point, Size {}

/** 变换矩阵 */
export interface Transform {
  scaleX: number;
  scaleY: number;
  rotation: number;
  translateX: number;
  translateY: number;
}

// ============================================================================
// 裁剪相关类型
// ============================================================================

/** 裁剪形状类型 */
export type CropShape = 'rect' | 'circle' | 'ellipse' | 'polygon' | 'custom';

/** 宽高比类型 */
export type AspectRatio = number | 'free' | '1:1' | '4:3' | '16:9' | '3:2' | '9:16';

/** 裁剪数据 */
export interface CropData {
  /** 裁剪区域 */
  area: Rect;
  /** 宽高比 */
  aspectRatio: AspectRatio;
  /** 形状 */
  shape: CropShape;
  /** 旋转角度 */
  rotation: number;
  /** 缩放比例 */
  scale: number;
  /** 是否翻转 */
  flip: {
    horizontal: boolean;
    vertical: boolean;
  };
}

/** 裁剪选项 */
export interface CropOptions {
  /** 初始裁剪区域 */
  initialCrop?: Partial<CropData>;
  /** 最小尺寸 */
  minSize?: Size;
  /** 最大尺寸 */
  maxSize?: Size;
  /** 是否保持宽高比 */
  maintainAspectRatio?: boolean;
  /** 允许的形状 */
  allowedShapes?: CropShape[];
  /** 是否允许旋转 */
  allowRotation?: boolean;
  /** 是否允许缩放 */
  allowScale?: boolean;
  /** 是否允许翻转 */
  allowFlip?: boolean;
}

// ============================================================================
// 图像相关类型
// ============================================================================

/** 图像源类型 */
export type ImageSource = string | File | HTMLImageElement | HTMLCanvasElement | ImageData;

/** 图像格式 */
export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'gif';

/** 图像质量设置 */
export interface ImageQuality {
  /** 格式 */
  format: ImageFormat;
  /** 质量 (0-1) */
  quality: number;
  /** DPI */
  dpi?: number;
}

/** 图像元数据 */
export interface ImageMetadata {
  /** 原始尺寸 */
  originalSize: Size;
  /** 文件大小 */
  fileSize: number;
  /** 格式 */
  format: ImageFormat;
  /** EXIF 信息 */
  exif?: Record<string, any>;
  /** 创建时间 */
  createdAt: Date;
}

/** 图像处理选项 */
export interface ImageProcessOptions {
  /** 亮度 (-100 到 100) */
  brightness?: number;
  /** 对比度 (-100 到 100) */
  contrast?: number;
  /** 饱和度 (-100 到 100) */
  saturation?: number;
  /** 色调 (-180 到 180) */
  hue?: number;
  /** 滤镜 */
  filter?: string;
  /** 锐化 */
  sharpen?: number;
  /** 模糊 */
  blur?: number;
}

// ============================================================================
// 导出相关类型
// ============================================================================

/** 导出选项 */
export interface ExportOptions {
  /** 输出尺寸 */
  size?: Size;
  /** 图像质量 */
  quality?: ImageQuality;
  /** 是否保留EXIF */
  preserveExif?: boolean;
  /** 背景色 (透明格式) */
  backgroundColor?: string;
  /** 图像处理选项 */
  imageProcess?: ImageProcessOptions;
}

/** 导出结果 */
export interface ExportResult {
  /** 图像数据 */
  blob: Blob;
  /** 数据URL */
  dataURL: string;
  /** 元数据 */
  metadata: ImageMetadata;
}

// ============================================================================
// 事件相关类型
// ============================================================================

/** 事件类型 */
export type CropperEventType = 
  | 'imageLoad'
  | 'imageError'
  | 'cropStart'
  | 'cropMove'
  | 'cropEnd'
  | 'cropChange'
  | 'transformStart'
  | 'transformMove'
  | 'transformEnd'
  | 'ready'
  | 'destroy';

/** 事件数据 */
export interface CropperEventData {
  /** 事件类型 */
  type: CropperEventType;
  /** 裁剪数据 */
  cropData?: CropData;
  /** 图像元数据 */
  imageMetadata?: ImageMetadata;
  /** 错误信息 */
  error?: Error;
  /** 原始事件 */
  originalEvent?: Event;
}

/** 事件监听器 */
export type CropperEventListener = (data: CropperEventData) => void;

/** 事件映射 */
export interface CropperEventMap {
  imageLoad: CropperEventData;
  imageError: CropperEventData;
  cropStart: CropperEventData;
  cropMove: CropperEventData;
  cropEnd: CropperEventData;
  cropChange: CropperEventData;
  transformStart: CropperEventData;
  transformMove: CropperEventData;
  transformEnd: CropperEventData;
  ready: CropperEventData;
  destroy: CropperEventData;
}

// ============================================================================
// 配置相关类型
// ============================================================================

/** 主题类型 */
export type Theme = 'light' | 'dark' | 'auto';

/** 语言类型 */
export type Language = 'zh-CN' | 'en-US' | 'ja-JP';

/** 控制点样式 */
export interface ControlPointStyle {
  /** 大小 */
  size: number;
  /** 颜色 */
  color: string;
  /** 边框颜色 */
  borderColor: string;
  /** 边框宽度 */
  borderWidth: number;
  /** 圆角 */
  borderRadius: number;
}

/** 网格线配置 */
export interface GridConfig {
  /** 是否显示 */
  show: boolean;
  /** 类型 */
  type: 'thirds' | 'golden' | 'diagonal' | 'custom';
  /** 颜色 */
  color: string;
  /** 透明度 */
  opacity: number;
  /** 线宽 */
  lineWidth: number;
}

/** 遮罩配置 */
export interface MaskConfig {
  /** 是否显示 */
  show: boolean;
  /** 颜色 */
  color: string;
  /** 透明度 */
  opacity: number;
}

/** 工具栏配置 */
export interface ToolbarConfig {
  /** 是否显示 */
  show: boolean;
  /** 位置 */
  position: 'top' | 'bottom' | 'left' | 'right';
  /** 工具列表 */
  tools: string[];
  /** 是否可拖拽 */
  draggable: boolean;
}

/** 裁剪器配置 */
export interface CropperConfig {
  /** 主题 */
  theme: Theme;
  /** 语言 */
  language: Language;
  /** 响应式 */
  responsive: boolean;
  /** 触摸支持 */
  touchSupport: boolean;
  /** 键盘支持 */
  keyboardSupport: boolean;
  /** 控制点样式 */
  controlPointStyle: ControlPointStyle;
  /** 网格配置 */
  grid: GridConfig;
  /** 遮罩配置 */
  mask: MaskConfig;
  /** 工具栏配置 */
  toolbar: ToolbarConfig;
  /** 裁剪选项 */
  cropOptions: CropOptions;
  /** 性能选项 */
  performance: {
    /** 最大图片尺寸 */
    maxImageSize: number;
    /** 渲染帧率 */
    frameRate: number;
    /** 是否启用硬件加速 */
    hardwareAcceleration: boolean;
  };
}

// ============================================================================
// API 相关类型
// ============================================================================

/** 裁剪器 API 接口 */
export interface CropperAPI {
  /** 设置图像源 */
  setImageSource(source: ImageSource): Promise<void>;
  
  /** 获取裁剪数据 */
  getCropData(): CropData;
  
  /** 设置裁剪区域 */
  setCropArea(area: Rect): void;
  
  /** 设置宽高比 */
  setAspectRatio(ratio: AspectRatio): void;
  
  /** 旋转 */
  rotate(angle: number): void;
  
  /** 缩放 */
  scale(factor: number): void;
  
  /** 翻转 */
  flip(horizontal?: boolean, vertical?: boolean): void;
  
  /** 重置 */
  reset(): void;
  
  /** 导出图像 */
  export(options?: ExportOptions): Promise<ExportResult>;
  
  /** 销毁 */
  destroy(): void;
  
  /** 事件监听 */
  on<K extends keyof CropperEventMap>(
    event: K,
    listener: (data: CropperEventMap[K]) => void
  ): void;
  
  /** 移除事件监听 */
  off<K extends keyof CropperEventMap>(
    event: K,
    listener?: (data: CropperEventMap[K]) => void
  ): void;
}
