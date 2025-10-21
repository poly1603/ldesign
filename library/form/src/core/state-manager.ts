/**
 * @ldesign/form - State Manager
 * 状态管理器
 */

import type { FormState, FieldState, Subscriber, Unsubscribe } from '../utils/types'
import { deepClone } from '../utils/helpers'

/**
 * 状态变更事件
 */
export interface StateChangeEvent {
  /** 变更类型 */
  type: 'form' | 'field'
  /** 字段名（仅字段状态变更时有值） */
  field?: string
  /** 新状态 */
  state: FormState | FieldState
  /** 旧状态 */
  oldState: FormState | FieldState
}

/**
 * 状态管理器类
 */
export class StateManager {
  private formState: FormState
  private fieldStates: Map<string, FieldState>
  private subscribers: Set<Subscriber<StateChangeEvent>>

  constructor() {
    this.formState = this.createInitialFormState()
    this.fieldStates = new Map()
    this.subscribers = new Set()
  }

  /**
   * 创建初始表单状态
   */
  private createInitialFormState(): FormState {
    return {
      submitting: false,
      validating: false,
      valid: true,
      dirty: false,
      touched: false,
      pristine: true,
      errorCount: 0,
      fieldCount: 0
    }
  }

  /**
   * 创建初始字段状态
   */
  private createInitialFieldState(value?: any): FieldState {
    return {
      value: value ?? null,
      initialValue: value ?? null,
      touched: false,
      dirty: false,
      validating: false,
      valid: true,
      errors: [],
      disabled: false,
      readonly: false,
      visible: true
    }
  }

  /**
   * 注册字段
   * @param name 字段名
   * @param initialValue 初始值
   */
  registerField(name: string, initialValue?: any): void {
    if (this.fieldStates.has(name)) {
      return
    }

    this.fieldStates.set(name, this.createInitialFieldState(initialValue))
    this.updateFormState({ fieldCount: this.fieldStates.size })
  }

  /**
   * 注销字段
   * @param name 字段名
   */
  unregisterField(name: string): void {
    this.fieldStates.delete(name)
    this.updateFormState({ fieldCount: this.fieldStates.size })
    this.recalculateFormState()
  }

  /**
   * 获取表单状态
   * @param clone 是否克隆
   */
  getFormState(clone = true): FormState {
    return clone ? deepClone(this.formState) : this.formState
  }

  /**
   * 获取字段状态
   * @param name 字段名
   * @param clone 是否克隆
   */
  getFieldState(name: string, clone = true): FieldState | undefined {
    const state = this.fieldStates.get(name)
    return state && clone ? deepClone(state) : state
  }

  /**
   * 更新表单状态
   * @param updates 状态更新
   */
  updateFormState(updates: Partial<FormState>): void {
    const oldState = this.formState
    this.formState = { ...this.formState, ...updates }

    this.notifySubscribers({
      type: 'form',
      state: this.formState,
      oldState
    })
  }

  /**
   * 更新字段状态
   * @param name 字段名
   * @param updates 状态更新
   */
  updateFieldState(name: string, updates: Partial<FieldState>): void {
    const currentState = this.fieldStates.get(name)
    if (!currentState) {
      return
    }

    const oldState = currentState
    const newState = { ...currentState, ...updates }
    this.fieldStates.set(name, newState)

    this.notifySubscribers({
      type: 'field',
      field: name,
      state: newState,
      oldState
    })

    // 某些字段状态变更需要重新计算表单状态
    if ('valid' in updates || 'dirty' in updates || 'touched' in updates) {
      this.recalculateFormState()
    }
  }

  /**
   * 设置字段值
   * @param name 字段名
   * @param value 值
   */
  setFieldValue(name: string, value: any): void {
    const state = this.fieldStates.get(name)
    if (!state) {
      return
    }

    const dirty = value !== state.initialValue
    this.updateFieldState(name, { value, dirty })
  }

