/**
 * @file 控制点渲染器
 * @description 渲染和管理裁剪区域的控制点
 */

import { BaseComponent, type BaseComponentOptions } from './base-component'
import { ControlPointsManager, ControlPointType, type ControlPoint } from '@/interaction/control-points-manager'
import type { CropArea, Point } from '@/types'
import { CropShape } from '@/types'

/**
 * 控制点渲染器配置
 */
export interface ControlPointsRendererOptions extends BaseComponentOptions {
  /** 控制点大小 */
  pointSize: number
  /** 是否显示角点 */
  showCorners: boolean
  /** 是否显示边点 */
  showEdges: boolean
  /** 是否显示中心点 */
  showCenter: boolean
  /** 是否显示旋转点 */
  showRotate: boolean
  /** 控制点颜色 */
  pointColor: string
  /** 激活状态颜色 */
  activeColor: string
  /** 悬停状态颜色 */
  hoverColor: string
  /** 是否显示连接线 */
  showConnectingLines: boolean
}

/**
 * 控制点元素数据
 */
interface ControlPointElement {
  element: HTMLElement
  point: ControlPoint
}

/**
 * 控制点渲染器类
 */
export class ControlPointsRenderer extends BaseComponent {
  /** 渲染器配置 */
  private rendererOptions: ControlPointsRendererOptions

  /** 控制点管理器 */
  private controlPointsManager: ControlPointsManager

  /** 当前裁剪区域 */
  private currentCropArea: CropArea | null = null

  /** 控制点元素映射 */
  private pointElements = new Map<ControlPointType, ControlPointElement>()

  /** 激活的控制点 */
  private activePoint: ControlPoint | null = null

  /** 悬停的控制点 */
  private hoverPoint: ControlPoint | null = null

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: ControlPointsRendererOptions = {
    ...BaseComponent.DEFAULT_OPTIONS,
    pointSize: 12,
    showCorners: true,
    showEdges: true,
    showCenter: false,
    showRotate: true,
    pointColor: '#722ED1',
    activeColor: '#5e2aa7',
    hoverColor: '#8c5ad3',
    showConnectingLines: false,
  }

  /**
   * 构造函数
   * @param options 渲染器配置
   */
  constructor(options: Partial<ControlPointsRendererOptions> = {}) {
    super('div', options)
    this.rendererOptions = { ...ControlPointsRenderer.DEFAULT_OPTIONS, ...options }
    this.controlPointsManager = new ControlPointsManager({
      size: this.rendererOptions.pointSize,
      showCorners: this.rendererOptions.showCorners,
      showEdges: this.rendererOptions.showEdges,
      showCenter: this.rendererOptions.showCenter,
      showRotate: this.rendererOptions.showRotate,
    })

    // 现在可以安全地初始化
    this.initialize()
  }

  /**
   * 获取组件名称
   */
  protected getComponentName(): string {
    return 'control-points'
  }

  /**
   * 渲染组件
   */
  protected render(): void {
    this.element.style.position = 'absolute'
    this.element.style.top = '0'
    this.element.style.left = '0'
    this.element.style.width = '100%'
    this.element.style.height = '100%'
    this.element.style.pointerEvents = 'none'
    this.element.style.zIndex = '5'
  }

  /**
   * 更新裁剪区域
   * @param cropArea 裁剪区域
   */
  updateCropArea(cropArea: CropArea): void {
    this.currentCropArea = { ...cropArea }
    this.controlPointsManager.updateControlPoints(cropArea)
    this.renderControlPoints()
  }

  /**
   * 设置激活控制点
   * @param point 控制点
   */
  setActivePoint(point: ControlPoint | null): void {
    if (this.activePoint) {
      this.updatePointStyle(this.activePoint, false, false)
    }

    this.activePoint = point
    this.controlPointsManager.setActivePoint(point)

    if (point) {
      this.updatePointStyle(point, true, false)
    }
  }

  /**
   * 设置悬停控制点
   * @param point 控制点
   */
  setHoverPoint(point: ControlPoint | null): void {
    if (this.hoverPoint && this.hoverPoint !== this.activePoint) {
      this.updatePointStyle(this.hoverPoint, false, false)
    }

    this.hoverPoint = point

    if (point && point !== this.activePoint) {
      this.updatePointStyle(point, false, true)
    }
  }

  /**
   * 获取激活控制点
   */
  getActivePoint(): ControlPoint | null {
    return this.activePoint
  }

  /**
   * 点击测试
   * @param point 测试点
   */
  hitTest(point: Point): ControlPoint | null {
    return this.controlPointsManager.hitTest(point)
  }

  /**
   * 获取所有可见控制点
   */
  getVisibleControlPoints(): ControlPoint[] {
    return this.controlPointsManager.getVisibleControlPoints()
  }

  /**
   * 更新渲染器配置
   * @param options 新配置
   */
  updateRendererOptions(options: Partial<ControlPointsRendererOptions>): void {
    this.rendererOptions = { ...this.rendererOptions, ...options }

    // 更新控制点管理器配置
    this.controlPointsManager.updateOptions({
      size: this.rendererOptions.pointSize,
      showCorners: this.rendererOptions.showCorners,
      showEdges: this.rendererOptions.showEdges,
      showCenter: this.rendererOptions.showCenter,
      showRotate: this.rendererOptions.showRotate,
    })

    // 重新渲染
    if (this.currentCropArea) {
      this.renderControlPoints()
    }
  }

