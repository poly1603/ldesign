/**
 * @file 裁剪框组件
 * @description 管理裁剪区域的显示和交互
 */

import type {
  CropData,
  CropShape,
  Point,
  Size,
  Rect,
  DragType,
  CropperEventType,
} from '../types'

import {
  createElement,
  addClass,
  removeClass,
  setStyle,
  getBoundingRect,
  getRelativePosition,
} from '../utils/dom'

import {
  clamp,
  isPointInRect,
  isPointInCircle,
  getRectCenter,
  adjustRectByAspectRatio,
  constrainRect,
} from '../utils/math'

import { EventEmitter } from '../utils/events'

/**
 * 裁剪框类
 */
export class CropBox extends EventEmitter {
  private container: HTMLElement
  private element: HTMLElement
  private overlay: HTMLElement
  private handles: HTMLElement[] = []
  private guides: HTMLElement[] = []
  
  private cropData: CropData
  private shape: CropShape
  private aspectRatio: number
  private minSize: Size
  private maxSize: Size
  private bounds: Rect
  
  private isDragging = false
  private isResizing = false
  private dragType: DragType | null = null
  private dragStartPoint: Point | null = null
  private dragStartCrop: Rect | null = null
  
  private showGuides = true
  private showCenterLines = false

  constructor(
    container: HTMLElement,
    options: {
      shape?: CropShape
      aspectRatio?: number
      minSize?: Size
      maxSize?: Size
      showGuides?: boolean
      showCenterLines?: boolean
    } = {}
  ) {
    super()
    
    this.container = container
    this.shape = options.shape || CropShape.RECTANGLE
    this.aspectRatio = options.aspectRatio || 0
    this.minSize = options.minSize || { width: 50, height: 50 }
    this.maxSize = options.maxSize || { width: Infinity, height: Infinity }
    this.showGuides = options.showGuides !== false
    this.showCenterLines = options.showCenterLines || false
    
    this.cropData = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      shape: this.shape,
    }
    
    this.bounds = { x: 0, y: 0, width: 0, height: 0 }
    
