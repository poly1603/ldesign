/**
 * 状态管理器
 * 
 * 负责表单状态的管理，包括：
 * - 表单整体状态
 * - 字段状态
 * - 验证状态
 * - 提交状态
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { EventEmitter } from '../utils/event-emitter'
import { deepClone, deepEqual } from '../utils/helpers'
import type { FormState, FieldState } from '../types'

/**
 * 状态变化事件
 */
export interface StateChangeEvent<T = any> {
  /** 变化类型 */
  type: 'form' | 'field'
  /** 新状态 */
  state: FormState<T> | FieldState
  /** 旧状态 */
  oldState: FormState<T> | FieldState
  /** 字段名称（如果是字段状态变化） */
  fieldName?: string
}

/**
 * 状态管理器类
 * 
 * 提供完整的状态管理功能，支持：
 * - 表单状态管理
 * - 字段状态管理
 * - 状态变化监听
 * - 状态快照和恢复
 * 
 * @template T 表单数据类型
 */
export class StateManager<T = Record<string, any>> extends EventEmitter {
  /** 表单状态 */
  private formState: FormState<T>

  /** 字段状态映射 */
  private fieldStates: Map<string, FieldState> = new Map()

  /** 初始表单状态 */
  private initialFormState: FormState<T>

  /** 是否已销毁 */
  private destroyed = false

  /**
   * 构造函数
   * 
   * @param initialValues 初始值
   */
  constructor(initialValues: T = {} as T) {
    super()

    // 初始化表单状态
    this.initialFormState = {
      values: initialValues,
      errors: {},
      touched: {},
      dirty: {},
      submitting: false,
      validating: false,
      valid: true
    }

    this.formState = deepClone(this.initialFormState)
  }

  /**
   * 获取表单状态
   * 
   * @returns 表单状态副本
   */
  getState(): FormState<T> {
    this.checkDestroyed()
    return deepClone(this.formState)
  }

  /**
   * 更新表单状态
   * 
   * @param updates 状态更新
   * @param silent 是否静默更新
   */
  updateState(updates: Partial<FormState<T>>, silent = false): void {
    this.checkDestroyed()

    const oldState = deepClone(this.formState)
    const newState = { ...this.formState, ...updates }

    // 检查状态是否真的发生了变化
    if (deepEqual(this.formState, newState)) {
      return
    }

    this.formState = newState

    if (!silent) {
      this.emit('state:change', {
        type: 'form',
        state: deepClone(this.formState),
        oldState
      } as StateChangeEvent<T>)
    }
  }

  /**
   * 设置表单值
   * 
   * @param values 新值
   * @param silent 是否静默更新
   */
  setValues(values: T, silent = false): void {
    this.updateState({ values }, silent)
  }

  /**
   * 设置表单错误
   * 
   * @param errors 错误信息
   * @param silent 是否静默更新
   */
  setErrors(errors: Record<string, string[]>, silent = false): void {
    this.updateState({ errors, valid: Object.keys(errors).length === 0 }, silent)
  }

  /**
   * 设置字段错误
   * 
   * @param fieldName 字段名称
   * @param errors 错误信息
   * @param silent 是否静默更新
   */
  setFieldError(fieldName: string, errors: string[], silent = false): void {
    const newErrors = { ...this.formState.errors }

    if (errors.length === 0) {
      delete newErrors[fieldName]
    } else {
      newErrors[fieldName] = errors
    }

    this.setErrors(newErrors, silent)
  }

  /**
   * 清除字段错误
   * 
   * @param fieldName 字段名称
   * @param silent 是否静默更新
   */
  clearFieldError(fieldName: string, silent = false): void {
    this.setFieldError(fieldName, [], silent)
  }

  /**
   * 清除所有错误
   * 
   * @param silent 是否静默更新
   */
  clearAllErrors(silent = false): void {
    this.setErrors({}, silent)
  }

  /**
   * 设置字段为已触摸
   * 
   * @param fieldName 字段名称
   * @param touched 是否已触摸
   * @param silent 是否静默更新
   */
  setFieldTouched(fieldName: string, touched = true, silent = false): void {
    const newTouched = { ...this.formState.touched, [fieldName]: touched }
    this.updateState({ touched: newTouched }, silent)
  }

