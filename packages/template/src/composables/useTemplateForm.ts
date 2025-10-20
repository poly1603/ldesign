/**
 * 模板表单系统
 * 
 * 提供双向数据绑定、表单验证、自动保存等功能
 */

import { computed, onUnmounted, reactive, readonly, ref, watch } from 'vue'

/**
 * 验证规则类型
 */
export interface ValidationRule {
  required?: boolean | ((value: any) => boolean)
  min?: number
  max?: number
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  url?: boolean
  custom?: (value: any, data: any) => boolean | string | Promise<boolean | string>
  message?: string
  trigger?: 'blur' | 'change' | 'submit'
}

/**
 * 字段验证规则
 */
export type FieldRules = ValidationRule | ValidationRule[]

/**
 * 表单验证规则
 */
export type FormRules<T = any> = {
  [K in keyof T]?: FieldRules
}

/**
 * 字段错误
 */
export interface FieldError {
  field: string
  message: string
  rule?: ValidationRule
}

/**
 * 表单状态
 */
export interface FormState<T = any> {
  data: T
  errors: Map<keyof T, string>
  touched: Set<keyof T>
  dirty: boolean
  valid: boolean
  validating: boolean
  submitting: boolean
}

/**
 * 表单选项
 */
export interface FormOptions<T = any> {
  initialValues?: Partial<T>
  rules?: FormRules<T>
  validateOnChange?: boolean
  validateOnBlur?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  onSubmit?: (values: T) => void | Promise<void>
  onError?: (errors: FieldError[]) => void
  onSave?: (values: T) => void | Promise<void>
}

/**
 * 内置验证器
 */
const validators = {
  required: (value: any, rule: ValidationRule): boolean | string => {
    const isEmpty = value === undefined || value === null || value === '' ||
                   (Array.isArray(value) && value.length === 0)
    
    if (typeof rule.required === 'function') {
      return rule.required(value) ? !isEmpty : true
    }
    
    return rule.required ? !isEmpty : true
  },
  
  min: (value: any, rule: ValidationRule): boolean | string => {
    if (rule.min === undefined) return true
    const num = Number(value)
    return !Number.isNaN(num) && num >= rule.min
  },
  
  max: (value: any, rule: ValidationRule): boolean | string => {
    if (rule.max === undefined) return true
    const num = Number(value)
    return !Number.isNaN(num) && num <= rule.max
  },
  
  minLength: (value: any, rule: ValidationRule): boolean | string => {
    if (rule.minLength === undefined) return true
    const len = String(value).length
    return len >= rule.minLength
  },
  
  maxLength: (value: any, rule: ValidationRule): boolean | string => {
    if (rule.maxLength === undefined) return true
    const len = String(value).length
    return len <= rule.maxLength
  },
  
  pattern: (value: any, rule: ValidationRule): boolean | string => {
    if (!rule.pattern) return true
    return rule.pattern.test(String(value))
  },
  
  email: (value: any, rule: ValidationRule): boolean | string => {
    if (!rule.email) return true
    const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
    return emailRegex.test(String(value))
  },
  
  url: (value: any, rule: ValidationRule): boolean | string => {
    if (!rule.url) return true
    try {
      const _url = new URL(String(value))
      return !!_url
    } catch {
      return false
    }
  }
}

/**
 * 验证单个字段
 */
async function validateField<T>(
  field: keyof T,
  value: any,
  rules: FieldRules | undefined,
  data: T
): Promise<string | null> {
  if (!rules) return null
  
  const ruleArray = Array.isArray(rules) ? rules : [rules]
  
  for (const rule of ruleArray) {
    // 自定义验证
    if (rule.custom) {
      const result = await rule.custom(value, data)
      if (result !== true) {
        return typeof result === 'string' ? result : rule.message || '验证失败'
      }
    }
    
    // 内置验证
    for (const [key, validator] of Object.entries(validators)) {
      if (key in rule) {
        const result = validator(value, rule)
        if (result !== true) {
          return rule.message || getDefaultMessage(key, rule)
        }
      }
    }
  }
  
  return null
}

