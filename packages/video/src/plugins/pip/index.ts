/**
 * 画中画插件
 * 实现画中画模式的增强功能
 */

import { ControlPlugin } from '../../core/base-plugin'
import { createElement, addClass, removeClass } from '../../utils/dom'
import type { PluginContext, PluginMetadata } from '../../types/plugin'
import type { PlayerEvent } from '../../types/player'

/**
 * 画中画插件配置选项
 */
export interface PipOptions {
  /** 是否启用画中画功能 */
  enabled?: boolean
  /** 是否显示画中画按钮 */
  showButton?: boolean
  /** 画中画窗口尺寸 */
  size?: {
    width?: number
    height?: number
  }
  /** 画中画位置 */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /** 是否自动进入画中画 */
  autoEnter?: boolean
  /** 自动进入的触发条件 */
  autoEnterTrigger?: 'scroll' | 'visibility' | 'focus'
  /** 画中画控制选项 */
  controls?: {
    /** 是否显示播放/暂停按钮 */
    playPause?: boolean
    /** 是否显示跳过按钮 */
    skip?: boolean
    /** 是否显示音量控制 */
    volume?: boolean
  }
  /** 快捷键 */
  hotkey?: string
}

/**
 * 画中画配置
 */
export interface PipConfig extends PipOptions {
  container: HTMLElement
  videoElement: HTMLVideoElement
}

/**
 * 画中画插件实现
 */
export class PipPlugin extends ControlPlugin {
  private _config: PipConfig
  private _isSupported = false
  private _isActive = false
  private _observer?: IntersectionObserver
  private _scrollHandler?: () => void

  constructor(options: PipOptions = {}) {
    const metadata: PluginMetadata = {
      name: 'pip',
      version: '1.0.0',
      description: '画中画插件，提供增强的画中画功能',
      author: 'LDesign Team',
      dependencies: []
    }

    super(metadata, options)

    this._config = this.createConfig(options)
    this._isSupported = this.checkSupport()
  }

  /**
   * 画中画配置
   */
  get config(): PipConfig {
    return { ...this._config }
  }

  /**
   * 是否支持画中画
   */
  get isSupported(): boolean {
    return this._isSupported
  }

  /**
   * 是否处于画中画模式
   */
  get isActive(): boolean {
    return this._isActive
  }

  /**
   * 进入画中画模式
   */
  async enter(): Promise<void> {
    if (!this._isSupported) {
      throw new Error('Picture-in-Picture is not supported')
    }

    if (this._isActive) {
      return // 已经在画中画模式
    }

    try {
      await this._config.videoElement.requestPictureInPicture()
    } catch (error) {
      this.emit('pipError', { error, action: 'enter' })
      throw error
    }
  }

  /**
   * 退出画中画模式
   */
  async exit(): Promise<void> {
    if (!this._isSupported || !this._isActive) {
      return
    }

    try {
      await document.exitPictureInPicture()
    } catch (error) {
      this.emit('pipError', { error, action: 'exit' })
      throw error
    }
  }

  /**
   * 切换画中画模式
   */
  async toggle(): Promise<void> {
    if (this._isActive) {
      await this.exit()
    } else {
      await this.enter()
    }
  }

  /**
   * 设置画中画窗口尺寸
   */
  setSize(width: number, height: number): void {
    this._config.size = { width, height }

    // 如果当前在画中画模式，需要重新进入以应用新尺寸
    // 但要避免无限循环，添加防护
    if (this._isActive && this._config.videoElement) {
      // 使用异步方式避免阻塞
      Promise.resolve().then(async () => {
        try {
          await this.exit()
          // 等待一小段时间确保退出完成
          await new Promise(resolve => setTimeout(resolve, 50))
          await this.enter()
        } catch (error) {
          console.error('Failed to resize PiP window:', error)
        }
      })
    }

    this.emit('sizeChanged', { size: this._config.size })
  }

