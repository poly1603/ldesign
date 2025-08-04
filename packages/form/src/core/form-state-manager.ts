/**
 * 表单状态管理器 - 负责管理表单数据、验证状态和交互状态
 */

import type {
  FormItemConfig,
  FormConfig,
  FormState,
  ValidationRule,
  FormEventType,
  FormEventData,
} from '../types'
import { EventEmitter } from '../utils/event-emitter'
import { debounce } from '../utils/throttle'

export interface FormStateManagerOptions {
  /** 初始值 */
  initialValues?: Record<string, any>
  /** 是否启用实时验证 */
  validateOnChange?: boolean
  /** 是否在失焦时验证 */
  validateOnBlur?: boolean
  /** 验证防抖延迟 */
  validationDelay?: number
  /** 是否保留未定义的字段 */
  preserveUndefined?: boolean
}

export interface StateSnapshot {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  timestamp: number
}

export class FormStateManager extends EventEmitter {
  private config: FormConfig
  private options: Required<FormStateManagerOptions>
  private state: FormState
  private initialState: FormState
  private history: StateSnapshot[] = []
  private historyIndex: number = -1
  private maxHistorySize: number = 50
  private debouncedValidate: (key?: string) => void
  private validationPromises = new Map<string, Promise<string | null>>()

  constructor(config: FormConfig, options: FormStateManagerOptions = {}) {
    super()
    this.config = config
    this.options = {
      initialValues: options.initialValues || {},
      validateOnChange: options.validateOnChange ?? true,
      validateOnBlur: options.validateOnBlur ?? true,
      validationDelay: options.validationDelay ?? 300,
      preserveUndefined: options.preserveUndefined ?? false,
    }
    
    this.state = this.createInitialState()
    this.initialState = this.cloneState(this.state)
    this.debouncedValidate = debounce(
      this.performValidation.bind(this),
      this.options.validationDelay
    )
    
    this.saveSnapshot()
  }

  /**
   * 创建初始状态
   */
  private createInitialState(): FormState {
    const values: Record<string, any> = {}
    const errors: Record<string, string> = {}
    const touched: Record<string, boolean> = {}
    
    // 从配置中获取默认值
    this.config.items.forEach(item => {
      if (this.options.initialValues.hasOwnProperty(item.key)) {
        values[item.key] = this.options.initialValues[item.key]
      } else if (item.defaultValue !== undefined) {
        values[item.key] = item.defaultValue
      } else if (!this.options.preserveUndefined) {
        values[item.key] = this.getDefaultValueForType(item.type)
      }
      
      touched[item.key] = false
    })
    
    return { values, errors, touched }
  }

  /**
   * 获取类型的默认值
   */
  private getDefaultValueForType(type: string): any {
    switch (type) {
      case 'checkbox':
      case 'switch':
        return false
      case 'select':
      case 'radio':
        return ''
      case 'input':
      case 'textarea':
      case 'date':
      case 'time':
      case 'datetime':
        return ''
      default:
        return ''
    }
  }

  /**
   * 更新配置
   */
  updateConfig(config: FormConfig): void {
    this.config = config
    
    // 添加新字段的默认值
    config.items.forEach(item => {
      if (!this.state.values.hasOwnProperty(item.key)) {
        if (item.defaultValue !== undefined) {
          this.state.values[item.key] = item.defaultValue
        } else if (!this.options.preserveUndefined) {
          this.state.values[item.key] = this.getDefaultValueForType(item.type)
        }
        this.state.touched[item.key] = false
      }
    })
    
    // 移除不存在的字段
    const existingKeys = new Set(config.items.map(item => item.key))
    Object.keys(this.state.values).forEach(key => {
      if (!existingKeys.has(key)) {
        delete this.state.values[key]
        delete this.state.errors[key]
        delete this.state.touched[key]
      }
    })
    
    this.emit('configUpdated', { config })
  }

  /**
   * 获取字段值
   */
  getValue(key: string): any {
    return this.state.values[key]
  }

  /**
   * 设置字段值
   */
  setValue(key: string, value: any, options?: {
    validate?: boolean
    touch?: boolean
    silent?: boolean
  }): void {
    const { validate = this.options.validateOnChange, touch = true, silent = false } = options || {}
    
    const oldValue = this.state.values[key]
    this.state.values[key] = value
    
    if (touch) {
      this.state.touched[key] = true
    }
    
    if (!silent) {
      this.emit('valueChanged', { key, value, oldValue })
    }
    
    if (validate) {
      this.debouncedValidate(key)
    }
    
    this.saveSnapshot()
  }

  /**
   * 批量设置值
   */
  setValues(values: Record<string, any>, options?: {
    validate?: boolean
    touch?: boolean
    silent?: boolean
    merge?: boolean
  }): void {
    const {
      validate = this.options.validateOnChange,
      touch = true,
      silent = false,
      merge = true,
    } = options || {}
    
    const oldValues = { ...this.state.values }
    
    if (merge) {
      Object.assign(this.state.values, values)
    } else {
      this.state.values = { ...values }
    }
    
    if (touch) {
      Object.keys(values).forEach(key => {
        this.state.touched[key] = true
      })
    }
    
    if (!silent) {
      this.emit('valuesChanged', { values, oldValues })
    }
    
    if (validate) {
      this.debouncedValidate()
    }
    
    this.saveSnapshot()
  }

