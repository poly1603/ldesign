// 表单状态管理器

import type {
  FieldState,
  FormData,
  FormOptions,
  FormState,
} from '../types/form'
import { deepClone, get, has, set } from '../utils/common'
import { SimpleEventEmitter } from '../utils/event'

/**
 * 表单状态管理器
 */
export class FormStateManager extends SimpleEventEmitter {
  private state: FormState
  private options: FormOptions
  private initialData: FormData

  constructor(options: FormOptions, initialData: FormData = {}) {
    super()
    this.options = options
    this.initialData = deepClone(initialData)
    this.state = this.createInitialState(initialData)
  }

  /**
   * 创建初始状态
   */
  private createInitialState(data: FormData): FormState {
    const fieldStates: Record<string, FieldState> = {}

    // 为每个字段创建初始状态
    this.options.fields.forEach(field => {
      const value = data[field.name] ?? field.defaultValue
      fieldStates[field.name] = {
        value,
        dirty: false,
        touched: false,
        validating: false,
        errors: [],
        valid: true,
        visible: !field.hidden,
        disabled: field.disabled || false,
        readonly: field.readonly || false,
      }
    })

    return {
      data: { ...data },
      errors: {},
      fieldStates,
      submitting: false,
      validating: false,
      dirty: false,
      valid: true,
      initialized: true,
    }
  }

  /**
   * 获取表单状态
   */
  getState(): FormState {
    return deepClone(this.state)
  }

  /**
   * 获取表单数据
   */
  getFormData(): FormData {
    return deepClone(this.state.data)
  }

  /**
   * 设置表单数据
   */
  setFormData(data: FormData): void {
    const oldData = this.state.data
    this.state.data = { ...data }

    // 更新字段状态
    Object.keys(data).forEach(fieldName => {
      if (this.state.fieldStates[fieldName]) {
        const oldValue = oldData[fieldName]
        const newValue = data[fieldName]

        this.state.fieldStates[fieldName].value = newValue

        if (oldValue !== newValue) {
          this.state.fieldStates[fieldName].dirty = true
          this.state.dirty = true
        }
      }
    })

    this.emit('change', this.state.data)
  }

  /**
   * 获取字段值
   */
  getFieldValue(name: string): any {
    return get(this.state.data, name)
  }