  /**
   * 启用自动画中画
   */
  enableAutoEnter(): void {
    if (!this._config.autoEnter) {
      this._config.autoEnter = true
      this.setupAutoEnter()
    }
  }

  /**
   * 禁用自动画中画
   */
  disableAutoEnter(): void {
    if (this._config.autoEnter) {
      this._config.autoEnter = false
      this.cleanupAutoEnter()
    }
  }

  protected createButton(): HTMLElement {
    const button = createElement('button', {
      className: 'lv-controls__button lv-controls__pip-button',
      attributes: {
        'aria-label': '画中画',
        'type': 'button',
        'title': '画中画'
      },
      innerHTML: `
        <svg class="lv-icon lv-icon--pip" viewBox="0 0 24 24">
          <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
        </svg>
        <svg class="lv-icon lv-icon--pip-exit" viewBox="0 0 24 24">
          <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/>
          <path d="M14 14h2v2h-2z"/>
        </svg>
      `
    })

    // 如果不支持画中画，禁用按钮
    if (!this._isSupported) {
      button.disabled = true
      button.title = '浏览器不支持画中画功能'
    } else {
      // 绑定点击事件
      button.addEventListener('click', async () => {
        try {
          await this.toggle()
        } catch (error) {
          console.error('PiP toggle failed:', error)
        }
      })
    }

    return button
  }

  protected createElement(): HTMLElement {
    // 画中画插件不需要额外的UI元素
    return createElement('div', {
      className: 'lv-pip-plugin',
      styles: { display: 'none' }
    })
  }

  protected async onInstall(context: PluginContext): Promise<void> {
    await super.onInstall(context)

    this._config.container = context.player.container
    this._config.videoElement = context.player.videoElement

    // 绑定画中画事件
    this.bindPipEvents()

    // 绑定快捷键
    if (this._config.hotkey) {
      this.bindHotkey(context)
    }

    // 设置自动画中画
    if (this._config.autoEnter) {
      this.setupAutoEnter()
    }
  }

  protected async onUninstall(context: PluginContext): Promise<void> {
    // 清理自动画中画
    this.cleanupAutoEnter()

    // 解绑快捷键
    if (this._config.hotkey) {
      this.unbindHotkey(context)
    }

    // 解绑画中画事件
    this.unbindPipEvents()

    // 如果当前在画中画模式，退出
    if (this._isActive) {
      try {
        await this.exit()
      } catch (error) {
        console.error('Failed to exit PiP during uninstall:', error)
      }
    }

    await super.onUninstall(context)
  }

  /**
   * 创建配置对象
   */
  private createConfig(options: PipOptions): PipConfig {
    return {
      enabled: true,
      showButton: true,
      position: 'bottom-right',
      autoEnter: false,
      autoEnterTrigger: 'scroll',
      controls: {
        playPause: true,
        skip: false,
        volume: true
      },
      hotkey: 'KeyP',
      ...options,
      container: null as any,
      videoElement: null as any
    }
  }

  /**
   * 检查浏览器支持
   */
  private checkSupport(): boolean {
    return 'pictureInPictureEnabled' in document &&
      document.pictureInPictureEnabled &&
      'requestPictureInPicture' in HTMLVideoElement.prototype
  }

  /**
   * 绑定画中画事件
   */
  private bindPipEvents(): void {
    const video = this._config.videoElement

    const handleEnterPip = () => {
      this._isActive = true
      addClass(this._button!, 'lv-controls__button--pip-active')
      this.emit('pipEnter')
    }

    const handleLeavePip = () => {
      this._isActive = false
      removeClass(this._button!, 'lv-controls__button--pip-active')
      this.emit('pipLeave')
    }

    video.addEventListener('enterpictureinpicture', handleEnterPip)
    video.addEventListener('leavepictureinpicture', handleLeavePip)

      // 保存引用以便后续解绑
      ; (this as any)._pipHandlers = { handleEnterPip, handleLeavePip }
  }

