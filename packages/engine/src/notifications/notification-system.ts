/**
 * 统一通知系统
 * 整合了Dialog、Message和Notification的功能
 */

import type { Logger } from '../types'
import type { Engine } from '../types/engine'

// ==================== 类型定义 ====================

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading'
export type NotificationPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right' | 'center'
export type NotificationStyle = 'dialog' | 'message' | 'toast' | 'notification'

export interface NotificationOptions {
  id?: string
  type?: NotificationType
  style?: NotificationStyle
  title?: string
  content: string
  html?: boolean
  duration?: number
  position?: NotificationPosition
  closable?: boolean
  persistent?: boolean
  modal?: boolean
  maskClosable?: boolean
  customClass?: string
  zIndex?: number
  actions?: NotificationAction[]
  onShow?: () => void
  onClose?: (result?: unknown) => void
  beforeClose?: (result?: unknown) => boolean | Promise<boolean>
  icon?: string | boolean
  progress?: NotificationProgress
  sound?: boolean
  vibrate?: boolean
}

export interface NotificationAction {
  text: string
  type?: 'primary' | 'secondary' | 'danger'
  handler?: (instance: NotificationInstance) => void | Promise<void>
}

export interface NotificationProgress {
  value: number
  max?: number
  indeterminate?: boolean
}

export interface NotificationInstance {
  id: string
  options: NotificationOptions
  element: HTMLElement
  visible: boolean
  close: (result?: unknown) => Promise<void>
  update: (options: Partial<NotificationOptions>) => void
  setProgress: (value: number) => void
}

// ==================== 实现 ====================

export class NotificationSystem {
  private instances = new Map<string, NotificationInstance>()
  private containers = new Map<NotificationPosition, HTMLElement>()
  private idCounter = 0
  private zIndexBase = 2000
  private logger?: Logger
  private engine?: Engine
  private styleElement?: HTMLElement
  private keydownHandler?: (e: KeyboardEvent) => void
  private autoCloseTimers = new Map<string, number>()

  constructor(engine?: Engine) {
    this.engine = engine
    this.logger = engine?.logger
    this.initialize()
  }

  private initialize(): void {
    this.injectStyles()
    this.setupContainers()
    this.bindGlobalEvents()
  }

  // ==================== 公共API ====================

  /**
   * 显示通知
   */
  show(options: NotificationOptions): NotificationInstance {
    const style = options.style || this.inferStyle(options)
    const id = options.id || this.generateId()
    
    const notification = this.createInstance(id, { ...options, style })
    this.instances.set(id, notification)
    
    this.renderNotification(notification)
    this.setupAutoClose(notification)
    
    options.onShow?.()
    this.logger?.debug(`Notification shown: ${id}`)
    
    return notification
  }

  /**
   * 显示对话框
   */
  dialog(options: Partial<NotificationOptions>): Promise<unknown> {
    return new Promise((resolve) => {
      this.show({
        style: 'dialog',
        modal: true,
        closable: true,
        position: 'center',
        ...options,
        content: options.content || '',
        onClose: (result) => {
          options.onClose?.(result)
          resolve(result)
        }
      })
    })
  }

  /**
   * 显示确认对话框
   */
  confirm(content: string, options?: Partial<NotificationOptions>): Promise<boolean> {
    return new Promise((resolve) => {
      this.show({
        style: 'dialog',
        modal: true,
        title: '确认',
        content,
        position: 'center',
        actions: [
          { text: '取消', type: 'secondary', handler: () => resolve(false) },
          { text: '确定', type: 'primary', handler: () => resolve(true) }
        ],
        ...options
      })
    })
  }

  /**
   * 显示输入对话框
   */
  async prompt(content: string, defaultValue = '', options?: Partial<NotificationOptions>): Promise<string | null> {
    return new Promise((resolve) => {
      const inputValue = defaultValue
      
      const instance = this.show({
        style: 'dialog',
        modal: true,
        title: '输入',
        content: `
          <div>${content}</div>
          <input type="text" class="notification-input" value="${defaultValue}" />
        `,
        html: true,
        position: 'center',
        actions: [
          { text: '取消', type: 'secondary', handler: () => resolve(null) },
          { 
            text: '确定', 
            type: 'primary', 
            handler: () => {
              const input = instance.element.querySelector('.notification-input') as HTMLInputElement
              resolve(input?.value || inputValue)
            }
          }
        ],
        ...options
      })
      
      // 聚焦输入框
      setTimeout(() => {
        const input = instance.element.querySelector('.notification-input') as HTMLInputElement
        input?.focus()
        input?.select()
      }, 100)
    })
  }

