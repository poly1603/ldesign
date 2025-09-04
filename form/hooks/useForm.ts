/**
 * 主表单 Hook
 * 整合状态管理、验证、布局、性能优化等功能
 */

import { ref, computed, watch, provide, inject, onMounted, onUnmounted } from 'vue'
import type { Ref, ComputedRef, InjectionKey } from 'vue'
import { useFormState, type FormStateReturn, type FormStateOptions } from './useFormState'
import { useFormValidation, type FormValidationReturn, type FormValidationOptions, type ValidationRules } from './useFormValidation'
import { useFormLayout, type FormLayoutReturn, type FormLayoutConfig } from './useFormLayout'
import { useFormPerformance, type FormPerformanceReturn, type PerformanceConfig } from './useFormPerformance'
import type { LDesignFormOption } from '../types'

export interface FormOptions {
  // 表单配置
  options: Ref<LDesignFormOption[]>
  
  // 初始数据
  initialData?: Record<string, any>
  
  // 验证规则
  rules?: Ref<ValidationRules> | ComputedRef<ValidationRules>
  
  // 布局配置
  layout?: Ref<FormLayoutConfig>
  
  // 性能配置
  performance?: Ref<PerformanceConfig>
  
  // 其他配置
  validateOnChange?: boolean
  validateOnBlur?: boolean
  resetOnSubmit?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
}

export interface FormReturn extends FormStateReturn, FormValidationReturn, FormLayoutReturn, FormPerformanceReturn {
  // 表单实例方法
  submit: () => Promise<{ valid: boolean; data: Record<string, any>; errors: Record<string, string> }>
  reset: () => void
  resetFields: (fields?: string[]) => void
  
  // 字段操作
  getField: (name: string) => LDesignFormOption | undefined
  setFieldValue: (name: string, value: any) => void
  setFieldVisible: (name: string, visible: boolean) => void
  setFieldDisabled: (name: string, disabled: boolean) => void
  
  // 表单状态
  isSubmitting: Ref<boolean>
  isDirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  
  // 自动保存
  enableAutoSave: () => void
  disableAutoSave: () => void
  saveNow: () => Promise<void>
  
  // 事件处理
  onFieldChange: (name: string, value: any) => void
  onFieldBlur: (name: string) => void
  onFieldFocus: (name: string) => void
}

// 表单上下文
export const FormContextKey: InjectionKey<FormReturn> = Symbol('FormContext')

/**
 * 主表单 Hook
 */