  /**
   * 渲染控制点
   */
  private renderControlPoints(): void {
    // 清除现有控制点
    this.clearControlPoints()

    if (!this.currentCropArea) return

    const controlPoints = this.controlPointsManager.getVisibleControlPoints()

    controlPoints.forEach(point => {
      this.renderControlPoint(point)
    })

    // 渲染连接线
    if (this.rendererOptions.showConnectingLines) {
      this.renderConnectingLines(controlPoints)
    }
  }

  /**
   * 渲染单个控制点
   * @param point 控制点
   */
  private renderControlPoint(point: ControlPoint): void {
    const element = document.createElement('div')
    element.className = `${this.options.classPrefix}__handle ${this.options.classPrefix}__handle--${point.type}`

    // 设置位置和大小
    element.style.position = 'absolute'
    element.style.left = `${point.x}px`
    element.style.top = `${point.y}px`
    element.style.width = `${this.rendererOptions.pointSize}px`
    element.style.height = `${this.rendererOptions.pointSize}px`
    element.style.backgroundColor = this.rendererOptions.pointColor
    element.style.border = '2px solid white'
    element.style.borderRadius = '50%'
    element.style.cursor = point.cursor
    element.style.transform = 'translate(-50%, -50%)'
    element.style.pointerEvents = 'auto'
    element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
    element.style.transition = 'all 0.2s ease-in-out'

    // 添加事件监听器
    this.setupPointEventListeners(element, point)

    this.element.appendChild(element)
    this.pointElements.set(point.type, { element, point })
  }

  /**
   * 设置控制点事件监听器
   * @param element 控制点元素
   * @param point 控制点数据
   */
  private setupPointEventListeners(element: HTMLElement, point: ControlPoint): void {
    // 鼠标进入
    element.addEventListener('mouseenter', () => {
      this.setHoverPoint(point)
    })

    // 鼠标离开
    element.addEventListener('mouseleave', () => {
      if (this.hoverPoint === point) {
        this.setHoverPoint(null)
      }
    })

    // 鼠标按下
    element.addEventListener('mousedown', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.setActivePoint(point)
      this.emit('point-mousedown' as any, { point, event })
    })

    // 触摸开始
    element.addEventListener('touchstart', (event) => {
      event.preventDefault()
      event.stopPropagation()
      this.setActivePoint(point)
      this.emit('point-touchstart' as any, { point, event })
    }, { passive: false })
  }

  /**
   * 更新控制点样式
   * @param point 控制点
   * @param active 是否激活
   * @param hover 是否悬停
   */
  private updatePointStyle(point: ControlPoint, active: boolean, hover: boolean): void {
    const pointElement = this.pointElements.get(point.type)
    if (!pointElement) return

    const { element } = pointElement

    if (active) {
      element.style.backgroundColor = this.rendererOptions.activeColor
      element.style.transform = 'translate(-50%, -50%) scale(1.2)'
      element.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'
    } else if (hover) {
      element.style.backgroundColor = this.rendererOptions.hoverColor
      element.style.transform = 'translate(-50%, -50%) scale(1.1)'
      element.style.boxShadow = '0 3px 6px rgba(0, 0, 0, 0.25)'
    } else {
      element.style.backgroundColor = this.rendererOptions.pointColor
      element.style.transform = 'translate(-50%, -50%) scale(1)'
      element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)'
    }
  }

  /**
   * 渲染连接线
   * @param points 控制点列表
   */
  private renderConnectingLines(points: ControlPoint[]): void {
    if (!this.currentCropArea || this.currentCropArea.shape !== CropShape.RECTANGLE) {
      return
    }

    // 创建连接线容器
    const linesContainer = document.createElement('div')
    linesContainer.className = `${this.options.classPrefix}__connecting-lines`
    linesContainer.style.position = 'absolute'
    linesContainer.style.top = '0'
    linesContainer.style.left = '0'
    linesContainer.style.width = '100%'
    linesContainer.style.height = '100%'
    linesContainer.style.pointerEvents = 'none'

    // 绘制矩形边框
    const { x, y, width, height } = this.currentCropArea

    const borderElement = document.createElement('div')
    borderElement.style.position = 'absolute'
    borderElement.style.left = `${x}px`
    borderElement.style.top = `${y}px`
    borderElement.style.width = `${width}px`
    borderElement.style.height = `${height}px`
    borderElement.style.border = '1px dashed rgba(114, 46, 209, 0.5)'
    borderElement.style.pointerEvents = 'none'

    linesContainer.appendChild(borderElement)
    this.element.appendChild(linesContainer)
  }

  /**
   * 清除控制点
   */
  private clearControlPoints(): void {
    this.element.innerHTML = ''
    this.pointElements.clear()
    this.activePoint = null
    this.hoverPoint = null
  }

  /**
   * 销毁前回调
   */
  protected beforeDestroy(): void {
    this.clearControlPoints()
    super.beforeDestroy()
  }
}
