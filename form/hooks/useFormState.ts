/**
 * 表单状态管理 Hook
 * 提供高性能的表单数据管理和更新机制
 */

import { ref, computed, shallowRef, triggerRef, nextTick, watch } from 'vue'
import type { Ref, ComputedRef } from 'vue'
import type { LDesignFormOption } from '../type'

export interface FormStateOptions {
  defaultValue?: Record<string, any>
  options: Ref<LDesignFormOption[]> | ComputedRef<LDesignFormOption[]>
  immediate?: boolean
}

export interface FormStateReturn {
  formData: Ref<Record<string, any>>
  errors: Ref<Record<string, string>>
  touched: Ref<Record<string, boolean>>
  isDirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  updateField: (name: string, value: any) => void
  updateFields: (fields: Record<string, any>) => void
  setError: (name: string, error: string) => void
  clearError: (name: string) => void
  clearAllErrors: () => void
  setTouched: (name: string, touched?: boolean) => void
  resetForm: (newValue?: Record<string, any>) => void
  getFieldValue: (name: string) => any
  setFieldValue: (name: string, value: any) => void
}

/**
 * 表单状态管理 Hook
 */
export function useFormState(options: FormStateOptions): FormStateReturn {
  const { defaultValue = {}, options: formOptions, immediate = true } = options

  // 使用 shallowRef 优化性能，避免深度响应式
  const formData = shallowRef<Record<string, any>>({})
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})

  // 初始化表单数据
  const initializeFormData = () => {
    const initialData: Record<string, any> = { ...defaultValue }
    
    // 从 options 中获取默认值
    const currentOptions = Array.isArray(formOptions.value) ? formOptions.value : formOptions
    currentOptions.forEach((option: LDesignFormOption) => {
      if (option.name && !(option.name in initialData)) {
        initialData[option.name] = getInitialValue(option)
      }
    })
    
    formData.value = initialData
    triggerRef(formData)
  }

  // 获取字段初始值
  const getInitialValue = (option: LDesignFormOption): any => {
    if (option.defaultValue !== undefined) {
      return option.defaultValue
    }
    
    switch (option.component) {
      case 'checkbox':
        return option.props?.multiple ? [] : false
      case 'select':
        return option.props?.multiple ? [] : undefined
      case 'switch':
        return false
      case 'slider':
        return option.props?.range ? [0, 100] : 0
      case 'upload':
        return []
      default:
        return undefined
    }
  }

  // 计算属性
  const isDirty = computed(() => {
    return Object.keys(touched.value).some(key => touched.value[key])
  })

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  // 更新单个字段
  const updateField = (name: string, value: any) => {
    const newData = { ...formData.value }
    newData[name] = value
    formData.value = newData
    triggerRef(formData)
    
    // 标记为已触摸
    setTouched(name, true)
    
    // 清除该字段的错误
    if (errors.value[name]) {
      clearError(name)
    }
  }

  // 批量更新字段
  const updateFields = (fields: Record<string, any>) => {
    const newData = { ...formData.value, ...fields }
    formData.value = newData
    triggerRef(formData)
    
    // 批量标记为已触摸
    Object.keys(fields).forEach(name => {
      setTouched(name, true)
    })
  }

  // 设置错误
  const setError = (name: string, error: string) => {
    errors.value = {
      ...errors.value,
      [name]: error
    }
  }

  // 清除错误
  const clearError = (name: string) => {
    const newErrors = { ...errors.value }
    delete newErrors[name]
    errors.value = newErrors
  }

  // 清除所有错误
  const clearAllErrors = () => {
    errors.value = {}
  }

  // 设置触摸状态
  const setTouched = (name: string, touchedValue = true) => {
    touched.value = {
      ...touched.value,
      [name]: touchedValue
    }
  }

  // 重置表单
  const resetForm = (newValue?: Record<string, any>) => {
    const resetData = newValue || defaultValue
    formData.value = { ...resetData }
    triggerRef(formData)
    
    // 清除错误和触摸状态
    errors.value = {}
    touched.value = {}
    
    // 重新初始化默认值
    if (!newValue) {
      nextTick(() => {
        initializeFormData()
      })
    }
  }

  // 获取字段值
  const getFieldValue = (name: string): any => {
    return formData.value[name]
  }

  // 设置字段值
  const setFieldValue = (name: string, value: any) => {
    updateField(name, value)
  }

  // 监听 options 变化，重新初始化
  watch(
    () => formOptions.value,
    () => {
      initializeFormData()
    },
    { deep: true, immediate }
  )

  // 初始化
  if (immediate) {
    initializeFormData()
  }

  return {
    formData,
    errors,
    touched,
    isDirty,
    isValid,
    updateField,
    updateFields,
    setError,
    clearError,
    clearAllErrors,
    setTouched,
    resetForm,
    getFieldValue,
    setFieldValue
  }
}

/**
 * 表单字段状态管理 Hook
 * 用于单个字段的状态管理
 */
export function useFieldState(name: string, formState: FormStateReturn) {
  const value = computed({
    get: () => formState.getFieldValue(name),
    set: (newValue) => formState.setFieldValue(name, newValue)
  })

  const error = computed(() => formState.errors.value[name])
  const touched = computed(() => formState.touched.value[name])
  const hasError = computed(() => !!error.value)

  const updateValue = (newValue: any) => {
    formState.updateField(name, newValue)
  }

  const clearError = () => {
    formState.clearError(name)
  }

  const setTouched = (touchedValue = true) => {
    formState.setTouched(name, touchedValue)
  }

  return {
    value,
    error,
    touched,
    hasError,
    updateValue,
    clearError,
    setTouched
  }
}