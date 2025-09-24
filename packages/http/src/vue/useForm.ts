import type { Ref } from 'vue'
import type { HttpClientConfig, RequestConfig } from '../types'
import { computed, onUnmounted, reactive, ref } from 'vue'
import { createHttpClient } from '../factory'

/**
 * 表单验证规则
 */
export interface ValidationRule<T = any> {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: T) => boolean | string
  message?: string
}

/**
 * 表单字段配置
 */
export interface FormField<T = any> {
  value: T
  rules?: ValidationRule<T>[]
  error?: string
}

/**
 * 表单选项
 */
export interface FormOptions<T> {
  /** 初始数据 */
  initialData?: Partial<T>
  /** 是否在组件卸载时取消请求 */
  cancelOnUnmount?: boolean
  /** 提交成功回调 */
  onSuccess?: (data: any, response: any) => void
  /** 提交失败回调 */
  onError?: (error: Error) => void
  /** 验证失败回调 */
  onValidationError?: (errors: Record<string, string>) => void
  /** HTTP客户端配置 */
  clientConfig?: HttpClientConfig
}

/**
 * 表单返回值
 */
export interface FormReturn<T> {
  /** 表单数据 */
  data: T
  /** 提交状态 */
  submitting: Ref<boolean>
  /** 错误信息 */
  error: Ref<Error | null>
  /** 验证错误 */
  errors: Ref<Record<string, string>>
  /** 是否有错误 */
  hasError: Ref<boolean>
  /** 是否有验证错误 */
  hasValidationErrors: Ref<boolean>
  /** 是否有任何错误 */
  hasAnyError: Ref<boolean>
  /** 表单是否有效 */
  isValid: Ref<boolean>
  /** 提交表单 */
  submit: (url: string, config?: RequestConfig) => Promise<any>
  /** 验证表单 */
  validate: () => boolean
  /** 验证单个字段 */
  validateField: (field: keyof T) => boolean
  /** 重置表单 */
  reset: () => void
  /** 清除错误 */
  clearErrors: () => void
  /** 清除验证错误 */
  clearValidationErrors: () => void
  /** 设置字段值 */
  setField: (field: keyof T, value: any) => void
  /** 设置字段错误 */
  setFieldError: (field: keyof T, error: string) => void
}

/**
 * 表单管理hook
 * 提供表单数据管理、验证和提交功能
 *
 * @example
 * ```ts
 * const { data, submitting, errors, submit, validate } = useForm<User>({
 *   initialData: { name: '', email: '' }
 * })
 *
 * // 设置验证规则
 * const rules = {
 *   name: [{ required: true, message: '姓名不能为空' }],
 *   email: [
 *     { required: true, message: '邮箱不能为空' },
 *     { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
 *   ]
 * }
 *
 * // 提交表单
 * const handleSubmit = async () => {
 *   if (validate()) {
 *     await submit('/api/users')
 *   }
 * }
 * ```
 */
