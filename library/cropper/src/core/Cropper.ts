/**
 * @file 裁剪器核心类
 * @description 图片裁剪器的主要实现类
 */

import type {
  CropperOptions,
  CropData,
  ImageInfo,
  ImageSource,
  TransformState,
  CropperEventType,
  ImageFormat,
  CropOutputOptions,
  CompatibilityResult,
  Size,
  Point,
  Rect,
  CropShape,
  AspectRatio,
} from '../types'

import { EventEmitter } from '../utils/events'
import { getElement, createElement, addClass, removeClass, setStyle } from '../utils/dom'
import { loadImageSource, getImageInfo, canvasToBlob, canvasToDataURL } from '../utils/image'
import { checkCompatibility } from '../utils/compatibility'
import { fitSize, clamp, getRectCenter, adjustRectByAspectRatio } from '../utils/math'

/**
 * 默认配置选项
 */
const DEFAULT_OPTIONS: Partial<CropperOptions> = {
  shape: CropShape.RECTANGLE,
  aspectRatio: AspectRatio.FREE,
  movable: true,
  resizable: true,
  zoomable: true,
  rotatable: true,
  zoomRange: [0.1, 10],
  backgroundColor: '#000000',
  maskOpacity: 0.6,
  guides: true,
  centerLines: false,
  responsive: true,
  touchEnabled: true,
  autoCrop: true,
}

/**
 * 裁剪器核心类
 */
export class Cropper extends EventEmitter {
  private container: HTMLElement
  private options: CropperOptions
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private image: HTMLImageElement | null = null
  private imageInfo: ImageInfo | null = null
  private transformState: TransformState
  private cropData: CropData
  private isDestroyed = false
  private isReady = false

  // UI 元素
  private cropBox: HTMLElement
  private dragHandles: HTMLElement[] = []
  private overlay: HTMLElement

  // 交互状态
  private isDragging = false
  private isResizing = false
  private dragStartPoint: Point | null = null
  private dragStartCrop: Rect | null = null

  /**
   * 构造函数
   */
  constructor(options: CropperOptions) {
    super()

    // 验证容器
    const container = getElement(options.container)
    if (!container) {
      throw new Error('Container element not found')
    }

    this.container = container
    this.options = { ...DEFAULT_OPTIONS, ...options }

    // 初始化状态
    this.transformState = {
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      translate: { x: 0, y: 0 },
    }

    this.cropData = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      shape: this.options.shape!,
    }

    // 初始化UI
    this.initializeUI()
    this.bindEvents()

