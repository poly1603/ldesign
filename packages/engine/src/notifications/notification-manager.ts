import type {
  EngineNotification,
  Logger,
  NotificationAction,
  NotificationManager,
  NotificationOptions,
  NotificationPosition,
  NotificationProgress,
  NotificationTheme,
  NotificationType,
} from '../types'
import type { NotificationStyleManager } from './style-manager'
import { createStyleManager } from './style-manager'

interface NotificationItem extends NotificationOptions {
  id: string
  createdAt: number
  visible: boolean
  element?: HTMLElement
  timeoutId?: number
  isAnimating?: boolean
}

export class NotificationManagerImpl implements NotificationManager {
  private notifications = new Map<string, NotificationItem>()
  private containers = new Map<NotificationPosition, HTMLElement>()
  private maxNotifications = 5
  private defaultDuration = 4000
  private defaultPosition: NotificationPosition = 'top-right'
  private defaultTheme: NotificationTheme = 'light'
  private idCounter = 0
  private styleManager: NotificationStyleManager
  private logger?: Logger
  private cleanupInterval?: number
  private themeUnsubscribe?: () => void
  private defaultOptions: Partial<NotificationOptions> = {
    position: 'top-right',
    duration: 4000,
    theme: 'light',
    type: 'info',
    closable: true,
    persistent: false
  }

  constructor(logger?: Logger) {
    this.logger = logger
    this.styleManager = createStyleManager()
    this.initializeContainers()
    this.setupThemeWatcher()
    this.injectStyles()
    
    // 设置定期清理
    this.startCleanup()
  }

  /**
   * 初始化所有位置的容器
   */
  private initializeContainers(): void {
    if (typeof document === 'undefined') {
      return // SSR环境
    }

    const positions: NotificationPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ]

