// 简化版导出，仅用于 demo 运行
export type StatusType = 'normal' | 'success' | 'warning' | 'error' | 'loading'

export interface TextOptions {
  enabled?: boolean
  format?: (value: number, max: number) => string
}

export interface AnimationOptions {
  duration?: number
  easing?: string
}

export interface BufferOptions {
  showBuffer?: boolean
  buffer?: number
  bufferColor?: string
}

export interface SegmentOptions {
  enabled?: boolean
  count?: number
  gap?: number
}

export interface BaseOptions {
  container: string | HTMLElement
  renderType?: 'svg' | 'canvas'
  value?: number
  min?: number
  max?: number
  height?: number
  progressColor?: string
  backgroundColor?: string
  rounded?: boolean
  text?: TextOptions
  animation?: AnimationOptions
  status?: StatusType
}

export interface CircularOptions extends BaseOptions {
  radius?: number
  strokeWidth?: number
  segments?: SegmentOptions
  clockwise?: boolean
  startAngle?: number
  multiRing?: {
    enabled?: boolean
    rings?: Array<{
      value: number
      color?: string
      radius?: number
    }>
  }
}

export interface SemicircleOptions extends BaseOptions {
  radius?: number
  strokeWidth?: number
  direction?: 'top' | 'bottom' | 'left' | 'right'
  segments?: SegmentOptions
}

export interface EffectOptions {
  stripe?: {
    enabled?: boolean
    width?: number
    gap?: number
    angle?: number
    animated?: boolean
  }
  wave?: {
    enabled?: boolean
    amplitude?: number
    frequency?: number
    animated?: boolean
  }
  glow?: {
    enabled?: boolean
    color?: string
    size?: number
    animated?: boolean
  }
  gradient?: {
    enabled?: boolean
    colors?: string[]
    angle?: number
  }
  pulse?: {
    enabled?: boolean
    duration?: number
    scale?: number
  }
}

export interface LinearOptions extends BaseOptions {
  segments?: SegmentOptions
  buffer?: BufferOptions
  indeterminate?: boolean
  effects?: EffectOptions
}

