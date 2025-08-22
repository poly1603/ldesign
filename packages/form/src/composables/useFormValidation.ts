// useFormValidation Composition API Hook

import type { FormItemConfig } from '../types/field'
import type { FormData } from '../types/form'
import type {
  ValidationConfig,
  ValidationResult,
  ValidationRule,
} from '../types/validation'
import { onUnmounted, reactive } from 'vue'
import { ValidationEngine } from '../core/ValidationEngine'
import { debounce } from '../utils/throttle'

/**
 * useFormValidation Hook 选项
 */
export interface UseFormValidationOptions {
  /** 字段配置 */
  fields?: FormItemConfig[]

  /** 验证配置 */
  config?: ValidationConfig

  /** 表单数据 */
  formData?: FormData

  /** 是否自动验证 */
  autoValidate?: boolean

  /** 验证延迟时间 */
  validateDelay?: number
}

/**
 * 字段验证状态
 */
export interface FieldValidationState {
  valid: boolean
  errors: string[]
  validating: boolean
  touched: boolean
}

/**
 * useFormValidation Hook 返回值
 */
export interface UseFormValidationReturn {
  /** 验证引擎实例 */
  validationEngine: ValidationEngine

  /** 整体验证状态 */
  validationState: {
    valid: boolean
    validating: boolean
    errors: Record<string, string[]>
  }

  /** 字段验证状态 */
  fieldValidationStates: Record<string, FieldValidationState>

  /** 验证整个表单 */
  validateForm: (data?: FormData) => Promise<boolean>

  /** 验证单个字段 */
  validateField: (
    fieldName: string,
    value?: any,
    data?: FormData
  ) => Promise<boolean>

  /** 批量验证字段 */
  validateFields: (fieldNames: string[], data?: FormData) => Promise<boolean>

  /** 清空所有验证错误 */
  clearValidation: () => void

  /** 清空指定字段的验证错误 */
  clearFieldValidation: (fieldName: string) => void

  /** 添加自定义验证规则 */
  addRule: (type: string, validator: Function) => void

  /** 设置字段验证规则 */
  setFieldRules: (fieldName: string, rules: ValidationRule[]) => void

  /** 获取字段验证规则 */
  getFieldRules: (fieldName: string) => ValidationRule[]

  /** 标记字段为已访问 */
  touchField: (fieldName: string) => void

  /** 检查字段是否有错误 */
  hasFieldError: (fieldName: string) => boolean

  /** 获取字段错误信息 */
  getFieldErrors: (fieldName: string) => string[]

  /** 获取第一个字段错误 */
  getFirstFieldError: (fieldName: string) => string | undefined

  /** 获取所有错误字段 */
  getInvalidFields: () => string[]

  /** 获取验证统计信息 */
  getValidationStats: () => {
    totalFields: number
    validFields: number
    invalidFields: number
    touchedFields: number
  }
}

/**
 * useFormValidation Hook
 */
