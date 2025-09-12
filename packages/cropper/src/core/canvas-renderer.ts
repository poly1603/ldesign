/**
 * @file Canvas 渲染器
 * @description 处理 Canvas 绘制和渲染操作
 */

import type { Point, Size, Rectangle, Transform, CropArea } from '@/types'
import { CropShape } from '@/types'
import { MathUtils, DOMUtils, ColorUtils } from '@/utils'

/**
 * 渲染配置
 */
export interface RenderConfig {
  /** 背景颜色 */
  backgroundColor?: string
  /** 遮罩颜色 */
  maskColor?: string
  /** 遮罩透明度 */
  maskOpacity?: number
  /** 是否显示网格 */
  showGrid?: boolean
  /** 网格线数量 */
  gridLines?: number
  /** 网格线颜色 */
  gridColor?: string
  /** 是否显示中心线 */
  showCenterLines?: boolean
  /** 中心线颜色 */
  centerLineColor?: string
  /** 控制点边框颜色 */
  controlPointBorderColor?: string
  /** 是否启用抗锯齿 */
  antiAlias?: boolean
  /** 像素比 */
  pixelRatio?: number
}

/**
 * Canvas 渲染器类
 * 提供高性能的 Canvas 绘制功能
 */
export class CanvasRenderer {
  /** Canvas 元素 */
  private canvas: HTMLCanvasElement

  /** 2D 渲染上下文 */
  private ctx: CanvasRenderingContext2D

  /** 像素比 */
  private pixelRatio: number

  /** 默认配置 */
  private defaultConfig: Required<RenderConfig> = {
    backgroundColor: '#ffffff',
    maskColor: '#000000',
    maskOpacity: 0.5,
    showGrid: true,
    gridLines: 3,
    gridColor: 'rgba(255, 255, 255, 0.5)',
    showCenterLines: false,
    centerLineColor: '#ffffff',
    controlPointBorderColor: '#ffffff',
    antiAlias: true,
    pixelRatio: window.devicePixelRatio || 1,
  }

  /**
   * 构造函数
   * @param canvas Canvas 元素
   * @param config 渲染配置
   */
  constructor(canvas: HTMLCanvasElement, config: Partial<RenderConfig> = {}) {
    this.canvas = canvas
    this.pixelRatio = config.pixelRatio ?? (window.devicePixelRatio || 1)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context')
    }

    this.ctx = ctx
    this.defaultConfig = { ...this.defaultConfig, ...config }

