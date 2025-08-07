/**
 * 水印配置相关类型定义
 */

// 基础样式配置
export interface WatermarkStyle {
  /** 字体大小 */
  fontSize?: number
  /** 字体系列 */
  fontFamily?: string
  /** 字体粗细 */
  fontWeight?: string | number
  /** 字体样式 */
  fontStyle?: string
  /** 文字颜色 */
  color?: string
  /** 透明度 0-1 */
  opacity?: number
  /** 旋转角度 */
  rotate?: number
  /** 文字阴影 */
  textShadow?: string
  /** 文字描边 */
  textStroke?: string
  /** 文字装饰 */
  textDecoration?: string
  /** 行高 */
  lineHeight?: number
  /** 字符间距 */
  letterSpacing?: number
  /** 背景色 */
  backgroundColor?: string
  /** 背景 */
  background?: string
  /** 边框 */
  border?: string
  /** 内边距 */
  padding?: number | string
  /** 圆角 */
  borderRadius?: number | string
  /** 盒子阴影 */
  boxShadow?: string
  /** 混合模式 */
  mixBlendMode?: string
  /** 滤镜 */
  filter?: string
  /** 模糊效果 */
  blur?: number
  /** 渐变 */
  gradient?: string
  /** 图案 */
  pattern?: string
  /** 矢量图形 */
  vectorGraphics?: boolean
}

// 布局配置
export interface WatermarkLayout {
  /** 水印宽度 */
  width?: number
  /** 水印高度 */
  height?: number
  /** 水平间距 */
  gapX?: number
  /** 垂直间距 */
  gapY?: number
  /** 水平偏移 */
  offsetX?: number
  /** 垂直偏移 */
  offsetY?: number
  /** 行数 */
  rows?: number
  /** 列数 */
  cols?: number
  /** 列数（兼容性别名） */
  columns?: number
  /** 是否自动计算行列数 */
  autoCalculate?: boolean
}

// 图片配置
export interface WatermarkImage {
  /** 图片源 */
  src: string
  /** 图片宽度 */
  width?: number
  /** 图片高度 */
  height?: number
  /** 图片透明度 */
  opacity?: number
  /** 是否保持宽高比 */
  aspectRatio?: boolean
  /** 图片加载失败时的回调 */
  onError?: (error: Error) => void
  /** 图片加载成功时的回调 */
  onLoad?: (image: HTMLImageElement) => void
}

// 渲染模式
export type RenderMode = 'dom' | 'canvas' | 'svg'

// 水印内容类型
export type WatermarkContent =
  | string
  | {
      text?: string
      image?: WatermarkImage
    }

// 主配置接口
export interface WatermarkConfig {
  /** 水印内容 */
  content: WatermarkContent
  /** 容器元素或选择器 */
  container?: HTMLElement | string
  /** 样式配置 */
  style?: WatermarkStyle
  /** 布局配置 */
  layout?: WatermarkLayout
  /** 动画配置 */
  animation?: import('./animation').AnimationConfig
  /** 安全配置 */
  security?: import('./security').SecurityConfig
  /** 响应式配置 */
  responsive?: import('./responsive').ResponsiveConfig
  /** 渲染模式 */
  renderMode?: RenderMode
  /** 渲染模式（兼容性别名） */
  mode?: RenderMode
  /** 性能配置 */
  performance?: {
    highPerformance?: boolean
  }
  /** 是否启用 */
  enabled?: boolean
  /** z-index层级 */
  zIndex?: number
  /** 是否可见 */
  visible?: boolean
  /** 自定义类名 */
  className?: string
  /** 自定义样式 */
  customStyle?: Record<string, string>
  /** 调试模式 */
  debug?: boolean
}

// 默认配置
export const DEFAULT_WATERMARK_CONFIG: Required<
  Omit<WatermarkConfig, 'content' | 'container'>
> = {
  style: {
    fontSize: 16,
    fontFamily: 'Arial, sans-serif',
    fontWeight: 'normal',
    color: 'rgba(0, 0, 0, 0.15)',
    opacity: 1,
    rotate: -22,
    textShadow: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    borderRadius: 0,
  },
  layout: {
    width: 120,
    height: 64,
    gapX: 100,
    gapY: 100,
    offsetX: 0,
    offsetY: 0,
    autoCalculate: true,
  },
  animation: {
    type: 'none',
    duration: 3000,
    delay: 0,
    iteration: 'infinite',
    easing: 'ease-in-out',
  },
  security: {
    level: 'none',
    mutationObserver: false,
    styleProtection: false,
    canvasProtection: false,
    obfuscation: false,
  },
  responsive: {
    enabled: false,
    breakpoints: {},
    autoResize: true,
    debounceTime: 300,
  },
  renderMode: 'dom',
  mode: 'dom',
  performance: {
    highPerformance: false,
  },
  enabled: true,
  zIndex: 9999,
  visible: true,
  className: '',
  customStyle: {},
  debug: false,
}