  /**
   * 设置字段为已修改
   * 
   * @param fieldName 字段名称
   * @param dirty 是否已修改
   * @param silent 是否静默更新
   */
  setFieldDirty(fieldName: string, dirty = true, silent = false): void {
    const newDirty = { ...this.formState.dirty, [fieldName]: dirty }
    this.updateState({ dirty: newDirty }, silent)
  }

  /**
   * 设置提交状态
   * 
   * @param submitting 是否正在提交
   * @param silent 是否静默更新
   */
  setSubmitting(submitting: boolean, silent = false): void {
    this.updateState({ submitting }, silent)
  }

  /**
   * 设置验证状态
   * 
   * @param validating 是否正在验证
   * @param silent 是否静默更新
   */
  setValidating(validating: boolean, silent = false): void {
    this.updateState({ validating }, silent)
  }

  /**
   * 获取字段状态
   * 
   * @param fieldName 字段名称
   * @returns 字段状态
   */
  getFieldState(fieldName: string): FieldState | undefined {
    this.checkDestroyed()
    const state = this.fieldStates.get(fieldName)
    return state ? deepClone(state) : undefined
  }

  /**
   * 更新字段状态
   * 
   * @param fieldName 字段名称
   * @param updates 状态更新
   * @param silent 是否静默更新
   */
  updateFieldState(fieldName: string, updates: Partial<FieldState>, silent = false): void {
    this.checkDestroyed()

    let currentState = this.fieldStates.get(fieldName)
    if (!currentState) {
      // 创建默认字段状态
      currentState = {
        value: undefined,
        error: undefined,
        errors: [],
        touched: false,
        dirty: false,
        validating: false,
        valid: true
      }
    }

    const oldState = deepClone(currentState)
    const newState = { ...currentState, ...updates }

    // 检查状态是否真的发生了变化
    if (deepEqual(currentState, newState)) {
      return
    }

    this.fieldStates.set(fieldName, newState)

    if (!silent) {
      this.emit('field:state:change', {
        type: 'field',
        state: deepClone(newState),
        oldState,
        fieldName
      } as StateChangeEvent)
    }
  }

  /**
   * 删除字段状态
   * 
   * @param fieldName 字段名称
   */
  deleteFieldState(fieldName: string): void {
    this.checkDestroyed()
    this.fieldStates.delete(fieldName)
  }

  /**
   * 重置表单状态
   * 
   * @param silent 是否静默更新
   */
  reset(silent = false): void {
    this.checkDestroyed()

    const oldState = deepClone(this.formState)
    this.formState = deepClone(this.initialFormState)
    this.fieldStates.clear()

    if (!silent) {
      this.emit('state:change', {
        type: 'form',
        state: deepClone(this.formState),
        oldState
      } as StateChangeEvent<T>)
    }
  }

  /**
   * 检查表单是否有效
   * 
   * @returns 是否有效
   */
  isValid(): boolean {
    return this.formState.valid && Object.keys(this.formState.errors).length === 0
  }

  /**
   * 检查表单是否已修改
   * 
   * @returns 是否已修改
   */
  isDirty(): boolean {
    return Object.values(this.formState.dirty).some(dirty => dirty)
  }

  /**
   * 检查表单是否已触摸
   * 
   * @returns 是否已触摸
   */
  isTouched(): boolean {
    return Object.values(this.formState.touched).some(touched => touched)
  }

  /**
   * 获取所有字段状态
   * 
   * @returns 字段状态映射
   */
  getAllFieldStates(): Record<string, FieldState> {
    this.checkDestroyed()
    const result: Record<string, FieldState> = {}

    for (const [fieldName, state] of this.fieldStates) {
      result[fieldName] = deepClone(state)
    }

    return result
  }

  /**
   * 销毁状态管理器
   */
  destroy(): void {
    if (this.destroyed) return

    this.destroyed = true
    this.fieldStates.clear()

    // 直接清理监听器映射，避免调用checkDestroyed
    this.listeners.clear()
  }

  /**
   * 检查是否已销毁
   */
  private checkDestroyed(): void {
    if (this.destroyed) {
      throw new Error('StateManager has been destroyed')
    }
  }
}
