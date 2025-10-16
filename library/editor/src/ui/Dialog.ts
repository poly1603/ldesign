/**
 * 通用对话框组件
 */

export interface DialogOptions {
  title: string
  fields: DialogField[]
  onConfirm: (values: Record<string, string>) => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
}

export interface DialogField {
  name: string
  label: string
  type?: 'text' | 'url' | 'number' | 'email'
  placeholder?: string
  required?: boolean
  defaultValue?: string
  pattern?: string
  validator?: (value: string) => string | null // 返回错误消息或null
}

/**
 * 显示对话框
 */
export function showDialog(options: DialogOptions): void {
  const {
    title,
    fields,
    onConfirm,
    onCancel,
    confirmText = '确定',
    cancelText = '取消'
  } = options

  // 移除已存在的对话框
  const existing = document.querySelector('.editor-dialog-overlay')
  if (existing) {
    existing.remove()
  }

  // 创建遮罩层
  const overlay = document.createElement('div')
  overlay.className = 'editor-dialog-overlay'
  
  // 创建对话框
  const dialog = document.createElement('div')
  dialog.className = 'editor-dialog'
  
  // 标题
  const header = document.createElement('div')
  header.className = 'editor-dialog-header'
  header.textContent = title
  dialog.appendChild(header)
  
  // 内容区
  const content = document.createElement('div')
  content.className = 'editor-dialog-content'
  
  // 表单
  const form = document.createElement('form')
  form.className = 'editor-dialog-form'
  
  const fieldElements: Record<string, HTMLInputElement> = {}
  const errorElements: Record<string, HTMLElement> = {}
  
  // 创建表单字段
  fields.forEach(field => {
    const fieldGroup = document.createElement('div')
    fieldGroup.className = 'editor-dialog-field'
    
    // 标签
    const label = document.createElement('label')
    label.className = 'editor-dialog-label'
    label.textContent = field.label
    if (field.required) {
      const required = document.createElement('span')
      required.className = 'editor-dialog-required'
      required.textContent = ' *'
      label.appendChild(required)
    }
    fieldGroup.appendChild(label)
    
    // 输入框
    const input = document.createElement('input')
    input.className = 'editor-dialog-input'
    input.type = field.type || 'text'
    input.name = field.name
    input.placeholder = field.placeholder || ''
    input.value = field.defaultValue || ''
    if (field.required) {
      input.required = true
    }
    if (field.pattern) {
      input.pattern = field.pattern
    }
    
    // 错误提示
    const error = document.createElement('div')
    error.className = 'editor-dialog-error'
    error.style.display = 'none'
    
    fieldElements[field.name] = input
    errorElements[field.name] = error
    
    // 验证输入
    input.addEventListener('input', () => {
      error.style.display = 'none'
      input.classList.remove('error')
    })
    
    fieldGroup.appendChild(input)
    fieldGroup.appendChild(error)
    form.appendChild(fieldGroup)
  })
  
  content.appendChild(form)
  dialog.appendChild(content)
  
  // 按钮区
  const footer = document.createElement('div')
  footer.className = 'editor-dialog-footer'
  
  const cancelBtn = document.createElement('button')
  cancelBtn.type = 'button'
  cancelBtn.className = 'editor-dialog-button editor-dialog-button-cancel'
  cancelBtn.textContent = cancelText
  
  const confirmBtn = document.createElement('button')
  confirmBtn.type = 'button'
  confirmBtn.className = 'editor-dialog-button editor-dialog-button-confirm'
  confirmBtn.textContent = confirmText
  
  footer.appendChild(cancelBtn)
  footer.appendChild(confirmBtn)
  dialog.appendChild(footer)
  
  overlay.appendChild(dialog)
  
  // 事件处理
  const close = () => {
    overlay.classList.add('closing')
    setTimeout(() => {
      overlay.remove()
    }, 200)
  }
  
  const validate = (): boolean => {
    let isValid = true
    
    fields.forEach(field => {
      const input = fieldElements[field.name]
      const error = errorElements[field.name]
      const value = input.value.trim()
      
      // 必填验证
      if (field.required && !value) {
        error.textContent = `${field.label}不能为空`
        error.style.display = 'block'
        input.classList.add('error')
        isValid = false
        return
      }
      
      // 自定义验证
      if (field.validator && value) {
        const errorMsg = field.validator(value)
        if (errorMsg) {
          error.textContent = errorMsg
          error.style.display = 'block'
          input.classList.add('error')
          isValid = false
          return
        }
      }
      
      // 模式验证
      if (field.pattern && value && !new RegExp(field.pattern).test(value)) {
        error.textContent = `${field.label}格式不正确`
        error.style.display = 'block'
        input.classList.add('error')
        isValid = false
      }
    })
    
    return isValid
  }
  
  cancelBtn.addEventListener('click', () => {
    if (onCancel) {
      onCancel()
    }
    close()
  })
  
  confirmBtn.addEventListener('click', () => {
    if (validate()) {
      const values: Record<string, string> = {}
      fields.forEach(field => {
        values[field.name] = fieldElements[field.name].value.trim()
      })
      onConfirm(values)
      close()
    }
  })
  
  // ESC键关闭
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (onCancel) {
        onCancel()
      }
      close()
      document.removeEventListener('keydown', handleEsc)
    }
  }
  document.addEventListener('keydown', handleEsc)
  
  // Enter键确认
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    confirmBtn.click()
  })
  
  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      if (onCancel) {
        onCancel()
      }
      close()
    }
  })
  
  // 添加到页面
  document.body.appendChild(overlay)
  
  // 聚焦第一个输入框
  setTimeout(() => {
    const firstInput = form.querySelector('input')
    if (firstInput) {
      firstInput.focus()
    }
  }, 100)
}