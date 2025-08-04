/**
 * SVG渲染器实现
 */

import type {
  WatermarkConfig,
  RenderContext,
  SVGRenderer,
  LayoutResult,
  RenderOptions
} from '../types'

import { WatermarkError, WatermarkErrorCode, ErrorSeverity } from '../types/error'

/**
 * SVG渲染器实现
 * 使用SVG元素渲染水印
 */
export class SVGRendererImpl implements SVGRenderer {
  private imageCache = new Map<string, string>()
  private patternCache = new Map<string, SVGPatternElement>()

  /**
   * 渲染水印
   */
  async render(
    config: WatermarkConfig,
    context: RenderContext,
    options: RenderOptions = {}
  ): Promise<HTMLElement[]> {
    try {
      // 创建SVG元素
      const svg = this.createSVG(context)
      
      // 计算布局
      const layout = this.calculateLayout(config, context)
      
      // 创建定义区域
      const defs = this.createDefs(svg, config)
      
      // 渲染水印内容
      await this.renderWatermarks(svg, config, layout)
      
      // 设置SVG样式
      this.applySVGStyles(svg, config)
      
      return [svg]
    } catch (error) {
      throw new WatermarkError(
        'SVG rendering failed',
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
    
    const svg = elements[0] as SVGSVGElement
    
    // 更新SVG尺寸
    this.updateSVGSize(svg, context)
    
    // 清空内容（保留defs）
    const defs = svg.querySelector('defs')
    svg.innerHTML = ''
    if (defs) {
      svg.appendChild(defs)
    }
    
    // 重新创建定义区域
    this.createDefs(svg, config)
    
    // 计算布局
    const layout = this.calculateLayout(config, context)
    
    // 重新渲染水印内容
    await this.renderWatermarks(svg, config, layout)
    
    return [svg]
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
    return 'svg'
  }

  /**
   * 检查是否支持
   */
  isSupported(): boolean {
    try {
      return !!(document.createElementNS && 
               document.createElementNS('http://www.w3.org/2000/svg', 'svg').createSVGRect)
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

  private createSVG(context: RenderContext): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    
    // 设置SVG尺寸
    this.updateSVGSize(svg, context)
    
    return svg
  }

  private updateSVGSize(svg: SVGSVGElement, context: RenderContext): void {
    const rect = context.containerRect
    
    // 设置viewBox
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`)
    
    // 设置尺寸
    svg.setAttribute('width', rect.width.toString())
    svg.setAttribute('height', rect.height.toString())
    
    // 设置样式
    svg.style.width = `${rect.width}px`
    svg.style.height = `${rect.height}px`
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

  private createDefs(svg: SVGSVGElement, config: WatermarkConfig): SVGDefsElement {
    let defs = svg.querySelector('defs') as SVGDefsElement
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
      svg.appendChild(defs)
    }
    
    // 创建滤镜
    if (config.style?.filter) {
      this.createFilters(defs, config)
    }
    
    // 创建渐变
    if (config.style?.gradient) {
      this.createGradients(defs, config)
    }
    
    // 创建图案
    if (config.style?.pattern) {
      this.createPatterns(defs, config)
    }
    
    return defs
  }

  private createFilters(defs: SVGDefsElement, config: WatermarkConfig): void {
    const style = config.style!
    
    // 创建阴影滤镜
    if (style.textShadow || style.boxShadow) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
      filter.setAttribute('id', 'watermark-shadow')
      
      const feDropShadow = document.createElementNS('http://www.w3.org/2000/svg', 'feDropShadow')
      feDropShadow.setAttribute('dx', '2')
      feDropShadow.setAttribute('dy', '2')
      feDropShadow.setAttribute('stdDeviation', '2')
      feDropShadow.setAttribute('flood-color', 'rgba(0,0,0,0.5)')
      
      filter.appendChild(feDropShadow)
      defs.appendChild(filter)
    }
    
    // 创建模糊滤镜
    if (style.blur) {
      const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter')
      filter.setAttribute('id', 'watermark-blur')
      
      const feGaussianBlur = document.createElementNS('http://www.w3.org/2000/svg', 'feGaussianBlur')
      feGaussianBlur.setAttribute('stdDeviation', style.blur.toString())
      
      filter.appendChild(feGaussianBlur)
      defs.appendChild(filter)
    }
  }

  private createGradients(defs: SVGDefsElement, config: WatermarkConfig): void {
    // 创建线性渐变
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
    gradient.setAttribute('id', 'watermark-gradient')
    gradient.setAttribute('x1', '0%')
    gradient.setAttribute('y1', '0%')
    gradient.setAttribute('x2', '100%')
    gradient.setAttribute('y2', '100%')
    
    // 添加渐变停止点
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop1.setAttribute('offset', '0%')
    stop1.setAttribute('stop-color', config.style?.color || '#000000')
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
    stop2.setAttribute('offset', '100%')
    stop2.setAttribute('stop-color', config.style?.backgroundColor || '#ffffff')
    
    gradient.appendChild(stop1)
    gradient.appendChild(stop2)
    defs.appendChild(gradient)
  }

  private createPatterns(defs: SVGDefsElement, config: WatermarkConfig): void {
    // 创建图案
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern')
    pattern.setAttribute('id', 'watermark-pattern')
    pattern.setAttribute('patternUnits', 'userSpaceOnUse')
    pattern.setAttribute('width', '100')
    pattern.setAttribute('height', '100')
    
    defs.appendChild(pattern)
    this.patternCache.set('default', pattern)
  }

  private async renderWatermarks(
    svg: SVGSVGElement,
    config: WatermarkConfig,
    layout: LayoutResult
  ): Promise<void> {
    for (let row = 0; row < layout.rows; row++) {
      for (let col = 0; col < layout.columns; col++) {
        const x = col * layout.gapX + layout.offsetX
        const y = row * layout.gapY + layout.offsetY
        
        await this.renderSingleWatermark(svg, config, x, y)
      }
    }
  }

  private async renderSingleWatermark(
    svg: SVGSVGElement,
    config: WatermarkConfig,
    x: number,
    y: number
  ): Promise<void> {
    // 创建组元素
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    
    // 设置变换
    let transform = `translate(${x}, ${y})`
    if (config.style?.rotate) {
      transform += ` rotate(${config.style.rotate})`
    }
    group.setAttribute('transform', transform)
    
    // 设置透明度
    if (config.style?.opacity !== undefined) {
      group.setAttribute('opacity', config.style.opacity.toString())
    }
    
    // 渲染背景
    if (config.style?.backgroundColor) {
      await this.renderBackground(group, config)
    }
    
    // 渲染内容
    if (config.content?.text) {
      await this.renderText(group, config)
    }
    
    if (config.content?.image) {
      await this.renderImage(group, config)
    }
    
    svg.appendChild(group)
  }

  private async renderBackground(group: SVGGElement, config: WatermarkConfig): Promise<void> {
    const style = config.style!
    const padding = style.padding || 0
    
    // 计算背景尺寸
    let width = 100
    let height = 30
    
    if (config.content?.text) {
      // 估算文本尺寸
      const fontSize = style.fontSize || 16
      width = config.content.text.length * fontSize * 0.6 + padding * 2
      height = fontSize + padding * 2
    }
    
    if (config.content?.image) {
      width = Math.max(width, (config.content.image.width || 100) + padding * 2)
      height = Math.max(height, (config.content.image.height || 100) + padding * 2)
    }
    
    // 创建背景矩形
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('x', (-width / 2).toString())
    rect.setAttribute('y', (-height / 2).toString())
    rect.setAttribute('width', width.toString())
    rect.setAttribute('height', height.toString())
    rect.setAttribute('fill', style.backgroundColor!)
    
    // 设置边框
    if (style.border) {
      rect.setAttribute('stroke', style.border)
      rect.setAttribute('stroke-width', '1')
    }
    
    // 设置圆角
    if (style.borderRadius) {
      rect.setAttribute('rx', style.borderRadius.toString())
      rect.setAttribute('ry', style.borderRadius.toString())
    }
    
    group.appendChild(rect)
  }

  private async renderText(group: SVGGElement, config: WatermarkConfig): Promise<void> {
    const text = config.content!.text!
    const style = config.style || {}
    
    // 创建文本元素
    const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    textElement.textContent = text
    
    // 设置位置
    textElement.setAttribute('x', '0')
    textElement.setAttribute('y', '0')
    textElement.setAttribute('text-anchor', 'middle')
    textElement.setAttribute('dominant-baseline', 'central')
    
    // 设置字体样式
    if (style.fontSize) {
      textElement.setAttribute('font-size', `${style.fontSize}px`)
    }
    
    if (style.fontFamily) {
      textElement.setAttribute('font-family', style.fontFamily)
    }
    
    if (style.fontWeight) {
      textElement.setAttribute('font-weight', style.fontWeight)
    }
    
    if (style.fontStyle) {
      textElement.setAttribute('font-style', style.fontStyle)
    }
    
    // 设置颜色
    if (style.color) {
      textElement.setAttribute('fill', style.color)
    }
    
    // 设置描边
    if (style.textStroke) {
      textElement.setAttribute('stroke', style.textStroke)
      textElement.setAttribute('stroke-width', '1')
    }
    
    // 设置文本装饰
    if (style.textDecoration) {
      textElement.setAttribute('text-decoration', style.textDecoration)
    }
    
    // 设置字母间距
    if (style.letterSpacing) {
      textElement.setAttribute('letter-spacing', `${style.letterSpacing}px`)
    }
    
    // 设置滤镜
    if (style.textShadow) {
      textElement.setAttribute('filter', 'url(#watermark-shadow)')
    }
    
    group.appendChild(textElement)
  }

  private async renderImage(group: SVGGElement, config: WatermarkConfig): Promise<void> {
    const imageConfig = config.content!.image!
    
    // 创建图片元素
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    
    const width = imageConfig.width || 100
    const height = imageConfig.height || 100
    
    // 设置位置和尺寸
    image.setAttribute('x', (-width / 2).toString())
    image.setAttribute('y', (-height / 2).toString())
    image.setAttribute('width', width.toString())
    image.setAttribute('height', height.toString())
    
    // 设置图片源
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', imageConfig.src)
    
    // 设置保持宽高比
    image.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    
    group.appendChild(image)
  }

  private applySVGStyles(svg: SVGSVGElement, config: WatermarkConfig): void {
    const style = svg.style
    
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
    svg.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })
    
    // 防止选择
    svg.addEventListener('selectstart', (e) => {
      e.preventDefault()
      return false
    })
  }
}