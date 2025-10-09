/**
 * 表单验证 Composable
 * 提供高性能、类型安全的表单验证功能
 */

import { computed, reactive, ref, watch, type Ref } from 'vue'

/**
 * 验证规则类型
 */
export interface ValidationRule<T = any> {
  /** 验证函数 */
  validator: (value: T) => boolean | Promise<boolean>
  /** 错误消息 */
  message: string
  /** 触发时机 */
  trigger?: 'blur' | 'change' | 'submit'
  /** 是否必填 */
  required?: boolean
}

/**
 * 字段配置
 */
export interface FieldConfig<T = any> {
  /** 初始值 */
  initialValue: T
  /** 验证规则 */
  rules?: ValidationRule<T>[]
  /** 是否立即验证 */
  validateOnMount?: boolean
}

/**
 * 表单配置
 */
export interface FormConfig {
  /** 字段配置 */
  fields: Record<string, FieldConfig>
  /** 是否在值改变时验证 */
  validateOnChange?: boolean
  /** 防抖延迟(ms) */
  debounceDelay?: number
}

/**
 * 字段状态
 */
interface FieldState<T = any> {
  value: T
  error: string | null
  touched: boolean
  validating: boolean
  dirty: boolean
}

/**
 * 表单验证返回值
 */
export interface UseFormValidationReturn<T extends Record<string, any>> {
  /** 表单值 */
  values: T
  /** 错误信息 */
  errors: Ref<Record<keyof T, string | null>>
  /** 字段是否被触摸 */
  touched: Ref<Record<keyof T, boolean>>
  /** 是否正在验证 */
  validating: Ref<boolean>
  /** 表单是否有效 */
  isValid: Ref<boolean>
  /** 表单是否被修改 */
  isDirty: Ref<boolean>
  /** 验证单个字段 */
  validateField: (field: keyof T) => Promise<boolean>
  /** 验证所有字段 */
  validateForm: () => Promise<boolean>
  /** 重置表单 */
  resetForm: () => void
  /** 重置单个字段 */
  resetField: (field: keyof T) => void
  /** 设置字段值 */
  setFieldValue: (field: keyof T, value: any) => void
  /** 设置字段错误 */
  setFieldError: (field: keyof T, error: string | null) => void
  /** 标记字段为已触摸 */
  setFieldTouched: (field: keyof T, touched: boolean) => void
  /** 提交表单 */
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => Promise<void>
}

/**
 * 内置验证器
 */
export const validators = {
  /** 必填验证 */
  required: (message = '此字段为必填项'): ValidationRule => ({
    validator: (value: any) => {
      if (typeof value === 'string') return value.trim().length > 0
      if (Array.isArray(value)) return value.length > 0
      return value !== null && value !== undefined
    },
    message,
    required: true,
  }),

  /** 邮箱验证 */
  email: (message = '请输入有效的邮箱地址'): ValidationRule<string> => ({
    validator: (value: string) => {
      if (!value) return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    },
    message,
  }),

  /** 最小长度验证 */
  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value: string) => {
      if (!value) return true
      return value.length >= min
    },
    message: message || `最少需要 ${min} 个字符`,
  }),

  /** 最大长度验证 */
  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value: string) => {
      if (!value) return true
      return value.length <= max
    },
    message: message || `最多允许 ${max} 个字符`,
  }),

  /** 密码强度验证 */
  password: (message = '密码必须包含大小写字母、数字和特殊字符'): ValidationRule<string> => ({
    validator: (value: string) => {
      if (!value) return true
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
    },
    message,
  }),

  /** 手机号验证 */
  phone: (message = '请输入有效的手机号码'): ValidationRule<string> => ({
    validator: (value: string) => {
      if (!value) return true
      return /^1[3-9]\d{9}$/.test(value)
    },
    message,
  }),

  /** 数字验证 */
  number: (message = '请输入有效的数字'): ValidationRule<string | number> => ({
    validator: (value: string | number) => {
      if (!value && value !== 0) return true
      return !isNaN(Number(value))
    },
    message,
  }),

  /** 范围验证 */
  range: (min: number, max: number, message?: string): ValidationRule<number> => ({
    validator: (value: number) => {
      if (value === null || value === undefined) return true
      return value >= min && value <= max
    },
    message: message || `值必须在 ${min} 到 ${max} 之间`,
  }),

  /** 正则验证 */
  pattern: (regex: RegExp, message = '格式不正确'): ValidationRule<string> => ({
    validator: (value: string) => {
      if (!value) return true
      return regex.test(value)
    },
    message,
  }),

  /** 自定义验证 */
  custom: (validator: (value: any) => boolean | Promise<boolean>, message: string): ValidationRule => ({
    validator,
    message,
  }),
}

