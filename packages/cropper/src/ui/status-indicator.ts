/**
 * @file 状态指示器组件
 * @description 显示裁剪器的各种状态信息
 */

import { BaseComponent, type BaseComponentOptions } from './base-component'

/**
 * 状态类型
 */
export enum StatusType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  LOADING = 'loading',
}

/**
 * 状态指示器配置
 */
export interface StatusIndicatorOptions extends BaseComponentOptions {
  /** 状态类型 */
  type: StatusType
  /** 状态消息 */
  message: string
  /** 是否显示图标 */
  showIcon: boolean
  /** 自动隐藏时间（毫秒，0表示不自动隐藏） */
  autoHideDelay: number
  /** 是否可关闭 */
  closable: boolean
  /** 位置 */
  position: 'top' | 'bottom' | 'center'
}

/**
 * 状态指示器类
 */
export class StatusIndicator extends BaseComponent {
  /** 指示器配置 */
  private indicatorOptions: StatusIndicatorOptions

  /** 消息元素 */
  private messageElement: HTMLElement

  /** 图标元素 */
  private iconElement: HTMLElement | null = null

  /** 关闭按钮 */
  private closeButton: HTMLElement | null = null

  /** 自动隐藏定时器 */
  private autoHideTimer: number | null = null

  /** 默认配置 */
  private static readonly DEFAULT_STATUS_OPTIONS: StatusIndicatorOptions = {
    ...BaseComponent.DEFAULT_OPTIONS,
    type: StatusType.INFO,
    message: '',
    showIcon: true,
    autoHideDelay: 0,
    closable: false,
    position: 'top',
  }

  /** 状态图标映射 */
  private static readonly STATUS_ICONS = {
    [StatusType.INFO]: 'ℹ️',
    [StatusType.SUCCESS]: '✅',
    [StatusType.WARNING]: '⚠️',
    [StatusType.ERROR]: '❌',
    [StatusType.LOADING]: '⏳',
  }

  /**
   * 构造函数
   * @param options 指示器配置
   */
  constructor(options: Partial<StatusIndicatorOptions> = {}) {
    // 设置StatusIndicator特定的配置
    const mergedOptions = { ...StatusIndicator.DEFAULT_STATUS_OPTIONS, ...options }

    // 初始化基础组件
    super('div', mergedOptions)
    this.indicatorOptions = mergedOptions

    // 创建消息元素
    this.messageElement = document.createElement('span')

    // 现在可以安全地初始化
    this.initialize()
  }

  /**
   * 获取组件名称
   */
  protected getComponentName(): string {
    return 'status-indicator'
  }

  /**
   * 渲染组件
   */
  protected render(): void {
    this.element.innerHTML = ''

    // 设置基础样式
    this.setupBaseStyles()

    // 渲染图标
    if (this.indicatorOptions.showIcon) {
      this.renderIcon()
    }

    // 渲染消息
    this.renderMessage()

    // 渲染关闭按钮
    if (this.indicatorOptions.closable) {
      this.renderCloseButton()
    }

    // 设置自动隐藏
    this.setupAutoHide()
  }

  /**
   * 设置基础样式
   */
  private setupBaseStyles(): void {
    const { type, position } = this.indicatorOptions

    // 基础样式
    this.element.style.display = 'flex'
    this.element.style.alignItems = 'center'
    this.element.style.gap = 'var(--ls-spacing-xs)'
    this.element.style.padding = 'var(--ls-padding-sm) var(--ls-padding-base)'
    this.element.style.borderRadius = 'var(--ls-border-radius-base)'
    this.element.style.fontSize = 'var(--ls-font-size-sm)'
    this.element.style.fontWeight = '500'
    this.element.style.boxShadow = 'var(--ldesign-shadow-1)'
    this.element.style.transition = 'all 0.3s ease-in-out'
    this.element.style.zIndex = '100'

    // 位置样式
    this.element.style.position = 'absolute'
    switch (position) {
      case 'top':
        this.element.style.top = 'var(--ls-spacing-base)'
        this.element.style.left = '50%'
        this.element.style.transform = 'translateX(-50%)'
        break
      case 'bottom':
        this.element.style.bottom = 'var(--ls-spacing-base)'
        this.element.style.left = '50%'
        this.element.style.transform = 'translateX(-50%)'
        break
      case 'center':
        this.element.style.top = '50%'
        this.element.style.left = '50%'
        this.element.style.transform = 'translate(-50%, -50%)'
        break
    }

    // 类型样式
    this.applyTypeStyles(type)
  }

  /**
   * 应用类型样式
   * @param type 状态类型
   */
  private applyTypeStyles(type: StatusType): void {
    this.element.className = `${this.getBaseClassName()} ${this.getBaseClassName()}--${type}`

    switch (type) {
      case StatusType.INFO:
        this.element.style.backgroundColor = 'var(--ldesign-brand-color-1)'
        this.element.style.color = 'var(--ldesign-brand-color-7)'
        this.element.style.border = '1px solid var(--ldesign-brand-color-3)'
        break
      case StatusType.SUCCESS:
        this.element.style.backgroundColor = 'var(--ldesign-success-color-1)'
        this.element.style.color = 'var(--ldesign-success-color-7)'
        this.element.style.border = '1px solid var(--ldesign-success-color-3)'
        break
      case StatusType.WARNING:
        this.element.style.backgroundColor = 'var(--ldesign-warning-color-1)'
        this.element.style.color = 'var(--ldesign-warning-color-7)'
        this.element.style.border = '1px solid var(--ldesign-warning-color-3)'
        break
      case StatusType.ERROR:
        this.element.style.backgroundColor = 'var(--ldesign-error-color-1)'
        this.element.style.color = 'var(--ldesign-error-color-7)'
        this.element.style.border = '1px solid var(--ldesign-error-color-3)'
        break
      case StatusType.LOADING:
        this.element.style.backgroundColor = 'var(--ldesign-bg-color-container)'
        this.element.style.color = 'var(--ldesign-text-color-primary)'
        this.element.style.border = '1px solid var(--ldesign-border-color)'
        break
    }
  }

