/**
 * LDesign QRCode - Logo处理器
 * 实现Logo嵌入到二维码的功能
 */

import type { LogoOptions } from '../types'

export class LogoProcessor {
  private imageCache = new Map<string, HTMLImageElement>()

  constructor() {
    // 初始化
  }

  /**
   * 向Canvas添加Logo
   */
  async addLogoToCanvas(
    canvas: HTMLCanvasElement,
    logoOptions: LogoOptions,
  ): Promise<void> {
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('Cannot get canvas context')

    const image = await this.loadImage(logoOptions.src)
    const logoSize = logoOptions.size || Math.min(canvas.width, canvas.height) * 0.2
    const margin = logoOptions.margin || 0

    // 计算Logo位置
    const position = this.calculateLogoPosition(
      canvas.width,
      canvas.height,
      logoSize,
      logoSize,
      logoOptions.position || 'center',
      logoOptions.offset,
    )
    const x = position.x
    const y = position.y

    // 保存当前状态
    ctx.save()

    // 设置透明度
    if (logoOptions.opacity !== undefined) {
      ctx.globalAlpha = logoOptions.opacity
    }

    // 绘制背景（如果设置）
    if (logoOptions.backgroundColor) {
      this.drawLogoBackground(ctx, x - margin, y - margin, logoSize + margin * 2, logoOptions)
    }

    // 绘制边框（如果设置）
    if (logoOptions.borderWidth && logoOptions.borderColor) {
      this.drawLogoBorder(ctx, x - margin, y - margin, logoSize + margin * 2, logoOptions)
    }

    // 创建裁剪路径
    if (logoOptions.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2, 0, Math.PI * 2)
      ctx.clip()
    }

    // 绘制Logo图片
    ctx.drawImage(image, x, y, logoSize, logoSize)

