/**
 * Toast 通知系统
 * 用于显示操作成功、错误、警告等提示信息
 */

import { createLucideIcon } from '../../utils/icons'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  type?: ToastType
  duration?: number
  closable?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export interface ToastItem {
  id: string
  message: string
  type: ToastType
  duration: number
  closable: boolean
  timestamp: number
  element?: HTMLElement
  timer?: number
}

/**
 * Toast 管理器
 */
export class ToastManager {
  private container: HTMLElement | null = null
  private toasts: Map<string, ToastItem> = new Map()
  private position: ToastOptions['position'] = 'top-right'
  private maxToasts = 5

  constructor(options: { position?: ToastOptions['position']; maxToasts?: number } = {}) {
    this.position = options.position || 'top-right'
    this.maxToasts = options.maxToasts || 5
    this.createContainer()
  }

  /**
   * 创建Toast容器
   */
  private createContainer(): void {
    if (this.container) return

    this.container = document.createElement('div')
    this.container.className = `ldesign-toast-container ldesign-toast-${this.position}`
    this.container.style.cssText = `
      position: fixed;
      z-index: 9999;
      pointer-events: none;
      ${this.getPositionStyles()}
    `
    document.body.appendChild(this.container)
  }

  /**
   * 获取位置样式
   */
  private getPositionStyles(): string {
    switch (this.position) {
      case 'top-right':
        return 'top: 20px; right: 20px;'
      case 'top-left':
        return 'top: 20px; left: 20px;'
      case 'bottom-right':
        return 'bottom: 20px; right: 20px;'
      case 'bottom-left':
        return 'bottom: 20px; left: 20px;'
      case 'top-center':
        return 'top: 20px; left: 50%; transform: translateX(-50%);'
      case 'bottom-center':
        return 'bottom: 20px; left: 50%; transform: translateX(-50%);'
      default:
        return 'top: 20px; right: 20px;'
    }
  }

  /**
   * 显示Toast
   */
  show(message: string, options: ToastOptions = {}): string {
    const {
      type = 'info',
      duration = 3000,
      closable = true
    } = options

    const id = this.generateId()
    const toast: ToastItem = {
      id,
      message,
      type,
      duration,
      closable,
      timestamp: Date.now()
    }

    // 如果超过最大数量，移除最旧的Toast
    if (this.toasts.size >= this.maxToasts) {
      const oldestId = Array.from(this.toasts.keys())[0]
      this.remove(oldestId)
    }

    this.toasts.set(id, toast)
    this.renderToast(toast)

    // 设置自动关闭
    if (duration > 0) {
      toast.timer = window.setTimeout(() => {
        this.remove(id)
      }, duration)
    }

    return id
  }

