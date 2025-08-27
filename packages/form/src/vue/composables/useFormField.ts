/**
 * 表单字段组合式函数
 * 
 * 提供字段相关的响应式状态和方法
 */

import { ref, computed, inject, watch, onUnmounted } from 'vue'
import type { FormFieldConfig, AnyObject } from '../../types'

/**
 * 字段Hook选项
 */
export interface UseFormFieldOptions {
  // 字段配置
  config: FormFieldConfig
  // 初始值
  initialValue?: any
  // 验证配置
  validateOnChange?: boolean
  validateOnBlur?: boolean
  validateDebounce?: number
  // 格式化
  formatter?: (value: any) => any
  parser?: (value: any) => any
}

/**
 * 字段Hook返回值
 */
export interface UseFormFieldReturn {
  // 字段值
  value: any
  // 字段状态
  isDirty: any
  isTouched: any
  isFocused: any
  isVisible: any
  isDisabled: any
  isRequired: any
  hasError: any
  hasWarning: any
  // 错误和警告
  errors: any
  warnings: any
  // 方法
  setValue: (value: any) => void
  setTouched: (touched: boolean) => void
  setFocused: (focused: boolean) => void
  validate: () => Promise<boolean>
  reset: () => void
  // 事件处理
  handleChange: (value: any) => void
  handleFocus: (event: Event) => void
  handleBlur: (event: Event) => void
}

/**
 * 使用表单字段Hook
 */
export function useFormField(options: UseFormFieldOptions): UseFormFieldReturn {
  const {
    config,
    initialValue,
    validateOnChange = true,
    validateOnBlur = true,
    validateDebounce = 300,
    formatter,
    parser
  } = options
  
  // 注入表单实例
  const formInstance = inject('formInstance', ref(null))
  const formData = inject('formData', ref({}))
  
  // 响应式状态
  const value = ref(initialValue)
  const isDirty = ref(false)
  const isTouched = ref(false)
  const isFocused = ref(false)
  const isVisible = ref(true)
  const isDisabled = ref(false)
  const isRequired = ref(false)
  const errors = ref<string[]>([])
  const warnings = ref<string[]>([])
  
  // 计算属性
  const hasError = computed(() => errors.value.length > 0)
  const hasWarning = computed(() => warnings.value.length > 0)
  
  // 获取字段状态
  const updateFieldState = () => {
    if (!formInstance.value || !config.name) return
    
    const fieldState = formInstance.value.stateManager.getFieldState(config.name)
    if (fieldState) {
      value.value = fieldState.value
      isDirty.value = fieldState.isDirty
      isTouched.value = fieldState.isTouched
      isFocused.value = fieldState.isFocused
      isVisible.value = fieldState.isVisible
      isDisabled.value = fieldState.isDisabled
      isRequired.value = fieldState.isRequired
      errors.value = fieldState.errors || []
      warnings.value = fieldState.warnings || []
    }
  }
  
  // 设置字段值
  const setValue = (newValue: any) => {
    let processedValue = newValue
    
    // 应用解析器
    if (parser) {
      processedValue = parser(processedValue)
    }
    
    value.value = processedValue
    
    if (formInstance.value && config.name) {
      formInstance.value.stateManager.setValue(config.name, processedValue)
    }
  }
  
  // 设置触摸状态
  const setTouched = (touched: boolean) => {
    isTouched.value = touched
    
    if (formInstance.value && config.name) {
      formInstance.value.stateManager.setFieldState(config.name, { isTouched: touched })
    }
  }
  
  // 设置焦点状态
  const setFocused = (focused: boolean) => {
    isFocused.value = focused
    
    if (formInstance.value && config.name) {
      formInstance.value.stateManager.setFieldState(config.name, { isFocused: focused })
    }
  }
  
  // 验证字段
  const validate = async (): Promise<boolean> => {
    if (!formInstance.value || !config.name || !config.rules) {
      return true
    }
    
    try {
      const result = await formInstance.value.validationEngine.validateField(
        config.name,
        value.value,
        config.rules,
        formData.value
      )
      
      if (result.valid) {
        errors.value = []
      } else {
        errors.value = result.message ? [result.message] : []
      }
      
      return result.valid
    } catch (error) {
      console.error('字段验证失败:', error)
      errors.value = ['验证失败']
      return false
    }
  }
  
  // 重置字段
  const reset = () => {
    setValue(initialValue)
    setTouched(false)
    setFocused(false)
    errors.value = []
    warnings.value = []
  }
  
  // 处理值变化
  const handleChange = (newValue: any) => {
    setValue(newValue)
    
    // 自动验证
    if (validateOnChange) {
      debounceValidate()
    }
    
    // 执行字段的onChange回调
    if (config.onChange) {
      config.onChange(newValue, formData.value, value.value)
    }
  }
  
  // 处理焦点事件
  const handleFocus = (event: Event) => {
    setFocused(true)
    
    // 执行字段的onFocus回调
    if (config.onFocus) {
      config.onFocus(event, formData.value)
    }
  }
  
  // 处理失焦事件
  const handleBlur = (event: Event) => {
    setFocused(false)
    setTouched(true)
    
    // 自动验证
    if (validateOnBlur) {
      validate()
    }
    
    // 执行字段的onBlur回调
    if (config.onBlur) {
      config.onBlur(event, formData.value)
    }
  }
  
  // 防抖验证
  let validateTimer: NodeJS.Timeout | null = null
  const debounceValidate = () => {
    if (validateTimer) {
      clearTimeout(validateTimer)
    }
    
    validateTimer = setTimeout(() => {
      validate()
    }, validateDebounce)
  }
  
  // 监听表单实例变化
  watch(formInstance, (newInstance) => {
    if (newInstance && config.name) {
      // 监听字段状态更新
      newInstance.eventBus.on('field:updated', (event: any) => {
        if (event.field?.name === config.name) {
          updateFieldState()
        }
      })
      
      // 监听条件渲染更新
      newInstance.eventBus.on('condition:field-update', (event: any) => {
        if (event.field?.name === config.name) {
          updateFieldState()
        }
      })
      
      // 初始化字段状态
      updateFieldState()
    }
  }, { immediate: true })
  
  // 监听值变化，应用格式化
  const formattedValue = computed(() => {
    if (formatter && value.value !== undefined && value.value !== null) {
      return formatter(value.value)
    }
    return value.value
  })
  
  // 清理函数
  onUnmounted(() => {
    if (validateTimer) {
      clearTimeout(validateTimer)
    }
  })
  
  return {
    value: formattedValue,
    isDirty,
    isTouched,
    isFocused,
    isVisible,
    isDisabled,
    isRequired,
    hasError,
    hasWarning,
    errors,
    warnings,
    setValue,
    setTouched,
    setFocused,
    validate,
    reset,
    handleChange,
    handleFocus,
    handleBlur
  }
}