  /**
   * 解绑画中画事件
   */
  private unbindPipEvents(): void {
    const handlers = (this as any)._pipHandlers
    if (handlers) {
      const video = this._config.videoElement
      video.removeEventListener('enterpictureinpicture', handlers.handleEnterPip)
      video.removeEventListener('leavepictureinpicture', handlers.handleLeavePip)
      delete (this as any)._pipHandlers
    }
  }

  /**
   * 设置自动画中画
   */
  private setupAutoEnter(): void {
    const trigger = this._config.autoEnterTrigger

    switch (trigger) {
      case 'scroll':
        this.setupScrollTrigger()
        break
      case 'visibility':
        this.setupVisibilityTrigger()
        break
      case 'focus':
        this.setupFocusTrigger()
        break
    }
  }

  /**
   * 清理自动画中画
   */
  private cleanupAutoEnter(): void {
    // 清理滚动监听
    if (this._scrollHandler) {
      window.removeEventListener('scroll', this._scrollHandler)
      this._scrollHandler = undefined
    }

    // 清理可见性监听
    if (this._observer) {
      this._observer.disconnect()
      this._observer = undefined
    }

    // 清理焦点监听
    const focusHandler = (this as any)._focusHandler
    if (focusHandler) {
      window.removeEventListener('blur', focusHandler)
      delete (this as any)._focusHandler
    }
  }

  /**
   * 设置滚动触发
   */
  private setupScrollTrigger(): void {
    let isProcessing = false // 防止重复触发

    this._scrollHandler = () => {
      if (isProcessing) return

      const container = this._config.container
      if (!container) return

      const rect = container.getBoundingClientRect()
      const isVisible = rect.bottom > 0 && rect.top < window.innerHeight

      if (!isVisible && !this._isActive) {
        isProcessing = true
        this.enter().catch(console.error).finally(() => {
          isProcessing = false
        })
      } else if (isVisible && this._isActive) {
        isProcessing = true
        this.exit().catch(console.error).finally(() => {
          isProcessing = false
        })
      }
    }

    window.addEventListener('scroll', this._scrollHandler, { passive: true })
  }

  /**
   * 设置可见性触发
   */
  private setupVisibilityTrigger(): void {
    let isProcessing = false // 防止重复触发

    this._observer = new IntersectionObserver((entries) => {
      if (isProcessing) return

      const entry = entries[0]
      if (!entry) return

      if (!entry.isIntersecting && !this._isActive) {
        isProcessing = true
        this.enter().catch(console.error).finally(() => {
          isProcessing = false
        })
      } else if (entry.isIntersecting && this._isActive) {
        isProcessing = true
        this.exit().catch(console.error).finally(() => {
          isProcessing = false
        })
      }
    }, {
      threshold: 0.5
    })

    if (this._config.container) {
      this._observer.observe(this._config.container)
    }
  }

  /**
   * 设置焦点触发
   */
  private setupFocusTrigger(): void {
    let isProcessing = false // 防止重复触发

    const handleBlur = () => {
      if (isProcessing || this._isActive) return

      isProcessing = true
      this.enter().catch(console.error).finally(() => {
        isProcessing = false
      })
    }

    window.addEventListener('blur', handleBlur)
      ; (this as any)._focusHandler = handleBlur
  }

  /**
   * 绑定快捷键
   */
  private bindHotkey(context: PluginContext): void {
    const handleKeydown = async (event: KeyboardEvent) => {
      if (event.code === this._config.hotkey && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        try {
          await this.toggle()
        } catch (error) {
          console.error('PiP hotkey failed:', error)
        }
      }
    }

    context.player.container.addEventListener('keydown', handleKeydown)

      // 保存引用以便后续解绑
      ; (this as any)._hotkeyHandler = handleKeydown
  }

  /**
   * 解绑快捷键
   */
  private unbindHotkey(context: PluginContext): void {
    const handler = (this as any)._hotkeyHandler
    if (handler) {
      context.player.container.removeEventListener('keydown', handler)
      delete (this as any)._hotkeyHandler
    }
  }
}
