/**
 * 消息管理器
 * 轻量级消息提示系统
 */

import { BaseManager } from '../core/base-manager'

export interface MessageOptions {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  title?: string
  content: string
  duration?: number
  position?: 'top' | 'center' | 'bottom'
  offset?: number
  showClose?: boolean
  html?: boolean
  customClass?: string
  zIndex?: number
  onClose?: () => void
  onClick?: () => void
  onLoad?: () => void
}

export interface MessageInstance {
  id: string
  options: MessageOptions
  element: HTMLElement
  timer?: number
  visible: boolean
  close: () => void
}

export interface MessageManagerConfig {
  maxCount?: number
  defaultDuration?: number
  defaultPosition?: 'top' | 'center' | 'bottom'
  defaultOffset?: number
  zIndex?: number
  gap?: number
}

export class MessageManager extends BaseManager<MessageManagerConfig> {
  private instances = new Map<string, MessageInstance>()
  private container?: HTMLElement
  private idCounter = 0

  constructor(config: MessageManagerConfig = {}) {
    super('MessageManager', {
      maxCount: 5,
      defaultDuration: 3000,
      defaultPosition: 'top',
      defaultOffset: 20,
      zIndex: 3000,
      gap: 16,
      ...config,
    })
  }

  /**
   * 初始化消息管理器
   */
  async initialize(): Promise<void> {
    this.log('info', 'Initializing message manager...')

    // 创建消息容器
    this.createContainer()

    this.log('info', 'Message manager initialized')
  }

  /**
   * 创建消息容器
   */
  private createContainer(): void {
    if (this.container) {
      return
    }

    this.container = document.createElement('div')
    this.container.className = 'engine-message-container'

    Object.assign(this.container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: this.config.zIndex?.toString(),
    })