    // 触发ready事件
    setTimeout(() => {
      this.isReady = true
      this.emit(CropperEventType.READY)
      this.options.onReady?.(this.createEvent(CropperEventType.READY))
    }, 0)
  }

  /**
   * 初始化UI
   */
  private initializeUI(): void {
    // 设置容器样式
    addClass(this.container, 'cropper-container')
    setStyle(this.container, {
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none',
    })

    // 创建Canvas
    this.canvas = createElement('canvas', 'cropper-canvas') as HTMLCanvasElement
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    this.ctx = ctx

    // 创建遮罩层
    this.overlay = createElement('div', 'cropper-overlay')
    setStyle(this.overlay, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundColor: this.options.backgroundColor,
      opacity: this.options.maskOpacity?.toString(),
      pointerEvents: 'none',
    })

    // 创建裁剪框
    this.cropBox = createElement('div', 'cropper-crop-box')
    setStyle(this.cropBox, {
      position: 'absolute',
      border: '2px solid #39f',
      cursor: 'move',
      boxSizing: 'border-box',
    })

    // 创建拖拽手柄
    this.createDragHandles()

    // 添加到容器
    this.container.appendChild(this.canvas)
    this.container.appendChild(this.overlay)
    this.container.appendChild(this.cropBox)
  }

  /**
   * 创建拖拽手柄
   */
  private createDragHandles(): void {
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
      })

      this.positionHandle(handle, position)
      this.dragHandles.push(handle)
      this.cropBox.appendChild(handle)
    })
  }

  /**
   * 获取手柄光标样式
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
    // 容器大小变化
    if (this.options.responsive) {
      window.addEventListener('resize', this.handleResize.bind(this))
    }

    // 裁剪框拖拽
    this.cropBox.addEventListener('mousedown', this.handleCropBoxMouseDown.bind(this))
    this.cropBox.addEventListener('touchstart', this.handleCropBoxTouchStart.bind(this))

    // 手柄拖拽
    this.dragHandles.forEach(handle => {
      handle.addEventListener('mousedown', this.handleHandleMouseDown.bind(this))
      handle.addEventListener('touchstart', this.handleHandleTouchStart.bind(this))
    })

    // 全局事件
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    document.addEventListener('touchmove', this.handleTouchMove.bind(this))
    document.addEventListener('touchend', this.handleTouchEnd.bind(this))

    // 滚轮缩放
    if (this.options.zoomable) {
      this.container.addEventListener('wheel', this.handleWheel.bind(this))
    }
  }

  /**
   * 设置图片
   */
  async setImage(source: ImageSource): Promise<void> {
    this.checkDestroyed()

    try {
      this.image = await loadImageSource(source)
      this.imageInfo = getImageInfo(this.image)

      this.updateCanvas()
      this.initializeCrop()

      this.emit(CropperEventType.IMAGE_LOADED, {
        imageInfo: this.imageInfo,
      })

    } catch (error) {
      this.emit(CropperEventType.IMAGE_ERROR, { error })
      throw error
    }
  }

  /**
   * 更新Canvas
   */
  private updateCanvas(): void {
    if (!this.image || !this.imageInfo) return

    const containerSize = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }

    const imageSize = fitSize(
      { width: this.imageInfo.naturalWidth, height: this.imageInfo.naturalHeight },
      containerSize,
      'contain'
    )

    this.canvas.width = imageSize.width
    this.canvas.height = imageSize.height

    setStyle(this.canvas, {
      width: `${imageSize.width}px`,
      height: `${imageSize.height}px`,
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    })

    this.drawImage()
  }

  /**
   * 绘制图片
   */
  private drawImage(): void {
    if (!this.image || !this.ctx) return

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.save()

    // 应用变换
    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    this.ctx.translate(centerX, centerY)
    this.ctx.scale(
      this.transformState.scale * (this.transformState.flipX ? -1 : 1),
      this.transformState.scale * (this.transformState.flipY ? -1 : 1)
    )
    this.ctx.rotate((this.transformState.rotation * Math.PI) / 180)
    this.ctx.translate(-centerX, -centerY)

    this.ctx.drawImage(this.image, 0, 0, this.canvas.width, this.canvas.height)

    this.ctx.restore()
  }

  /**
   * 初始化裁剪区域
   */
  private initializeCrop(): void {
    if (!this.options.autoCrop) return

    const canvasRect = this.canvas.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    // 计算默认裁剪区域（Canvas的80%）
    const cropWidth = canvasRect.width * 0.8
    const cropHeight = canvasRect.height * 0.8

    let finalWidth = cropWidth
    let finalHeight = cropHeight

    // 应用宽高比
    if (this.options.aspectRatio && this.options.aspectRatio > 0) {
      const rect = adjustRectByAspectRatio(
        { x: 0, y: 0, width: cropWidth, height: cropHeight },
        this.options.aspectRatio,
        'center'
      )
      finalWidth = rect.width
      finalHeight = rect.height
    }

    this.cropData = {
      x: (canvasRect.width - finalWidth) / 2,
      y: (canvasRect.height - finalHeight) / 2,
      width: finalWidth,
      height: finalHeight,
      shape: this.options.shape!,
    }

    this.updateCropBox()
  }

  /**
   * 更新裁剪框
   */
  private updateCropBox(): void {
    const canvasRect = this.canvas.getBoundingClientRect()
    const containerRect = this.container.getBoundingClientRect()

    const left = canvasRect.left - containerRect.left + this.cropData.x
    const top = canvasRect.top - containerRect.top + this.cropData.y

    setStyle(this.cropBox, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${this.cropData.width}px`,
      height: `${this.cropData.height}px`,
      display: 'block',
    })

    // 更新遮罩
    this.updateOverlay()
  }

  /**
   * 更新遮罩
   */
  private updateOverlay(): void {
    // 这里可以实现更复杂的遮罩效果
    // 暂时保持简单的实现
  }

  /**
   * 创建事件对象
   */
  private createEvent(type: CropperEventType, data?: any): any {
    return {
      type,
      target: this,
      cropData: { ...this.cropData },
      imageInfo: this.imageInfo ? { ...this.imageInfo } : undefined,
      transformState: { ...this.transformState },
      ...data,
    }
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.isDestroyed) {
      throw new Error('Cropper instance has been destroyed')
    }
  }

  /**
   * 获取裁剪数据
   */
  getCropData(): CropData {
    this.checkDestroyed()
    return { ...this.cropData }
  }

  /**
   * 设置裁剪数据
   */
  setCropData(data: Partial<CropData>): void {
    this.checkDestroyed()

    this.cropData = { ...this.cropData, ...data }
    this.updateCropBox()

    this.emit(CropperEventType.CROP_CHANGE, { cropData: this.cropData })
  }

  /**
   * 获取裁剪后的Canvas
   */
  getCroppedCanvas(options?: CropOutputOptions): HTMLCanvasElement {
    this.checkDestroyed()

    if (!this.image) {
      throw new Error('No image loaded')
    }

    const canvas = createElement('canvas') as HTMLCanvasElement
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    const outputSize = options?.size || {
      width: this.cropData.width,
      height: this.cropData.height
    }

    canvas.width = outputSize.width
    canvas.height = outputSize.height

    // 填充背景
    if (options?.fillBackground) {
      ctx.fillStyle = options.backgroundColor || '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    // 计算源区域
    const scaleX = this.image.naturalWidth / this.canvas.width
    const scaleY = this.image.naturalHeight / this.canvas.height

    const sourceX = this.cropData.x * scaleX
    const sourceY = this.cropData.y * scaleY
    const sourceWidth = this.cropData.width * scaleX
    const sourceHeight = this.cropData.height * scaleY

    ctx.drawImage(
      this.image,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, canvas.width, canvas.height
    )

    return canvas
  }

  /**
   * 获取裁剪后的DataURL
   */
  getCroppedDataURL(options?: CropOutputOptions): string {
    const canvas = this.getCroppedCanvas(options)
    return canvasToDataURL(
      canvas,
      options?.format,
      options?.quality
    )
  }

  /**
   * 获取裁剪后的Blob
   */
  async getCroppedBlob(options?: CropOutputOptions): Promise<Blob> {
    const canvas = this.getCroppedCanvas(options)
    return canvasToBlob(
      canvas,
      options?.format,
      options?.quality
    )
  }

  /**
   * 缩放
   */
  zoom(scale: number): void {
    this.checkDestroyed()

    const [minScale, maxScale] = this.options.zoomRange!
    this.transformState.scale = clamp(scale, minScale, maxScale)

    this.drawImage()
    this.emit(CropperEventType.ZOOM_CHANGE, {
      scale: this.transformState.scale
    })
  }

  /**
   * 放大
   */
  zoomIn(delta: number = 0.1): void {
    this.zoom(this.transformState.scale + delta)
  }

  /**
   * 缩小
   */
  zoomOut(delta: number = 0.1): void {
    this.zoom(this.transformState.scale - delta)
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    this.checkDestroyed()

    this.transformState.rotation = angle % 360
    this.drawImage()

    this.emit(CropperEventType.ROTATION_CHANGE, {
      rotation: this.transformState.rotation
    })
  }

  /**
   * 向左旋转90度
   */
  rotateLeft(): void {
    this.rotate(this.transformState.rotation - 90)
  }

  /**
   * 向右旋转90度
   */
  rotateRight(): void {
    this.rotate(this.transformState.rotation + 90)
  }

  /**
   * 翻转
   */
  flip(horizontal: boolean, vertical: boolean): void {
    this.checkDestroyed()

    this.transformState.flipX = horizontal
    this.transformState.flipY = vertical

    this.drawImage()
    this.emit(CropperEventType.FLIP_CHANGE, {
      flipX: this.transformState.flipX,
      flipY: this.transformState.flipY
    })
  }

  /**
   * 水平翻转
   */
  flipHorizontal(): void {
    this.flip(!this.transformState.flipX, this.transformState.flipY)
  }

  /**
   * 垂直翻转
   */
  flipVertical(): void {
    this.flip(this.transformState.flipX, !this.transformState.flipY)
  }

  /**
   * 重置
   */
  reset(): void {
    this.checkDestroyed()

    this.transformState = {
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      translate: { x: 0, y: 0 },
    }

    this.drawImage()
    this.initializeCrop()

    this.emit(CropperEventType.RESET)
  }

  /**
   * 销毁
   */
  destroy(): void {
    if (this.isDestroyed) return

    this.isDestroyed = true

    // 移除事件监听器
    this.removeAllListeners()

    // 清理DOM
    if (this.container.contains(this.canvas)) {
      this.container.removeChild(this.canvas)
    }
    if (this.container.contains(this.overlay)) {
      this.container.removeChild(this.overlay)
    }
    if (this.container.contains(this.cropBox)) {
      this.container.removeChild(this.cropBox)
    }

    removeClass(this.container, 'cropper-container')

    this.emit(CropperEventType.DESTROY)
  }

  // ============================================================================
  // 事件处理方法
  // ============================================================================

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    if (this.options.responsive) {
      this.updateCanvas()
      this.updateCropBox()
    }
  }

  /**
   * 处理裁剪框鼠标按下
   */
  private handleCropBoxMouseDown(event: MouseEvent): void {
    if (!this.options.movable) return

    event.preventDefault()
    this.startDrag(event)
  }

  /**
   * 处理裁剪框触摸开始
   */
  private handleCropBoxTouchStart(event: TouchEvent): void {
    if (!this.options.movable || !this.options.touchEnabled) return

    event.preventDefault()
    this.startDrag(event)
  }

  /**
   * 处理手柄鼠标按下
   */
  private handleHandleMouseDown(event: MouseEvent): void {
    if (!this.options.resizable) return

    event.preventDefault()
    event.stopPropagation()
    this.startResize(event)
  }

  /**
   * 处理手柄触摸开始
   */
  private handleHandleTouchStart(event: TouchEvent): void {
    if (!this.options.resizable || !this.options.touchEnabled) return

    event.preventDefault()
    event.stopPropagation()
    this.startResize(event)
  }

  /**
   * 处理鼠标移动
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.updateDrag(event)
    } else if (this.isResizing) {
      this.updateResize(event)
    }
  }

  /**
   * 处理鼠标释放
   */
  private handleMouseUp(event: MouseEvent): void {
    if (this.isDragging) {
      this.endDrag(event)
    } else if (this.isResizing) {
      this.endResize(event)
    }
  }

  /**
   * 处理触摸移动
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.isDragging) {
      this.updateDrag(event)
    } else if (this.isResizing) {
      this.updateResize(event)
    }
  }

  /**
   * 处理触摸结束
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.isDragging) {
      this.endDrag(event)
    } else if (this.isResizing) {
      this.endResize(event)
    }
  }

  /**
   * 处理滚轮事件
   */
  private handleWheel(event: WheelEvent): void {
    if (!this.options.zoomable) return

    event.preventDefault()

    const delta = event.deltaY > 0 ? -0.1 : 0.1
    this.zoomIn(delta)
  }

  /**
   * 开始拖拽
   */
  private startDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = true
    this.dragStartPoint = this.getEventPoint(event)
    this.dragStartCrop = { ...this.cropData }

    this.emit(CropperEventType.DRAG_START)
  }

  /**
   * 更新拖拽
   */
  private updateDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging || !this.dragStartPoint || !this.dragStartCrop) return

    const currentPoint = this.getEventPoint(event)
    const deltaX = currentPoint.x - this.dragStartPoint.x
    const deltaY = currentPoint.y - this.dragStartPoint.y

    this.cropData.x = this.dragStartCrop.x + deltaX
    this.cropData.y = this.dragStartCrop.y + deltaY

    this.constrainCropData()
    this.updateCropBox()

    this.emit(CropperEventType.DRAG_MOVE, { cropData: this.cropData })
  }

  /**
   * 结束拖拽
   */
  private endDrag(event: MouseEvent | TouchEvent): void {
    this.isDragging = false
    this.dragStartPoint = null
    this.dragStartCrop = null

    this.emit(CropperEventType.DRAG_END, { cropData: this.cropData })
    this.emit(CropperEventType.CROP_CHANGE, { cropData: this.cropData })
  }

  /**
   * 开始调整大小
   */
  private startResize(event: MouseEvent | TouchEvent): void {
    this.isResizing = true
    this.dragStartPoint = this.getEventPoint(event)
    this.dragStartCrop = { ...this.cropData }

    this.emit(CropperEventType.CROP_START)
  }

  /**
   * 更新调整大小
   */
  private updateResize(event: MouseEvent | TouchEvent): void {
    if (!this.isResizing || !this.dragStartPoint || !this.dragStartCrop) return

    // 这里需要根据具体的手柄来调整大小
    // 简化实现，只处理右下角调整
    const currentPoint = this.getEventPoint(event)
    const deltaX = currentPoint.x - this.dragStartPoint.x
    const deltaY = currentPoint.y - this.dragStartPoint.y

    this.cropData.width = Math.max(50, this.dragStartCrop.width + deltaX)
    this.cropData.height = Math.max(50, this.dragStartCrop.height + deltaY)

    // 应用宽高比约束
    if (this.options.aspectRatio && this.options.aspectRatio > 0) {
      const rect = adjustRectByAspectRatio(this.cropData, this.options.aspectRatio)
      this.cropData.width = rect.width
      this.cropData.height = rect.height
    }

    this.constrainCropData()
    this.updateCropBox()

    this.emit(CropperEventType.CROP_MOVE, { cropData: this.cropData })
  }

  /**
   * 结束调整大小
   */
  private endResize(event: MouseEvent | TouchEvent): void {
    this.isResizing = false
    this.dragStartPoint = null
    this.dragStartCrop = null

    this.emit(CropperEventType.CROP_END, { cropData: this.cropData })
    this.emit(CropperEventType.CROP_CHANGE, { cropData: this.cropData })
  }

  /**
   * 获取事件坐标
   */
  private getEventPoint(event: MouseEvent | TouchEvent): Point {
    if ('touches' in event && event.touches.length > 0) {
      return { x: event.touches[0].clientX, y: event.touches[0].clientY }
    } else if ('clientX' in event) {
      return { x: event.clientX, y: event.clientY }
    }
    return { x: 0, y: 0 }
  }

  /**
   * 约束裁剪数据
   */
  private constrainCropData(): void {
    const canvasRect = this.canvas.getBoundingClientRect()

    // 约束位置
    this.cropData.x = clamp(this.cropData.x, 0, canvasRect.width - this.cropData.width)
    this.cropData.y = clamp(this.cropData.y, 0, canvasRect.height - this.cropData.height)

    // 约束尺寸
    const minSize = this.options.minCropSize || { width: 50, height: 50 }
    const maxSize = this.options.maxCropSize || { width: canvasRect.width, height: canvasRect.height }

    this.cropData.width = clamp(this.cropData.width, minSize.width, maxSize.width)
    this.cropData.height = clamp(this.cropData.height, minSize.height, maxSize.height)
  }

  // ============================================================================
  // 静态方法
  // ============================================================================

  /**
   * 创建裁剪器实例
   */
  static create(options: CropperOptions): Cropper {
    return new Cropper(options)
  }

  /**
   * 检查兼容性
   */
  static checkCompatibility(): CompatibilityResult {
    return checkCompatibility()
  }

  /**
   * 获取版本信息
   */
  static getVersion(): string {
    return '1.0.0' // 这里应该从package.json读取
  }

  /**
   * 检查是否支持指定功能
   */
  static isSupported(feature?: string): boolean {
    const compatibility = checkCompatibility()

    if (!feature) {
      return compatibility.supported
    }

    return (compatibility.features as any)[feature] || false
  }

  /**
   * 获取默认配置
   */
  static getDefaultOptions(): Partial<CropperOptions> {
    return { ...DEFAULT_OPTIONS }
  }

  /**
   * 合并配置选项
   */
  static mergeOptions(
    defaultOptions: Partial<CropperOptions>,
    userOptions: Partial<CropperOptions>
  ): CropperOptions {
    return { ...defaultOptions, ...userOptions } as CropperOptions
  }
}