    positions.forEach(position => {
      this.createContainer(position)
    })
  }

  /**
   * 创建指定位置的容器
   */
  private createContainer(position: NotificationPosition): HTMLElement {
    const existing = this.containers.get(position)
    if (existing) {
      return existing
    }

    const container = document.createElement('div')
    container.id = `engine-notifications-${position}`
    container.className = 'engine-notifications-container'

    const styles = this.styleManager.getContainerStyles(position)
    this.styleManager.applyStyles(container, styles)

    document.body.appendChild(container)
    this.containers.set(position, container)

    return container
  }

  /**
   * 设置主题监听器
   */
  private setupThemeWatcher(): void {
    if (this.defaultTheme === 'auto') {
      this.themeUnsubscribe = this.styleManager.watchSystemTheme(systemTheme => {
        this.styleManager.setTheme(systemTheme)
        this.updateAllNotificationStyles()
      })
    }
  }

  /**
   * 更新所有通知的样式
   */
  private updateAllNotificationStyles(): void {
    this.notifications.forEach(notification => {
      if (notification.element && notification.visible) {
        this.updateNotificationStyles(notification)
      }
    })
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
      position: options.position || this.defaultPosition,
      theme: options.theme || this.defaultTheme,
      ...options,
    }

    // 检查通知数量限制
    const position = notification.position || this.defaultPosition
    this.enforceMaxNotifications(position)

    // 添加通知
    this.notifications.set(id, notification)

    // 渲染通知
    this.renderNotification(notification)

    // 设置自动关闭
    if (
      notification.duration &&
      notification.duration > 0 &&
      !notification.persistent
    ) {
      notification.timeoutId = window.setTimeout(() => {
        this.hide(id)
      }, notification.duration)
    }

    // 触发显示回调
    if (notification.onShow) {
      try {
        notification.onShow()
      } catch (error) {
        this.logger?.error('Error in notification onShow callback', error)
      }
    }

    this.logger?.debug('Notification shown', { id, options })
    return id
  }

  async hide(id: string): Promise<void> {
    const notification = this.notifications.get(id)
    if (!notification || !notification.visible) {
      return
    }

    notification.visible = false

    // 清除自动关闭定时器
    if (notification.timeoutId) {
      clearTimeout(notification.timeoutId)
      notification.timeoutId = undefined
    }

    // 触发关闭回调
    if (notification.onClose) {
      try {
        notification.onClose()
      } catch (error) {
        this.logger?.error('Error in notification onClose callback', error)
      }
    }

    // 执行退出动画并移除元素
    await this.removeNotificationElement(notification)
    this.notifications.delete(id)

    this.logger?.debug('Notification hidden', { id })
  }

  async hideAll(): Promise<void> {
    const hidePromises = Array.from(this.notifications.keys()).map(id =>
      this.hide(id)
    )
    await Promise.all(hidePromises)
  }

  getAll(): EngineNotification[] {
    return Array.from(this.notifications.values())
      .filter(
        (notification): notification is NotificationItem & { id: string } =>
          !!notification.id && notification.visible !== false
      )
      .map(notification => ({
        id: notification.id,
        title: notification.title || '',
        message: notification.message,
        type: notification.type || 'info',
        position: notification.position || 'top-right',
        duration: notification.duration || 3000,
        theme: notification.theme || 'light',
        animation: notification.animation || 'fade',
        icon: notification.icon,
        actions: notification.actions || [],
        group: notification.group,
        persistent: notification.persistent || false,
        closable: notification.closable !== false,
        priority: notification.priority || 0,
        metadata: notification.metadata,
        timestamp: notification.createdAt || Date.now(),
        isVisible: notification.visible !== false,
        isAnimating: notification.isAnimating || false,
        showProgress: !!notification.progress,
        progress: notification.progress,
        createdAt: notification.createdAt,
        visible: notification.visible,
        element: notification.element,
        timeoutId: notification.timeoutId,
      })) as EngineNotification[]
  }

  // 添加缺失的方法以满足测试需求
  destroy(): void {
    this.clear()
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = undefined
    }
    // 清理主题监听器
    this.cleanupThemeWatcher()
    // 调用内部销毁流程
    void this.destroyInternal()
  }

  setPosition(position: NotificationPosition): void {
    this.defaultOptions.position = position
  }

  getPosition(): NotificationPosition {
    return this.defaultOptions.position || 'top-right'
  }

  setTheme(theme: NotificationTheme): void {
    this.defaultOptions.theme = theme
    this.setThemeInternal(theme)
  }

  getTheme(): NotificationTheme {
    return this.getThemeInternal()
  }

  setMaxNotifications(max: number): void {
    this.setMaxNotificationsInternal(max)
  }

  getMaxNotifications(): number {
    return this.maxNotifications
  }

  setDefaultDuration(duration: number): void {
    this.defaultOptions.duration = duration
  }

  getDefaultDuration(): number {
    return this.defaultOptions.duration || 3000
  }

  getStats() {
    // 使用内部统计方法，避免重复计算并满足严格检查
    return this.getStatsInternal()
  }

  private generateId(): string {
    return `notification-${++this.idCounter}-${Date.now()}`
  }

  private enforceMaxNotifications(position: NotificationPosition): void {
    const visibleNotifications = Array.from(this.notifications.values())
      .filter(n => n.visible && n.position === position)
      .sort((a, b) => {
        // 优先移除低优先级的通知
        if (a.priority !== b.priority) {
          return (a.priority || 0) - (b.priority || 0)
        }
        return a.createdAt - b.createdAt
      })

    while (visibleNotifications.length >= this.maxNotifications) {
      const toRemove = visibleNotifications.shift()
      if (toRemove) {
        this.hide(toRemove.id)
      }
    }
  }

  private async renderNotification(
    notification: NotificationItem
  ): Promise<void> {
    const position = notification.position || this.defaultPosition
    const container = this.createContainer(position)
    if (!container) {
      return
    }

    const element = this.createNotificationElement(notification)
    notification.element = element

    // 添加CSS类用于动画
    element.classList.add('notification-enter')

    // 根据位置添加对应的类
    if (notification.position?.includes('left')) {
      element.classList.add('notification-position-left')
    } else if (notification.position?.includes('center')) {
      element.classList.add('notification-position-center')
    }

    // 根据位置决定插入位置
    if (notification.position?.startsWith('bottom')) {
      container.insertBefore(element, container.firstChild)
    } else {
      container.appendChild(element)
    }

    // 强制重排，然后触发进入动画
    void element.offsetHeight // 强制重排

    return new Promise(resolve => {
      // 添加进入动画类
      element.classList.add('notification-enter-active')
      element.classList.remove('notification-enter')

      // 监听动画结束
      const handleTransitionEnd = () => {
        element.removeEventListener('transitionend', handleTransitionEnd)
        element.classList.remove('notification-enter-active')
        resolve()
      }

      element.addEventListener('transitionend', handleTransitionEnd)

      // 备用超时，防止动画卡住
      setTimeout(() => {
        element.removeEventListener('transitionend', handleTransitionEnd)
        element.classList.remove('notification-enter-active')
        resolve()
      }, 500)
    })
  }

  private createNotificationElement(
    notification: NotificationItem
  ): HTMLElement {
    const element = document.createElement('div')
    element.id = `notification-${notification.id}`
    element.className = 'engine-notification'

    // 应用样式
    const styles = this.styleManager.getNotificationStyles(
      notification.type,
      notification.theme
    )
    this.styleManager.applyStyles(element, styles.notification)

    // 应用自定义样式
    if (notification.style) {
      this.styleManager.applyStyles(element, notification.style)
    }

    // 应用自定义类名
    if (notification.className) {
      element.className += ` ${notification.className}`
    }

    // 设置最大宽度
    if (notification.maxWidth) {
      element.style.maxWidth = `${notification.maxWidth}px`
    }

    // 设置 z-index
    if (notification.zIndex) {
      element.style.zIndex = notification.zIndex.toString()
    }

    // 创建主要内容容器
    const content = document.createElement('div')
    const contentStyles = this.styleManager.getNotificationStyles(
      notification.type,
      notification.theme
    )
    this.styleManager.applyStyles(content, contentStyles.content)

    // 创建图标
    const iconContainer = this.createIconElement(notification)
    if (iconContainer) {
      content.appendChild(iconContainer)
    }

    // 创建文本内容
    const textContent = document.createElement('div')
    textContent.style.flex = '1'
    textContent.style.minWidth = '0'

    // 标题
    if (notification.title) {
      const titleElement = document.createElement('div')
      titleElement.className = 'engine-notification-title'

      if (notification.allowHTML) {
        titleElement.innerHTML = notification.title
      } else {
        titleElement.textContent = notification.title
      }

      this.styleManager.applyStyles(titleElement, contentStyles.title)
      textContent.appendChild(titleElement)
    }

    // 消息内容
    const messageElement = document.createElement('div')
    messageElement.className = 'engine-notification-message'

    if (notification.allowHTML && notification.message) {
      messageElement.innerHTML = notification.message
    } else if (notification.message) {
      messageElement.textContent = notification.message
    } else {
      messageElement.textContent = ''
    }

    this.styleManager.applyStyles(messageElement, contentStyles.message)
    textContent.appendChild(messageElement)

    content.appendChild(textContent)

    // 添加进度条
    if (notification.progress) {
      const progressContainer = this.createProgressElement(
        notification.progress,
        notification.theme
      )
      textContent.appendChild(progressContainer)
    }

    // 添加操作按钮
    if (notification.actions && notification.actions.length > 0) {
      const actionsContainer = this.createActionsElement(
        notification.actions,
        notification
      )
      textContent.appendChild(actionsContainer)
    }

    // 关闭按钮
    if (notification.closable) {
      const closeButton = this.createCloseButton(notification)
      element.appendChild(closeButton)
    }

    // 添加点击事件
    if (notification.onClick) {
      element.style.cursor = 'pointer'
      const clickHandler = (e: MouseEvent) => {
        // 避免关闭按钮和操作按钮触发
        if (
          (e.target as HTMLElement).closest(
            '.engine-notification-close, .engine-notification-actions'
        )
        ) {
          return
        }
        if (notification.onClick) {
          try {
            notification.onClick()
          } catch (error) {
            this.logger?.error('Error in notification onClick callback', error)
          }
        }
      }
      element.addEventListener('click', clickHandler)
      // 存储处理器以便清理
      ;(element as any).__clickHandler = clickHandler
    }

    element.appendChild(content)
    return element
  }

  /**
   * 创建图标元素
   */
  private createIconElement(
    notification: NotificationItem
  ): HTMLElement | null {
    const iconContainer = document.createElement('div')
    iconContainer.className = 'engine-notification-icon'

    const styles = this.styleManager.getNotificationStyles(
      notification.type,
      notification.theme
    )
    this.styleManager.applyStyles(iconContainer, styles.icon)

    if (notification.icon) {
      if (typeof notification.icon === 'string') {
        iconContainer.innerHTML = notification.icon
      } else {
        iconContainer.appendChild(notification.icon)
      }
    } else {
      iconContainer.innerHTML = this.getTypeIcon(notification.type)
    }

    // 根据类型设置颜色（触发内部颜色计算器的使用）
    iconContainer.style.color = this.getTypeColor(notification.type)

    return iconContainer
  }

  /**
   * 创建进度条元素
   */
  private createProgressElement(
    progress: NotificationProgress,
    theme?: NotificationTheme
  ): HTMLElement {
    const container = document.createElement('div')
    container.className = 'engine-notification-progress'

    const styles = this.styleManager.getNotificationStyles('info', theme)
    this.styleManager.applyStyles(container, styles.progress)

    const bar = document.createElement('div')
    bar.className = 'engine-notification-progress-bar'

    const barStyles = this.styleManager.getProgressBarStyles(
      progress.value,
      progress.color,
      theme
    )
    this.styleManager.applyStyles(bar, barStyles)

    container.appendChild(bar)

    if (progress.showText) {
      const text = document.createElement('div')
      text.className = 'engine-notification-progress-text'
      text.textContent = `${Math.round(progress.value)}%`
      text.style.fontSize = '11px'
      text.style.marginTop = '4px'
      text.style.textAlign = 'center'
      container.appendChild(text)
    }

    return container
  }

  /**
   * 创建操作按钮容器
   */
  private createActionsElement(
    actions: NotificationAction[],
    notification: NotificationItem
  ): HTMLElement {
    const container = document.createElement('div')
    container.className = 'engine-notification-actions'

    const styles = this.styleManager.getNotificationStyles(
      notification.type,
      notification.theme
    )
    this.styleManager.applyStyles(container, styles.actions)

    actions.forEach(action => {
      const button = document.createElement('button')
      button.className = 'engine-notification-action'
      button.textContent = action.label

      const buttonStyles = this.styleManager.getActionButtonStyles(
        action.style,
        notification.theme
      )
      this.styleManager.applyStyles(button, buttonStyles)

      if (action.loading) {
        button.disabled = true
        button.textContent = '...'
      }

      const actionHandler = async (e: MouseEvent) => {
        e.stopPropagation()

        try {
          button.disabled = true
          button.textContent = '...'

          await action.action()

          // 执行完操作后可能需要关闭通知
          this.hide(notification.id)
        } catch (error) {
          this.logger?.error('Error in notification action', error)
        } finally {
          button.disabled = false
          button.textContent = action.label
        }
      }
      button.addEventListener('click', actionHandler)
      // 存储处理器以便清理
      ;(button as any).__actionHandler = actionHandler

      container.appendChild(button)
    })

    return container
  }

  /**
   * 创建关闭按钮
   */
  private createCloseButton(notification: NotificationItem): HTMLElement {
    const button = document.createElement('button')
    button.className = 'engine-notification-close'
    button.innerHTML = '×'
    button.setAttribute('aria-label', 'Close notification')

    const styles = this.styleManager.getNotificationStyles(
      notification.type,
      notification.theme
    )
    this.styleManager.applyStyles(button, styles.closeButton)

    const closeHandler = (e: MouseEvent) => {
      e.stopPropagation()
      this.hide(notification.id)
    }
    
    const enterHandler = () => {
      button.style.opacity = '0.8'
    }
    
    const leaveHandler = () => {
      button.style.opacity = '0.5'
    }
    
    button.addEventListener('click', closeHandler)
    button.addEventListener('mouseenter', enterHandler)
    button.addEventListener('mouseleave', leaveHandler)
    
    // 存储处理器以便清理
    ;(button as any).__handlers = { closeHandler, enterHandler, leaveHandler }

    return button
  }

  /**
   * 更新通知样式
   */
  private updateNotificationStyles(notification: NotificationItem): void {
    if (!notification.element) return

    const styles = this.styleManager.getNotificationStyles(
      notification.type,
      notification.theme
    )
    this.styleManager.applyStyles(notification.element, styles.notification)
  }

  /**
   * 注入CSS样式
   */
  private injectStyles(): void {
    if (typeof document === 'undefined') return

    const styleId = 'notification-animations'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      .notification-enter {
        height: 0 !important;
        opacity: 0 !important;
        overflow: hidden !important;
        margin-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        transform: translateX(100%) !important;
      }

      .notification-enter.notification-position-left {
        transform: translateX(-100%) !important;
      }

      .notification-enter.notification-position-center {
        transform: translateY(-100%) !important;
      }

      .notification-enter-active {
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        height: auto !important;
        opacity: 1 !important;
        overflow: visible !important;
        margin-bottom: 12px !important;
        padding-top: 16px !important;
        padding-bottom: 16px !important;
        transform: translateX(0) translateY(0) !important;
      }

      .notification-leave {
        transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }

      .notification-leave-active {
        height: 0 !important;
        opacity: 0 !important;
        overflow: hidden !important;
        margin-bottom: 0 !important;
        padding-top: 0 !important;
        padding-bottom: 0 !important;
        transform: translateX(100%) !important;
      }

      .notification-leave-active.notification-position-left {
        transform: translateX(-100%) !important;
      }

      .notification-leave-active.notification-position-center {
        transform: translateY(-100%) !important;
      }
    `

    document.head.appendChild(style)
  }

  /**
   * 移除通知元素（带动画）
   */
  private async removeNotificationElement(
    notification: NotificationItem
  ): Promise<void> {
    if (!notification.element) return

    const position = notification.position || this.defaultPosition
    const container = this.containers.get(position)
    if (!container) return

    try {
      const elementToRemove = notification.element
      const allElements = Array.from(container.children) as HTMLElement[]
      const elementIndex = allElements.indexOf(elementToRemove)

      if (elementIndex === -1) return

      // 获取要移除元素的高度（包括margin）
      const elementHeight = this.getElementTotalHeight(elementToRemove)

      // 获取需要移动的其他元素
      const elementsToMove = this.getElementsToMove(
        allElements,
        elementIndex,
        position
      )

      // 立即开始其他元素的移动动画
      if (elementsToMove.length > 0) {
        this.startOtherElementsAnimation(
          elementsToMove,
          elementHeight,
          position
        )
      }

      // 添加退出动画类
      elementToRemove.classList.add('notification-leave')

      // 根据位置添加对应的类
      if (notification.position?.includes('left')) {
        elementToRemove.classList.add('notification-position-left')
      } else if (notification.position?.includes('center')) {
        elementToRemove.classList.add('notification-position-center')
      }

      return new Promise(resolve => {
        // 添加退出动画激活类
        elementToRemove.classList.add('notification-leave-active')

        // 监听动画结束
        const handleTransitionEnd = () => {
          elementToRemove.removeEventListener(
            'transitionend',
            handleTransitionEnd
          )
          elementToRemove.remove()
          notification.element = undefined
          resolve()
        }

        elementToRemove.addEventListener('transitionend', handleTransitionEnd)

        // 备用超时
        setTimeout(() => {
          elementToRemove.removeEventListener(
            'transitionend',
            handleTransitionEnd
          )
          if (elementToRemove.parentNode) {
            elementToRemove.remove()
          }
          notification.element = undefined
          resolve()
        }, 400) // 与CSS动画时长一致
      })
    } catch (error) {
      this.logger?.error('Error in notification exit animation', error)
      // 即使动画失败也要移除元素
      if (notification.element) {
        notification.element.remove()
        notification.element = undefined
      }
    }
  }

  /**
   * 获取元素的总高度（包括margin）
   */
  private getElementTotalHeight(element: HTMLElement): number {
    const computedStyle = window.getComputedStyle(element)
    const height = element.offsetHeight
    const marginTop = Number.parseInt(computedStyle.marginTop) || 0
    const marginBottom = Number.parseInt(computedStyle.marginBottom) || 0
    return height + marginTop + marginBottom
  }

  /**
   * 获取需要移动的元素
   */
  private getElementsToMove(
    allElements: HTMLElement[],
    removedIndex: number,
    position: NotificationPosition
  ): HTMLElement[] {
    const isBottomPosition = position.startsWith('bottom')

    if (isBottomPosition) {
      // 底部位置：移除元素上方的元素需要向下移动
      return allElements.slice(0, removedIndex)
    } else {
      // 顶部位置：移除元素下方的元素需要向上移动
      return allElements.slice(removedIndex + 1)
    }
  }

  /**
   * 立即开始其他元素的移动动画
   */
  private startOtherElementsAnimation(
    elements: HTMLElement[],
    moveDistance: number,
    position: NotificationPosition
  ): void {
    const isBottomPosition = position.startsWith('bottom')
    const direction = isBottomPosition ? moveDistance : -moveDistance

    elements.forEach(element => {
      // 设置transition
      element.style.transition = 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)'

      // 立即开始移动
      element.style.transform = `translateY(${direction}px)`

      // 动画结束后清理
      const cleanup = () => {
        element.style.transition = ''
        element.style.transform = ''
        element.removeEventListener('transitionend', cleanup)
      }

      element.addEventListener('transitionend', cleanup)

      // 备用清理
      setTimeout(cleanup, 400)
    })
  }

  /**
   * 根据类型返回颜色
   */
  private getTypeColor(type: NotificationType | undefined): string {
    if (!type) type = 'info'
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

  /**
   * 根据类型返回SVG图标
   */
  private getTypeIcon(type: NotificationType | undefined): string {
    if (!type) type = 'info'
    switch (type) {
      case 'success':
        return `<svg viewBox=\"0 0 20 20\" fill=\"currentColor\">
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

  /**
   * 设置主题（内部方法）
   */
  private setThemeInternal(theme: NotificationTheme): void {
    this.defaultTheme = theme
    this.styleManager.setTheme(
      theme === 'auto' ? this.styleManager.detectSystemTheme() : theme
    )
    this.updateAllNotificationStyles()
  }

  /**
   * 内部获取主题方法
   */
  private getThemeInternal(): NotificationTheme {
    return this.defaultTheme
  }

  /**
   * 内部方法：设置最大通知数量
   */
  private setMaxNotificationsInternal(max: number): void {
    this.maxNotifications = max
    // 对所有位置执行限制检查
    const positions: NotificationPosition[] = [
      'top-left',
      'top-center',
      'top-right',
      'bottom-left',
      'bottom-center',
      'bottom-right',
    ]
    positions.forEach(position => {
      this.enforceMaxNotifications(position)
    })
  }

  /**
   * 内部统计方法
   */
  private getStatsInternal() {
    const byType: Record<NotificationType, number> = {
      success: 0,
      error: 0,
      warning: 0,
      info: 0,
    }

    const byPosition: Record<NotificationPosition, number> = {
      'top-left': 0,
      'top-center': 0,
      'top-right': 0,
      'bottom-left': 0,
      'bottom-center': 0,
      'bottom-right': 0,
    }

    let visible = 0

    Array.from(this.notifications.values()).forEach(notification => {
      if (notification.visible) {
        visible++
      }

      const type = (notification.type || 'info') as NotificationType
      byType[type]++

      const position = (notification.position || 'top-right') as NotificationPosition
      byPosition[position]++
    })

    return {
      total: this.notifications.size,
      visible,
      byType,
      byPosition,
    }
  }

  /**
   * 内部销毁方法
   */
  private async destroyInternal(): Promise<void> {
    await this.hideAll()

    // 清理所有容器
    this.containers.forEach(container => {
      // 清理容器内的所有元素事件监听器
      const elements = container.querySelectorAll('.engine-notification')
      elements.forEach(el => this.cleanupElement(el as HTMLElement))
      container.remove()
    })
    this.containers.clear()

    // 清理所有定时器
    this.notifications.forEach(notification => {
      if (notification.timeoutId) {
        clearTimeout(notification.timeoutId)
        notification.timeoutId = undefined
      }
      if (notification.element) {
        this.cleanupElement(notification.element)
        notification.element = undefined
      }
    })
    this.notifications.clear()
    
    // 清理注入的样式
    const styleElement = document.getElementById('notification-animations')
    if (styleElement) {
      styleElement.remove()
    }
  }

  // 添加缺失的方法
  update(id: string, options: Partial<NotificationOptions>): void {
    const notification = this.notifications.get(id)
    if (notification) {
      Object.assign(notification, options)
    }
  }

  get(id: string): EngineNotification | undefined {
    const notification = this.notifications.get(id)
    if (notification && notification.visible) {
      return {
        id: notification.id,
        title: notification.title || '',
        message: notification.message,
        type: notification.type || 'info',
        position: notification.position || 'top-right',
        duration: notification.duration || 3000,
        animation: notification.animation || 'fade',
        theme: notification.theme || 'light',
        icon: notification.icon || '',
        actions: notification.actions || [],
        closable: notification.closable !== false,
        persistent: notification.persistent || false,
        showProgress: !!notification.progress,
        progress: notification.progress,
        group: notification.group,
        priority: notification.priority || 0,
        metadata: notification.metadata || {},
        timestamp: notification.createdAt,
        isVisible: notification.visible,
        isAnimating: notification.isAnimating || false,
      }
    }
    return undefined
  }

  clear(): void {
    this.hideAll()
  }
  
  /**
   * 启动定期清理
   */
  private startCleanup(): void {
    // 每分钟清理一次过期通知
    this.cleanupInterval = window.setInterval(() => {
      this.cleanupExpiredNotifications()
    }, 60000)
  }
  
  /**
   * 清理过期通知
   */
  private cleanupExpiredNotifications(): void {
    const now = Date.now()
    const expiredNotifications: string[] = []
    
    this.notifications.forEach((notification, id) => {
      // 清理超过10分钟的隐藏通知
      if (!notification.visible && (now - notification.createdAt > 600000)) {
        expiredNotifications.push(id)
      }
    })
    
    expiredNotifications.forEach(id => {
      const notification = this.notifications.get(id)
      if (notification?.element) {
        this.cleanupElement(notification.element)
      }
      this.notifications.delete(id)
    })
  }
  
  /**
   * 清理元素的事件监听器
   */
  private cleanupElement(element: HTMLElement): void {
    if (!element) return
    
    // 清理点击处理器
    const clickHandler = (element as any).__clickHandler
    if (clickHandler) {
      element.removeEventListener('click', clickHandler)
      delete (element as any).__clickHandler
    }
    
    // 清理按钮处理器
    const buttons = element.querySelectorAll('button')
    buttons.forEach(button => {
      const handlers = (button as any).__handlers
      if (handlers) {
        button.removeEventListener('click', handlers.closeHandler || handlers.actionHandler)
        button.removeEventListener('mouseenter', handlers.enterHandler)
        button.removeEventListener('mouseleave', handlers.leaveHandler)
        delete (button as any).__handlers
      }
      const actionHandler = (button as any).__actionHandler
      if (actionHandler) {
        button.removeEventListener('click', actionHandler)
        delete (button as any).__actionHandler
      }
    })
    
    // 清理子元素
    element.innerHTML = ''
  }
  
  /**
   * 清理主题监听器
   */
  private cleanupThemeWatcher(): void {
    // 取消系统主题监听
    if (this.themeUnsubscribe) {
      try { this.themeUnsubscribe() } catch { /* ignore */ }
      this.themeUnsubscribe = undefined
    }

    // 如果styleManager有清理方法，调用它
    if (this.styleManager && typeof (this.styleManager as any).cleanup === 'function') {
      (this.styleManager as any).cleanup()
    }
  }

  setDefaultOptions(options: Partial<NotificationOptions>): void {
    Object.assign(this.defaultOptions, options)
  }

  getDefaultOptions(): Partial<NotificationOptions> {
    return { ...this.defaultOptions }
  }
}