    document.body.appendChild(this.container)
  }

  /**
   * 显示消息
   */
  show(options: MessageOptions): MessageInstance {
    const id = options.id || this.generateId()

    // 如果已存在相同ID的消息，先关闭它
    if (this.instances.has(id)) {
      this.close(id)
    }

    // 检查消息数量限制
    this.checkMaxCount()

    // 创建消息实例
    const instance = this.createInstance(id, options)

    // 添加到管理器
    this.instances.set(id, instance)

    // 显示消息
    this.showInstance(instance)

    this.log('info', `Message shown: ${id}`)
    return instance
  }

  /**
   * 显示成功消息
   */
  success(content: string, options?: Partial<MessageOptions>): MessageInstance {
    return this.show({
      type: 'success',
      content,
      ...options,
    })
  }

  /**
   * 显示错误消息
   */
  error(content: string, options?: Partial<MessageOptions>): MessageInstance {
    return this.show({
      type: 'error',
      content,
      duration: 0, // 错误消息默认不自动关闭
      ...options,
    })
  }

  /**
   * 显示警告消息
   */
  warning(content: string, options?: Partial<MessageOptions>): MessageInstance {
    return this.show({
      type: 'warning',
      content,
      ...options,
    })
  }

  /**
   * 显示信息消息
   */
  info(content: string, options?: Partial<MessageOptions>): MessageInstance {
    return this.show({
      type: 'info',
      content,
      ...options,
    })
  }

  /**
   * 显示加载消息
   */
  loading(content: string, options?: Partial<MessageOptions>): MessageInstance {
    return this.show({
      type: 'loading',
      content,
      duration: 0, // 加载消息默认不自动关闭
      showClose: false,
      ...options,
    })
  }

  /**
   * 关闭消息
   */
  close(id: string): boolean {
    const instance = this.instances.get(id)
    if (!instance) {
      return false
    }

    this.closeInstance(instance)
    return true
  }

  /**
   * 关闭所有消息
   */
  closeAll(): void {
    Array.from(this.instances.values()).forEach(instance => {
      this.closeInstance(instance)
    })
  }

  /**
   * 检查消息数量限制
   */
  private checkMaxCount(): void {
    const maxCount = this.config.maxCount!
    if (this.instances.size >= maxCount) {
      // 关闭最早的消息
      const firstInstance = this.instances.values().next().value
      if (firstInstance) {
        this.closeInstance(firstInstance)
      }
    }
  }

  /**
   * 生成消息ID
   */
  private generateId(): string {
    return `message_${++this.idCounter}_${Date.now()}`
  }

  /**
   * 创建消息实例
   */
  private createInstance(id: string, options: MessageOptions): MessageInstance {
    const mergedOptions: MessageOptions = {
      type: 'info',
      duration: this.config.defaultDuration,
      position: this.config.defaultPosition,
      offset: this.config.defaultOffset,
      showClose: true,
      html: false,
      ...options,
      id,
    }

    const element = this.createElement(mergedOptions)

    const instance: MessageInstance = {
      id,
      options: mergedOptions,
      element,
      visible: false,
      close: () => this.close(id),
    }

    return instance
  }

  /**
   * 创建消息元素
   */
  private createElement(options: MessageOptions): HTMLElement {
    const messageEl = document.createElement('div')
    messageEl.className = `engine-message engine-message-${options.type}`

    if (options.customClass) {
      messageEl.className += ` ${options.customClass}`
    }

    // 设置基础样式
    Object.assign(messageEl.style, {
      position: 'relative',
      display: 'flex',
      alignItems: 'flex-start',
      padding: '12px 16px',
      margin: `${this.config.gap! / 2}px 0`,
      borderRadius: '4px',
      boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
      fontSize: '14px',
      lineHeight: '1.4',
      maxWidth: '400px',
      minWidth: '300px',
      wordWrap: 'break-word',
      pointerEvents: 'auto',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s ease',
    })

    // 设置主题样式
    this.applyThemeStyles(messageEl, options.type!)

    // 创建图标
    const iconEl = this.createIcon(options.type!)
    messageEl.appendChild(iconEl)

    // 创建内容区域
    const contentEl = document.createElement('div')
    contentEl.className = 'engine-message-content'
    contentEl.style.flex = '1'
    contentEl.style.marginLeft = '8px'

    // 设置标题
    if (options.title) {
      const titleEl = document.createElement('div')
      titleEl.className = 'engine-message-title'
      titleEl.style.fontWeight = '600'
      titleEl.style.marginBottom = '4px'
      titleEl.textContent = options.title
      contentEl.appendChild(titleEl)
    }

    // 设置内容
    const textEl = document.createElement('div')
    textEl.className = 'engine-message-text'

    if (options.html) {
      textEl.innerHTML = options.content
    } else {
      textEl.textContent = options.content
    }

    contentEl.appendChild(textEl)
    messageEl.appendChild(contentEl)

    // 创建关闭按钮
    if (options.showClose) {
      const closeEl = this.createCloseButton()
      messageEl.appendChild(closeEl)
    }

    return messageEl
  }

  /**
   * 应用主题样式
   */
  private applyThemeStyles(element: HTMLElement, type: string): void {
    const themes = {
      success: {
        background: '#f0f9ff',
        border: '1px solid #67c23a',
        color: '#67c23a',
      },
      error: {
        background: '#fef0f0',
        border: '1px solid #f56c6c',
        color: '#f56c6c',
      },
      warning: {
        background: '#fdf6ec',
        border: '1px solid #e6a23c',
        color: '#e6a23c',
      },
      info: {
        background: '#f4f4f5',
        border: '1px solid #909399',
        color: '#909399',
      },
      loading: {
        background: '#f0f9ff',
        border: '1px solid #409eff',
        color: '#409eff',
      },
    }

    const theme = themes[type as keyof typeof themes] || themes.info
    Object.assign(element.style, theme)
  }

  /**
   * 创建图标
   */
  private createIcon(type: string): HTMLElement {
    const iconEl = document.createElement('div')
    iconEl.className = 'engine-message-icon'
    iconEl.style.flexShrink = '0'
    iconEl.style.width = '16px'
    iconEl.style.height = '16px'
    iconEl.style.marginTop = '2px'

    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳',
    }

    iconEl.textContent = icons[type as keyof typeof icons] || icons.info

    // 加载图标添加旋转动画
    if (type === 'loading') {
      iconEl.style.animation = 'engine-message-spin 1s linear infinite'

      // 添加旋转动画样式
      if (!document.querySelector('#engine-message-styles')) {
        const styleEl = document.createElement('style')
        styleEl.id = 'engine-message-styles'
        styleEl.textContent = `
          @keyframes engine-message-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `
        document.head.appendChild(styleEl)
      }
    }

    return iconEl
  }

  /**
   * 创建关闭按钮
   */
  private createCloseButton(): HTMLElement {
    const closeEl = document.createElement('button')
    closeEl.className = 'engine-message-close'
    closeEl.textContent = '×'

    Object.assign(closeEl.style, {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: 'none',
      border: 'none',
      fontSize: '18px',
      cursor: 'pointer',
      color: 'inherit',
      opacity: '0.5',
      padding: '0',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    })

    closeEl.addEventListener('mouseenter', () => {
      closeEl.style.opacity = '1'
    })

    closeEl.addEventListener('mouseleave', () => {
      closeEl.style.opacity = '0.5'
    })

    return closeEl
  }

  /**
   * 显示消息实例
   */
  private showInstance(instance: MessageInstance): void {
    if (!this.container) {
      this.createContainer()
    }

    // 添加到容器
    this.container!.appendChild(instance.element)

    // 设置位置
    this.positionInstance(instance)

    // 绑定事件
    this.bindInstanceEvents(instance)

    // 设置为可见状态
    instance.visible = true

    // 显示动画
    requestAnimationFrame(() => {
      instance.element.style.opacity = '1'
      instance.element.style.transform = 'translateY(0)'
    })

    // 设置自动关闭
    if (instance.options.duration && instance.options.duration > 0) {
      instance.timer = window.setTimeout(() => {
        this.closeInstance(instance)
      }, instance.options.duration)
    }
  }

  /**
   * 设置消息位置
   */
  private positionInstance(instance: MessageInstance): void {
    const position = instance.options.position!
    const offset = instance.options.offset!

    Object.assign(instance.element.style, {
      position: 'fixed',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: (this.config.zIndex! + 1).toString(),
    })

    switch (position) {
      case 'top':
        instance.element.style.top = `${offset}px`
        break
      case 'center':
        instance.element.style.top = '50%'
        instance.element.style.transform = 'translate(-50%, -50%)'
        break
      case 'bottom':
        instance.element.style.bottom = `${offset}px`
        break
    }

    // 调整其他消息位置
    this.adjustInstancePositions()
  }

  /**
   * 调整所有消息位置
   */
  private adjustInstancePositions(): void {
    const visibleInstances = Array.from(this.instances.values())
      .filter(instance => instance.visible)
      .sort((a, b) => {
        const aTime = Number.parseInt(a.id.split('_')[2])
        const bTime = Number.parseInt(b.id.split('_')[2])
        return aTime - bTime
      })

    visibleInstances.forEach((instance, index) => {
      const position = instance.options.position!
      const offset = instance.options.offset!
      const gap = this.config.gap!

      if (position === 'top') {
        const totalOffset =
          offset + index * (instance.element.offsetHeight + gap)
        instance.element.style.top = `${totalOffset}px`
      } else if (position === 'bottom') {
        const totalOffset =
          offset + index * (instance.element.offsetHeight + gap)
        instance.element.style.bottom = `${totalOffset}px`
      }
    })
  }

  /**
   * 绑定实例事件
   */
  private bindInstanceEvents(instance: MessageInstance): void {
    // 点击事件
    if (instance.options.onClick) {
      instance.element.addEventListener('click', instance.options.onClick)
    }

    // 关闭按钮事件
    const closeBtn = instance.element.querySelector('.engine-message-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', e => {
        e.stopPropagation()
        this.closeInstance(instance)
      })
    }

    // 鼠标悬停暂停自动关闭
    instance.element.addEventListener('mouseenter', () => {
      if (instance.timer) {
        clearTimeout(instance.timer)
        delete instance.timer
      }
    })

    instance.element.addEventListener('mouseleave', () => {
      if (instance.options.duration && instance.options.duration > 0) {
        instance.timer = window.setTimeout(() => {
          this.closeInstance(instance)
        }, instance.options.duration)
      }
    })
  }

  /**
   * 关闭消息实例
   */
  private closeInstance(instance: MessageInstance): void {
    if (!instance.visible) {
      return
    }

    // 清理定时器
    if (instance.timer) {
      clearTimeout(instance.timer)
      delete instance.timer
    }

    // 隐藏动画
    instance.element.style.opacity = '0'
    instance.element.style.transform = 'translateY(-20px)'
    instance.visible = false

    // 移除元素
    setTimeout(() => {
      if (instance.element.parentNode) {
        instance.element.parentNode.removeChild(instance.element)
      }
      this.instances.delete(instance.id)

      // 调整其他消息位置
      this.adjustInstancePositions()

      // 触发关闭回调
      instance.options.onClose?.()
    }, 300)

    this.log('info', `Message closed: ${instance.id}`)
  }

  /**
   * 获取统计信息
   */
  getStats() {
    const baseStats = super.getStats()
    const visibleInstances = Array.from(this.instances.values()).filter(i => i.visible)
    return {
      ...baseStats,
      totalMessages: visibleInstances.length,
      visibleMessages: visibleInstances.length,
      messageIds: visibleInstances.map(i => i.id),
    }
  }

  /**
   * 销毁管理器
   */
  async destroy(): Promise<void> {
    this.closeAll()

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container)
      this.container = undefined
    }

    // 移除样式
    const styleEl = document.querySelector('#engine-message-styles')
    if (styleEl && styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl)
    }

    await super.destroy()
  }
}
