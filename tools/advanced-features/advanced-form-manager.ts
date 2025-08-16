/**
 * 高级表单管理系统
 * 支持动态表单、复杂验证、自动保存、多步骤表单等高级功能
 */

import chalk from 'chalk'
import { reactive, watch } from 'vue'

export interface FormConfig {
  /** 表单字段定义 */
  fields: FormField[]
  /** 验证规则 */
  validation: ValidationConfig
  /** 自动保存配置 */
  autoSave?: AutoSaveConfig
  /** 多步骤配置 */
  multiStep?: MultiStepConfig
  /** 条件显示配置 */
  conditionalDisplay?: ConditionalDisplayConfig
  /** 国际化配置 */
  i18n?: I18nConfig
}

export interface FormField {
  /** 字段名称 */
  name: string
  /** 字段类型 */
  type: FieldType
  /** 字段标签 */
  label: string
  /** 默认值 */
  defaultValue?: any
  /** 是否必填 */
  required?: boolean
  /** 字段选项（用于选择类型） */
  options?: FieldOption[]
  /** 字段属性 */
  props?: Record<string, any>
  /** 验证规则 */
  validation?: FieldValidation[]
  /** 条件显示 */
  condition?: FieldCondition
  /** 字段组 */
  group?: string
  /** 步骤（多步骤表单） */
  step?: number
  /** 字段描述 */
  description?: string
  /** 占位符 */
  placeholder?: string
}

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'datetime'
  | 'time'
  | 'file'
  | 'image'
  | 'color'
  | 'range'
  | 'rating'
  | 'rich-text'
  | 'json'
  | 'custom'

export interface FieldOption {
  label: string
  value: any
  disabled?: boolean
  group?: string
}

export interface FieldValidation {
  type: ValidationType
  value?: any
  message?: string
  async?: boolean
  debounce?: number
}

export type ValidationType =
  | 'required'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'email'
  | 'url'
  | 'number'
  | 'integer'
  | 'positive'
  | 'negative'
  | 'custom'
  | 'async'

export interface FieldCondition {
  field: string
  operator:
    | 'equals'
    | 'not-equals'
    | 'contains'
    | 'not-contains'
    | 'greater'
    | 'less'
    | 'in'
    | 'not-in'
  value: any
}

export interface ValidationConfig {
  /** 验证模式 */
  mode: 'onChange' | 'onBlur' | 'onSubmit' | 'manual'
  /** 是否显示实时验证 */
  realtime: boolean
  /** 防抖延迟 */
  debounce: number
  /** 自定义验证器 */
  customValidators?: Record<string, CustomValidator>
}

export interface CustomValidator {
  validate: (
    value: any,
    field: FormField,
    formData: any
  ) => boolean | string | Promise<boolean | string>
  message?: string
}

export interface AutoSaveConfig {
  /** 是否启用自动保存 */
  enabled: boolean
  /** 保存间隔（毫秒） */
  interval: number
  /** 存储键 */
  storageKey: string
  /** 存储类型 */
  storageType: 'localStorage' | 'sessionStorage' | 'indexedDB' | 'custom'
  /** 自定义保存函数 */
  customSave?: (data: any) => Promise<void>
  /** 自定义加载函数 */
  customLoad?: () => Promise<any>
}

export interface MultiStepConfig {
  /** 是否启用多步骤 */
  enabled: boolean
  /** 步骤配置 */
  steps: FormStep[]
  /** 是否允许跳步 */
  allowSkip: boolean
  /** 是否显示进度 */
  showProgress: boolean
}

export interface FormStep {
  /** 步骤名称 */
  name: string
  /** 步骤标题 */
  title: string
  /** 步骤描述 */
  description?: string
  /** 步骤字段 */
  fields: string[]
  /** 是否可选 */
  optional?: boolean
  /** 验证规则 */
  validation?: () => boolean | Promise<boolean>
}

export interface ConditionalDisplayConfig {
  /** 条件规则 */
  rules: ConditionalRule[]
}

export interface ConditionalRule {
  /** 目标字段 */
  target: string
  /** 条件 */
  condition: FieldCondition
  /** 动作 */
  action: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional'
}

export interface I18nConfig {
  /** 当前语言 */
  locale: string
  /** 翻译函数 */
  t: (key: string, params?: any) => string
  /** 消息键前缀 */
  messagePrefix?: string
}

export interface FormState {
  /** 表单数据 */
  data: Record<string, any>
  /** 验证错误 */
  errors: Record<string, string[]>
  /** 字段状态 */
  fieldStates: Record<string, FieldState>
  /** 表单状态 */
  isValid: boolean
  /** 是否正在提交 */
  isSubmitting: boolean
  /** 是否已修改 */
  isDirty: boolean
  /** 当前步骤 */
  currentStep: number
  /** 是否正在验证 */
  isValidating: boolean
}

