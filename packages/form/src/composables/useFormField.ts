// useFormField Composition API Hook

import type { FormStateManager } from '../core/FormStateManager'
import type { ValidationEngine } from '../core/ValidationEngine'
import type { FormItemConfig } from '../types/field'
import type { ValidationResult } from '../types/validation'
import { inject, ref, type Ref, watch } from 'vue'

/**
 * useFormField Hook 选项
 */
export interface UseFormFieldOptions {
  /** 字段配置 */
  field: FormItemConfig

  /** 初始值 */
  initialValue?: any

  /** 是否自动验证 */
  autoValidate?: boolean

  /** 验证延迟时间 */
  validateDelay?: number
}

/**
 * useFormField Hook 返回值
 */
export interface UseFormFieldReturn {
  /** 字段值 */
  value: Ref<any>

  /** 字段状态 */
  fieldState: {
    dirty: Ref<boolean>
    touched: Ref<boolean>
    valid: Ref<boolean>
    errors: Ref<string[]>
    validating: Ref<boolean>
    visible: Ref<boolean>
    disabled: Ref<boolean>
    readonly: Ref<boolean>
  }

  /** 设置字段值 */
  setValue: (value: any) => void

  /** 验证字段 */
  validate: () => Promise<boolean>

  /** 重置字段 */
  reset: () => void

  /** 清空验证错误 */
  clearValidation: () => void

  /** 标记字段为已访问 */
  touch: () => void

  /** 设置字段可见性 */
  setVisible: (visible: boolean) => void

  /** 设置字段禁用状态 */
  setDisabled: (disabled: boolean) => void

  /** 设置字段只读状态 */
  setReadonly: (readonly: boolean) => void
}

/**
 * useFormField Hook
 */
export function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
  const {
    field,
    initialValue,
    autoValidate = false,
    validateDelay = 300,
  } = options

  // 尝试注入表单上下文
  const stateManager = inject<FormStateManager>('formStateManager', null)
  const validationEngine = inject<ValidationEngine>('validationEngine', null)

  // 响应式状态
  const value = ref(initialValue ?? field.defaultValue)
  const dirty = ref(false)
  const touched = ref(false)
  const valid = ref(true)
  const errors = ref<string[]>([])
  const validating = ref(false)
  const visible = ref(!field.hidden)
  const disabled = ref(field.disabled || false)
  const readonly = ref(field.readonly || false)

  // 字段状态对象
  const fieldState = {
    dirty,
    touched,
    valid,
    errors,
    validating,
    visible,
    disabled,
    readonly,
  }

  // 设置字段值
  const setValue = (newValue: any) => {
    const oldValue = value.value
    value.value = newValue

    if (oldValue !== newValue) {
      dirty.value = true
      touched.value = true

      // 同步到表单状态管理器
      if (stateManager) {
        stateManager.setFieldValue(field.name, newValue)
      }

      // 自动验证
      if (autoValidate) {
        setTimeout(validate, validateDelay)
      }
    }
  }

  // 验证字段
  const validate = async (): Promise<boolean> => {
    if (!field.rules || field.rules.length === 0) {
      return true
    }

    validating.value = true

    try {
      let result: ValidationResult

      if (validationEngine) {
        // 使用注入的验证引擎
        const formData = stateManager?.getFormData() || {}
        result = await validationEngine.validateField(
          value.value,
          field.rules,
          formData,
          field.name,
        )
      }
      else {
        // 本地验证
        const { validateField } = await import('../utils/validation')
        result = await validateField(value.value, field.rules, {}, field.name)
      }

      valid.value = result.valid
      errors.value = result.errors

      // 同步到表单状态管理器
      if (stateManager) {
        stateManager.setFieldErrors(field.name, result.errors)
      }

      return result.valid
    }
    catch (error) {
      valid.value = false
      errors.value = [`验证过程中发生错误: ${error.message}`]
      return false
    }
    finally {
      validating.value = false
    }
  }

  // 重置字段
  const reset = () => {
    value.value = initialValue ?? field.defaultValue
    dirty.value = false
    touched.value = false
    valid.value = true
    errors.value = []
    validating.value = false

    // 同步到表单状态管理器
    if (stateManager) {
      stateManager.resetField(field.name)
    }
  }

  // 清空验证错误
  const clearValidation = () => {
    valid.value = true
    errors.value = []

    // 同步到表单状态管理器
    if (stateManager) {
      stateManager.clearFieldErrors(field.name)
    }
  }

  // 标记字段为已访问
  const touch = () => {
    touched.value = true

    // 同步到表单状态管理器
    if (stateManager) {
      stateManager.touchField(field.name)
    }
  }

  // 设置字段可见性
  const setVisible = (isVisible: boolean) => {
    visible.value = isVisible

    // 同步到表单状态管理器
    if (stateManager) {
      stateManager.setFieldVisible(field.name, isVisible)
    }
  }

  // 设置字段禁用状态
  const setDisabled = (isDisabled: boolean) => {
    disabled.value = isDisabled

    // 同步到表单状态管理器
    if (stateManager) {
      stateManager.setFieldDisabled(field.name, isDisabled)
    }
  }

  // 设置字段只读状态
  const setReadonly = (isReadonly: boolean) => {
    readonly.value = isReadonly

    // 同步到表单状态管理器
    if (stateManager) {
      stateManager.setFieldReadonly(field.name, isReadonly)
    }
  }

  // 监听值变化
  watch(value, (newValue, oldValue) => {
    if (newValue !== oldValue && touched.value) {
      if (autoValidate) {
        setTimeout(validate, validateDelay)
      }
    }
  })

  // 如果有表单状态管理器，同步初始状态
  if (stateManager) {
    const existingValue = stateManager.getFieldValue(field.name)
    if (existingValue !== undefined) {
      value.value = existingValue
    }
    else {
      stateManager.setFieldValue(field.name, value.value)
    }

    // 监听表单状态管理器的变化
    stateManager.on('fieldChange', (fieldName: string, fieldValue: any) => {
      if (fieldName === field.name && fieldValue !== value.value) {
        value.value = fieldValue
      }
    })

    stateManager.on('fieldStateChange', (fieldName: string, state: any) => {
      if (fieldName === field.name) {
        if (state.dirty !== undefined)
          dirty.value = state.dirty
        if (state.touched !== undefined)
          touched.value = state.touched
        if (state.valid !== undefined)
          valid.value = state.valid
        if (state.errors !== undefined)
          errors.value = state.errors
        if (state.visible !== undefined)
          visible.value = state.visible
        if (state.disabled !== undefined)
          disabled.value = state.disabled
        if (state.readonly !== undefined)
          readonly.value = state.readonly
      }
    })
  }

  return {
    value,
    fieldState,
    setValue,
    validate,
    reset,
    clearValidation,
    touch,
    setVisible,
    setDisabled,
    setReadonly,
  }
}