  /**
   * 设置字段触摸状态
   * @param name 字段名
   * @param touched 是否触摸
   */
  setFieldTouched(name: string, touched = true): void {
    this.updateFieldState(name, { touched })
  }

  /**
   * 设置字段验证状态
   * @param name 字段名
   * @param validating 是否验证中
   */
  setFieldValidating(name: string, validating = true): void {
    this.updateFieldState(name, { validating })
  }

  /**
   * 设置字段验证结果
   * @param name 字段名
   * @param valid 是否有效
   * @param errors 错误消息
   */
  setFieldValidationResult(name: string, valid: boolean, errors: string[] = []): void {
    this.updateFieldState(name, { valid, errors, validating: false })
  }

  /**
   * 设置字段禁用状态
   * @param name 字段名
   * @param disabled 是否禁用
   */
  setFieldDisabled(name: string, disabled = true): void {
    this.updateFieldState(name, { disabled })
  }

  /**
   * 设置字段只读状态
   * @param name 字段名
   * @param readonly 是否只读
   */
  setFieldReadonly(name: string, readonly = true): void {
    this.updateFieldState(name, { readonly })
  }

  /**
   * 设置字段可见性
   * @param name 字段名
   * @param visible 是否可见
   */
  setFieldVisible(name: string, visible = true): void {
    this.updateFieldState(name, { visible })
  }

  /**
   * 重新计算表单状态
   */
  private recalculateFormState(): void {
    let valid = true
    let dirty = false
    let touched = false
    let pristine = true
    let errorCount = 0

    this.fieldStates.forEach(state => {
      if (!state.valid) {
        valid = false
        errorCount += state.errors.length
      }
      if (state.dirty) {
        dirty = true
        pristine = false
      }
      if (state.touched) {
        touched = true
      }
    })

    this.updateFormState({
      valid,
      dirty,
      touched,
      pristine,
      errorCount
    })
  }

  /**
   * 重置表单状态
   */
  resetFormState(): void {
    this.formState = this.createInitialFormState()
    this.formState.fieldCount = this.fieldStates.size
  }

  /**
   * 重置字段状态
   * @param name 字段名
   */
  resetFieldState(name: string): void {
    const state = this.fieldStates.get(name)
    if (!state) {
      return
    }

    this.updateFieldState(name, {
      value: state.initialValue,
      touched: false,
      dirty: false,
      validating: false,
      valid: true,
      errors: []
    })
  }

  /**
   * 重置所有字段状态
   */
  resetAllFieldStates(): void {
    this.fieldStates.forEach((_, name) => {
      this.resetFieldState(name)
    })
    this.resetFormState()
  }

  /**
   * 获取所有字段名
   */
  getFieldNames(): string[] {
    return Array.from(this.fieldStates.keys())
  }

  /**
   * 获取所有字段状态
   */
  getAllFieldStates(clone = true): Record<string, FieldState> {
    const states: Record<string, FieldState> = {}
    this.fieldStates.forEach((state, name) => {
      states[name] = clone ? deepClone(state) : state
    })
    return states
  }

  /**
   * 检查字段是否已注册
   * @param name 字段名
   */
  hasField(name: string): boolean {
    return this.fieldStates.has(name)
  }

  /**
   * 订阅状态变更
   * @param subscriber 订阅者函数
   * @returns 取消订阅函数
   */
  subscribe(subscriber: Subscriber<StateChangeEvent>): Unsubscribe {
    this.subscribers.add(subscriber)

    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  /**
   * 通知所有订阅者
   * @param event 状态变更事件
   */
  private notifySubscribers(event: StateChangeEvent): void {
    this.subscribers.forEach(subscriber => {
      try {
        subscriber(event)
      } catch (error) {
        console.error('Error in state change subscriber:', error)
      }
    })
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    this.fieldStates.clear()
    this.subscribers.clear()
  }
}

/**
 * 创建状态管理器
 */
export function createStateManager(): StateManager {
  return new StateManager()
}