    this.createElement()
    this.bindEvents()
  }

  /**
   * 创建元素
   */
  private createElement(): void {
    // 创建主元素
    this.element = createElement('div', 'cropper-crop-box')
    setStyle(this.element, {
      position: 'absolute',
      border: '2px solid #39f',
      cursor: 'move',
      boxSizing: 'border-box',
      zIndex: '1000',
    })

    // 创建遮罩
    this.overlay = createElement('div', 'cropper-overlay')
    setStyle(this.overlay, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      pointerEvents: 'none',
    })

    // 根据形状设置样式
    if (this.shape === CropShape.CIRCLE) {
      setStyle(this.element, { borderRadius: '50%' })
    } else if (this.shape === CropShape.ELLIPSE) {
      setStyle(this.element, { borderRadius: '50%' })
    }

    // 创建拖拽手柄
    this.createHandles()
    
    // 创建辅助线
    if (this.showGuides) {
      this.createGuides()
    }

    // 添加到容器
    this.container.appendChild(this.overlay)
    this.container.appendChild(this.element)
  }

  /**
   * 创建拖拽手柄
   */
  private createHandles(): void {
    const handlePositions = [
      'nw', 'n', 'ne',
      'w',       'e',
      'sw', 's', 'se',
    ]

    handlePositions.forEach(position => {
      const handle = createElement('div', `cropper-handle cropper-handle-${position}`)
      setStyle(handle, {
        position: 'absolute',
        width: '8px',
        height: '8px',
        backgroundColor: '#39f',
        border: '1px solid #fff',
        cursor: this.getHandleCursor(position),
        zIndex: '1001',
      })

      this.positionHandle(handle, position)
      this.handles.push(handle)
      this.element.appendChild(handle)
    })
  }

  /**
   * 创建辅助线
   */
  private createGuides(): void {
    // 创建九宫格线
    for (let i = 1; i <= 2; i++) {
      // 垂直线
      const vLine = createElement('div', 'cropper-guide cropper-guide-v')
      setStyle(vLine, {
        position: 'absolute',
        top: '0',
        left: `${(i * 33.33)}%`,
        width: '1px',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
      })
      this.guides.push(vLine)
      this.element.appendChild(vLine)

      // 水平线
      const hLine = createElement('div', 'cropper-guide cropper-guide-h')
      setStyle(hLine, {
        position: 'absolute',
        top: `${(i * 33.33)}%`,
        left: '0',
        width: '100%',
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        pointerEvents: 'none',
      })
      this.guides.push(hLine)
      this.element.appendChild(hLine)
    }

    // 中心线
    if (this.showCenterLines) {
      const centerV = createElement('div', 'cropper-center-line cropper-center-v')
      setStyle(centerV, {
        position: 'absolute',
        top: '0',
        left: '50%',
        width: '1px',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        pointerEvents: 'none',
      })
      this.guides.push(centerV)
      this.element.appendChild(centerV)

      const centerH = createElement('div', 'cropper-center-line cropper-center-h')
      setStyle(centerH, {
        position: 'absolute',
        top: '50%',
        left: '0',
        width: '100%',
        height: '1px',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        pointerEvents: 'none',
      })
      this.guides.push(centerH)
      this.element.appendChild(centerH)
    }
  }

  /**
   * 获取手柄光标
   */
  private getHandleCursor(position: string): string {
    const cursors: Record<string, string> = {
      nw: 'nw-resize',
      n: 'n-resize',
      ne: 'ne-resize',
      w: 'w-resize',
      e: 'e-resize',
      sw: 'sw-resize',
      s: 's-resize',
      se: 'se-resize',
    }
    return cursors[position] || 'default'
  }

  /**
   * 定位手柄
   */
  private positionHandle(handle: HTMLElement, position: string): void {
    const size = 8
    const offset = -size / 2

    switch (position) {
      case 'nw':
        setStyle(handle, { top: `${offset}px`, left: `${offset}px` })
        break
      case 'n':
        setStyle(handle, { top: `${offset}px`, left: '50%', marginLeft: `${offset}px` })
        break
      case 'ne':
        setStyle(handle, { top: `${offset}px`, right: `${offset}px` })
        break
      case 'w':
        setStyle(handle, { top: '50%', left: `${offset}px`, marginTop: `${offset}px` })
        break
      case 'e':
        setStyle(handle, { top: '50%', right: `${offset}px`, marginTop: `${offset}px` })
        break
      case 'sw':
        setStyle(handle, { bottom: `${offset}px`, left: `${offset}px` })
        break
      case 's':
        setStyle(handle, { bottom: `${offset}px`, left: '50%', marginLeft: `${offset}px` })
        break
      case 'se':
        setStyle(handle, { bottom: `${offset}px`, right: `${offset}px` })
        break
    }
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 裁剪框拖拽
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this))
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this))

    // 手柄拖拽
    this.handles.forEach((handle, index) => {
      handle.addEventListener('mousedown', (e) => this.handleHandleMouseDown(e, index))
      handle.addEventListener('touchstart', (e) => this.handleHandleTouchStart(e, index))
    })

    // 全局事件
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    document.addEventListener('touchmove', this.handleTouchMove.bind(this))
    document.addEventListener('touchend', this.handleTouchEnd.bind(this))
  }

  /**
   * 设置边界
   */
  setBounds(bounds: Rect): void {
    this.bounds = bounds
    this.constrainCropData()
    this.updatePosition()
  }

  /**
   * 设置裁剪数据
   */
  setCropData(data: Partial<CropData>): void {
    this.cropData = { ...this.cropData, ...data }
    this.constrainCropData()
    this.updatePosition()
  }

  /**
   * 获取裁剪数据
   */
  getCropData(): CropData {
    return { ...this.cropData }
  }

  /**
   * 更新位置
   */
  private updatePosition(): void {
    setStyle(this.element, {
      left: `${this.cropData.x}px`,
      top: `${this.cropData.y}px`,
      width: `${this.cropData.width}px`,
      height: `${this.cropData.height}px`,
    })

    this.updateOverlay()
  }

  /**
   * 更新遮罩
   */
  private updateOverlay(): void {
    // 使用CSS clip-path创建遮罩效果
    const clipPath = this.shape === CropShape.CIRCLE || this.shape === CropShape.ELLIPSE
      ? `ellipse(${this.cropData.width/2}px ${this.cropData.height/2}px at ${this.cropData.x + this.cropData.width/2}px ${this.cropData.y + this.cropData.height/2}px)`
      : `polygon(0% 0%, 0% 100%, ${this.cropData.x}px 100%, ${this.cropData.x}px ${this.cropData.y}px, ${this.cropData.x + this.cropData.width}px ${this.cropData.y}px, ${this.cropData.x + this.cropData.width}px ${this.cropData.y + this.cropData.height}px, ${this.cropData.x}px ${this.cropData.y + this.cropData.height}px, ${this.cropData.x}px 100%, 100% 100%, 100% 0%)`

    setStyle(this.overlay, {
      clipPath: `polygon(0% 0%, 0% 100%, ${this.cropData.x}px 100%, ${this.cropData.x}px ${this.cropData.y}px, ${this.cropData.x + this.cropData.width}px ${this.cropData.y}px, ${this.cropData.x + this.cropData.width}px ${this.cropData.y + this.cropData.height}px, ${this.cropData.x}px ${this.cropData.y + this.cropData.height}px, ${this.cropData.x}px 100%, 100% 100%, 100% 0%)`,
    })
  }

  /**
   * 约束裁剪数据
   */
  private constrainCropData(): void {
    // 约束尺寸
    this.cropData.width = clamp(this.cropData.width, this.minSize.width, Math.min(this.maxSize.width, this.bounds.width))
    this.cropData.height = clamp(this.cropData.height, this.minSize.height, Math.min(this.maxSize.height, this.bounds.height))

    // 应用宽高比
    if (this.aspectRatio > 0) {
      const rect = adjustRectByAspectRatio(this.cropData, this.aspectRatio)
      this.cropData.width = rect.width
      this.cropData.height = rect.height
    }

    // 约束位置
    this.cropData.x = clamp(this.cropData.x, this.bounds.x, this.bounds.x + this.bounds.width - this.cropData.width)
    this.cropData.y = clamp(this.cropData.y, this.bounds.y, this.bounds.y + this.bounds.height - this.cropData.height)
  }

  // 事件处理方法（占位符）
  private handleMouseDown(event: MouseEvent): void {}
  private handleTouchStart(event: TouchEvent): void {}
  private handleHandleMouseDown(event: MouseEvent, handleIndex: number): void {}
  private handleHandleTouchStart(event: TouchEvent, handleIndex: number): void {}
  private handleMouseMove(event: MouseEvent): void {}
  private handleMouseUp(event: MouseEvent): void {}
  private handleTouchMove(event: TouchEvent): void {}
  private handleTouchEnd(event: TouchEvent): void {}

  /**
   * 销毁
   */
  destroy(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay)
    }
    this.removeAllListeners()
  }
}
