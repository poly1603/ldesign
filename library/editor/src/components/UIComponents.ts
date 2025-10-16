/**
 * 统一的UI组件库
 * 提供模态框、下拉菜单、工具提示等通用组件
 */

import { getLucideIcon } from '../ui/icons/lucide'

export interface ModalOptions {
  title?: string
  content: string | HTMLElement
  width?: number
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  onConfirm?: () => void | Promise<void>
  onCancel?: () => void
  className?: string
}

export interface DropdownOptions {
  items: DropdownItem[]
  trigger?: HTMLElement
  position?: 'bottom' | 'top' | 'left' | 'right' | 'auto'
  width?: number
  className?: string
}

export interface DropdownItem {
  label: string
  value?: any
  icon?: string
  divider?: boolean
  disabled?: boolean
  onClick?: () => void
  submenu?: DropdownItem[]
}

export class Modal {
  private container: HTMLDivElement
  private overlay: HTMLDivElement
  private options: ModalOptions

  constructor(options: ModalOptions) {
    this.options = {
      confirmText: '确定',
      cancelText: '取消',
      showCancel: true,
      width: 400,
      ...options
    }
    
    this.overlay = this.createOverlay()
    this.container = this.createContainer()
    
    document.body.appendChild(this.overlay)
    document.body.appendChild(this.container)
    
    this.show()
  }

  private createOverlay(): HTMLDivElement {
    const overlay = document.createElement('div')
    overlay.className = 'ldesign-modal-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9998;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(4px);
    `
    
    overlay.addEventListener('click', () => {
      if (this.options.onCancel) {
        this.options.onCancel()
      }
      this.close()
    })
    
    return overlay
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.className = `ldesign-modal ${this.options.className || ''}`
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      width: ${this.options.width}px;
      max-width: 90vw;
      max-height: 90vh;
      background: white;
      border-radius: 12px;
      box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.18);
      z-index: 9999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    `
    
    // Header
    if (this.options.title) {
      const header = document.createElement('div')
      header.className = 'ldesign-modal-header'
      header.style.cssText = `
        padding: 20px 24px;
        border-bottom: 1px solid #e5e7eb;
        position: relative;
      `
      
      const title = document.createElement('h3')
      title.style.cssText = `
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #111827;
      `
      title.textContent = this.options.title
      
      const closeBtn = document.createElement('button')
      closeBtn.className = 'ldesign-modal-close'
      closeBtn.innerHTML = '×'
      closeBtn.style.cssText = `
        position: absolute;
        top: 50%;
        right: 20px;
        transform: translateY(-50%);
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      closeBtn.onmouseover = () => {
        closeBtn.style.background = '#f3f4f6'
        closeBtn.style.color = '#111827'
      }
      closeBtn.onmouseout = () => {
        closeBtn.style.background = 'transparent'
        closeBtn.style.color = '#6b7280'
      }
      closeBtn.onclick = () => {
        if (this.options.onCancel) {
          this.options.onCancel()
        }
        this.close()
      }
      
      header.appendChild(title)
      header.appendChild(closeBtn)
      container.appendChild(header)
    }
    
    // Body
    const body = document.createElement('div')
    body.className = 'ldesign-modal-body'
    body.style.cssText = `
      padding: 24px;
      overflow-y: auto;
      max-height: calc(90vh - 140px);
    `
    
    if (typeof this.options.content === 'string') {
      body.innerHTML = this.options.content
    } else {
      body.appendChild(this.options.content)
    }
    container.appendChild(body)
    
    // Footer
    if (this.options.showCancel || this.options.onConfirm) {
      const footer = document.createElement('div')
      footer.className = 'ldesign-modal-footer'
      footer.style.cssText = `
        padding: 16px 24px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      `
      
      if (this.options.showCancel) {
        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'ldesign-btn-cancel'
        cancelBtn.textContent = this.options.cancelText!
        cancelBtn.style.cssText = `
          padding: 8px 16px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: white;
          color: #4b5563;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        `
        cancelBtn.onmouseover = () => {
          cancelBtn.style.background = '#f9fafb'
          cancelBtn.style.borderColor = '#9ca3af'
        }
        cancelBtn.onmouseout = () => {
          cancelBtn.style.background = 'white'
          cancelBtn.style.borderColor = '#d1d5db'
        }
        cancelBtn.onclick = () => {
          if (this.options.onCancel) {
            this.options.onCancel()
          }
          this.close()
        }
        footer.appendChild(cancelBtn)
      }
      
      if (this.options.onConfirm) {
        const confirmBtn = document.createElement('button')
        confirmBtn.className = 'ldesign-btn-confirm'
        confirmBtn.textContent = this.options.confirmText!
        confirmBtn.style.cssText = `
          padding: 8px 16px;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        `
        confirmBtn.onmouseover = () => {
          confirmBtn.style.background = '#2563eb'
        }
        confirmBtn.onmouseout = () => {
          confirmBtn.style.background = '#3b82f6'
        }
        confirmBtn.onclick = async () => {
          if (this.options.onConfirm) {
            await this.options.onConfirm()
            this.close()
          }
        }
        footer.appendChild(confirmBtn)
      }
      
      container.appendChild(footer)
    }
    