export function createNotificationManager(
  logger?: Logger
): NotificationManager {
  return new NotificationManagerImpl(logger)
}

// 预定义的通知类型
export const notificationTypes = {
  success: (
    message: string,
    title?: string,
    options?: Partial<NotificationOptions>
  ) => ({
    type: 'success' as const,
    message,
    title,
    ...options,
  }),

  error: (
    message: string,
    title?: string,
    options?: Partial<NotificationOptions>
  ) => ({
    type: 'error' as const,
    message,
    title,
    duration: 0, // 错误通知默认不自动关闭
    ...options,
  }),

  warning: (
    message: string,
    title?: string,
    options?: Partial<NotificationOptions>
  ) => ({
    type: 'warning' as const,
    message,
    title,
    ...options,
  }),

  info: (
    message: string,
    title?: string,
    options?: Partial<NotificationOptions>
  ) => ({
    type: 'info' as const,
    message,
    title,
    ...options,
  }),
}

// 通知管理器的便捷方法
export function createNotificationHelpers(manager: NotificationManager) {
  return {
    success: (
      message: string,
      title?: string,
      options?: Partial<NotificationOptions>
    ) => {
      return manager.show(notificationTypes.success(message, title, options))
    },

    error: (
      message: string,
      title?: string,
      options?: Partial<NotificationOptions>
    ) => {
      return manager.show(notificationTypes.error(message, title, options))
    },

    warning: (
      message: string,
      title?: string,
      options?: Partial<NotificationOptions>
    ) => {
      return manager.show(notificationTypes.warning(message, title, options))
    },

    info: (
      message: string,
      title?: string,
      options?: Partial<NotificationOptions>
    ) => {
      return manager.show(notificationTypes.info(message, title, options))
    },

    // 批量通知
    batch: (notifications: NotificationOptions[]) => {
      return notifications.map(notification => manager.show(notification))
    },

    // 进度通知
    progress: (
      message: string,
      initialValue: number = 0,
      options?: Partial<NotificationOptions>
    ) => {
      const id = manager.show({
        type: 'info',
        message,
        duration: 0,
        closable: false,
        progress: {
          value: initialValue,
          max: 100,
          showText: true,
        },
        ...options,
      })

      return {
        id,
        update: (_value: number, _newMessage?: string) => {
          // 这里需要实现进度更新逻辑
          // 实际实现中需要找到对应的通知并更新进度条
        },
        complete: (successMessage?: string) => {
          manager.hide(id)
          if (successMessage) {
            manager.show({
              type: 'success',
              message: successMessage,
              duration: 3000,
            })
          }
        },
        error: (errorMessage?: string) => {
          manager.hide(id)
          if (errorMessage) {
            manager.show({
              type: 'error',
              message: errorMessage,
              duration: 0,
            })
          }
        },
      }
    },

    // 确认通知
    confirm: (
      message: string,
      title?: string,
      options?: Partial<NotificationOptions>
    ) => {
      return new Promise<boolean>(resolve => {
        manager.show({
          type: 'warning',
          message,
          title,
          duration: 0,
          closable: false,
          actions: [
            {
              label: '确认',
              style: 'primary',
              action: () => {
                resolve(true)
              },
            },
            {
              label: '取消',
              style: 'secondary',
              action: () => {
                resolve(false)
              },
            },
          ],
          ...options,
        })
      })
    },

    // 加载通知
    loading: (message: string, options?: Partial<NotificationOptions>) => {
      const id = manager.show({
        type: 'info',
        message,
        duration: 0,
        closable: false,
        icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="31.416" stroke-dashoffset="31.416">
            <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
            <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
          </circle>
        </svg>`,
        ...options,
      })

      return {
        id,
        update: (_newMessage: string) => {
          // 更新加载消息
        },
        success: (successMessage: string) => {
          manager.hide(id)
          manager.show({
            type: 'success',
            message: successMessage,
            duration: 3000,
          })
        },
        error: (errorMessage: string) => {
          manager.hide(id)
          manager.show({
            type: 'error',
            message: errorMessage,
            duration: 0,
          })
        },
        hide: () => {
          manager.hide(id)
        },
      }
    },

    // 分组通知
    group: (groupId: string, notifications: NotificationOptions[]) => {
      return notifications.map(notification =>
        manager.show({
          ...notification,
          group: groupId,
        })
      )
    },

    // 清除分组
    clearGroup: (groupId: string) => {
      const allNotifications = manager.getAll()
      allNotifications.forEach((notification) => {
        if (notification.group === groupId) {
          // 需要通过某种方式获取通知ID来隐藏
        }
      })
    },
  }
}
