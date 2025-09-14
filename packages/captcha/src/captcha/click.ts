/**
 * 点击验证码
 * 用户需要点击图片中的指定区域完成验证
 */

import { BaseCaptcha } from '../core/base-captcha'
import {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  ClickConfig,
  Point
} from '../types'
import {
  random,
  isPointInCircle,
  loadImage,
  createCanvas,
  getRelativePosition
} from '../utils'

interface TargetArea {
  /** 中心点 */
  center: Point
  /** 半径 */
  radius: number
  /** 标签 */
  label?: string
  /** 是否已点击 */
  clicked: boolean
  /** 点击顺序 */
  clickOrder?: number
}

export class ClickCaptcha extends BaseCaptcha {
  public readonly type = CaptchaType.CLICK

  /** 点击验证配置 */
  protected declare _config: ClickConfig

  /** 背景图片 */
  private backgroundImage: HTMLImageElement | null = null

  /** 画布元素 */
  private canvas: HTMLCanvasElement | null = null

  /** 画布上下文 */
  private ctx: CanvasRenderingContext2D | null = null

  /** 目标区域列表 */
  private targetAreas: TargetArea[] = []

  /** 当前点击数量 */
  private clickCount: number = 0

  /** 点击历史 */
  private clickHistory: Point[] = []

  /** 提示元素 */
  private hintElement: HTMLElement | null = null

  constructor(config: ClickConfig) {
    super(config)
  }

  /**
   * 合并配置
   */
  protected mergeConfig(config: ClickConfig): ClickConfig {
    const defaultConfig: Partial<ClickConfig> = {
      ...super.mergeConfig(config),
      tolerance: 10,
      maxClicks: 3,
      imageUrl: '/api/captcha/click-image',
      targetAreas: []
    }

    return { ...defaultConfig, ...config }
  }

  /**
   * 初始化验证码
   */
  async init(): Promise<void> {
    if (this.destroyed) {
      throw new Error('验证码已销毁')
    }

    this.setStatus(CaptchaStatus.INITIALIZING)

    try {
      // 获取容器并创建根元素
      const container = this.getContainer()
      this.rootElement = this.createRootElement()
      
      // 创建HTML结构
      this.createElements()
      
      // 加载背景图片
      await this.loadBackgroundImage()
      
      // 生成目标区域
      this.generateTargetAreas()
      
      // 绘制图片和目标区域
      this.drawCanvas()
      
      // 绑定事件
      this.bindEvents()
      
      // 添加到容器
      container.appendChild(this.rootElement)
      
      this.setStatus(CaptchaStatus.READY)
      this.emit('init')

      if (this._config.debug) {
        console.log('[ClickCaptcha] 初始化完成')
      }
    } catch (error) {
      this.setStatus(CaptchaStatus.ERROR)
      throw error
    }
  }

  /**
   * 创建HTML元素
   */
  private createElements(): void {
    if (!this.rootElement) return

    this.rootElement.innerHTML = `
      <div class="ldesign-captcha-content">
        <div class="ldesign-captcha-hint">
          <span class="ldesign-captcha-hint-text">请点击图片中的指定区域</span>
        </div>
        <div class="ldesign-captcha-canvas-container">
          <canvas class="ldesign-captcha-click-canvas"></canvas>
        </div>
        <div class="ldesign-captcha-status">
          <span class="ldesign-captcha-click-count">0</span> / <span class="ldesign-captcha-max-clicks">0</span>
        </div>
      </div>
    `

    // 获取元素引用
    this.canvas = this.rootElement.querySelector('.ldesign-captcha-click-canvas') as HTMLCanvasElement
    this.hintElement = this.rootElement.querySelector('.ldesign-captcha-hint-text') as HTMLElement

    // 设置画布尺寸
    if (this.canvas) {
      const canvasWidth = this._config.width! - 20
      const canvasHeight = this._config.height! - 80

      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.canvas.style.width = `${canvasWidth}px`
      this.canvas.style.height = `${canvasHeight}px`

      this.ctx = this.canvas.getContext('2d')!
    }

    // 更新最大点击数显示
    const maxClicksElement = this.rootElement.querySelector('.ldesign-captcha-max-clicks') as HTMLElement
    if (maxClicksElement) {
      maxClicksElement.textContent = (this._config.maxClicks || 3).toString()
    }
  }

