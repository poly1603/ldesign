/**
 * 按顺序点击文字验证码
 * 用户需要按指定顺序点击文字完成验证
 */

import { BaseCaptcha } from '../core/base-captcha'
import {
  CaptchaType,
  CaptchaStatus,
  CaptchaResult,
  ClickTextConfig,
  Point
} from '../types'
import {
  random,
  shuffle,
  randomString,
  isPointInRect,
  getRelativePosition
} from '../utils'

interface TextItem {
  /** 文字内容 */
  text: string
  /** 位置 */
  position: Point
  /** 尺寸 */
  size: { width: number; height: number }
  /** 是否为目标文字 */
  isTarget: boolean
  /** 目标顺序（如果是目标文字） */
  targetOrder?: number
  /** 是否已点击 */
  clicked: boolean
  /** 点击顺序 */
  clickOrder?: number
}

export class ClickTextCaptcha extends BaseCaptcha {
  public readonly type = CaptchaType.CLICK_TEXT

  /** 点击文字配置 */
  protected declare _config: ClickTextConfig

  /** 画布元素 */
  private canvas: HTMLCanvasElement | null = null

  /** 画布上下文 */
  private ctx: CanvasRenderingContext2D | null = null

  /** 文字项目列表 */
  private textItems: TextItem[] = []

  /** 目标文字列表 */
  private targetTexts: string[] = []

  /** 当前点击顺序 */
  private currentClickOrder: number = 0

  /** 点击历史 */
  private clickHistory: number[] = []

  /** 提示元素 */
  private hintElement: HTMLElement | null = null

  constructor(config: ClickTextConfig) {
    super(config)
  }