  /**
   * 渲染Toast元素
   */
  private renderToast(toast: ToastItem): void {
    if (!this.container) return

    const element = document.createElement('div')
    element.className = `ldesign-toast ldesign-toast-${toast.type}`
    element.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      margin-bottom: 8px;
      background: var(--ldesign-bg-color-container, #ffffff);
      border: 1px solid var(--ldesign-border-color, #e5e5e5);
      border-radius: var(--ls-border-radius-base, 6px);
      box-shadow: var(--ldesign-shadow-2, 0 4px 20px rgba(0, 0, 0, 0.08));
      pointer-events: auto;
      min-width: 300px;
      max-width: 400px;
      font-size: 14px;
      line-height: 1.4;
      animation: ldesign-toast-slide-in 0.3s ease-out;
      ${this.getToastTypeStyles(toast.type)}
    `

    // 图标
    const icon = document.createElement('div')
    icon.className = 'ldesign-toast-icon'
    icon.innerHTML = this.getToastIcon(toast.type)
    icon.style.cssText = `
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    // 消息内容
    const content = document.createElement('div')
    content.className = 'ldesign-toast-content'
    content.textContent = toast.message
    content.style.cssText = `
      flex: 1;
      color: var(--ldesign-text-color-primary, rgba(0, 0, 0, 0.9));
    `

    element.appendChild(icon)
    element.appendChild(content)

    // 关闭按钮
    if (toast.closable) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'ldesign-toast-close'
      closeBtn.innerHTML = createLucideIcon('x', { size: 14 })
      closeBtn.style.cssText = `
        flex-shrink: 0;
        background: none;
        border: none;
        cursor: pointer;
        padding: 2px;
        border-radius: 2px;
        color: var(--ldesign-text-color-secondary, rgba(0, 0, 0, 0.7));
        transition: all 0.2s ease;
      `
      closeBtn.addEventListener('click', () => this.remove(toast.id))
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'var(--ldesign-bg-color-component-hover, #f8f8f8)'
      })
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'none'
      })
      element.appendChild(closeBtn)
    }

    toast.element = element
    this.container.appendChild(element)

    // 添加动画样式
    this.addAnimationStyles()
  }

  /**
   * 获取Toast类型样式
   */
  private getToastTypeStyles(type: ToastType): string {
    switch (type) {
      case 'success':
        return `
          border-left: 4px solid var(--ldesign-success-color, #52c41a);
          background: var(--ldesign-success-color-1, #ebfaeb);
        `
      case 'error':
        return `
          border-left: 4px solid var(--ldesign-error-color, #ff4d4f);
          background: var(--ldesign-error-color-1, #fde8e8);
        `
      case 'warning':
        return `
          border-left: 4px solid var(--ldesign-warning-color, #faad14);
          background: var(--ldesign-warning-color-1, #fff8e6);
        `
      case 'info':
      default:
        return `
          border-left: 4px solid var(--ldesign-brand-color, #722ED1);
          background: var(--ldesign-brand-color-1, #f1ecf9);
        `
    }
  }

  /**
   * 获取Toast图标
   */
  private getToastIcon(type: ToastType): string {
    switch (type) {
      case 'success':
        return createLucideIcon('check-square', { 
          size: 16, 
          color: 'var(--ldesign-success-color, #52c41a)' 
        })
      case 'error':
        return createLucideIcon('x', { 
          size: 16, 
          color: 'var(--ldesign-error-color, #ff4d4f)' 
        })
      case 'warning':
        return createLucideIcon('triangle', { 
          size: 16, 
          color: 'var(--ldesign-warning-color, #faad14)' 
        })
      case 'info':
      default:
        return createLucideIcon('help-circle', { 
          size: 16, 
          color: 'var(--ldesign-brand-color, #722ED1)' 
        })
    }
  }

  /**
   * 添加动画样式
   */
  private addAnimationStyles(): void {
    if (document.getElementById('ldesign-toast-styles')) return

    const style = document.createElement('style')
    style.id = 'ldesign-toast-styles'
    style.textContent = `
      @keyframes ldesign-toast-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      @keyframes ldesign-toast-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  /**
   * 移除Toast
   */
  remove(id: string): void {
    const toast = this.toasts.get(id)
    if (!toast) return

    if (toast.timer) {
      clearTimeout(toast.timer)
    }

    if (toast.element) {
      toast.element.style.animation = 'ldesign-toast-slide-out 0.3s ease-in'
      setTimeout(() => {
        if (toast.element && this.container?.contains(toast.element)) {
          this.container.removeChild(toast.element)
        }
      }, 300)
    }

    this.toasts.delete(id)
  }

  /**
   * 清空所有Toast
   */
  clear(): void {
    this.toasts.forEach((_, id) => this.remove(id))
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 销毁Toast管理器
   */
  destroy(): void {
    this.clear()
    if (this.container && document.body.contains(this.container)) {
      document.body.removeChild(this.container)
    }
    this.container = null
  }

  // 便捷方法
  success(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'success' })
  }

  error(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'error' })
  }

  warning(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'warning' })
  }

  info(message: string, options?: Omit<ToastOptions, 'type'>): string {
    return this.show(message, { ...options, type: 'info' })
  }
}

// 全局Toast实例
let globalToast: ToastManager | null = null

/**
 * 获取全局Toast实例
 */
export function getGlobalToast(): ToastManager {
  if (!globalToast) {
    globalToast = new ToastManager()
  }
  return globalToast
}

// 导出便捷方法
export const toast = {
  show: (message: string, options?: ToastOptions) => getGlobalToast().show(message, options),
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => getGlobalToast().success(message, options),
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => getGlobalToast().error(message, options),
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => getGlobalToast().warning(message, options),
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => getGlobalToast().info(message, options),
  clear: () => getGlobalToast().clear()
}