  /**
   * 加载背景图片
   */
  private async loadBackgroundImage(): Promise<void> {
    if (!this._config.imageUrl) {
      this.backgroundImage = await this.generateTestImage()
    } else {
      this.backgroundImage = await loadImage(this._config.imageUrl)
    }
  }

  /**
   * 生成测试图片
   */
  private async generateTestImage(): Promise<HTMLImageElement> {
    const { canvas, ctx } = createCanvas(400, 300)
    
    // 绘制背景
    const gradient = ctx.createLinearGradient(0, 0, 400, 300)
    gradient.addColorStop(0, '#667eea')
    gradient.addColorStop(1, '#764ba2')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 300)
    
    // 绘制一些形状作为目标
    const shapes = [
      { type: 'circle', x: 100, y: 80, radius: 25, color: '#ff6b6b' },
      { type: 'rect', x: 200, y: 120, width: 50, height: 30, color: '#4ecdc4' },
      { type: 'triangle', x: 320, y: 200, size: 30, color: '#45b7d1' }
    ]

    shapes.forEach(shape => {
      ctx.fillStyle = shape.color
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2

      if (shape.type === 'circle') {
        ctx.beginPath()
        ctx.arc(shape.x, shape.y, shape.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      } else if (shape.type === 'rect') {
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height)
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
      } else if (shape.type === 'triangle') {
        ctx.beginPath()
        ctx.moveTo(shape.x, shape.y - shape.size)
        ctx.lineTo(shape.x - shape.size, shape.y + shape.size)
        ctx.lineTo(shape.x + shape.size, shape.y + shape.size)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()
      }
    })
    
