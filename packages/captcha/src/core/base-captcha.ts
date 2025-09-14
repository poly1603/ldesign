/**
 * 基础验证码类
 * 所有验证码类型的基类，提供通用功能和接口
 */

import { EventEmitter } from './event-emitter'
import {
  CaptchaType,
  CaptchaStatus,
  type ICaptcha,
  type BaseCaptchaConfig,
  type CaptchaResult,
  type CaptchaError,
  type CaptchaEventType,
  type CaptchaEventListener,
  type ThemeConfig
} from '../types'

export abstract class BaseCaptcha extends EventEmitter implements ICaptcha {
  /** 验证码类型 */
  public abstract readonly type: CaptchaType

  /** 当前状态 */
  protected _status: CaptchaStatus = CaptchaStatus.UNINITIALIZED

  /** 配置信息 */
  protected _config: BaseCaptchaConfig

  /** 容器元素 */
  protected container: HTMLElement | null = null

  /** 根元素 */
  protected rootElement: HTMLElement | null = null

  /** 开始时间戳 */
  protected startTime: number = 0

  /** 是否已销毁 */
  protected destroyed: boolean = false

  constructor(config: BaseCaptchaConfig) {
    super(config.debug || false)
    this._config = this.mergeConfig(config)
    this.validateConfig()
  }

  /** 获取当前状态 */
  get status(): CaptchaStatus {
    return this._status
  }

  /** 获取配置信息 */
  get config(): BaseCaptchaConfig {
    return { ...this._config }
  }

  /**
   * 合并配置
   * @param config 用户配置
   * @returns 合并后的配置
   */
  protected mergeConfig(config: BaseCaptchaConfig): BaseCaptchaConfig {
    const defaultConfig: Partial<BaseCaptchaConfig> = {
      width: 320,
      height: 180,
      debug: false,
      language: 'zh-CN',
      disabled: false,
      theme: this.getDefaultTheme()
    }

    return { ...defaultConfig, ...config }
  }

  /**
   * 获取默认主题配置
   * @returns 默认主题配置
   */
  protected getDefaultTheme(): ThemeConfig {
    return {
      primaryColor: 'var(--ldesign-brand-color)',
      borderColor: 'var(--ldesign-border-color)',
      backgroundColor: 'var(--ldesign-bg-color-container)',
      textColor: 'var(--ldesign-text-color-primary)',
      borderRadius: 'var(--ls-border-radius-base)',
      boxShadow: 'var(--ldesign-shadow-1)',
      successColor: 'var(--ldesign-success-color)',
      errorColor: 'var(--ldesign-error-color)',
      warningColor: 'var(--ldesign-warning-color)'
    }
  }

  /**
   * 验证配置
   */
  protected validateConfig(): void {
    if (!this._config.container) {
      throw new Error('容器配置不能为空')
    }

    if (this._config.width && this._config.width <= 0) {
      throw new Error('宽度必须大于0')
    }

    if (this._config.height && this._config.height <= 0) {
      throw new Error('高度必须大于0')
    }
  }

  /**
   * 设置状态
   * @param status 新状态
   */
  protected setStatus(status: CaptchaStatus): void {
    if (this._status === status) {
      return
    }

    const oldStatus = this._status
    this._status = status

    this.emit('statusChange', { oldStatus, newStatus: status })

    if (this._config.onStatusChange) {
      this._config.onStatusChange(status)
    }

    if (this._config.debug) {
      console.log(`[${this.type}] 状态变化: ${oldStatus} -> ${status}`)
    }
  }

  /**
   * 获取容器元素
   * @returns 容器元素
   */
  protected getContainer(): HTMLElement {
    if (this.container) {
      return this.container
    }

    const { container } = this._config

    if (typeof container === 'string') {
      const element = document.querySelector(container) as HTMLElement
      if (!element) {
        throw new Error(`找不到容器元素: ${container}`)
      }
      this.container = element
    } else {
      this.container = container
    }

    return this.container
  }

  /**
   * 创建根元素
   * @returns 根元素
   */
  protected createRootElement(): HTMLElement {
    const root = document.createElement('div')
    root.className = `ldesign-captcha ldesign-captcha-${this.type}`

    if (this._config.className) {
      root.className += ` ${this._config.className}`
    }

    if (this._config.disabled) {
      root.className += ' ldesign-captcha-disabled'
    }

    // 设置样式
    root.style.width = `${this._config.width}px`
    root.style.height = `${this._config.height}px`

    // 应用主题
    this.applyTheme(root)

    return root
  }

  /**
   * 应用主题
   * @param element 目标元素
   */
  protected applyTheme(element: HTMLElement): void {
    const theme = this._config.theme
    if (!theme) {
      return
    }

    Object.entries(theme).forEach(([key, value]) => {
      if (value) {
        element.style.setProperty(`--captcha-${key}`, value)
      }
    })
  }

  /**
   * 处理成功结果
   * @param data 验证数据
   */
  protected handleSuccess(data: any): void {
    const duration = Date.now() - this.startTime
    const result: CaptchaResult = {
      type: this.type,
      success: true,
      data,
      timestamp: Date.now(),
      duration,
      token: this.generateToken()
    }

    this.setStatus(CaptchaStatus.SUCCESS)
    this.emit('success', result)

    if (this._config.onSuccess) {
      this._config.onSuccess(result)
    }
  }

  /**
   * 处理失败结果
   * @param error 错误信息
   */
  protected handleFail(error: string | CaptchaError): void {
    const captchaError: CaptchaError = typeof error === 'string'
      ? {
        code: 'VERIFICATION_FAILED',
        message: error,
        timestamp: Date.now()
      }
      : error

    this.setStatus(CaptchaStatus.FAILED)
    this.emit('fail', captchaError)

    if (this._config.onFail) {
      this._config.onFail(captchaError)
    }
  }

  /**
   * 生成验证令牌
   * @returns 验证令牌
   */
  protected generateToken(): string {
    return `${this.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 抽象方法，子类必须实现
  abstract init(): Promise<void>
  abstract start(): void
  abstract verify(data: any): Promise<CaptchaResult>

  /**
   * 重置验证码
   */
  reset(): void {
    if (this.destroyed) {
      return
    }

    this.setStatus(CaptchaStatus.READY)
    this.startTime = 0
    this.emit('reset')

    if (this._config.debug) {
      console.log(`[${this.type}] 验证码已重置`)
    }
  }

  /**
   * 重试验证
   */
  retry(): void {
    if (this.destroyed) {
      return
    }

    this.reset()
    this.emit('retry')

    if (this._config.onRetry) {
      this._config.onRetry()
    }

    if (this._config.debug) {
      console.log(`[${this.type}] 开始重试`)
    }
  }

  /**
   * 销毁验证码
   */
  destroy(): void {
    if (this.destroyed) {
      return
    }

    this.destroyed = true
    this.setStatus(CaptchaStatus.UNINITIALIZED)

    // 移除DOM元素
    if (this.rootElement && this.rootElement.parentNode) {
      this.rootElement.parentNode.removeChild(this.rootElement)
    }

    // 清理引用
    this.container = null
    this.rootElement = null

    // 销毁事件发射器
    super.destroy()

    this.emit('destroy')

    if (this._config.debug) {
      console.log(`[${this.type}] 验证码已销毁`)
    }
  }
}
