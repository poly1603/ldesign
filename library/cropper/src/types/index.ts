/**
 * @ldesign/cropper 核心类型定义
 * 
 * 提供完整的TypeScript类型定义，确保类型安全和良好的开发体验
 */

// ============================================================================
// 基础类型定义
// ============================================================================

/**
 * 坐标点接口
 * 表示二维平面上的一个点
 */
export interface Point {
  /** X坐标 */
  x: number;
  /** Y坐标 */
  y: number;
}

/**
 * 尺寸接口
 * 表示宽度和高度
 */
export interface Size {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 矩形区域接口
 * 表示一个矩形区域的位置和尺寸
 */
export interface Rect extends Point, Size { }

/**
 * 边界框接口
 * 表示一个边界框的四个边界值
 */
export interface BoundingBox {
  /** 左边界 */
  left: number;
  /** 上边界 */
  top: number;
  /** 右边界 */
  right: number;
  /** 下边界 */
  bottom: number;
}

/**
 * 变换矩阵接口
 * 表示2D变换矩阵的六个参数
 */
export interface Matrix {
  /** 水平缩放 */
  a: number;
  /** 水平倾斜 */
  b: number;
  /** 垂直倾斜 */
  c: number;
  /** 垂直缩放 */
  d: number;
  /** 水平平移 */
  e: number;
  /** 垂直平移 */
  f: number;
}

// ============================================================================
// 裁剪相关类型
// ============================================================================

/**
 * 裁剪形状类型
 * 支持的裁剪区域形状
 */
export type CropShape = 'rectangle' | 'circle' | 'ellipse' | 'polygon';

/**
 * 裁剪模式类型
 * 不同的裁剪交互模式
 */
export type CropMode = 'crop' | 'move' | 'resize' | 'rotate';

/**
 * 控制点类型
 */
export type ControlPointType = 'resize' | 'rotation' | 'center';

/**
 * 控制点方向
 */
export type ControlPointDirection = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotation' | 'center';

/**
 * 控制点位置类型（保持向后兼容）
 * 8个方向的控制点位置
 */
export type ControlPointPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'
  | 'rotate';

/**
 * 裁剪区域接口
 * 定义裁剪区域的基本属性
 */
export interface CropArea {
  /** 裁剪形状 */
  shape: CropShape;
  /** 区域位置和尺寸 */
  rect: Rect;
  /** 旋转角度（弧度） */
  rotation: number;
  /** 是否可见 */
  visible: boolean;
  /** 是否可编辑 */
  editable: boolean;
  /** 最小尺寸 */
  minSize?: Size;
  /** 最大尺寸 */
  maxSize?: Size;
  /** 宽高比约束 */
  aspectRatio?: number;
}

/**
 * 控制点接口
 * 定义控制点的属性和行为
 */
export interface ControlPoint {
  /** 控制点ID */
  id: string;
  /** 控制点类型 */
  type: ControlPointType;
  /** 控制点坐标 */
  position: Point;
  /** 控制点方向 */
  direction: ControlPointDirection;
  /** 控制点索引 */
  index: number;
  /** 是否可见 */
  visible: boolean;
  /** 是否可交互 */
  interactive: boolean;
}

/**
 * 控制点样式接口
 */
export interface ControlPointStyle {
  /** 控制点大小 */
  size: number;
  /** 控制点颜色 */
  color: string;
  /** 边框颜色 */
  borderColor: string;
  /** 边框宽度 */
  borderWidth: number;
  /** 鼠标样式 */
  cursor: string;
  /** 层级 */
  zIndex: number;
}

// ============================================================================
// 图片相关类型
// ============================================================================

/**
 * 图片源类型
 * 支持的图片输入源
 */
export type ImageSource = string | File | HTMLImageElement | HTMLCanvasElement | ImageData;

/**
 * 图片格式类型
 * 支持的图片输出格式
 */
export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp';

/**
 * 图片信息接口
 * 包含图片的基本信息
 */
export interface ImageInfo {
  /** 图片源 */
  source: ImageSource;
  /** 原始宽度 */
  naturalWidth: number;
  /** 原始高度 */
  naturalHeight: number;
  /** 显示宽度 */
  displayWidth: number;
  /** 显示高度 */
  displayHeight: number;
  /** 图片格式 */
  format?: string;
  /** 文件大小（字节） */
  size?: number;
}

/**
 * 图片变换接口
 * 定义图片的变换状态
 */
export interface ImageTransform {
  /** 缩放比例 */
  scale: number;
  /** 旋转角度（弧度） */
  rotation: number;
  /** 水平平移 */
  translateX: number;
  /** 垂直平移 */
  translateY: number;
  /** 水平翻转 */
  flipX: boolean;
  /** 垂直翻转 */
  flipY: boolean;
}

// ============================================================================
// 配置相关类型
// ============================================================================

/**
 * 主题类型
 * 支持的主题模式
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * 语言类型
 * 支持的语言
 */
export type Language = 'zh-CN' | 'en-US';

/**
 * 设备类型
 * 不同的设备类型
 */
export type DeviceType = 'desktop' | 'tablet' | 'mobile';

/**
 * 裁剪器配置接口
 * 主要的配置选项
 */
export interface CropperConfig {
  /** 容器元素或选择器 */
  container: string | HTMLElement;
  /** 图片源 */
  src?: ImageSource;
  /** 初始裁剪区域 */
  initialCrop?: Partial<CropArea>;
  /** 裁剪形状 */
  shape?: CropShape;
  /** 宽高比约束 */
  aspectRatio?: number;
  /** 最小裁剪尺寸 */
  minCropSize?: Size;
  /** 最大裁剪尺寸 */
  maxCropSize?: Size;
  /** 是否显示网格线 */
  showGrid?: boolean;
  /** 是否显示控制点 */
  showControls?: boolean;
  /** 是否可缩放 */
  zoomable?: boolean;
  /** 是否可旋转 */
  rotatable?: boolean;
  /** 是否可移动 */
  movable?: boolean;
  /** 最小缩放比例 */
  minZoom?: number;
  /** 最大缩放比例 */
  maxZoom?: number;
  /** 主题 */
  theme?: Theme;
  /** 语言 */
  language?: Language;
  /** 是否响应式 */
  responsive?: boolean;
  /** 是否启用触摸支持 */
  touchEnabled?: boolean;
  /** 输出质量 (0-1) */
  quality?: number;
  /** 输出格式 */
  format?: ImageFormat;
  /** 背景颜色 */
  backgroundColor?: string;
}

/**
 * 渲染配置接口
 * Canvas渲染相关配置
 */
export interface RenderConfig {
  /** 设备像素比 */
  pixelRatio?: number;
  /** 是否启用硬件加速 */
  hardwareAcceleration?: boolean;
  /** 渲染质量 */
  quality?: 'low' | 'medium' | 'high';
  /** 是否启用抗锯齿 */
  antialiasing?: boolean;
  /** 最大纹理尺寸 */
  maxTextureSize?: number;
}

// ============================================================================
// 事件相关类型
// ============================================================================

/**
 * 事件类型枚举
 * 所有支持的事件类型
 */
export type EventType =
  | 'ready'           // 裁剪器准备就绪
  | 'imageLoad'       // 图片加载完成
  | 'imageError'      // 图片加载错误
  | 'cropStart'       // 开始裁剪
  | 'cropMove'        // 裁剪区域移动
  | 'cropEnd'         // 裁剪结束
  | 'zoom'            // 缩放
  | 'rotate'          // 旋转
  | 'flip'            // 翻转
  | 'reset'           // 重置
  | 'destroy'         // 销毁
  | 'error';          // 错误

/**
 * 事件数据接口
 * 事件回调函数的参数
 */
export interface EventData {
  /** 事件类型 */
  type: EventType;
  /** 事件目标 */
  target: any;
  /** 事件时间戳 */
  timestamp: number;
  /** 事件数据 */
  data?: any;
  /** 原始事件 */
  originalEvent?: Event;
}

/**
 * 事件监听器类型
 * 事件回调函数的类型定义
 */
export type EventListener = (event: EventData) => void;

/**
 * 事件监听器映射
 * 事件类型到监听器的映射
 */
export type EventListenerMap = {
  [K in EventType]?: EventListener[];
};

// ============================================================================
// 插件相关类型
// ============================================================================

/**
 * 插件接口
 * 定义插件的基本结构
 */
export interface Plugin {
  /** 插件名称 */
  name: string;
  /** 插件版本 */
  version: string;
  /** 插件描述 */
  description?: string;
  /** 插件初始化方法 */
  install: (cropper: any, options?: any) => void;
  /** 插件卸载方法 */
  uninstall?: (cropper: any) => void;
  /** 插件依赖 */
  dependencies?: string[];
}

/**
 * 插件选项接口
 * 插件的配置选项
 */
export interface PluginOptions {
  /** 插件配置 */
  [key: string]: any;
}

/**
 * 插件管理器接口
 * 管理插件的注册、安装和卸载
 */
export interface PluginManager {
  /** 注册插件 */
  register(plugin: Plugin): void;
  /** 安装插件 */
  install(name: string, options?: PluginOptions): void;
  /** 卸载插件 */
  uninstall(name: string): void;
  /** 获取已安装的插件列表 */
  getInstalled(): string[];
  /** 检查插件是否已安装 */
  isInstalled(name: string): boolean;
}

/**
 * 导出选项接口
 */
export interface ExportOptions {
  /** 导出格式 */
  format: 'png' | 'jpeg' | 'webp';
  /** 导出质量 (0-1) */
  quality: number;
  /** 导出宽度 */
  width?: number;
  /** 导出高度 */
  height?: number;
  /** 背景颜色 */
  background?: string;
}

/**
 * 导出结果接口
 */
export interface ExportResult {
  /** 导出的数据URL */
  dataURL: string;
  /** 导出的Blob */
  blob: Blob;
  /** 导出的尺寸 */
  size: Size;
  /** 导出格式 */
  format: string;
  /** 文件大小（字节） */
  fileSize: number;
}

// ============================================================================
// 导出所有类型
// ============================================================================

export * from './events';
export * from './config';
export * from './plugins';
export * from './theme';