  /**
   * 获取错误信息
   */
  getError(key: string): string | undefined {
    return this.state.errors[key]
  }

  /**
   * 设置错误信息
   */
  setError(key: string, error: string | null): void {
    if (error) {
      this.state.errors[key] = error
    } else {
      delete this.state.errors[key]
    }
    
    this.emit('errorChanged', { key, error })
  }

  /**
   * 批量设置错误
   */
  setErrors(errors: Record<string, string | null>): void {
    Object.entries(errors).forEach(([key, error]) => {
      if (error) {
        this.state.errors[key] = error
      } else {
        delete this.state.errors[key]
      }
    })
    
    this.emit('errorsChanged', { errors })
  }

  /**
   * 清除错误
   */
  clearErrors(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => {
        delete this.state.errors[key]
      })
    } else {
      this.state.errors = {}
    }
    
    this.emit('errorsCleared', { keys })
  }

  /**
   * 检查字段是否被触摸
   */
  isTouched(key: string): boolean {
    return this.state.touched[key] || false
  }

  /**
   * 标记字段为已触摸
   */
  setTouched(key: string, touched: boolean = true): void {
    this.state.touched[key] = touched
    this.emit('touchedChanged', { key, touched })
  }

  /**
   * 批量设置触摸状态
   */
  setTouchedFields(fields: Record<string, boolean>): void {
    Object.assign(this.state.touched, fields)
    this.emit('touchedFieldsChanged', { fields })
  }

  /**
   * 标记所有字段为已触摸
   */
  touchAll(): void {
    this.config.items.forEach(item => {
      this.state.touched[item.key] = true
    })
    this.emit('allTouched')
  }

  /**
   * 重置字段触摸状态
   */
  resetTouched(keys?: string[]): void {
    if (keys) {
      keys.forEach(key => {
        this.state.touched[key] = false
      })
    } else {
      Object.keys(this.state.touched).forEach(key => {
        this.state.touched[key] = false
      })
    }
    
    this.emit('touchedReset', { keys })
  }

  /**
   * 验证单个字段
   */
  async validateField(key: string): Promise<string | null> {
    const item = this.config.items.find(item => item.key === key)
    if (!item) {
      return null
    }
    
    const value = this.state.values[key]
    const errors: string[] = []
    
    // 必填验证
    if (item.required && this.isEmpty(value)) {
      errors.push(`${item.label || key} is required`)
    }
    
    // 自定义验证规则
    if (item.rules && !this.isEmpty(value)) {
      for (const rule of item.rules) {
        const error = await this.validateRule(value, rule, item)
        if (error) {
          errors.push(error)
        }
      }
    }
    
    // 全局验证规则
    if (this.config.validation?.rules) {
      const globalRules = this.config.validation.rules[key]
      if (globalRules && !this.isEmpty(value)) {
        for (const rule of globalRules) {
          const error = await this.validateRule(value, rule, item)
          if (error) {
            errors.push(error)
          }
        }
      }
    }
    
    const error = errors.length > 0 ? errors[0] : null
    this.setError(key, error)
    
    return error
  }

  /**
   * 验证所有字段
   */
  async validateAll(): Promise<Record<string, string | null>> {
    const validationPromises = this.config.items.map(item => 
      this.validateField(item.key).then(error => ({ key: item.key, error }))
    )
    
    const results = await Promise.all(validationPromises)
    const errors: Record<string, string | null> = {}
    
    results.forEach(({ key, error }) => {
      errors[key] = error
    })
    
    return errors
  }

  /**
   * 执行验证
   */
  private async performValidation(key?: string): Promise<void> {
    if (key) {
      // 取消之前的验证
      const existingPromise = this.validationPromises.get(key)
      if (existingPromise) {
        this.validationPromises.delete(key)
      }
      
      // 开始新的验证
      const promise = this.validateField(key)
      this.validationPromises.set(key, promise)
      
      try {
        await promise
      } finally {
        this.validationPromises.delete(key)
      }
    } else {
      await this.validateAll()
    }
  }

  /**
   * 验证规则
   */
  private async validateRule(
    value: any,
    rule: ValidationRule,
    item: FormItemConfig
  ): Promise<string | null> {
    if (typeof rule === 'function') {
      try {
        const result = await rule(value, this.state.values)
        return typeof result === 'string' ? result : null
      } catch (error) {
        return error instanceof Error ? error.message : 'Validation error'
      }
    }
    
    if (typeof rule === 'object') {
      const { validator, message } = rule
      
      if (typeof validator === 'function') {
        try {
          const isValid = await validator(value, this.state.values)
          return isValid ? null : (message || 'Validation failed')
        } catch (error) {
          return error instanceof Error ? error.message : 'Validation error'
        }
      }
      
      // 内置验证器
      if (typeof validator === 'string') {
        const isValid = this.validateBuiltInRule(value, validator, rule)
        return isValid ? null : (message || `Invalid ${validator}`)
      }
    }
    
    return null
  }

  /**
   * 内置验证规则
   */
  private validateBuiltInRule(value: any, type: string, rule: any): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case 'url':
        try {
          new URL(value)
          return true
        } catch {
          return false
        }
      case 'phone':
        return /^[\d\s\-\+\(\)]+$/.test(value)
      case 'number':
        return !isNaN(Number(value))
      case 'integer':
        return Number.isInteger(Number(value))
      case 'min':
        return Number(value) >= rule.min
      case 'max':
        return Number(value) <= rule.max
      case 'minLength':
        return String(value).length >= rule.minLength
      case 'maxLength':
        return String(value).length <= rule.maxLength
      case 'pattern':
        return new RegExp(rule.pattern).test(value)
      default:
        return true
    }
  }

  /**
   * 检查值是否为空
   */
  private isEmpty(value: any): boolean {
    if (value === null || value === undefined) {
      return true
    }
    
    if (typeof value === 'string') {
      return value.trim() === ''
    }
    
    if (Array.isArray(value)) {
      return value.length === 0
    }
    
    if (typeof value === 'object') {
      return Object.keys(value).length === 0
    }
    
    return false
  }

  /**
   * 检查表单是否有效
   */
  isValid(): boolean {
    return Object.keys(this.state.errors).length === 0
  }

  /**
   * 检查表单是否被修改
   */
  isDirty(): boolean {
    return JSON.stringify(this.state.values) !== JSON.stringify(this.initialState.values)
  }

  /**
   * 检查字段是否被修改
   */
  isFieldDirty(key: string): boolean {
    return this.state.values[key] !== this.initialState.values[key]
  }

  /**
   * 获取完整状态
   */
  getState(): FormState {
    return this.cloneState(this.state)
  }

  /**
   * 设置完整状态
   */
  setState(state: Partial<FormState>): void {
    if (state.values) {
      this.state.values = { ...state.values }
    }
    
    if (state.errors) {
      this.state.errors = { ...state.errors }
    }
    
    if (state.touched) {
      this.state.touched = { ...state.touched }
    }
    
    this.emit('stateChanged', { state: this.getState() })
    this.saveSnapshot()
  }

  /**
   * 重置表单
   */
  reset(values?: Record<string, any>): void {
    if (values) {
      this.state = this.createInitialState()
      Object.assign(this.state.values, values)
    } else {
      this.state = this.cloneState(this.initialState)
    }
    
    this.emit('reset', { state: this.getState() })
    this.saveSnapshot()
  }

  /**
   * 克隆状态
   */
  private cloneState(state: FormState): FormState {
    return {
      values: { ...state.values },
      errors: { ...state.errors },
      touched: { ...state.touched },
    }
  }

  /**
   * 保存快照
   */
  private saveSnapshot(): void {
    const snapshot: StateSnapshot = {
      values: { ...this.state.values },
      errors: { ...this.state.errors },
      touched: { ...this.state.touched },
      timestamp: Date.now(),
    }
    
    // 移除当前位置之后的历史记录
    this.history = this.history.slice(0, this.historyIndex + 1)
    
    // 添加新快照
    this.history.push(snapshot)
    this.historyIndex = this.history.length - 1
    
    // 限制历史记录大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.historyIndex--
    }
  }

  /**
   * 撤销
   */
  undo(): boolean {
    if (this.historyIndex > 0) {
      this.historyIndex--
      const snapshot = this.history[this.historyIndex]
      this.restoreSnapshot(snapshot)
      this.emit('undo', { snapshot })
      return true
    }
    return false
  }

  /**
   * 重做
   */
  redo(): boolean {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++
      const snapshot = this.history[this.historyIndex]
      this.restoreSnapshot(snapshot)
      this.emit('redo', { snapshot })
      return true
    }
    return false
  }

  /**
   * 恢复快照
   */
  private restoreSnapshot(snapshot: StateSnapshot): void {
    this.state.values = { ...snapshot.values }
    this.state.errors = { ...snapshot.errors }
    this.state.touched = { ...snapshot.touched }
    
    this.emit('stateRestored', { snapshot })
  }

  /**
   * 检查是否可以撤销
   */
  canUndo(): boolean {
    return this.historyIndex > 0
  }

  /**
   * 检查是否可以重做
   */
  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  /**
   * 获取历史记录
   */
  getHistory(): StateSnapshot[] {
    return [...this.history]
  }

  /**
   * 清除历史记录
   */
  clearHistory(): void {
    this.history = []
    this.historyIndex = -1
    this.saveSnapshot()
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.clearHistory()
    this.validationPromises.clear()
    this.removeAllListeners()
  }
}

/**
 * 创建表单状态管理器
 */
export function createFormStateManager(
  config: FormConfig,
  options?: FormStateManagerOptions
): FormStateManager {
  return new FormStateManager(config, options)
}