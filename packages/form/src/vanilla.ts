// 原生 JavaScript 支持模块

import type { FormData, FormOptions } from './types/form'
import { type App, createApp } from 'vue'
import DynamicForm from './components/DynamicForm.vue'

// 简单的事件发射器
class SimpleEventEmitter {
  private events: Record<string, Function[]> = {}

  on(event: string, handler: Function): void {
    if (!this.events[event]) {
      this.events[event] = []
    }
    this.events[event].push(handler)
  }

  off(event: string, handler: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler)
    }
  }

  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(...args))
    }
  }

  removeAllListeners(): void {
    this.events = {}
  }
}

/**
 * 原生 JavaScript 表单实例配置
 */
export interface FormInstanceConfig {
  /** 挂载容器 */
  container: string | HTMLElement

  /** 表单配置 */
  options: FormOptions

  /** 初始数据 */
  initialData?: FormData

  /** 提交回调 */
  onSubmit?: (data: FormData) => void

  /** 数据变化回调 */
  onChange?: (data: FormData, field?: string) => void

  /** 重置回调 */
  onReset?: (data: FormData) => void

  /** 验证回调 */
  onValidate?: (result: {
    valid: boolean
    errors: Record<string, string[]>
  }) => void

  /** 字段变化回调 */
  onFieldChange?: (name: string, value: any) => void

  /** 字段焦点回调 */
  onFieldFocus?: (name: string, event: FocusEvent) => void

  /** 字段失焦回调 */
  onFieldBlur?: (name: string, event: FocusEvent) => void

  /** 错误回调 */
  onError?: (error: Error) => void
}

/**
 * 原生 JavaScript 表单实例
 */
class FormInstance extends SimpleEventEmitter {
  private app: App | null = null
  private container: HTMLElement
  private options: FormOptions
  private formData: FormData = {}
  private mounted = false

  constructor(config: FormInstanceConfig) {
    super()

    // 解析容器
    this.container = this.resolveContainer(config.container)
    this.options = config.options
    this.formData = config.initialData || {}

    // 绑定事件回调
    this.bindEventCallbacks(config)

    // 创建 Vue 应用
    this.createVueApp()

    // 挂载应用
    this.mount()
  }

  /**
   * 解析容器元素
   */
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

  /**
   * 绑定事件回调
   */
  private bindEventCallbacks(config: FormInstanceConfig): void {
    if (config.onSubmit) {
      this.on('submit', config.onSubmit)
    }

    if (config.onChange) {
      this.on('change', config.onChange)
    }

    if (config.onReset) {
      this.on('reset', config.onReset)
    }

    if (config.onValidate) {
      this.on('validate', config.onValidate)
    }

    if (config.onFieldChange) {
      this.on('fieldChange', config.onFieldChange)
    }

    if (config.onFieldFocus) {
      this.on('fieldFocus', config.onFieldFocus)
    }

    if (config.onFieldBlur) {
      this.on('fieldBlur', config.onFieldBlur)
    }

    if (config.onError) {
      this.on('error', config.onError)
    }
  }

  /**
   * 创建 Vue 应用
   */
  private createVueApp(): void {
    const self = this

    this.app = createApp({
      data() {
        return {
          formData: self.formData,
          options: self.options,
        }
      },

      methods: {
        handleSubmit(data: FormData) {
          self.emit('submit', data)
        },

        handleReset() {
          self.formData = {}
          self.emit('reset', self.formData)
        },

        handleFieldChange(fieldName: string, value: any) {
          self.formData[fieldName] = value
          self.emit('change', self.formData, fieldName)
          self.emit('fieldChange', fieldName, value)
        },
      },

      template: `
        <DynamicForm
          v-model="formData"
          :options="options"
          @submit="handleSubmit"
          @reset="handleReset"
          @field-change="handleFieldChange"
        />
      `,

      components: {
        DynamicForm,
      },
    })
  }

  /**
   * 挂载应用
   */
  private mount(): void {
    if (this.app && !this.mounted) {
      this.app.mount(this.container)
      this.mounted = true
    }
  }