export function useForm(options: FormOptions): FormReturn {
  const {
    options: formOptions,
    initialData = {},
    rules,
    layout,
    performance,
    validateOnChange = true,
    validateOnBlur = true,
    resetOnSubmit = false,
    autoSave = false,
    autoSaveDelay = 2000
  } = options

  // 状态管理
  const formStateOptions: FormStateOptions = {
    options: formOptions,
    initialData
  }
  const formState = useFormState(formStateOptions)

  // 验证管理
  const validationOptions: FormValidationOptions = {
    rules: rules || ref({}),
    formState,
    validateOnChange,
    validateOnBlur
  }
  const formValidation = useFormValidation(validationOptions)

  // 布局管理
  const formLayout = useFormLayout(
    layout || ref({}),
    computed(() => performance?.value?.rendering?.virtualScroll ? {
      enabled: true,
      itemHeight: 60,
      threshold: 100
    } : { enabled: false, itemHeight: 60 }),
    formOptions
  )

  // 性能优化
  const formPerformance = useFormPerformance(
    performance || ref({
      debounce: { enabled: true, delay: 300 },
      throttle: { enabled: true, delay: 100 },
      rendering: { batchUpdate: true, lazyValidation: true, memoization: true },
      data: { shallowWatch: true }
    })
  )

  // 表单状态
  const isSubmitting = ref(false)
  const autoSaveTimer = ref<NodeJS.Timeout>()
  const autoSaveEnabled = ref(autoSave)

  // 计算属性
  const isDirty = computed(() => {
    return Object.keys(formState.formData.value).some(key => {
      return formState.formData.value[key] !== initialData[key]
    })
  })

  const isValid = computed(() => {
    return !formValidation.hasError()
  })

  // 获取字段配置
  const getField = (name: string): LDesignFormOption | undefined => {
    return formOptions.value.find(option => option.name === name)
  }

  // 设置字段值
  const setFieldValue = (name: string, value: any) => {
    formState.setFieldValue(name, value)
    
    // 触发验证
    if (validateOnChange) {
      formPerformance.debounce(() => {
        formValidation.validateField(name, 'change')
      })()
    }
    
    // 触发自动保存
    if (autoSaveEnabled.value) {
      scheduleAutoSave()
    }
  }

  // 设置字段可见性
  const setFieldVisible = (name: string, visible: boolean) => {
    const field = getField(name)
    if (field) {
      field.hidden = !visible
    }
  }

  // 设置字段禁用状态
  const setFieldDisabled = (name: string, disabled: boolean) => {
    const field = getField(name)
    if (field) {
      field.disabled = disabled
    }
  }

  // 字段变化处理
  const onFieldChange = (name: string, value: any) => {
    setFieldValue(name, value)
    
    // 更新性能指标
    formPerformance.metrics.value.updateCount++
    formPerformance.metrics.value.lastUpdateTime = Date.now()
  }

  // 字段失焦处理
  const onFieldBlur = (name: string) => {
    formState.setFieldTouched(name, true)
    
    if (validateOnBlur) {
      formValidation.validateField(name, 'blur')
    }
  }

  // 字段聚焦处理
  const onFieldFocus = (name: string) => {
    // 可以在这里添加聚焦相关的逻辑
  }

  // 表单提交
  const submit = async (): Promise<{ valid: boolean; data: Record<string, any>; errors: Record<string, string> }> => {
    if (isSubmitting.value) {
      return { valid: false, data: {}, errors: { _form: '表单正在提交中' } }
    }

    isSubmitting.value = true

    try {
      // 验证所有字段
      const validationResult = await formValidation.validateAll('submit')
      
      const result = {
        valid: validationResult.valid,
        data: { ...formState.formData.value },
        errors: validationResult.errors
      }

      if (validationResult.valid && resetOnSubmit) {
        reset()
      }

      return result
    } finally {
      isSubmitting.value = false
    }
  }

  // 重置表单
  const reset = () => {
    formState.resetForm()
    formValidation.clearValidation()
    
    // 重置性能指标
    formPerformance.resetMetrics()
  }

  // 重置指定字段
  const resetFields = (fields?: string[]) => {
    if (fields) {
      fields.forEach(field => {
        formState.resetField(field)
        formValidation.clearValidation(field)
      })
    } else {
      reset()
    }
  }

  // 自动保存相关
  const scheduleAutoSave = () => {
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
    
    autoSaveTimer.value = setTimeout(() => {
      saveNow()
    }, autoSaveDelay)
  }

  const saveNow = async () => {
    if (!isDirty.value) return
    
    try {
      // 这里可以调用保存API
      console.log('Auto saving form data:', formState.formData.value)
      
      // 可以触发自定义事件
      // emit('auto-save', formState.formData.value)
    } catch (error) {
      console.error('Auto save failed:', error)
    }
  }

  const enableAutoSave = () => {
    autoSaveEnabled.value = true
  }

  const disableAutoSave = () => {
    autoSaveEnabled.value = false
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
  }

  // 监听表单数据变化
  watch(
    () => formState.formData.value,
    () => {
      if (autoSaveEnabled.value && isDirty.value) {
        scheduleAutoSave()
      }
    },
    { deep: true }
  )

  // 生命周期
  onMounted(() => {
    // 启动性能监控
    formPerformance.startPerformanceMonitor()
    
    // 初始化布局
    formLayout.updateLayout()
  })

  onUnmounted(() => {
    // 停止性能监控
    formPerformance.stopPerformanceMonitor()
    
    // 清理自动保存定时器
    if (autoSaveTimer.value) {
      clearTimeout(autoSaveTimer.value)
    }
  })

  // 合并所有返回值
  const formReturn: FormReturn = {
    // 状态管理
    ...formState,
    
    // 验证管理
    ...formValidation,
    
    // 布局管理
    ...formLayout,
    
    // 性能优化
    ...formPerformance,
    
    // 表单实例方法
    submit,
    reset,
    resetFields,
    
    // 字段操作
    getField,
    setFieldValue,
    setFieldVisible,
    setFieldDisabled,
    
    // 表单状态
    isSubmitting,
    isDirty,
    isValid,
    
    // 自动保存
    enableAutoSave,
    disableAutoSave,
    saveNow,
    
    // 事件处理
    onFieldChange,
    onFieldBlur,
    onFieldFocus
  }

  return formReturn
}

/**
 * 提供表单上下文
 */
export function provideFormContext(formReturn: FormReturn) {
  provide(FormContextKey, formReturn)
}

/**
 * 注入表单上下文
 */
export function useFormContext(): FormReturn {
  const formContext = inject(FormContextKey)
  if (!formContext) {
    throw new Error('useFormContext must be used within a form provider')
  }
  return formContext
}

/**
 * 表单字段 Hook
 * 用于单个字段组件
 */
export function useFormField(name: string) {
  const formContext = useFormContext()
  
  const fieldConfig = computed(() => formContext.getField(name))
  const fieldValue = computed({
    get: () => formContext.getFieldValue(name),
    set: (value) => formContext.setFieldValue(name, value)
  })
  const fieldError = computed(() => formContext.getFieldError(name))
  const fieldTouched = computed(() => formContext.isFieldTouched(name))
  const fieldValidating = computed(() => formContext.isValidating(name))
  
  const handleChange = (value: any) => {
    formContext.onFieldChange(name, value)
  }
  
  const handleBlur = () => {
    formContext.onFieldBlur(name)
  }
  
  const handleFocus = () => {
    formContext.onFieldFocus(name)
  }
  
  return {
    fieldConfig,
    fieldValue,
    fieldError,
    fieldTouched,
    fieldValidating,
    handleChange,
    handleBlur,
    handleFocus
  }
}