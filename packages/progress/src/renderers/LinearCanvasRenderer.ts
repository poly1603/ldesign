/**
 * 线性进度条 Canvas 渲染器
 */

import type { ProgressRenderer, LinearProgressOptions } from '../types'

export class LinearCanvasRenderer implements ProgressRenderer {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationFrame: number | null = null
  private effectsEnabled = true
  private stripeOffset = 0
  private wavePhase = 0
  private glowIntensity = 1

  constructor(private container: HTMLElement, private options: Required<LinearProgressOptions>) {
    this.createCanvas()
  }

  /**
   * 创建 Canvas 元素
   */
  private createCanvas(): void {
    // 清空容器
    this.container.innerHTML = ''

    // 创建 Canvas
    this.canvas = document.createElement('canvas')
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
    this.canvas.style.display = 'block'

    // 设置高 DPI 支持
    const dpr = window.devicePixelRatio || 1
    const rect = this.container.getBoundingClientRect()
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr

    // 获取上下文
    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }
    this.ctx = ctx
    this.ctx.scale(dpr, dpr)

    this.container.appendChild(this.canvas)

    // 启动特效动画
    if (this.options.stripe?.animated || this.options.wave?.enabled || this.options.glow?.pulse) {
      this.startEffectsAnimation()
    }
  }

  /**
   * 渲染进度条
   */
  public render(progress: number): void {
    const rect = this.container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const isVertical = this.options.orientation === 'vertical'

    // 清空画布
    this.ctx.clearRect(0, 0, width, height)

    // 保存状态
    this.ctx.save()

    // 绘制背景
    this.drawBackground(width, height)

    // 绘制缓冲区（如果启用）
    if (this.options.buffer?.showBuffer) {
      this.drawBuffer(width, height, this.options.buffer.buffer || 0)
    }

    // 绘制进度
    this.drawProgress(width, height, progress)

    // 绘制分段（如果启用）
    if (this.options.segments?.enabled && this.options.segments.count > 1) {
      this.drawSegments(width, height)
    }

    // 绘制文本（如果启用）
    if (this.options.text?.enabled) {
      this.drawText(width, height, progress)
    }

    // 恢复状态
    this.ctx.restore()
  }

  /**
   * 绘制背景
   */
  private drawBackground(width: number, height: number): void {
    this.ctx.fillStyle = this.options.backgroundColor as string || '#f0f0f0'

    if (this.options.rounded) {
      this.drawRoundRect(0, 0, width, height, height / 2)
      this.ctx.fill()
    } else {
      this.ctx.fillRect(0, 0, width, height)
    }
  }

  /**
   * 绘制缓冲区
   */
  private drawBuffer(width: number, height: number, buffer: number): void {
    const isVertical = this.options.orientation === 'vertical'
    const bufferSize = Math.min(1, Math.max(0, buffer))

    this.ctx.fillStyle = this.options.buffer?.bufferColor || 'rgba(0,0,0,0.1)'

    if (isVertical) {
      const bufferHeight = height * bufferSize
      if (this.options.rounded) {
        this.drawRoundRect(0, height - bufferHeight, width, bufferHeight, width / 2)
        this.ctx.fill()
      } else {
        this.ctx.fillRect(0, height - bufferHeight, width, bufferHeight)
      }
    } else {
      const bufferWidth = width * bufferSize
      if (this.options.rounded) {
        this.drawRoundRect(0, 0, bufferWidth, height, height / 2)
        this.ctx.fill()
      } else {
        this.ctx.fillRect(0, 0, bufferWidth, height)
      }
    }
  }

  /**
   * 绘制进度
   */
  private drawProgress(width: number, height: number, progress: number): void {
    const isVertical = this.options.orientation === 'vertical'
    const progressSize = Math.min(1, Math.max(0, progress))

    // 设置进度颜色
    this.ctx.fillStyle = this.options.progressColor as string || '#165DFF'

    // 应用发光效果
    if (this.options.glow?.enabled && this.effectsEnabled) {
      this.ctx.shadowColor = this.options.glow.color || this.options.progressColor as string
      this.ctx.shadowBlur = (this.options.glow.blur || 8) * this.glowIntensity
    }

    // 绘制进度条
    if (isVertical) {
      const progressHeight = height * progressSize
      if (this.options.rounded) {
        this.drawRoundRect(0, height - progressHeight, width, progressHeight, width / 2)
        this.ctx.fill()
      } else {
        this.ctx.fillRect(0, height - progressHeight, width, progressHeight)
      }
    } else {
      const progressWidth = width * progressSize
      if (this.options.rounded) {
        this.drawRoundRect(0, 0, progressWidth, height, height / 2)
        this.ctx.fill()
      } else {
        this.ctx.fillRect(0, 0, progressWidth, height)
      }
    }

    // 清除阴影
    this.ctx.shadowColor = 'transparent'
    this.ctx.shadowBlur = 0

    // 绘制条纹效果
    if (this.options.stripe?.enabled && this.effectsEnabled) {
      this.drawStripes(width, height, progressSize)
    }

    // 绘制波浪效果
    if (this.options.wave?.enabled && this.effectsEnabled) {
      this.drawWave(width, height, progressSize)
    }
  }

  /**
   * 绘制条纹
   */
  private drawStripes(width: number, height: number, progress: number): void {
    const isVertical = this.options.orientation === 'vertical'
    const stripeWidth = this.options.stripe?.width || 10
    const stripeGap = this.options.stripe?.gap || 10
    const stripeAngle = this.options.stripe?.angle || 45

    this.ctx.save()

    // 设置裁剪区域
    if (isVertical) {
      const progressHeight = height * progress
      if (this.options.rounded) {
        this.drawRoundRect(0, height - progressHeight, width, progressHeight, width / 2)
        this.ctx.clip()
      } else {
        this.ctx.rect(0, height - progressHeight, width, progressHeight)
        this.ctx.clip()
      }
    } else {
      const progressWidth = width * progress
      if (this.options.rounded) {
        this.drawRoundRect(0, 0, progressWidth, height, height / 2)
        this.ctx.clip()
      } else {
        this.ctx.rect(0, 0, progressWidth, height)
        this.ctx.clip()
      }
    }

    // 绘制条纹
    this.ctx.fillStyle = this.options.stripe?.color || 'rgba(255,255,255,0.2)'
    const totalStripes = Math.ceil((width + height) / (stripeWidth + stripeGap)) * 2

    for (let i = 0; i < totalStripes; i++) {
      const x = i * (stripeWidth + stripeGap) - height + this.stripeOffset
      this.ctx.save()
      this.ctx.translate(x, 0)
      this.ctx.rotate((stripeAngle * Math.PI) / 180)
      this.ctx.fillRect(-height * 2, -height * 2, stripeWidth, height * 4)
      this.ctx.restore()
    }

    this.ctx.restore()
  }

  /**
   * 绘制波浪
   */
  private drawWave(width: number, height: number, progress: number): void {
    const isVertical = this.options.orientation === 'vertical'
    const amplitude = this.options.wave?.amplitude || 5
    const frequency = this.options.wave?.frequency || 1

    this.ctx.save()
    this.ctx.strokeStyle = this.options.wave?.color || 'rgba(255,255,255,0.3)'
    this.ctx.lineWidth = 2

    this.ctx.beginPath()
    if (isVertical) {
      const progressHeight = height * progress
      const y = height - progressHeight
      for (let x = 0; x <= width; x++) {
        const waveY = y + Math.sin((x * frequency * Math.PI) / 50 + this.wavePhase) * amplitude
        if (x === 0) {
          this.ctx.moveTo(x, waveY)
        } else {
          this.ctx.lineTo(x, waveY)
        }
      }
    } else {
      const progressWidth = width * progress
      for (let y = 0; y <= height; y++) {
        const waveX = progressWidth + Math.sin((y * frequency * Math.PI) / 20 + this.wavePhase) * amplitude
        if (y === 0) {
          this.ctx.moveTo(waveX, y)
        } else {
          this.ctx.lineTo(waveX, y)
        }
      }
    }
    this.ctx.stroke()
    this.ctx.restore()
  }

  /**
   * 绘制分段
   */
  private drawSegments(width: number, height: number): void {
    const segmentCount = this.options.segments?.count || 1
    const gap = this.options.segments?.gap || 2
    const isVertical = this.options.orientation === 'vertical'

    this.ctx.fillStyle = this.options.backgroundColor as string || '#f0f0f0'

    for (let i = 1; i < segmentCount; i++) {
      const position = (i / segmentCount)
      if (isVertical) {
        const y = height * position - gap / 2
        this.ctx.fillRect(0, y, width, gap)
      } else {
        const x = width * position - gap / 2
        this.ctx.fillRect(x, 0, gap, height)
      }
    }
  }

  /**
   * 绘制文本
   */
  private drawText(width: number, height: number, progress: number): void {
    this.ctx.save()
    this.ctx.font = `${this.options.text.fontSize || 14}px ${this.options.text.fontFamily || 'Arial'}`
    this.ctx.fillStyle = this.options.text.color || '#333'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    let text = `${Math.round(progress * 100)}%`
    if (this.options.text.format) {
      const value = this.options.min + (this.options.max - this.options.min) * progress
      text = this.options.text.format(value, this.options.max)
    }

    this.ctx.fillText(text, width / 2, height / 2)
    this.ctx.restore()
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundRect(x: number, y: number, width: number, height: number, radius: number): void {
    this.ctx.beginPath()
    this.ctx.moveTo(x + radius, y)
    this.ctx.lineTo(x + width - radius, y)
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    this.ctx.lineTo(x + width, y + height - radius)
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    this.ctx.lineTo(x + radius, y + height)
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    this.ctx.lineTo(x, y + radius)
    this.ctx.quadraticCurveTo(x, y, x + radius, y)
    this.ctx.closePath()
  }

  /**
   * 启动特效动画
   */
  private startEffectsAnimation(): void {
    const animate = () => {
      if (!this.effectsEnabled) return

      // 更新条纹偏移
      if (this.options.stripe?.animated) {
        this.stripeOffset += this.options.stripe?.animationSpeed || 1
        if (this.stripeOffset > (this.options.stripe?.width || 10) + (this.options.stripe?.gap || 10)) {
          this.stripeOffset = 0
        }
      }

      // 更新波浪相位
      if (this.options.wave?.enabled) {
        this.wavePhase += (this.options.wave?.speed || 1) * 0.1
      }

      // 更新发光强度
      if (this.options.glow?.pulse) {
        this.glowIntensity = 0.5 + Math.sin(Date.now() * 0.001 * (this.options.glow?.pulseSpeed || 1)) * 0.5
      }

      // 重新渲染
      const progress = this.getProgressFromDOM()
      if (progress !== null) {
        this.render(progress)
      }

      this.animationFrame = requestAnimationFrame(animate)
    }

    animate()
  }

  /**
   * 从 DOM 获取当前进度
   */
  private getProgressFromDOM(): number | null {
    const ariaNow = this.container.parentElement?.getAttribute('aria-valuenow')
    const ariaMin = this.container.parentElement?.getAttribute('aria-valuemin')
    const ariaMax = this.container.parentElement?.getAttribute('aria-valuemax')

    if (ariaNow && ariaMin && ariaMax) {
      const value = parseFloat(ariaNow)
      const min = parseFloat(ariaMin)
      const max = parseFloat(ariaMax)
      return (value - min) / (max - min)
    }

    return null
  }

  /**
   * 调整大小
   */
  public resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = width * dpr
    this.canvas.height = height * dpr
    this.ctx.scale(dpr, dpr)
  }

  /**
   * 设置特效启用状态
   */
  public setEffectsEnabled(enabled: boolean): void {
    this.effectsEnabled = enabled
    if (!enabled && this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    } else if (enabled && !this.animationFrame) {
      this.startEffectsAnimation()
    }
  }

  /**
   * 销毁
   */
  public destroy(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.parentElement.removeChild(this.canvas)
    }
  }
}