/**
 * 表单验证 Hook
 */
export function useFormValidation<T extends Record<string, any>>(
  config: FormConfig
): UseFormValidationReturn<T> {
  const { fields, validateOnChange = false, debounceDelay = 300 } = config

  // 初始化状态
  const fieldStates = reactive<Record<string, FieldState>>(
    Object.entries(fields).reduce((acc, [key, fieldConfig]) => {
      acc[key] = {
        value: fieldConfig.initialValue,
        error: null,
        touched: false,
        validating: false,
        dirty: false,
      }
      return acc
    }, {} as Record<string, FieldState>)
  )

  const validating = ref(false)
  const debounceTimers = new Map<string, NodeJS.Timeout>()

  // 计算属性
  const values = computed(() => {
    const result: any = {}
    Object.entries(fieldStates).forEach(([key, state]) => {
      result[key] = state.value
    })
    return result as T
  })

  const errors = computed(() => {
    const result: any = {}
    Object.entries(fieldStates).forEach(([key, state]) => {
      result[key] = state.error
    })
    return result as Record<keyof T, string | null>
  })

  const touched = computed(() => {
    const result: any = {}
    Object.entries(fieldStates).forEach(([key, state]) => {
      result[key] = state.touched
    })
    return result as Record<keyof T, boolean>
  })

  const isValid = computed(() => {
    return Object.values(fieldStates).every(state => !state.error)
  })

  const isDirty = computed(() => {
    return Object.values(fieldStates).some(state => state.dirty)
  })

  /**
   * 验证单个字段
   */
  const validateField = async (field: keyof T): Promise<boolean> => {
    const fieldConfig = fields[field as string]
    const state = fieldStates[field as string]

    if (!fieldConfig || !state) return true

    state.validating = true
    state.error = null

    try {
      const rules = fieldConfig.rules || []

      for (const rule of rules) {
        const isValid = await rule.validator(state.value)
        if (!isValid) {
          state.error = rule.message
          state.validating = false
          return false
        }
      }

      state.validating = false
      return true
    } catch (error) {
      state.error = '验证失败'
      state.validating = false
      return false
    }
  }

  /**
   * 验证所有字段
   */
  const validateForm = async (): Promise<boolean> => {
    validating.value = true

    const results = await Promise.all(
      Object.keys(fields).map(field => validateField(field as keyof T))
    )

    validating.value = false
    return results.every(result => result)
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    Object.entries(fields).forEach(([key, fieldConfig]) => {
      const state = fieldStates[key]
      state.value = fieldConfig.initialValue
      state.error = null
      state.touched = false
      state.validating = false
      state.dirty = false
    })
  }

  /**
   * 重置单个字段
   */
  const resetField = (field: keyof T) => {
    const fieldConfig = fields[field as string]
    const state = fieldStates[field as string]

    if (fieldConfig && state) {
      state.value = fieldConfig.initialValue
      state.error = null
      state.touched = false
      state.validating = false
      state.dirty = false
    }
  }

  /**
   * 设置字段值
   */
  const setFieldValue = (field: keyof T, value: any) => {
    const state = fieldStates[field as string]
    if (!state) return

    state.value = value
    state.dirty = true

    // 防抖验证
    if (validateOnChange) {
      const timer = debounceTimers.get(field as string)
      if (timer) clearTimeout(timer)

      const newTimer = setTimeout(() => {
        validateField(field)
        debounceTimers.delete(field as string)
      }, debounceDelay)

      debounceTimers.set(field as string, newTimer)
    }
  }

  /**
   * 设置字段错误
   */
  const setFieldError = (field: keyof T, error: string | null) => {
    const state = fieldStates[field as string]
    if (state) {
      state.error = error
    }
  }

  /**
   * 标记字段为已触摸
   */
  const setFieldTouched = (field: keyof T, touched: boolean) => {
    const state = fieldStates[field as string]
    if (state) {
      state.touched = touched
    }
  }

  /**
   * 提交表单
   */
  const handleSubmit = async (onSubmit: (values: T) => void | Promise<void>) => {
    // 标记所有字段为已触摸
    Object.keys(fieldStates).forEach(key => {
      fieldStates[key].touched = true
    })

    // 验证表单
    const isFormValid = await validateForm()

    if (isFormValid) {
      await onSubmit(values.value)
    }
  }

  // 监听值变化(用于validateOnMount)
  Object.entries(fields).forEach(([key, fieldConfig]) => {
    if (fieldConfig.validateOnMount) {
      validateField(key as keyof T)
    }
  })

  return {
    values: values.value,
    errors,
    touched,
    validating,
    isValid,
    isDirty,
    validateField,
    validateForm,
    resetForm,
    resetField,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
  }
}

