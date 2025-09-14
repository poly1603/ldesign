/**
 * 滑动滑块图片回正验证码
 * 用户需要旋转图片到正确角度完成验证
 */

import { BaseCaptcha } from '../core/base-captcha'
import {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  RotateSliderConfig,
  Point
} from '../types'
import {
  random,
  clamp,
  normalizeAngle,
  angleDifference,
  degreesToRadians,
  loadImage,
  createCanvas,
  getRelativePosition,
  isTouchSupported,
  debounce
} from '../utils'

export class RotateSliderCaptcha extends BaseCaptcha {
  public readonly type = CaptchaType.ROTATE_SLIDER

  /** 旋转滑块配置 */
  protected declare _config: RotateSliderConfig

  /** 背景图片 */
  private backgroundImage: HTMLImageElement | null = null

  /** 图片画布 */
  private imageCanvas: HTMLCanvasElement | null = null

  /** 滑块元素 */
  private sliderElement: HTMLElement | null = null

  /** 当前角度 */
  private currentAngle: number = 0

  /** 目标角度 */
  private targetAngle: number = 0

  /** 初始随机角度 */
  private initialAngle: number = 0

  /** 是否正在拖拽 */
  private isDragging: boolean = false

  /** 拖拽起始位置 */
  private dragStartPosition: Point = { x: 0, y: 0 }

  /** 滑块起始角度 */
  private sliderStartAngle: number = 0

  /** 滑块样式 */
  private sliderStyle: 'circular' | 'linear' = 'circular'

  constructor(config: RotateSliderConfig) {
    super(config)
    this.sliderStyle = config.sliderStyle || 'circular'
  }

