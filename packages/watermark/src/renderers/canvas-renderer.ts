/**
 * Canvas渲染器实现
 */

import type {
  CanvasRenderer,
  LayoutResult,
  RenderContext,
  WatermarkConfig,
} from '../types'

import {
  ErrorSeverity,
  WatermarkError,
  WatermarkErrorCode,
} from '../types/error'

/**
 * Canvas渲染器实现
 * 使用Canvas元素渲染水印
 */
export class CanvasRendererImpl implements CanvasRenderer {
  readonly type = 'canvas' as const
  canvas!: HTMLCanvasElement
  ctx!: CanvasRenderingContext2D
  private imageCache = new Map<string, HTMLImageElement>()
  private patternCache = new Map<string, CanvasPattern>()

  /**
   * 渲染水印
   */
  async render(
    config: WatermarkConfig,
    context: RenderContext
  ): Promise<HTMLElement[]> {
    try {
      // 创建Canvas元素
      const canvas = this.createCanvas(context)
      const ctx = canvas.getContext('2d')!

      // 计算布局
      const layout = this.calculateLayout(config, context.containerRect)

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
        ErrorSeverity.HIGH
      )
    }
  }

  /**
   * 更新水印
   */
  async update(
    elements: HTMLElement[],
    config: WatermarkConfig,
    context: RenderContext
  ): Promise<void> {
    if (elements.length === 0) {
      await this.render(config, context)
      return
    }

    const canvas = elements[0] as HTMLCanvasElement
    const ctx = canvas.getContext('2d')!

    // 调整Canvas尺寸
    this.updateCanvasSize(canvas, context)

    // 计算布局
    const layout = this.calculateLayout(config, context.containerRect)

    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 设置全局样式
    this.applyGlobalStyles(ctx, config)

    // 重新渲染水印内容
    await this.renderWatermarks(ctx, config, layout)

    // update方法不需要返回值
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

  private updateCanvasSize(
    canvas: HTMLCanvasElement,
    context: RenderContext
  ): void {
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

  calculateLayout(
    config: WatermarkConfig,
    containerRect: DOMRect
  ): LayoutResult {
    const layout = config.layout || {}
    // containerRect已经作为参数传入

    // 默认值
    const gapX = layout.gapX || 100
    const gapY = layout.gapY || 100
    const offsetX = layout.offsetX || 0
    const offsetY = layout.offsetY || 0

    // 计算行列数
    let rows: number
    let columns: number

    if (layout.rows && layout.cols) {
      rows = layout.rows
      columns = layout.cols
    } else {
      // 自动计算行列数
      columns = Math.ceil(containerRect.width / gapX) + 1
      rows = Math.ceil(containerRect.height / gapY) + 1
    }

    // 生成位置信息
    const positions = []
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        positions.push({
          x: col * gapX + offsetX,
          y: row * gapY + offsetY,
          row,
          col,
        })
      }
    }

    return {
      rows,
      cols: columns,
      columns,
      itemWidth: gapX,
      itemHeight: gapY,
      actualGapX: gapX,
      actualGapY: gapY,
      gapX,
      gapY,
      offsetX,
      offsetY,
      totalWidth: columns * gapX,
      totalHeight: rows * gapY,
      positions,
    }
  }

  private applyGlobalStyles(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig
  ): void {
    const style = config.style || {}

    // 设置字体
    const fontSize = style.fontSize || 16
    const fontFamily = style.fontFamily || 'Arial, sans-serif'
    const fontWeight = style.fontWeight || 'normal'
    // fontStyle不在WatermarkStyle中，使用默认值
    const fontStyle = 'normal'

    ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`

    // 设置文本对齐
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // 设置全局透明度
    if (style.opacity !== undefined) {
      ctx.globalAlpha = style.opacity
    }

    // mixBlendMode不在WatermarkStyle中，跳过设置
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
    if (typeof config.content === 'string') {
      await this.renderText(ctx, {
        ...config,
        content: { text: config.content },
      })
    } else if (typeof config.content === 'object' && config.content) {
      if (config.content.text) {
        await this.renderText(ctx, config)
      }
      if (config.content.image) {
        await this.renderImage(ctx, config)
      }
    }

    ctx.restore()
  }

  private renderBackground(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig
  ): void {
    const style = config.style!
    const padding = style.padding || 0

    // 计算背景尺寸
    let width = 0
    let height = 0

    if (typeof config.content === 'string') {
      const metrics = ctx.measureText(config.content)
      width = metrics.width + (typeof padding === 'number' ? padding * 2 : 0)
      height =
        (style.fontSize || 16) + (typeof padding === 'number' ? padding * 2 : 0)
    } else if (typeof config.content === 'object' && config.content) {
      if (config.content.text) {
        const metrics = ctx.measureText(config.content.text)
        width = metrics.width + (typeof padding === 'number' ? padding * 2 : 0)
        height =
          (style.fontSize || 16) +
          (typeof padding === 'number' ? padding * 2 : 0)
      }
      if (config.content.image) {
        width = Math.max(
          width,
          (config.content.image.width || 100) +
            (typeof padding === 'number' ? padding * 2 : 0)
        )
        height = Math.max(
          height,
          (config.content.image.height || 100) +
            (typeof padding === 'number' ? padding * 2 : 0)
        )
      }
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

  private async renderText(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig
  ): Promise<void> {
    const text =
      typeof config.content === 'string'
        ? config.content
        : typeof config.content === 'object' && config.content?.text
        ? config.content.text
        : ''
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

  private async renderImage(
    ctx: CanvasRenderingContext2D,
    config: WatermarkConfig
  ): Promise<void> {
    const imageConfig =
      typeof config.content === 'object' && config.content?.image
        ? config.content.image
        : null
    if (!imageConfig) return

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

  private applyCanvasStyles(
    canvas: HTMLCanvasElement,
    config: WatermarkConfig
  ): void {
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
    ;(style as any).webkitUserDrag = 'none'
    ;(style as any).mozUserDrag = 'none'
    ;(style as any).msUserDrag = 'none'

    // 防止右键菜单
    canvas.addEventListener('contextmenu', e => {
      e.preventDefault()
      return false
    })
  }

  private applyTextShadow(
    ctx: CanvasRenderingContext2D,
    textShadow: string
  ): void {
    // 解析text-shadow值
    // 简化实现，支持基本格式："2px 2px 4px rgba(0,0,0,0.5)"
    const parts = textShadow.split(' ')
    if (parts.length >= 3) {
      const offsetX = Number.parseFloat(parts[0])
      const offsetY = Number.parseFloat(parts[1])
      const blur = Number.parseFloat(parts[2])
      const color = parts.slice(3).join(' ') || 'rgba(0,0,0,0.5)'

      ctx.shadowOffsetX = offsetX
      ctx.shadowOffsetY = offsetY
      ctx.shadowBlur = blur
      ctx.shadowColor = color
    }
  }

  // private _convertBlendMode(blendMode: string): GlobalCompositeOperation {
  //   // 转换CSS混合模式到Canvas混合模式
  //   const modeMap: Record<string, GlobalCompositeOperation> = {
  //     'normal': 'source-over',
  //     'multiply': 'multiply',
  //     'screen': 'screen',
  //     'overlay': 'overlay',
  //     'darken': 'darken',
  //     'lighten': 'lighten',
  //     'color-dodge': 'color-dodge',
  //     'color-burn': 'color-burn',
  //     'hard-light': 'hard-light',
  //     'soft-light': 'soft-light',
  //     'difference': 'difference',
  //     'exclusion': 'exclusion',
  //   }

  //   return modeMap[blendMode] || 'source-over'
  // }

  // 实现CanvasRenderer接口的缺失方法
  drawText(text: string, x: number, y: number, config: WatermarkConfig): void {
    if (!this.ctx) return

    const style = config.style || {}
    this.ctx.fillStyle = style.color || '#000000'
    this.ctx.font = `${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`
    this.ctx.fillText(text, x, y)
  }

  drawImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    if (!this.ctx) return
    this.ctx.drawImage(image, x, y, width, height)
  }

  clear(): void {
    if (!this.ctx || !this.canvas) return
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  toDataURL(type?: string, quality?: number): string {
    if (!this.canvas) return ''
    return this.canvas.toDataURL(type, quality)
  }

  setElementContent(_element: HTMLElement, _content: string | string[]): void {
    // Canvas渲染器不需要设置DOM元素内容
  }

  // 实现BaseRenderer接口的其他缺失方法
  supportsAnimation = true
  supportsOpacity = true

  applyStyles(_element: HTMLElement, _styles: any): void {
    // Canvas渲染器不需要应用DOM样式
  }

  async applyAnimation(_element: HTMLElement, _animation: any): Promise<void> {
    // Canvas渲染器的动画通过重绘实现
  }

  cleanup(): void {
    this.dispose()
  }
}
