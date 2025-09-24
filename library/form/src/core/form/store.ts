/**
 * 表单状态管理
 * 
 * 提供表单状态的创建、管理和操作功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { reactive, ref, computed, watch, type Ref, type ComputedRef } from 'vue'
import type { FormState, FormConfig, FormActions, ValidationSchema } from '../../types'
import { deepClone, deepMerge, getValue, setValue, deleteValue, isEmpty } from '../../utils'

/**
 * 表单状态存储选项
 */
export interface FormStoreOptions<T = Record<string, any>> extends FormConfig<T> {
  /** 表单ID，用于标识表单实例 */
  id?: string
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 表单状态存储接口
 */
export interface FormStore<T = Record<string, any>> extends FormActions<T> {
  /** 表单状态 */
  state: Ref<FormState<T>>
  /** 表单值 */
  values: ComputedRef<T>
  /** 表单错误 */
  errors: ComputedRef<Record<string, string[]>>
  /** 表单是否有效 */
  valid: ComputedRef<boolean>
  /** 表单是否正在提交 */
  submitting: ComputedRef<boolean>
  /** 表单是否正在验证 */
  validating: ComputedRef<boolean>
  /** 表单是否为脏数据 */
  dirty: ComputedRef<boolean>
  /** 表单配置 */
  config: Ref<FormConfig<T>>
  /** 销毁表单存储 */
  destroy: () => void
}

/**
 * 创建表单状态存储
 * 
 * @param options 配置选项
 * @returns 表单状态存储实例
 */
export function createFormStore<T = Record<string, any>>(
  options: FormStoreOptions<T> = {}
): FormStore<T> {
  const {
    id = `form_${Date.now()}`,
    initialValues = {} as T,
    validationSchema = {},
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true,
    validateOnMount = false,
    debug = false,
  } = options

  // 表单状态
  const state = ref<FormState<T>>({
    values: deepClone(initialValues),
    errors: {},
    touched: {},
    dirty: {},
    submitting: false,
    validating: false,
    valid: true,
  })

  // 表单配置
  const config = ref<FormConfig<T>>({
    initialValues,
    validationSchema,
    validateOnChange,
    validateOnBlur,
    validateOnSubmit,
    validateOnMount,
  })

  // 计算属性
  const values = computed(() => state.value.values)
  const errors = computed(() => state.value.errors)
  const valid = computed(() => Object.keys(state.value.errors).length === 0)
  const submitting = computed(() => state.value.submitting)
  const validating = computed(() => state.value.validating)
  const dirty = computed(() => Object.keys(state.value.dirty).some(key => state.value.dirty[key]))

  // 调试日志
  function debugLog(message: string, data?: any) {
    if (debug) {
      console.log(`[FormStore:${id}] ${message}`, data)
    }
  }

  // 设置字段值
  function setFieldValue(name: string, value: any): void {
    debugLog(`Setting field value: ${name}`, value)
    
    const oldValue = getValue(state.value.values, name)
    setValue(state.value.values, name, value)
    
    // 标记为脏数据
    if (oldValue !== value) {
      state.value.dirty[name] = true
    }
    
    // 清除字段错误
    if (state.value.errors[name]) {
      delete state.value.errors[name]
    }
    
    debugLog('Field value set', { name, value, dirty: state.value.dirty[name] })
  }

  // 设置多个字段值
  function setFieldsValue(values: Partial<T>): void {
    debugLog('Setting fields value', values)
    
    Object.keys(values).forEach(name => {
      const value = (values as any)[name]
      setFieldValue(name, value)
    })
  }

  // 获取字段值
  function getFieldValue(name: string): any {
    return getValue(state.value.values, name)
  }

  // 获取所有字段值
  function getFieldsValue(): T {
    return deepClone(state.value.values)
  }

  // 设置字段错误
  function setFieldError(name: string, error: string): void {
    debugLog(`Setting field error: ${name}`, error)
    
    if (!state.value.errors[name]) {
      state.value.errors[name] = []
    }
    
    if (!state.value.errors[name].includes(error)) {
      state.value.errors[name].push(error)
    }
  }

  // 设置多个字段错误
  function setFieldsError(errors: Record<string, string>): void {
    debugLog('Setting fields error', errors)
    
    Object.keys(errors).forEach(name => {
      setFieldError(name, errors[name])
    })
  }

  // 清除字段错误
  function clearFieldError(name: string): void {
    debugLog(`Clearing field error: ${name}`)
    
    if (state.value.errors[name]) {
      delete state.value.errors[name]
    }
  }

  // 清除所有错误
  function clearErrors(): void {
    debugLog('Clearing all errors')
    state.value.errors = {}
  }

  // 验证指定字段（占位符实现）
  async function validateField(name: string): Promise<boolean> {
    debugLog(`Validating field: ${name}`)
    
    // TODO: 实现字段验证逻辑
    // 这里需要集成验证引擎
    
    return true
  }

  // 验证多个字段（占位符实现）
  async function validateFields(names?: string[]): Promise<boolean> {
    debugLog('Validating fields', names)
    
    // TODO: 实现多字段验证逻辑
    
    return true
  }

  // 验证整个表单（占位符实现）
  async function validateForm(): Promise<boolean> {
    debugLog('Validating form')
    
    state.value.validating = true
    
    try {
      // TODO: 实现表单验证逻辑
      
      return true
    } finally {
      state.value.validating = false
    }
  }

  // 重置指定字段
  function resetField(name: string): void {
    debugLog(`Resetting field: ${name}`)
    
    const initialValue = getValue(config.value.initialValues, name)
    setValue(state.value.values, name, initialValue)
    
    // 清除状态
    delete state.value.errors[name]
    delete state.value.touched[name]
    delete state.value.dirty[name]
  }

  // 重置多个字段
  function resetFields(names?: string[]): void {
    debugLog('Resetting fields', names)
    
    if (names) {
      names.forEach(name => resetField(name))
    } else {
      // 重置所有字段
      const allNames = Object.keys(state.value.values)
      allNames.forEach(name => resetField(name))
    }
  }

  // 重置整个表单
  function resetForm(): void {
    debugLog('Resetting form')
    
    state.value.values = deepClone(config.value.initialValues || {} as T)
    state.value.errors = {}
    state.value.touched = {}
    state.value.dirty = {}
    state.value.submitting = false
    state.value.validating = false
  }

  // 提交表单（占位符实现）
  async function submitForm(): Promise<void> {
    debugLog('Submitting form')
    
    state.value.submitting = true
    
    try {
      // 先验证表单
      const isValid = await validateForm()
      
      if (!isValid) {
        throw new Error('Form validation failed')
      }
      
      // TODO: 触发提交事件
      
    } finally {
      state.value.submitting = false
    }
  }

  // 标记字段为已触摸
  function touchField(name: string): void {
    debugLog(`Touching field: ${name}`)
    state.value.touched[name] = true
  }

  // 标记多个字段为已触摸
  function touchFields(names: string[]): void {
    debugLog('Touching fields', names)
    names.forEach(name => touchField(name))
  }

  // 销毁表单存储
  function destroy(): void {
    debugLog('Destroying form store')
    
    // 清理状态
    state.value.values = {} as T
    state.value.errors = {}
    state.value.touched = {}
    state.value.dirty = {}
    state.value.submitting = false
    state.value.validating = false
  }

  // 监听配置变化
  watch(
    () => config.value.initialValues,
    (newInitialValues) => {
      if (newInitialValues) {
        debugLog('Initial values changed', newInitialValues)
        // 如果表单还没有被修改，更新表单值
        if (!dirty.value) {
          state.value.values = deepClone(newInitialValues)
        }
      }
    },
    { deep: true }
  )

  debugLog('Form store created', { id, config: config.value })

  return {
    state,
    values,
    errors,
    valid,
    submitting,
    validating,
    dirty,
    config,
    setFieldValue,
    setFieldsValue,
    getFieldValue,
    getFieldsValue,
    setFieldError,
    setFieldsError,
    clearFieldError,
    clearErrors,
    validateField,
    validateFields,
    validateForm,
    resetField,
    resetFields,
    resetForm,
    submitForm,
    touchField,
    touchFields,
    destroy,
  }
}