/**
 * 获取默认错误消息
 */
function getDefaultMessage(type: string, rule: ValidationRule): string {
  switch (type) {
    case 'required':
      return '此字段为必填项'
    case 'min':
      return `值必须大于或等于 ${rule.min}`
    case 'max':
      return `值必须小于或等于 ${rule.max}`
    case 'minLength':
      return `长度至少为 ${rule.minLength} 个字符`
    case 'maxLength':
      return `长度不能超过 ${rule.maxLength} 个字符`
    case 'pattern':
      return '格式不正确'
    case 'email':
      return '请输入有效的邮箱地址'
    case 'url':
      return '请输入有效的URL'
    default:
      return '验证失败'
  }
}

/**
 * 创建表单模型
 */
export function useTemplateForm<T extends Record<string, any>>(
  options: FormOptions<T> = {}
) {
  // 表单数据
  const formData = reactive(
    (options.initialValues || {}) as T
  ) as T
  
  // 表单状态
  const errors = reactive(new Map<keyof T, string>())
  const touched = reactive(new Set<keyof T>())
  const dirty = ref(false)
  const validating = ref(false)
  const submitting = ref(false)
  
  // 自动保存定时器
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  
  /**
   * 保存表单
   */
  const saveForm = async () => {
    if (!dirty.value) return
    
    try {
      await options.onSave?.(formData)
      dirty.value = false
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }
  
  /**
   * 调度自动保存
   */
  const scheduleAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    
    autoSaveTimer = setTimeout(() => {
      saveForm()
    }, options.autoSaveDelay || 1000)
  }
  
  /**
   * 验证单个字段
   */
  const validateSingleField = async <K extends keyof T>(field: K) => {
    const value = (formData as T)[field]
    const rules = options.rules?.[field]
    
    if (!rules) {
      errors.delete(field)
      return true
    }
    
    validating.value = true
    
    try {
    const error = await validateField(field, value, rules, formData as T)
      
      if (error) {
        errors.set(field, error)
        return false
      } else {
        errors.delete(field)
        return true
      }
    } finally {
      validating.value = false
    }
  }
  
  /**
   * 设置字段值
   */
  const setFieldValue = <K extends keyof T>(field: K, value: T[K]) => {
    (formData as T)[field] = value
    dirty.value = true
    
    // 标记为已触摸
    touched.add(field as any)
    
    // 验证字段
    if (options.validateOnChange) {
      validateSingleField(field as any)
    }
    
    // 触发自动保存
    if (options.autoSave) {
      scheduleAutoSave()
    }
  }
  
  /**
   * 设置多个字段值
   */
  const setValues = (values: Partial<T>) => {
    Object.assign(formData, values)
    dirty.value = true
    
    // 验证所有更改的字段
    if (options.validateOnChange) {
      Object.keys(values).forEach(field => {
        validateSingleField(field as any)
      })
    }
    
    // 触发自动保存
    if (options.autoSave) {
      scheduleAutoSave()
    }
  }
  
  /**
   * 获取字段值
   */
  const getFieldValue = <K extends keyof T>(field: K): T[K] => {
    return (formData as T)[field]
  }
  
  
  /**
   * 验证所有字段
   */
  const validate = async (): Promise<boolean> => {
    if (!options.rules) return true
    
    validating.value = true
    errors.clear()
    
    try {
      const validationResults = await Promise.all(
        Object.entries(options.rules).map(async ([field, rules]) => {
          const value = (formData as T)[field as keyof T]
          const error = await validateField(field as keyof T, value, rules, formData as T)
          
          if (error) {
            errors.set(field as keyof T, error)
            return false
          }
          return true
        })
      )
      
      const isValid = validationResults.every(result => result)
      
      if (!isValid && options.onError) {
        const errorList: FieldError[] = Array.from(errors.entries()).map(
          ([field, message]) => ({
            field: String(field),
            message
          })
        )
        options.onError(errorList)
      }
      
      return isValid
    } finally {
      validating.value = false
    }
  }
  
  /**
   * 重置表单
   */
  const reset = () => {
    Object.assign(formData, options.initialValues || {})
    errors.clear()
    touched.clear()
    dirty.value = false
    validating.value = false
    submitting.value = false
    
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
  }
  
  /**
   * 提交表单
   */
  const submit = async () => {
    if (submitting.value) return
    
    // 标记所有字段为已触摸
    Object.keys(formData).forEach(field => {
      touched.add(field as keyof T)
    })
    
    // 验证表单
    const isValid = await validate()
    if (!isValid) return
    
    submitting.value = true
    
    try {
      await options.onSubmit?.(formData)
      dirty.value = false
    } finally {
      submitting.value = false
    }
  }
  
  
  /**
   * 字段处理器
   */
  const createFieldHandlers = <K extends keyof T>(field: K) => ({
    value: computed({
      get: () => formData[field],
      set: (value) => setFieldValue(field, value)
    }),
    error: computed(() => errors.get(field as any)),
    touched: computed(() => touched.has(field as any)),
    onBlur: () => {
      touched.add(field as any)
      if (options.validateOnBlur) {
        validateSingleField(field as any)
      }
    },
    onChange: (value: T[K]) => {
      setFieldValue(field, value)
    }
  })
  
  /**
   * 计算属性
   */
  const isValid = computed(() => errors.size === 0)
  const isDirty = computed(() => dirty.value)
  const isValidating = computed(() => validating.value)
  const isSubmitting = computed(() => submitting.value)
  const errorMessages = computed(() => Array.from(errors.values()))
  const hasErrors = computed(() => errors.size > 0)
  
  // 监听数据变化
  const stopWatching = watch(
    () => formData,
    () => {
      dirty.value = true
    },
    { deep: true }
  )
  
  // 清理函数
  const cleanup = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
    stopWatching()
  }
  
  // 组件卸载时清理
  onUnmounted(cleanup)
  
  return {
    // 数据
    values: readonly(formData),
    errors: readonly(errors),
    touched: readonly(touched),
    
    // 状态
    isValid,
    isDirty,
    isValidating,
    isSubmitting,
    hasErrors,
    errorMessages,
    
    // 方法
    setFieldValue,
    setValues,
    getFieldValue,
    validate,
    validateField: validateSingleField,
    reset,
    submit,
    saveForm,
    
    // 字段处理器工厂
    createFieldHandlers,
    
    // 便捷的字段绑定
    register: <K extends keyof T>(field: K) => ({
      modelValue: formData[field],
      'onUpdate:modelValue': (value: T[K]) => setFieldValue(field, value),
      error: errors.get(field),
      onBlur: () => {
        touched.add(field)
        if (options.validateOnBlur) {
          validateSingleField(field)
        }
      }
    })
  }
}