function getEl(target: string | HTMLElement): HTMLElement {
  if (typeof target === 'string') {
    const el = document.querySelector(target)
    if (!el) throw new Error(`Container ${target} not found`)
    return el as HTMLElement
  }
  return target
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

// 文本格式化器集合
export const TextFormatters = {
  // 百分比格式化
  percentage: (value: number, max: number = 100): string => {
    const percent = (value / max) * 100
    return `${Math.round(percent)}%`
  },

  // 带小数的百分比
  percentageDecimal: (decimals: number = 1) => (value: number, max: number = 100): string => {
    const percent = (value / max) * 100
    return `${percent.toFixed(decimals)}%`
  },

  // 分数格式
  fraction: (value: number, max: number): string => {
    return `${Math.round(value)}/${Math.round(max)}`
  },

  // 步骤格式
  steps: (totalSteps: number) => (value: number, max: number): string => {
    const currentStep = Math.ceil((value / max) * totalSteps)
    return `Step ${currentStep} of ${totalSteps}`
  },

  // 文件大小格式化
  fileSize: (value: number, max: number): string => {
    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B'
      const k = 1024
      const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`
    }
    return `${formatBytes(value)} / ${formatBytes(max)}`
  },

  // 时间格式化（秒）
  time: (value: number, max: number): string => {
    const formatTime = (seconds: number): string => {
      const hrs = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)

      if (hrs > 0) {
        return `${hrs}h ${mins}m ${secs}s`
      } else if (mins > 0) {
        return `${mins}m ${secs}s`
      } else {
        return `${secs}s`
      }
    }
    return formatTime(value)
  },

  // 剩余时间
  remaining: (speed: number = 1) => (value: number, max: number): string => {
    const remaining = max - value
    const seconds = remaining / speed
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)

    if (mins > 0) {
      return `${mins}:${String(secs).padStart(2, '0')} remaining`
    } else {
      return `${secs}s remaining`
    }
  },

  // 速度格式化
  speed: (unit: string = 'MB/s') => (value: number, max: number): string => {
    const speed = value / 10 // 假设10秒内的进度
    return `${speed.toFixed(1)} ${unit}`
  },

  // 自定义格式
  custom: (template: string) => (value: number, max: number): string => {
    const percent = (value / max) * 100
    return template
      .replace('{value}', String(Math.round(value)))
      .replace('{max}', String(Math.round(max)))
      .replace('{percent}', String(Math.round(percent)))
      .replace('{percent.1}', percent.toFixed(1))
      .replace('{percent.2}', percent.toFixed(2))
  },

  // 评级格式
  rating: (maxStars: number = 5) => (value: number, max: number): string => {
    const stars = Math.round((value / max) * maxStars)
    const filled = '★'.repeat(stars)
    const empty = '☆'.repeat(maxStars - stars)
    return filled + empty
  },

  // 等级格式
  level: (levels: string[]) => (value: number, max: number): string => {
    const index = Math.floor((value / max) * (levels.length - 1))
    return levels[Math.min(index, levels.length - 1)]
  },

  // 温度格式
  temperature: (unit: 'C' | 'F' = 'C') => (value: number, max: number): string => {
    return `${Math.round(value)}°${unit}`
  },

  // 货币格式
  currency: (symbol: string = '$', decimals: number = 2) => (value: number, max: number): string => {
    return `${symbol}${value.toFixed(decimals)}`
  },

  // 完成状态
  completion: (value: number, max: number): string => {
    const percent = (value / max) * 100
    if (percent >= 100) return '✓ Complete'
    if (percent >= 75) return 'Almost done'
    if (percent >= 50) return 'Halfway there'
    if (percent >= 25) return 'Getting started'
    return 'Just begun'
  },

  // 表情符号
  emoji: (value: number, max: number): string => {
    const percent = (value / max) * 100
    if (percent >= 100) return '🎉'
    if (percent >= 80) return '😊'
    if (percent >= 60) return '🙂'
    if (percent >= 40) return '😐'
    if (percent >= 20) return '😕'
    return '😔'
  },

  // 加载提示
  loading: (messages: string[]) => (value: number, max: number): string => {
    const index = Math.floor((value / max) * messages.length)
    return messages[Math.min(index, messages.length - 1)]
  },

  // 无文本
  none: (): string => ''
}

export class LinearProgress {
  private container: HTMLElement
  private wrapper: HTMLElement
  private bar: HTMLElement
  private bufferBar?: HTMLElement
  private effectLayer?: HTMLElement
  private value: number
  private min: number
  private max: number
  private options: LinearOptions

  constructor(options: LinearOptions) {
    this.options = options
    this.container = getEl(options.container)
    this.value = options.value ?? 0
    this.min = options.min ?? 0
    this.max = options.max ?? 100

    // wrapper
    this.wrapper = document.createElement('div')
    this.wrapper.style.cssText = `position:relative;width:100%;height:${options.height ?? 12}px;background:${options.backgroundColor ?? '#f0f0f0'};border-radius:${options.rounded ? '999px' : '0'};overflow:hidden;`

    // buffer
    if (options.buffer?.showBuffer) {
      this.bufferBar = document.createElement('div')
      this.bufferBar.style.cssText = `position:absolute;left:0;top:0;bottom:0;background:${options.buffer.bufferColor ?? 'rgba(0,0,0,0.1)'};`
      this.wrapper.appendChild(this.bufferBar)
      this.setBuffer(options.buffer.buffer ?? 0)
    }

    // bar
    this.bar = document.createElement('div')
    this.bar.style.cssText = `position:absolute;left:0;top:0;bottom:0;background:${options.progressColor ?? '#165DFF'};transition:width 0.3s ease;border-radius:${options.rounded ? '999px' : '0'};`

    // 应用视觉效果
    this.applyEffects()

    this.wrapper.appendChild(this.bar)

    this.container.innerHTML = ''
    this.container.appendChild(this.wrapper)

    this.render()
  }

  private percent(): number {
    const p = (this.value - this.min) / (this.max - this.min)
    return clamp(p, 0, 1)
  }

  private render() {
    const p = this.percent() * 100
    this.bar.style.width = `${p}%`

    if (this.options.text?.enabled) {
      this.wrapper.setAttribute('aria-valuemin', String(this.min))
      this.wrapper.setAttribute('aria-valuemax', String(this.max))
      this.wrapper.setAttribute('aria-valuenow', String(this.value))
      if (!this.bar.dataset.labelMounted) {
        const label = document.createElement('div')
        label.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#333;font-size:12px;pointer-events:none;'
        label.className = 'lp-text'
        this.wrapper.appendChild(label)
        this.bar.dataset.labelMounted = '1'
      }
      const labelEl = this.wrapper.querySelector('.lp-text') as HTMLElement
      const text = this.options.text.format ? this.options.text.format(this.value, this.max) : `${Math.round(p)}%`
      labelEl.textContent = text
    }
  }

  public setValue(value: number, animate = true) {
    this.value = clamp(value, this.min, this.max)
    this.bar.style.transition = animate ? 'width 0.3s ease' : 'none'
    this.render()
  }

  public setProgress(progress: number, animate = true) {
    const v = this.min + clamp(progress, 0, 1) * (this.max - this.min)
    this.setValue(v, animate)
  }

  public setBuffer(buffer: number) {
    if (!this.bufferBar) return
    const bw = clamp(buffer, 0, 1) * 100
    this.bufferBar.style.width = `${bw}%`
  }

  private applyEffects() {
    const effects = this.options.effects
    if (!effects) return

    // 渐变效果
    if (effects.gradient?.enabled) {
      const colors = effects.gradient.colors ?? ['#667eea', '#764ba2']
      const angle = effects.gradient.angle ?? 90
      this.bar.style.background = `linear-gradient(${angle}deg, ${colors.join(', ')})`
    }

    // 条纹效果
    if (effects.stripe?.enabled) {
      const width = effects.stripe.width ?? 20
      const angle = effects.stripe.angle ?? 45
      const stripeGradient = `repeating-linear-gradient(
        ${angle}deg,
        transparent,
        transparent ${width / 2}px,
        rgba(255,255,255,0.1) ${width / 2}px,
        rgba(255,255,255,0.1) ${width}px
      )`

      // 创建条纹层
      const stripeLayer = document.createElement('div')
      stripeLayer.style.cssText = `position:absolute;inset:0;background:${stripeGradient};border-radius:inherit;pointer-events:none;`

      if (effects.stripe.animated) {
        stripeLayer.style.backgroundSize = `${width * 2}px ${width * 2}px`
        stripeLayer.style.animation = 'stripe-move 1s linear infinite'

        // 添加动画样式
        if (!document.querySelector('#stripe-animation')) {
          const style = document.createElement('style')
          style.id = 'stripe-animation'
          style.textContent = `
            @keyframes stripe-move {
              0% { background-position: 0 0; }
              100% { background-position: ${width * 2}px 0; }
            }
          `
          document.head.appendChild(style)
        }
      }

      this.bar.appendChild(stripeLayer)
    }

    // 发光效果
    if (effects.glow?.enabled) {
      const color = effects.glow.color ?? this.options.progressColor ?? '#165DFF'
      const size = effects.glow.size ?? 10
      this.bar.style.boxShadow = `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}40`

      if (effects.glow.animated) {
        this.bar.style.animation = 'glow-pulse 2s ease-in-out infinite'

        if (!document.querySelector('#glow-animation')) {
          const style = document.createElement('style')
          style.id = 'glow-animation'
          style.textContent = `
            @keyframes glow-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.8; }
            }
          `
          document.head.appendChild(style)
        }
      }
    }

    // 波浪效果
    if (effects.wave?.enabled) {
      const amplitude = effects.wave.amplitude ?? 5
      const frequency = effects.wave.frequency ?? 2

      const waveLayer = document.createElement('div')
      waveLayer.style.cssText = `position:absolute;inset:0;overflow:hidden;border-radius:inherit;`

      const waveSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      waveSvg.style.cssText = 'position:absolute;width:200%;height:100%;left:0;top:0;'

      const wave = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      const waveHeight = this.options.height ?? 12
      const wavePath = this.generateWavePath(200, waveHeight, amplitude, frequency)
      wave.setAttribute('d', wavePath)
      wave.setAttribute('fill', 'rgba(255,255,255,0.3)')

      if (effects.wave.animated) {
        wave.style.animation = 'wave-move 3s linear infinite'

        if (!document.querySelector('#wave-animation')) {
          const style = document.createElement('style')
          style.id = 'wave-animation'
          style.textContent = `
            @keyframes wave-move {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `
          document.head.appendChild(style)
        }
      }

      waveSvg.appendChild(wave)
      waveLayer.appendChild(waveSvg)
      this.bar.appendChild(waveLayer)
    }

    // 脉冲效果
    if (effects.pulse?.enabled) {
      const duration = effects.pulse.duration ?? 1500
      const scale = effects.pulse.scale ?? 1.05

      this.bar.style.animation = `pulse ${duration}ms ease-in-out infinite`

      if (!document.querySelector('#pulse-animation')) {
        const style = document.createElement('style')
        style.id = 'pulse-animation'
        style.textContent = `
          @keyframes pulse {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(${scale}); }
          }
        `
        document.head.appendChild(style)
      }
    }
  }

  private generateWavePath(width: number, height: number, amplitude: number, frequency: number): string {
    const points: string[] = []
    const step = 1

    for (let x = 0; x <= width; x += step) {
      const y = height / 2 + amplitude * Math.sin((x / width) * Math.PI * 2 * frequency)
      points.push(`${x},${y}`)
    }

    return `M0,${height} L${points.join(' L')} L${width},${height} Z`
  }
}

export class CircularProgress {
  private container: HTMLElement
  private svg: SVGSVGElement
  private bg: SVGCircleElement
  private ring: SVGCircleElement
  private textElement?: SVGTextElement
  private segments: SVGCircleElement[] = []
  private value: number
  private min: number
  private max: number
  private radius: number
  private circumference: number
  private status: StatusType = 'normal'
  private options: CircularOptions
  private animationId?: number

  constructor(options: CircularOptions) {
    this.options = {
      ...options,
      animation: {
        duration: 300,
        easing: 'ease-in-out',
        ...options.animation
      }
    }
    this.container = getEl(options.container)
    this.value = options.value ?? 0
    this.min = options.min ?? 0
    this.max = options.max ?? 100
    this.radius = options.radius ?? 60
    this.status = options.status ?? 'normal'

    const strokeWidth = options.strokeWidth ?? 8
    const size = this.radius * 2 + strokeWidth * 2
    this.circumference = 2 * Math.PI * this.radius

    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('width', String(size))
    this.svg.setAttribute('height', String(size))
    this.svg.setAttribute('viewBox', `0 0 ${size} ${size}`)
    this.svg.style.display = 'block'

    const center = size / 2
    const startAngle = options.startAngle ?? -90
    const clockwise = options.clockwise ?? true

    // 创建背景圆环
    this.bg = this.createCircle(center, this.radius, strokeWidth, options.backgroundColor ?? '#f0f0f0')
    this.svg.appendChild(this.bg)

    // 如果启用分段，创建分段效果
    if (options.segments?.enabled) {
      this.createSegments(center, strokeWidth, options.segments)
    }

    // 创建主进度圆环
    this.ring = this.createProgressRing(center, this.radius, strokeWidth, this.getProgressColor())
    this.ring.style.transform = `rotate(${startAngle}deg)`
    this.ring.style.transformOrigin = 'center'
    this.ring.style.transition = `stroke-dashoffset ${this.options.animation?.duration}ms ${this.options.animation?.easing}`

    if (!clockwise) {
      this.ring.style.transform += ' scaleY(-1)'
    }

    this.svg.appendChild(this.ring)

    // 如果启用文本，创建文本元素
    if (options.text?.enabled !== false) {
      this.createTextElement(center)
    }

    // 如果启用多环，创建多环效果
    if (options.multiRing?.enabled && options.multiRing.rings) {
      this.createMultiRings(center, strokeWidth, options.multiRing.rings)
    }

    this.container.innerHTML = ''
    this.container.appendChild(this.svg)

    this.render(false)
  }

  private percent(): number {
    const p = (this.value - this.min) / (this.max - this.min)
    return clamp(p, 0, 1)
  }

  private createCircle(center: number, radius: number, strokeWidth: number, color: string): SVGCircleElement {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', String(center))
    circle.setAttribute('cy', String(center))
    circle.setAttribute('r', String(radius))
    circle.setAttribute('fill', 'none')
    circle.setAttribute('stroke', color)
    circle.setAttribute('stroke-width', String(strokeWidth))
    return circle
  }

  private createProgressRing(center: number, radius: number, strokeWidth: number, color: string): SVGCircleElement {
    const ring = this.createCircle(center, radius, strokeWidth, color)
    ring.setAttribute('stroke-linecap', 'round')
    ring.setAttribute('stroke-dasharray', String(this.circumference))
    ring.setAttribute('stroke-dashoffset', String(this.circumference))
    return ring
  }

  private createSegments(center: number, strokeWidth: number, options: SegmentOptions) {
    const count = options.count ?? 10
    const gap = options.gap ?? 2
    const segmentLength = (this.circumference - gap * count) / count
    const dashArray = `${segmentLength} ${gap}`

    // 创建分段背景
    const segmentBg = this.createCircle(center, this.radius, strokeWidth, 'transparent')
    segmentBg.setAttribute('stroke', this.options.backgroundColor ?? '#f0f0f0')
    segmentBg.setAttribute('stroke-dasharray', dashArray)
    segmentBg.style.transform = `rotate(${this.options.startAngle ?? -90}deg)`
    segmentBg.style.transformOrigin = 'center'
    this.svg.appendChild(segmentBg)

    // 为主进度环也应用分段
    this.segments.push(segmentBg)
  }

  private createTextElement(center: number) {
    this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    this.textElement.setAttribute('x', String(center))
    this.textElement.setAttribute('y', String(center))
    this.textElement.setAttribute('text-anchor', 'middle')
    this.textElement.setAttribute('dominant-baseline', 'middle')
    this.textElement.setAttribute('fill', '#333')
    this.textElement.style.fontSize = '16px'
    this.textElement.style.fontWeight = 'bold'
    this.svg.appendChild(this.textElement)
  }

  private createMultiRings(center: number, strokeWidth: number, rings: Array<{ value: number; color?: string; radius?: number }>) {
    rings.forEach((ring, index) => {
      const ringRadius = ring.radius ?? (this.radius - (index + 1) * (strokeWidth + 4))
      const ringCircumference = 2 * Math.PI * ringRadius
      const ringProgress = clamp(ring.value, 0, 100) / 100
      const ringOffset = ringCircumference * (1 - ringProgress)

      const ringElement = this.createProgressRing(center, ringRadius, strokeWidth * 0.6, ring.color ?? this.getProgressColor())
      ringElement.setAttribute('stroke-dasharray', String(ringCircumference))
      ringElement.setAttribute('stroke-dashoffset', String(ringOffset))
      ringElement.style.transform = `rotate(${this.options.startAngle ?? -90}deg)`
      ringElement.style.transformOrigin = 'center'
      ringElement.style.transition = `stroke-dashoffset ${this.options.animation?.duration}ms ${this.options.animation?.easing}`

      this.svg.appendChild(ringElement)
    })
  }

  private getProgressColor(): string {
    const statusColors: Record<StatusType, string> = {
      normal: this.options.progressColor ?? '#165DFF',
      success: '#00b42a',
      warning: '#ff7d00',
      error: '#f53f3f',
      loading: '#165DFF'
    }
    return statusColors[this.status] || statusColors.normal
  }

  private render(animate = true) {
    const p = this.percent()
    const offset = this.circumference * (1 - p)

    // 更新进度环颜色
    this.ring.setAttribute('stroke', this.getProgressColor())

    // 应用分段效果
    if (this.options.segments?.enabled) {
      const count = this.options.segments.count ?? 10
      const gap = this.options.segments.gap ?? 2
      const segmentLength = (this.circumference - gap * count) / count
      const dashArray = `${segmentLength} ${gap}`
      this.ring.setAttribute('stroke-dasharray', dashArray)
      this.ring.setAttribute('stroke-dashoffset', String(offset))
    } else {
      this.ring.setAttribute('stroke-dasharray', String(this.circumference))
      this.ring.setAttribute('stroke-dashoffset', String(offset))
    }

    // 动画控制
    if (!animate) {
      this.ring.style.transition = 'none'
      // 强制重绘
      void this.ring.offsetHeight
      this.ring.style.transition = `stroke-dashoffset ${this.options.animation?.duration}ms ${this.options.animation?.easing}`
    }

    // 更新文本
    if (this.textElement) {
      const text = this.options.text?.format
        ? this.options.text.format(this.value, this.max)
        : `${Math.round(p * 100)}%`
      this.textElement.textContent = text
    }
  }

  public setValue(value: number, animate = true) {
    const oldValue = this.value
    this.value = clamp(value, this.min, this.max)

    if (animate && this.options.animation?.duration && oldValue !== this.value) {
      this.animateValue(oldValue, this.value)
    } else {
      this.render(!animate)
    }
  }

  public setProgress(progress: number, animate = true) {
    const v = this.min + clamp(progress, 0, 1) * (this.max - this.min)
    this.setValue(v, animate)
  }

  public setStatus(status: StatusType) {
    this.status = status
    this.render(true)
  }

  private animateValue(from: number, to: number) {
    const duration = this.options.animation?.duration ?? 300
    const startTime = performance.now()

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeProgress = this.easeInOut(progress)
      const currentValue = from + (to - from) * easeProgress

      // 同时更新数值和渲染，确保文本和进度条同步动画
      this.value = currentValue
      this.renderAnimated(easeProgress, from, to)

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      }
    }

    this.animationId = requestAnimationFrame(animate)
  }

  private renderAnimated(progress: number, fromValue: number, toValue: number) {
    // 计算当前进度百分比
    const currentValue = fromValue + (toValue - fromValue) * progress
    const p = (currentValue - this.min) / (this.max - this.min)
    const clampedP = clamp(p, 0, 1)
    const offset = this.circumference * (1 - clampedP)

    // 更新进度环颜色
    this.ring.setAttribute('stroke', this.getProgressColor())

    // 应用分段效果
    if (this.options.segments?.enabled) {
      const count = this.options.segments.count ?? 10
      const gap = this.options.segments.gap ?? 2
      const segmentLength = (this.circumference - gap * count) / count
      const dashArray = `${segmentLength} ${gap}`
      this.ring.setAttribute('stroke-dasharray', dashArray)
      this.ring.setAttribute('stroke-dashoffset', String(offset))
    } else {
      this.ring.setAttribute('stroke-dasharray', String(this.circumference))
      this.ring.setAttribute('stroke-dashoffset', String(offset))
    }

    // 同步更新文本，确保文本也参与动画
    if (this.textElement) {
      const text = this.options.text?.format
        ? this.options.text.format(currentValue, this.max)
        : `${Math.round(clampedP * 100)}%`
      this.textElement.textContent = text
    }
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }
}

// 半圆形进度条
export class SemicircleProgress {
  private container: HTMLElement
  private svg: SVGSVGElement
  private bg: SVGPathElement
  private path: SVGPathElement
  private textElement?: SVGTextElement
  private value: number
  private min: number
  private max: number
  private radius: number
  private options: SemicircleOptions
  private pathLength: number
  private animationId?: number

  constructor(options: SemicircleOptions) {
    this.options = {
      ...options,
      animation: {
        duration: 300,
        easing: 'ease-in-out',
        ...options.animation
      }
    }
    this.container = getEl(options.container)
    this.value = options.value ?? 0
    this.min = options.min ?? 0
    this.max = options.max ?? 100
    this.radius = options.radius ?? 80

    const strokeWidth = options.strokeWidth ?? 10
    const direction = options.direction ?? 'bottom'

    // 根据方向计算SVG尺寸
    let width, height, viewBox
    if (direction === 'top' || direction === 'bottom') {
      width = this.radius * 2 + strokeWidth * 2
      height = this.radius + strokeWidth * 2
      viewBox = `0 0 ${width} ${height}`
    } else {
      width = this.radius + strokeWidth * 2
      height = this.radius * 2 + strokeWidth * 2
      viewBox = `0 0 ${width} ${height}`
    }

    // 计算路径长度（半圆）
    this.pathLength = Math.PI * this.radius

    // 创建SVG
    this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    this.svg.setAttribute('width', String(width))
    this.svg.setAttribute('height', String(height))
    this.svg.setAttribute('viewBox', viewBox)
    this.svg.style.display = 'block'

    // 创建半圆路径
    const d = this.createSemicirclePath(direction, strokeWidth)

    // 背景路径
    this.bg = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.bg.setAttribute('d', d)
    this.bg.setAttribute('fill', 'none')
    this.bg.setAttribute('stroke', options.backgroundColor ?? '#f0f0f0')
    this.bg.setAttribute('stroke-width', String(strokeWidth))

    // 进度路径
    this.path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    this.path.setAttribute('d', d)
    this.path.setAttribute('fill', 'none')
    this.path.setAttribute('stroke', options.progressColor ?? '#165DFF')
    this.path.setAttribute('stroke-width', String(strokeWidth))
    this.path.setAttribute('stroke-linecap', 'round')
    this.path.setAttribute('stroke-dasharray', String(this.pathLength))
    this.path.setAttribute('stroke-dashoffset', String(this.pathLength))
    this.path.style.transition = `stroke-dashoffset ${this.options.animation?.duration}ms ${this.options.animation?.easing}`

    // 应用分段效果
    if (options.segments?.enabled) {
      const count = options.segments.count ?? 10
      const gap = options.segments.gap ?? 2
      const segmentLength = (this.pathLength - gap * count) / count
      const dashArray = `${segmentLength} ${gap}`
      this.path.setAttribute('stroke-dasharray', dashArray)
    }

    this.svg.appendChild(this.bg)
    this.svg.appendChild(this.path)

    // 创建文本元素
    if (options.text?.enabled !== false) {
      this.createTextElement(direction, strokeWidth)
    }

    this.container.innerHTML = ''
    this.container.appendChild(this.svg)

    this.render(false)
  }

  private createSemicirclePath(direction: string, strokeWidth: number): string {
    const r = this.radius
    const offset = strokeWidth + 2

    switch (direction) {
      case 'top':
        return `M ${offset} ${r + offset} A ${r} ${r} 0 0 1 ${r * 2 + offset} ${r + offset}`
      case 'bottom':
        return `M ${offset} ${offset} A ${r} ${r} 0 0 0 ${r * 2 + offset} ${offset}`
      case 'left':
        return `M ${r + offset} ${offset} A ${r} ${r} 0 0 0 ${r + offset} ${r * 2 + offset}`
      case 'right':
        return `M ${offset} ${offset} A ${r} ${r} 0 0 1 ${offset} ${r * 2 + offset}`
      default:
        return `M ${offset} ${offset} A ${r} ${r} 0 0 0 ${r * 2 + offset} ${offset}`
    }
  }

  private createTextElement(direction: string, strokeWidth: number) {
    const offset = strokeWidth + 2
    let x, y

    if (direction === 'top' || direction === 'bottom') {
      x = this.radius + offset
      y = direction === 'top' ? this.radius + offset - 20 : offset + 20
    } else {
      x = direction === 'left' ? this.radius + offset - 20 : offset + 20
      y = this.radius + offset
    }

    this.textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text')
    this.textElement.setAttribute('x', String(x))
    this.textElement.setAttribute('y', String(y))
    this.textElement.setAttribute('text-anchor', 'middle')
    this.textElement.setAttribute('dominant-baseline', 'middle')
    this.textElement.setAttribute('fill', '#333')
    this.textElement.style.fontSize = '20px'
    this.textElement.style.fontWeight = 'bold'
    this.svg.appendChild(this.textElement)
  }

  private percent(): number {
    const p = (this.value - this.min) / (this.max - this.min)
    return clamp(p, 0, 1)
  }

  private render(animate = true) {
    const p = this.percent()
    const offset = this.pathLength * (1 - p)

    if (this.options.segments?.enabled) {
      const count = this.options.segments.count ?? 10
      const gap = this.options.segments.gap ?? 2
      const segmentLength = (this.pathLength - gap * count) / count
      const dashArray = `${segmentLength} ${gap}`
      this.path.setAttribute('stroke-dasharray', dashArray)
      this.path.setAttribute('stroke-dashoffset', String(offset))
    } else {
      this.path.setAttribute('stroke-dasharray', String(this.pathLength))
      this.path.setAttribute('stroke-dashoffset', String(offset))
    }

    // 动画控制
    if (!animate) {
      this.path.style.transition = 'none'
      void this.path.offsetHeight
      this.path.style.transition = `stroke-dashoffset ${this.options.animation?.duration}ms ${this.options.animation?.easing}`
    }

    // 更新文本
    if (this.textElement) {
      const text = this.options.text?.format
        ? this.options.text.format(this.value, this.max)
        : `${Math.round(p * 100)}%`
      this.textElement.textContent = text
    }
  }

  public setValue(value: number, animate = true) {
    const oldValue = this.value
    this.value = clamp(value, this.min, this.max)

    if (animate && this.options.animation?.duration && oldValue !== this.value) {
      this.animateValue(oldValue, this.value)
    } else {
      this.render(!animate)
    }
  }

  public setProgress(progress: number, animate = true) {
    const v = this.min + clamp(progress, 0, 1) * (this.max - this.min)
    this.setValue(v, animate)
  }

  private animateValue(from: number, to: number) {
    const duration = this.options.animation?.duration ?? 300
    const startTime = performance.now()

    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = this.easeInOut(progress)
      const currentValue = from + (to - from) * easeProgress

      // 同时更新数值和渲染，确保文本和进度条同步动画
      this.value = currentValue
      this.renderAnimated(easeProgress, from, to)

      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      }
    }

    this.animationId = requestAnimationFrame(animate)
  }

  private renderAnimated(progress: number, fromValue: number, toValue: number) {
    // 计算当前进度百分比
    const currentValue = fromValue + (toValue - fromValue) * progress
    const p = (currentValue - this.min) / (this.max - this.min)
    const clampedP = clamp(p, 0, 1)
    const offset = this.pathLength * (1 - clampedP)

    if (this.options.segments?.enabled) {
      const count = this.options.segments.count ?? 10
      const gap = this.options.segments.gap ?? 2
      const segmentLength = (this.pathLength - gap * count) / count
      const dashArray = `${segmentLength} ${gap}`
      this.path.setAttribute('stroke-dasharray', dashArray)
      this.path.setAttribute('stroke-dashoffset', String(offset))
    } else {
      this.path.setAttribute('stroke-dasharray', String(this.pathLength))
      this.path.setAttribute('stroke-dashoffset', String(offset))
    }

    // 同步更新文本，确保文本也参与动画
    if (this.textElement) {
      const text = this.options.text?.format
        ? this.options.text.format(currentValue, this.max)
        : `${Math.round(clampedP * 100)}%`
      this.textElement.textContent = text
    }
  }

  private easeInOut(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }
}
