/**
 * @ldesign/cropper 配置系统类型定义
 * 
 * 定义完整的配置选项，支持丰富的自定义配置
 */

import type { 
  Point, 
  Size, 
  CropShape, 
  ImageFormat, 
  Theme, 
  Language,
  DeviceType,
  GestureConfig 
} from './index';

// ============================================================================
// 基础配置类型
// ============================================================================

/**
 * 颜色配置接口
 * 定义各种颜色选项
 */
export interface ColorConfig {
  /** 主色调 */
  primary: string;
  /** 次要色调 */
  secondary: string;
  /** 成功色 */
  success: string;
  /** 警告色 */
  warning: string;
  /** 错误色 */
  error: string;
  /** 背景色 */
  background: string;
  /** 前景色 */
  foreground: string;
  /** 边框色 */
  border: string;
  /** 遮罩色 */
  overlay: string;
  /** 网格线颜色 */
  grid: string;
  /** 控制点颜色 */
  controlPoint: string;
  /** 控制点激活颜色 */
  controlPointActive: string;
}

/**
 * 尺寸配置接口
 * 定义各种尺寸选项
 */
export interface SizeConfig {
  /** 控制点大小 */
  controlPointSize: number;
  /** 控制点边框宽度 */
  controlPointBorder: number;
  /** 边框宽度 */
  borderWidth: number;
  /** 网格线宽度 */
  gridLineWidth: number;
  /** 工具栏高度 */
  toolbarHeight: number;
  /** 最小容器尺寸 */
  minContainerSize: Size;
}

/**
 * 动画配置接口
 * 定义动画相关选项
 */
export interface AnimationConfig {
  /** 是否启用动画 */
  enabled: boolean;
  /** 动画持续时间（毫秒） */
  duration: number;
  /** 动画缓动函数 */
  easing: string;
  /** 缩放动画配置 */
  zoom: {
    duration: number;
    easing: string;
  };
  /** 旋转动画配置 */
  rotation: {
    duration: number;
    easing: string;
  };
  /** 裁剪区域动画配置 */
  crop: {
    duration: number;
    easing: string;
  };
}

// ============================================================================
// 裁剪配置
// ============================================================================

/**
 * 裁剪约束配置
 * 定义裁剪操作的约束条件
 */
export interface CropConstraints {
  /** 最小裁剪尺寸 */
  minSize?: Size;
  /** 最大裁剪尺寸 */
  maxSize?: Size;
  /** 宽高比约束 */
  aspectRatio?: number;
  /** 是否保持宽高比 */
  maintainAspectRatio?: boolean;
  /** 是否限制在图片边界内 */
  restrictToImage?: boolean;
  /** 边界内边距 */
  boundaryPadding?: number;
}

/**
 * 裁剪行为配置
 * 定义裁剪操作的行为
 */
export interface CropBehavior {
  /** 是否可移动 */
  movable: boolean;
  /** 是否可调整大小 */
  resizable: boolean;
  /** 是否可旋转 */
  rotatable: boolean;
  /** 是否显示控制点 */
  showControls: boolean;
  /** 是否显示网格线 */
  showGrid: boolean;
  /** 是否显示中心线 */
  showCenterLines: boolean;
  /** 是否显示尺寸信息 */
  showDimensions: boolean;
  /** 网格线数量 */
  gridLines: number;
  /** 是否启用磁性吸附 */
  magneticSnap: boolean;
  /** 吸附距离 */
  snapDistance: number;
}

/**
 * 裁剪预设配置
 * 预定义的裁剪配置
 */
export interface CropPreset {
  /** 预设名称 */
  name: string;
  /** 预设描述 */
  description?: string;
  /** 裁剪形状 */
  shape: CropShape;
  /** 宽高比 */
  aspectRatio?: number;
  /** 初始尺寸 */
  initialSize?: Size;
  /** 约束条件 */
  constraints?: CropConstraints;
  /** 行为配置 */
  behavior?: Partial<CropBehavior>;
}

