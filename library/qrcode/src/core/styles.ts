/**
 * LDesign QRCode - 样式处理器
 * 实现二维码样式定制功能
 */

import type { ColorValue, GradientOptions, StyleOptions } from '../types'

export class StyleProcessor {
  constructor() {
    // 初始化
  }

  /**
   * 向Canvas应用样式
   */
  applyStylesToCanvas(
    canvas: HTMLCanvasElement,
    styleOptions: StyleOptions,
  ): void {
    const ctx = canvas.getContext('2d')
    if (!ctx)
      throw new Error('Cannot get canvas context')

    // 应用背景色
    if (styleOptions.backgroundColor) {
      this.applyBackgroundColor(ctx, canvas.width, canvas.height, styleOptions.backgroundColor)
    }

    // 应用前景色和样式
    if (styleOptions.foregroundColor || styleOptions.dotStyle) {
      this.applyForegroundStyle(ctx, canvas, styleOptions)
    }
  }

  /**
   * 向SVG应用样式
   */
  applyStylesToSVG(
    svgElement: SVGElement,
    styleOptions: StyleOptions,
  ): void {
    // 应用背景色
    if (styleOptions.backgroundColor) {
      this.applySVGBackgroundColor(svgElement, styleOptions.backgroundColor)
    }

    // 应用前景样式
    if (styleOptions.foregroundColor || styleOptions.dotStyle) {
      this.applySVGForegroundStyle(svgElement, styleOptions)
    }
  }

  /**
   * 应用Canvas背景色
   */
  private applyBackgroundColor(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    backgroundColor: ColorValue,
  ): void {
    ctx.save()

    if (typeof backgroundColor === 'string') {
      ctx.fillStyle = backgroundColor
    }
    else {
      // 渐变色
      const gradient = this.createCanvasGradient(ctx, backgroundColor, width, height)
      ctx.fillStyle = gradient
    }

    ctx.fillRect(0, 0, width, height)
    ctx.restore()
  }

  /**
   * 应用Canvas前景样式
   */
  private applyForegroundStyle(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    styleOptions: StyleOptions,
  ): void {
    // 可按需读取像素

    // 应用点样式
    if (styleOptions.dotStyle && styleOptions.dotStyle !== 'square') {
      this.applyDotStyle(ctx, canvas, styleOptions.dotStyle)
    }

    // 应用前景色
    if (styleOptions.foregroundColor) {
      this.applyForegroundColor(ctx, canvas, styleOptions.foregroundColor)
    }
  }

  /**
   * 应用点样式
   */
  private applyDotStyle(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    dotStyle: string,
  ): void {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 分析像素并绘制自定义点
    const dotSize = this.calculateDotSize(canvas.width)

    for (let y = 0; y < canvas.height; y += dotSize) {
      for (let x = 0; x < canvas.width; x += dotSize) {
        const pixelIndex = (y * canvas.width + x) * 4

        // 检查是否为前景像素（黑色）
        if (data[pixelIndex] < 128) {
          this.drawCustomDot(ctx, x, y, dotSize, dotStyle)
        }
      }
    }
  }

