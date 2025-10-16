/**
 * 表单处理 Hooks
 *
 * @description
 * 提供完整的表单状态管理、验证和提交功能。
 * 支持字段级验证、异步验证、表单重置等功能。
 */

import { ref, reactive, computed, watch, type Ref, type ComputedRef } from 'vue'

/**
 * 表单配置选项
 */
export interface FormOptions<T extends Record<string, any>> {
  /** 表单验证函数 */
  validate?: (values: T) => Record<string, string> | Promise<Record<string, string>>
  /** 字段级验证器 */
  fieldValidators?: {
    [K in keyof T]?: (value: T[K]) => string | true
  }
  /** 提交处理函数 */
  onSubmit?: (values: T) => Promise<void> | void
}

/**
 * 表单返回值
 */
export interface UseFormReturn<T extends Record<string, any>> {
  /** 表单值 */
  values: Ref<T>
  /** 表单错误 */
  errors: Ref<Record<string, string>>
  /** 字段触摸状态 */
  touched: Ref<Record<string, boolean>>
  /** 表单是否脏（已修改） */
  dirty: Ref<boolean>
  /** 表单是否有效 */
  valid: Ref<boolean>
  /** 表单是否为空 */
  isEmpty: Ref<boolean>
  /** 是否有错误 */
  hasErrors: Ref<boolean>
  /** 是否正在提交 */
  isSubmitting: Ref<boolean>
  /** 设置字段值 */
  setFieldValue: (field: string, value: any) => void
  /** 设置多个字段值 */
  setValues: (values: Partial<T>) => void
  /** 设置字段错误 */
  setFieldError: (field: string, error: string) => void
  /** 清除字段错误 */
  clearFieldError: (field: string) => void
  /** 验证字段 */
  validateField: (field: string) => Promise<boolean>
  /** 验证整个表单 */
  validate: () => Promise<boolean>
  /** 重置表单 */
  reset: () => void
  /** 提交表单 */
  submit: () => Promise<void>
}

/**
 * 表单 Hook
 *
 * @param initialValues - 初始值
 * @param options - 配置选项
 * @returns 表单状态和操作方法
 *
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const form = useForm({
 *       name: '',
 *       email: '',
 *       age: 0,
 *     }, {
 *       validate: (values) => {
 *         const errors: Record<string, string> = {}
 *         if (!values.name) {
 *           errors.name = '姓名不能为空'
 *         }
 *         if (!values.email) {
 *           errors.email = '邮箱不能为空'
 *         }
 *         return errors
 *       },
 *       onSubmit: async (values) => {
 *          *       }
 *     })
 *
 *     return {
 *       form
 *     }
 *   }
 * })
 * ```
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  options: FormOptions<T> = {}
): UseFormReturn<T> {
  const { validate, fieldValidators, onSubmit } = options

  // 初始化状态
  const values = ref<T>({ ...initialValues })
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})
  const isSubmitting = ref(false)

  // 初始值备份，用于重置
  const initialValuesCopy = { ...initialValues }

  // 设置字段值（支持嵌套路径）
  const setFieldValue = (field: string, value: any) => {
    const keys = field.split('.')
    let target = values.value as any

    // 导航到目标对象
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in target)) {
        target[key] = {}
      }
      target = target[key]
    }

    // 设置最终值
    const finalKey = keys[keys.length - 1]
    target[finalKey] = value

    // 标记为已触摸
    touched.value[field] = true
  }

  // 设置多个字段值
  const setValues = (newValues: Partial<T>) => {
    Object.assign(values.value, newValues)

    // 标记所有设置的字段为已触摸
    Object.keys(newValues).forEach(key => {
      touched.value[key] = true
    })
  }

  // 设置字段错误
  const setFieldError = (field: string, error: string) => {
    errors.value[field] = error
  }

  // 清除字段错误
  const clearFieldError = (field: string) => {
    delete errors.value[field]
  }

  // 验证单个字段
  const validateField = async (field: string): Promise<boolean> => {
    const fieldValidator = fieldValidators?.[field as keyof T]
    if (!fieldValidator) {
      return true
    }

    const value = getFieldValue(field)
    const result = fieldValidator(value)

    if (result === true) {
      clearFieldError(field)
      return true
    } else {
      setFieldError(field, result)
      return false
    }
  }

  // 获取字段值（支持嵌套路径）
  const getFieldValue = (field: string) => {
    const keys = field.split('.')
    let target = values.value as any

    for (const key of keys) {
      if (target && typeof target === 'object' && key in target) {
        target = target[key]
      } else {
        return undefined
      }
    }

    return target
  }

  // 验证整个表单
  const validateForm = async (): Promise<boolean> => {
    if (validate) {
      const validationErrors = await validate(values.value)
      errors.value = validationErrors
      return Object.keys(validationErrors).length === 0
    }

    // 如果有字段级验证器，验证所有字段
    if (fieldValidators) {
      const fieldValidationPromises = Object.keys(fieldValidators).map(field =>
        validateField(field)
      )
      const results = await Promise.all(fieldValidationPromises)
      return results.every(result => result)
    }

    return true
  }

  // 重置表单
  const reset = () => {
    values.value = { ...initialValuesCopy }
    errors.value = {}
    touched.value = {}
    isSubmitting.value = false
  }

  // 提交表单
  const submit = async () => {
    if (isSubmitting.value) return

    isSubmitting.value = true

    try {
      const isValid = await validateForm()
      if (isValid && onSubmit) {
        await onSubmit(values.value)
      }
    } finally {
      isSubmitting.value = false
    }
  }

  // 计算属性
  const dirty = computed(() => {
    return Object.keys(touched.value).length > 0
  })

  const valid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  const isEmpty = computed(() => {
    return Object.values(values.value).every(value => {
      if (value === null || value === undefined || value === '') {
        return true
      }
      if (Array.isArray(value) && value.length === 0) {
        return true
      }
      if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
        return true
      }
      if (typeof value === 'number' && value === 0) {
        return true
      }
      return false
    })
  })

  const hasErrors = computed(() => {
    return Object.keys(errors.value).length > 0
  })

  return {
    values: values as Ref<T>,
    errors,
    touched,
    dirty,
    valid,
    isEmpty,
    hasErrors,
    isSubmitting,
    setFieldValue,
    setValues,
    setFieldError,
    clearFieldError,
    validateField,
    validate: validateForm,
    reset,
    submit,
  }
}
