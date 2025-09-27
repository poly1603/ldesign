/**
 * @file 图片处理器
 * @description 处理图片的加载、变换、滤镜等操作
 */

import type {
  ImageSource,
  ImageInfo,
  TransformState,
  Size,
  Point,
  ImageFormat,
  CropOutputOptions,
} from '../types'

import {
  loadImageSource,
  getImageInfo,
  imageToCanvas,
  resizeImage,
  rotateImage,
  flipImage,
  cropImage,
  canvasToBlob,
  canvasToDataURL,
  applyImageFilter,
} from '../utils/image'

import { createCanvas, getCanvasContext } from '../utils/dom'
import { degToRad } from '../utils/math'

/**
 * 图片处理器类
 */
export class ImageProcessor {
  private image: HTMLImageElement | null = null
  private imageInfo: ImageInfo | null = null
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private transformState: TransformState

  constructor() {
    this.canvas = createCanvas()
    const ctx = getCanvasContext(this.canvas)
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }
    this.ctx = ctx

    this.transformState = {
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      translate: { x: 0, y: 0 },
    }
  }

  /**
   * 加载图片
   */
  async loadImage(source: ImageSource): Promise<ImageInfo> {
    this.image = await loadImageSource(source)
    this.imageInfo = getImageInfo(this.image)
    
    // 重置变换状态
    this.resetTransform()
    
    return this.imageInfo
  }

  /**
   * 获取图片信息
   */
  getImageInfo(): ImageInfo | null {
    return this.imageInfo
  }

  /**
   * 获取当前图片
   */
  getImage(): HTMLImageElement | null {
    return this.image
  }

  /**
   * 获取变换状态
   */
  getTransformState(): TransformState {
    return { ...this.transformState }
  }

  /**
   * 设置变换状态
   */
  setTransformState(state: Partial<TransformState>): void {
    this.transformState = { ...this.transformState, ...state }
  }

  /**
   * 重置变换
   */
  resetTransform(): void {
    this.transformState = {
      scale: 1,
      rotation: 0,
      flipX: false,
      flipY: false,
      translate: { x: 0, y: 0 },
    }
  }

  /**
   * 缩放
   */
  scale(factor: number): void {
    this.transformState.scale = Math.max(0.1, Math.min(10, factor))
  }

  /**
   * 旋转
   */
  rotate(angle: number): void {
    this.transformState.rotation = angle % 360
  }

  /**
   * 翻转
   */
  flip(horizontal: boolean, vertical: boolean): void {
    this.transformState.flipX = horizontal
    this.transformState.flipY = vertical
  }

  /**
   * 平移
   */
  translate(x: number, y: number): void {
    this.transformState.translate = { x, y }
  }

  /**
   * 渲染到Canvas
   */
  renderToCanvas(
    targetCanvas: HTMLCanvasElement,
    size?: Size,
    backgroundColor?: string
  ): void {
    if (!this.image) {
      throw new Error('No image loaded')
    }

    const ctx = getCanvasContext(targetCanvas)
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    const renderSize = size || {
      width: this.image.naturalWidth,
      height: this.image.naturalHeight,
    }

    targetCanvas.width = renderSize.width
    targetCanvas.height = renderSize.height

    // 清除画布
    ctx.clearRect(0, 0, renderSize.width, renderSize.height)

    // 填充背景
    if (backgroundColor) {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, renderSize.width, renderSize.height)
    }

    // 保存上下文状态
    ctx.save()

    // 移动到中心点
    const centerX = renderSize.width / 2
    const centerY = renderSize.height / 2
    ctx.translate(centerX, centerY)

    // 应用变换
    ctx.scale(
      this.transformState.scale * (this.transformState.flipX ? -1 : 1),
      this.transformState.scale * (this.transformState.flipY ? -1 : 1)
    )

    ctx.rotate(degToRad(this.transformState.rotation))
    ctx.translate(this.transformState.translate.x, this.transformState.translate.y)

    // 绘制图片
    const imageWidth = this.image.naturalWidth
    const imageHeight = this.image.naturalHeight
    
    ctx.drawImage(
      this.image,
      -imageWidth / 2,
      -imageHeight / 2,
      imageWidth,
      imageHeight
    )

    // 恢复上下文状态
    ctx.restore()
  }

  /**
   * 获取渲染后的Canvas
   */
  getRenderedCanvas(size?: Size, backgroundColor?: string): HTMLCanvasElement {
    const canvas = createCanvas()
    this.renderToCanvas(canvas, size, backgroundColor)
    return canvas
  }

  /**
   * 裁剪图片
   */
  crop(
    cropArea: { x: number; y: number; width: number; height: number },
    outputSize?: Size,
    options?: CropOutputOptions
  ): HTMLCanvasElement {
    if (!this.image) {
      throw new Error('No image loaded')
    }

    // 首先渲染完整的变换后图片
    const fullCanvas = this.getRenderedCanvas(undefined, options?.backgroundColor)

    // 然后裁剪指定区域
    const croppedCanvas = createCanvas()
    const ctx = getCanvasContext(croppedCanvas)
    
    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    const finalSize = outputSize || { width: cropArea.width, height: cropArea.height }
    croppedCanvas.width = finalSize.width
    croppedCanvas.height = finalSize.height

    // 填充背景
    if (options?.fillBackground && options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor
      ctx.fillRect(0, 0, finalSize.width, finalSize.height)
    }

    // 启用高质量缩放
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // 绘制裁剪区域
    ctx.drawImage(
      fullCanvas,
      cropArea.x, cropArea.y, cropArea.width, cropArea.height,
      0, 0, finalSize.width, finalSize.height
    )

    return croppedCanvas
  }

  /**
   * 导出为DataURL
   */
  exportAsDataURL(
    cropArea?: { x: number; y: number; width: number; height: number },
    options?: CropOutputOptions
  ): string {
    let canvas: HTMLCanvasElement

    if (cropArea) {
      canvas = this.crop(cropArea, options?.size, options)
    } else {
      canvas = this.getRenderedCanvas(options?.size, options?.backgroundColor)
    }

    return canvasToDataURL(canvas, options?.format, options?.quality)
  }

  /**
   * 导出为Blob
   */
  async exportAsBlob(
    cropArea?: { x: number; y: number; width: number; height: number },
    options?: CropOutputOptions
  ): Promise<Blob> {
    let canvas: HTMLCanvasElement

    if (cropArea) {
      canvas = this.crop(cropArea, options?.size, options)
    } else {
      canvas = this.getRenderedCanvas(options?.size, options?.backgroundColor)
    }

    return canvasToBlob(canvas, options?.format, options?.quality)
  }

  /**
   * 应用滤镜
   */
  applyFilter(filter: string): HTMLCanvasElement {
    if (!this.image) {
      throw new Error('No image loaded')
    }

    return applyImageFilter(this.image, filter)
  }

  /**
   * 获取图片的变换矩阵
   */
  getTransformMatrix(): DOMMatrix {
    const matrix = new DOMMatrix()

    // 应用变换（顺序很重要）
    matrix.translateSelf(this.transformState.translate.x, this.transformState.translate.y)
    matrix.scaleSelf(
      this.transformState.scale * (this.transformState.flipX ? -1 : 1),
      this.transformState.scale * (this.transformState.flipY ? -1 : 1)
    )
    matrix.rotateSelf(this.transformState.rotation)

    return matrix
  }

  /**
   * 计算变换后的边界框
   */
  getTransformedBounds(originalSize?: Size): {
    width: number
    height: number
    left: number
    top: number
  } {
    if (!this.image && !originalSize) {
      throw new Error('No image loaded and no size provided')
    }

    const size = originalSize || {
      width: this.image!.naturalWidth,
      height: this.image!.naturalHeight,
    }

    // 计算四个角的坐标
    const corners = [
      { x: -size.width / 2, y: -size.height / 2 },
      { x: size.width / 2, y: -size.height / 2 },
      { x: size.width / 2, y: size.height / 2 },
      { x: -size.width / 2, y: size.height / 2 },
    ]

    const matrix = this.getTransformMatrix()
    const transformedCorners = corners.map(corner => {
      const point = new DOMPoint(corner.x, corner.y)
      return matrix.transformPoint(point)
    })

    const xs = transformedCorners.map(p => p.x)
    const ys = transformedCorners.map(p => p.y)

    const left = Math.min(...xs)
    const top = Math.min(...ys)
    const right = Math.max(...xs)
    const bottom = Math.max(...ys)

    return {
      width: right - left,
      height: bottom - top,
      left,
      top,
    }
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.image = null
    this.imageInfo = null
    // Canvas会被垃圾回收
  }
}
