/**
 * 表单组件
 */

import { isEmpty, isValidEmail } from '../utils/validation-utils'

/**
 * 表单字段类型
 */
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select'

/**
 * 验证规则接口
 */
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string
}

/**
 * 表单字段配置
 */
export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  defaultValue?: any
  options?: Array<{ label: string; value: any }>
  rules?: ValidationRule[]
}

/**
 * 表单配置
 */
export interface FormConfig {
  fields: FieldConfig[]
  onSubmit?: (data: Record<string, any>) => void
  onValidate?: (errors: Record<string, string[]>) => void
}

/**
 * 表单类
 */
export class Form {
  private config: FormConfig
  private element: HTMLFormElement | null = null
  private data: Record<string, any> = {}
  private errors: Record<string, string[]> = {}

  constructor(config: FormConfig) {
    this.config = config
    this.initializeData()
  }

  /**
   * 渲染表单
   */
  render(): HTMLFormElement {
    this.element = document.createElement('form')
    this.element.className = 'form'

    this.config.fields.forEach(field => {
      const fieldElement = this.createField(field)
      this.element!.appendChild(fieldElement)
    })

    // 提交按钮
    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.textContent = '提交'
    submitButton.className = 'btn btn-primary'
    this.element.appendChild(submitButton)

    this.bindEvents()
    return this.element
  }

  /**
   * 获取表单数据
   */
  getData(): Record<string, any> {
    return { ...this.data }
  }

  /**
   * 设置表单数据
   */
  setData(data: Record<string, any>): void {
    this.data = { ...this.data, ...data }
    this.updateFormElements()
  }

  /**
   * 验证表单
   */
  validate(): boolean {
    this.errors = {}

    this.config.fields.forEach(field => {
      const fieldErrors = this.validateField(field, this.data[field.name])
      if (fieldErrors.length > 0) {
        this.errors[field.name] = fieldErrors
      }
    })

    this.updateErrorDisplay()
    this.config.onValidate?.(this.errors)

    return Object.keys(this.errors).length === 0
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.initializeData()
    this.errors = {}
    this.updateFormElements()
    this.updateErrorDisplay()
  }

  /**
   * 初始化数据
   */
  private initializeData(): void {
    this.data = {}
    this.config.fields.forEach(field => {
      this.data[field.name] = field.defaultValue || ''
    })
  }

  /**
   * 创建字段元素
   */
  private createField(field: FieldConfig): HTMLDivElement {
    const fieldDiv = document.createElement('div')
    fieldDiv.className = 'form-field'

    // 标签
    const label = document.createElement('label')
    label.textContent = field.label
    label.setAttribute('for', field.name)
    fieldDiv.appendChild(label)

    // 输入元素
    let input: HTMLElement

    if (field.type === 'textarea') {
      input = document.createElement('textarea')
    } else if (field.type === 'select') {
      input = document.createElement('select')
      field.options?.forEach(option => {
        const optionEl = document.createElement('option')
        optionEl.value = option.value
        optionEl.textContent = option.label
          ; (input as HTMLSelectElement).appendChild(optionEl)
      })
    } else {
      input = document.createElement('input')
        ; (input as HTMLInputElement).type = field.type
    }

    input.id = field.name
    input.setAttribute('name', field.name)

    if (field.placeholder) {
      input.setAttribute('placeholder', field.placeholder)
    }

    fieldDiv.appendChild(input)

    // 错误信息容器
    const errorDiv = document.createElement('div')
    errorDiv.className = 'form-error'
    errorDiv.id = `${field.name}-error`
    fieldDiv.appendChild(errorDiv)

    return fieldDiv
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    if (!this.element) return

    // 表单提交
    this.element.addEventListener('submit', (e) => {
      e.preventDefault()
      this.handleSubmit()
    })

    // 字段变化
    this.config.fields.forEach(field => {
      const input = this.element!.querySelector(`[name="${field.name}"]`) as HTMLInputElement
      if (input) {
        input.addEventListener('input', () => {
          this.data[field.name] = input.value
        })

        input.addEventListener('blur', () => {
          this.validateField(field, this.data[field.name])
          this.updateErrorDisplay()
        })
      }
    })
  }

  /**
   * 处理提交
   */
  private handleSubmit(): void {
    if (this.validate()) {
      this.config.onSubmit?.(this.getData())
    }
  }

  /**
   * 验证字段
   */
  private validateField(field: FieldConfig, value: any): string[] {
    const errors: string[] = []

    if (!field.rules) return errors

    field.rules.forEach(rule => {
      if (rule.required && isEmpty(value)) {
        errors.push(`${field.label}是必填项`)
      }

      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`${field.label}长度不能少于${rule.minLength}个字符`)
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field.label}长度不能超过${rule.maxLength}个字符`)
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        errors.push(`${field.label}格式不正确`)
      }

      if (rule.validator) {
        const result = rule.validator(value)
        if (typeof result === 'string') {
          errors.push(result)
        } else if (!result) {
          errors.push(`${field.label}验证失败`)
        }
      }
    })

    return errors
  }

  /**
   * 更新表单元素
   */
  private updateFormElements(): void {
    if (!this.element) return

    this.config.fields.forEach(field => {
      const input = this.element!.querySelector(`[name="${field.name}"]`) as HTMLInputElement
      if (input) {
        input.value = this.data[field.name] || ''
      }
    })
  }

  /**
   * 更新错误显示
   */
  private updateErrorDisplay(): void {
    if (!this.element) return

    this.config.fields.forEach(field => {
      const errorDiv = this.element!.querySelector(`#${field.name}-error`)
      if (errorDiv) {
        const fieldErrors = this.errors[field.name] || []
        errorDiv.textContent = fieldErrors.join(', ')
          (errorDiv as HTMLElement).style.display = fieldErrors.length > 0 ? 'block' : 'none'
      }
    })
  }
}

/**
 * 创建表单实例
 */
export function createForm(config: FormConfig): Form {
  return new Form(config)
}
