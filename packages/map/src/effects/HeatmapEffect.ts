/**
 * 热力图效果实现
 * 基于数据点生成热力图可视化效果
 */

import { BaseEffect } from './BaseEffect'
import type { HeatmapEffectOptions } from '../types'

/**
 * 热力图数据点
 */
interface HeatmapDataPoint {
  lng: number
  lat: number
  value: number
  x?: number
  y?: number
}

/**
 * 热力图效果类
 * 实现基于Canvas的热力图渲染
 */
export class HeatmapEffect extends BaseEffect {
  /** Canvas元素 */
  private canvas: HTMLCanvasElement | null = null
  
  /** Canvas上下文 */
  private ctx: CanvasRenderingContext2D | null = null
  
  /** 热力图数据 */
  private data: HeatmapDataPoint[] = []
  
  /** 效果配置 */
  private heatmapOptions: Required<HeatmapEffectOptions>
  
  /** 渐变缓存 */
  private gradientCache: ImageData | null = null

  constructor(id: string, options: HeatmapEffectOptions) {
    super(id, 'heatmap', options)
    
    this.heatmapOptions = {
      data: [],
      radius: 20,
      gradient: ['blue', 'cyan', 'lime', 'yellow', 'red'],
      maxIntensity: 1,
      blur: 15,
      ...options,
      id: options.id || id,
      visible: options.visible !== false,
      opacity: options.opacity || 1,
      zIndex: options.zIndex || 1000
    }
    
    this.data = [...this.heatmapOptions.data]
  }

  /**
   * 初始化热力图效果
   */
  protected async onInitialize(): Promise<void> {
    // 创建Canvas元素
    this.createCanvas()
    
    // 创建渐变
    this.createGradient()
    
    // 渲染热力图
    this.render()
    
    // 监听地图变化
    this.bindMapEvents()
  }

