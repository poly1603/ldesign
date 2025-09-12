/**
 * 视口服务
 * 
 * 统一管理画布的缩放、平移、适配等视口相关操作，
 * 提供一致的接口和事件订阅机制。
 */

import type LogicFlow from '@logicflow/core'
import type { Point, Rectangle } from '../types'

/**
 * 视口变换信息
 */
export interface ViewportTransform {
  /** 缩放比例 */
  scale: number
  /** X轴偏移 */
  translateX: number
  /** Y轴偏移 */
  translateY: number
}

/**
 * 视口边界信息
 */
export interface ViewportBounds {
  /** 最小X坐标 */
  minX: number
  /** 最小Y坐标 */
  minY: number
  /** 最大X坐标 */
  maxX: number
  /** 最大Y坐标 */
  maxY: number
  /** 宽度 */
  width: number
  /** 高度 */
  height: number
}

/**
 * 适配选项
 */
export interface FitViewOptions {
  /** 是否包含边距 */
  padding?: number
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** 是否启用动画 */
  animated?: boolean
  /** 动画持续时间（毫秒） */
  duration?: number
}

/**
 * 缩放选项
 */
export interface ZoomOptions {
  /** 缩放中心点 */
  center?: Point
  /** 是否启用动画 */
  animated?: boolean
  /** 动画持续时间（毫秒） */
  duration?: number
}

/**
 * 平移选项
 */
export interface PanOptions {
  /** 是否启用动画 */
  animated?: boolean
  /** 动画持续时间（毫秒） */
  duration?: number
}

/**
 * 视口事件类型
 */
export interface ViewportEvents {
  /** 视口变换事件 */
  'viewport:transform': (transform: ViewportTransform) => void
  /** 缩放事件 */
  'viewport:zoom': (scale: number, center?: Point) => void
  /** 平移事件 */
  'viewport:pan': (translateX: number, translateY: number) => void
  /** 适配事件 */
  'viewport:fit': (bounds: ViewportBounds) => void
  /** 边界变化事件 */
  'viewport:bounds-change': (bounds: ViewportBounds) => void
}

/**
 * 视口服务配置
 */
export interface ViewportServiceConfig {
  /** 默认缩放比例 */
  defaultScale?: number
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** 缩放步长 */
  zoomStep?: number
  /** 是否启用平滑动画 */
  enableAnimation?: boolean
  /** 默认动画持续时间 */
  defaultDuration?: number
  /** 边界计算的边距 */
  boundsPadding?: number
}

/**
 * 视口服务接口
 */
export interface IViewportService {
  /**
   * 获取当前视口变换信息
   */
  getTransform(): ViewportTransform

  /**
   * 获取当前缩放比例
   */
  getScale(): number

  /**
   * 获取当前平移偏移
   */
  getTranslate(): Point

  /**
   * 获取视口边界
   */
  getBounds(): ViewportBounds

  /**
   * 获取可见区域矩形
   */
  getVisibleRect(): Rectangle

  /**
   * 缩放到指定比例
   * @param scale 目标缩放比例
   * @param options 缩放选项
   */
  zoomTo(scale: number, options?: ZoomOptions): void

  /**
   * 放大
   * @param options 缩放选项
   */
  zoomIn(options?: ZoomOptions): void

  /**
   * 缩小
   * @param options 缩放选项
   */
  zoomOut(options?: ZoomOptions): void

  /**
   * 重置缩放
   * @param options 缩放选项
   */
  zoomReset(options?: ZoomOptions): void

  /**
   * 平移到指定位置
   * @param x X轴偏移
   * @param y Y轴偏移
   * @param options 平移选项
   */
  panTo(x: number, y: number, options?: PanOptions): void

  /**
   * 平移指定距离
   * @param deltaX X轴增量
   * @param deltaY Y轴增量
   * @param options 平移选项
   */
  panBy(deltaX: number, deltaY: number, options?: PanOptions): void

  /**
   * 居中到指定点
   * @param point 目标点
   * @param options 平移选项
   */
  centerTo(point: Point, options?: PanOptions): void

  /**
   * 适配视图到所有内容
   * @param options 适配选项
   */
  fitView(options?: FitViewOptions): void

  /**
   * 适配视图到指定边界
   * @param bounds 目标边界
   * @param options 适配选项
   */
  fitToBounds(bounds: ViewportBounds, options?: FitViewOptions): void

