/**
 * @file 裁剪器核心类
 * @description 图片裁剪器的核心实现，整合各个功能模块
 */

import type {
  CropperOptions,
  CropperInstance,
  CropArea,
  Transform,
  ImageInfo,
  OutputConfig,
  CropperEventType,
  CropperEventListener,
  Size,
  Point,
  Rectangle,
} from '@/types'
import { CropShape, ImageFormat, CropperEventType as EventType } from '@/types'
import { EventEmitter } from './event-emitter'
import { ImageLoader, type ImageLoadResult } from './image-loader'
import { CanvasRenderer, type RenderConfig } from './canvas-renderer'
import { CropAreaManager, type CropConstraints } from './crop-area-manager'
import { InteractionController, type InteractionCallbacks } from './interaction-controller'
import { DOMUtils, ImageUtils, PerformanceUtils } from '@/utils'

/**
 * 裁剪器核心类
 * 整合图片加载、Canvas渲染、裁剪区域管理等功能
 */
export class CropperCore extends EventEmitter implements CropperInstance {
  /** 容器元素 */
  private container: HTMLElement

  /** Canvas 元素 */
  private canvas: HTMLCanvasElement

  /** Canvas 渲染器 */
  private renderer: CanvasRenderer

  /** 图片加载器 */
  private imageLoader: ImageLoader

  /** 裁剪区域管理器 */
  private cropAreaManager: CropAreaManager

  /** 交互控制器 */
  private interactionController: InteractionController | null = null

  /** 当前图片信息 */
  private currentImage: HTMLImageElement | null = null

  /** 当前图片信息 */
  private imageInfo: ImageInfo | null = null

  /** 当前变换信息 */
  private transform: Transform = {
    scale: 1,
    rotation: 0,
    translateX: 0,
    translateY: 0,
    flipX: false,
    flipY: false,
  }

  /** 配置选项 */
  private options: Required<CropperOptions>

  /** 是否已销毁 */
  private destroyed = false