export interface FieldState {
  /** 是否已访问 */
  touched: boolean
  /** 是否有焦点 */
  focused: boolean
  /** 是否正在验证 */
  validating: boolean
  /** 是否可见 */
  visible: boolean
  /** 是否启用 */
  enabled: boolean
  /** 是否必填 */
  required: boolean
}

export class AdvancedFormManager {
  private config: FormConfig
  private state: FormState
  private autoSaveTimer?: number
  private validationTimers: Map<string, number> = new Map()

  constructor(config: FormConfig) {
    this.config = config
    this.state = this.initializeState()
    this.setupAutoSave()
    this.setupConditionalDisplay()
    this.loadAutoSavedData()
  }

  /**
   * 初始化表单状态
   */
  private initializeState(): FormState {
    const data: Record<string, any> = {}
    const errors: Record<string, string[]> = {}
    const fieldStates: Record<string, FieldState> = {}

    for (const field of this.config.fields) {
      data[field.name] = field.defaultValue
      errors[field.name] = []
      fieldStates[field.name] = {
        touched: false,
        focused: false,
        validating: false,
        visible: !field.condition,
        enabled: true,
        required: field.required || false,
      }
    }

    return reactive({
      data,
      errors,
      fieldStates,
      isValid: false,
      isSubmitting: false,
      isDirty: false,
      currentStep: 1,
      isValidating: false,
    })
  }

  /**
   * 设置自动保存
   */
  private setupAutoSave(): void {
    if (!this.config.autoSave?.enabled) return

    const { interval } = this.config.autoSave

    this.autoSaveTimer = window.setInterval(() => {
      this.autoSave()
    }, interval)

    // 监听数据变化
    watch(
      () => this.state.data,
      () => {
        this.state.isDirty = true
      },
      { deep: true }
    )
  }

  /**
   * 设置条件显示
   */
  private setupConditionalDisplay(): void {
    if (!this.config.conditionalDisplay) return

    // 监听数据变化，更新字段可见性
    watch(
      () => this.state.data,
      () => {
        this.updateConditionalDisplay()
      },
      { deep: true, immediate: true }
    )
  }

  /**
   * 更新条件显示
   */
  private updateConditionalDisplay(): void {
    if (!this.config.conditionalDisplay) return

    for (const rule of this.config.conditionalDisplay.rules) {
      const { target, condition, action } = rule
      const fieldState = this.state.fieldStates[target]

      if (!fieldState) continue

      const conditionMet = this.evaluateCondition(condition)

      switch (action) {
        case 'show':
          fieldState.visible = conditionMet
          break
        case 'hide':
          fieldState.visible = !conditionMet
          break
        case 'enable':
          fieldState.enabled = conditionMet
          break
        case 'disable':
          fieldState.enabled = !conditionMet
          break
        case 'require':
          fieldState.required = conditionMet
          break
        case 'optional':
          fieldState.required = !conditionMet
          break
      }
    }
  }

  /**
   * 评估条件
   */
  private evaluateCondition(condition: FieldCondition): boolean {
    const { field, operator, value } = condition
    const fieldValue = this.state.data[field]

    switch (operator) {
      case 'equals':
        return fieldValue === value
      case 'not-equals':
        return fieldValue !== value
      case 'contains':
        return String(fieldValue).includes(String(value))
      case 'not-contains':
        return !String(fieldValue).includes(String(value))
      case 'greater':
        return Number(fieldValue) > Number(value)
      case 'less':
        return Number(fieldValue) < Number(value)
      case 'in':
        return Array.isArray(value) && value.includes(fieldValue)
      case 'not-in':
        return Array.isArray(value) && !value.includes(fieldValue)
      default:
        return false
    }
  }

  /**
   * 设置字段值
   */
  setFieldValue(fieldName: string, value: any): void {
    this.state.data[fieldName] = value
    this.state.fieldStates[fieldName].touched = true

    // 触发验证
    if (this.config.validation.mode === 'onChange') {
      this.validateField(fieldName)
    }
  }

  /**
   * 获取字段值
   */
  getFieldValue(fieldName: string): any {
    return this.state.data[fieldName]
  }