  /**
   * 适配视图到选中元素
   * @param options 适配选项
   */
  fitToSelection(options?: FitViewOptions): void

  /**
   * 屏幕坐标转换为画布坐标
   * @param screenPoint 屏幕坐标
   */
  screenToCanvas(screenPoint: Point): Point

  /**
   * 画布坐标转换为屏幕坐标
   * @param canvasPoint 画布坐标
   */
  canvasToScreen(canvasPoint: Point): Point

  /**
   * 计算内容边界
   */
  calculateContentBounds(): ViewportBounds

  /**
   * 更新视口配置
   * @param config 新配置
   */
  updateConfig(config: Partial<ViewportServiceConfig>): void

  /**
   * 监听视口事件
   * @param event 事件名称
   * @param callback 回调函数
   */
  on<K extends keyof ViewportEvents>(event: K, callback: ViewportEvents[K]): void

  /**
   * 移除事件监听
   * @param event 事件名称
   * @param callback 回调函数
   */
  off<K extends keyof ViewportEvents>(event: K, callback: ViewportEvents[K]): void

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 事件参数
   */
  emit<K extends keyof ViewportEvents>(event: K, ...args: Parameters<ViewportEvents[K]>): void

  /**
   * 销毁服务
   */
  destroy(): void
}

/**
 * 默认视口服务配置
 */
export const defaultViewportConfig: Required<ViewportServiceConfig> = {
  defaultScale: 1,
  minScale: 0.1,
  maxScale: 5,
  zoomStep: 0.1,
  enableAnimation: true,
  defaultDuration: 300,
  boundsPadding: 50
}

/**
 * 视口服务实现
 */
export class ViewportService implements IViewportService {
  private lf: LogicFlow
  private config: Required<ViewportServiceConfig>
  private eventListeners: Map<keyof ViewportEvents, Function[]> = new Map()
  private animationId: number | null = null

  constructor(lf: LogicFlow, config: ViewportServiceConfig = {}) {
    this.lf = lf
    this.config = { ...defaultViewportConfig, ...config }

    // 监听LogicFlow的变换事件
    this.setupLogicFlowListeners()
  }

  /**
   * 设置LogicFlow事件监听
   */
  private setupLogicFlowListeners(): void {
    this.lf.on('graph:transform', () => {
      const transform = this.getTransform()
      this.emit('viewport:transform', transform)
    })
  }

  /**
   * 获取当前视口变换信息
   */
  getTransform(): ViewportTransform {
    const transform = this.lf.getTransform()
    return {
      scale: transform.SCALE_X || 1,
      translateX: transform.TRANSLATE_X || 0,
      translateY: transform.TRANSLATE_Y || 0
    }
  }

  /**
   * 获取当前缩放比例
   */
  getScale(): number {
    return this.getTransform().scale
  }

  /**
   * 获取当前平移偏移
   */
  getTranslate(): Point {
    const transform = this.getTransform()
    return {
      x: transform.translateX,
      y: transform.translateY
    }
  }

  /**
   * 获取视口边界
   */
  getBounds(): ViewportBounds {
    return this.calculateContentBounds()
  }

  /**
   * 获取可见区域矩形
   */
  getVisibleRect(): Rectangle {
    const container = this.lf.container
    if (!container) {
      return { x: 0, y: 0, width: 0, height: 0 }
    }

    const rect = container.getBoundingClientRect()
    const transform = this.getTransform()

    // 计算可见区域在画布坐标系中的位置
    const topLeft = this.screenToCanvas({ x: 0, y: 0 })
    const bottomRight = this.screenToCanvas({ x: rect.width, y: rect.height })

    return {
      x: topLeft.x,
      y: topLeft.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y
    }
  }

  /**
   * 缩放到指定比例
   */
  zoomTo(scale: number, options: ZoomOptions = {}): void {
    // 限制缩放范围
    const clampedScale = Math.max(this.config.minScale, Math.min(this.config.maxScale, scale))

    if (options.animated && this.config.enableAnimation) {
      this.animateZoom(clampedScale, options)
    } else {
      this.lf.zoom(clampedScale)
      this.emit('viewport:zoom', clampedScale, options.center)
    }
  }

  /**
   * 放大
   */
  zoomIn(options: ZoomOptions = {}): void {
    const currentScale = this.getScale()
    const newScale = currentScale + this.config.zoomStep
    this.zoomTo(newScale, options)
  }

