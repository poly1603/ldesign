/**
 * 表单验证组合式函数
 * 
 * 提供验证相关的响应式状态和方法
 */

import { ref, reactive, computed, inject } from 'vue'
import type { ValidationResult, FormValidationResult, AnyObject } from '../../types'

/**
 * 验证Hook选项
 */
export interface UseFormValidationOptions {
  // 验证配置
  validateOnMount?: boolean
  validateOnChange?: boolean
  validateOnBlur?: boolean
  stopOnFirstError?: boolean
  // 防抖配置
  debounceDelay?: number
  // 自定义验证器
  customValidators?: Record<string, any>
}

/**
 * 验证Hook返回值
 */
export interface UseFormValidationReturn {
  // 验证状态
  isValidating: any
  isValid: any
  hasErrors: any
  hasWarnings: any
  // 错误信息
  errors: any
  warnings: any
  fieldErrors: any
  fieldWarnings: any
  // 验证结果
  validationResult: any
  // 方法
  validate: (fields?: string[]) => Promise<boolean>
  validateField: (field: string) => Promise<boolean>
  clearErrors: (fields?: string[]) => void
  clearWarnings: (fields?: string[]) => void
  setFieldError: (field: string, error: string) => void
  setFieldWarning: (field: string, warning: string) => void
  // 验证器管理
  registerValidator: (name: string, validator: any) => void
  unregisterValidator: (name: string) => void
}

/**
 * 使用表单验证Hook
 */
export function useFormValidation(
  options: UseFormValidationOptions = {}
): UseFormValidationReturn {
  const {
    validateOnMount = false,
    validateOnChange = true,
    validateOnBlur = true,
    stopOnFirstError = false,
    debounceDelay = 300,
    customValidators = {}
  } = options
  
  // 注入表单实例
  const formInstance = inject('formInstance', ref(null))
  const formData = inject('formData', ref({}))
  
  // 响应式状态
  const isValidating = ref(false)
  const validationResult = ref<FormValidationResult | null>(null)
  const fieldErrors = reactive<Record<string, string[]>>({})
  const fieldWarnings = reactive<Record<string, string[]>>({})
  
  // 计算属性
  const isValid = computed(() => {
    return validationResult.value?.valid ?? true
  })
  
  const hasErrors = computed(() => {
    return Object.keys(fieldErrors).length > 0
  })
  
  const hasWarnings = computed(() => {
    return Object.keys(fieldWarnings).length > 0
  })
  
  const errors = computed(() => {
    const allErrors: string[] = []
    Object.values(fieldErrors).forEach(errors => {
      allErrors.push(...errors)
    })
    return allErrors
  })
  
  const warnings = computed(() => {
    const allWarnings: string[] = []
    Object.values(fieldWarnings).forEach(warnings => {
      allWarnings.push(...warnings)
    })
    return allWarnings
  })
  
  // 验证表单
  const validate = async (fields?: string[]): Promise<boolean> => {
    if (!formInstance.value) return false
    
    try {
      isValidating.value = true
      
      const fieldRules = getFieldRules(fields)
      const result = await formInstance.value.validationEngine.validateForm(
        formData.value,
        fieldRules
      )
      
      validationResult.value = result
      updateFieldErrors(result)
      
      return result.valid
    } catch (error) {
      console.error('表单验证失败:', error)
      return false
    } finally {
      isValidating.value = false
    }
  }
  
  // 验证字段
  const validateField = async (field: string): Promise<boolean> => {
    if (!formInstance.value) return false
    
    try {
      const fieldConfig = formInstance.value.stateManager.fieldConfigs.get(field)
      if (!fieldConfig?.rules) return true
      
      const value = formInstance.value.stateManager.getValue(field)
      const result = await formInstance.value.validationEngine.validateField(
        field,
        value,
        fieldConfig.rules,
        formData.value
      )
      
      // 更新字段错误
      if (result.valid) {
        delete fieldErrors[field]
      } else {
        fieldErrors[field] = result.message ? [result.message] : []
      }
      
      return result.valid
    } catch (error) {
      console.error('字段验证失败:', error)
      fieldErrors[field] = ['验证失败']
      return false
    }
  }
  
  // 清除错误
  const clearErrors = (fields?: string[]) => {
    if (fields) {
      fields.forEach(field => {
        delete fieldErrors[field]
      })
    } else {
      Object.keys(fieldErrors).forEach(field => {
        delete fieldErrors[field]
      })
    }
  }
  
  // 清除警告
  const clearWarnings = (fields?: string[]) => {
    if (fields) {
      fields.forEach(field => {
        delete fieldWarnings[field]
      })
    } else {
      Object.keys(fieldWarnings).forEach(field => {
        delete fieldWarnings[field]
      })
    }
  }
  
  // 设置字段错误
  const setFieldError = (field: string, error: string) => {
    fieldErrors[field] = [error]
  }
  
  // 设置字段警告
  const setFieldWarning = (field: string, warning: string) => {
    fieldWarnings[field] = [warning]
  }
  
  // 注册验证器
  const registerValidator = (name: string, validator: any) => {
    if (formInstance.value) {
      formInstance.value.validationEngine.registerValidator({
        name,
        validator,
        description: `自定义验证器: ${name}`
      })
    }
  }
  
  // 注销验证器
  const unregisterValidator = (name: string) => {
    if (formInstance.value) {
      formInstance.value.validationEngine.unregisterValidator(name)
    }
  }
  
  // 更新字段错误
  const updateFieldErrors = (result: FormValidationResult) => {
    // 清空现有错误
    Object.keys(fieldErrors).forEach(field => {
      delete fieldErrors[field]
    })
    
    // 设置新错误
    if (result.fields) {
      Object.entries(result.fields).forEach(([field, fieldResult]: [string, any]) => {
        if (!fieldResult.valid && fieldResult.message) {
          fieldErrors[field] = [fieldResult.message]
        }
      })
    }
  }
  
  // 获取字段验证规则
  const getFieldRules = (fields?: string[]) => {
    const rules: Record<string, any[]> = {}
    
    if (!formInstance.value) return rules
    
    for (const [fieldPath, fieldConfig] of formInstance.value.stateManager.fieldConfigs) {
      if (fields && !fields.includes(fieldPath)) continue
      
      if (fieldConfig.rules) {
        rules[fieldPath] = fieldConfig.rules
      }
    }
    
    return rules
  }
  
  // 注册自定义验证器
  Object.entries(customValidators).forEach(([name, validator]) => {
    registerValidator(name, validator)
  })
  
  return {
    isValidating,
    isValid,
    hasErrors,
    hasWarnings,
    errors,
    warnings,
    fieldErrors,
    fieldWarnings,
    validationResult,
    validate,
    validateField,
    clearErrors,
    clearWarnings,
    setFieldError,
    setFieldWarning,
    registerValidator,
    unregisterValidator
  }
}