  /**
   * 卸载应用
   */
  private unmount(): void {
    if (this.app && this.mounted) {
      this.app.unmount()
      this.mounted = false
    }
  }

  // 公共 API 方法
  getFormData(): FormData {
    return this.formData
  }

  setFormData(data: FormData): void {
    this.formData = { ...data }
  }

  getFieldValue(name: string): any {
    return this.formData[name]
  }

  setFieldValue(name: string, value: any): void {
    this.formData[name] = value
  }

  async validate(): Promise<boolean> {
    const fields = this.options.fields || []
    let hasErrors = false
    const errors: Record<string, string[]> = {}

    for (const field of fields) {
      const fieldValid = await this.validateField(
        field.name,
        this.formData[field.name]
      )
      if (!fieldValid) {
        hasErrors = true
        errors[field.name] = this.getFieldErrors(field.name)
      }
    }

    const isValid = !hasErrors
    this.emit('validate', { valid: isValid, errors })
    return isValid
  }

  async validateField(name: string, value?: any): Promise<boolean> {
    const field = this.options.fields?.find(f => f.name === name)
    if (!field) return true

    const fieldValue = value !== undefined ? value : this.formData[name]

    // 必填验证
    if (field.required && (!fieldValue || fieldValue === '')) {
      return false
    }

    // 类型验证
    if (fieldValue && field.type) {
      switch (field.type) {
        case 'email':
          if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(fieldValue)) {
            return false
          }
          break
        case 'number':
          if (isNaN(Number(fieldValue))) {
            return false
          }
          if (field.min !== undefined && Number(fieldValue) < field.min) {
            return false
          }
          break
      }
    }

    return true
  }

  reset(): void {
    this.formData = {}
  }

  clear(): void {
    this.formData = {}
  }

  resetField(name: string): void {
    delete this.formData[name]
  }

  clearValidation(): void {
    // 简化实现
  }

  async submit(): Promise<boolean> {
    const isValid = await this.validate()
    if (isValid) {
      this.emit('submit', this.getFormData())
    }
    return isValid
  }

  destroy(): void {
    this.unmount()
    this.removeAllListeners()
    this.app = null
  }

  // 简化的状态管理方法
  getFormState() {
    return {
      valid: true,
      dirty: Object.keys(this.formData).length > 0,
      touched: Object.keys(this.formData).length > 0,
    }
  }

  getErrors() {
    return {}
  }

  getFieldErrors(name: string) {
    return []
  }

  isFieldVisible(name: string): boolean {
    return true
  }

  isFieldDisabled(name: string): boolean {
    return false
  }

  showField(name: string): void {
    // 简化实现
  }

  hideField(name: string): void {
    // 简化实现
  }

  enableField(name: string): void {
    // 简化实现
  }

  disableField(name: string): void {
    // 简化实现
  }

  addField(field: any): void {
    // 简化实现
  }

  removeField(name: string): void {
    delete this.formData[name]
  }

  // 添加缺失的方法
  isValid(): boolean {
    return true // 简化实现
  }

  isDirty(): boolean {
    return Object.keys(this.formData).length > 0
  }

  isFieldTouched(name: string): boolean {
    return this.formData.hasOwnProperty(name)
  }

  touchField(name: string): void {
    // 简化实现 - 标记字段为已访问
  }

  setFieldReadonly(name: string, readonly: boolean): void {
    // 简化实现
  }

  isFieldReadonly(name: string): boolean {
    return false // 简化实现
  }

  clearFieldValidation(name: string): void {
    // 简化实现
  }

  once(event: string, handler: Function): void {
    const onceHandler = (...args: any[]) => {
      handler(...args)
      this.off(event, onceHandler)
    }
    this.on(event, onceHandler)
  }

  updateOptions(newOptions: Partial<FormOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }
}

/**
 * 创建表单实例
 */
export function createFormInstance(config: FormInstanceConfig): FormInstance {
  return new FormInstance(config)
}

// 导出类型和类
export { FormInstance }
export type { FormInstanceConfig as VanillaFormInstanceConfig }