  /**
   * 合并配置
   */
  protected mergeConfig(config: RotateSliderConfig): RotateSliderConfig {
    const defaultConfig: Partial<RotateSliderConfig> = {
      ...super.mergeConfig(config),
      targetAngle: 0,
      tolerance: 5,
      sliderStyle: 'circular',
      imageUrl: '/api/captcha/rotate-image'
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
      
      // 生成旋转角度
      this.generateRotation()
      
      // 绘制图片
      this.drawImage()
      
      // 绑定事件
      this.bindEvents()
      
      // 添加到容器
      container.appendChild(this.rootElement)
      
      this.setStatus(CaptchaStatus.READY)
      this.emit('init')

      if (this._config.debug) {
        console.log('[RotateSliderCaptcha] 初始化完成')
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

    const sliderHtml = this.sliderStyle === 'circular' 
      ? this.createCircularSliderHtml()
      : this.createLinearSliderHtml()

    this.rootElement.innerHTML = `
      <div class="ldesign-captcha-content">
        <div class="ldesign-captcha-image-container">
          <canvas class="ldesign-captcha-rotate-image"></canvas>
        </div>
        <div class="ldesign-captcha-rotate-hint">
          拖动滑块旋转图片到正确角度
        </div>
        ${sliderHtml}
      </div>
    `

    // 获取元素引用
    this.imageCanvas = this.rootElement.querySelector('.ldesign-captcha-rotate-image') as HTMLCanvasElement
    this.sliderElement = this.rootElement.querySelector('.ldesign-captcha-rotate-slider') as HTMLElement

    // 设置画布尺寸
    if (this.imageCanvas) {
      const imageSize = Math.min(this._config.width! - 40, this._config.height! - 120)
      
      this.imageCanvas.width = imageSize
      this.imageCanvas.height = imageSize
      this.imageCanvas.style.width = `${imageSize}px`
      this.imageCanvas.style.height = `${imageSize}px`
    }
  }

  /**
   * 创建圆形滑块HTML
   */
  private createCircularSliderHtml(): string {
    return `
      <div class="ldesign-captcha-rotate-container ldesign-captcha-rotate-circular">
        <div class="ldesign-captcha-rotate-track">
          <div class="ldesign-captcha-rotate-slider">
            <div class="ldesign-captcha-rotate-handle"></div>
          </div>
        </div>
      </div>
    `
  }

  /**
   * 创建线性滑块HTML
   */
  private createLinearSliderHtml(): string {
    return `
      <div class="ldesign-captcha-rotate-container ldesign-captcha-rotate-linear">
        <div class="ldesign-captcha-rotate-track">
          <div class="ldesign-captcha-rotate-slider">
            <span class="ldesign-captcha-rotate-icon">↻</span>
          </div>
        </div>
      </div>
    `
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
    const { canvas, ctx } = createCanvas(300, 300)
    
    // 绘制背景
    const gradient = ctx.createRadialGradient(150, 150, 0, 150, 150, 150)
    gradient.addColorStop(0, '#ff9a9e')
    gradient.addColorStop(1, '#fecfef')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 300, 300)
    
    // 绘制指示箭头
    ctx.save()
    ctx.translate(150, 150)
    ctx.fillStyle = '#ffffff'
    ctx.strokeStyle = '#333333'
    ctx.lineWidth = 3
    
    // 箭头主体
    ctx.beginPath()
    ctx.moveTo(0, -80)
    ctx.lineTo(-20, -40)
    ctx.lineTo(-10, -40)
    ctx.lineTo(-10, 40)
    ctx.lineTo(10, 40)
    ctx.lineTo(10, -40)
    ctx.lineTo(20, -40)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 添加文字
    ctx.fillStyle = '#333333'
    ctx.font = '16px -apple-system, BlinkMacSystemFont, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('↑', 0, 70)
    
    ctx.restore()
    
    // 转换为图片
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.src = canvas.toDataURL()
    })
  }

  /**
   * 生成旋转角度
   */
  private generateRotation(): void {
    this.targetAngle = this._config.targetAngle || 0
    this.initialAngle = random(30, 330) // 避免接近目标角度
    this.currentAngle = this.initialAngle
  }

  /**
   * 绘制图片
   */
  private drawImage(): void {
    if (!this.backgroundImage || !this.imageCanvas) {
      return
    }

    const ctx = this.imageCanvas.getContext('2d')!
    const size = this.imageCanvas.width
    
    // 清空画布
    ctx.clearRect(0, 0, size, size)
    
    // 保存上下文
    ctx.save()
    
    // 移动到中心点并旋转
    ctx.translate(size / 2, size / 2)
    ctx.rotate(degreesToRadians(this.currentAngle))
    
    // 绘制图片
    const imageSize = size * 0.8
    ctx.drawImage(
      this.backgroundImage,
      -imageSize / 2,
      -imageSize / 2,
      imageSize,
      imageSize
    )
    
    // 恢复上下文
    ctx.restore()
    
    // 绘制边框
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, size, size)
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.sliderElement) return

    const isTouchDevice = isTouchSupported()

    if (this.sliderStyle === 'circular') {
      this.bindCircularSliderEvents(isTouchDevice)
    } else {
      this.bindLinearSliderEvents(isTouchDevice)
    }

    // 防止默认拖拽行为
    this.sliderElement.addEventListener('dragstart', (e) => e.preventDefault())
  }

  /**
   * 绑定圆形滑块事件
   */
  private bindCircularSliderEvents(isTouchDevice: boolean): void {
    if (isTouchDevice) {
      this.sliderElement!.addEventListener('touchstart', this.handleCircularDragStart.bind(this), { passive: false })
      document.addEventListener('touchmove', this.handleCircularDragMove.bind(this), { passive: false })
      document.addEventListener('touchend', this.handleDragEnd.bind(this))
    } else {
      this.sliderElement!.addEventListener('mousedown', this.handleCircularDragStart.bind(this))
      document.addEventListener('mousemove', this.handleCircularDragMove.bind(this))
      document.addEventListener('mouseup', this.handleDragEnd.bind(this))
    }
  }

  /**
   * 绑定线性滑块事件
   */
  private bindLinearSliderEvents(isTouchDevice: boolean): void {
    if (isTouchDevice) {
      this.sliderElement!.addEventListener('touchstart', this.handleLinearDragStart.bind(this), { passive: false })
      document.addEventListener('touchmove', this.handleLinearDragMove.bind(this), { passive: false })
      document.addEventListener('touchend', this.handleDragEnd.bind(this))
    } else {
      this.sliderElement!.addEventListener('mousedown', this.handleLinearDragStart.bind(this))
      document.addEventListener('mousemove', this.handleLinearDragMove.bind(this))
      document.addEventListener('mouseup', this.handleDragEnd.bind(this))
    }
  }

  /**
   * 处理圆形滑块拖拽开始
   */
  private handleCircularDragStart(event: MouseEvent | TouchEvent): void {
    if (this._config.disabled || this._status !== CaptchaStatus.READY) {
      return
    }

    event.preventDefault()
    this.isDragging = true
    this.startTime = Date.now()

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
    
    this.dragStartPosition = { x: clientX, y: clientY }
    this.sliderStartAngle = this.currentAngle

    this.setStatus(CaptchaStatus.VERIFYING)
    this.emit('start')

    if (this.sliderElement) {
      this.sliderElement.classList.add('ldesign-captcha-rotate-dragging')
    }
  }

  /**
   * 处理线性滑块拖拽开始
   */
  private handleLinearDragStart(event: MouseEvent | TouchEvent): void {
    if (this._config.disabled || this._status !== CaptchaStatus.READY) {
      return
    }

    event.preventDefault()
    this.isDragging = true
    this.startTime = Date.now()

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    this.dragStartPosition.x = clientX
    this.sliderStartAngle = this.currentAngle

    this.setStatus(CaptchaStatus.VERIFYING)
    this.emit('start')

    if (this.sliderElement) {
      this.sliderElement.classList.add('ldesign-captcha-rotate-dragging')
    }
  }

  /**
   * 处理圆形滑块拖拽移动
   */
  private handleCircularDragMove = debounce((event: MouseEvent | TouchEvent): void => {
    if (!this.isDragging || !this.sliderElement) {
      return
    }

    event.preventDefault()

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY

    // 计算相对于滑块中心的角度
    const rect = this.sliderElement.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const angle = Math.atan2(clientY - centerY, clientX - centerX)
    const degrees = normalizeAngle(angle * 180 / Math.PI + 90)

    this.currentAngle = degrees
    this.updateSliderPosition()
    this.drawImage()

    this.emit('progress', { angle: this.currentAngle, target: this.targetAngle })
  }, 16)

  /**
   * 处理线性滑块拖拽移动
   */
  private handleLinearDragMove = debounce((event: MouseEvent | TouchEvent): void => {
    if (!this.isDragging) {
      return
    }

    event.preventDefault()

    const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
    const deltaX = clientX - this.dragStartPosition.x

    // 将水平移动转换为角度变化
    const sensitivity = 0.5
    const angleChange = deltaX * sensitivity
    
    this.currentAngle = normalizeAngle(this.sliderStartAngle + angleChange)
    this.updateSliderPosition()
    this.drawImage()

    this.emit('progress', { angle: this.currentAngle, target: this.targetAngle })
  }, 16)

  /**
   * 更新滑块位置
   */
  private updateSliderPosition(): void {
    if (!this.sliderElement) return

    if (this.sliderStyle === 'circular') {
      const rotation = this.currentAngle - 90 // 调整起始位置
      this.sliderElement.style.transform = `rotate(${rotation}deg)`
    } else {
      const track = this.sliderElement.parentElement!
      const trackWidth = track.offsetWidth - this.sliderElement.offsetWidth
      const progress = this.currentAngle / 360
      this.sliderElement.style.left = `${progress * trackWidth}px`
    }
  }

  /**
   * 处理拖拽结束
   */
  private handleDragEnd(): void {
    if (!this.isDragging) {
      return
    }

    this.isDragging = false

    if (this.sliderElement) {
      this.sliderElement.classList.remove('ldesign-captcha-rotate-dragging')
    }

    // 验证角度
    this.verifyAngle()
  }

  /**
   * 验证角度
   */
  private verifyAngle(): void {
    const tolerance = this._config.tolerance || 5
    const difference = Math.abs(angleDifference(this.currentAngle, this.targetAngle))

    if (difference <= tolerance) {
      // 验证成功
      this.handleSuccess({
        currentAngle: this.currentAngle,
        targetAngle: this.targetAngle,
        difference,
        tolerance
      })
    } else {
      // 验证失败
      this.handleFail(`角度偏差过大（${difference.toFixed(1)}°），请重试`)
    }
  }

  /**
   * 开始验证
   */
  start(): void {
    if (this._status === CaptchaStatus.READY) {
      this.generateRotation()
      this.drawImage()
      this.updateSliderPosition()
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
    
    this.generateRotation()
    this.drawImage()
    this.updateSliderPosition()

    if (this.sliderElement) {
      this.sliderElement.classList.remove('ldesign-captcha-rotate-dragging')
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
        this.sliderElement.removeEventListener('touchstart', this.handleCircularDragStart.bind(this))
        this.sliderElement.removeEventListener('touchstart', this.handleLinearDragStart.bind(this))
        document.removeEventListener('touchmove', this.handleCircularDragMove)
        document.removeEventListener('touchmove', this.handleLinearDragMove)
        document.removeEventListener('touchend', this.handleDragEnd.bind(this))
      } else {
        this.sliderElement.removeEventListener('mousedown', this.handleCircularDragStart.bind(this))
        this.sliderElement.removeEventListener('mousedown', this.handleLinearDragStart.bind(this))
        document.removeEventListener('mousemove', this.handleCircularDragMove)
        document.removeEventListener('mousemove', this.handleLinearDragMove)
        document.removeEventListener('mouseup', this.handleDragEnd.bind(this))
      }
    }

    // 清理引用
    this.backgroundImage = null
    this.imageCanvas = null
    this.sliderElement = null

    super.destroy()
  }
}