  /**
   * 绘制自定义点
   */
  private drawCustomDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    style: string,
  ): void {
    ctx.save()
    ctx.fillStyle = '#000000'

    switch (style) {
      case 'rounded':
        this.drawRoundedDot(ctx, x, y, size)
        break
      case 'dots':
        this.drawCircleDot(ctx, x, y, size)
        break
      case 'classy':
        this.drawClassyDot(ctx, x, y, size)
        break
      default:
        ctx.fillRect(x, y, size, size)
    }

    ctx.restore()
  }

  /**
   * 绘制圆角点
   */
  private drawRoundedDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ): void {
    const radius = size * 0.2

    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + size - radius, y)
    ctx.quadraticCurveTo(x + size, y, x + size, y + radius)
    ctx.lineTo(x + size, y + size - radius)
    ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size)
    ctx.lineTo(x + radius, y + size)
    ctx.quadraticCurveTo(x, y + size, x, y + size - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fill()
  }

  /**
   * 绘制圆形点
   */
  private drawCircleDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ): void {
    const centerX = x + size / 2
    const centerY = y + size / 2
    const radius = size / 2

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  /**
   * 绘制优雅点
   */
  private drawClassyDot(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
  ): void {
    // 绘制带有小间隙的方形
    const gap = size * 0.1
    ctx.fillRect(x + gap, y + gap, size - gap * 2, size - gap * 2)
  }

  /**
   * 应用前景色
   */
  private applyForegroundColor(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    foregroundColor: ColorValue,
  ): void {
    if (typeof foregroundColor === 'string') {
      // 简单颜色替换
      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = foregroundColor
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }
    else {
      // 渐变色
      const gradient = this.createCanvasGradient(ctx, foregroundColor, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-in'
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  /**
   * 创建Canvas渐变
   */
  private createCanvasGradient(
    ctx: CanvasRenderingContext2D,
    gradientOptions: GradientOptions,
    width: number,
    height: number,
  ): CanvasGradient {
    let gradient: CanvasGradient

    if (gradientOptions.type === 'linear') {
      const angle = (gradientOptions.direction || 0) * Math.PI / 180
      const x1 = width / 2 - Math.cos(angle) * width / 2
      const y1 = height / 2 - Math.sin(angle) * height / 2
      const x2 = width / 2 + Math.cos(angle) * width / 2
      const y2 = height / 2 + Math.sin(angle) * height / 2

      gradient = ctx.createLinearGradient(x1, y1, x2, y2)
    }
    else {
      const centerX = gradientOptions.centerX || width / 2
      const centerY = gradientOptions.centerY || height / 2
      const radius = Math.max(width, height) / 2

      gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    }

    // 添加颜色停止点
    gradientOptions.colors.forEach((colorStop) => {
      gradient.addColorStop(colorStop.offset, colorStop.color)
    })

    return gradient
  }

  /**
   * 应用SVG背景色
   */
  private applySVGBackgroundColor(
    svgElement: SVGElement,
    backgroundColor: ColorValue,
  ): void {
    // 获取SVG尺寸，优先使用属性值
    const width = svgElement.getAttribute('width') || '200'
    const height = svgElement.getAttribute('height') || '200'

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')

    background.setAttribute('x', '0')
    background.setAttribute('y', '0')
    background.setAttribute('width', width)
    background.setAttribute('height', height)

    if (typeof backgroundColor === 'string') {
      background.setAttribute('fill', backgroundColor)
    }
    else {
      const gradientId = this.createSVGGradient(svgElement, backgroundColor)
      background.setAttribute('fill', `url(#${gradientId})`)
    }

    // 插入到第一个位置
    svgElement.insertBefore(background, svgElement.firstChild)
  }

  /**
   * 应用SVG前景样式
   */
  private applySVGForegroundStyle(
    svgElement: SVGElement,
    styleOptions: StyleOptions,
  ): void {
    const paths = svgElement.querySelectorAll('path')

    paths.forEach((path) => {
      if (styleOptions.foregroundColor) {
        if (typeof styleOptions.foregroundColor === 'string') {
          path.setAttribute('fill', styleOptions.foregroundColor)
        }
        else {
          const gradientId = this.createSVGGradient(svgElement, styleOptions.foregroundColor)
          path.setAttribute('fill', `url(#${gradientId})`)
        }
      }
    })
  }

  /**
   * 创建SVG渐变
   */
  private createSVGGradient(
    svgElement: SVGElement,
    gradientOptions: GradientOptions,
  ): string {
    const defs = svgElement.querySelector('defs') || document.createElementNS('http://www.w3.org/2000/svg', 'defs')
    if (!svgElement.querySelector('defs')) {
      svgElement.appendChild(defs)
    }

    const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`
    let gradient: SVGElement

    if (gradientOptions.type === 'linear') {
      gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient')
      const angle = gradientOptions.direction || 0
      const x1 = 50 - Math.cos(angle * Math.PI / 180) * 50
      const y1 = 50 - Math.sin(angle * Math.PI / 180) * 50
      const x2 = 50 + Math.cos(angle * Math.PI / 180) * 50
      const y2 = 50 + Math.sin(angle * Math.PI / 180) * 50

      gradient.setAttribute('x1', `${x1}%`)
      gradient.setAttribute('y1', `${y1}%`)
      gradient.setAttribute('x2', `${x2}%`)
      gradient.setAttribute('y2', `${y2}%`)
    }
    else {
      gradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient')
      gradient.setAttribute('cx', `${gradientOptions.centerX || 50}%`)
      gradient.setAttribute('cy', `${gradientOptions.centerY || 50}%`)
      gradient.setAttribute('r', '50%')
    }

    gradient.setAttribute('id', gradientId)

    // 添加颜色停止点
    gradientOptions.colors.forEach((colorStop) => {
      const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop')
      stop.setAttribute('offset', `${colorStop.offset * 100}%`)
      stop.setAttribute('stop-color', colorStop.color)
      gradient.appendChild(stop)
    })

    defs.appendChild(gradient)
    return gradientId
  }

  /**
   * 计算点大小
   */
  private calculateDotSize(canvasSize: number): number {
    // 假设二维码是21x21模块（最小版本）
    return Math.floor(canvasSize / 21)
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    // 清理资源
  }
}
