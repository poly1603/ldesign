/**
 * 统一的对话框组件
 * 提供一致的对话框接口，替代分散的对话框实现
 */

export interface UnifiedDialogField {
  id: string
  type: 'text' | 'email' | 'url' | 'textarea' | 'select' | 'checkbox' | 'number' | 'password'
  label: string
  placeholder?: string
  value?: any
  defaultValue?: any
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  rows?: number // for textarea
  options?: Array<{ label: string; value: any }> // for select
  validator?: (value: any) => string | null
  onChange?: (value: any) => void
  helpText?: string // 帮助文本
  pattern?: string // HTML5 pattern
  min?: number // for number input
  max?: number // for number input
  step?: number // for number input
  accept?: string // for file input (future extension)
}

export interface UnifiedDialogButton {
  id: string
  label: string
  type?: 'primary' | 'secondary' | 'danger' | 'success' | 'link'
  disabled?: boolean
  loading?: boolean
  onClick?: (dialog: UnifiedDialog) => void | Promise<void>
  closeOnClick?: boolean // 点击后是否自动关闭对话框
}

export interface UnifiedDialogConfig {
  // 基本配置
  title: string
  subtitle?: string
  icon?: string | HTMLElement // 标题栏图标
  content?: string | HTMLElement // 自定义内容
  
  // 表单字段
  fields?: UnifiedDialogField[]
  
  // 按钮配置
  buttons?: UnifiedDialogButton[]
  showCloseButton?: boolean
  
  // 行为配置
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
  preventScroll?: boolean // 阻止背景滚动
  
  // 样式配置
  width?: number | string
  maxWidth?: number | string
  height?: number | string
  maxHeight?: number | string
  className?: string
  centered?: boolean
  animation?: boolean
  
  // 回调函数
  onOpen?: () => void
  onClose?: () => void
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  beforeClose?: () => boolean | Promise<boolean> // 返回false阻止关闭
}

export class UnifiedDialog {
  private config: UnifiedDialogConfig
  private overlay: HTMLElement
  private dialog: HTMLElement
  private header: HTMLElement
  private body: HTMLElement
  private footer: HTMLElement
  private toastContainer: HTMLElement
  private fieldValues: Map<string, any> = new Map()
  private fieldElements: Map<string, HTMLElement> = new Map()
  private buttonElements: Map<string, HTMLButtonElement> = new Map()
  private isOpen: boolean = false
  private isClosing: boolean = false
  private toastQueue: Array<{ message: string; type: 'error' | 'success' | 'warning' | 'info'; id: string }> = []
  private activeToasts: Map<string, HTMLElement> = new Map()

  constructor(config: UnifiedDialogConfig) {
    this.config = this.mergeConfig(config)
    this.init()
  }

  private mergeConfig(config: UnifiedDialogConfig): UnifiedDialogConfig {
    return {
      showCloseButton: true,
      closeOnOverlayClick: true,
      closeOnEscape: true,
      preventScroll: true,
      centered: true,
      animation: true,
      width: config.width || 520,  // 默认宽度520px
      maxWidth: config.maxWidth || '90%',
      maxHeight: config.maxHeight || '90vh',
      buttons: config.buttons || [
        { id: 'cancel', label: '取消', type: 'secondary', closeOnClick: true },
        { id: 'confirm', label: '确定', type: 'primary', closeOnClick: false }
      ],
      ...config
    }
  }

  private init(): void {
    this.createElements()
    this.bindEvents()
    this.initFieldValues()
  }

  private createElements(): void {
    // 创建遮罩层
    this.overlay = document.createElement('div')
    this.overlay.className = 'unified-dialog-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    `

    // 创建对话框容器
    this.dialog = document.createElement('div')
    this.dialog.className = `unified-dialog ${this.config.className || ''}`
    this.dialog.setAttribute('role', 'dialog')
    this.dialog.setAttribute('aria-modal', 'true')
    this.dialog.setAttribute('aria-labelledby', 'dialog-title')
    this.dialog.style.cssText = `
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
      width: ${typeof this.config.width === 'number' ? `${this.config.width}px` : this.config.width};
      min-width: 480px;
      max-width: ${typeof this.config.maxWidth === 'number' ? `${this.config.maxWidth}px` : this.config.maxWidth};
      max-height: ${typeof this.config.maxHeight === 'number' ? `${this.config.maxHeight}px` : this.config.maxHeight};
    `

    if (this.config.height) {
      this.dialog.style.height = typeof this.config.height === 'number' 
        ? `${this.config.height}px` 
        : this.config.height
    }

    // 创建头部
    this.createHeader()
    
    // 创建主体
    this.createBody()
    
    // 创建底部
    this.createFooter()
    
    // 创建Toast容器
    this.createToastContainer()

    // 组装
    this.overlay.appendChild(this.dialog)
    document.body.appendChild(this.overlay)
  }
  