    // ESC关闭
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (this.options.onCancel) {
          this.options.onCancel()
        }
        this.close()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)
    
    return container
  }

  private show(): void {
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '1'
      this.container.style.opacity = '1'
      this.container.style.transform = 'translate(-50%, -50%) scale(1)'
    })
  }

  public close(): void {
    this.overlay.style.opacity = '0'
    this.container.style.opacity = '0'
    this.container.style.transform = 'translate(-50%, -50%) scale(0.9)'
    
    setTimeout(() => {
      document.body.removeChild(this.overlay)
      document.body.removeChild(this.container)
    }, 300)
  }

  public static confirm(message: string, title?: string): Promise<boolean> {
    return new Promise((resolve) => {
      new Modal({
        title: title || '确认',
        content: message,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      })
    })
  }

  public static alert(message: string, title?: string): Promise<void> {
    return new Promise((resolve) => {
      new Modal({
        title: title || '提示',
        content: message,
        showCancel: false,
        onConfirm: () => resolve()
      })
    })
  }
}

export class Dropdown {
  private container: HTMLDivElement
  private options: DropdownOptions
  private isVisible = false

  constructor(options: DropdownOptions) {
    this.options = {
      position: 'auto',
      width: 200,
      ...options
    }
    
    this.container = this.createContainer()
    document.body.appendChild(this.container)
    
    if (this.options.trigger) {
      this.attachTrigger()
    }
  }