    // 恢复状态
    ctx.restore()
  }

  /**
   * 向SVG添加Logo
   */
  async addLogoToSVG(
    svgElement: SVGElement,
    logoOptions: LogoOptions,
  ): Promise<void> {
    // 获取SVG尺寸，优先使用属性值
    const width = Number(svgElement.getAttribute('width')) || 200
    const height = Number(svgElement.getAttribute('height')) || 200
    const logoSize = logoOptions.size || Math.min(width, height) * 0.2
    const margin = logoOptions.margin || 0

    // 计算Logo位置
    const position = this.calculateLogoPosition(
      width,
      height,
      logoSize,
      logoSize,
      logoOptions.position || 'center',
      logoOptions.offset,
    )
    const x = position.x
    const y = position.y

    // 创建Logo组
    const logoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    logoGroup.setAttribute('class', 'qrcode-logo')

    // 添加背景
    if (logoOptions.backgroundColor) {
      const background = this.createSVGBackground(x - margin, y - margin, logoSize + margin * 2, logoOptions)
      logoGroup.appendChild(background)
    }

    // 添加边框
    if (logoOptions.borderWidth && logoOptions.borderColor) {
      const border = this.createSVGBorder(x - margin, y - margin, logoSize + margin * 2, logoOptions)
      logoGroup.appendChild(border)
    }

    // 添加Logo图片
    const image = await this.createSVGImage(logoOptions.src, x, y, logoSize, logoOptions)
    logoGroup.appendChild(image)

    // 添加到SVG
    svgElement.appendChild(logoGroup)
  }

  /**
   * 加载图片
   */
  private async loadImage(src: string): Promise<HTMLImageElement> {
    // 检查缓存
    if (this.imageCache.has(src)) {
      return this.imageCache.get(src)!
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        this.imageCache.set(src, img)
        resolve(img)
      }

      img.onerror = () => {
        reject(new Error(`Failed to load logo image: ${src}`))
      }

      img.src = src
    })
  }

  /**
   * 绘制Logo背景
   */
  private drawLogoBackground(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    options: LogoOptions,
  ): void {
    ctx.fillStyle = options.backgroundColor!

    if (options.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.fill()
    }
    else {
      ctx.fillRect(x, y, size, size)
    }
  }

  /**
   * 绘制Logo边框
   */
  private drawLogoBorder(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    options: LogoOptions,
  ): void {
    ctx.strokeStyle = options.borderColor!
    ctx.lineWidth = options.borderWidth!

    if (options.shape === 'circle') {
      ctx.beginPath()
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2)
      ctx.stroke()
    }
    else {
      ctx.strokeRect(x, y, size, size)
    }
  }

  /**
   * 创建SVG背景
   */
  private createSVGBackground(
    x: number,
    y: number,
    size: number,
    options: LogoOptions,
  ): SVGElement {
    if (options.shape === 'circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', (x + size / 2).toString())
      circle.setAttribute('cy', (y + size / 2).toString())
      circle.setAttribute('r', (size / 2).toString())
      circle.setAttribute('fill', options.backgroundColor!)
      return circle
    }
    else {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', x.toString())
      rect.setAttribute('y', y.toString())
      rect.setAttribute('width', size.toString())
      rect.setAttribute('height', size.toString())
      rect.setAttribute('fill', options.backgroundColor!)
      return rect
    }
  }

  /**
   * 创建SVG边框
   */
  private createSVGBorder(
    x: number,
    y: number,
    size: number,
    options: LogoOptions,
  ): SVGElement {
    if (options.shape === 'circle') {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', (x + size / 2).toString())
      circle.setAttribute('cy', (y + size / 2).toString())
      circle.setAttribute('r', (size / 2).toString())
      circle.setAttribute('fill', 'none')
      circle.setAttribute('stroke', options.borderColor!)
      circle.setAttribute('stroke-width', options.borderWidth!.toString())
      return circle
    }
    else {
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      rect.setAttribute('x', x.toString())
      rect.setAttribute('y', y.toString())
      rect.setAttribute('width', size.toString())
      rect.setAttribute('height', size.toString())
      rect.setAttribute('fill', 'none')
      rect.setAttribute('stroke', options.borderColor!)
      rect.setAttribute('stroke-width', options.borderWidth!.toString())
      return rect
    }
  }

  /**
   * 创建SVG图片
   */
  private async createSVGImage(
    src: string,
    x: number,
    y: number,
    size: number,
    options: LogoOptions,
  ): Promise<SVGElement> {
    const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    image.setAttribute('x', x.toString())
    image.setAttribute('y', y.toString())
    image.setAttribute('width', size.toString())
    image.setAttribute('height', size.toString())
    image.setAttribute('href', src)

    if (options.opacity !== undefined) {
      image.setAttribute('opacity', options.opacity.toString())
    }

    // 添加裁剪路径（圆形）
    if (options.shape === 'circle') {
      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
      const clipId = `logo-clip-${Math.random().toString(36).substr(2, 9)}`
      clipPath.setAttribute('id', clipId)

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
      circle.setAttribute('cx', (x + size / 2).toString())
      circle.setAttribute('cy', (y + size / 2).toString())
      circle.setAttribute('r', (size / 2).toString())

      clipPath.appendChild(circle)
      image.parentElement?.appendChild(clipPath)
      image.setAttribute('clip-path', `url(#${clipId})`)
    }

    return image
  }

  /**
   * 计算Logo位置
   */
  calculateLogoPosition(
    containerWidth: number,
    containerHeight: number,
    logoWidth: number,
    logoHeight: number,
    position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' = 'center',
    offset?: { x: number, y: number },
  ): { x: number, y: number } {
    let x: number
    let y: number

    switch (position) {
      case 'top-left':
        x = 0
        y = 0
        break
      case 'top-right':
        x = containerWidth - logoWidth
        y = 0
        break
      case 'bottom-left':
        x = 0
        y = containerHeight - logoHeight
        break
      case 'bottom-right':
        x = containerWidth - logoWidth
        y = containerHeight - logoHeight
        break
      case 'center':
      default:
        x = (containerWidth - logoWidth) / 2
        y = (containerHeight - logoHeight) / 2
        break
    }

    // 应用偏移
    if (offset) {
      x += offset.x
      y += offset.y
    }

    return { x, y }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.imageCache.clear()
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.clearCache()
  }
}

/**
 * 创建Logo处理器实例
 */
export function createLogoProcessor(): LogoProcessor {
  return new LogoProcessor()
}
