/**
 * 渲染相关类型定义
 */

import type { WatermarkConfig } from './config'
import type { AnimationConfig } from './animation'

// 渲染上下文
export interface RenderContext {
  /** 容器矩形信息 */
  containerRect: DOMRect
  /** 设备像素比 */
  devicePixelRatio: number
  /** 是否支持Canvas */
  supportsCanvas: boolean
  /** 是否支持SVG */
  supportsSVG: boolean
  /** 浏览器信息 */
  userAgent: string
  /** 是否为移动设备 */
  isMobile: boolean
  /** 当前主题(如果有) */
  theme?: 'light' | 'dark' | 'auto'
  /** 自定义上下文数据 */
  custom?: Record<string, any>
}

// 布局计算结果
export interface LayoutResult {
  /** 行数 */
  rows: number
  /** 列数 */
  cols: number
  /** 列数（兼容性别名） */
  columns: number
  /** 实际水印宽度 */
  itemWidth: number
  /** 实际水印高度 */
  itemHeight: number
  /** 实际水平间距 */
  actualGapX: number
  /** 实际垂直间距 */
  actualGapY: number
  /** 水平间距（兼容性别名） */
  gapX: number
  /** 垂直间距（兼容性别名） */
  gapY: number
  /** 水平偏移 */
  offsetX: number
  /** 垂直偏移 */
  offsetY: number
  /** 总宽度 */
  totalWidth: number
  /** 总高度 */
  totalHeight: number
  /** 位置信息列表 */
  positions: Array<{
    x: number
    y: number
    row: number
    col: number
  }>
}

// 渲染选项
export interface RenderOptions {
  /** 是否使用缓存 */
  useCache?: boolean
  /** 是否异步渲染 */
  async?: boolean
  /** 渲染质量 */
  quality?: 'low' | 'medium' | 'high'
  /** 是否启用硬件加速 */
  hardwareAcceleration?: boolean
  /** 自定义渲染参数 */
  customParams?: Record<string, any>
}

// 基础渲染器抽象接口
export interface BaseRenderer {
  /** 渲染器类型 */
  readonly type: 'dom' | 'canvas' | 'svg'
  /** 是否支持动画 */
  readonly supportsAnimation: boolean
  /** 是否支持透明度 */
  readonly supportsOpacity: boolean

  /** 渲染水印 */
  render(
    config: WatermarkConfig,
    context: RenderContext,
    options?: RenderOptions
  ): Promise<HTMLElement[]>
  /** 更新水印 */
  update(
    elements: HTMLElement[],
    config: WatermarkConfig,
    context: RenderContext
  ): Promise<void>
  /** 销毁水印 */
  destroy(elements: HTMLElement[]): Promise<void>
  /** 计算布局 */
  calculateLayout(config: WatermarkConfig, containerRect: DOMRect): LayoutResult
  /** 应用样式 */
  applyStyles(element: HTMLElement, config: WatermarkConfig): void
  /** 应用动画 */
  applyAnimation(
    element: HTMLElement,
    animation: AnimationConfig
  ): Promise<void>
  /** 清理资源 */
  cleanup(): void
}

// DOM渲染器特定接口
export interface DOMRenderer extends BaseRenderer {
  readonly type: 'dom'
  /** 创建水印元素 */
  createElement(config: WatermarkConfig, row: number, col: number): HTMLElement
  /** 设置元素位置 */
  setElementPosition(element: HTMLElement, x: number, y: number): void
  /** 设置元素内容 */
  setElementContent(element: HTMLElement, content: string | string[]): void
}

// Canvas渲染器特定接口
export interface CanvasRenderer extends BaseRenderer {
  readonly type: 'canvas'
  /** Canvas元素 */
  canvas: HTMLCanvasElement
  /** 渲染上下文 */
  ctx: CanvasRenderingContext2D
  /** 绘制文本 */
  drawText(text: string, x: number, y: number, config: WatermarkConfig): void
  /** 绘制图片 */
  drawImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void
  /** 清空画布 */
  clear(): void
  /** 导出为DataURL */
  toDataURL(type?: string, quality?: number): string
}

// SVG渲染器特定接口
export interface SVGRenderer extends BaseRenderer {
  readonly type: 'svg'
  /** SVG元素 */
  svg: SVGSVGElement
  /** 创建SVG元素 */
  createSVGElement<K extends keyof SVGElementTagNameMap>(
    tagName: K
  ): SVGElementTagNameMap[K]
  /** 创建图案定义 */
  createPattern(
    config: WatermarkConfig,
    layout: LayoutResult
  ): SVGPatternElement
  /** 设置SVG属性 */
  setSVGAttribute(element: SVGElement, name: string, value: string): void
}

// 渲染器工厂接口
export interface RendererFactory {
  /** 创建DOM渲染器 */
  createDOMRenderer(): DOMRenderer
  /** 创建Canvas渲染器 */
  createCanvasRenderer(): CanvasRenderer
  /** 创建SVG渲染器 */
  createSVGRenderer(): SVGRenderer
  /** 根据配置自动选择渲染器 */
  createRenderer(config: WatermarkConfig): BaseRenderer
}

// 渲染性能指标
export interface RenderPerformance {
  /** 渲染开始时间 */
  startTime: number
  /** 渲染结束时间 */
  endTime: number
  /** 渲染耗时 */
  duration: number
  /** 元素数量 */
  elementCount: number
  /** 内存使用 */
  memoryUsage: number
  /** 是否使用了缓存 */
  usedCache: boolean
  /** 错误信息 */
  errors?: Error[]
}

// 渲染缓存接口
export interface RenderCache {
  /** 获取缓存 */
  get(key: string): HTMLElement[] | undefined
  /** 设置缓存 */
  set(key: string, elements: HTMLElement[], ttl?: number): void
  /** 删除缓存 */
  delete(key: string): boolean
  /** 清空缓存 */
  clear(): void
  /** 缓存大小 */
  size(): number
  /** 生成缓存键 */
  generateKey(config: WatermarkConfig, context: RenderContext): string
}

// 渲染事件
export interface RenderEvents {
  /** 渲染开始 */
  renderStart: (config: WatermarkConfig, context: RenderContext) => void
  /** 渲染完成 */
  renderComplete: (
    elements: HTMLElement[],
    performance: RenderPerformance
  ) => void
  /** 渲染错误 */
  renderError: (error: Error, config: WatermarkConfig) => void
  /** 布局计算完成 */
  layoutCalculated: (layout: LayoutResult) => void
  /** 样式应用完成 */
  stylesApplied: (element: HTMLElement, config: WatermarkConfig) => void
  /** 动画应用完成 */
  animationApplied: (element: HTMLElement, animation: AnimationConfig) => void
}

// 渲染器配置
export interface RendererConfig {
  /** 是否启用缓存 */
  enableCache?: boolean
  /** 缓存TTL(毫秒) */
  cacheTTL?: number
  /** 最大缓存大小 */
  maxCacheSize?: number
  /** 是否启用性能监控 */
  enablePerformanceMonitoring?: boolean
  /** 是否启用错误恢复 */
  enableErrorRecovery?: boolean
  /** 渲染超时时间(毫秒) */
  renderTimeout?: number
  /** 自定义配置 */
  custom?: Record<string, any>
}

// 图片加载器接口
export interface ImageLoader {
  /** 加载图片 */
  load(src: string): Promise<HTMLImageElement>
  /** 预加载图片 */
  preload(sources: string[]): Promise<HTMLImageElement[]>
  /** 获取缓存的图片 */
  getFromCache(src: string): HTMLImageElement | undefined
  /** 清理缓存 */
  clearCache(): void
}