  private createContainer(): HTMLDivElement {
    const container = document.createElement('div')
    container.className = `ldesign-dropdown ${this.options.className || ''}`
    container.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      padding: 4px;
      min-width: ${this.options.width}px;
      z-index: 9000;
      display: none;
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.2s ease;
    `
    
    this.options.items.forEach(item => {
      if (item.divider) {
        const divider = document.createElement('div')
        divider.className = 'ldesign-dropdown-divider'
        divider.style.cssText = `
          height: 1px;
          background: #e5e7eb;
          margin: 4px 0;
        `
        container.appendChild(divider)
      } else {
        const menuItem = this.createMenuItem(item)
        container.appendChild(menuItem)
      }
    })
    
    return container
  }

  private createMenuItem(item: DropdownItem): HTMLDivElement {
    const menuItem = document.createElement('div')
    menuItem.className = 'ldesign-dropdown-item'
    menuItem.style.cssText = `
      display: flex;
      align-items: center;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: ${item.disabled ? 'not-allowed' : 'pointer'};
      opacity: ${item.disabled ? '0.5' : '1'};
      transition: all 0.15s;
      font-size: 13px;
      color: #374151;
      position: relative;
    `
    
    if (!item.disabled) {
      menuItem.onmouseover = () => {
        menuItem.style.background = '#f3f4f6'
        menuItem.style.color = '#111827'
      }
      menuItem.onmouseout = () => {
        menuItem.style.background = 'transparent'
        menuItem.style.color = '#374151'
      }
      menuItem.onclick = () => {
        if (item.onClick) {
          item.onClick()
        }
        this.hide()
      }
    }
    
    // Icon
    if (item.icon) {
      const icon = document.createElement('span')
      icon.className = 'ldesign-dropdown-icon'
      icon.innerHTML = item.icon
      icon.style.cssText = `
        margin-right: 8px;
        display: flex;
        align-items: center;
      `
      menuItem.appendChild(icon)
    }
    
    // Label
    const label = document.createElement('span')
    label.textContent = item.label
    label.style.flex = '1'
    menuItem.appendChild(label)
    
    // Submenu
    if (item.submenu) {
      const arrow = document.createElement('span')
      arrow.innerHTML = getLucideIcon('chevronRight')
      arrow.style.cssText = `
        margin-left: 8px;
        opacity: 0.5;
      `
      menuItem.appendChild(arrow)
      
      const submenu = new Dropdown({
        items: item.submenu,
        position: 'right'
      })
      
      menuItem.onmouseenter = () => {
        const rect = menuItem.getBoundingClientRect()
        submenu.showAt(rect.right, rect.top)
      }
      
      menuItem.onmouseleave = () => {
        setTimeout(() => submenu.hide(), 100)
      }
    }
    
    return menuItem
  }

  private attachTrigger(): void {
    if (!this.options.trigger) return
    
    this.options.trigger.addEventListener('click', (e) => {
      e.stopPropagation()
      if (this.isVisible) {
        this.hide()
      } else {
        const rect = this.options.trigger!.getBoundingClientRect()
        this.showAt(rect.left, rect.bottom + 4)
      }
    })
    
    document.addEventListener('click', () => {
      if (this.isVisible) {
        this.hide()
      }
    })
  }

  public showAt(x: number, y: number): void {
    this.container.style.left = `${x}px`
    this.container.style.top = `${y}px`
    this.container.style.display = 'block'
    
    requestAnimationFrame(() => {
      this.container.style.opacity = '1'
      this.container.style.transform = 'translateY(0)'
    })
    
    this.isVisible = true
    
    // 调整位置防止超出屏幕
    const rect = this.container.getBoundingClientRect()
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight
    
    if (rect.right > windowWidth) {
      this.container.style.left = `${windowWidth - rect.width - 10}px`
    }
    
    if (rect.bottom > windowHeight) {
      this.container.style.top = `${windowHeight - rect.height - 10}px`
    }
  }

  public hide(): void {
    this.container.style.opacity = '0'
    this.container.style.transform = 'translateY(-10px)'
    
    setTimeout(() => {
      this.container.style.display = 'none'
      this.isVisible = false
    }, 200)
  }

  public destroy(): void {
    document.body.removeChild(this.container)
  }
}

export class Toast {
  public static show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 3000): void {
    const toast = document.createElement('div')
    toast.className = `ldesign-toast ldesign-toast-${type}`
    
    const colors = {
      success: { bg: '#10b981', icon: '✓' },
      error: { bg: '#ef4444', icon: '✕' },
      warning: { bg: '#f59e0b', icon: '!' },
      info: { bg: '#3b82f6', icon: 'i' }
    }
    
    const color = colors[type]
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(-100%);
      background: ${color.bg};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 500;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `
    
    const icon = document.createElement('span')
    icon.textContent = color.icon
    icon.style.cssText = `
      width: 20px;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    `
    
    const text = document.createElement('span')
    text.textContent = message
    
    toast.appendChild(icon)
    toast.appendChild(text)
    document.body.appendChild(toast)
    
    // 动画显示
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)'
    })
    
    // 自动隐藏
    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(-100%)'
      setTimeout(() => {
        document.body.removeChild(toast)
      }, 300)
    }, duration)
  }
}