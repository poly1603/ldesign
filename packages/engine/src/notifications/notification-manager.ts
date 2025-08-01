import type {
  Logger,
  NotificationManager,
  NotificationOptions,
  NotificationType,
} from '../types'

interface NotificationItem extends NotificationOptions {
  id: string
  createdAt: number
  visible: boolean
}

export class NotificationManagerImpl implements NotificationManager {
  private notifications = new Map<string, NotificationItem>()
  private maxNotifications = 5
  private defaultDuration = 4000
  private container?: HTMLElement
  private idCounter = 0

  constructor(_logger?: Logger) {
    // logger参数保留用于未来扩展
    this.createContainer()
  }

  private createContainer(): void {
    if (typeof document === 'undefined') {
      return // SSR环境
    }

    this.container = document.createElement('div')
    this.container.id = 'engine-notifications'
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
      max-width: 400px;
    `
    document.body.appendChild(this.container)
  }

  show(options: NotificationOptions): string {
    const id = this.generateId()
    const notification: NotificationItem = {
      id,
      createdAt: Date.now(),
      visible: true,
      type: options.type || 'info',
      duration: options.duration ?? this.defaultDuration,
      closable: options.closable ?? true,
      ...options,
    }

    // 检查通知数量限制
    this.enforceMaxNotifications()

    // 添加通知
    this.notifications.set(id, notification)

    // 渲染通知
    this.renderNotification(notification)

    // 设置自动关闭
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.hide(id)
      }, notification.duration)
    }

    return id
  }

  hide(id: string): void {
    const notification = this.notifications.get(id)
    if (!notification) {
      return
    }

    notification.visible = false
    this.removeNotificationElement(id)
    this.notifications.delete(id)
  }

  hideAll(): void {
    for (const id of this.notifications.keys()) {
      this.hide(id)
    }
  }

  getAll(): NotificationOptions[] {
    return Array.from(this.notifications.values())
      .filter(n => n.visible)
      .map(n => ({
        title: n.title,
        message: n.message,
        type: n.type,
        duration: n.duration,
        closable: n.closable,
      }))
  }

  private generateId(): string {
    return `notification-${++this.idCounter}-${Date.now()}`
  }

  private enforceMaxNotifications(): void {
    const visibleNotifications = Array.from(this.notifications.values())
      .filter(n => n.visible)
      .sort((a, b) => a.createdAt - b.createdAt)

    while (visibleNotifications.length >= this.maxNotifications) {
      const oldest = visibleNotifications.shift()
      if (oldest) {
        this.hide(oldest.id)
      }
    }
  }

  private renderNotification(notification: NotificationItem): void {
    if (!this.container) {
      return
    }

    const element = this.createNotificationElement(notification)
    this.container.appendChild(element)

    // 添加进入动画
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0)'
      element.style.opacity = '1'
    })
  }

  private createNotificationElement(notification: NotificationItem): HTMLElement {
    const element = document.createElement('div')
    element.id = `notification-${notification.id}`
    element.style.cssText = `
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 12px;
      padding: 16px;
      pointer-events: auto;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
      border-left: 4px solid ${this.getTypeColor(notification.type)};
      max-width: 100%;
      word-wrap: break-word;
    `

    // 创建内容
    const content = document.createElement('div')
    content.style.cssText = `
      display: flex;
      align-items: flex-start;
      gap: 12px;
    `

    // 图标
    const icon = document.createElement('div')
    icon.innerHTML = this.getTypeIcon(notification.type)
    icon.style.cssText = `
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      color: ${this.getTypeColor(notification.type)};
    `

    // 文本内容
    const textContent = document.createElement('div')
    textContent.style.cssText = 'flex: 1; min-width: 0;'

    if (notification.title) {
      const title = document.createElement('div')
      title.textContent = notification.title
      title.style.cssText = `
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 4px;
      `
      textContent.appendChild(title)
    }

    const message = document.createElement('div')
    message.textContent = notification.message
    message.style.cssText = `
      font-size: 13px;
      color: #6b7280;
      line-height: 1.4;
    `
    textContent.appendChild(message)

    content.appendChild(icon)
    content.appendChild(textContent)

    // 关闭按钮
    if (notification.closable) {
      const closeButton = document.createElement('button')
      closeButton.innerHTML = '×'
      closeButton.style.cssText = `
        position: absolute;
        top: 8px;
        right: 8px;
        background: none;
        border: none;
        font-size: 18px;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      closeButton.addEventListener('click', () => {
        this.hide(notification.id)
      })
      element.appendChild(closeButton)
    }

