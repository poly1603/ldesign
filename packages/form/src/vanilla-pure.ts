// 纯原生 JavaScript 表单实现，不依赖 Vue

export interface FormField {
  name: string
  title: string
  component: string
  required?: boolean
  placeholder?: string
  defaultValue?: any
  props?: Record<string, any>
  rules?: ValidationRule[]
  hidden?: boolean
  disabled?: boolean
  span?: number | string
}

export interface ValidationRule {
  type: string
  params?: any
  message: string
  validator?: (
    value: any,
    formData?: Record<string, any>
  ) => boolean | string | Promise<boolean | string>
}

export interface FormOptions {
  title?: string
  fields: FormField[]
  layout?: {
    columns?: number
    horizontalGap?: number
    verticalGap?: number
    labelPosition?: 'left' | 'top' | 'right'
  }
  validation?: {
    validateOnChange?: boolean
    validateOnBlur?: boolean
    debounceTime?: number
  }
  theme?: Record<string, any>
}

export interface FormData {
  [key: string]: any
}

// 简单的事件发射器
class EventEmitter {
  private events: Record<string, Function[]> = {}

  on(event: string, handler: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off(event: string, handler?: Function): void {
    if (!this.events[event]) return

    if (handler) {
      this.events[event] = this.events[event].filter(h => h !== handler)
    } else {
      this.events[event] = []
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error('Event handler error:', error)
        }
      })
    }
  }

  removeAllListeners(): void {
    this.events = {}
  }
}

// 表单实例配置
export interface FormInstanceConfig {
  container: string | HTMLElement
  options: FormOptions
  initialData?: FormData
  onSubmit?: (data: FormData) => void
  onChange?: (data: FormData) => void
  onFieldChange?: (name: string, value: any) => void
  onValidate?: (result: {
    valid: boolean
    errors: Record<string, string[]>
  }) => void
  onError?: (error: Error) => void
}

// 纯原生 JavaScript 表单实例
export class FormInstance extends EventEmitter {
  private container: HTMLElement
  private options: FormOptions
  private formData: FormData = {}
  private fieldElements: Map<string, HTMLElement> = new Map()
  private errors: Record<string, string[]> = {}
  private mounted = false

  constructor(config: FormInstanceConfig) {
    super()

    this.container = this.resolveContainer(config.container)
    this.options = config.options
    this.formData = { ...config.initialData } || {}

    // 绑定事件回调
    this.bindEventCallbacks(config)

    // 渲染表单
    this.render()
  }

  private resolveContainer(container: string | HTMLElement): HTMLElement {
    if (typeof container === 'string') {
      const element = document.querySelector(container)
      if (!element) {
        throw new Error(`Container element not found: ${container}`)
      }
      return element as HTMLElement
    }
    return container
  }

  private bindEventCallbacks(config: FormInstanceConfig): void {
    if (config.onSubmit) this.on('submit', config.onSubmit)
    if (config.onChange) this.on('change', config.onChange)
    if (config.onFieldChange) this.on('fieldChange', config.onFieldChange)
    if (config.onValidate) this.on('validate', config.onValidate)
    if (config.onError) this.on('error', config.onError)
  }

  private render(): void {
    if (this.mounted) return

    // 清空容器
    this.container.innerHTML = ''

    // 创建表单元素
    const form = document.createElement('form')
    form.className = 'ldesign-form'

    // 添加标题
    if (this.options.title) {
      const title = document.createElement('h2')
      title.className = 'ldesign-form-title'
      title.textContent = this.options.title
      form.appendChild(title)
    }

    // 创建字段容器
    const fieldsContainer = document.createElement('div')
    fieldsContainer.className = 'ldesign-form-fields'

    // 应用布局样式
    this.applyLayoutStyles(fieldsContainer)

    // 渲染字段
    this.options.fields.forEach(field => {
      if (!field.hidden) {
        const fieldElement = this.renderField(field)
        fieldsContainer.appendChild(fieldElement)
        this.fieldElements.set(field.name, fieldElement)
      }
    })

    form.appendChild(fieldsContainer)

    // 添加提交按钮
    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.className = 'ldesign-form-submit'
    submitButton.textContent = '提交'
    form.appendChild(submitButton)

    // 绑定表单提交事件
    form.addEventListener('submit', e => {
      e.preventDefault()
      this.handleSubmit()
    })

    this.container.appendChild(form)
    this.mounted = true

    // 应用基础样式
    this.applyBaseStyles()
  }

  private applyLayoutStyles(container: HTMLElement): void {
    const layout = this.options.layout || {}
    const columns = layout.columns || 1
    const gap = layout.horizontalGap || 16

    container.style.display = 'grid'
    container.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
    container.style.gap = `${gap}px`
  }