  /**
   * 合并配置
   */
  protected mergeConfig(config: ClickTextConfig): ClickTextConfig {
    const defaultConfig: Partial<ClickTextConfig> = {
      ...super.mergeConfig(config),
      textCount: 4,
      fontSize: 24,
      distractorCount: 6,
      texts: ['春', '夏', '秋', '冬', '东', '南', '西', '北', '上', '下', '左', '右']
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

      // 生成文字
      this.generateTexts()

      // 绘制文字
      this.drawTexts()

      // 绑定事件
      this.bindEvents()

      // 添加到容器
      container.appendChild(this.rootElement)

      this.setStatus(CaptchaStatus.READY)
      this.emit('init')

      if (this._config.debug) {
        console.log('[ClickTextCaptcha] 初始化完成')
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
          请按顺序点击：<span class="ldesign-captcha-hint-text"></span>
        </div>
        <div class="ldesign-captcha-canvas-container">
          <canvas class="ldesign-captcha-text-canvas"></canvas>
        </div>
        <div class="ldesign-captcha-progress">
          <div class="ldesign-captcha-progress-bar"></div>
        </div>
      </div>
    `

    // 获取元素引用
    this.canvas = this.rootElement.querySelector('.ldesign-captcha-text-canvas') as HTMLCanvasElement
    this.hintElement = this.rootElement.querySelector('.ldesign-captcha-hint-text') as HTMLElement

    // 设置画布尺寸
    if (this.canvas) {
      const canvasWidth = this._config.width! - 20
      const canvasHeight = this._config.height! - 80 // 留出提示和进度条空间

      this.canvas.width = canvasWidth
      this.canvas.height = canvasHeight
      this.canvas.style.width = `${canvasWidth}px`
      this.canvas.style.height = `${canvasHeight}px`

      this.ctx = this.canvas.getContext('2d')!
    }
  }

  /**
   * 生成文字
   */
  private generateTexts(): void {
    if (!this.canvas || !this._config.texts) return

    this.textItems = []
    this.targetTexts = []
    this.currentClickOrder = 0
    this.clickHistory = []

    const textCount = this._config.textCount || 4
    const distractorCount = this._config.distractorCount || 6
    const totalCount = textCount + distractorCount

    // 选择目标文字
    const availableTexts = [...this._config.texts]
    for (let i = 0; i < textCount; i++) {
      const randomIndex = random(0, availableTexts.length - 1)
      this.targetTexts.push(availableTexts[randomIndex])
      availableTexts.splice(randomIndex, 1)
    }

    // 生成干扰文字
    const distractorTexts: string[] = []
    for (let i = 0; i < distractorCount; i++) {
      if (availableTexts.length > 0) {
        const randomIndex = random(0, availableTexts.length - 1)
        distractorTexts.push(availableTexts[randomIndex])
        availableTexts.splice(randomIndex, 1)
      } else {
        // 如果可用文字不够，生成随机文字
        distractorTexts.push(randomString(1, '零一二三四五六七八九十'))
      }
    }

    // 合并所有文字并打乱
    const allTexts = [
      ...this.targetTexts.map((text, index) => ({ text, isTarget: true, targetOrder: index })),
      ...distractorTexts.map(text => ({ text, isTarget: false, targetOrder: undefined }))
    ]
    const shuffledTexts = shuffle(allTexts)

    // 生成文字位置
    const fontSize = this._config.fontSize || 24
    const padding = 20
    const minDistance = fontSize * 2

    for (let i = 0; i < shuffledTexts.length; i++) {
      const item = shuffledTexts[i]
      let position: Point
      let attempts = 0
      const maxAttempts = 100

      // 尝试找到不重叠的位置
      do {
        position = {
          x: random(padding, this.canvas.width - fontSize - padding),
          y: random(fontSize + padding, this.canvas.height - padding)
        }
        attempts++
      } while (attempts < maxAttempts && this.isPositionTooClose(position, minDistance))

      this.textItems.push({
        text: item.text,
        position,
        size: { width: fontSize, height: fontSize },
        isTarget: item.isTarget,
        targetOrder: item.targetOrder,
        clicked: false
      })
    }

    // 更新提示文字
    if (this.hintElement) {
      this.hintElement.textContent = this.targetTexts.join(' → ')
    }
  }

  /**
   * 检查位置是否太近
   */
  private isPositionTooClose(position: Point, minDistance: number): boolean {
    return this.textItems.some(item => {
      const distance = Math.sqrt(
        Math.pow(position.x - item.position.x, 2) +
        Math.pow(position.y - item.position.y, 2)
      )
      return distance < minDistance
    })
  }

  /**
   * 绘制文字
   */
  private drawTexts(): void {
    if (!this.ctx || !this.canvas) return

    // 清空画布
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    // 设置字体
    const fontSize = this._config.fontSize || 24
    this.ctx.font = `${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'

    // 绘制每个文字
    this.textItems.forEach((item, index) => {
      const { text, position, isTarget, clicked, clickOrder } = item

      // 设置样式
      if (clicked) {
        if (isTarget && clickOrder !== undefined) {
          // 正确点击的目标文字
          this.ctx.fillStyle = '#52c41a'
          this.ctx.strokeStyle = '#52c41a'
        } else {
          // 错误点击的文字
          this.ctx.fillStyle = '#ff4d4f'
          this.ctx.strokeStyle = '#ff4d4f'
        }
      } else if (isTarget) {
        // 未点击的目标文字
        this.ctx.fillStyle = '#1890ff'
        this.ctx.strokeStyle = '#1890ff'
      } else {
        // 干扰文字
        this.ctx.fillStyle = '#666666'
        this.ctx.strokeStyle = '#666666'
      }

      // 绘制背景圆圈
      this.ctx.beginPath()
      this.ctx.arc(position.x + fontSize / 2, position.y, fontSize / 2 + 5, 0, Math.PI * 2)
      this.ctx.lineWidth = 2
      this.ctx.stroke()

      if (clicked) {
        this.ctx.fill()
        this.ctx.fillStyle = '#ffffff'
      }

      // 绘制文字
      this.ctx.fillText(text, position.x + fontSize / 2, position.y)

      // 绘制点击顺序
      if (clicked && clickOrder !== undefined) {
        this.ctx.save()
        this.ctx.fillStyle = '#ffffff'
        this.ctx.font = `${fontSize * 0.6}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
        this.ctx.fillText(
          (clickOrder + 1).toString(),
          position.x + fontSize / 2,
          position.y + fontSize / 2 + 8
        )
        this.ctx.restore()
      }
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

    if (this.currentClickOrder === 0) {
      this.startTime = Date.now()
      this.setStatus(CaptchaStatus.VERIFYING)
      this.emit('start')
    }

    const position = getRelativePosition(event, this.canvas!)
    const clickedItem = this.findClickedText(position)

    if (clickedItem && !clickedItem.clicked) {
      this.handleTextClick(clickedItem)
    }
  }

  /**
   * 查找被点击的文字
   */
  private findClickedText(position: Point): TextItem | null {
    const fontSize = this._config.fontSize || 24
    const clickRadius = fontSize / 2 + 10

    return this.textItems.find(item => {
      const distance = Math.sqrt(
        Math.pow(position.x - (item.position.x + fontSize / 2), 2) +
        Math.pow(position.y - item.position.y, 2)
      )
      return distance <= clickRadius
    }) || null
  }

  /**
   * 处理文字点击
   */
  private handleTextClick(item: TextItem): void {
    item.clicked = true
    item.clickOrder = this.currentClickOrder
    this.clickHistory.push(this.textItems.indexOf(item))

    // 检查是否为正确的目标文字
    const expectedText = this.targetTexts[this.currentClickOrder]
    const isCorrect = item.isTarget && item.text === expectedText

    if (isCorrect) {
      this.currentClickOrder++
      this.updateProgress()

      // 检查是否完成
      if (this.currentClickOrder >= this.targetTexts.length) {
        this.handleSuccess({
          clickHistory: this.clickHistory,
          targetTexts: this.targetTexts,
          correctOrder: true
        })
      }
    } else {
      // 点击错误，验证失败
      this.handleFail('点击顺序错误，请重试')
    }

    // 重绘文字
    this.drawTexts()

    this.emit('progress', {
      currentOrder: this.currentClickOrder,
      totalCount: this.targetTexts.length,
      clickHistory: this.clickHistory,
      isCorrect
    })
  }

  /**
   * 更新进度条
   */
  private updateProgress(): void {
    if (!this.rootElement) return

    const progressBar = this.rootElement.querySelector('.ldesign-captcha-progress-bar') as HTMLElement
    if (progressBar) {
      const progress = (this.currentClickOrder / this.targetTexts.length) * 100
      progressBar.style.width = `${progress}%`
    }
  }

  /**
   * 开始验证
   */
  start(): void {
    if (this._status === CaptchaStatus.READY) {
      this.generateTexts()
      this.drawTexts()
      this.updateProgress()
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

    this.generateTexts()
    this.drawTexts()
    this.updateProgress()
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
    this.canvas = null
    this.ctx = null
    this.hintElement = null
    this.textItems = []
    this.targetTexts = []

    super.destroy()
  }
}