export function useFormValidation(
  options: UseFormValidationOptions = {},
): UseFormValidationReturn {
  const {
    fields = [],
    config = {},
    formData = {},
    autoValidate = false,
    validateDelay = 300,
  } = options

  // 创建验证引擎
  const validationEngine = new ValidationEngine(config)

  // 响应式状态
  const validationState = reactive({
    valid: true,
    validating: false,
    errors: {} as Record<string, string[]>,
  })

  const fieldValidationStates = reactive<Record<string, FieldValidationState>>(
    {},
  )

  // 初始化字段验证状态
  fields.forEach((field) => {
    fieldValidationStates[field.name] = {
      valid: true,
      errors: [],
      validating: false,
      touched: false,
    }

    // 设置字段验证规则
    if (field.rules) {
      validationEngine.setFieldRules(field.name, field.rules)
    }
  })

  // 防抖验证函数
  const debouncedValidateField = debounce(
    async (fieldName: string, value: any, data: FormData) => {
      await validateFieldInternal(fieldName, value, data)
    },
    validateDelay,
  )

  // 内部字段验证方法
  const validateFieldInternal = async (
    fieldName: string,
    value: any,
    data: FormData,
  ): Promise<boolean> => {
    const fieldState = fieldValidationStates[fieldName]
    if (!fieldState)
      return true

    fieldState.validating = true

    try {
      const field = fields.find(f => f.name === fieldName)
      if (!field?.rules) {
        fieldState.valid = true
        fieldState.errors = []
        return true
      }

      const result = await validationEngine.validateField(
        value,
        field.rules,
        data,
        fieldName,
      )

      fieldState.valid = result.valid
      fieldState.errors = result.errors

      // 更新整体验证状态
      updateOverallValidationState()

      return result.valid
    }
    catch (error) {
      fieldState.valid = false
      fieldState.errors = [`验证过程中发生错误: ${error.message}`]
      updateOverallValidationState()
      return false
    }
    finally {
      fieldState.validating = false
    }
  }

  // 更新整体验证状态
  const updateOverallValidationState = () => {
    const allValid = Object.values(fieldValidationStates).every(
      state => state.valid,
    )
    const allErrors = Object.fromEntries(
      Object.entries(fieldValidationStates)
        .filter(([_, state]) => state.errors.length > 0)
        .map(([name, state]) => [name, state.errors]),
    )

    validationState.valid = allValid
    validationState.errors = allErrors
  }

  // 验证整个表单
  const validateForm = async (data: FormData = formData): Promise<boolean> => {
    validationState.validating = true

    try {
      const results = await validationEngine.validateForm(data)

      // 更新字段验证状态
      Object.entries(results).forEach(([fieldName, result]) => {
        if (fieldValidationStates[fieldName]) {
          fieldValidationStates[fieldName].valid = result.valid
          fieldValidationStates[fieldName].errors = result.errors
        }
      })

      updateOverallValidationState()

      return validationState.valid
    }
    finally {
      validationState.validating = false
    }
  }

  // 验证单个字段
  const validateField = async (
    fieldName: string,
    value?: any,
    data: FormData = formData,
  ): Promise<boolean> => {
    const fieldValue = value !== undefined ? value : data[fieldName]

    if (autoValidate) {
      debouncedValidateField(fieldName, fieldValue, data)
      return true // 防抖验证不等待结果
    }
    else {
      return await validateFieldInternal(fieldName, fieldValue, data)
    }
  }

  // 批量验证字段
  const validateFields = async (
    fieldNames: string[],
    data: FormData = formData,
  ): Promise<boolean> => {
    const promises = fieldNames.map(fieldName =>
      validateFieldInternal(fieldName, data[fieldName], data),
    )

    const results = await Promise.all(promises)
    return results.every(result => result)
  }

  // 清空所有验证错误
  const clearValidation = () => {
    Object.values(fieldValidationStates).forEach((state) => {
      state.valid = true
      state.errors = []
    })

    validationState.valid = true
    validationState.errors = {}

    validationEngine.clearCache()
  }

  // 清空指定字段的验证错误
  const clearFieldValidation = (fieldName: string) => {
    if (fieldValidationStates[fieldName]) {
      fieldValidationStates[fieldName].valid = true
      fieldValidationStates[fieldName].errors = []

      updateOverallValidationState()
      validationEngine.clearFieldCache(fieldName)
    }
  }

  // 添加自定义验证规则
  const addRule = (type: string, validator: Function) => {
    validationEngine.addRule(type, validator)
  }

  // 设置字段验证规则
  const setFieldRules = (fieldName: string, rules: ValidationRule[]) => {
    validationEngine.setFieldRules(fieldName, rules)

    // 初始化字段状态（如果不存在）
    if (!fieldValidationStates[fieldName]) {
      fieldValidationStates[fieldName] = {
        valid: true,
        errors: [],
        validating: false,
        touched: false,
      }
    }
  }

  // 获取字段验证规则
  const getFieldRules = (fieldName: string): ValidationRule[] => {
    return validationEngine.getFieldRules(fieldName)
  }

  // 标记字段为已访问
  const touchField = (fieldName: string) => {
    if (fieldValidationStates[fieldName]) {
      fieldValidationStates[fieldName].touched = true
    }
  }

  // 检查字段是否有错误
  const hasFieldError = (fieldName: string): boolean => {
    return fieldValidationStates[fieldName]?.errors.length > 0 || false
  }

  // 获取字段错误信息
  const getFieldErrors = (fieldName: string): string[] => {
    return fieldValidationStates[fieldName]?.errors || []
  }

  // 获取第一个字段错误
  const getFirstFieldError = (fieldName: string): string | undefined => {
    const errors = getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0] : undefined
  }

  // 获取所有错误字段
  const getInvalidFields = (): string[] => {
    return Object.entries(fieldValidationStates)
      .filter(([_, state]) => !state.valid)
      .map(([name, _]) => name)
  }

  // 获取验证统计信息
  const getValidationStats = () => {
    const states = Object.values(fieldValidationStates)
    return {
      totalFields: states.length,
      validFields: states.filter(state => state.valid).length,
      invalidFields: states.filter(state => !state.valid).length,
      touchedFields: states.filter(state => state.touched).length,
    }
  }

  // 监听验证引擎事件
  validationEngine.on(
    'fieldValidate',
    (fieldName: string, result: ValidationResult) => {
      if (fieldValidationStates[fieldName]) {
        fieldValidationStates[fieldName].valid = result.valid
        fieldValidationStates[fieldName].errors = result.errors
        updateOverallValidationState()
      }
    },
  )

  // 清理资源
  onUnmounted(() => {
    validationEngine.destroy()
  })

  return {
    validationEngine,
    validationState,
    fieldValidationStates,
    validateForm,
    validateField,
    validateFields,
    clearValidation,
    clearFieldValidation,
    addRule,
    setFieldRules,
    getFieldRules,
    touchField,
    hasFieldError,
    getFieldErrors,
    getFirstFieldError,
    getInvalidFields,
    getValidationStats,
  }
}