// ============================================================================
// 图片配置
// ============================================================================

/**
 * 图片加载配置
 * 图片加载相关选项
 */
export interface ImageLoadConfig {
  /** 是否启用跨域 */
  crossOrigin?: 'anonymous' | 'use-credentials';
  /** 加载超时时间（毫秒） */
  timeout: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试间隔（毫秒） */
  retryInterval: number;
  /** 是否启用缓存 */
  cache: boolean;
  /** 支持的图片格式 */
  supportedFormats: string[];
  /** 最大文件大小（字节） */
  maxFileSize: number;
}

/**
 * 图片处理配置
 * 图片处理相关选项
 */
export interface ImageProcessConfig {
  /** 是否启用图片压缩 */
  compression: boolean;
  /** 压缩质量 (0-1) */
  compressionQuality: number;
  /** 最大图片尺寸 */
  maxImageSize: Size;
  /** 是否启用图片优化 */
  optimization: boolean;
  /** 是否保留EXIF信息 */
  preserveExif: boolean;
  /** 背景颜色（透明图片） */
  backgroundColor: string;
}

/**
 * 图片变换配置
 * 图片变换相关选项
 */
export interface ImageTransformConfig {
  /** 最小缩放比例 */
  minZoom: number;
  /** 最大缩放比例 */
  maxZoom: number;
  /** 缩放步长 */
  zoomStep: number;
  /** 旋转步长（度） */
  rotationStep: number;
  /** 是否启用平滑缩放 */
  smoothZoom: boolean;
  /** 是否启用平滑旋转 */
  smoothRotation: boolean;
  /** 变换中心点 */
  transformOrigin: 'center' | 'mouse' | 'touch';
}

// ============================================================================
// UI配置
// ============================================================================

/**
 * 工具栏配置
 * 工具栏相关选项
 */
export interface ToolbarConfig {
  /** 是否显示工具栏 */
  visible: boolean;
  /** 工具栏位置 */
  position: 'top' | 'bottom' | 'left' | 'right' | 'floating';
  /** 工具栏按钮 */
  buttons: ToolbarButton[];
  /** 是否可拖拽 */
  draggable: boolean;
  /** 是否自动隐藏 */
  autoHide: boolean;
  /** 自动隐藏延迟（毫秒） */
  autoHideDelay: number;
}

/**
 * 工具栏按钮配置
 * 单个工具栏按钮的配置
 */
export interface ToolbarButton {
  /** 按钮ID */
  id: string;
  /** 按钮图标 */
  icon: string;
  /** 按钮标题 */
  title: string;
  /** 按钮动作 */
  action: string | (() => void);
  /** 是否可见 */
  visible: boolean;
  /** 是否禁用 */
  disabled: boolean;
  /** 按钮分组 */
  group?: string;
  /** 快捷键 */
  shortcut?: string;
}

/**
 * 控制面板配置
 * 控制面板相关选项
 */
export interface ControlPanelConfig {
  /** 是否显示控制面板 */
  visible: boolean;
  /** 面板位置 */
  position: 'left' | 'right' | 'top' | 'bottom';
  /** 面板宽度/高度 */
  size: number;
  /** 是否可折叠 */
  collapsible: boolean;
  /** 默认是否折叠 */
  collapsed: boolean;
  /** 面板内容 */
  panels: ControlPanel[];
}

/**
 * 控制面板项配置
 * 单个控制面板的配置
 */
export interface ControlPanel {
  /** 面板ID */
  id: string;
  /** 面板标题 */
  title: string;
  /** 面板内容 */
  content: string | HTMLElement | (() => HTMLElement);
  /** 是否可见 */
  visible: boolean;
  /** 是否可折叠 */
  collapsible: boolean;
  /** 默认是否折叠 */
  collapsed: boolean;
}

// ============================================================================
// 响应式配置
// ============================================================================

/**
 * 响应式断点配置
 * 不同设备的断点设置
 */