  /**
   * 渲染图标
   */
  private renderIcon(): void {
    this.iconElement = document.createElement('span')
    this.iconElement.className = `${this.options.classPrefix}__status-icon`
    this.iconElement.style.fontSize = 'var(--ls-font-size-base)'
    this.iconElement.style.lineHeight = '1'

    const icon = StatusIndicator.STATUS_ICONS[this.indicatorOptions.type]
    this.iconElement.textContent = icon

    // 加载状态的旋转动画
    if (this.indicatorOptions.type === StatusType.LOADING) {
      this.iconElement.style.animation = 'spin 1s linear infinite'
    }

    this.element.appendChild(this.iconElement)
  }

  /**
   * 渲染消息
   */
  private renderMessage(): void {
    this.messageElement.className = `${this.options.classPrefix}__status-message`
    this.messageElement.style.flex = '1'
    this.messageElement.style.lineHeight = '1.4'
    this.messageElement.textContent = this.indicatorOptions.message

    this.element.appendChild(this.messageElement)
  }

  /**
   * 渲染关闭按钮
   */
  private renderCloseButton(): void {
    this.closeButton = document.createElement('button')
    this.closeButton.className = `${this.options.classPrefix}__status-close`
      ; (this.closeButton as HTMLButtonElement).type = 'button'
    this.closeButton.innerHTML = '×'
    this.closeButton.style.background = 'none'
    this.closeButton.style.border = 'none'
    this.closeButton.style.color = 'inherit'
    this.closeButton.style.fontSize = 'var(--ls-font-size-lg)'
    this.closeButton.style.lineHeight = '1'
    this.closeButton.style.cursor = 'pointer'
    this.closeButton.style.padding = '0'
    this.closeButton.style.marginLeft = 'var(--ls-spacing-xs)'
    this.closeButton.style.opacity = '0.7'
    this.closeButton.style.transition = 'opacity 0.2s ease-in-out'

    this.closeButton.addEventListener('mouseenter', () => {
      this.closeButton!.style.opacity = '1'
    })

    this.closeButton.addEventListener('mouseleave', () => {
      this.closeButton!.style.opacity = '0.7'
    })

    this.closeButton.addEventListener('click', () => {
      this.close()
    })

    this.element.appendChild(this.closeButton)
  }

  /**
   * 设置自动隐藏
   */
  private setupAutoHide(): void {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer)
      this.autoHideTimer = null
    }

    if (this.indicatorOptions.autoHideDelay > 0) {
      this.autoHideTimer = window.setTimeout(() => {
        this.close()
      }, this.indicatorOptions.autoHideDelay)
    }
  }

  /**
   * 设置状态
   * @param type 状态类型
   * @param message 状态消息
   */
  setStatus(type: StatusType, message: string): void {
    this.indicatorOptions.type = type
    this.indicatorOptions.message = message
    this.render()
  }

  /**
   * 设置消息
   * @param message 消息内容
   */
  setMessage(message: string): void {
    this.indicatorOptions.message = message
    if (this.messageElement) {
      this.messageElement.textContent = message
    }
  }

  /**
   * 显示信息状态
   * @param message 消息内容
   */
  showInfo(message: string): void {
    this.setStatus(StatusType.INFO, message)
    this.show()
  }

  /**
   * 显示成功状态
   * @param message 消息内容
   */
  showSuccess(message: string): void {
    this.setStatus(StatusType.SUCCESS, message)
    this.show()
  }

  /**
   * 显示警告状态
   * @param message 消息内容
   */
  showWarning(message: string): void {
    this.setStatus(StatusType.WARNING, message)
    this.show()
  }

  /**
   * 显示错误状态
   * @param message 消息内容
   */
  showError(message: string): void {
    this.setStatus(StatusType.ERROR, message)
    this.show()
  }

  /**
   * 显示加载状态
   * @param message 消息内容
   */
  showLoading(message: string): void {
    this.setStatus(StatusType.LOADING, message)
    this.show()
  }

  /**
   * 关闭指示器
   */
  close(): void {
    this.element.style.opacity = '0'
    this.element.style.transform += ' translateY(-10px)'

    setTimeout(() => {
      this.hide()
      this.emit('close' as any)
    }, 300)
  }

  /**
   * 更新指示器配置
   * @param options 新配置
   */
  updateIndicatorOptions(options: Partial<StatusIndicatorOptions>): void {
    this.indicatorOptions = { ...this.indicatorOptions, ...options }
    this.render()
  }

  /**
   * 创建状态指示器
   * @param container 容器元素
   * @param options 配置选项
   */
  static create(container: HTMLElement, options: Partial<StatusIndicatorOptions> = {}): StatusIndicator {
    const indicator = new StatusIndicator(options)
    container.appendChild(indicator.getElement())
    return indicator
  }

  /**
   * 显示临时消息
   * @param container 容器元素
   * @param type 状态类型
   * @param message 消息内容
   * @param duration 显示时长
   */
  static showMessage(
    container: HTMLElement,
    type: StatusType,
    message: string,
    duration = 3000
  ): StatusIndicator {
    const indicator = StatusIndicator.create(container, {
      type,
      message,
      autoHideDelay: duration,
      closable: true,
    })

    indicator.show()

    // 自动销毁
    indicator.on('close' as any, () => {
      setTimeout(() => {
        indicator.destroy()
      }, 100)
    })

    return indicator
  }
}