    element.appendChild(content)
    return element
  }

  private removeNotificationElement(id: string): void {
    const element = document.getElementById(`notification-${id}`)
    if (element) {
      element.style.transform = 'translateX(100%)'
      element.style.opacity = '0'

      setTimeout(() => {
        element.remove()
      }, 300)
    }
  }

  private getTypeColor(type: NotificationType | undefined): string {
    if (!type)
      type = 'info'
    switch (type) {
      case 'success':
        return '#10b981'
      case 'error':
        return '#ef4444'
      case 'warning':
        return '#f59e0b'
      case 'info':
      default:
        return '#3b82f6'
    }
  }

  private getTypeIcon(type: NotificationType | undefined): string {
    if (!type)
      type = 'info'
    switch (type) {
      case 'success':
        return `<svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>`
      case 'error':
        return `<svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>`
      case 'warning':
        return `<svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>`
      case 'info':
      default:
        return `<svg viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>`
    }
  }

  // 设置最大通知数量
  setMaxNotifications(max: number): void {
    this.maxNotifications = max
    this.enforceMaxNotifications()
  }

  // 获取最大通知数量
  getMaxNotifications(): number {
    return this.maxNotifications
  }

  // 设置默认持续时间
  setDefaultDuration(duration: number): void {
    this.defaultDuration = duration
  }

  // 获取默认持续时间
  getDefaultDuration(): number {
    return this.defaultDuration
  }

  // 获取通知统计
  getStats(): {
    total: number
    visible: number
    byType: Record<NotificationType, number>
  } {
    const byType: Record<NotificationType, number> = {
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
    }

    let visible = 0

    for (const notification of this.notifications.values()) {
      if (notification.visible) {
        visible++
      }
      const type = notification.type || 'info'
      byType[type]++
    }

    return {
      total: this.notifications.size,
      visible,
      byType,
    }
  }

  // 销毁通知管理器
  destroy(): void {
    this.hideAll()
    if (this.container) {
      this.container.remove()
      this.container = undefined
    }
  }
}

export function createNotificationManager(logger?: Logger): NotificationManager {
  return new NotificationManagerImpl(logger)
}

// 预定义的通知类型
export const notificationTypes = {
  success: (message: string, title?: string, options?: Partial<NotificationOptions>) => ({
    type: 'success' as const,
    message,
    title,
    ...options,
  }),

  error: (message: string, title?: string, options?: Partial<NotificationOptions>) => ({
    type: 'error' as const,
    message,
    title,
    duration: 0, // 错误通知默认不自动关闭
    ...options,
  }),

  warning: (message: string, title?: string, options?: Partial<NotificationOptions>) => ({
    type: 'warning' as const,
    message,
    title,
    ...options,
  }),

  info: (message: string, title?: string, options?: Partial<NotificationOptions>) => ({
    type: 'info' as const,
    message,
    title,
    ...options,
  }),
}

// 通知管理器的便捷方法
export function createNotificationHelpers(manager: NotificationManager) {
  return {
    success: (message: string, title?: string, options?: Partial<NotificationOptions>) => {
      return manager.show(notificationTypes.success(message, title, options))
    },

    error: (message: string, title?: string, options?: Partial<NotificationOptions>) => {
      return manager.show(notificationTypes.error(message, title, options))
    },

    warning: (message: string, title?: string, options?: Partial<NotificationOptions>) => {
      return manager.show(notificationTypes.warning(message, title, options))
    },

    info: (message: string, title?: string, options?: Partial<NotificationOptions>) => {
      return manager.show(notificationTypes.info(message, title, options))
    },

    // 批量通知
    batch: (notifications: NotificationOptions[]) => {
      return notifications.map(notification => manager.show(notification))
    },

    // 确认通知
    confirm: (message: string, title?: string) => {
      return new Promise<boolean>((resolve) => {
        const id = manager.show({
          type: 'warning',
          message,
          title,
          duration: 0,
          closable: false,
          // 这里可以添加自定义按钮逻辑
        })

        // 简化版本，实际应该添加确认/取消按钮
        setTimeout(() => {
          manager.hide(id)
          resolve(true)
        }, 3000)
      })
    },
  }
}