  private createToastContainer(): void {
    this.toastContainer = document.createElement('div')
    this.toastContainer.className = 'unified-dialog-toast-container'
    this.toastContainer.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      left: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
      z-index: 100;
    `
    this.dialog.appendChild(this.toastContainer)
  }

  private createHeader(): void {
    this.header = document.createElement('div')
    this.header.className = 'unified-dialog-header'
    this.header.style.cssText = `
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 12px;
    `

    // 图标
    if (this.config.icon) {
      const iconWrapper = document.createElement('div')
      iconWrapper.className = 'unified-dialog-icon'
      iconWrapper.style.cssText = `
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #3b82f6;
      `
      
      if (typeof this.config.icon === 'string') {
        iconWrapper.innerHTML = this.config.icon
      } else {
        iconWrapper.appendChild(this.config.icon)
      }
      
      this.header.appendChild(iconWrapper)
    }

    // 标题容器
    const titleContainer = document.createElement('div')
    titleContainer.style.cssText = 'flex: 1;'

    // 标题
    const title = document.createElement('h2')
    title.id = 'dialog-title'
    title.className = 'unified-dialog-title'
    title.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #111827;
    `
    title.textContent = this.config.title
    titleContainer.appendChild(title)

    // 副标题
    if (this.config.subtitle) {
      const subtitle = document.createElement('p')
      subtitle.className = 'unified-dialog-subtitle'
      subtitle.style.cssText = `
        margin: 4px 0 0 0;
        font-size: 14px;
        color: #6b7280;
      `
      subtitle.textContent = this.config.subtitle
      titleContainer.appendChild(subtitle)
    }

    this.header.appendChild(titleContainer)

    // 关闭按钮
    if (this.config.showCloseButton) {
      const closeBtn = document.createElement('button')
      closeBtn.className = 'unified-dialog-close'
      closeBtn.innerHTML = '×'
      closeBtn.setAttribute('aria-label', '关闭对话框')
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        transition: all 0.2s;
      `
      
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#f3f4f6'
        closeBtn.style.color = '#111827'
      })
      
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'none'
        closeBtn.style.color = '#6b7280'
      })
      
      closeBtn.addEventListener('click', () => this.close())
      this.header.appendChild(closeBtn)
    }

    this.dialog.appendChild(this.header)
  }

  private createBody(): void {
    this.body = document.createElement('div')
    this.body.className = 'unified-dialog-body'
    this.body.style.cssText = `
      padding: 24px;
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
    `

    // 自定义内容
    if (this.config.content) {
      if (typeof this.config.content === 'string') {
        const contentDiv = document.createElement('div')
        contentDiv.className = 'unified-dialog-content'
        contentDiv.style.cssText = `
          width: 100%;
          box-sizing: border-box;
        `
        contentDiv.innerHTML = this.config.content
        this.body.appendChild(contentDiv)
      } else {
        this.config.content.style.width = '100%'
        this.config.content.style.boxSizing = 'border-box'
        this.body.appendChild(this.config.content)
      }
    }

    // 表单字段
    if (this.config.fields && this.config.fields.length > 0) {
      const form = document.createElement('form')
      form.className = 'unified-dialog-form'
      form.style.cssText = `
        width: 100%;
        box-sizing: border-box;
      `
      form.addEventListener('submit', (e) => {
        e.preventDefault()
        this.handleSubmit()
      })

      this.config.fields.forEach((field, index) => {
        const fieldGroup = this.createFieldElement(field)
        if (index > 0 && this.config.content) {
          fieldGroup.style.marginTop = '16px'
        }
        form.appendChild(fieldGroup)
      })

      this.body.appendChild(form)
    }

    this.dialog.appendChild(this.body)
  }

  private createFieldElement(field: UnifiedDialogField): HTMLElement {
    const fieldGroup = document.createElement('div')
    fieldGroup.className = 'unified-dialog-field-group'
    fieldGroup.dataset.fieldId = field.id
    fieldGroup.style.cssText = `
      margin-bottom: 16px;
      width: 100%;
      box-sizing: border-box;
    `

    // 标签
    if (field.type !== 'checkbox' || !field.label) {
      const label = document.createElement('label')
      label.className = 'unified-dialog-field-label'
      label.htmlFor = `field-${field.id}`
      label.style.cssText = `
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      `
      label.textContent = field.label
      
      if (field.required) {
        const required = document.createElement('span')
        required.style.cssText = 'color: #ef4444; margin-left: 4px;'
        required.textContent = '*'
        label.appendChild(required)
      }
      
      fieldGroup.appendChild(label)
    }

    // 输入控件
    let inputElement: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

    switch (field.type) {
      case 'textarea':
        inputElement = document.createElement('textarea')
        inputElement.rows = field.rows || 4
        inputElement.style.cssText = `
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        `
        break

      case 'select':
        inputElement = document.createElement('select')
        inputElement.style.cssText = `
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          background: white;
          cursor: pointer;
          box-sizing: border-box;
        `
        
        if (field.placeholder) {
          const placeholder = document.createElement('option')
          placeholder.value = ''
          placeholder.textContent = field.placeholder
          placeholder.disabled = true
          placeholder.selected = !field.value && !field.defaultValue
          inputElement.appendChild(placeholder)
        }
        
        if (field.options) {
          field.options.forEach(option => {
            const optionEl = document.createElement('option')
            optionEl.value = String(option.value)
            optionEl.textContent = option.label
            if (option.value === (field.value || field.defaultValue)) {
              optionEl.selected = true
            }
            inputElement.appendChild(optionEl)
          })
        }
        break

      case 'checkbox':
        const checkboxWrapper = document.createElement('div')
        checkboxWrapper.style.cssText = 'display: flex; align-items: center; gap: 8px;'
        
        inputElement = document.createElement('input')
        inputElement.type = 'checkbox'
        inputElement.style.cssText = `
          width: 18px;
          height: 18px;
          cursor: pointer;
        `
        
        if (field.value !== undefined || field.defaultValue !== undefined) {
          ;(inputElement as HTMLInputElement).checked = !!(field.value || field.defaultValue)
        }
        
        const checkboxLabel = document.createElement('label')
        checkboxLabel.htmlFor = `field-${field.id}`
        checkboxLabel.style.cssText = `
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          user-select: none;
        `
        checkboxLabel.textContent = field.label
        
        if (field.required) {
          const required = document.createElement('span')
          required.style.cssText = 'color: #ef4444; margin-left: 4px;'
          required.textContent = '*'
          checkboxLabel.appendChild(required)
        }
        
        checkboxWrapper.appendChild(inputElement)
        checkboxWrapper.appendChild(checkboxLabel)
        fieldGroup.appendChild(checkboxWrapper)
        break

      default:
        inputElement = document.createElement('input')
        inputElement.type = field.type
        inputElement.style.cssText = `
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
          box-sizing: border-box;
        `
        
        if (field.type === 'number') {
          if (field.min !== undefined) inputElement.min = String(field.min)
          if (field.max !== undefined) inputElement.max = String(field.max)
          if (field.step !== undefined) inputElement.step = String(field.step)
        }
    }

    // 通用属性设置
    inputElement.id = `field-${field.id}`
    inputElement.name = field.id
    
    if (field.placeholder && field.type !== 'select') {
      inputElement.placeholder = field.placeholder
    }
    
    if (field.value !== undefined && field.type !== 'checkbox') {
      inputElement.value = String(field.value)
    } else if (field.defaultValue !== undefined && field.type !== 'checkbox') {
      inputElement.value = String(field.defaultValue)
    }
    
    if (field.disabled) {
      inputElement.disabled = true
    }
    
    if (field.readonly && 'readOnly' in inputElement) {
      inputElement.readOnly = true
    }
    
    if (field.required) {
      inputElement.required = true
    }
    
    if (field.pattern && 'pattern' in inputElement) {
      inputElement.pattern = field.pattern
    }

    // 事件处理
    inputElement.addEventListener('focus', () => {
      if (!field.disabled && !field.readonly) {
        inputElement.style.borderColor = '#3b82f6'
        inputElement.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
      }
    })

    inputElement.addEventListener('blur', () => {
      inputElement.style.boxShadow = 'none'
      inputElement.style.borderColor = '#d1d5db'
      this.validateField(field)
    })

    inputElement.addEventListener('input', () => {
      const value = field.type === 'checkbox' 
        ? (inputElement as HTMLInputElement).checked 
        : inputElement.value
      
      this.setFieldValue(field.id, value)
      
      // 清除该字段的错误状态
      this.clearFieldError(field.id)
      
      if (field.onChange) {
        field.onChange(value)
      }
    })

    this.fieldElements.set(field.id, inputElement)
    
    if (field.type !== 'checkbox') {
      fieldGroup.appendChild(inputElement)
    }

    // 帮助文本
    if (field.helpText) {
      const helpText = document.createElement('div')
      helpText.className = 'unified-dialog-help-text'
      helpText.style.cssText = `
        margin-top: 6px;
        font-size: 12px;
        color: #6b7280;
      `
      helpText.textContent = field.helpText
      fieldGroup.appendChild(helpText)
    }

    return fieldGroup
  }

  private createFooter(): void {
    if (!this.config.buttons || this.config.buttons.length === 0) {
      return
    }

    this.footer = document.createElement('div')
    this.footer.className = 'unified-dialog-footer'
    this.footer.style.cssText = `
      padding: 16px 24px;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;
      justify-content: flex-end;
    `

    this.config.buttons.forEach(buttonConfig => {
      const button = this.createButtonElement(buttonConfig)
      this.buttonElements.set(buttonConfig.id, button)
      this.footer.appendChild(button)
    })

    this.dialog.appendChild(this.footer)
  }

  private createButtonElement(config: UnifiedDialogButton): HTMLButtonElement {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = `unified-dialog-btn unified-dialog-btn-${config.type || 'secondary'}`
    button.dataset.buttonId = config.id
    
    // 按钮样式
    const styles: Record<string, string> = {
      primary: `
        background: #3b82f6;
        color: white;
        border: none;
      `,
      secondary: `
        background: white;
        color: #374151;
        border: 1px solid #d1d5db;
      `,
      danger: `
        background: #ef4444;
        color: white;
        border: none;
      `,
      success: `
        background: #10b981;
        color: white;
        border: none;
      `,
      link: `
        background: none;
        color: #3b82f6;
        border: none;
        padding: 10px 16px;
      `
    }
    
    button.style.cssText = `
      ${styles[config.type || 'secondary']}
      padding: 10px 20px;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    `

    // 按钮内容
    const content = document.createElement('span')
    content.textContent = config.label
    button.appendChild(content)

    // 加载状态
    const spinner = document.createElement('span')
    spinner.className = 'unified-dialog-btn-spinner'
    spinner.style.cssText = `
      display: none;
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    `
    button.appendChild(spinner)

    // 悬停效果
    button.addEventListener('mouseenter', () => {
      if (!button.disabled) {
        button.style.opacity = '0.9'
        button.style.transform = 'translateY(-1px)'
      }
    })
    
    button.addEventListener('mouseleave', () => {
      button.style.opacity = '1'
      button.style.transform = 'translateY(0)'
    })

    if (config.disabled) {
      button.disabled = true
      button.style.opacity = '0.5'
      button.style.cursor = 'not-allowed'
    }

    // 点击处理
    button.addEventListener('click', async () => {
      if (config.onClick) {
        await this.handleButtonClick(config, button)
      } else {
        // 默认行为
        if (config.id === 'cancel') {
          this.close()
        } else if (config.id === 'confirm') {
          await this.handleSubmit()
        }
      }
      
      // 自动关闭
      if (config.closeOnClick && !this.isClosing) {
        this.close()
      }
    })

    return button
  }

  private async handleButtonClick(config: UnifiedDialogButton, button: HTMLButtonElement): Promise<void> {
    if (!config.onClick) return

    try {
      this.setButtonLoading(config.id, true)
      await config.onClick(this)
    } catch (error) {
      console.error('Button click error:', error)
      this.showError(error instanceof Error ? error.message : '操作失败')
    } finally {
      this.setButtonLoading(config.id, false)
    }
  }

  private async handleSubmit(): Promise<void> {
    // 验证所有字段
    const errors: Array<{ field: string; message: string }> = []
    
    if (this.config.fields) {
      for (const field of this.config.fields) {
        const error = this.validateFieldWithoutToast(field)
        if (error) {
          errors.push({ field: field.label, message: error })
          // 标记错误输入框
          const inputElement = this.fieldElements.get(field.id)
          if (inputElement) {
            inputElement.style.borderColor = '#ef4444'
          }
        }
      }
    }

    if (errors.length > 0) {
      // 显示所有错误
      if (errors.length === 1) {
        this.showError(errors[0].message)
      } else {
        const errorMessage = errors.map(e => `• ${e.message}`).join('\n')
        this.showError(`请修正以下错误：\n${errorMessage}`)
      }
      return
    }

    // 调用onSubmit
    if (this.config.onSubmit) {
      try {
        const data = this.getFormData()
        await this.config.onSubmit(data)
        this.close()
      } catch (error) {
        console.error('Submit error:', error)
        this.showError(error instanceof Error ? error.message : '提交失败')
      }
    } else {
      this.close()
    }
  }

  private validateFieldWithoutToast(field: UnifiedDialogField): string | null {
    const value = this.fieldValues.get(field.id)
    let error: string | null = null

    // 必填验证
    if (field.required) {
      if (field.type === 'checkbox') {
        if (!value) {
          error = `请勾选${field.label}`
        }
      } else if (!value || (typeof value === 'string' && !value.trim())) {
        error = `${field.label}不能为空`
      }
    }

    // 自定义验证
    if (!error && field.validator) {
      error = field.validator(value)
    }

    // 邮箱验证
    if (!error && field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        error = '请输入有效的邮箱地址'
      }
    }

    // URL验证
    if (!error && field.type === 'url' && value) {
      try {
        new URL(value)
      } catch {
        error = '请输入有效的URL地址'
      }
    }

    // 数字范围验证
    if (!error && field.type === 'number' && value) {
      const num = Number(value)
      if (field.min !== undefined && num < field.min) {
        error = `最小值为 ${field.min}`
      }
      if (field.max !== undefined && num > field.max) {
        error = `最大值为 ${field.max}`
      }
    }

    return error
  }
  
  private validateField(field: UnifiedDialogField): string | null {
    const error = this.validateFieldWithoutToast(field)
    // 更新UI
    this.updateFieldError(field.id, error)
    return error
  }

  private updateFieldError(fieldId: string, error: string | null): void {
    const inputElement = this.fieldElements.get(fieldId)

    if (error) {
      // 显示toast错误提示
      this.showError(error)
      
      if (inputElement) {
        // 输入框显示红色边框
        inputElement.style.borderColor = '#ef4444'
      }
    } else {
      if (inputElement) {
        // 恢复输入框样式
        inputElement.style.borderColor = '#d1d5db'
      }
    }
  }

  private clearFieldError(fieldId: string): void {
    this.updateFieldError(fieldId, null)
  }

  private initFieldValues(): void {
    if (this.config.fields) {
      this.config.fields.forEach(field => {
        const value = field.value !== undefined ? field.value : field.defaultValue
        if (value !== undefined) {
          this.fieldValues.set(field.id, value)
        }
      })
    }
  }

  private setFieldValue(fieldId: string, value: any): void {
    this.fieldValues.set(fieldId, value)
  }

  private bindEvents(): void {
    // 遮罩层点击
    if (this.config.closeOnOverlayClick) {
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.close()
        }
      })
    }

    // ESC键
    if (this.config.closeOnEscape) {
      const handleEscape = (e: KeyboardEvent) => {
        if (this.isOpen && e.key === 'Escape') {
          this.close()
          document.removeEventListener('keydown', handleEscape)
        }
      }
      document.addEventListener('keydown', handleEscape)
    }

    // Enter键提交
    this.dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement
        if (target.tagName !== 'TEXTAREA') {
          e.preventDefault()
          this.handleSubmit()
        }
      }
    })
  }

  public open(): void {
    if (this.isOpen) return

    this.isOpen = true
    this.overlay.style.display = 'flex'

    // 阻止背景滚动
    if (this.config.preventScroll) {
      document.body.style.overflow = 'hidden'
    }

    // 动画效果
    if (this.config.animation) {
      // 添加动画样式
      if (!document.querySelector('#unified-dialog-styles')) {
        const style = document.createElement('style')
        style.id = 'unified-dialog-styles'
        style.textContent = `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideDown {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(20px); opacity: 0; }
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `
        document.head.appendChild(style)
      }

      this.overlay.style.animation = 'fadeIn 0.2s ease-out'
      this.dialog.style.animation = 'slideUp 0.3s ease-out'
    }

    // 聚焦第一个输入框
    setTimeout(() => {
      const firstInput = this.dialog.querySelector('input:not([disabled]), textarea:not([disabled]), select:not([disabled])')
      if (firstInput instanceof HTMLElement) {
        firstInput.focus()
      }
    }, 100)

    // 触发回调
    if (this.config.onOpen) {
      this.config.onOpen()
    }
  }

  public async close(): Promise<void> {
    if (!this.isOpen || this.isClosing) return

    // 调用beforeClose回调
    if (this.config.beforeClose) {
      const canClose = await this.config.beforeClose()
      if (!canClose) return
    }

    this.isClosing = true

    // 关闭动画
    if (this.config.animation) {
      this.overlay.style.animation = 'fadeOut 0.2s ease-out'
      this.dialog.style.animation = 'slideDown 0.2s ease-out'
      
      setTimeout(() => {
        this.overlay.style.display = 'none'
        this.isOpen = false
        this.isClosing = false
        
        // 恢复背景滚动要在动画结束后
        if (this.config.preventScroll) {
          document.body.style.overflow = ''
        }
        
        if (this.config.onClose) {
          this.config.onClose()
        }
      }, 200)
    } else {
      this.overlay.style.display = 'none'
      this.isOpen = false
      this.isClosing = false
      
      if (this.config.onClose) {
        this.config.onClose()
      }
    }
  }

  // 公共API方法
  public setButtonLoading(buttonId: string, loading: boolean): void {
    const button = this.buttonElements.get(buttonId)
    if (button) {
      const spinner = button.querySelector('.unified-dialog-btn-spinner') as HTMLElement
      if (loading) {
        button.disabled = true
        if (spinner) spinner.style.display = 'inline-block'
      } else {
        button.disabled = false
        if (spinner) spinner.style.display = 'none'
      }
    }
  }

  public setButtonDisabled(buttonId: string, disabled: boolean): void {
    const button = this.buttonElements.get(buttonId)
    if (button) {
      button.disabled = disabled
      button.style.opacity = disabled ? '0.5' : '1'
      button.style.cursor = disabled ? 'not-allowed' : 'pointer'
    }
  }

  public getFieldValue(fieldId: string): any {
    return this.fieldValues.get(fieldId)
  }

  public setFieldValueById(fieldId: string, value: any): void {
    this.fieldValues.set(fieldId, value)
    const element = this.fieldElements.get(fieldId)
    
    if (element) {
      if (element instanceof HTMLInputElement && element.type === 'checkbox') {
        element.checked = !!value
      } else if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = String(value)
      }
    }
  }

  public getFormData(): Record<string, any> {
    const data: Record<string, any> = {}
    this.fieldValues.forEach((value, key) => {
      data[key] = value
    })
    return data
  }

  // Toast 通知系统
  public showToast(message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info', duration: number = 3000): void {
    const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    // 创建toast元素
    const toast = document.createElement('div')
    toast.className = `unified-dialog-toast unified-dialog-toast-${type}`
    toast.dataset.toastId = toastId
    
    // 不同类型的样式
    const styles = {
      error: {
        background: '#fef2f2',
        color: '#991b1b',
        border: '1px solid #fecaca',
        icon: '⚠️'
      },
      success: {
        background: '#f0fdf4',
        color: '#166534',
        border: '1px solid #86efac',
        icon: '✅'
      },
      warning: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
        icon: '⚠️'
      },
      info: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #93c5fd',
        icon: 'ℹ️'
      }
    }
    
    const style = styles[type]
    
    toast.style.cssText = `
      padding: 12px 16px 12px 44px;
      background: ${style.background};
      border: ${style.border};
      border-radius: 8px;
      color: ${style.color};
      font-size: 14px;
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.3s ease;
      pointer-events: auto;
      max-width: 100%;
      word-wrap: break-word;
    `
    
    // 添加图标
    const icon = document.createElement('span')
    icon.style.cssText = `
      position: absolute;
      left: 12px;
      font-size: 18px;
    `
    icon.textContent = style.icon
    toast.appendChild(icon)
    
    // 添加消息文本
    const messageSpan = document.createElement('span')
    messageSpan.style.cssText = `
      white-space: pre-line;
      flex: 1;
    `
    messageSpan.textContent = message
    toast.appendChild(messageSpan)
    
    // 添加关闭按钮
    const closeBtn = document.createElement('button')
    closeBtn.style.cssText = `
      margin-left: auto;
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0 0 0 12px;
      font-size: 18px;
      opacity: 0.7;
      transition: opacity 0.2s;
    `
    closeBtn.innerHTML = '×'
    closeBtn.onclick = () => this.removeToast(toastId)
    closeBtn.onmouseenter = () => { closeBtn.style.opacity = '1' }
    closeBtn.onmouseleave = () => { closeBtn.style.opacity = '0.7' }
    toast.appendChild(closeBtn)
    
    // 添加到容器
    this.toastContainer.appendChild(toast)
    this.activeToasts.set(toastId, toast)
    
    // 触发动画
    requestAnimationFrame(() => {
      toast.style.opacity = '1'
      toast.style.transform = 'translateX(0)'
    })
    
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(toastId)
      }, duration)
    }
  }
  
  private removeToast(toastId: string): void {
    const toast = this.activeToasts.get(toastId)
    if (toast) {
      toast.style.opacity = '0'
      toast.style.transform = 'translateX(20px)'
      
      setTimeout(() => {
        toast.remove()
        this.activeToasts.delete(toastId)
      }, 300)
    }
  }
  
  public showError(message: string): void {
    this.showToast(message, 'error', 5000)
  }
  
  public showSuccess(message: string): void {
    this.showToast(message, 'success', 3000)
  }
  
  public showWarning(message: string): void {
    this.showToast(message, 'warning', 4000)
  }
  
  public showInfo(message: string): void {
    this.showToast(message, 'info', 3000)
  }

  public hideError(): void {
    // 清除所有错误 toast
    this.activeToasts.forEach((toast, id) => {
      if (toast.classList.contains('unified-dialog-toast-error')) {
        this.removeToast(id)
      }
    })
  }

  public destroy(): void {
    if (this.overlay && this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay)
    }
    
    // 清理所有 toast
    this.activeToasts.forEach((toast) => {
      toast.remove()
    })
    this.activeToasts.clear()
    
    // 清理样式
    const styles = document.querySelector('#unified-dialog-styles')
    if (styles) {
      styles.remove()
    }
    
    // 清理引用
    this.fieldValues.clear()
    this.fieldElements.clear()
    this.buttonElements.clear()
  }
}

/**
 * 快捷方法：显示对话框
 */
export function showUnifiedDialog(config: UnifiedDialogConfig): UnifiedDialog {
  const dialog = new UnifiedDialog(config)
  dialog.open()
  return dialog
}

/**
 * 快捷方法：确认对话框
 */
export function showConfirmDialog(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
  onCancel?: () => void
): UnifiedDialog {
  return showUnifiedDialog({
    title,
    content: message,
    buttons: [
      { 
        id: 'cancel', 
        label: '取消', 
        type: 'secondary',
        onClick: () => onCancel?.(),
        closeOnClick: true
      },
      { 
        id: 'confirm', 
        label: '确定', 
        type: 'primary',
        onClick: async (dialog) => {
          await onConfirm()
          dialog.close()
        }
      }
    ]
  })
}

/**
 * 快捷方法：提示对话框
 */
export function showAlertDialog(
  title: string,
  message: string,
  onOk?: () => void
): UnifiedDialog {
  return showUnifiedDialog({
    title,
    content: message,
    buttons: [
      { 
        id: 'ok', 
        label: '知道了', 
        type: 'primary',
        onClick: () => onOk?.(),
        closeOnClick: true
      }
    ]
  })
}

/**
 * 快捷方法：输入对话框
 */
export function showPromptDialog(
  title: string,
  label: string,
  onConfirm: (value: string) => void | Promise<void>,
  options?: {
    defaultValue?: string
    placeholder?: string
    type?: 'text' | 'email' | 'url' | 'number'
    validator?: (value: any) => string | null
  }
): UnifiedDialog {
  return showUnifiedDialog({
    title,
    fields: [
      {
        id: 'input',
        type: options?.type || 'text',
        label,
        placeholder: options?.placeholder,
        defaultValue: options?.defaultValue,
        required: true,
        validator: options?.validator
      }
    ],
    onSubmit: async (data) => {
      await onConfirm(data.input)
    }
  })
}