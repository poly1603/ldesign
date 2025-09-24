/**
 * @file 核心裁剪器类
 * @description 实现图片裁剪器的核心功能
 */

import { EventEmitter } from './EventEmitter'
import {
  getImageInfo,
  isSupportedImageType,
  createCanvas,
  clearCanvas,
  clamp,
  getBoundingBox,
  getElementRect,
  getRelativeMousePosition,
  getRelativeTouchPosition,
  isPointInRect,
  debounce,
  isValidNumber,
  isValidRect
} from '../utils'
import type {
  CropperOptions,
  CropperConfig,
  CropData,
  ExportOptions,
  ImageSource,
  CropShape,
  CompatibilityResult,
  FeatureSupport,
  Point,
  Rect,
  Transform
} from '../types'
import { CropperEventType, ImageFormat } from '../types'

/**
 * 图片裁剪器核心类
 */
export class Cropper extends EventEmitter {
  /** 容器元素 */
  private container: HTMLElement
  /** 配置选项 */
  private config: Required<CropperConfig>
  /** Canvas元素 */
  private canvas: HTMLCanvasElement
  /** Canvas上下文 */
  private ctx: CanvasRenderingContext2D
  /** 当前图片 */
  private image: HTMLImageElement | null = null
  /** 是否已销毁 */
  private destroyed = false
  /** 当前裁剪数据 */
  private cropData: CropData
  /** 当前缩放比例 */
  private scale = 1
  /** 当前旋转角度 */
  private rotation = 0
  /** 水平翻转状态 */
  private flipX = false
  /** 垂直翻转状态 */
  private flipY = false
  /** 图片变换矩阵 */
  private imageTransform: Transform = {
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0
  }
  /** 是否正在拖拽 */
  private isDragging = false
  /** 是否正在调整大小 */
  private isResizing = false
  /** 拖拽起始点 */
  private dragStartPoint: Point | null = null
  /** 调整大小的控制点 */
  private resizeHandle: string | null = null
  /** ResizeObserver实例 */
  private resizeObserver: ResizeObserver | null = null

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: CropperOptions) {
    super()
    
    // 获取容器元素
    this.container = this.getContainer(options.container)
    
    // 初始化配置
    this.config = this.mergeConfig(options)
    
    // 初始化Canvas
    this.initCanvas()
    
    // 初始化裁剪数据
    this.cropData = {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      shape: this.config.shape
    }
    
    // 初始化事件监听
    this.initEventListeners()
    
    // 触发就绪事件
    setTimeout(() => {
      this.emit(CropperEventType.READY)
    }, 0)
  }

  /**
   * 获取容器元素
   * @param container 容器元素或选择器
   * @returns 容器元素
   */
  private getContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement
      if (!element) {
        throw new Error('Container element not found')
      }
      return element
    }
    return container
  }

  /**
   * 合并配置
   * @param options 用户配置
   * @returns 完整配置
   */
  private mergeConfig(options: CropperOptions): Required<CropperConfig> {
    return {
      theme: options.theme || 'light',
      responsive: options.responsive !== false,
      aspectRatio: options.aspectRatio || 'free',
      minCropSize: options.minCropSize || { width: 50, height: 50 },
      maxCropSize: options.maxCropSize || { width: Infinity, height: Infinity },
      shape: options.shape || CropShape.RECTANGLE,
      showGrid: options.showGrid !== false,
      gridLines: options.gridLines || 3,
      toolbar: options.toolbar || {
        show: true,
        position: 'bottom',
        tools: ['crop', 'rotate', 'flip', 'reset']
      },
      keyboard: options.keyboard || {
        enabled: true,
        shortcuts: {
          'Enter': 'crop',
          'Escape': 'reset',
          'ArrowLeft': 'move-left',
          'ArrowRight': 'move-right',
          'ArrowUp': 'move-up',
          'ArrowDown': 'move-down'
        }
      },
      touch: options.touch || {
        enabled: true,
        pinchToZoom: true,
        doubleTapToFit: true
      },
      animation: options.animation || {
        enabled: true,
        duration: 300,
        easing: 'ease-out'
      },
      polygon: options.polygon,
      customPath: options.customPath,
      container: options.container
    }
  }

  /**
   * 初始化Canvas
   */
  private initCanvas(): void {
    this.canvas = document.createElement('canvas')
    this.canvas.className = 'ldesign-cropper-canvas'
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: crosshair;
    `
    
    this.ctx = this.canvas.getContext('2d')!
    this.container.appendChild(this.canvas)
    
    this.updateCanvasSize()
  }

  /**
   * 更新Canvas尺寸
   */
  private updateCanvasSize(): void {
    const rect = getElementRect(this.container)
    this.canvas.width = rect.width
    this.canvas.height = rect.height
    this.render()
  }

  /**
   * 初始化事件监听
   */
  private initEventListeners(): void {
    // 鼠标事件
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this))
    document.addEventListener('mousemove', this.handleMouseMove.bind(this))
    document.addEventListener('mouseup', this.handleMouseUp.bind(this))
    
    // 触摸事件
    if (this.config.touch.enabled) {
      this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this))
      this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this))
      this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this))
    }
    
    // 键盘事件
    if (this.config.keyboard.enabled) {
      document.addEventListener('keydown', this.handleKeyDown.bind(this))
    }
    
    // 窗口大小变化
    if (this.config.responsive) {
      this.resizeObserver = new ResizeObserver(debounce(this.handleResize.bind(this), 100))
      this.resizeObserver.observe(this.container)
    }
  }

  // ==================== 图片加载和处理 ====================

  /**
   * 设置图片
   * @param source 图片源
   */
  async setImage(source: ImageSource): Promise<void> {
    if (this.destroyed) {
      throw new Error('Cropper instance has been destroyed')
    }

    try {
      // 验证图片源
      await this.validateImageSource(source)
      
      // 加载图片
      this.image = await this.loadImage(source)
      
      // 获取图片信息
      const imageInfo = await getImageInfo(source)
      
      // 更新Canvas尺寸
      this.updateCanvasSize()
      
      // 重置裁剪数据
      this.resetCropData()
      
      // 计算图片适配
      this.calculateImageFit()
      
      // 渲染
      this.render()
      
      // 触发事件
      this.emit(CropperEventType.IMAGE_LOADED, { 
        image: this.image,
        imageInfo
      })
    } catch (error) {
      this.emit(CropperEventType.IMAGE_ERROR, { error })
      throw error
    }
  }

  /**
   * 验证图片源
   * @param source 图片源
   */
  private async validateImageSource(source: ImageSource): Promise<void> {
    if (source instanceof File) {
      if (!isSupportedImageType(source.type)) {
        throw new Error(`Unsupported image type: ${source.type}`)
      }
      
      // 检查文件大小（默认最大10MB）
      const maxSize = 10 * 1024 * 1024
      if (source.size > maxSize) {
        throw new Error(`Image file too large: ${source.size} bytes`)
      }
    }
    
    if (typeof source === 'string') {
      // 验证URL格式
      try {
        new URL(source)
      } catch {
        throw new Error(`Invalid image URL: ${source}`)
      }
    }
  }

  /**
   * 加载图片
   * @param source 图片源
   * @returns Promise<HTMLImageElement>
   */
  private async loadImage(source: ImageSource): Promise<HTMLImageElement> {
    if (source instanceof HTMLImageElement) {
      // 确保图片已加载
      if (source.complete && source.naturalWidth > 0) {
        return source
      }
      
      return new Promise((resolve, reject) => {
        const img = source.cloneNode() as HTMLImageElement
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image element'))
      })
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    return new Promise((resolve, reject) => {
      img.onload = () => {
        // 验证图片尺寸
        if (img.naturalWidth === 0 || img.naturalHeight === 0) {
          reject(new Error('Invalid image dimensions'))
          return
        }
        
        // 检查图片尺寸限制
        const maxDimension = 8192 // 最大尺寸限制
        if (img.naturalWidth > maxDimension || img.naturalHeight > maxDimension) {
          reject(new Error(`Image dimensions too large: ${img.naturalWidth}x${img.naturalHeight}`))
          return
        }
        
        resolve(img)
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))

      if (typeof source === 'string') {
        img.src = source
      } else if (source instanceof File) {
        const reader = new FileReader()
        reader.onload = (e) => {
          img.src = e.target?.result as string
        }
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsDataURL(source)
      } else if (source instanceof HTMLCanvasElement) {
        img.src = source.toDataURL()
      } else if (source instanceof ImageData) {
        const { canvas } = createCanvas(source.width, source.height)
        const ctx = canvas.getContext('2d')!
        ctx.putImageData(source, 0, 0)
        img.src = canvas.toDataURL()
      } else if (source instanceof Blob) {
        const url = URL.createObjectURL(source)
        img.onload = () => {
          URL.revokeObjectURL(url)
          resolve(img)
        }
        img.src = url
      }
    })
  }

  /**
   * 计算图片适配
   */
  private calculateImageFit(): void {
    if (!this.image) return

    const containerRect = getElementRect(this.container)
    const imageAspect = this.image.naturalWidth / this.image.naturalHeight
    const containerAspect = containerRect.width / containerRect.height

    let fitWidth, fitHeight

    // 计算适配尺寸
    if (imageAspect > containerAspect) {
      fitWidth = containerRect.width * 0.9
      fitHeight = fitWidth / imageAspect
    } else {
      fitHeight = containerRect.height * 0.9
      fitWidth = fitHeight * imageAspect
    }

    // 更新图片变换
    this.imageTransform = {
      scaleX: fitWidth / this.image.naturalWidth,
      scaleY: fitHeight / this.image.naturalHeight,
      rotation: 0,
      translateX: (containerRect.width - fitWidth) / 2,
      translateY: (containerRect.height - fitHeight) / 2
    }
  }

  /**
   * 重置裁剪数据
   */
  private resetCropData(): void {
    if (!this.image) return

    const containerRect = getElementRect(this.container)
    const coverage = this.config.initialCoverage || 0.8
    
    // 计算初始裁剪区域
    const cropWidth = Math.min(
      containerRect.width * coverage,
      this.image.naturalWidth * this.imageTransform.scaleX
    )
    const cropHeight = Math.min(
      containerRect.height * coverage,
      this.image.naturalHeight * this.imageTransform.scaleY
    )

    // 处理宽高比约束
    if (this.config.aspectRatio !== 'free') {
      const ratio = this.parseAspectRatio(this.config.aspectRatio)
      if (ratio > 0) {
        const currentRatio = cropWidth / cropHeight
        if (currentRatio > ratio) {
          // 宽度过大，调整宽度
          const newWidth = cropHeight * ratio
          this.cropData = {
            x: (containerRect.width - newWidth) / 2,
            y: (containerRect.height - cropHeight) / 2,
            width: newWidth,
            height: cropHeight,
            shape: this.config.shape
          }
        } else {
          // 高度过大，调整高度
          const newHeight = cropWidth / ratio
          this.cropData = {
            x: (containerRect.width - cropWidth) / 2,
            y: (containerRect.height - newHeight) / 2,
            width: cropWidth,
            height: newHeight,
            shape: this.config.shape
          }
        }
      }
    } else {
      this.cropData = {
        x: (containerRect.width - cropWidth) / 2,
        y: (containerRect.height - cropHeight) / 2,
        width: cropWidth,
        height: cropHeight,
        shape: this.config.shape
      }
    }

    // 应用尺寸限制
    this.applySizeConstraints()
  }

  /**
   * 解析宽高比
   * @param aspectRatio 宽高比配置
   * @returns 数值比例
   */
  private parseAspectRatio(aspectRatio: any): number {
    if (typeof aspectRatio === 'number') {
      return aspectRatio
    }
    
    if (typeof aspectRatio === 'string') {
      if (aspectRatio === 'free') return 0
      
      const ratioMap: Record<string, number> = {
        '1:1': 1,
        '4:3': 4/3,
        '16:9': 16/9,
        '3:2': 3/2,
        '2:3': 2/3,
        '9:16': 9/16
      }
      
      if (ratioMap[aspectRatio]) {
        return ratioMap[aspectRatio]
      }
      
      // 解析自定义比例 "w:h"
      const parts = aspectRatio.split(':')
      if (parts.length === 2) {
        const w = parseFloat(parts[0])
        const h = parseFloat(parts[1])
        if (isValidNumber(w) && isValidNumber(h) && h > 0) {
          return w / h
        }
      }
    }
    
    return 0
  }

  /**
   * 应用尺寸限制
   */
  private applySizeConstraints(): void {
    const { minCropSize, maxCropSize } = this.config
    
    // 应用最小尺寸限制
    if (this.cropData.width < minCropSize.width) {
      this.cropData.width = minCropSize.width
    }
    if (this.cropData.height < minCropSize.height) {
      this.cropData.height = minCropSize.height
    }
    
    // 应用最大尺寸限制
    if (this.cropData.width > maxCropSize.width) {
      this.cropData.width = maxCropSize.width
    }
    if (this.cropData.height > maxCropSize.height) {
      this.cropData.height = maxCropSize.height
    }
    
    // 确保裁剪区域在容器内
    const containerRect = getElementRect(this.container)
    
    if (this.cropData.x < 0) {
      this.cropData.x = 0
    }
    if (this.cropData.y < 0) {
      this.cropData.y = 0
    }
    if (this.cropData.x + this.cropData.width > containerRect.width) {
      this.cropData.x = containerRect.width - this.cropData.width
    }
    if (this.cropData.y + this.cropData.height > containerRect.height) {
      this.cropData.y = containerRect.height - this.cropData.height
    }
  }

  /**
   * 渲染
   */
  // ==================== 渲染系统 ====================
  
  /**
   * 主渲染方法
   */
  private render(): void {
    if (!this.image || this.destroyed) return
  
    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    
    // 保存上下文状态
    this.ctx.save()
    
    // 绘制背景图片
    this.drawBackgroundImage()
    
    // 绘制遮罩层
    this.drawMask()
    
    // 绘制裁剪区域
    this.drawCropArea()
    
    // 绘制网格
    if (this.config.showGrid) {
      this.drawGrid()
    }
    
    // 绘制控制点
    this.drawControlPoints()
    
    // 恢复上下文状态
    this.ctx.restore()
    
    // 触发渲染完成事件
    this.emit(CropperEventType.RENDER)
  }
  
  /**
   * 绘制背景图片
   */
  private drawBackgroundImage(): void {
    if (!this.image) return
  
    const containerRect = getElementRect(this.container)
    const { scaleX, scaleY, translateX, translateY } = this.imageTransform
  
    // 计算图片在Canvas中的位置和尺寸
    const imageWidth = this.image.naturalWidth * scaleX
    const imageHeight = this.image.naturalHeight * scaleY
    const imageX = translateX
    const imageY = translateY
  
    // 应用全局变换
    this.ctx.save()
    
    if (this.rotation !== 0 || this.flipX || this.flipY) {
      const centerX = this.canvas.width / 2
      const centerY = this.canvas.height / 2
      
      this.ctx.translate(centerX, centerY)
      this.ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1)
      this.ctx.rotate((this.rotation * Math.PI) / 180)
      this.ctx.scale(this.scale, this.scale)
      this.ctx.translate(-centerX, -centerY)
    }
  
    // 绘制图片
    this.ctx.drawImage(
      this.image,
      imageX,
      imageY,
      imageWidth,
      imageHeight
    )
  
    this.ctx.restore()
  }
  
  /**
   * 绘制遮罩层
   */
  private drawMask(): void {
    if (!this.config.showMask) return
  
    const { x, y, width, height, shape } = this.cropData
  
    // 设置遮罩样式
    this.ctx.fillStyle = this.config.maskColor || 'rgba(0, 0, 0, 0.5)'
  
    // 绘制全屏遮罩
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  
    // 使用复合操作清除裁剪区域
    this.ctx.save()
    this.ctx.globalCompositeOperation = 'destination-out'
  
    this.ctx.beginPath()
    
    switch (shape) {
      case CropShape.RECTANGLE:
        this.ctx.rect(x, y, width, height)
        break
      case CropShape.CIRCLE:
        const radius = Math.min(width, height) / 2
        this.ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI)
        break
      case CropShape.ELLIPSE:
        this.ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI)
        break
      case CropShape.POLYGON:
        // TODO: 实现多边形裁剪
        this.ctx.rect(x, y, width, height)
        break
      case CropShape.CUSTOM:
        // TODO: 实现自定义路径裁剪
        this.ctx.rect(x, y, width, height)
        break
    }
  
    this.ctx.fill()
    this.ctx.restore()
  }
  
  /**
   * 绘制裁剪区域边框
   */
  private drawCropArea(): void {
    const { x, y, width, height, shape } = this.cropData
    
    // 设置边框样式
    this.ctx.strokeStyle = this.config.cropBoxColor || '#1890ff'
    this.ctx.lineWidth = this.config.cropBoxLineWidth || 2
    
    if (this.config.cropBoxDashed) {
      this.ctx.setLineDash([5, 5])
    }
    
    this.ctx.beginPath()
    
    switch (shape) {
      case CropShape.RECTANGLE:
        this.ctx.rect(x, y, width, height)
        break
      case CropShape.CIRCLE:
        const radius = Math.min(width, height) / 2
        this.ctx.arc(x + width / 2, y + height / 2, radius, 0, 2 * Math.PI)
        break
      case CropShape.ELLIPSE:
        this.ctx.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, 2 * Math.PI)
        break
      case CropShape.POLYGON:
        // TODO: 实现多边形绘制
        this.ctx.rect(x, y, width, height)
        break
      case CropShape.CUSTOM:
        // TODO: 实现自定义路径绘制
        this.ctx.rect(x, y, width, height)
        break
    }
    
    this.ctx.stroke()
    
    if (this.config.cropBoxDashed) {
      this.ctx.setLineDash([])
    }
  }
  
  /**
   * 绘制网格线
   */
  private drawGrid(): void {
    const { x, y, width, height } = this.cropData
    const lines = this.config.gridLines || 3
    
    this.ctx.strokeStyle = this.config.gridColor || 'rgba(255, 255, 255, 0.5)'
    this.ctx.lineWidth = 1
    
    // 垂直线
    for (let i = 1; i < lines; i++) {
      const lineX = x + (width / lines) * i
      this.ctx.beginPath()
      this.ctx.moveTo(lineX, y)
      this.ctx.lineTo(lineX, y + height)
      this.ctx.stroke()
    }
    
    // 水平线
    for (let i = 1; i < lines; i++) {
      const lineY = y + (height / lines) * i
      this.ctx.beginPath()
      this.ctx.moveTo(x, lineY)
      this.ctx.lineTo(x + width, lineY)
      this.ctx.stroke()
    }
  }
  
  /**
   * 绘制控制点
   */
  private drawControlPoints(): void {
    if (!this.config.showControlPoints) return
  
    const { x, y, width, height, shape } = this.cropData
    const pointSize = this.config.controlPointSize || 8
    const pointColor = this.config.controlPointColor || '#1890ff'
    const pointBorderColor = this.config.controlPointBorderColor || '#ffffff'
  
    this.ctx.fillStyle = pointColor
    this.ctx.strokeStyle = pointBorderColor
    this.ctx.lineWidth = 2
  
    if (shape === CropShape.RECTANGLE) {
      // 矩形的8个控制点
      const points = [
        { x: x, y: y, type: 'nw' },                    // 西北角
        { x: x + width / 2, y: y, type: 'n' },        // 北边中点
        { x: x + width, y: y, type: 'ne' },           // 东北角
        { x: x + width, y: y + height / 2, type: 'e' }, // 东边中点
        { x: x + width, y: y + height, type: 'se' },  // 东南角
        { x: x + width / 2, y: y + height, type: 's' }, // 南边中点
        { x: x, y: y + height, type: 'sw' },          // 西南角
        { x: x, y: y + height / 2, type: 'w' }        // 西边中点
      ]
  
      points.forEach(point => {
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, pointSize / 2, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.stroke()
      })
    } else if (shape === CropShape.CIRCLE || shape === CropShape.ELLIPSE) {
      // 圆形/椭圆的4个控制点
      const centerX = x + width / 2
      const centerY = y + height / 2
      const radiusX = width / 2
      const radiusY = height / 2
  
      const points = [
        { x: centerX, y: centerY - radiusY, type: 'n' },     // 北
        { x: centerX + radiusX, y: centerY, type: 'e' },     // 东
        { x: centerX, y: centerY + radiusY, type: 's' },     // 南
        { x: centerX - radiusX, y: centerY, type: 'w' }      // 西
      ]
  
      points.forEach(point => {
        this.ctx.beginPath()
        this.ctx.arc(point.x, point.y, pointSize / 2, 0, 2 * Math.PI)
        this.ctx.fill()
        this.ctx.stroke()
      })
    }
  }
  
  /**
   * 绘制辅助信息
   */
  private drawInfo(): void {
    if (!this.config.showInfo) return
  
    const { width, height } = this.cropData
    const info = `${Math.round(width)} × ${Math.round(height)}`
    
    this.ctx.fillStyle = this.config.infoColor || '#ffffff'
    this.ctx.font = this.config.infoFont || '12px Arial'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    
    // 绘制背景
    const textMetrics = this.ctx.measureText(info)
    const textWidth = textMetrics.width
    const textHeight = 16
    const padding = 8
    
    const bgX = this.cropData.x + this.cropData.width / 2 - (textWidth + padding) / 2
    const bgY = this.cropData.y - textHeight - padding
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    this.ctx.fillRect(bgX, bgY, textWidth + padding, textHeight + padding)
    
    // 绘制文字
    this.ctx.fillStyle = this.config.infoColor || '#ffffff'
    this.ctx.fillText(
      info,
      this.cropData.x + this.cropData.width / 2,
      bgY + (textHeight + padding) / 2
    )
  }

  /**
   * 更新Canvas尺寸
   */
  private updateCanvasSize(): void {
    const containerRect = getElementRect(this.container)
    
    // 设置Canvas尺寸
    this.canvas.width = containerRect.width
    this.canvas.height = containerRect.height
    
    // 设置CSS尺寸
    this.canvas.style.width = `${containerRect.width}px`
    this.canvas.style.height = `${containerRect.height}px`
    
    // 重新计算图片适配
    if (this.image) {
      this.calculateImageFit()
    }
  }



  // ==================== 事件处理系统 ====================

  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    this.updateCanvasSize()
    this.calculateImageFit()
    this.render()
    this.emit(CropperEventType.RESIZE)
  }

  /**
   * 处理鼠标按下事件
   */
  private handleMouseDown(e: MouseEvent): void {
    if (this.destroyed || !this.image) return

    e.preventDefault()
    const point = getRelativeMousePosition(e, this.canvas)
    
    // 检查是否点击在裁剪区域内
    const handle = this.getResizeHandle(point)
    
    if (handle) {
      // 开始调整大小
      this.isResizing = true
      this.resizeHandle = handle
      this.canvas.style.cursor = this.getResizeCursor(handle)
    } else if (isPointInRect(point, this.cropData)) {
      // 开始拖拽
      this.isDragging = true
      this.dragStartPoint = point
      this.canvas.style.cursor = 'move'
    }

    this.emit(CropperEventType.CROP_START, { 
      event: e, 
      point,
      isDragging: this.isDragging,
      isResizing: this.isResizing
    })
  }

  /**
   * 处理鼠标移动事件
   */
  private handleMouseMove(e: MouseEvent): void {
    if (this.destroyed || !this.image) return

    const point = getRelativeMousePosition(e, this.canvas)

    if (this.isDragging && this.dragStartPoint) {
      // 拖拽裁剪区域
      const deltaX = point.x - this.dragStartPoint.x
      const deltaY = point.y - this.dragStartPoint.y
      
      this.moveCropArea(deltaX, deltaY)
      this.dragStartPoint = point
      
      this.emit(CropperEventType.CROP_MOVE, { 
        event: e, 
        point,
        cropData: this.cropData
      })
    } else if (this.isResizing && this.resizeHandle) {
      // 调整裁剪区域大小
      this.resizeCropArea(point, this.resizeHandle)
      
      this.emit(CropperEventType.CROP_MOVE, { 
        event: e, 
        point,
        cropData: this.cropData
      })
    } else {
      // 更新鼠标样式
      const handle = this.getResizeHandle(point)
      if (handle) {
        this.canvas.style.cursor = this.getResizeCursor(handle)
      } else if (isPointInRect(point, this.cropData)) {
        this.canvas.style.cursor = 'move'
      } else {
        this.canvas.style.cursor = 'crosshair'
      }
    }
  }

  /**
   * 处理鼠标释放事件
   */
  private handleMouseUp(e: MouseEvent): void {
    if (this.destroyed) return

    const point = getRelativeMousePosition(e, this.canvas)
    
    this.isDragging = false
    this.isResizing = false
    this.dragStartPoint = null
    this.resizeHandle = null
    this.canvas.style.cursor = 'crosshair'

    this.render()
    
    this.emit(CropperEventType.CROP_END, { 
      event: e, 
      point,
      cropData: this.cropData
    })
  }

  /**
   * 处理触摸开始事件
   */
  private handleTouchStart(e: TouchEvent): void {
    if (this.destroyed || !this.image) return

    e.preventDefault()
    
    if (e.touches.length === 1) {
      // 单点触摸，模拟鼠标事件
      const touch = e.touches[0]
      const point = getRelativeTouchPosition(touch, this.canvas)
      
      const handle = this.getResizeHandle(point)
      
      if (handle) {
        this.isResizing = true
        this.resizeHandle = handle
      } else if (isPointInRect(point, this.cropData)) {
        this.isDragging = true
        this.dragStartPoint = point
      }
    } else if (e.touches.length === 2 && this.config.touch.pinchToZoom) {
      // 双点触摸，准备缩放
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      this.lastPinchDistance = this.getTouchDistance(touch1, touch2)
      this.lastPinchScale = this.scale
    }

    this.emit(CropperEventType.CROP_START, { event: e })
  }

  /**
   * 处理触摸移动事件
   */
  private handleTouchMove(e: TouchEvent): void {
    if (this.destroyed || !this.image) return

    e.preventDefault()

    if (e.touches.length === 1) {
      // 单点触摸移动
      const touch = e.touches[0]
      const point = getRelativeTouchPosition(touch, this.canvas)

      if (this.isDragging && this.dragStartPoint) {
        const deltaX = point.x - this.dragStartPoint.x
        const deltaY = point.y - this.dragStartPoint.y
        
        this.moveCropArea(deltaX, deltaY)
        this.dragStartPoint = point
      } else if (this.isResizing && this.resizeHandle) {
        this.resizeCropArea(point, this.resizeHandle)
      }
    } else if (e.touches.length === 2 && this.config.touch.pinchToZoom) {
      // 双点触摸缩放
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      
      const currentDistance = this.getTouchDistance(touch1, touch2)
      const scaleChange = currentDistance / this.lastPinchDistance
      
      this.zoom(this.lastPinchScale * scaleChange)
    }

    this.emit(CropperEventType.CROP_MOVE, { event: e })
  }

  /**
   * 处理触摸结束事件
   */
  private handleTouchEnd(e: TouchEvent): void {
    if (this.destroyed) return

    e.preventDefault()

    // 检查双击
    if (this.config.touch.doubleTapToFit && e.touches.length === 0) {
      const now = Date.now()
      if (this.lastTapTime && now - this.lastTapTime < 300) {
        // 双击，适配图片
        this.fitToContainer()
      }
      this.lastTapTime = now
    }

    this.isDragging = false
    this.isResizing = false
    this.dragStartPoint = null
    this.resizeHandle = null

    this.render()
    this.emit(CropperEventType.CROP_END, { event: e })
  }

  /**
   * 处理键盘事件
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (this.destroyed) return

    const shortcut = this.getShortcutKey(e)
    const action = this.config.keyboard.shortcuts[shortcut]
    
    if (action) {
      e.preventDefault()
      this.executeAction(action)
    }
  }

  /**
   * 获取快捷键字符串
   */
  private getShortcutKey(e: KeyboardEvent): string {
    const parts = []
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
    if (e.altKey) parts.push('Alt')
    if (e.shiftKey) parts.push('Shift')
    parts.push(e.key)
    return parts.join('+')
  }

  /**
   * 执行操作
   */
  private executeAction(action: string): void {
    switch (action) {
      case 'crop':
        this.emit(CropperEventType.CROP_COMPLETE, this.getCropData())
        break
      case 'reset':
        this.reset()
        break
      case 'move-left':
        this.moveCropArea(-10, 0)
        break
      case 'move-right':
        this.moveCropArea(10, 0)
        break
      case 'move-up':
        this.moveCropArea(0, -10)
        break
      case 'move-down':
        this.moveCropArea(0, 10)
        break
      case 'undo':
        // TODO: 实现撤销
        break
      case 'redo':
        // TODO: 实现重做
        break
    }
  }

  // ==================== 裁剪区域操作 ====================

  /**
   * 移动裁剪区域
   */
  private moveCropArea(deltaX: number, deltaY: number): void {
    const newX = this.cropData.x + deltaX
    const newY = this.cropData.y + deltaY
    
    // 边界检查
    const containerRect = getElementRect(this.container)
    const maxX = containerRect.width - this.cropData.width
    const maxY = containerRect.height - this.cropData.height
    
    this.cropData.x = clamp(newX, 0, maxX)
    this.cropData.y = clamp(newY, 0, maxY)
    
    this.render()
    this.emit(CropperEventType.CROP_CHANGE, this.getCropData())
  }

  /**
   * 调整裁剪区域大小
   */
  private resizeCropArea(point: Point, handle: string): void {
    const { x, y, width, height } = this.cropData
    let newX = x, newY = y, newWidth = width, newHeight = height

    switch (handle) {
      case 'nw': // 西北角
        newX = point.x
        newY = point.y
        newWidth = width + (x - point.x)
        newHeight = height + (y - point.y)
        break
      case 'ne': // 东北角
        newY = point.y
        newWidth = point.x - x
        newHeight = height + (y - point.y)
        break
      case 'sw': // 西南角
        newX = point.x
        newWidth = width + (x - point.x)
        newHeight = point.y - y
        break
      case 'se': // 东南角
        newWidth = point.x - x
        newHeight = point.y - y
        break
      case 'n': // 北边
        newY = point.y
        newHeight = height + (y - point.y)
        break
      case 's': // 南边
        newHeight = point.y - y
        break
      case 'w': // 西边
        newX = point.x
        newWidth = width + (x - point.x)
        break
      case 'e': // 东边
        newWidth = point.x - x
        break
    }

    // 应用宽高比约束
    if (this.config.aspectRatio !== 'free') {
      const ratio = this.parseAspectRatio(this.config.aspectRatio)
      if (ratio > 0) {
        const currentRatio = newWidth / newHeight
        if (Math.abs(currentRatio - ratio) > 0.01) {
          if (handle.includes('e') || handle.includes('w')) {
            // 水平调整，调整高度
            newHeight = newWidth / ratio
          } else {
            // 垂直调整，调整宽度
            newWidth = newHeight * ratio
          }
        }
      }
    }

    // 应用尺寸限制
    const { minCropSize, maxCropSize } = this.config
    newWidth = clamp(newWidth, minCropSize.width, maxCropSize.width)
    newHeight = clamp(newHeight, minCropSize.height, maxCropSize.height)

    // 边界检查
    const containerRect = getElementRect(this.container)
    newX = clamp(newX, 0, containerRect.width - newWidth)
    newY = clamp(newY, 0, containerRect.height - newHeight)

    // 更新裁剪数据
    this.cropData.x = newX
    this.cropData.y = newY
    this.cropData.width = newWidth
    this.cropData.height = newHeight

    this.render()
    this.emit(CropperEventType.CROP_CHANGE, this.getCropData())
  }

  /**
   * 获取调整大小的控制点
   */
  private getResizeHandle(point: Point): string | null {
    const { x, y, width, height } = this.cropData
    const handleSize = 10
    const tolerance = handleSize / 2

    // 检查角点
    if (this.isPointNear(point, { x, y }, tolerance)) return 'nw'
    if (this.isPointNear(point, { x: x + width, y }, tolerance)) return 'ne'
    if (this.isPointNear(point, { x, y: y + height }, tolerance)) return 'sw'
    if (this.isPointNear(point, { x: x + width, y: y + height }, tolerance)) return 'se'

    // 检查边
    if (this.isPointNear(point, { x: x + width / 2, y }, tolerance)) return 'n'
    if (this.isPointNear(point, { x: x + width / 2, y: y + height }, tolerance)) return 's'
    if (this.isPointNear(point, { x, y: y + height / 2 }, tolerance)) return 'w'
    if (this.isPointNear(point, { x: x + width, y: y + height / 2 }, tolerance)) return 'e'

    return null
  }

  /**
   * 检查点是否接近目标点
   */
  private isPointNear(point1: Point, point2: Point, tolerance: number): boolean {
    return Math.abs(point1.x - point2.x) <= tolerance && 
           Math.abs(point1.y - point2.y) <= tolerance
  }

  /**
   * 获取调整大小的鼠标样式
   */
  private getResizeCursor(handle: string): string {
    const cursors: Record<string, string> = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize'
    }
    return cursors[handle] || 'default'
  }

  /**
   * 获取两个触摸点之间的距离
   */
  private getTouchDistance(touch1: Touch, touch2: Touch): number {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  /**
   * 适配到容器
   */
  private fitToContainer(): void {
    if (!this.image) return

    this.scale = 1
    this.rotation = 0
    this.flipX = false
    this.flipY = false
    
    this.calculateImageFit()
    this.resetCropData()
    this.render()
    
    this.emit(CropperEventType.FIT_TO_CONTAINER)
  }

  // 添加缺失的属性
  private lastPinchDistance = 0
  private lastPinchScale = 1
  private lastTapTime = 0

  // ==================== 公共API方法 ====================

  /**
   * 获取裁剪数据
   * @returns 裁剪数据
   */
  getCropData(): CropData {
    return {
      ...this.cropData,
      rotation: this.rotation,
      scale: this.scale,
      flipX: this.flipX,
      flipY: this.flipY
    }
  }

  /**
   * 设置裁剪数据
   * @param data 裁剪数据
   */
  setCropData(data: Partial<CropData>): void {
    this.cropData = { ...this.cropData, ...data }

    if (data.rotation !== undefined) {
      this.rotation = data.rotation
    }
    if (data.scale !== undefined) {
      this.scale = data.scale
    }
    if (data.flipX !== undefined) {
      this.flipX = data.flipX
    }
    if (data.flipY !== undefined) {
      this.flipY = data.flipY
    }

    this.applySizeConstraints()
    this.render()
    this.emit(CropperEventType.CROP_CHANGE, this.getCropData())
  }

  /**
   * 获取裁剪后的Canvas
   * @param options 导出选项
   * @returns Canvas元素
   */
  getCroppedCanvas(options: ExportOptions = {}): HTMLCanvasElement {
    if (!this.image) {
      throw new Error('No image loaded')
    }

    const {
      width = this.cropData.width,
      height = this.cropData.height,
      backgroundColor = 'transparent'
    } = options

    const { canvas } = createCanvas(width, height)
    const ctx = canvas.getContext('2d')!

    // 设置背景色
    if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // 计算源图片在Canvas中的位置和尺寸
    const sourceX = (this.cropData.x - this.imageTransform.translateX) / this.imageTransform.scaleX
    const sourceY = (this.cropData.y - this.imageTransform.translateY) / this.imageTransform.scaleY
    const sourceWidth = this.cropData.width / this.imageTransform.scaleX
    const sourceHeight = this.cropData.height / this.imageTransform.scaleY

    // 应用变换
    ctx.save()
    
    if (this.rotation !== 0 || this.flipX || this.flipY) {
      const centerX = width / 2
      const centerY = height / 2
      
      ctx.translate(centerX, centerY)
      ctx.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1)
      ctx.rotate((this.rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }

    // 绘制裁剪后的图片
    ctx.drawImage(
      this.image,
      Math.max(0, sourceX), 
      Math.max(0, sourceY), 
      Math.min(sourceWidth, this.image.naturalWidth - sourceX), 
      Math.min(sourceHeight, this.image.naturalHeight - sourceY),
      0, 0, width, height
    )

    ctx.restore()

    return canvas
  }

  /**
   * 获取裁剪后的DataURL
   * @param options 导出选项
   * @returns DataURL字符串
   */
  getCroppedDataURL(options: ExportOptions = {}): string {
    const canvas = this.getCroppedCanvas(options)
    const { format = ImageFormat.PNG, quality = 0.92 } = options

    return canvas.toDataURL(format, quality)
  }

  /**
   * 获取裁剪后的Blob
   * @param options 导出选项
   * @returns Promise<Blob>
   */
  async getCroppedBlob(options: ExportOptions = {}): Promise<Blob> {
    const canvas = this.getCroppedCanvas(options)
    const { format = ImageFormat.PNG, quality = 0.92 } = options

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      }, format, quality)
    })
  }

  /**
   * 缩放
   * @param factor 缩放因子
   */
  zoom(factor: number): void {
    this.scale = clamp(factor, 0.1, 10)
    this.render()
    this.emit(CropperEventType.ZOOM_CHANGE, { scale: this.scale })
  }

  /**
   * 放大
   * @param delta 放大增量
   */
  zoomIn(delta = 0.1): void {
    this.zoom(this.scale + delta)
  }

  /**
   * 缩小
   * @param delta 缩小增量
   */
  zoomOut(delta = 0.1): void {
    this.zoom(this.scale - delta)
  }

  /**
   * 旋转
   * @param angle 旋转角度
   */
  rotate(angle: number): void {
    this.rotation = (this.rotation + angle) % 360
    this.render()
    this.emit(CropperEventType.ROTATION_CHANGE, { rotation: this.rotation })
  }

  /**
   * 向左旋转90度
   */
  rotateLeft(): void {
    this.rotate(-90)
  }

  /**
   * 向右旋转90度
   */
  rotateRight(): void {
    this.rotate(90)
  }

  /**
   * 翻转
   * @param horizontal 是否水平翻转
   * @param vertical 是否垂直翻转
   */
  flip(horizontal: boolean, vertical: boolean): void {
    this.flipX = horizontal
    this.flipY = vertical
    this.render()
    this.emit(CropperEventType.FLIP_CHANGE, { flipX: this.flipX, flipY: this.flipY })
  }

  /**
   * 水平翻转
   */
  flipHorizontal(): void {
    this.flip(!this.flipX, this.flipY)
  }

  /**
   * 垂直翻转
   */
  flipVertical(): void {
    this.flip(this.flipX, !this.flipY)
  }

  /**
   * 重置
   */
  reset(): void {
    this.scale = 1
    this.rotation = 0
    this.flipX = false
    this.flipY = false
    this.resetCropData()
    this.render()
    this.emit(CropperEventType.RESET)
  }

  /**
   * 销毁实例
   */
  destroy(): void {
    if (this.destroyed) return

    // 移除事件监听
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this))
    document.removeEventListener('mouseup', this.handleMouseUp.bind(this))
    document.removeEventListener('keydown', this.handleKeyDown.bind(this))
    
    // 清理ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    // 清理Canvas
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }

    // 清理事件监听器
    this.removeAllListeners()

    this.destroyed = true
    this.emit(CropperEventType.DESTROY)
  }

  // ==================== 静态方法 ====================

  /**
   * 创建裁剪器实例
   * @param options 配置选项
   * @returns 裁剪器实例
   */
  static create(options: CropperOptions): Cropper {
    return new Cropper(options)
  }

  /**
   * 检查浏览器兼容性
   * @returns 兼容性检查结果
   */
  static checkCompatibility(): CompatibilityResult {
    const features: FeatureSupport = {
      canvas: !!document.createElement('canvas').getContext,
      fileReader: typeof FileReader !== 'undefined',
      blob: typeof Blob !== 'undefined',
      touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      resizeObserver: typeof ResizeObserver !== 'undefined',
      intersectionObserver: typeof IntersectionObserver !== 'undefined'
    }

    const supported = features.canvas && features.fileReader && features.blob
    const reasons: string[] = []

    if (!features.canvas) reasons.push('Canvas API not supported')
    if (!features.fileReader) reasons.push('FileReader API not supported')
    if (!features.blob) reasons.push('Blob API not supported')

    return {
      supported,
      features,
      reasons: reasons.length > 0 ? reasons : []
    }
  }

  /**
   * 获取版本信息
   * @returns 版本号
   */
  static getVersion(): string {
    return '0.1.0'
  }
}