  /**
   * 快捷方法
   */
  success(content: string, options?: Partial<NotificationOptions>): NotificationInstance {
    return this.show({ type: 'success', content, ...options })
  }

  error(content: string, options?: Partial<NotificationOptions>): NotificationInstance {
    return this.show({ type: 'error', content, duration: 0, ...options })
  }

  warning(content: string, options?: Partial<NotificationOptions>): NotificationInstance {
    return this.show({ type: 'warning', content, ...options })
  }

  info(content: string, options?: Partial<NotificationOptions>): NotificationInstance {
    return this.show({ type: 'info', content, ...options })
  }

  loading(content: string, options?: Partial<NotificationOptions>): NotificationInstance {
    return this.show({ type: 'loading', content, duration: 0, ...options })
  }

  /**
   * 关闭通知
   */
  async close(id: string, result?: unknown): Promise<void> {
    const instance = this.instances.get(id)
    if (!instance) return
    
    await instance.close(result)
  }

  /**
   * 关闭所有通知
   */
  async closeAll(): Promise<void> {
    const promises = Array.from(this.instances.values()).map(i => i.close())
    await Promise.all(promises)
  }

  // ==================== 私有方法 ====================

  private inferStyle(options: NotificationOptions): NotificationStyle {
    if (options.modal) return 'dialog'
    if (options.actions?.length) return 'notification'
    if (options.duration && options.duration <= 3000) return 'message'
    return 'toast'
  }

  private generateId(): string {
    return `notification_${++this.idCounter}_${Date.now()}`
  }

  private createInstance(id: string, options: NotificationOptions): NotificationInstance {
    const element = this.createElement(options)
    
    const instance: NotificationInstance = {
      id,
      options,
      element,
      visible: false,
      close: async (result?: unknown) => {
        if (options.beforeClose) {
          const canClose = await options.beforeClose(result)
          if (!canClose) return
        }
        
        await this.hideInstance(instance, result)
      },
      update: (newOptions: Partial<NotificationOptions>) => {
        Object.assign(options, newOptions)
        this.updateElement(instance)
      },
      setProgress: (value: number) => {
        if (options.progress) {
          options.progress.value = value
          this.updateProgress(instance)
        }
      }
    }
    
    return instance
  }

  private createElement(options: NotificationOptions): HTMLElement {
    const element = document.createElement('div')
    element.className = `notification notification-${options.style} notification-${options.type}`
    
    if (options.customClass) {
      element.className += ` ${options.customClass}`
    }
    
    // 根据样式创建不同的结构
    switch (options.style) {
      case 'dialog':
        this.createDialogStructure(element, options)
        break
      case 'notification':
        this.createNotificationStructure(element, options)
        break
      default:
        this.createMessageStructure(element, options)
    }
    
    return element
  }

  private createDialogStructure(element: HTMLElement, options: NotificationOptions): void {
    // 创建遮罩
    if (options.modal) {
      const mask = document.createElement('div')
      mask.className = 'notification-mask'
      element.appendChild(mask)
    }
    
    // 创建对话框容器
    const dialog = document.createElement('div')
    dialog.className = 'notification-dialog'
    
    // 头部
    if (options.title || options.closable) {
      const header = document.createElement('div')
      header.className = 'notification-header'
      
      if (options.title) {
        const title = document.createElement('h3')
        title.textContent = options.title
        header.appendChild(title)
      }
      
      if (options.closable) {
        const closeBtn = document.createElement('button')
        closeBtn.className = 'notification-close'
        closeBtn.innerHTML = '×'
        closeBtn.onclick = () => this.instances.get(options.id!)?.close()
        header.appendChild(closeBtn)
      }
      
      dialog.appendChild(header)
    }
    
    // 内容
    const body = document.createElement('div')
    body.className = 'notification-body'
    if (options.html) {
      body.innerHTML = options.content
    } else {
      body.textContent = options.content
    }
    dialog.appendChild(body)
    
    // 操作按钮
    if (options.actions?.length) {
      const footer = document.createElement('div')
      footer.className = 'notification-footer'
      
      options.actions.forEach(action => {
        const btn = document.createElement('button')
        btn.className = `notification-btn notification-btn-${action.type || 'secondary'}`
        btn.textContent = action.text
        btn.onclick = () => action.handler?.(this.instances.get(options.id!)!)
        footer.appendChild(btn)
      })
      
      dialog.appendChild(footer)
    }
    
    element.appendChild(dialog)
  }

