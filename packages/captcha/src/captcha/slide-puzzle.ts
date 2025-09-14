/**
 * 滑动拼图验证码
 * 用户需要拖拽拼图块到正确位置完成验证
 */

import { BaseCaptcha } from '../core/base-captcha'
import {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  SlidePuzzleConfig,
  Point
} from '../types'
import {
  random,
  clamp,
  distance,
  loadImage,
  createCanvas,
  getRelativePosition,
  isTouchSupported,
  debounce
} from '../utils'

export class SlidePuzzleCaptcha extends BaseCaptcha {
  public readonly type = CaptchaType.SLIDE_PUZZLE

  /** 滑动拼图配置 */
  protected declare _config: SlidePuzzleConfig

  /** 背景图片 */
  private backgroundImage: HTMLImageElement | null = null

  /** 拼图块图片 */
  private puzzleImage: HTMLImageElement | null = null

  /** 背景画布 */
  private backgroundCanvas: HTMLCanvasElement | null = null

  /** 拼图块画布 */
  private puzzleCanvas: HTMLCanvasElement | null = null

  /** 滑块元素 */
  private sliderElement: HTMLElement | null = null

  /** 拼图块位置 */
  private puzzlePosition: Point = { x: 0, y: 0 }

  /** 正确位置 */
  private correctPosition: Point = { x: 0, y: 0 }

  /** 拼图块大小 */
  private puzzleSize: number = 60

  /** 是否正在拖拽 */
  private isDragging: boolean = false

  /** 拖拽起始位置 */
  private dragStartPosition: Point = { x: 0, y: 0 }

  /** 滑块起始位置 */
  private sliderStartPosition: number = 0

  constructor(config: SlidePuzzleConfig) {
    super(config)
    this.puzzleSize = config.puzzleSize || 60
  }

