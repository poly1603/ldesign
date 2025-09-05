/**
 * 组件模块
 */

// 导入样式
import './styles.less'

// 类型定义
export interface ComponentOptions {
  className?: string
  style?: Partial<CSSStyleDeclaration>
  onClick?: (event: Event) => void
}

export interface ToastOptions {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error'
  duration?: number
  position?: 'top' | 'center' | 'bottom'
}

export interface ModalOptions {
  title?: string
  content: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

// 基础组件类
export class BaseComponent {
  protected element: HTMLElement
  protected options: ComponentOptions

  constructor(tagName: string = 'div', options: ComponentOptions = {}) {
    this.element = document.createElement(tagName)
    this.options = options
    this.init()
  }

  protected init(): void {
    if (this.options.className) {
      this.element.className = this.options.className
    }

    if (this.options.style) {
      Object.assign(this.element.style, this.options.style)
    }

    if (this.options.onClick) {
      this.element.addEventListener('click', this.options.onClick)
    }
  }

  public getElement(): HTMLElement {
    return this.element
  }

  public appendTo(parent: HTMLElement): this {
    parent.appendChild(this.element)
    return this
  }

  public remove(): void {
    this.element.remove()
  }

  public addClass(className: string): this {
    this.element.classList.add(className)
    return this
  }

  public removeClass(className: string): this {
    this.element.classList.remove(className)
    return this
  }

  public toggleClass(className: string): this {
    this.element.classList.toggle(className)
    return this
  }
}

// Toast 组件
export class Toast extends BaseComponent {
  private timer?: number

  constructor(options: ToastOptions) {
    super('div', {
      className: `ld-toast ld-toast--${options.type || 'info'} ld-toast--${options.position || 'top'}`
    })

    this.element.textContent = options.message
    this.show(options.duration || 3000)
  }

  private show(duration: number): void {
    document.body.appendChild(this.element)
    
    // 触发动画
    requestAnimationFrame(() => {
      this.addClass('ld-toast--show')
    })

    // 自动隐藏
    this.timer = window.setTimeout(() => {
      this.hide()
    }, duration)
  }

  private hide(): void {
    this.removeClass('ld-toast--show')
    
    setTimeout(() => {
      this.remove()
    }, 300) // 等待动画完成
  }

  public static show(options: ToastOptions): Toast {
    return new Toast(options)
  }

  public static info(message: string, duration?: number): Toast {
    return new Toast({ message, type: 'info', duration })
  }

  public static success(message: string, duration?: number): Toast {
    return new Toast({ message, type: 'success', duration })
  }

  public static warning(message: string, duration?: number): Toast {
    return new Toast({ message, type: 'warning', duration })
  }

  public static error(message: string, duration?: number): Toast {
    return new Toast({ message, type: 'error', duration })
  }
}

// Modal 组件
export class Modal extends BaseComponent {
  private overlay: HTMLElement
  private dialog: HTMLElement
  private header?: HTMLElement
  private body: HTMLElement
  private footer?: HTMLElement

  constructor(options: ModalOptions) {
    super('div', { className: 'ld-modal' })

    this.overlay = document.createElement('div')
    this.overlay.className = 'ld-modal-overlay'

    this.dialog = document.createElement('div')
    this.dialog.className = 'ld-modal-dialog'

    this.body = document.createElement('div')
    this.body.className = 'ld-modal-body'
    this.body.innerHTML = options.content

    this.setupModal(options)
    this.bindEvents()
  }

  private setupModal(options: ModalOptions): void {
    // 标题
    if (options.title) {
      this.header = document.createElement('div')
      this.header.className = 'ld-modal-header'
      this.header.innerHTML = `
        <h3 class="ld-modal-title">${options.title}</h3>
        <button class="ld-modal-close" type="button">&times;</button>
      `
      this.dialog.appendChild(this.header)
    }

    // 内容
    this.dialog.appendChild(this.body)

    // 按钮
    if (options.confirmText || options.cancelText) {
      this.footer = document.createElement('div')
      this.footer.className = 'ld-modal-footer'

      if (options.cancelText) {
        const cancelBtn = document.createElement('button')
        cancelBtn.className = 'ld-btn ld-btn--secondary'
        cancelBtn.textContent = options.cancelText
        cancelBtn.addEventListener('click', () => {
          options.onCancel?.()
          this.hide()
        })
        this.footer.appendChild(cancelBtn)
      }

      if (options.confirmText) {
        const confirmBtn = document.createElement('button')
        confirmBtn.className = 'ld-btn ld-btn--primary'
        confirmBtn.textContent = options.confirmText
        confirmBtn.addEventListener('click', () => {
          options.onConfirm?.()
          this.hide()
        })
        this.footer.appendChild(confirmBtn)
      }

      this.dialog.appendChild(this.footer)
    }

    this.element.appendChild(this.overlay)
    this.element.appendChild(this.dialog)
  }

  private bindEvents(): void {
    // 点击遮罩关闭
    this.overlay.addEventListener('click', () => {
      this.hide()
    })

    // 点击关闭按钮
    const closeBtn = this.element.querySelector('.ld-modal-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hide()
      })
    }

    // ESC 键关闭
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        this.hide()
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    document.addEventListener('keydown', handleKeydown)
  }

  public show(): this {
    document.body.appendChild(this.element)
    document.body.style.overflow = 'hidden'
    
    requestAnimationFrame(() => {
      this.addClass('ld-modal--show')
    })

    return this
  }

  public hide(): void {
    this.removeClass('ld-modal--show')
    document.body.style.overflow = ''
    
    setTimeout(() => {
      this.remove()
    }, 300)
  }

  public static show(options: ModalOptions): Modal {
    return new Modal(options).show()
  }

  public static confirm(options: Omit<ModalOptions, 'confirmText' | 'cancelText'> & {
    confirmText?: string
    cancelText?: string
  }): Promise<boolean> {
    return new Promise((resolve) => {
      const modal = new Modal({
        ...options,
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      })
      modal.show()
    })
  }
}

// Loading 组件
export class Loading extends BaseComponent {
  constructor(text: string = '加载中...') {
    super('div', { className: 'ld-loading' })

    this.element.innerHTML = `
      <div class="ld-loading-spinner"></div>
      <div class="ld-loading-text">${text}</div>
    `
  }

  public show(): this {
    document.body.appendChild(this.element)
    document.body.style.overflow = 'hidden'
    
    requestAnimationFrame(() => {
      this.addClass('ld-loading--show')
    })

    return this
  }

  public hide(): void {
    this.removeClass('ld-loading--show')
    document.body.style.overflow = ''
    
    setTimeout(() => {
      this.remove()
    }, 300)
  }

  public static show(text?: string): Loading {
    return new Loading(text).show()
  }
}