  /**
   * 缩小
   */
  zoomOut(options: ZoomOptions = {}): void {
    const currentScale = this.getScale()
    const newScale = currentScale - this.config.zoomStep
    this.zoomTo(newScale, options)
  }

  /**
   * 重置缩放
   */
  zoomReset(options: ZoomOptions = {}): void {
    this.zoomTo(this.config.defaultScale, options)
  }

  /**
   * 平移到指定位置
   */
  panTo(x: number, y: number, options: PanOptions = {}): void {
    if (options.animated && this.config.enableAnimation) {
      this.animatePan(x, y, options)
    } else {
      this.lf.translate(x, y)
      this.emit('viewport:pan', x, y)
    }
  }

  /**
   * 平移指定距离
   */
  panBy(deltaX: number, deltaY: number, options: PanOptions = {}): void {
    const currentTranslate = this.getTranslate()
    this.panTo(
      currentTranslate.x + deltaX,
      currentTranslate.y + deltaY,
      options
    )
  }

  /**
   * 居中到指定点
   */
  centerTo(point: Point, options: PanOptions = {}): void {
    const container = this.lf.container
    if (!container) return

    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const scale = this.getScale()
    const targetX = centerX - point.x * scale
    const targetY = centerY - point.y * scale

    this.panTo(targetX, targetY, options)
  }

  /**
   * 适配视图到所有内容
   */
  fitView(options: FitViewOptions = {}): void {
    const bounds = this.calculateContentBounds()
    this.fitToBounds(bounds, options)
  }

  /**
   * 适配视图到指定边界
   */
  fitToBounds(bounds: ViewportBounds, options: FitViewOptions = {}): void {
    const container = this.lf.container
    if (!container || bounds.width === 0 || bounds.height === 0) return

    const rect = container.getBoundingClientRect()
    const padding = options.padding || this.config.boundsPadding

    // 计算适配的缩放比例
    const scaleX = (rect.width - padding * 2) / bounds.width
    const scaleY = (rect.height - padding * 2) / bounds.height
    let scale = Math.min(scaleX, scaleY)

    // 限制缩放范围
    const minScale = options.minScale || this.config.minScale
    const maxScale = options.maxScale || this.config.maxScale
    scale = Math.max(minScale, Math.min(maxScale, scale))

    // 计算居中位置
    const centerX = bounds.minX + bounds.width / 2
    const centerY = bounds.minY + bounds.height / 2

    if (options.animated && this.config.enableAnimation) {
      this.animateFit(scale, { x: centerX, y: centerY }, options)
    } else {
      this.lf.zoom(scale)
      this.centerTo({ x: centerX, y: centerY })
      this.emit('viewport:fit', bounds)
    }
  }

  /**
   * 适配视图到选中元素
   */
  fitToSelection(options: FitViewOptions = {}): void {
    const selectedElements = this.lf.getSelectElements()
    if (selectedElements.nodes.length === 0 && selectedElements.edges.length === 0) {
      return
    }

    // 计算选中元素的边界
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    selectedElements.nodes.forEach(node => {
      const { x, y, width = 100, height = 80 } = node
      minX = Math.min(minX, x - width / 2)
      minY = Math.min(minY, y - height / 2)
      maxX = Math.max(maxX, x + width / 2)
      maxY = Math.max(maxY, y + height / 2)
    })

    selectedElements.edges.forEach(edge => {
      if (edge.startPoint) {
        minX = Math.min(minX, edge.startPoint.x)
        minY = Math.min(minY, edge.startPoint.y)
        maxX = Math.max(maxX, edge.startPoint.x)
        maxY = Math.max(maxY, edge.startPoint.y)
      }
      if (edge.endPoint) {
        minX = Math.min(minX, edge.endPoint.x)
        minY = Math.min(minY, edge.endPoint.y)
        maxX = Math.max(maxX, edge.endPoint.x)
        maxY = Math.max(maxY, edge.endPoint.y)
      }
    })

    if (minX !== Infinity) {
      const bounds: ViewportBounds = {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
      }
      this.fitToBounds(bounds, options)
    }
  }

  /**
   * 屏幕坐标转换为画布坐标
   */
  screenToCanvas(screenPoint: Point): Point {
    const transform = this.getTransform()
    return {
      x: (screenPoint.x - transform.translateX) / transform.scale,
      y: (screenPoint.y - transform.translateY) / transform.scale
    }
  }