export interface ResponsiveBreakpoints {
  /** 移动端断点 */
  mobile: number;
  /** 平板端断点 */
  tablet: number;
  /** 桌面端断点 */
  desktop: number;
  /** 大屏断点 */
  large: number;
}

/**
 * 设备特定配置
 * 针对不同设备的配置
 */
export interface DeviceSpecificConfig {
  /** 设备类型 */
  device: DeviceType;
  /** 工具栏配置 */
  toolbar?: Partial<ToolbarConfig>;
  /** 控制面板配置 */
  controlPanel?: Partial<ControlPanelConfig>;
  /** 裁剪行为配置 */
  cropBehavior?: Partial<CropBehavior>;
  /** 手势配置 */
  gestures?: Partial<GestureConfig>;
  /** 尺寸配置 */
  sizes?: Partial<SizeConfig>;
}

/**
 * 响应式配置
 * 响应式设计相关选项
 */
export interface ResponsiveConfig {
  /** 是否启用响应式 */
  enabled: boolean;
  /** 断点配置 */
  breakpoints: ResponsiveBreakpoints;
  /** 设备特定配置 */
  deviceConfigs: DeviceSpecificConfig[];
  /** 是否自动检测设备 */
  autoDetectDevice: boolean;
  /** 是否启用触摸优化 */
  touchOptimization: boolean;
}

// ============================================================================
// 主配置接口
// ============================================================================

/**
 * 完整的裁剪器配置接口
 * 包含所有配置选项的主接口
 */
export interface FullCropperConfig {
  // 基础配置
  /** 容器元素或选择器 */
  container: string | HTMLElement;
  /** 图片源 */
  src?: string | File | HTMLImageElement;
  /** 主题 */
  theme: Theme;
  /** 语言 */
  language: Language;
  
  // 裁剪配置
  /** 裁剪形状 */
  shape: CropShape;
  /** 裁剪约束 */
  constraints: CropConstraints;
  /** 裁剪行为 */
  behavior: CropBehavior;
  /** 裁剪预设 */
  presets: CropPreset[];
  
  // 图片配置
  /** 图片加载配置 */
  imageLoad: ImageLoadConfig;
  /** 图片处理配置 */
  imageProcess: ImageProcessConfig;
  /** 图片变换配置 */
  imageTransform: ImageTransformConfig;
  
  // UI配置
  /** 工具栏配置 */
  toolbar: ToolbarConfig;
  /** 控制面板配置 */
  controlPanel: ControlPanelConfig;
  
  // 样式配置
  /** 颜色配置 */
  colors: ColorConfig;
  /** 尺寸配置 */
  sizes: SizeConfig;
  /** 动画配置 */
  animation: AnimationConfig;
  
  // 交互配置
  /** 手势配置 */
  gestures: GestureConfig;
  /** 响应式配置 */
  responsive: ResponsiveConfig;
  
  // 输出配置
  /** 输出格式 */
  outputFormat: ImageFormat;
  /** 输出质量 */
  outputQuality: number;
  /** 输出尺寸 */
  outputSize?: Size;
  
  // 高级配置
  /** 是否启用调试模式 */
  debug: boolean;
  /** 性能监控 */
  performance: boolean;
  /** 自定义CSS类名 */
  customClasses: Record<string, string>;
  /** 自定义样式 */
  customStyles: Record<string, string>;
}

/**
 * 默认配置类型
 * 用于提供默认配置值
 */
export type DefaultConfig = Required<FullCropperConfig>;

/**
 * 用户配置类型
 * 用户可以提供的配置选项（大部分为可选）
 */
export type UserConfig = {
  container: string | HTMLElement;
  src?: string | File | HTMLImageElement;
} & Partial<Omit<FullCropperConfig, 'container'>>;

/**
 * 配置验证结果
 * 配置验证的结果
 */
export interface ConfigValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误信息 */
  errors: string[];
  /** 警告信息 */
  warnings: string[];
  /** 修正后的配置 */
  correctedConfig?: UserConfig;
}