  /**
   * 验证字段
   */
  async validateField(fieldName: string): Promise<boolean> {
    const field = this.config.fields.find(f => f.name === fieldName)
    if (!field) return true

    const fieldState = this.state.fieldStates[fieldName]
    const value = this.state.data[fieldName]

    // 清除之前的验证定时器
    const existingTimer = this.validationTimers.get(fieldName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置防抖验证
    return new Promise(resolve => {
      const timer = window.setTimeout(async () => {
        fieldState.validating = true
        const errors: string[] = []

        try {
          // 内置验证
          if (field.validation) {
            for (const rule of field.validation) {
              const error = await this.validateRule(value, rule, field)
              if (error) {
                errors.push(error)
              }
            }
          }

          // 必填验证
          if (fieldState.required && this.isEmpty(value)) {
            errors.push(this.getMessage('required', field))
          }

          this.state.errors[fieldName] = errors
          fieldState.validating = false

          resolve(errors.length === 0)
        } catch (error) {
          console.error(chalk.red(`❌ 字段验证失败: ${fieldName}`), error)
          fieldState.validating = false
          resolve(false)
        }
      }, this.config.validation.debounce || 300)

      this.validationTimers.set(fieldName, timer)
    })
  }

  /**
   * 验证规则
   */
  private async validateRule(
    value: any,
    rule: FieldValidation,
    field: FormField
  ): Promise<string | null> {
    const { type, value: ruleValue, message } = rule

    switch (type) {
      case 'required':
        return this.isEmpty(value)
          ? message || this.getMessage('required', field)
          : null

      case 'min':
        return Number(value) < Number(ruleValue)
          ? message || this.getMessage('min', field, { min: ruleValue })
          : null

      case 'max':
        return Number(value) > Number(ruleValue)
          ? message || this.getMessage('max', field, { max: ruleValue })
          : null

      case 'minLength':
        return String(value).length < Number(ruleValue)
          ? message ||
              this.getMessage('minLength', field, { minLength: ruleValue })
          : null

      case 'maxLength':
        return String(value).length > Number(ruleValue)
          ? message ||
              this.getMessage('maxLength', field, { maxLength: ruleValue })
          : null

      case 'pattern':
        const regex = new RegExp(ruleValue)
        return !regex.test(String(value))
          ? message || this.getMessage('pattern', field)
          : null

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
        return !emailRegex.test(String(value))
          ? message || this.getMessage('email', field)
          : null

      case 'url':
        try {
          new URL(String(value))
          return null
        } catch {
          return message || this.getMessage('url', field)
        }

      case 'custom':
        if (this.config.validation.customValidators?.[ruleValue]) {
          const validator = this.config.validation.customValidators[ruleValue]
          const result = await validator.validate(value, field, this.state.data)

          if (result === true) return null
          if (typeof result === 'string') return result
          return (
            message || validator.message || this.getMessage('custom', field)
          )
        }
        return null

      case 'async':
        // 异步验证逻辑
        return null

      default:
        return null
    }
  }

  /**
   * 检查值是否为空
   */
  private isEmpty(value: any): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    )
  }

  /**
   * 获取错误消息
   */
  private getMessage(type: string, field: FormField, params?: any): string {
    const { i18n } = this.config

    if (i18n) {
      const key = `${i18n.messagePrefix || 'form.validation'}.${type}`
      return i18n.t(key, { field: field.label, ...params })
    }

    // 默认消息
    const messages = {
      required: `${field.label} 是必填项`,
      min: `${field.label} 不能小于 ${params?.min}`,
      max: `${field.label} 不能大于 ${params?.max}`,
      minLength: `${field.label} 长度不能少于 ${params?.minLength} 个字符`,
      maxLength: `${field.label} 长度不能超过 ${params?.maxLength} 个字符`,
      pattern: `${field.label} 格式不正确`,
      email: `${field.label} 邮箱格式不正确`,
      url: `${field.label} URL 格式不正确`,
      custom: `${field.label} 验证失败`,
    }

    return messages[type as keyof typeof messages] || `${field.label} 验证失败`
  }

  /**
   * 验证整个表单
   */
  async validateForm(): Promise<boolean> {
    this.state.isValidating = true

    const validationPromises = this.config.fields
      .filter(field => this.state.fieldStates[field.name].visible)
      .map(field => this.validateField(field.name))

    const results = await Promise.all(validationPromises)
    const isValid = results.every(result => result)

    this.state.isValid = isValid
    this.state.isValidating = false

    return isValid
  }

  /**
   * 提交表单
   */
  async submitForm(): Promise<any> {
    this.state.isSubmitting = true

    try {
      // 验证表单
      const isValid = await this.validateForm()
      if (!isValid) {
        throw new Error('表单验证失败')
      }

      // 清除自动保存数据
      this.clearAutoSavedData()

      return this.state.data
    } finally {
      this.state.isSubmitting = false
    }
  }

  /**
   * 重置表单
   */
  resetForm(): void {
    for (const field of this.config.fields) {
      this.state.data[field.name] = field.defaultValue
      this.state.errors[field.name] = []
      this.state.fieldStates[field.name] = {
        touched: false,
        focused: false,
        validating: false,
        visible: !field.condition,
        enabled: true,
        required: field.required || false,
      }
    }

    this.state.isDirty = false
    this.state.currentStep = 1
    this.clearAutoSavedData()
  }

  /**
   * 下一步
   */
  nextStep(): boolean {
    if (!this.config.multiStep?.enabled) return false

    const currentStepConfig =
      this.config.multiStep.steps[this.state.currentStep - 1]
    if (!currentStepConfig) return false

    // 验证当前步骤
    const currentStepValid = this.validateCurrentStep()
    if (!currentStepValid) return false

    if (this.state.currentStep < this.config.multiStep.steps.length) {
      this.state.currentStep++
      return true
    }

    return false
  }

  /**
   * 上一步
   */
  previousStep(): boolean {
    if (!this.config.multiStep?.enabled) return false

    if (this.state.currentStep > 1) {
      this.state.currentStep--
      return true
    }

    return false
  }

  /**
   * 验证当前步骤
   */
  private async validateCurrentStep(): Promise<boolean> {
    if (!this.config.multiStep?.enabled) return true

    const currentStepConfig =
      this.config.multiStep.steps[this.state.currentStep - 1]
    if (!currentStepConfig) return true

    // 验证步骤字段
    const validationPromises = currentStepConfig.fields.map(fieldName =>
      this.validateField(fieldName)
    )

    const results = await Promise.all(validationPromises)
    const fieldsValid = results.every(result => result)

    // 自定义步骤验证
    if (currentStepConfig.validation) {
      const customValid = await currentStepConfig.validation()
      return fieldsValid && customValid
    }

    return fieldsValid
  }

  /**
   * 自动保存
   */
  private async autoSave(): Promise<void> {
    if (!this.config.autoSave?.enabled || !this.state.isDirty) return

    try {
      const { storageType, storageKey, customSave } = this.config.autoSave

      if (customSave) {
        await customSave(this.state.data)
      } else {
        switch (storageType) {
          case 'localStorage':
            localStorage.setItem(storageKey, JSON.stringify(this.state.data))
            break
          case 'sessionStorage':
            sessionStorage.setItem(storageKey, JSON.stringify(this.state.data))
            break
          case 'indexedDB':
            // IndexedDB 实现
            break
        }
      }

      console.log(chalk.green('✅ 表单数据自动保存成功'))
    } catch (error) {
      console.error(chalk.red('❌ 表单数据自动保存失败:'), error)
    }
  }

  /**
   * 加载自动保存的数据
   */
  private async loadAutoSavedData(): Promise<void> {
    if (!this.config.autoSave?.enabled) return

    try {
      const { storageType, storageKey, customLoad } = this.config.autoSave
      let savedData: any = null

      if (customLoad) {
        savedData = await customLoad()
      } else {
        switch (storageType) {
          case 'localStorage':
            const localData = localStorage.getItem(storageKey)
            savedData = localData ? JSON.parse(localData) : null
            break
          case 'sessionStorage':
            const sessionData = sessionStorage.getItem(storageKey)
            savedData = sessionData ? JSON.parse(sessionData) : null
            break
          case 'indexedDB':
            // IndexedDB 实现
            break
        }
      }

      if (savedData) {
        Object.assign(this.state.data, savedData)
        console.log(chalk.green('✅ 自动保存的表单数据已恢复'))
      }
    } catch (error) {
      console.error(chalk.red('❌ 加载自动保存数据失败:'), error)
    }
  }

  /**
   * 清除自动保存的数据
   */
  private clearAutoSavedData(): void {
    if (!this.config.autoSave?.enabled) return

    const { storageType, storageKey } = this.config.autoSave

    try {
      switch (storageType) {
        case 'localStorage':
          localStorage.removeItem(storageKey)
          break
        case 'sessionStorage':
          sessionStorage.removeItem(storageKey)
          break
        case 'indexedDB':
          // IndexedDB 实现
          break
      }
    } catch (error) {
      console.error(chalk.red('❌ 清除自动保存数据失败:'), error)
    }
  }

  /**
   * 获取表单状态
   */
  getState(): FormState {
    return this.state
  }

  /**
   * 获取当前步骤的字段
   */
  getCurrentStepFields(): FormField[] {
    if (!this.config.multiStep?.enabled) {
      return this.config.fields.filter(
        field => this.state.fieldStates[field.name].visible
      )
    }

    const currentStepConfig =
      this.config.multiStep.steps[this.state.currentStep - 1]
    if (!currentStepConfig) return []

    return this.config.fields.filter(
      field =>
        currentStepConfig.fields.includes(field.name) &&
        this.state.fieldStates[field.name].visible
    )
  }

  /**
   * 销毁表单管理器
   */
  destroy(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer)
    }

    for (const timer of this.validationTimers.values()) {
      clearTimeout(timer)
    }
    this.validationTimers.clear()
  }
}

/**
 * 创建高级表单管理器
 */
export function createAdvancedFormManager(
  config: FormConfig
): AdvancedFormManager {
  return new AdvancedFormManager(config)
}
