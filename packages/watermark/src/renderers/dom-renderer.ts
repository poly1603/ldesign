/**
 * DOM渲染器实现
 */

import type {
  DOMRenderer,
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
 * DOM渲染器实现
 * 使用DOM元素渲染水印
 */
export class DOMRendererImpl implements DOMRenderer {
  private cache = new Map<string, HTMLElement>()
  private imageCache = new Map<string, HTMLImageElement>()

  /**
   * 渲染水印
   */
  async render(
    config: WatermarkConfig,
    context: RenderContext,
  ): Promise<HTMLElement[]> {
    try {
      // 计算布局
      const layout = this.calculateLayout(config, context.containerRect)

      // 创建水印元素
      const elements: HTMLElement[] = []

      for (let row = 0; row < layout.rows; row++) {
        for (let col = 0; col < layout.cols; col++) {
          const element = await this.createWatermarkElement(
            config,
            layout,
            row,
            col,
          )
          elements.push(element)
        }
      }

      return elements
    }
    catch (error) {
      throw new WatermarkError(
        'DOM rendering failed',
        WatermarkErrorCode.RENDER_FAILED,
        ErrorSeverity.HIGH,
        { context, originalError: error as Error },
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
  ): Promise<void> {
    // 简单实现：销毁旧元素，创建新元素
    await this.destroy(elements)
    await this.render(config, context)
  }

  /**
   * 销毁水印元素
   */
  async destroy(elements: HTMLElement[]): Promise<void> {
    elements.forEach((element) => {
      if (element.parentNode) {
        element.parentNode.removeChild(element)
      }
    })
  }

  /**
   * 获取渲染器类型
   */
  getType(): string {
    return 'dom'
  }

  /**
   * 检查是否支持
   */
  isSupported(): boolean {
    return typeof document !== 'undefined'
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.cache.clear()
    this.imageCache.clear()
  }

  /**
   * 销毁渲染器
   */
  dispose(): void {
    this.clearCache()
  }

  // 私有方法

  calculateLayout(
    config: WatermarkConfig,
    containerRect: DOMRect,
  ): LayoutResult {
    const layout = config.layout || {}
    // const containerRect = context.containerRect

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
    }
    else {
      // 自动计算行列数
      columns = Math.ceil(containerRect.width / gapX) + 1
      rows = Math.ceil(containerRect.height / gapY) + 1
    }

    return {
      rows,
      cols: columns,
      columns,
      gapX,
      gapY,
      offsetX,
      offsetY,
      actualGapX: gapX,
      actualGapY: gapY,
      itemWidth: gapX,
      itemHeight: gapY,
      totalWidth: columns * gapX,
      totalHeight: rows * gapY,
      positions: [],
    }
  }

  private async createWatermarkElement(
    config: WatermarkConfig,
    layout: LayoutResult,
    row: number,
    col: number,
  ): Promise<HTMLElement> {
    const element = document.createElement('div')

    // 设置基本样式
    this.applyBaseStyles(element, config, layout, row, col)

    // 添加内容
    if (typeof config.content === 'string') {
      await this.addTextContent(element, config)
    }
    else if (typeof config.content === 'object' && config.content) {
      if (config.content.text) {
        await this.addTextContent(element, config)
      }
      if (config.content.image) {
        await this.addImageContent(element, config)
      }
    }

    // 应用样式
    this.applyStyles(element, config)

    // 设置事件监听
    this.setupEventListeners(element, config)

    return element
  }

  private applyBaseStyles(
    element: HTMLElement,
    config: WatermarkConfig,
    layout: LayoutResult,
    row: number,
    col: number,
  ): void {
    const style = element.style

    // 定位
    style.position = 'absolute'
    style.left = `${col * layout.gapX + layout.offsetX}px`
    style.top = `${row * layout.gapY + layout.offsetY}px`

    // 层级
    style.zIndex = config.zIndex?.toString() || '9999'

    // 指针事件
    style.pointerEvents = 'none'

    // 用户选择
    style.userSelect = 'none'
    style.webkitUserSelect = 'none'
      ; (style as any).mozUserSelect = 'none'
      ; (style as any).msUserSelect = 'none'

      // 防止拖拽
      ; (style as any).webkitUserDrag = 'none'
      ; (style as any).mozUserDrag = 'none'
      ; (style as any).msUserDrag = 'none'

    // 基本样式
    style.display = 'flex'
    style.alignItems = 'center'
    style.justifyContent = 'center'
    style.whiteSpace = 'nowrap'
    style.overflow = 'hidden'
  }

  private async addTextContent(
    element: HTMLElement,
    config: WatermarkConfig,
  ): Promise<void> {
    const textElement = document.createElement('span')
    const text
      = typeof config.content === 'string'
        ? config.content
        : typeof config.content === 'object' && config.content?.text
          ? config.content.text
          : ''
    textElement.textContent = text
    element.appendChild(textElement)
  }

  private async addImageContent(
    element: HTMLElement,
    config: WatermarkConfig,
  ): Promise<void> {
    const imageConfig
      = typeof config.content === 'object' && config.content?.image
        ? config.content.image
        : null
    if (!imageConfig)
      return

    const img = await this.loadImage(imageConfig.src)

    // 设置图片样式
    if (imageConfig.width) {
      img.style.width = `${imageConfig.width}px`
    }
    if (imageConfig.height) {
      img.style.height = `${imageConfig.height}px`
    }

    img.style.display = 'block'
    img.style.maxWidth = '100%'
    img.style.maxHeight = '100%'

    element.appendChild(img)
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    // 检查缓存
    if (this.imageCache.has(src)) {
      const cachedImg = this.imageCache.get(src)!
      return cachedImg.cloneNode(true) as HTMLImageElement
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

      img.src = src
    })
  }

  applyStyles(element: HTMLElement, config: WatermarkConfig): void {
    const style = config.style || {}
    const elementStyle = element.style

    // 字体样式
    if (style.fontSize) {
      elementStyle.fontSize = `${style.fontSize}px`
    }

    if (style.fontFamily) {
      elementStyle.fontFamily = style.fontFamily
    }

    if (style.fontWeight) {
      elementStyle.fontWeight = style.fontWeight?.toString() || 'normal'
    }

    if (style.fontStyle) {
      elementStyle.fontStyle = style.fontStyle
    }

    // 颜色
    if (style.color) {
      elementStyle.color = style.color
    }

    if (style.backgroundColor) {
      elementStyle.backgroundColor = style.backgroundColor
    }

    // 透明度
    if (style.opacity !== undefined) {
      elementStyle.opacity = style.opacity.toString()
    }

    // 旋转
    if (style.rotate) {
      elementStyle.transform = `rotate(${style.rotate}deg)`
    }

    // 边框
    if (style.border) {
      elementStyle.border = style.border
    }

    if (style.borderRadius) {
      elementStyle.borderRadius = `${style.borderRadius}px`
    }

    // 阴影
    if (style.textShadow) {
      elementStyle.textShadow = style.textShadow
    }

    if (style.boxShadow) {
      elementStyle.boxShadow = style.boxShadow
    }

    // 内边距
    if (style.padding) {
      elementStyle.padding = `${style.padding}px`
    }

    // 混合模式
    if (style.mixBlendMode) {
      elementStyle.mixBlendMode = style.mixBlendMode
    }

    // 滤镜
    if (style.filter) {
      elementStyle.filter = style.filter
    }

    // 背景
    if (style.background) {
      elementStyle.background = style.background
    }

    // 文本装饰
    if (style.textDecoration) {
      elementStyle.textDecoration = style.textDecoration
    }

    // 行高
    if (style.lineHeight) {
      elementStyle.lineHeight = style.lineHeight.toString()
    }

    // 字母间距
    if (style.letterSpacing) {
      elementStyle.letterSpacing = `${style.letterSpacing}px`
    }
  }

  private setupEventListeners(
    element: HTMLElement,
    _config: WatermarkConfig,
  ): void {
    // 防止右键菜单
    element.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      return false
    })

    // 防止选择
    element.addEventListener('selectstart', (e) => {
      e.preventDefault()
      return false
    })

    // 防止拖拽
    element.addEventListener('dragstart', (e) => {
      e.preventDefault()
      return false
    })

    // 防止复制
    element.addEventListener('copy', (e) => {
      e.preventDefault()
      return false
    })
  }

  // 实现DOMRenderer接口的缺失方法
  readonly type = 'dom' as const
  supportsAnimation = true
  supportsOpacity = true

  createElement(config: WatermarkConfig, row: number, col: number): HTMLElement {
    const element = document.createElement('div')
    element.className = 'watermark-item'
    element.dataset.row = row.toString()
    element.dataset.col = col.toString()

    // 设置基础样式
    element.style.position = 'absolute'
    element.style.pointerEvents = 'none'
    element.style.userSelect = 'none'
      ; (element.style as any).webkitUserDrag = 'none'
    element.style.display = 'flex'
    element.style.alignItems = 'center'
    element.style.justifyContent = 'center'
    element.style.whiteSpace = 'nowrap'
    element.style.overflow = 'hidden'

    return element
  }

  setElementPosition(element: HTMLElement, x: number, y: number): void {
    element.style.position = 'absolute'
    element.style.left = `${x}px`
    element.style.top = `${y}px`
  }

  setElementContent(element: HTMLElement, content: string | string[]): void {
    if (typeof content === 'string') {
      element.textContent = content
    }
    else {
      element.textContent = content.join(' ')
    }
  }

  async applyAnimation(element: HTMLElement, animation: any): Promise<void> {
    if (animation.type) {
      element.style.animation = `${animation.type} ${animation.duration || '1s'
        } ${animation.timing || 'ease'}`
    }
  }

  cleanup(): void {
    // DOM渲染器清理逻辑
  }
}