    this.setupCanvas()
  }

  /**
   * 设置 Canvas
   */
  private setupCanvas(): void {
    // 设置高DPI支持
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = rect.width * this.pixelRatio
    this.canvas.height = rect.height * this.pixelRatio
    this.canvas.style.width = `${rect.width}px`
    this.canvas.style.height = `${rect.height}px`

    // 缩放上下文以匹配设备像素比
    this.ctx.scale(this.pixelRatio, this.pixelRatio)

    // 设置抗锯齿
    if (this.defaultConfig.antiAlias) {
      this.ctx.imageSmoothingEnabled = true
      this.ctx.imageSmoothingQuality = 'high'
    }
  }

  /**
   * 调整 Canvas 大小
   * @param size 新尺寸
   */
  resize(size: Size): void {
    this.canvas.width = size.width * this.pixelRatio
    this.canvas.height = size.height * this.pixelRatio
    this.canvas.style.width = `${size.width}px`
    this.canvas.style.height = `${size.height}px`

    this.ctx.scale(this.pixelRatio, this.pixelRatio)

    if (this.defaultConfig.antiAlias) {
      this.ctx.imageSmoothingEnabled = true
      this.ctx.imageSmoothingQuality = 'high'
    }
  }

  /**
   * 清空 Canvas
   * @param config 渲染配置
   */
  clear(config: Partial<RenderConfig> = {}): void {
    const cfg = { ...this.defaultConfig, ...config }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制背景
    if (cfg.backgroundColor) {
      this.ctx.fillStyle = cfg.backgroundColor
      this.ctx.fillRect(0, 0, this.canvas.width / this.pixelRatio, this.canvas.height / this.pixelRatio)
    }
  }

  /**
   * 绘制图片
   * @param image 图片元素
   * @param transform 变换信息
   * @param bounds 绘制边界
   */
  drawImage(
    image: HTMLImageElement,
    transform: Transform,
    bounds?: Rectangle,
  ): void {
    this.ctx.save()

    // 计算图片绘制尺寸
    const imageWidth = image.naturalWidth * transform.scale
    const imageHeight = image.naturalHeight * transform.scale

    // 计算绘制位置（基于变换的平移）
    const drawX = transform.translateX
    const drawY = transform.translateY

    // 应用变换
    if (transform.rotation !== 0 || transform.flipX || transform.flipY) {
      // 如果有旋转或翻转，需要以图片中心为基准进行变换
      const centerX = drawX + imageWidth / 2
      const centerY = drawY + imageHeight / 2

      this.ctx.translate(centerX, centerY)
      this.ctx.rotate(transform.rotation)
      this.ctx.scale(
        transform.flipX ? -1 : 1,
        transform.flipY ? -1 : 1,
      )

      // 绘制图片（以中心为原点）
      this.ctx.drawImage(
        image,
        -imageWidth / 2,
        -imageHeight / 2,
        imageWidth,
        imageHeight,
      )
    } else {
      // 简单情况：只有缩放和平移
      this.ctx.drawImage(
        image,
        drawX,
        drawY,
        imageWidth,
        imageHeight,
      )
    }

    this.ctx.restore()
  }

  /**
   * 绘制裁剪区域
   * @param cropArea 裁剪区域
   * @param config 渲染配置
   */
  drawCropArea(cropArea: CropArea, config: Partial<RenderConfig> = {}): void {
    const cfg = { ...this.defaultConfig, ...config }

    this.ctx.save()

    // 绘制遮罩
    this.drawMask(cropArea, cfg)

    // 绘制裁剪边框
    this.drawCropBorder(cropArea)

    // 绘制网格线
    if (cfg.showGrid) {
      this.drawGrid(cropArea, cfg)
    }

    // 绘制中心线
    if (cfg.showCenterLines) {
      this.drawCenterLines(cropArea, cfg)
    }

    // 绘制控制点
    this.drawControlPoints(cropArea, cfg)

    this.ctx.restore()
  }

  /**
   * 绘制遮罩
   * @param cropArea 裁剪区域
   * @param config 配置
   */
  private drawMask(cropArea: CropArea, config: RenderConfig): void {
    const canvasWidth = this.canvas.width / this.pixelRatio
    const canvasHeight = this.canvas.height / this.pixelRatio

    this.ctx.save()
    this.ctx.fillStyle = ColorUtils.hexToRgba(config.maskColor || '#000000', config.maskOpacity || 0.5)

    // 使用复合操作创建遮罩效果
    this.ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    this.ctx.globalCompositeOperation = 'destination-out'

    // 根据形状绘制透明区域
    this.drawCropShape(cropArea)
    this.ctx.fill()

    this.ctx.restore()
  }

  /**
   * 绘制裁剪形状
   * @param cropArea 裁剪区域
   */
  private drawCropShape(cropArea: CropArea): void {
    this.ctx.beginPath()

    switch (cropArea.shape) {
      case CropShape.RECTANGLE:
        this.ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
        break

      case CropShape.CIRCLE: {
        const centerX = cropArea.x + cropArea.width / 2
        const centerY = cropArea.y + cropArea.height / 2
        const radius = Math.min(cropArea.width, cropArea.height) / 2
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        break
      }

      case CropShape.ELLIPSE: {
        const centerX = cropArea.x + cropArea.width / 2
        const centerY = cropArea.y + cropArea.height / 2
        const radiusX = cropArea.width / 2
        const radiusY = cropArea.height / 2
        this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2)
        break
      }

      default:
        // 默认矩形
        this.ctx.rect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    }
  }

  /**
   * 绘制裁剪边框
   * @param cropArea 裁剪区域
   */
  private drawCropBorder(cropArea: CropArea): void {
    this.ctx.save()
    this.ctx.strokeStyle = '#ffffff'
    this.ctx.lineWidth = 2
    this.ctx.setLineDash([])

    this.drawCropShape(cropArea)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制网格线
   * @param cropArea 裁剪区域
   * @param config 配置
   */
  private drawGrid(cropArea: CropArea, config: RenderConfig): void {
    if (!config.gridLines || config.gridLines <= 0) return

    this.ctx.save()
    this.ctx.strokeStyle = config.gridColor || '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([])

    // 对于圆形和椭圆形状，需要裁剪网格线
    if (cropArea.shape === CropShape.CIRCLE || cropArea.shape === CropShape.ELLIPSE) {
      // 创建裁剪路径
      this.ctx.save()
      this.drawCropShape(cropArea)
      this.ctx.clip()
    }

    const stepX = cropArea.width / (config.gridLines + 1)
    const stepY = cropArea.height / (config.gridLines + 1)

    // 绘制垂直线
    for (let i = 1; i <= config.gridLines; i++) {
      const x = cropArea.x + stepX * i
      this.ctx.beginPath()
      this.ctx.moveTo(x, cropArea.y)
      this.ctx.lineTo(x, cropArea.y + cropArea.height)
      this.ctx.stroke()
    }

    // 绘制水平线
    for (let i = 1; i <= config.gridLines; i++) {
      const y = cropArea.y + stepY * i
      this.ctx.beginPath()
      this.ctx.moveTo(cropArea.x, y)
      this.ctx.lineTo(cropArea.x + cropArea.width, y)
      this.ctx.stroke()
    }

    // 恢复裁剪状态
    if (cropArea.shape === CropShape.CIRCLE || cropArea.shape === CropShape.ELLIPSE) {
      this.ctx.restore()
    }

    this.ctx.restore()
  }

  /**
   * 绘制中心线
   * @param cropArea 裁剪区域
   * @param config 配置
   */
  private drawCenterLines(cropArea: CropArea, config: RenderConfig): void {
    this.ctx.save()
    this.ctx.strokeStyle = config.centerLineColor || '#ffffff'
    this.ctx.lineWidth = 1
    this.ctx.setLineDash([5, 5])

    const centerX = cropArea.x + cropArea.width / 2
    const centerY = cropArea.y + cropArea.height / 2

    // 垂直中心线
    this.ctx.beginPath()
    this.ctx.moveTo(centerX, cropArea.y)
    this.ctx.lineTo(centerX, cropArea.y + cropArea.height)
    this.ctx.stroke()

    // 水平中心线
    this.ctx.beginPath()
    this.ctx.moveTo(cropArea.x, centerY)
    this.ctx.lineTo(cropArea.x + cropArea.width, centerY)
    this.ctx.stroke()

    this.ctx.restore()
  }

  /**
   * 绘制控制点
   * @param points 控制点数组
   * @param activeIndex 激活的控制点索引
   */
  drawHandles(points: Point[], activeIndex = -1): void {
    this.ctx.save()

    points.forEach((point, index) => {
      const isActive = index === activeIndex
      const size = isActive ? 8 : 6

      this.ctx.fillStyle = isActive ? '#007acc' : '#ffffff'
      this.ctx.strokeStyle = '#333333'
      this.ctx.lineWidth = 2

      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2)
      this.ctx.fill()
      this.ctx.stroke()
    })

    this.ctx.restore()
  }

  /**
   * 获取 Canvas 元素
   * @returns Canvas 元素
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas
  }

  /**
   * 获取渲染上下文
   * @returns 2D 渲染上下文
   */
  getContext(): CanvasRenderingContext2D {
    return this.ctx
  }

  /**
   * 获取像素比
   * @returns 像素比
   */
  getPixelRatio(): number {
    return this.pixelRatio
  }

  /**
   * 绘制控制点
   * @param cropArea 裁剪区域
   * @param config 渲染配置
   */
  private drawControlPoints(cropArea: CropArea, config: RenderConfig): void {
    const { x, y, width, height, shape } = cropArea
    const pointSize = 8
    const pointColor = '#ffffff'
    const borderColor = '#007bff'

    this.ctx.save()
    this.ctx.fillStyle = pointColor
    this.ctx.strokeStyle = borderColor
    this.ctx.lineWidth = 2

    // 只为矩形绘制控制点，圆形和椭圆形不需要
    if (shape === CropShape.RECTANGLE) {
      const points = [
        { x: x, y: y }, // 左上
        { x: x + width / 2, y: y }, // 上中
        { x: x + width, y: y }, // 右上
        { x: x + width, y: y + height / 2 }, // 右中
        { x: x + width, y: y + height }, // 右下
        { x: x + width / 2, y: y + height }, // 下中
        { x: x, y: y + height }, // 左下
        { x: x, y: y + height / 2 }, // 左中
      ]

      points.forEach(point => {
        this.ctx.fillRect(
          point.x - pointSize / 2,
          point.y - pointSize / 2,
          pointSize,
          pointSize
        )
        this.ctx.strokeStyle = config.controlPointBorderColor || '#ffffff'
        this.ctx.lineWidth = 1
        this.ctx.strokeRect(
          point.x - pointSize / 2,
          point.y - pointSize / 2,
          pointSize,
          pointSize
        )
      })
    }

    this.ctx.restore()
  }

  /**
   * 更新配置
   * @param config 新配置
   */
  updateConfig(config: Partial<RenderConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config }
  }

  /**
   * 销毁渲染器
   */
  destroy(): void {
    // 清空 Canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}
