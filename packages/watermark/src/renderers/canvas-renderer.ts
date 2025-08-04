/**
 * Canvas渲染器实现
 */

import type {
  WatermarkConfig,
  RenderContext,
  CanvasRenderer,
  LayoutResult,
  RenderOptions
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'

/**
 * Canvas渲染器实现
 * 使用Canvas元素渲染水印
 */
export class CanvasRendererImpl implements CanvasRenderer {
  private imageCache = new Map<string, HTMLImageElement>()
  private patternCache = new Map<string, CanvasPattern>()

  /**
   * 渲染水印
   */
  async render(
    config: WatermarkConfig,
    context: RenderContext,
    options: RenderOptions = {}
  ): Promise<HTMLElement[]> {
    try {
      // 创建Canvas元素
      const canvas = this.createCanvas(context)
      const ctx = canvas.getContext('2d')!
      
      // 计算布局
      const layout = this.calculateLayout(config, context)
      
      // 清空画布
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // 设置全局样式
      this.applyGlobalStyles(ctx, config)
      
      // 渲染水印内容
      await this.renderWatermarks(ctx, config, layout)
      
      // 设置Canvas样式
      this.applyCanvasStyles(canvas, config)
      
      return [canvas]
    } catch (error) {
      throw new WatermarkError(
        'Canvas rendering failed',
        WatermarkErrorCode.RENDER_FAILED,
        ErrorSeverity.HIGH,
        { config, context, originalError: error as Error }
      )
    }
  }

  /**
   * 更新水印
   */
  async update(
    elements: HTMLElement[],
    config: WatermarkConfig,
    context: RenderContext,
    options: RenderOptions = {}
  ): Promise<HTMLElement[]> {
    if (elements.length === 0) {
      return this.render(config, context, options)
    }
    
    const canvas = elements[0] as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!
    
    // 调整Canvas尺寸
    this.updateCanvasSize(canvas, context)
    
    // 计算布局
    const layout = this.calculateLayout(config, context)
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // 设置全局样式
    this.applyGlobalStyles(ctx, config)
    
    // 重新渲染水印内容
    await this.renderWatermarks(ctx, config, layout)
    
    return [canvas]
  }

  /**
   * 销毁水印元素
   */
  async destroy(elements: HTMLElement[]): Promise<void> {
    elements.forEach(element => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
  }

  /**
   * 获取渲染器类型
   */
  getType(): string {
    return 'canvas'
  }

  /**
   * 检查是否支持
   */
  isSupported(): boolean {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext && canvas.getContext('2d'))
    } catch {
      return false
    }
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.imageCache.clear()
    this.patternCache.clear()
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    this.clearCache()
  }

  // 私有方法

  private createCanvas(context: RenderContext): HTMLCanvasElement {
    const canvas = document.createElement('canvas')
    
    // 设置Canvas尺寸
    this.updateCanvasSize(canvas, context)
    
    return canvas
  }

  private updateCanvasSize(canvas: HTMLCanvasElement, context: RenderContext): void {
    const rect = context.containerRect
    const dpr = context.devicePixelRatio
    
    // 设置显示尺寸
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    
    // 设置实际尺寸（考虑设备像素比）
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    // 缩放上下文以匹配设备像素比
    const ctx = canvas.getContext('2d')!
    ctx.scale(dpr, dpr)
  }

  private calculateLayout(config: WatermarkConfig, context: RenderContext): LayoutResult {
    const layout = config.layout || {}
    const containerRect = context.containerRect
    
    // 默认值
    const gapX = layout.gapX || 100
    const gapY = layout.gapY || 100
    const offsetX = layout.offsetX || 0
    const offsetY = layout.offsetY || 0
    
    // 计算行列数
    let rows: number
    let columns: number
    
    if (layout.rows && layout.columns) {
      rows = layout.rows
      columns = layout.columns
    } else {
      // 自动计算行列数
      columns = Math.ceil(containerRect.width / gapX) + 1
      rows = Math.ceil(containerRect.height / gapY) + 1
    }
    
    return {
      rows,
      columns,
      gapX,
      gapY,
      offsetX,
      offsetY,
      itemWidth: gapX,
      itemHeight: gapY,
      totalWidth: columns * gapX,
      totalHeight: rows * gapY
    }
  }

  private applyGlobalStyles(ctx: CanvasRenderingContext2D, config: WatermarkConfig): void {
    const style = config.style || {}
    
    // 设置字体
    const fontSize = style.fontSize || 16
    const fontFamily = style.fontFamily || 'Arial, sans-serif'
    const fontWeight = style.fontWeight || 'normal'
    const fontStyle = style.fontStyle || 'normal'
    
    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`
    
    // 设置文本对齐
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // 设置全局透明度
    if (style.opacity !== undefined) {
      ctx.globalAlpha = style.opacity
    }
    
    // 设置混合模式
    if (style.mixBlendMode) {
      ctx.globalCompositeOperation = this.convertBlendMode(style.mixBlendMode)
    }
  }

  private async renderWatermarks(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    layout: LayoutResult
  ): Promise<void> {
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.columns; col++) {
        const x = col * layout.gapX + layout.offsetX
        const y = row * layout.gapY + layout.offsetY
        
        await this.renderSingleWatermark(ctx, config, x, y)
      }
    }
  }

  private async renderSingleWatermark(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig,
    x: number,
    y: number
  ): Promise<void> {
    ctx.save()
    
    // 移动到水印位置
    ctx.translate(x, y)
    
    // 应用旋转
    if (config.style?.rotate) {
      ctx.rotate((config.style.rotate * Math.PI) / 180)
    }
    
    // 渲染背景
    if (config.style?.backgroundColor) {
      this.renderBackground(ctx, config)
    }
    
    // 渲染内容
    if (config.content?.text) {
      await this.renderText(ctx, config)
    }
    
    if (config.content?.image) {
      await this.renderImage(ctx, config)
    }
    
    ctx.restore()
  }

  private renderBackground(ctx: CanvasRenderingContext2D, config: WatermarkConfig): void {
    const style = config.style!
    const padding = style.padding || 0
    
    // 计算背景尺寸
    let width = 0
    let height = 0
    
    if (config.content?.text) {
      const metrics = ctx.measureText(config.content.text)
      width = metrics.width + padding * 2
      height = (style.fontSize || 16) + padding * 2
    }
    
    if (config.content?.image) {
      width = Math.max(width, (config.content.image.width || 100) + padding * 2)
      height = Math.max(height, (config.content.image.height || 100) + padding * 2)
    }
    
    // 绘制背景
    ctx.fillStyle = style.backgroundColor!
    ctx.fillRect(-width / 2, -height / 2, width, height)
    
    // 绘制边框
    if (style.border) {
      ctx.strokeStyle = style.border
      ctx.strokeRect(-width / 2, -height / 2, width, height)
    }
  }

  private async renderText(ctx: CanvasRenderingContext2D, config: WatermarkConfig): Promise<void> {
    const text = config.content!.text!
    const style = config.style || {}
    
    // 设置文本样式
    ctx.fillStyle = style.color || '#000000'
    
    // 绘制文本阴影
    if (style.textShadow) {
      this.applyTextShadow(ctx, style.textShadow)
    }
    
    // 绘制文本
    ctx.fillText(text, 0, 0)
    
    // 绘制文本描边
    if (style.textStroke) {
      ctx.strokeStyle = style.textStroke
      ctx.strokeText(text, 0, 0)
    }
  }

  private async renderImage(ctx: CanvasRenderingContext2D, config: WatermarkConfig): Promise<void> {
    const imageConfig = config.content!.image!
    const img = await this.loadImage(imageConfig.src)
    
    const width = imageConfig.width || img.naturalWidth
    const height = imageConfig.height || img.naturalHeight
    
    // 绘制图片
    ctx.drawImage(img, -width / 2, -height / 2, width, height)
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    // 检查缓存
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        this.imageCache.set(src, img)
        resolve(img)
      }
      
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`))
      }
      
      // 设置跨域
      img.crossOrigin = 'anonymous'
      img.src = src
    })
  }

  private applyCanvasStyles(canvas: HTMLCanvasElement, config: WatermarkConfig): void {
    const style = canvas.style
    
    // 定位
    style.position = 'absolute'
    style.top = '0'
    style.left = '0'
    
    // 层级
    style.zIndex = config.zIndex?.toString() || '9999'
    
    // 指针事件
    style.pointerEvents = 'none'
    
    // 用户选择
    style.userSelect = 'none'
    style.webkitUserSelect = 'none'
    ;(style as any).mozUserSelect = 'none'
    ;(style as any).msUserSelect = 'none'
    
    // 防止拖拽
    style.webkitUserDrag = 'none'
    ;(style as any).mozUserDrag = 'none'
    ;(style as any).msUserDrag = 'none'
    
    // 防止右键菜单
    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
  }

  private applyTextShadow(ctx: CanvasRenderingContext2D, textShadow: string): void {
    // 解析text-shadow值
    // 简化实现，支持基本格式："2px 2px 4px rgba(0,0,0,0.5)"
    const parts = textShadow.split(' ')
    if (parts.length >= 3) {
      const offsetX = parseFloat(parts[0])
      const offsetY = parseFloat(parts[1])
      const blur = parseFloat(parts[2])
      const color = parts.slice(3).join(' ') || 'rgba(0,0,0,0.5)'
      
      ctx.shadowOffsetX = offsetX
      ctx.shadowOffsetY = offsetY
      ctx.shadowBlur = blur
      ctx.shadowColor = color
    }
  }

  private convertBlendMode(blendMode: string): GlobalCompositeOperation {
    // 转换CSS混合模式到Canvas混合模式
    const modeMap: Record<string, GlobalCompositeOperation> = {
      'normal': 'source-over',
      'multiply': 'multiply',
      'screen': 'screen',
      'overlay': 'overlay',
      'darken': 'darken',
      'lighten': 'lighten',
      'color-dodge': 'color-dodge',
      'color-burn': 'color-burn',
      'hard-light': 'hard-light',
      'soft-light': 'soft-light',
      'difference': 'difference',
      'exclusion': 'exclusion'
    }
    
    return modeMap[blendMode] || 'source-over'
  }
}