  private createNotificationStructure(element: HTMLElement, options: NotificationOptions): void {
    // 图标
    if (options.icon !== false) {
      const icon = document.createElement('div')
      icon.className = 'notification-icon'
      icon.innerHTML = this.getIcon(options.type || 'info')
      element.appendChild(icon)
    }
    
    // 内容区域
    const content = document.createElement('div')
    content.className = 'notification-content'
    
    if (options.title) {
      const title = document.createElement('div')
      title.className = 'notification-title'
      title.textContent = options.title
      content.appendChild(title)
    }
    
    const text = document.createElement('div')
    text.className = 'notification-text'
    if (options.html) {
      text.innerHTML = options.content
    } else {
      text.textContent = options.content
    }
    content.appendChild(text)
    
    // 进度条
    if (options.progress) {
      const progress = document.createElement('div')
      progress.className = 'notification-progress'
      const bar = document.createElement('div')
      bar.className = 'notification-progress-bar'
      bar.style.width = `${(options.progress.value / (options.progress.max || 100)) * 100}%`
      progress.appendChild(bar)
      content.appendChild(progress)
    }
    
    // 操作按钮
    if (options.actions?.length) {
      const actions = document.createElement('div')
      actions.className = 'notification-actions'
      
      options.actions.forEach(action => {
        const btn = document.createElement('button')
        btn.className = `notification-action notification-action-${action.type || 'secondary'}`
        btn.textContent = action.text
        btn.onclick = () => action.handler?.(this.instances.get(options.id!)!)
        actions.appendChild(btn)
      })
      
      content.appendChild(actions)
    }
    
    element.appendChild(content)
    
    // 关闭按钮
    if (options.closable) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'notification-close'
      closeBtn.innerHTML = '×'
      closeBtn.onclick = () => this.instances.get(options.id!)?.close()
      element.appendChild(closeBtn)
    }
  }

  private createMessageStructure(element: HTMLElement, options: NotificationOptions): void {
    // 图标
    const icon = document.createElement('span')
    icon.className = 'notification-icon'
    icon.innerHTML = this.getIcon(options.type || 'info')
    element.appendChild(icon)
    
    // 内容
    const content = document.createElement('span')
    content.className = 'notification-content'
    if (options.html) {
      content.innerHTML = options.content
    } else {
      content.textContent = options.content
    }
    element.appendChild(content)
    
    // 关闭按钮
    if (options.closable) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'notification-close'
      closeBtn.innerHTML = '×'
      closeBtn.onclick = () => this.instances.get(options.id!)?.close()
      element.appendChild(closeBtn)
    }
  }

  private getIcon(type: NotificationType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
      loading: '⟳'
    }
    return icons[type] || icons.info
  }

  private renderNotification(instance: NotificationInstance): void {
    const { position = 'top-right', style = 'toast' } = instance.options
    
    // 获取或创建容器
    const container = style === 'dialog' 
      ? document.body 
      : this.getContainer(position)
    
    // 添加到DOM
    container.appendChild(instance.element)
    instance.visible = true
    
    // 触发动画
    requestAnimationFrame(() => {
      instance.element.classList.add('notification-show')
    })
    
    // 调整位置
    if (style !== 'dialog') {
      this.adjustPositions(position)
    }
  }

  private async hideInstance(instance: NotificationInstance, result?: unknown): Promise<void> {
    if (!instance.visible) return
    
    instance.visible = false
    instance.element.classList.add('notification-hide')
    
    // 清理自动关闭定时器
    const tid = this.autoCloseTimers.get(instance.id)
    if (tid) {
      clearTimeout(tid)
      this.autoCloseTimers.delete(instance.id)
    }
    
    // 等待动画完成
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 移除元素
    instance.element.remove()
    this.instances.delete(instance.id)
    
    // 触发回调
    instance.options.onClose?.(result)
    
    // 调整其他通知位置
    if (instance.options.style !== 'dialog') {
      this.adjustPositions(instance.options.position || 'top-right')
    }
  }

  private updateElement(instance: NotificationInstance): void {
    // 简化实现：重新创建元素
    const newElement = this.createElement(instance.options)
    instance.element.replaceWith(newElement)
    instance.element = newElement
  }

  private updateProgress(instance: NotificationInstance): void {
    const bar = instance.element.querySelector('.notification-progress-bar') as HTMLElement
    if (bar && instance.options.progress) {
      const { value, max = 100 } = instance.options.progress
      bar.style.width = `${(value / max) * 100}%`
    }
  }

  private setupAutoClose(instance: NotificationInstance): void {
    const { duration, persistent } = instance.options
    
    if (!duration || duration <= 0 || persistent) return
    
    // 初始定时器
    const timerId = window.setTimeout(() => {
      instance.close()
      this.autoCloseTimers.delete(instance.id)
    }, duration)
    this.autoCloseTimers.set(instance.id, timerId)
    
    // 鼠标悬停时暂停
    instance.element.addEventListener('mouseenter', () => {
      const tid = this.autoCloseTimers.get(instance.id)
      if (tid) {
        clearTimeout(tid)
        this.autoCloseTimers.delete(instance.id)
      }
    })
    
    instance.element.addEventListener('mouseleave', () => {
      // 恢复定时器
      const newTid = window.setTimeout(() => {
        instance.close()
        this.autoCloseTimers.delete(instance.id)
      }, duration)
      this.autoCloseTimers.set(instance.id, newTid)
    })
  }

  private getContainer(position: NotificationPosition): HTMLElement {
    let container = this.containers.get(position)
    
    if (!container) {
      container = document.createElement('div')
      container.className = `notification-container notification-container-${position}`
      document.body.appendChild(container)
      this.containers.set(position, container)
    }
    
    return container
  }

  private setupContainers(): void {
    // 容器会按需创建
  }

  private bindGlobalEvents(): void {
    // ESC关闭顶层对话框
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const dialogs = Array.from(this.instances.values())
          .filter(i => i.options.style === 'dialog' && i.visible)
          .sort((a, b) => (b.element.style.zIndex || '0').localeCompare(a.element.style.zIndex || '0'))
        
        if (dialogs[0]?.options.closable) {
          dialogs[0].close()
        }
      }
    }
    document.addEventListener('keydown', this.keydownHandler)
  }

  private adjustPositions(position: NotificationPosition): void {
    const container = this.containers.get(position)
    if (!container) return
    
    const notifications = Array.from(container.children) as HTMLElement[]
    let offset = 0
    
    notifications.forEach((el) => {
      el.style.transform = `translateY(${offset}px)`
      offset += el.offsetHeight + 10
    })
  }

  private injectStyles(): void {
    if (this.styleElement) return
    
    const style = document.createElement('style')
    style.id = 'unified-notification-styles'
    style.textContent = `
      .notification-container {
        position: fixed;
        z-index: 2000;
        pointer-events: none;
      }
      
      .notification-container-top { top: 20px; left: 50%; transform: translateX(-50%); }
      .notification-container-top-left { top: 20px; left: 20px; }
      .notification-container-top-right { top: 20px; right: 20px; }
      .notification-container-bottom { bottom: 20px; left: 50%; transform: translateX(-50%); }
      .notification-container-bottom-left { bottom: 20px; left: 20px; }
      .notification-container-bottom-right { bottom: 20px; right: 20px; }
      .notification-container-center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
      
      .notification {
        pointer-events: auto;
        opacity: 0;
        transition: all 0.3s ease;
        margin-bottom: 10px;
      }
      
      .notification-show {
        opacity: 1;
      }
      
      .notification-hide {
        opacity: 0;
        transform: scale(0.9);
      }
      
      /* Message样式 */
      .notification-message, .notification-toast {
        display: inline-flex;
        align-items: center;
        padding: 12px 16px;
        border-radius: 4px;
        background: white;
        box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        font-size: 14px;
        max-width: 400px;
      }
      
      .notification-message .notification-icon,
      .notification-toast .notification-icon {
        margin-right: 8px;
        font-size: 16px;
      }
      
      .notification-message .notification-close,
      .notification-toast .notification-close {
        margin-left: 12px;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        opacity: 0.5;
        padding: 0;
      }
      
      .notification-message .notification-close:hover,
      .notification-toast .notification-close:hover {
        opacity: 1;
      }
      
      /* Dialog样式 */
      .notification-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        min-width: 400px;
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        z-index: 2100;
      }
      
      .notification-mask {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 2099;
      }
      
      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e8e8e8;
      }
      
      .notification-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }
      
      .notification-body {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
      }
      
      .notification-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid #e8e8e8;
      }
      
      .notification-btn {
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        background: white;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.2s;
      }
      
      .notification-btn-primary {
        background: #409eff;
        border-color: #409eff;
        color: white;
      }
      
      .notification-btn-danger {
        background: #f56c6c;
        border-color: #f56c6c;
        color: white;
      }
      
      /* Notification样式 */
      .notification-notification {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        min-width: 320px;
        max-width: 420px;
      }
      
      .notification-notification .notification-icon {
        font-size: 24px;
        margin-right: 12px;
        flex-shrink: 0;
      }
      
      .notification-notification .notification-content {
        flex: 1;
      }
      
      .notification-notification .notification-title {
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .notification-notification .notification-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.5;
        padding: 0;
        margin-left: 12px;
      }
      
      .notification-progress {
        height: 4px;
        background: #f0f0f0;
        border-radius: 2px;
        margin-top: 8px;
        overflow: hidden;
      }
      
      .notification-progress-bar {
        height: 100%;
        background: #409eff;
        transition: width 0.3s;
      }
      
      .notification-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }
      
      .notification-action {
        padding: 4px 12px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        background: white;
        cursor: pointer;
        font-size: 12px;
      }
      
      /* 类型样式 */
      .notification-success { border-left: 4px solid #67c23a; }
      .notification-success .notification-icon { color: #67c23a; }
      
      .notification-error { border-left: 4px solid #f56c6c; }
      .notification-error .notification-icon { color: #f56c6c; }
      
      .notification-warning { border-left: 4px solid #e6a23c; }
      .notification-warning .notification-icon { color: #e6a23c; }
      
      .notification-info { border-left: 4px solid #409eff; }
      .notification-info .notification-icon { color: #409eff; }
      
      .notification-loading .notification-icon {
        color: #409eff;
        animation: notification-spin 1s linear infinite;
      }
      
      @keyframes notification-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      /* 输入框样式 */
      .notification-input {
        width: 100%;
        padding: 8px;
        margin-top: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
    `
    
    document.head.appendChild(style)
    this.styleElement = style
  }

  /**
   * 销毁系统
   */
  async destroy(): Promise<void> {
    await this.closeAll()
    
    // 解绑全局事件
    if (this.keydownHandler) {
      document.removeEventListener('keydown', this.keydownHandler)
      this.keydownHandler = undefined
    }

    // 清理容器
    this.containers.forEach(container => container.remove())
    this.containers.clear()
    
    // 清理样式
    this.styleElement?.remove()
    this.styleElement = undefined

    // 清理自动关闭定时器
    for (const tid of this.autoCloseTimers.values()) {
      clearTimeout(tid)
    }
    this.autoCloseTimers.clear()
  }
}

// 导出工厂函数
export function createNotificationSystem(engine: Engine): NotificationSystem {
  return new NotificationSystem(engine)
}

// 向后兼容
export function createUnifiedNotificationSystem(engine: Engine): NotificationSystem {
  return createNotificationSystem(engine)
}

// 向后兼容的类型别名
export { NotificationSystem as UnifiedNotificationSystem }