    // 转换为图片
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = canvas.toDataURL()
    })
  }

  /**
   * 生成目标区域
   */
  private generateTargetAreas(): void {
    if (!this.canvas) return

    this.targetAreas = []
    this.clickCount = 0
    this.clickHistory = []

    // 如果配置中有目标区域，使用配置的区域
    if (this._config.targetAreas && this._config.targetAreas.length > 0) {
      this.targetAreas = this._config.targetAreas.map(area => ({
        center: { x: area.x, y: area.y },
        radius: area.radius,
        label: area.label,
        clicked: false
      }))
    } else {
      // 否则生成随机目标区域
      const areaCount = Math.min(this._config.maxClicks || 3, 5)
      const minRadius = 20
      const maxRadius = 40
      const padding = 50

      for (let i = 0; i < areaCount; i++) {
        let center: Point
        let radius: number
        let attempts = 0
        const maxAttempts = 100

        do {
          center = {
            x: random(padding, this.canvas.width - padding),
            y: random(padding, this.canvas.height - padding)
          }
          radius = random(minRadius, maxRadius)
          attempts++
        } while (attempts < maxAttempts && this.isAreaOverlapping(center, radius))

        this.targetAreas.push({
          center,
          radius,
          label: `目标${i + 1}`,
          clicked: false
        })
      }
    }

    // 更新提示文字
    if (this.hintElement) {
      const labels = this.targetAreas.map(area => area.label || '目标').join('、')
      this.hintElement.textContent = `请依次点击：${labels}`
    }
  }

  /**
   * 检查区域是否重叠
   */
  private isAreaOverlapping(center: Point, radius: number): boolean {
    return this.targetAreas.some(area => {
      const distance = Math.sqrt(
        Math.pow(center.x - area.center.x, 2) + 
        Math.pow(center.y - area.center.y, 2)
      )
      return distance < radius + area.radius + 20 // 额外间距
    })
  }

  /**
   * 绘制画布
   */
  private drawCanvas(): void {
    if (!this.ctx || !this.canvas || !this.backgroundImage) return

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 绘制背景图片
    this.ctx.drawImage(
      this.backgroundImage,
      0, 0,
      this.canvas.width,
      this.canvas.height
    )

    // 绘制目标区域
    this.targetAreas.forEach((area, index) => {
      this.drawTargetArea(area, index)
    })

    // 绘制点击历史
    this.drawClickHistory()
  }

  /**
   * 绘制目标区域
   */
  private drawTargetArea(area: TargetArea, index: number): void {
    if (!this.ctx) return

    const { center, radius, clicked } = area

    // 设置样式
    if (clicked) {
      this.ctx.fillStyle = 'rgba(82, 196, 26, 0.3)'
      this.ctx.strokeStyle = '#52c41a'
    } else {
      this.ctx.fillStyle = 'rgba(24, 144, 255, 0.2)'
      this.ctx.strokeStyle = '#1890ff'
    }

    this.ctx.lineWidth = 2

    // 绘制圆形区域
    this.ctx.beginPath()
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
    this.ctx.fill()
    this.ctx.stroke()

    // 绘制序号
    this.ctx.save()
    this.ctx.fillStyle = clicked ? '#52c41a' : '#1890ff'
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.fillText((index + 1).toString(), center.x, center.y)
    this.ctx.restore()
  }

  /**
   * 绘制点击历史
   */
  private drawClickHistory(): void {
    if (!this.ctx) return

    this.clickHistory.forEach((point, index) => {
      // 绘制点击点
      this.ctx.fillStyle = '#ff4d4f'
      this.ctx.beginPath()
      this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      this.ctx.fill()

      // 绘制点击顺序
      this.ctx.save()
      this.ctx.fillStyle = '#ffffff'
      this.ctx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif'
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText((index + 1).toString(), point.x, point.y)
      this.ctx.restore()
    })
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.canvas) return

    this.canvas.addEventListener('click', this.handleClick.bind(this))
    this.canvas.addEventListener('touchend', this.handleClick.bind(this))
    
    // 防止默认触摸行为
    this.canvas.addEventListener('touchstart', (e) => e.preventDefault())
  }

  /**
   * 处理点击事件
   */
  private handleClick(event: MouseEvent | TouchEvent): void {
    if (this._config.disabled || this._status !== CaptchaStatus.READY) {
      return
    }

    if (this.clickCount === 0) {
      this.startTime = Date.now()
      this.setStatus(CaptchaStatus.VERIFYING)
      this.emit('start')
    }

    const position = getRelativePosition(event, this.canvas!)
    this.clickHistory.push(position)

    // 检查是否点击了目标区域
    const targetArea = this.findTargetArea(position)
    let isCorrect = false

    if (targetArea && !targetArea.clicked) {
      targetArea.clicked = true
      targetArea.clickOrder = this.clickCount
      isCorrect = true
    }

    this.clickCount++
    this.updateClickCount()

    // 重绘画布
    this.drawCanvas()

    this.emit('progress', {
      clickCount: this.clickCount,
      maxClicks: this._config.maxClicks,
      position,
      isCorrect,
      targetArea
    })

    // 检查是否完成
    if (this.isCompleted()) {
      this.handleSuccess({
        clickHistory: this.clickHistory,
        targetAreas: this.targetAreas,
        correctClicks: this.targetAreas.filter(area => area.clicked).length
      })
    } else if (this.clickCount >= (this._config.maxClicks || 3)) {
      this.handleFail('点击次数已用完，请重试')
    }
  }

  /**
   * 查找目标区域
   */
  private findTargetArea(position: Point): TargetArea | null {
    const tolerance = this._config.tolerance || 10

    return this.targetAreas.find(area => {
      return isPointInCircle(position, area.center, area.radius + tolerance)
    }) || null
  }

  /**
   * 检查是否完成
   */
  private isCompleted(): boolean {
    return this.targetAreas.every(area => area.clicked)
  }

  /**
   * 更新点击计数显示
   */
  private updateClickCount(): void {
    if (!this.rootElement) return

    const clickCountElement = this.rootElement.querySelector('.ldesign-captcha-click-count') as HTMLElement
    if (clickCountElement) {
      clickCountElement.textContent = this.clickCount.toString()
    }
  }

  /**
   * 开始验证
   */
  start(): void {
    if (this._status === CaptchaStatus.READY) {
      this.generateTargetAreas()
      this.drawCanvas()
      this.updateClickCount()
    }
  }

  /**
   * 验证结果
   */
  async verify(data: any): Promise<CaptchaResult> {
    return {
      type: this.type,
      success: true,
      data,
      timestamp: Date.now(),
      duration: Date.now() - this.startTime,
      token: this.generateToken()
    }
  }

  /**
   * 重置验证码
   */
  reset(): void {
    super.reset()
    
    this.generateTargetAreas()
    this.drawCanvas()
    this.updateClickCount()
  }

  /**
   * 销毁验证码
   */
  destroy(): void {
    // 移除事件监听器
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.handleClick.bind(this))
      this.canvas.removeEventListener('touchend', this.handleClick.bind(this))
    }

    // 清理引用
    this.backgroundImage = null
    this.canvas = null
    this.ctx = null
    this.hintElement = null
    this.targetAreas = []
    this.clickHistory = []

    super.destroy()
  }
}
