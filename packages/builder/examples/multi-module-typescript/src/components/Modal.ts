/**
 * 模态框组件
 */

/**
 * 模态框属性接口
 */
export interface ModalProps {
  title: string
  content: string
  width?: number
  height?: number
  closable?: boolean
  maskClosable?: boolean
  onClose?: () => void
  onConfirm?: () => void
  onCancel?: () => void
}

/**
 * 模态框类
 */
export class Modal {
  private props: ModalProps
  private element: HTMLDivElement | null = null
  private isVisible = false

  constructor(props: ModalProps) {
    this.props = { 
      closable: true,
      maskClosable: true,
      ...props 
    }
  }

  /**
   * 显示模态框
   */
  show(): void {
    if (this.isVisible) return

    this.createElement()
    document.body.appendChild(this.element!)
    this.isVisible = true

    // 添加动画效果
    setTimeout(() => {
      this.element?.classList.add('modal-show')
    }, 10)
  }

  /**
   * 隐藏模态框
   */
  hide(): void {
    if (!this.isVisible || !this.element) return

    this.element.classList.remove('modal-show')
    
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element)
      }
      this.isVisible = false
    }, 300)
  }

  /**
   * 更新内容
   */
  updateContent(content: string): void {
    this.props.content = content
    if (this.element) {
      const contentEl = this.element.querySelector('.modal-content')
      if (contentEl) {
        contentEl.textContent = content
      }
    }
  }

  /**
   * 创建 DOM 元素
   */
  private createElement(): void {
    this.element = document.createElement('div')
    this.element.className = 'modal-overlay'
    
    const modal = document.createElement('div')
    modal.className = 'modal'
    
    if (this.props.width) {
      modal.style.width = `${this.props.width}px`
    }
    
    if (this.props.height) {
      modal.style.height = `${this.props.height}px`
    }

    // 标题
    const header = document.createElement('div')
    header.className = 'modal-header'
    header.innerHTML = `
      <h3>${this.props.title}</h3>
      ${this.props.closable ? '<button class="modal-close">×</button>' : ''}
    `

    // 内容
    const content = document.createElement('div')
    content.className = 'modal-content'
    content.textContent = this.props.content

    // 底部按钮
    const footer = document.createElement('div')
    footer.className = 'modal-footer'
    footer.innerHTML = `
      <button class="btn btn-secondary modal-cancel">取消</button>
      <button class="btn btn-primary modal-confirm">确定</button>
    `

    modal.appendChild(header)
    modal.appendChild(content)
    modal.appendChild(footer)
    this.element.appendChild(modal)

    this.bindEvents()
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.element) return

    // 遮罩点击关闭
    if (this.props.maskClosable) {
      this.element.addEventListener('click', (e) => {
        if (e.target === this.element) {
          this.handleClose()
        }
      })
    }

    // 关闭按钮
    const closeBtn = this.element.querySelector('.modal-close')
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.handleClose())
    }

    // 取消按钮
    const cancelBtn = this.element.querySelector('.modal-cancel')
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel())
    }

    // 确定按钮
    const confirmBtn = this.element.querySelector('.modal-confirm')
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.handleConfirm())
    }
  }

  /**
   * 处理关闭
   */
  private handleClose(): void {
    this.hide()
    this.props.onClose?.()
  }

  /**
   * 处理取消
   */
  private handleCancel(): void {
    this.hide()
    this.props.onCancel?.()
  }

  /**
   * 处理确认
   */
  private handleConfirm(): void {
    this.props.onConfirm?.()
  }
}

/**
 * 创建模态框实例
 */
export function createModal(props: ModalProps): Modal {
  return new Modal(props)
}