export function useForm<T extends Record<string, any>>(
  options: FormOptions<T> = {},
): FormReturn<T> {
  const client = createHttpClient(options.clientConfig)

  // 响应式状态
  const data = reactive({ ...options.initialData } as T)
  const submitting = ref(false)
  const error = ref<Error | null>(null)
  const errors = ref<Record<string, string>>({})

  // 验证规则存储
  const validationRules = ref<Record<string, ValidationRule[]>>({})

  const hasError = computed(() => error.value !== null)
  const hasValidationErrors = computed(() => Object.keys(errors.value).length > 0)
  const hasAnyError = computed(() => hasError.value || hasValidationErrors.value)
  const isValid = computed(() => !hasValidationErrors.value)

  let abortController: AbortController | null = null

  /**
   * 验证单个字段
   */
  const validateField = (field: keyof T): boolean => {
    const rules = validationRules.value[field as string]
    if (!rules || rules.length === 0)
      return true

    const value = (data as any)[field]

    for (const rule of rules) {
      // 必填验证
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.value[field as string] = rule.message || `${String(field)} is required`
        return false
      }

      // 跳过空值的其他验证
      if (value === undefined || value === null || value === '') {
        continue
      }

      // 最小长度验证
      if (rule.min !== undefined && String(value).length < rule.min) {
        errors.value[field as string] = rule.message || `${String(field)} must be at least ${rule.min} characters`
        return false
      }

      // 最大长度验证
      if (rule.max !== undefined && String(value).length > rule.max) {
        errors.value[field as string] = rule.message || `${String(field)} must be at most ${rule.max} characters`
        return false
      }

      // 正则验证
      if (rule.pattern && !rule.pattern.test(String(value))) {
        errors.value[field as string] = rule.message || `${String(field)} format is invalid`
        return false
      }

      // 自定义验证
      if (rule.validator) {
        const result = rule.validator(value)
        if (result !== true) {
          errors.value[field as string] = typeof result === 'string' ? result : (rule.message || `${String(field)} is invalid`)
          return false
        }
      }
    }

    // 验证通过，清除错误
    delete errors.value[field as string]
    return true
  }

  /**
   * 验证整个表单
   */
  const validate = (): boolean => {
    let isFormValid = true

    for (const field in validationRules.value) {
      if (!validateField(field)) {
        isFormValid = false
      }
    }

    if (!isFormValid && options.onValidationError) {
      options.onValidationError(errors.value)
    }

    return isFormValid
  }

  /**
   * 提交表单
   */
  const submit = async (url: string, config?: RequestConfig): Promise<any> => {
    try {
      submitting.value = true
      error.value = null

      // 验证表单
      if (!validate()) {
        return null
      }

      // 取消之前的请求
      if (abortController) {
        abortController.abort()
      }
      abortController = new AbortController()

      const requestConfig = {
        ...config,
        signal: abortController.signal,
      }

      const response = await client.post(url, data, requestConfig)

      options.onSuccess?.(response.data, response)
      return response.data
    }
    catch (err) {
      const errorObj = err as Error
      if (errorObj.name !== 'AbortError') {
        error.value = errorObj
        options.onError?.(errorObj)
      }
      throw errorObj
    }
    finally {
      submitting.value = false
    }
  }

  /**
   * 重置表单
   */
  const reset = () => {
    Object.assign(data, options.initialData || {})
    submitting.value = false
    error.value = null
    errors.value = {}
  }

  /**
   * 清除错误
   */
  const clearErrors = () => {
    error.value = null
  }

  /**
   * 清除验证错误
   */
  const clearValidationErrors = () => {
    errors.value = {}
  }

  /**
   * 设置字段值
   */
  const setField = (field: keyof T, value: any) => {
    ;(data as any)[field] = value
    // 设置值后自动验证该字段
    if (validationRules.value[field as string]) {
      validateField(field)
    }
  }

  /**
   * 设置字段错误
   */
  const setFieldError = (field: keyof T, errorMessage: string) => {
    errors.value[field as string] = errorMessage
  }

  /**
   * 设置验证规则
   */
  const setValidationRules = (rules: Record<keyof T, ValidationRule[]>) => {
    validationRules.value = rules as Record<string, ValidationRule[]>
  }

  // 组件卸载时取消请求
  if (options.cancelOnUnmount !== false) {
    onUnmounted(() => {
      if (abortController) {
        abortController.abort()
      }
    })
  }

  return {
    data,
    submitting,
    error,
    errors,
    hasError,
    hasValidationErrors,
    hasAnyError,
    isValid,
    submit,
    validate,
    validateField,
    reset,
    clearErrors,
    clearValidationErrors,
    setField,
    setFieldError,
    // 额外的方法
    setValidationRules,
  } as FormReturn<T> & { setValidationRules: (rules: Record<keyof T, ValidationRule[]>) => void }
}