/**
 * 创建简单的表单模型（v-model支持）
 */
export function useTemplateModel<T extends Record<string, any>>(
  initialValue: T,
  options?: {
    autoSave?: boolean
    autoSaveDelay?: number
    onChange?: (value: T) => void
    onSave?: (value: T) => void | Promise<void>
  }
) {
  const model = ref<T>(initialValue)
  const original = ref<T>({ ...initialValue })
  const dirty = computed(() => JSON.stringify(model.value) !== JSON.stringify(original.value))
  
  let autoSaveTimer: ReturnType<typeof setTimeout> | null = null
  
  // 监听变化
  const stopWatching = watch(model, (newValue) => {
    options?.onChange?.(newValue)
    
    if (options?.autoSave) {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer)
      }
      
      autoSaveTimer = setTimeout(async () => {
        await options.onSave?.(newValue)
        original.value = { ...newValue }
      }, options.autoSaveDelay || 1000)
    }
  }, { deep: true })
  
  // 组件卸载时清理
  onUnmounted(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
      autoSaveTimer = null
    }
    stopWatching()
  })
  
  const reset = () => {
    model.value = { ...original.value }
  }
  
  const save = async () => {
    await options?.onSave?.(model.value)
    original.value = { ...model.value }
  }
  
  return {
    model,
    dirty,
    reset,
    save
  }
}