  /**
   * 合并配置
   */
  protected mergeConfig(config: SlidePuzzleConfig): SlidePuzzleConfig {
    const defaultConfig: Partial<SlidePuzzleConfig> = {
      ...super.mergeConfig(config),
      puzzleSize: 60,
      tolerance: 5,
      showShadow: true,
      sliderHeight: 40,
      imageUrl: '/api/captcha/slide-puzzle-image'
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

      // 生成拼图
      this.generatePuzzle()

      // 绑定事件
      this.bindEvents()

      // 添加到容器
      container.appendChild(this.rootElement)

      this.setStatus(CaptchaStatus.READY)
      this.emit('init')

      if (this._config.debug) {
        console.log('[SlidePuzzleCaptcha] 初始化完成')
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
        <div class="ldesign-captcha-image-container">
          <canvas class="ldesign-captcha-background"></canvas>
          <canvas class="ldesign-captcha-puzzle"></canvas>
        </div>
        <div class="ldesign-captcha-slider-container">
          <div class="ldesign-captcha-slider-track">
            <div class="ldesign-captcha-slider-thumb">
              <span class="ldesign-captcha-slider-icon">→</span>
            </div>
          </div>
          <div class="ldesign-captcha-slider-text">拖动滑块完成拼图</div>
        </div>
      </div>
    `

    // 获取元素引用
    this.backgroundCanvas = this.rootElement.querySelector('.ldesign-captcha-background') as HTMLCanvasElement
    this.puzzleCanvas = this.rootElement.querySelector('.ldesign-captcha-puzzle') as HTMLCanvasElement
    this.sliderElement = this.rootElement.querySelector('.ldesign-captcha-slider-thumb') as HTMLElement

    // 设置画布尺寸
    if (this.backgroundCanvas && this.puzzleCanvas) {
      const imageWidth = this._config.width! - 20 // 留出边距
      const imageHeight = this._config.height! - this._config.sliderHeight! - 30

      this.backgroundCanvas.width = imageWidth
      this.backgroundCanvas.height = imageHeight
      this.puzzleCanvas.width = imageWidth
      this.puzzleCanvas.height = imageHeight

      this.backgroundCanvas.style.width = `${imageWidth}px`
      this.backgroundCanvas.style.height = `${imageHeight}px`
      this.puzzleCanvas.style.width = `${imageWidth}px`
      this.puzzleCanvas.style.height = `${imageHeight}px`
    }
  }

  /**
   * 加载背景图片
   */
  private async loadBackgroundImage(): Promise<void> {
    if (!this._config.imageUrl) {
      // 如果没有提供图片URL，生成一个简单的测试图片
      this.backgroundImage = await this.generateTestImage()
    } else {
      this.backgroundImage = await loadImage(this._config.imageUrl)
    }
  }

  /**
   * 生成测试图片
   */
  private async generateTestImage(): Promise<HTMLImageElement> {
    const { canvas, ctx } = createCanvas(400, 200)

    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 400, 200)
    gradient.addColorStop(0, '#4facfe')
    gradient.addColorStop(1, '#00f2fe')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 400, 200)

    // 添加一些装饰图案
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    for (let i = 0; i < 20; i++) {
      const x = random(0, 400)
      const y = random(0, 200)
      const radius = random(5, 15)
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    // 转换为图片
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = canvas.toDataURL()
    })
  }

  /**
   * 生成拼图
   */
  private generatePuzzle(): void {
    if (!this.backgroundImage || !this.backgroundCanvas || !this.puzzleCanvas) {
      return
    }

    const bgCtx = this.backgroundCanvas.getContext('2d')!
    const puzzleCtx = this.puzzleCanvas.getContext('2d')!

    // 清空画布
    bgCtx.clearRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height)
    puzzleCtx.clearRect(0, 0, this.puzzleCanvas.width, this.puzzleCanvas.height)

    // 绘制背景图片
    bgCtx.drawImage(
      this.backgroundImage,
      0, 0,
      this.backgroundCanvas.width,
      this.backgroundCanvas.height
    )

    // 生成随机拼图位置
    const margin = this.puzzleSize
    this.correctPosition = {
      x: random(margin, this.backgroundCanvas.width - this.puzzleSize - margin),
      y: random(margin, this.backgroundCanvas.height - this.puzzleSize - margin)
    }

    // 初始拼图位置（左侧）
    this.puzzlePosition = {
      x: 0,
      y: this.correctPosition.y
    }

    // 创建拼图形状路径
    const puzzlePath = this.createPuzzlePath(this.correctPosition.x, this.correctPosition.y)

    // 在背景上挖空拼图区域
    bgCtx.save()
    bgCtx.globalCompositeOperation = 'destination-out'
    bgCtx.fill(puzzlePath)
    bgCtx.restore()

    // 添加拼图区域阴影
    if (this._config.showShadow) {
      bgCtx.save()
      bgCtx.shadowColor = 'rgba(0, 0, 0, 0.3)'
      bgCtx.shadowBlur = 5
      bgCtx.shadowOffsetX = 2
      bgCtx.shadowOffsetY = 2
      bgCtx.strokeStyle = 'rgba(0, 0, 0, 0.2)'
      bgCtx.lineWidth = 1
      bgCtx.stroke(puzzlePath)
      bgCtx.restore()
    }

    // 绘制拼图块
    this.drawPuzzlePiece()
  }

  /**
   * 创建拼图形状路径
   */
  private createPuzzlePath(x: number, y: number): Path2D {
    const path = new Path2D()
    const size = this.puzzleSize
    const bump = size * 0.2 // 凸起大小

    path.moveTo(x, y)

    // 上边（可能有凸起）
    const topBump = Math.random() > 0.5
    if (topBump) {
      path.lineTo(x + size * 0.3, y)
      path.arc(x + size * 0.5, y, bump, Math.PI, 0, false)
      path.lineTo(x + size * 0.7, y)
    }
    path.lineTo(x + size, y)

    // 右边（可能有凸起）
    const rightBump = Math.random() > 0.5
    if (rightBump) {
      path.lineTo(x + size, y + size * 0.3)
      path.arc(x + size, y + size * 0.5, bump, Math.PI * 1.5, Math.PI * 0.5, false)
      path.lineTo(x + size, y + size * 0.7)
    }
    path.lineTo(x + size, y + size)

    // 下边（可能有凸起）
    const bottomBump = Math.random() > 0.5
    if (bottomBump) {
      path.lineTo(x + size * 0.7, y + size)
      path.arc(x + size * 0.5, y + size, bump, 0, Math.PI, false)
      path.lineTo(x + size * 0.3, y + size)
    }
    path.lineTo(x, y + size)

    // 左边（可能有凸起）
    const leftBump = Math.random() > 0.5
    if (leftBump) {
      path.lineTo(x, y + size * 0.7)
      path.arc(x, y + size * 0.5, bump, Math.PI * 0.5, Math.PI * 1.5, false)
      path.lineTo(x, y + size * 0.3)
    }
    path.closePath()

    return path
  }

  /**
   * 绘制拼图块
   */
  private drawPuzzlePiece(): void {
    if (!this.backgroundImage || !this.puzzleCanvas) {
      return
    }

    const ctx = this.puzzleCanvas.getContext('2d')!
    ctx.clearRect(0, 0, this.puzzleCanvas.width, this.puzzleCanvas.height)

    // 创建拼图路径
    const puzzlePath = this.createPuzzlePath(this.puzzlePosition.x, this.puzzlePosition.y)

    // 绘制拼图块
    ctx.save()
    ctx.clip(puzzlePath)
    ctx.drawImage(
      this.backgroundImage,
      -this.correctPosition.x + this.puzzlePosition.x, // 偏移量
      0,
      this.puzzleCanvas.width,
      this.puzzleCanvas.height
    )
    ctx.restore()

    // 添加边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke(puzzlePath)
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.sliderElement) return

    const isTouchDevice = isTouchSupported()

    if (isTouchDevice) {
      this.sliderElement.addEventListener('touchstart', this.handleDragStart.bind(this), { passive: false })
      document.addEventListener('touchmove', this.handleDragMove.bind(this), { passive: false })
      document.addEventListener('touchend', this.handleDragEnd.bind(this))
    } else {
      this.sliderElement.addEventListener('mousedown', this.handleDragStart.bind(this))
      document.addEventListener('mousemove', this.handleDragMove.bind(this))
      document.addEventListener('mouseup', this.handleDragEnd.bind(this))
    }

    // 防止默认拖拽行为
    this.sliderElement.addEventListener('dragstart', (e) => e.preventDefault())
  }

  /**
   * 处理拖拽开始
   */
  private handleDragStart(event: MouseEvent | TouchEvent): void {
    if (this._config.disabled || this._status !== CaptchaStatus.READY) {
      return
    }

    event.preventDefault()
    this.isDragging = true
    this.startTime = Date.now()

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    this.dragStartPosition.x = clientX
    this.sliderStartPosition = this.puzzlePosition.x

    this.setStatus(CaptchaStatus.VERIFYING)
    this.emit('start')

    if (this.sliderElement) {
      this.sliderElement.classList.add('ldesign-captcha-slider-dragging')
    }
  }

  /**
   * 处理拖拽移动
   */
  private handleDragMove = debounce((event: MouseEvent | TouchEvent): void => {
    if (!this.isDragging || !this.puzzleCanvas) {
      return
    }

    event.preventDefault()

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const deltaX = clientX - this.dragStartPosition.x
    const maxX = this.puzzleCanvas.width - this.puzzleSize

    // 更新拼图位置
    this.puzzlePosition.x = clamp(this.sliderStartPosition + deltaX, 0, maxX)

    // 重绘拼图块
    this.drawPuzzlePiece()

    // 更新滑块位置
    if (this.sliderElement) {
      const sliderTrack = this.sliderElement.parentElement!
      const trackWidth = sliderTrack.offsetWidth - this.sliderElement.offsetWidth
      const progress = this.puzzlePosition.x / maxX
      this.sliderElement.style.left = `${progress * trackWidth}px`
    }

    this.emit('progress', { position: this.puzzlePosition, progress: this.puzzlePosition.x / maxX })
  }, 16) // 约60fps

  /**
   * 处理拖拽结束
   */
  private handleDragEnd(): void {
    if (!this.isDragging) {
      return
    }

    this.isDragging = false

    if (this.sliderElement) {
      this.sliderElement.classList.remove('ldesign-captcha-slider-dragging')
    }

    // 验证位置
    this.verifyPosition()
  }

  /**
   * 验证位置
   */
  private async verifyPosition(): Promise<void> {
    const tolerance = this._config.tolerance || 5
    const distance = Math.abs(this.puzzlePosition.x - this.correctPosition.x)

    if (distance <= tolerance) {
      // 验证成功
      this.handleSuccess({
        position: this.puzzlePosition,
        correctPosition: this.correctPosition,
        distance,
        tolerance
      })
    } else {
      // 验证失败，重置位置
      await this.resetPuzzlePosition()
      this.handleFail('拼图位置不正确，请重试')
    }
  }

  /**
   * 重置拼图位置
   */
  private async resetPuzzlePosition(): Promise<void> {
    // 动画回到起始位置
    const startX = this.puzzlePosition.x
    const duration = 300
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // 使用缓动函数
      const easeOut = 1 - Math.pow(1 - progress, 3)

      this.puzzlePosition.x = startX * (1 - easeOut)
      this.drawPuzzlePiece()

      // 更新滑块位置
      if (this.sliderElement) {
        const sliderTrack = this.sliderElement.parentElement!
        const trackWidth = sliderTrack.offsetWidth - this.sliderElement.offsetWidth
        const maxX = this.puzzleCanvas!.width - this.puzzleSize
        const sliderProgress = this.puzzlePosition.x / maxX
        this.sliderElement.style.left = `${sliderProgress * trackWidth}px`
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.setStatus(CaptchaStatus.READY)
      }
    }

    animate()
  }

  /**
   * 开始验证
   */
  start(): void {
    if (this._status === CaptchaStatus.READY) {
      // 重新生成拼图
      this.generatePuzzle()
    }
  }

  /**
   * 验证结果
   */
  async verify(data: any): Promise<CaptchaResult> {
    // 这里可以添加服务端验证逻辑
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

    if (this.puzzleCanvas && this.backgroundCanvas) {
      this.generatePuzzle()
    }

    // 重置滑块位置
    if (this.sliderElement) {
      this.sliderElement.style.left = '0px'
      this.sliderElement.classList.remove('ldesign-captcha-slider-dragging')
    }
  }

  /**
   * 销毁验证码
   */
  destroy(): void {
    // 移除事件监听器
    if (this.sliderElement) {
      const isTouchDevice = isTouchSupported()

      if (isTouchDevice) {
        this.sliderElement.removeEventListener('touchstart', this.handleDragStart.bind(this))
        document.removeEventListener('touchmove', this.handleDragMove)
        document.removeEventListener('touchend', this.handleDragEnd.bind(this))
      } else {
        this.sliderElement.removeEventListener('mousedown', this.handleDragStart.bind(this))
        document.removeEventListener('mousemove', this.handleDragMove)
        document.removeEventListener('mouseup', this.handleDragEnd.bind(this))
      }
    }

    // 清理引用
    this.backgroundImage = null
    this.puzzleImage = null
    this.backgroundCanvas = null
    this.puzzleCanvas = null
    this.sliderElement = null

    super.destroy()
  }
}
