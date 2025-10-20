/**
 * 基础配置选项
 */
export interface BaseProgressOptions {
  // 基础配置
  value?: number;
  min?: number;
  max?: number;
  size?: string | number;
  width?: string | number;
  height?: string | number;
  strokeWidth?: number;

  // 样式配置
  color?: string | string[];
  trackColor?: string;
  theme?: string;
  className?: string;

  // 动画配置
  animated?: boolean;
  duration?: number;
  easing?: EasingFunction | keyof typeof EasingFunctions;

  // 显示配置
  showText?: boolean;
  format?: (value: number) => string;
  textInside?: boolean;
  icon?: string | ((value: number) => string);

  // 功能配置
  indeterminate?: boolean;
  striped?: boolean;
  active?: boolean;

  // 事件回调
  onChange?: (value: number) => void;
  onComplete?: () => void;
  onStart?: () => void;
  onUpdate?: (value: number) => void;
}

/**
 * 线性进度条配置
 */
export interface LinearProgressOptions extends BaseProgressOptions {
  direction?: 'horizontal' | 'vertical';
  buffer?: number;
  segments?: SegmentConfig[];
}

/**
 * 圆形进度条配置
 */
export interface CircleProgressOptions extends BaseProgressOptions {
  radius?: number;
  clockwise?: boolean;
  startAngle?: number;
  lineCap?: 'round' | 'square' | 'butt';
}

/**
 * 半圆进度条配置
 */
export interface SemiCircleProgressOptions extends CircleProgressOptions {
  angleRange?: number;
  showScale?: boolean;
  scaleCount?: number;
}

/**
 * 仪表盘进度条配置
 */
export interface DashboardProgressOptions extends SemiCircleProgressOptions {
  showPointer?: boolean;
  colorRanges?: ColorRange[];
  warningZones?: WarningZone[];
}

/**
 * 步骤进度条配置
 */
export interface StepProgressOptions extends BaseProgressOptions {
  steps?: Step[];
  currentStep?: number;
  layout?: 'horizontal' | 'vertical';
  showDescription?: boolean;
}

/**
 * 分段进度条配置
 */
export interface SegmentProgressOptions extends BaseProgressOptions {
  segments?: SegmentConfig[];
  gap?: number;
}

/**
 * 水波纹进度条配置
 */
export interface WaveProgressOptions extends BaseProgressOptions {
  waveHeight?: number;
  waveCount?: number;
  waveSpeed?: number;
  renderMode?: 'canvas' | 'svg';
}

/**
 * 图片进度条配置
 */
export interface ImageProgressOptions extends BaseProgressOptions {
  imageSrc: string;
  imageWidth?: number;
  imageHeight?: number;
  fillDirection?: 'horizontal' | 'vertical' | 'radial';
  maskMode?: boolean;
  objectFit?: 'fill' | 'contain' | 'cover';
}

/**
 * 自定义形状进度条配置
 */
export interface CustomShapeProgressOptions extends BaseProgressOptions {
  shapePath: string | ((width: number, height: number) => string);
  shapeWidth?: number;
  shapeHeight?: number;
  fillMode?: 'solid' | 'gradient' | 'pattern';
}

/**
 * 高级仪表盘配置
 */
export interface GaugeProgressOptions extends DashboardProgressOptions {
  showNumbers?: boolean;
  numberFormat?: (value: number) => string;
  tickCount?: number;
  showMinorTicks?: boolean;
  minorTickCount?: number;
  needleType?: 'arrow' | 'line' | 'triangle';
}

/**
 * 多环进度条配置
 */
export interface RingProgressOptions extends BaseProgressOptions {
  rings?: RingConfig[];
  ringGap?: number;
  baseRadius?: number;
}

/**
 * 多边形进度条配置
 */
export interface PolygonProgressOptions extends BaseProgressOptions {
  sides?: number;
  radius?: number;
  rotation?: number;
  fillMode?: 'edge' | 'area';
}

/**
 * 电池进度条配置
 */
export interface BatteryProgressOptions extends BaseProgressOptions {
  orientation?: 'horizontal' | 'vertical';
  batteryWidth?: number;
  batteryHeight?: number;
  showBoltIcon?: boolean;
  chargingColor?: string;
  lowBatteryThreshold?: number;
  lowBatteryColor?: string;
}

/**
 * 心形进度条配置
 */
export interface HeartProgressOptions extends BaseProgressOptions {
  heartSize?: number;
  fillMode?: 'bottom-up' | 'center-out' | 'pulse';
  beatAnimation?: boolean;
  beatSpeed?: number;
}

/**
 * 段配置
 */
export interface SegmentConfig {
  value: number;
  color?: string;
  label?: string;
}

/**
 * 颜色范围
 */
export interface ColorRange {
  min: number;
  max: number;
  color: string;
}

/**
 * 警告区域
 */
export interface WarningZone {
  min: number;
  max: number;
  color?: string;
}

/**
 * 步骤配置
 */
export interface Step {
  title?: string;
  description?: string;
  icon?: string;
  status?: 'completed' | 'active' | 'pending' | 'error';
}

/**
 * 环配置
 */
export interface RingConfig {
  value: number;
  color?: string;
  strokeWidth?: number;
  label?: string;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    track: string;
    text: string;
  };
  sizes: {
    small: number;
    medium: number;
    large: number;
  };
  borderRadius?: string;
  shadow?: string;
}

/**
 * 缓动函数
 */
export type EasingFunction = (t: number) => number;

/**
 * 预设缓动函数
 */
export const EasingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - --t * t * t * t,
  easeInOutQuart: (t: number) =>
    t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + --t * t * t * t * t,
  easeInOutQuint: (t: number) =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
};

/**
 * 事件类型
 */
export type EventType = 'change' | 'complete' | 'start' | 'update' | 'destroy';

/**
 * 事件处理器
 */
export type EventHandler = (...args: any[]) => void;