  /**
   * 画布坐标转换为屏幕坐标
   */
  canvasToScreen(canvasPoint: Point): Point {
    const transform = this.getTransform()
    return {
      x: canvasPoint.x * transform.scale + transform.translateX,
      y: canvasPoint.y * transform.scale + transform.translateY
    }
  }

  /**
   * 计算内容边界
   */
  calculateContentBounds(): ViewportBounds {
    const graphData = this.lf.getGraphData()

    if (graphData.nodes.length === 0) {
      return {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0
      }
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    // 计算所有节点的边界
    graphData.nodes.forEach(node => {
      const { x, y, width = 100, height = 80 } = node
      minX = Math.min(minX, x - width / 2)
      minY = Math.min(minY, y - height / 2)
      maxX = Math.max(maxX, x + width / 2)
      maxY = Math.max(maxY, y + height / 2)
    })

    // 考虑边的路径点
    graphData.edges.forEach(edge => {
      if (edge.startPoint) {
        minX = Math.min(minX, edge.startPoint.x)
        minY = Math.min(minY, edge.startPoint.y)
        maxX = Math.max(maxX, edge.startPoint.x)
        maxY = Math.max(maxY, edge.startPoint.y)
      }
      if (edge.endPoint) {
        minX = Math.min(minX, edge.endPoint.x)
        minY = Math.min(minY, edge.endPoint.y)
        maxX = Math.max(maxX, edge.endPoint.x)
        maxY = Math.max(maxY, edge.endPoint.y)
      }
      if (edge.pointsList) {
        edge.pointsList.forEach(point => {
          minX = Math.min(minX, point.x)
          minY = Math.min(minY, point.y)
          maxX = Math.max(maxX, point.x)
          maxY = Math.max(maxY, point.y)
        })
      }
    })

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    }
  }

  /**
   * 更新视口配置
   */
  updateConfig(config: Partial<ViewportServiceConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * 监听视口事件
   */
  on<K extends keyof ViewportEvents>(event: K, callback: ViewportEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  /**
   * 移除事件监听
   */
  off<K extends keyof ViewportEvents>(event: K, callback: ViewportEvents[K]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   */
  emit<K extends keyof ViewportEvents>(event: K, ...args: Parameters<ViewportEvents[K]>): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          (callback as any)(...args)
        } catch (error) {
          console.error(`ViewportService event error (${event}):`, error)
        }
      })
    }
  }

  /**
   * 销毁服务
   */
  destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.eventListeners.clear()
  }

  /**
   * 动画缩放
   */
  private animateZoom(targetScale: number, options: ZoomOptions): void {
    const startScale = this.getScale()
    const duration = options.duration || this.config.defaultDuration
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeProgress = this.easeOutCubic(progress)
      const currentScale = startScale + (targetScale - startScale) * easeProgress

      this.lf.zoom(currentScale)

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.animationId = null
        this.emit('viewport:zoom', targetScale, options.center)
      }
    }

    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 动画平移
   */
  private animatePan(targetX: number, targetY: number, options: PanOptions): void {
    const startTranslate = this.getTranslate()
    const duration = options.duration || this.config.defaultDuration
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeProgress = this.easeOutCubic(progress)
      const currentX = startTranslate.x + (targetX - startTranslate.x) * easeProgress
      const currentY = startTranslate.y + (targetY - startTranslate.y) * easeProgress

      this.lf.translate(currentX, currentY)

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.animationId = null
        this.emit('viewport:pan', targetX, targetY)
      }
    }

    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 动画适配
   */
  private animateFit(targetScale: number, targetCenter: Point, options: FitViewOptions): void {
    const startScale = this.getScale()
    const startTranslate = this.getTranslate()
    const duration = options.duration || this.config.defaultDuration
    const startTime = performance.now()

    // 计算目标平移位置
    const container = this.lf.container
    if (!container) return

    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const targetX = centerX - targetCenter.x * targetScale
    const targetY = centerY - targetCenter.y * targetScale

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeProgress = this.easeOutCubic(progress)

      const currentScale = startScale + (targetScale - startScale) * easeProgress
      const currentX = startTranslate.x + (targetX - startTranslate.x) * easeProgress
      const currentY = startTranslate.y + (targetY - startTranslate.y) * easeProgress

      this.lf.zoom(currentScale)
      this.lf.translate(currentX, currentY)

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.animationId = null
        this.emit('viewport:fit', this.calculateContentBounds())
      }
    }

    this.animationId = requestAnimationFrame(animate)
  }

  /**
   * 缓动函数 - 三次方缓出
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3)
  }
}