  /**
   * 创建Canvas元素
   */
  private createCanvas(): void {
    if (!this.container) return

    this.canvas = document.createElement('canvas')
    this.canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `
    
    this.container.appendChild(this.canvas)
    this.ctx = this.canvas.getContext('2d')
    
    // 设置Canvas尺寸
    this.resizeCanvas()
  }

  /**
   * 调整Canvas尺寸
   */
  private resizeCanvas(): void {
    if (!this.canvas || !this.container) return

    const { width, height } = this.getMapSize()
    
    // 设置Canvas实际尺寸
    this.canvas.width = width
    this.canvas.height = height
    
    // 设置Canvas显示尺寸
    this.canvas.style.width = `${width}px`
    this.canvas.style.height = `${height}px`
  }

  /**
   * 创建颜色渐变
   */
  private createGradient(): void {
    if (!this.ctx) return

    const { gradient } = this.heatmapOptions
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 1
    
    const ctx = canvas.getContext('2d')!
    const gradientObj = ctx.createLinearGradient(0, 0, 256, 0)
    
    // 添加颜色停止点
    gradient.forEach((color, index) => {
      gradientObj.addColorStop(index / (gradient.length - 1), color)
    })
    
    ctx.fillStyle = gradientObj
    ctx.fillRect(0, 0, 256, 1)
    
    this.gradientCache = ctx.getImageData(0, 0, 256, 1)
  }

  /**
   * 更新数据点的屏幕坐标
   */
  private updateDataPoints(): void {
    this.data.forEach(point => {
      const [x, y] = this.project([point.lng, point.lat])
      point.x = x
      point.y = y
    })
  }

  /**
   * 渲染热力图
   */
  private render(): void {
    if (!this.ctx || !this.canvas) return

    const { width, height } = this.getMapSize()
    
    // 清空画布
    this.ctx.clearRect(0, 0, width, height)
    
    if (this.data.length === 0) return
    
    // 更新数据点坐标
    this.updateDataPoints()
    
    // 创建临时画布用于绘制灰度热力图
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = width
    tempCanvas.height = height
    const tempCtx = tempCanvas.getContext('2d')!
    
    // 绘制热力点
    this.renderHeatPoints(tempCtx)
    
    // 应用模糊效果
    this.applyBlur(tempCtx, tempCanvas)
    
    // 应用颜色渐变
    this.applyGradient(tempCtx, tempCanvas)
    
    // 绘制到主画布
    this.ctx.globalAlpha = this.options.opacity || 1
    this.ctx.drawImage(tempCanvas, 0, 0)
  }

  /**
   * 绘制热力点
   */
  private renderHeatPoints(ctx: CanvasRenderingContext2D): void {
    const { radius, maxIntensity } = this.heatmapOptions
    
    this.data.forEach(point => {
      if (point.x === undefined || point.y === undefined) return
      
      // 计算强度
      const intensity = Math.min(point.value / maxIntensity, 1)
      const alpha = intensity * 255
      
      // 创建径向渐变
      const gradient = ctx.createRadialGradient(
        point.x, point.y, 0,
        point.x, point.y, radius
      )
      gradient.addColorStop(0, `rgba(0, 0, 0, ${alpha / 255})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      
      // 绘制热力点
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
      ctx.fill()
    })
  }

  /**
   * 应用模糊效果
   */
  private applyBlur(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    const { blur } = this.heatmapOptions
    
    if (blur > 0) {
      ctx.filter = `blur(${blur}px)`
      ctx.drawImage(canvas, 0, 0)
      ctx.filter = 'none'
    }
  }

  /**
   * 应用颜色渐变
   */
  private applyGradient(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    if (!this.gradientCache) return
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const gradientData = this.gradientCache.data
    
    // 将灰度值映射到颜色
    for (let i = 0; i < data.length; i += 4) {
      const alpha = data[i + 3] // 使用alpha通道作为强度
      
      if (alpha > 0) {
        const colorIndex = Math.floor((alpha / 255) * 255) * 4
        
        data[i] = gradientData[colorIndex]     // R
        data[i + 1] = gradientData[colorIndex + 1] // G
        data[i + 2] = gradientData[colorIndex + 2] // B
        data[i + 3] = alpha // 保持原始alpha值
      }
    }
    
    ctx.putImageData(imageData, 0, 0)
  }

  /**
   * 绑定地图事件
   */
  private bindMapEvents(): void {
    if (!this.mapEngine) return
    
    // 监听地图移动和缩放
    this.mapEngine.on('move', () => {
      this.render()
    })
    
    this.mapEngine.on('zoom', () => {
      this.render()
    })
    
    // 监听地图大小变化
    this.mapEngine.on('resize', () => {
      this.resizeCanvas()
      this.render()
    })
  }

  /**
   * 设置热力图数据
   */
  setData(data: Array<{ lng: number; lat: number; value: number }>): void {
    this.data = [...data]
    this.heatmapOptions.data = [...data]
    this.render()
  }

  /**
   * 添加数据点
   */
  addDataPoint(point: { lng: number; lat: number; value: number }): void {
    this.data.push({ ...point })
    this.heatmapOptions.data.push({ ...point })
    this.render()
  }

  /**
   * 清空数据
   */
  clearData(): void {
    this.data = []
    this.heatmapOptions.data = []
    this.render()
  }

  /**
   * 设置最大强度
   */
  setMaxIntensity(maxIntensity: number): void {
    this.heatmapOptions.maxIntensity = maxIntensity
    this.render()
  }

  /**
   * 设置半径
   */
  setRadius(radius: number): void {
    this.heatmapOptions.radius = radius
    this.render()
  }

  /**
   * 设置渐变色
   */
  setGradient(gradient: string[]): void {
    this.heatmapOptions.gradient = [...gradient]
    this.createGradient()
    this.render()
  }

  /**
   * 更新配置
   */
  protected onUpdate(newOptions: Partial<HeatmapEffectOptions>): void {
    const oldOptions = { ...this.heatmapOptions }
    this.heatmapOptions = { ...this.heatmapOptions, ...newOptions }
    
    // 检查是否需要重新创建渐变
    if (newOptions.gradient && 
        JSON.stringify(newOptions.gradient) !== JSON.stringify(oldOptions.gradient)) {
      this.createGradient()
    }
    
    // 检查是否需要更新数据
    if (newOptions.data) {
      this.data = [...newOptions.data]
    }
    
    // 重新渲染
    this.render()
  }

  /**
   * 透明度变化回调
   */
  protected onOpacityChange(): void {
    this.render()
  }

  /**
   * 销毁效果
   */
  protected onDestroy(): void {
    this.data = []
    this.gradientCache = null
    this.canvas = null
    this.ctx = null
  }
}