  private renderField(field: FormField): HTMLElement {
    const fieldContainer = document.createElement('div')
    fieldContainer.className = 'ldesign-form-field'
    fieldContainer.dataset.fieldName = field.name

    // 创建标签
    const label = document.createElement('label')
    label.className = 'ldesign-form-label'
    label.textContent = field.title
    if (field.required) {
      label.innerHTML += ' <span class="required">*</span>'
    }

    // 创建输入元素
    const inputElement = this.createInputElement(field)

    // 设置初始值
    if (this.formData[field.name] !== undefined) {
      this.setElementValue(inputElement, this.formData[field.name])
    } else if (field.defaultValue !== undefined) {
      this.setElementValue(inputElement, field.defaultValue)
      this.formData[field.name] = field.defaultValue
    }

    // 绑定事件
    this.bindFieldEvents(inputElement, field)

    fieldContainer.appendChild(label)
    fieldContainer.appendChild(inputElement)

    return fieldContainer
  }

  private createInputElement(field: FormField): HTMLElement {
    let element: HTMLElement

    switch (field.component) {
      case 'FormInput':
        element = document.createElement('input')
        const input = element as HTMLInputElement
        input.type = field.props?.type || 'text'
        input.placeholder = field.placeholder || ''
        input.className = 'ldesign-form-input'
        break

      case 'FormTextarea':
        element = document.createElement('textarea')
        const textarea = element as HTMLTextAreaElement
        textarea.placeholder = field.placeholder || ''
        textarea.rows = field.props?.rows || 3
        textarea.className = 'ldesign-form-textarea'
        break

      case 'FormSelect':
        element = document.createElement('select')
        const select = element as HTMLSelectElement
        select.className = 'ldesign-form-select'

        // 添加选项
        if (field.props?.options) {
          field.props.options.forEach((option: any) => {
            const optionElement = document.createElement('option')
            optionElement.value = option.value
            optionElement.textContent = option.label
            select.appendChild(optionElement)
          })
        }
        break

      case 'FormSwitch':
        element = document.createElement('input')
        const checkbox = element as HTMLInputElement
        checkbox.type = 'checkbox'
        checkbox.className = 'ldesign-form-switch'
        break

      default:
        element = document.createElement('input')
        element.className = 'ldesign-form-input'
    }

    element.id = `field-${field.name}`
    if (field.disabled) {
      ;(element as any).disabled = true
    }

    return element
  }