  /**
   * 设置字段值
   */
  setFieldValue(name: string, value: any): void {
    const oldValue = this.getFieldValue(name)

    if (oldValue === value) {
      return
    }

    // 更新数据
    set(this.state.data, name, value)

    // 更新字段状态
    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name].value = value
      this.state.fieldStates[name].dirty = true
      this.state.fieldStates[name].touched = true
    }

    // 更新表单状态
    this.state.dirty = true

    // 触发事件
    this.emit('fieldChange', name, value, oldValue)
    this.emit('change', this.state.data, name)
  }

  /**
   * 获取字段状态
   */
  getFieldState(name: string): FieldState | undefined {
    return this.state.fieldStates[name]
      ? deepClone(this.state.fieldStates[name])
      : undefined
  }

  /**
   * 设置字段状态
   */
  setFieldState(name: string, state: Partial<FieldState>): void {
    if (!this.state.fieldStates[name]) {
      return
    }

    const oldState = this.state.fieldStates[name]
    this.state.fieldStates[name] = { ...oldState, ...state }

    this.emit('fieldStateChange', name, this.state.fieldStates[name])
  }

  /**
   * 设置字段错误
   */
  setFieldErrors(name: string, errors: string[]): void {
    if (!this.state.fieldStates[name]) {
      return
    }

    this.state.fieldStates[name].errors = errors
    this.state.fieldStates[name].valid = errors.length === 0

    // 更新表单级错误
    if (errors.length > 0) {
      this.state.errors[name] = errors
    } else {
      delete this.state.errors[name]
    }

    // 更新表单有效性
    this.updateFormValidity()
  }

  /**
   * 清空字段错误
   */
  clearFieldErrors(name: string): void {
    this.setFieldErrors(name, [])
  }

  /**
   * 清空所有错误
   */
  clearAllErrors(): void {
    this.state.errors = {}
    Object.keys(this.state.fieldStates).forEach(name => {
      this.state.fieldStates[name].errors = []
      this.state.fieldStates[name].valid = true
    })
    this.state.valid = true
  }

  /**
   * 设置字段可见性
   */
  setFieldVisible(name: string, visible: boolean): void {
    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name].visible = visible
    }
  }

  /**
   * 设置字段禁用状态
   */
  setFieldDisabled(name: string, disabled: boolean): void {
    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name].disabled = disabled
    }
  }

  /**
   * 设置字段只读状态
   */
  setFieldReadonly(name: string, readonly: boolean): void {
    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name].readonly = readonly
    }
  }

  /**
   * 标记字段为已访问
   */
  touchField(name: string): void {
    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name].touched = true
    }
  }

  /**
   * 设置提交状态
   */
  setSubmitting(submitting: boolean): void {
    this.state.submitting = submitting
  }

  /**
   * 设置验证状态
   */
  setValidating(validating: boolean): void {
    this.state.validating = validating
  }

  /**
   * 设置字段验证状态
   */
  setFieldValidating(name: string, validating: boolean): void {
    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name].validating = validating
    }
  }

  /**
   * 重置表单
   */
  reset(): void {
    this.state = this.createInitialState(this.initialData)
    this.emit('reset', this.state.data)
  }

  /**
   * 重置字段
   */
  resetField(name: string): void {
    const initialValue =
      this.initialData[name] ??
      this.options.fields.find(f => f.name === name)?.defaultValue

    if (this.state.fieldStates[name]) {
      this.state.fieldStates[name] = {
        value: initialValue,
        dirty: false,
        touched: false,
        validating: false,
        errors: [],
        valid: true,
        visible: !this.options.fields.find(f => f.name === name)?.hidden,
        disabled:
          this.options.fields.find(f => f.name === name)?.disabled || false,
        readonly:
          this.options.fields.find(f => f.name === name)?.readonly || false,
      }
    }

    set(this.state.data, name, initialValue)
    delete this.state.errors[name]

    this.updateFormValidity()
    this.emit('fieldChange', name, initialValue, this.getFieldValue(name))
  }

  /**
   * 更新表单有效性
   */
  private updateFormValidity(): void {
    const hasErrors = Object.keys(this.state.errors).length > 0
    const hasFieldErrors = Object.values(this.state.fieldStates).some(
      state => !state.valid
    )

    this.state.valid = !hasErrors && !hasFieldErrors
  }

  /**
   * 检查表单是否已修改
   */
  isDirty(): boolean {
    return this.state.dirty
  }

  /**
   * 检查字段是否已修改
   */
  isFieldDirty(name: string): boolean {
    return this.state.fieldStates[name]?.dirty || false
  }

  /**
   * 检查字段是否已访问
   */
  isFieldTouched(name: string): boolean {
    return this.state.fieldStates[name]?.touched || false
  }

  /**
   * 检查表单是否有效
   */
  isValid(): boolean {
    return this.state.valid
  }

  /**
   * 检查字段是否有效
   */
  isFieldValid(name: string): boolean {
    return this.state.fieldStates[name]?.valid || false
  }

  /**
   * 获取所有错误
   */
  getErrors(): Record<string, string[]> {
    return deepClone(this.state.errors)
  }

  /**
   * 获取字段错误
   */
  getFieldErrors(name: string): string[] {
    return this.state.fieldStates[name]?.errors || []
  }

  /**
   * 检查字段是否存在
   */
  hasField(name: string): boolean {
    return has(this.state.fieldStates, name)
  }

  /**
   * 获取所有字段名
   */
  getFieldNames(): string[] {
    return Object.keys(this.state.fieldStates)
  }

  /**
   * 获取可见字段名
   */
  getVisibleFieldNames(): string[] {
    return Object.keys(this.state.fieldStates).filter(
      name => this.state.fieldStates[name].visible
    )
  }

  /**
   * 获取已修改的字段名
   */
  getDirtyFieldNames(): string[] {
    return Object.keys(this.state.fieldStates).filter(
      name => this.state.fieldStates[name].dirty
    )
  }

  /**
   * 获取有错误的字段名
   */
  getInvalidFieldNames(): string[] {
    return Object.keys(this.state.fieldStates).filter(
      name => !this.state.fieldStates[name].valid
    )
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.removeAllListeners()
  }
}