  /** 默认配置 */
  private static readonly DEFAULT_OPTIONS: Required<CropperOptions> = {
    container: '',
    shape: CropShape.RECTANGLE,
    initialCrop: {},
    minSize: { width: 10, height: 10 },
    maxSize: { width: Infinity, height: Infinity },
    aspectRatio: 0,
    keepAspectRatio: false,
    resizable: true,
    movable: true,
    rotatable: true,
    showGrid: true,
    gridLines: 3,
    showCenterLines: false,
    backgroundColor: '#ffffff',
    maskOpacity: 0.5,
    touchEnabled: true,
    wheelZoom: true,
    minZoom: 0.1,
    maxZoom: 10,
    zoomStep: 0.1,
    theme: {
      name: 'default',
      primaryColor: '#722ED1',
      borderColor: '#d9d9d9',
      handleColor: '#722ED1',
      gridColor: 'rgba(255, 255, 255, 0.5)',
      backgroundColor: '#ffffff',
      maskColor: '#000000',
      textColor: '#333333',
      toolbarBackground: '#ffffff',
      buttonColor: '#722ED1',
      buttonHoverColor: '#5e2aa7',
    },
    i18n: {
      locale: 'en',
      messages: {},
    },
    toolbar: {
      show: true,
      position: 'top',
      tools: ['zoom-in', 'zoom-out', 'rotate-left', 'rotate-right', 'reset'],
      customTools: [],
    },
    debug: false,
    performance: {
      hardwareAcceleration: true,
      maxFPS: 60,
      memoryLimit: 100,
    },
  }

  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: CropperOptions) {
    super({ debug: options.debug })

    // 合并配置
    this.options = this.mergeOptions(options)

    // 初始化容器
    this.container = this.initializeContainer(this.options.container)

    // 创建 Canvas
    this.canvas = this.createCanvas()

    // 初始化各个模块
    this.renderer = new CanvasRenderer(this.canvas, this.createRenderConfig())
    this.imageLoader = new ImageLoader()
    this.cropAreaManager = new CropAreaManager(
      this.options.initialCrop,
      this.createCropConstraints(),
    )

    // 初始化交互控制器
    this.initializeInteractionController()

    // 设置事件监听
    this.setupEventListeners()

    // 初始渲染
    this.render()

    // 加载默认图片
    this.loadDefaultImage()

    if (this.options.debug) {
      console.log('CropperCore initialized', this.options)
    }
  }

  /**
   * 设置图片
   * @param src 图片源
   */
  async setImage(src: string | File | HTMLImageElement): Promise<void> {
    if (this.destroyed) {
      throw new Error('Cropper has been destroyed')
    }

    try {
      // 触发加载开始事件
      this.emit(EventType.IMAGE_LOAD_START, { src })

      // 显示加载状态
      this.showLoadingState()

      // 加载图片
      const result: ImageLoadResult = await this.imageLoader.load(src)

      this.currentImage = result.image
      this.imageInfo = result.info

      // 重置变换
      this.resetTransform()

      // 更新Canvas尺寸
      this.updateCanvasSize()

      // 更新裁剪区域约束
      this.updateCropConstraints()

      // 重新初始化裁剪区域
      this.initializeCropArea()

      // 隐藏加载状态
      this.hideLoadingState()

      // 重新渲染
      this.render()

      // 触发事件
      this.emit(EventType.IMAGE_LOADED, { imageInfo: this.imageInfo })

      if (this.options.debug) {
        console.log('Image loaded:', this.imageInfo)
      }
    } catch (error) {
      // 隐藏加载状态
      this.hideLoadingState()

      this.emit(EventType.IMAGE_ERROR, { error })
      throw error
    }
  }

  /**
   * 获取裁剪后的 Canvas
   * @param config 输出配置
   * @returns 裁剪后的 Canvas
   */
  getCroppedCanvas(config: OutputConfig = {}): HTMLCanvasElement {
    if (!this.currentImage) {
      throw new Error('No image loaded')
    }

    const cropArea = this.cropAreaManager.getCropArea()
    const outputConfig = {
      format: ImageFormat.PNG,
      quality: 0.9,
      fillBackground: false,
      backgroundColor: '#ffffff',
      smoothScaling: true,
      ...config,
    }

    // 创建输出 Canvas
    const outputCanvas = DOMUtils.createCanvas(
      outputConfig.width || cropArea.width,
      outputConfig.height || cropArea.height,
    )
    const ctx = outputCanvas.getContext('2d')!

    // 设置渲染质量
    if (outputConfig.smoothScaling) {
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
    }

    // 计算源区域和目标区域
    const sourceRect = this.calculateSourceRect(cropArea)
    const targetRect = {
      x: 0,
      y: 0,
      width: outputCanvas.width,
      height: outputCanvas.height,
    }

    // 根据裁剪形状创建裁剪路径
    this.createClipPath(ctx, cropArea.shape, targetRect)

    // 填充背景（在裁剪路径内）
    if (outputConfig.fillBackground && outputConfig.backgroundColor) {
      ctx.fillStyle = outputConfig.backgroundColor
      ctx.fill()
    }

    // 绘制裁剪后的图片
    ctx.drawImage(
      this.currentImage,
      sourceRect.x,
      sourceRect.y,
      sourceRect.width,
      sourceRect.height,
      targetRect.x,
      targetRect.y,
      targetRect.width,
      targetRect.height,
    )

    return outputCanvas
  }

  /**
   * 获取裁剪数据
   * @returns 裁剪区域数据
   */
  getCropData(): CropArea {
    return this.cropAreaManager.getCropArea()
  }

  /**
   * 设置裁剪数据
   * @param cropArea 裁剪区域数据
   */
  setCropData(cropArea: Partial<CropArea>): void {
    if (this.cropAreaManager.setCropArea(cropArea)) {
      this.render()
      this.emit(EventType.CROP_CHANGE, { cropArea: this.getCropData() })
    }
  }

  /**
   * 缩放
   * @param ratio 缩放比例
   */
  zoom(ratio: number): void {
    const newScale = Math.max(
      this.options.minZoom,
      Math.min(this.options.maxZoom, this.transform.scale * ratio),
    )

    if (newScale !== this.transform.scale) {
      this.transform.scale = newScale
      this.render()
      this.emit(EventType.ZOOM_CHANGE, { transform: { ...this.transform } })
    }
  }

  /**
   * 在指定点进行缩放
   * @param scaleFactor 缩放因子
   * @param center 缩放中心点
   */
  zoomAtPoint(scaleFactor: number, center: { x: number; y: number }): void {
    if (!this.currentImage) return

    const oldScale = this.transform.scale
    const newScale = Math.max(
      this.options.minZoom,
      Math.min(this.options.maxZoom, oldScale * scaleFactor),
    )

    if (newScale === oldScale) return

    // 计算缩放前后的偏移量调整

    // 计算相对于图片的缩放中心点
    const imageX = (center.x - this.transform.translateX) / oldScale
    const imageY = (center.y - this.transform.translateY) / oldScale

    // 更新缩放
    this.transform.scale = newScale

    // 调整平移以保持缩放中心点不变
    this.transform.translateX = center.x - imageX * newScale
    this.transform.translateY = center.y - imageY * newScale

    this.render()
    this.emit(EventType.ZOOM_CHANGE, { transform: { ...this.transform } })
  }

  /**
   * 旋转
   * @param angle 旋转角度（度）
   */
  rotate(angle: number): void {
    this.transform.rotation += (angle * Math.PI) / 180
    this.render()
    this.emit(EventType.ROTATION_CHANGE, { transform: { ...this.transform } })
  }

  /**
   * 翻转
   * @param horizontal 是否水平翻转
   * @param vertical 是否垂直翻转
   */
  flip(horizontal?: boolean, vertical?: boolean): void {
    let changed = false

    if (horizontal !== undefined) {
      this.transform.flipX = horizontal
      changed = true
    }

    if (vertical !== undefined) {
      this.transform.flipY = vertical
      changed = true
    }

    if (changed) {
      this.render()
      this.emit(EventType.FLIP_CHANGE, { transform: { ...this.transform } })
    }
  }

  /**
   * 水平缩放
   * @param scale 缩放比例
   */
  scaleX(scale: number): void {
    this.transform.flipX = scale < 0 ? !this.transform.flipX : this.transform.flipX
    this.render()
    this.emit(EventType.TRANSFORM_CHANGE, { transform: { ...this.transform } })
  }

  /**
   * 垂直缩放
   * @param scale 缩放比例
   */
  scaleY(scale: number): void {
    this.transform.flipY = scale < 0 ? !this.transform.flipY : this.transform.flipY
    this.render()
    this.emit(EventType.TRANSFORM_CHANGE, { transform: { ...this.transform } })
  }

  /**
   * 重置
   */
  reset(): void {
    this.resetTransform()

    if (this.currentImage) {
      const containerSize = {
        width: this.container.clientWidth,
        height: this.container.clientHeight,
      }
      this.cropAreaManager.resetToCenter(containerSize)
    }

    this.render()
    this.emit(EventType.RESET, {
      cropArea: this.getCropData(),
      transform: { ...this.transform },
    })
  }

  /**
   * 设置裁剪形状
   * @param shape 裁剪形状
   */
  setShape(shape: CropShape): void {
    if (this.options.shape !== shape) {
      this.options.shape = shape
      this.cropAreaManager.setShape(shape)
      this.render()
      this.emit(EventType.CONFIG_CHANGE, {
        config: { shape: shape },
        cropArea: this.getCropData()
      })
    }
  }

  /**
   * 设置宽高比
   * @param aspectRatio 宽高比，null表示自由比例
   */
  setAspectRatio(aspectRatio: number | null): void {
    if (this.options.aspectRatio !== aspectRatio) {
      this.options.aspectRatio = aspectRatio || 0
      this.cropAreaManager.setAspectRatio(aspectRatio)
      this.render()
      this.emit(EventType.CONFIG_CHANGE, {
        config: { aspectRatio },
        cropArea: this.getCropData()
      })
    }
  }

  /**
   * 更新配置
   * @param config 新的配置
   */
  updateConfig(config: Partial<CropperOptions>): void {
    let changed = false

    // 更新形状
    if (config.shape !== undefined && config.shape !== this.options.shape) {
      this.options.shape = config.shape
      this.cropAreaManager.setShape(config.shape)
      changed = true
    }

    // 更新宽高比
    if (config.aspectRatio !== undefined && config.aspectRatio !== this.options.aspectRatio) {
      this.options.aspectRatio = config.aspectRatio
      this.cropAreaManager.setAspectRatio(config.aspectRatio)
      changed = true
    }

    // 更新其他配置
    if (config.backgroundColor !== undefined) {
      this.options.backgroundColor = config.backgroundColor
      changed = true
    }

    if (config.maskOpacity !== undefined) {
      this.options.maskOpacity = config.maskOpacity
      changed = true
    }

    if (config.showGrid !== undefined) {
      this.options.showGrid = config.showGrid
      changed = true
    }

    if (changed) {
      // 更新渲染配置
      this.renderer.updateConfig(this.createRenderConfig())
      this.render()
      this.emit(EventType.CONFIG_CHANGE, {
        config,
        cropArea: this.getCropData()
      })
    }
  }

  /**
   * 移动图片
   * @param deltaX X轴移动距离
   * @param deltaY Y轴移动距离
   */
  moveImage(deltaX: number, deltaY: number): void {
    this.transform.translateX += deltaX
    this.transform.translateY += deltaY
    this.render()
  }

  /**
   * 应用滤镜
   * @param filter 滤镜类型
   */
  applyFilter(filter: string): void {
    if (!this.currentImage) return

    const imageElement = this.container.querySelector('.ldesign-cropper__image') as HTMLImageElement
    if (!imageElement) return

    // 移除现有滤镜类
    imageElement.classList.remove(
      'filter-grayscale',
      'filter-sepia',
      'filter-invert',
      'filter-blur',
      'filter-sharpen',
      'filter-contrast',
      'filter-saturate'
    )

    // 添加新滤镜类
    if (filter !== 'none') {
      imageElement.classList.add(`filter-${filter}`)
    }
  }

  /**
   * 销毁裁剪器
   */
  destroy(): void {
    if (this.destroyed) return

    // 移除事件监听器
    this.removeEventListeners()

    // 销毁各个模块
    this.renderer.destroy()
    this.imageLoader.destroy()
    if (this.interactionController) {
      this.interactionController.destroy()
      this.interactionController = null
    }
    super.destroy()

    // 清理 DOM
    if (this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas)
    }

    // 标记为已销毁
    this.destroyed = true

    if (this.options.debug) {
      console.log('CropperCore destroyed')
    }
  }

  /**
   * 合并配置选项
   * @param options 用户配置
   * @returns 合并后的配置
   */
  private mergeOptions(options: CropperOptions): Required<CropperOptions> {
    return {
      ...CropperCore.DEFAULT_OPTIONS,
      ...options,
      theme: { ...CropperCore.DEFAULT_OPTIONS.theme, ...options.theme },
      i18n: { ...CropperCore.DEFAULT_OPTIONS.i18n, ...options.i18n },
      toolbar: { ...CropperCore.DEFAULT_OPTIONS.toolbar, ...options.toolbar },
      performance: { ...CropperCore.DEFAULT_OPTIONS.performance, ...options.performance },
    }
  }

  /**
   * 初始化容器
   * @param container 容器选择器或元素
   * @returns 容器元素
   */
  private initializeContainer(container: HTMLElement | string): HTMLElement {
    let element: HTMLElement

    if (typeof container === 'string') {
      // 验证选择器不为空
      if (!container.trim()) {
        throw new Error('Container selector cannot be empty')
      }
      const found = document.querySelector(container)
      if (!found) {
        throw new Error(`Container element not found: ${container}`)
      }
      element = found as HTMLElement
    } else {
      element = container
    }

    // 设置容器样式
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative'
    }

    return element
  }

  /**
   * 创建 Canvas 元素
   * @returns Canvas 元素
   */
  private createCanvas(): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    canvas.className = 'ldesign-cropper__canvas'

    // 设置 Canvas 样式
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'

    this.container.appendChild(canvas)
    return canvas
  }

  /**
   * 创建渲染配置
   * @returns 渲染配置
   */
  private createRenderConfig(): RenderConfig {
    return {
      backgroundColor: this.options.backgroundColor,
      maskColor: this.options.theme?.maskColor || '#000000',
      maskOpacity: this.options.maskOpacity,
      showGrid: this.options.showGrid,
      gridLines: this.options.gridLines,
      gridColor: this.options.theme?.gridColor || 'rgba(255, 255, 255, 0.5)',
      showCenterLines: this.options.showCenterLines,
      centerLineColor: this.options.theme?.primaryColor || '#722ED1',
      controlPointBorderColor: this.options.theme?.primaryColor || '#722ED1',
      antiAlias: true,
      pixelRatio: window.devicePixelRatio || 1,
    }
  }

  /**
   * 创建裁剪约束
   * @returns 裁剪约束
   */
  private createCropConstraints(): CropConstraints {
    return {
      minSize: this.options.minSize,
      maxSize: this.options.maxSize,
      aspectRatio: this.options.aspectRatio,
      keepAspectRatio: this.options.keepAspectRatio,
      bounds: {
        x: 0,
        y: 0,
        width: this.container.clientWidth,
        height: this.container.clientHeight,
      },
    }
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 窗口大小变化
    window.addEventListener('resize', this.handleResize)

    // 容器大小变化（如果支持 ResizeObserver）
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(this.handleContainerResize)
      resizeObserver.observe(this.container)
    }
  }

  /**
   * 移除事件监听器
   */
  private removeEventListeners(): void {
    window.removeEventListener('resize', this.handleResize)
  }

  /**
   * 处理窗口大小变化
   */
  private handleResize = (): void => {
    this.updateCanvasSize()
    this.updateCropConstraints()
    this.render()
  }

  /**
   * 处理容器大小变化
   */
  private handleContainerResize = (): void => {
    this.updateCanvasSize()
    this.updateCropConstraints()
    this.render()
  }

  /**
   * 更新 Canvas 尺寸
   */
  private updateCanvasSize(): void {
    const size = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }
    this.renderer.resize(size)
  }

  /**
   * 初始化裁剪区域
   */
  private initializeCropArea(): void {
    if (!this.currentImage) return

    const containerWidth = this.container.clientWidth
    const containerHeight = this.container.clientHeight
    const imageWidth = this.currentImage.naturalWidth
    const imageHeight = this.currentImage.naturalHeight

    // 计算图片在容器中的实际显示尺寸
    const scale = this.transform.scale
    const displayWidth = imageWidth * scale
    const displayHeight = imageHeight * scale

    // 计算裁剪区域的默认尺寸（图片显示区域的80%）
    const cropWidth = Math.min(displayWidth * 0.8, containerWidth * 0.8)
    const cropHeight = Math.min(displayHeight * 0.8, containerHeight * 0.8)

    // 如果有宽高比限制，调整裁剪区域
    let finalWidth = cropWidth
    let finalHeight = cropHeight

    if (this.options.aspectRatio && this.options.aspectRatio > 0) {
      const aspectRatio = this.options.aspectRatio
      if (cropWidth / cropHeight > aspectRatio) {
        finalWidth = cropHeight * aspectRatio
      } else {
        finalHeight = cropWidth / aspectRatio
      }
    }

    // 计算裁剪区域的位置（相对于容器居中）
    const cropX = (containerWidth - finalWidth) / 2
    const cropY = (containerHeight - finalHeight) / 2

    // 设置裁剪区域
    const cropArea: CropArea = {
      x: cropX,
      y: cropY,
      width: finalWidth,
      height: finalHeight,
      shape: this.options.shape || CropShape.RECTANGLE,
    }

    this.cropAreaManager.setCropArea(cropArea)

    if (this.options.debug) {
      console.log('Crop area initialized:', {
        container: { width: containerWidth, height: containerHeight },
        image: { width: imageWidth, height: imageHeight },
        display: { width: displayWidth, height: displayHeight },
        transform: this.transform,
        cropArea
      })
    }
  }

  /**
   * 更新裁剪约束
   */
  private updateCropConstraints(): void {
    const bounds = {
      x: 0,
      y: 0,
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    }

    this.cropAreaManager.updateConstraints({ bounds })
  }

  /**
   * 重置变换
   */
  private resetTransform(): void {
    if (!this.currentImage) {
      this.transform = {
        scale: 1,
        rotation: 0,
        translateX: 0,
        translateY: 0,
        flipX: false,
        flipY: false,
      }
      return
    }

    // 计算图片适配缩放
    const containerWidth = this.container.clientWidth
    const containerHeight = this.container.clientHeight
    const imageWidth = this.currentImage.naturalWidth
    const imageHeight = this.currentImage.naturalHeight

    // 计算适配缩放比例
    const scaleX = containerWidth / imageWidth
    const scaleY = containerHeight / imageHeight
    const scale = Math.min(scaleX, scaleY, 1) // 不超过原始尺寸

    // 计算居中位置
    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale
    const translateX = (containerWidth - scaledWidth) / 2
    const translateY = (containerHeight - scaledHeight) / 2

    this.transform = {
      scale,
      rotation: 0,
      translateX,
      translateY,
      flipX: false,
      flipY: false,
    }

    if (this.options.debug) {
      console.log('Transform reset:', {
        container: { width: containerWidth, height: containerHeight },
        image: { width: imageWidth, height: imageHeight },
        transform: this.transform
      })
    }
  }

  /**
   * 计算源矩形区域
   * @param cropArea 裁剪区域
   * @returns 源矩形
   */
  private calculateSourceRect(cropArea: CropArea): Rectangle {
    if (!this.currentImage) {
      throw new Error('No image loaded')
    }

    const containerWidth = this.container.clientWidth
    const containerHeight = this.container.clientHeight
    const imageNaturalWidth = this.currentImage.naturalWidth
    const imageNaturalHeight = this.currentImage.naturalHeight

    // 获取当前变换信息
    const scale = this.transform.scale
    const translateX = this.transform.translateX
    const translateY = this.transform.translateY

    // 计算图片在容器中的显示尺寸
    const displayWidth = imageNaturalWidth * scale
    const displayHeight = imageNaturalHeight * scale

    // 计算裁剪区域相对于图片的位置
    // 裁剪区域坐标是相对于容器的，需要转换为相对于图片的坐标
    const relativeX = cropArea.x - translateX
    const relativeY = cropArea.y - translateY

    // 转换为原始图片坐标系
    const sourceX = relativeX / scale
    const sourceY = relativeY / scale
    const sourceWidth = cropArea.width / scale
    const sourceHeight = cropArea.height / scale

    // 确保源区域在图片范围内
    const clampedX = Math.max(0, Math.min(sourceX, imageNaturalWidth))
    const clampedY = Math.max(0, Math.min(sourceY, imageNaturalHeight))
    const clampedWidth = Math.max(0, Math.min(sourceWidth, imageNaturalWidth - clampedX))
    const clampedHeight = Math.max(0, Math.min(sourceHeight, imageNaturalHeight - clampedY))

    const result = {
      x: clampedX,
      y: clampedY,
      width: clampedWidth,
      height: clampedHeight,
    }

    if (this.options.debug) {
      console.log('calculateSourceRect:', {
        container: { width: containerWidth, height: containerHeight },
        image: { width: imageNaturalWidth, height: imageNaturalHeight },
        display: { width: displayWidth, height: displayHeight },
        transform: this.transform,
        cropArea,
        relative: { x: relativeX, y: relativeY },
        source: { x: sourceX, y: sourceY, width: sourceWidth, height: sourceHeight },
        result
      })
    }

    return result
  }

  /**
   * 创建裁剪路径
   * @param ctx Canvas上下文
   * @param shape 裁剪形状
   * @param rect 目标矩形
   */
  private createClipPath(ctx: CanvasRenderingContext2D, shape: CropShape, rect: Rectangle): void {
    ctx.beginPath()

    const centerX = rect.x + rect.width / 2
    const centerY = rect.y + rect.height / 2

    switch (shape) {
      case CropShape.CIRCLE:
        // 圆形裁剪路径
        const radius = Math.min(rect.width, rect.height) / 2
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        break

      case CropShape.ELLIPSE:
        // 椭圆裁剪路径
        const radiusX = rect.width / 2
        const radiusY = rect.height / 2
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
        break

      case CropShape.ROUNDED_RECTANGLE:
        // 圆角矩形裁剪路径
        const cornerRadius = Math.min(rect.width, rect.height) * 0.1
        this.createRoundedRectPath(ctx, rect.x, rect.y, rect.width, rect.height, cornerRadius)
        break

      case CropShape.TRIANGLE:
        // 三角形裁剪路径
        ctx.moveTo(centerX, rect.y)
        ctx.lineTo(rect.x, rect.y + rect.height)
        ctx.lineTo(rect.x + rect.width, rect.y + rect.height)
        ctx.closePath()
        break

      case CropShape.DIAMOND:
        // 菱形裁剪路径
        ctx.moveTo(centerX, rect.y)
        ctx.lineTo(rect.x + rect.width, centerY)
        ctx.lineTo(centerX, rect.y + rect.height)
        ctx.lineTo(rect.x, centerY)
        ctx.closePath()
        break

      case CropShape.HEXAGON:
        // 六边形裁剪路径
        this.createPolygonPath(ctx, centerX, centerY, Math.min(rect.width, rect.height) / 2, 6)
        break

      case CropShape.STAR:
        // 星形裁剪路径
        this.createStarPath(ctx, centerX, centerY, Math.min(rect.width, rect.height) / 2, 5)
        break

      case CropShape.RECTANGLE:
      default:
        // 矩形裁剪路径
        ctx.rect(rect.x, rect.y, rect.width, rect.height)
        break
    }

    ctx.clip()
  }

  /**
   * 创建圆角矩形路径
   */
  private createRoundedRectPath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
  }

  /**
   * 创建多边形路径
   */
  private createPolygonPath(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    sides: number
  ): void {
    const angle = (2 * Math.PI) / sides
    ctx.moveTo(centerX + radius * Math.cos(0), centerY + radius * Math.sin(0))

    for (let i = 1; i < sides; i++) {
      const x = centerX + radius * Math.cos(i * angle)
      const y = centerY + radius * Math.sin(i * angle)
      ctx.lineTo(x, y)
    }

    ctx.closePath()
  }

  /**
   * 创建星形路径
   */
  private createStarPath(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    points: number
  ): void {
    const outerRadius = radius
    const innerRadius = radius * 0.4
    const angle = Math.PI / points

    ctx.moveTo(centerX + outerRadius * Math.cos(0), centerY + outerRadius * Math.sin(0))

    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerRadius : innerRadius
      const a = i * angle
      const x = centerX + r * Math.cos(a)
      const y = centerY + r * Math.sin(a)
      ctx.lineTo(x, y)
    }

    ctx.closePath()
  }

  /**
   * 初始化交互控制器
   */
  private initializeInteractionController(): void {
    const initialCropArea = this.cropAreaManager.getCropArea()

    this.interactionController = new InteractionController(
      this.canvas,
      initialCropArea,
      {
        onCropAreaChange: (cropArea) => {
          this.cropAreaManager.setCropArea(cropArea)
          this.render()
          this.emit(EventType.CROP_CHANGE, { cropArea })
        },
        onImageMove: (deltaX, deltaY) => {
          // 移动背景图片
          this.transform.translateX += deltaX
          this.transform.translateY += deltaY
          this.render()
          this.emit(EventType.TRANSFORM_CHANGE, { transform: { ...this.transform } })
        },
        onInteractionStart: () => {
          this.emit(EventType.CROP_START)
        },
        onInteractionEnd: () => {
          this.emit(EventType.CROP_END)
        },
        onZoom: (scaleFactor, center) => {
          this.zoomAtPoint(scaleFactor, center)
        },
      }
    )
  }

  /**
   * 加载默认图片
   */
  private async loadDefaultImage(): Promise<void> {
    // 创建默认图片的data URL
    const defaultImageUrl = this.createDefaultImageDataUrl()

    try {
      await this.setImage(defaultImageUrl)
    } catch (error) {
      if (this.options.debug) {
        console.warn('Failed to load default image:', error)
      }
    }
  }

  /**
   * 创建默认图片的data URL
   */
  private createDefaultImageDataUrl(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    canvas.width = 800
    canvas.height = 600

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#fafafa')
    gradient.addColorStop(0.5, '#f5f5f5')
    gradient.addColorStop(1, '#f0f0f0')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // 绘制细微的网格
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)'
    ctx.lineWidth = 1

    const gridSize = 50
    for (let x = 0; x <= canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = 0; y <= canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // 绘制中心内容
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // 绘制虚线边框区域
    ctx.strokeStyle = 'rgba(114, 46, 209, 0.3)'
    ctx.lineWidth = 2
    ctx.setLineDash([8, 8])
    ctx.beginPath()
    ctx.roundRect(centerX - 200, centerY - 120, 400, 240, 12)
    ctx.stroke()
    ctx.setLineDash([])

    // 绘制圆形背景
    ctx.fillStyle = 'rgba(114, 46, 209, 0.08)'
    ctx.beginPath()
    ctx.arc(centerX, centerY - 30, 60, 0, Math.PI * 2)
    ctx.fill()

    // 绘制Lucide图片上传图标
    this.drawLucideUploadIcon(ctx, centerX, centerY - 30, 40, 'rgba(114, 46, 209, 0.7)')

    // 绘制主标题
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('拖拽图片到此处', centerX, centerY + 30)

    // 绘制"或"分隔符
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('或', centerX, centerY + 55)

    // 绘制点击提示
    ctx.fillStyle = 'rgba(114, 46, 209, 0.8)'
    ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('点击选择文件', centerX, centerY + 80)

    // 绘制支持格式提示
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    ctx.fillText('支持 JPG、PNG、WEBP 格式，最大 10MB', centerX, centerY + 105)

    return canvas.toDataURL('image/png')
  }

  /**
   * 绘制Lucide上传图标
   * @param ctx Canvas上下文
   * @param x 中心X坐标
   * @param y 中心Y坐标
   * @param size 图标大小
   * @param color 图标颜色
   */
  private drawLucideUploadIcon(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
    ctx.save()
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const scale = size / 24 // Lucide图标默认是24x24
    ctx.translate(x, y)
    ctx.scale(scale, scale)
    ctx.translate(-12, -12) // 居中

    // 绘制上传图标 (Lucide Upload图标的路径)
    // 上传箭头
    ctx.beginPath()
    ctx.moveTo(12, 15)
    ctx.lineTo(12, 3)
    ctx.stroke()

    // 箭头头部
    ctx.beginPath()
    ctx.moveTo(7, 8)
    ctx.lineTo(12, 3)
    ctx.lineTo(17, 8)
    ctx.stroke()

    // 底部横线
    ctx.beginPath()
    ctx.moveTo(3, 21)
    ctx.lineTo(21, 21)
    ctx.stroke()

    ctx.restore()
  }

  /**
   * 渲染
   */
  private render(): void {
    if (this.destroyed) return

    // 清空 Canvas
    this.renderer.clear()

    // 绘制图片
    if (this.currentImage) {
      this.renderer.drawImage(this.currentImage, this.transform)
    }

    // 绘制裁剪区域
    const cropArea = this.cropAreaManager.getCropArea()
    this.renderer.drawCropArea(cropArea)

    // 更新交互控制器的裁剪区域
    if (this.interactionController) {
      this.interactionController.updateCropArea(cropArea)
    }
  }

  /**
   * 显示加载状态
   */
  private showLoadingState(): void {
    // 创建加载遮罩层
    const loadingOverlay = document.createElement('div')
    loadingOverlay.className = 'ldesign-cropper__loading-overlay'
    loadingOverlay.innerHTML = `
      <div class="ldesign-cropper__loading-content">
        <div class="ldesign-cropper__loading-spinner"></div>
        <div class="ldesign-cropper__loading-text">图片加载中...</div>
      </div>
    `

    // 添加到容器中
    this.container.appendChild(loadingOverlay)

    // 保存引用以便后续移除
    this.container.setAttribute('data-loading', 'true')
  }

  /**
   * 隐藏加载状态
   */
  private hideLoadingState(): void {
    const loadingOverlay = this.container.querySelector('.ldesign-cropper__loading-overlay')
    if (loadingOverlay) {
      loadingOverlay.remove()
    }
    this.container.removeAttribute('data-loading')
  }

  /**
   * 获取容器元素
   * @returns 容器元素
   */
  getContainer(): HTMLElement {
    return this.container
  }
}