  private setElementValue(element: HTMLElement, value: any): void {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        element.checked = Boolean(value)
      } else {
        element.value = String(value || '')
      }
    } else if (
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      element.value = String(value || '')
    }
  }

  private getElementValue(element: HTMLElement): any {
    if (element instanceof HTMLInputElement) {
      if (element.type === 'checkbox') {
        return element.checked
      } else if (element.type === 'number') {
        return element.value ? Number(element.value) : undefined
      } else {
        return element.value
      }
    } else if (
      element instanceof HTMLTextAreaElement ||
      element instanceof HTMLSelectElement
    ) {
      return element.value
    }
    return undefined
  }

  private bindFieldEvents(element: HTMLElement, field: FormField): void {
    const updateValue = () => {
      const value = this.getElementValue(element)
      const oldValue = this.formData[field.name]

      if (value !== oldValue) {
        this.formData[field.name] = value
        this.emit('fieldChange', field.name, value)
        this.emit('change', { ...this.formData })
      }
    }

    element.addEventListener('input', updateValue)
    element.addEventListener('change', updateValue)
  }

  private async handleSubmit(): Promise<void> {
    try {
      const isValid = await this.validate()
      if (isValid) {
        this.emit('submit', { ...this.formData })
      }
    } catch (error) {
      this.emit('error', error)
    }
  }

  private applyBaseStyles(): void {
    if (document.getElementById('ldesign-form-styles')) return

    const style = document.createElement('style')
    style.id = 'ldesign-form-styles'
    style.textContent = `
      .ldesign-form {
        max-width: 100%;
        margin: 0 auto;
        padding: 20px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .ldesign-form-title {
        margin-bottom: 20px;
        color: #333;
        font-size: 24px;
      }
      
      .ldesign-form-fields {
        margin-bottom: 20px;
      }
      
      .ldesign-form-field {
        margin-bottom: 16px;
      }
      
      .ldesign-form-label {
        display: block;
        margin-bottom: 4px;
        font-weight: 500;
        color: #333;
      }
      
      .required {
        color: #ff4d4f;
      }
      
      .ldesign-form-input,
      .ldesign-form-textarea,
      .ldesign-form-select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      
      .ldesign-form-input:focus,
      .ldesign-form-textarea:focus,
      .ldesign-form-select:focus {
        outline: none;
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
      
      .ldesign-form-switch {
        width: auto;
      }
      
      .ldesign-form-submit {
        background: #1890ff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        transition: background-color 0.2s;
      }
      
      .ldesign-form-submit:hover {
        background: #40a9ff;
      }
      
      .ldesign-form-submit:disabled {
        background: #d9d9d9;
        cursor: not-allowed;
      }
    `
    document.head.appendChild(style)
  }

  // 公共 API 方法
  getFormData(): FormData {
    return { ...this.formData }
  }

  setFormData(data: FormData): void {
    this.formData = { ...data }

    // 更新DOM元素的值
    Object.keys(data).forEach(fieldName => {
      const element = this.fieldElements
        .get(fieldName)
        ?.querySelector('input, textarea, select') as HTMLElement
      if (element) {
        this.setElementValue(element, data[fieldName])
      }
    })

    this.emit('change', { ...this.formData })
  }

  getFieldValue(name: string): any {
    return this.formData[name]
  }

  setFieldValue(name: string, value: any): void {
    this.formData[name] = value

    const element = this.fieldElements
      .get(name)
      ?.querySelector('input, textarea, select') as HTMLElement
    if (element) {
      this.setElementValue(element, value)
    }

    this.emit('fieldChange', name, value)
    this.emit('change', { ...this.formData })
  }

  async validate(): Promise<boolean> {
    this.errors = {}
    let isValid = true

    for (const field of this.options.fields) {
      const value = this.formData[field.name]
      const fieldErrors: string[] = []

      // 必填验证
      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        fieldErrors.push(`${field.title}不能为空`)
        isValid = false
      }

      // 其他验证规则
      if (
        field.rules &&
        value !== undefined &&
        value !== null &&
        value !== ''
      ) {
        for (const rule of field.rules) {
          const result = await this.validateRule(rule, value, this.formData)
          if (result !== true) {
            fieldErrors.push(typeof result === 'string' ? result : rule.message)
            isValid = false
          }
        }
      }

      if (fieldErrors.length > 0) {
        this.errors[field.name] = fieldErrors
      }
    }

    this.emit('validate', { valid: isValid, errors: this.errors })
    return isValid
  }

  private async validateRule(
    rule: ValidationRule,
    value: any,
    formData: FormData
  ): Promise<boolean | string> {
    if (rule.validator) {
      return await rule.validator(value, formData)
    }

    switch (rule.type) {
      case 'minLength':
        return String(value).length >= rule.params
      case 'maxLength':
        return String(value).length <= rule.params
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))
      case 'pattern':
        return rule.params.test(String(value))
      case 'min':
        return Number(value) >= rule.params
      case 'max':
        return Number(value) <= rule.params
      default:
        return true
    }
  }

  reset(): void {
    this.formData = {}
    this.errors = {}

    // 重置DOM元素
    this.fieldElements.forEach((fieldElement, fieldName) => {
      const element = fieldElement.querySelector(
        'input, textarea, select'
      ) as HTMLElement
      if (element) {
        const field = this.options.fields.find(f => f.name === fieldName)
        const defaultValue = field?.defaultValue
        this.setElementValue(element, defaultValue || '')
        if (defaultValue !== undefined) {
          this.formData[fieldName] = defaultValue
        }
      }
    })

    this.emit('change', { ...this.formData })
  }

  showField(name: string): void {
    const fieldElement = this.fieldElements.get(name)
    if (fieldElement) {
      fieldElement.style.display = ''
    }
  }

  hideField(name: string): void {
    const fieldElement = this.fieldElements.get(name)
    if (fieldElement) {
      fieldElement.style.display = 'none'
    }
  }

  enableField(name: string): void {
    const fieldElement = this.fieldElements.get(name)
    if (fieldElement) {
      const input = fieldElement.querySelector('input, textarea, select') as any
      if (input) {
        input.disabled = false
      }
    }
  }

  disableField(name: string): void {
    const fieldElement = this.fieldElements.get(name)
    if (fieldElement) {
      const input = fieldElement.querySelector('input, textarea, select') as any
      if (input) {
        input.disabled = true
      }
    }
  }

  destroy(): void {
    this.container.innerHTML = ''
    this.fieldElements.clear()
    this.removeAllListeners()
    this.mounted = false
  }

  // 简化的方法，用于兼容示例
  addField(field: FormField): void {
    this.options.fields.push(field)
    this.render()
  }

  removeField(name: string): void {
    this.options.fields = this.options.fields.filter(f => f.name !== name)
    delete this.formData[name]
    this.render()
  }

  updateFieldOptions(fieldName: string, options: any[]): void {
    const field = this.options.fields.find(f => f.name === fieldName)
    if (field && field.props) {
      field.props.options = options

      // 更新DOM
      const fieldElement = this.fieldElements.get(fieldName)
      if (fieldElement) {
        const select = fieldElement.querySelector('select') as HTMLSelectElement
        if (select) {
          select.innerHTML = ''
          options.forEach(option => {
            const optionElement = document.createElement('option')
            optionElement.value = option.value
            optionElement.textContent = option.label
            select.appendChild(optionElement)
          })
        }
      }
    }
  }

  // 插件系统的简化实现
  use(plugin: any, options?: any): void {
    if (plugin.install) {
      plugin.install(this, options)
    }
  }

  unuse(plugin: any): void {
    if (plugin.uninstall) {
      plugin.uninstall(this)
    }
  }

  getPlugins(): any[] {
    return []
  }

  hasPlugin(name: string): boolean {
    return false
  }
}

// 创建表单实例的工厂函数
export function createFormInstance(config: FormInstanceConfig): FormInstance {
  return new FormInstance(config)
}

// 导出类型（重命名避免冲突）
export type { FormInstanceConfig as VanillaPureFormInstanceConfig }
