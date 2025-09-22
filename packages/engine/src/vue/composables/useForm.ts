import { computed, reactive, ref, type Ref } from 'vue'
import { useEngine } from './useEngine'

/**
 * 表单字段配置接口
 */
export interface FormField<T = any> {
  value: T
  rules?: ValidationRule[]
  touched?: boolean
  dirty?: boolean
  error?: string | null
}

/**
 * 验证规则接口
 */
export interface ValidationRule {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (value: any) => boolean | string | Promise<boolean | string>
  message?: string
}

/**
 * 表单状态接口
 */
export interface FormState<T extends Record<string, any>> {
  values: T
  errors: Record<keyof T, string | null>
  touched: Record<keyof T, boolean>
  dirty: Record<keyof T, boolean>
  valid: boolean
  submitting: boolean
}

/**
 * 表单管理组合式函数
 *
 * @param initialValues 初始值
 * @param validationRules 验证规则
 * @returns 表单管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useForm } from '@ldesign/engine'
 *
 * const { values, errors, touched, setFieldValue, validate, handleSubmit, reset } = useForm({
 *   username: '',
 *   email: '',
 *   password: ''
 * }, {
 *   username: [
 *     { required: true, message: '用户名不能为空' },
 *     { min: 3, message: '用户名至少3个字符' }
 *   ],
 *   email: [
 *     { required: true, message: '邮箱不能为空' },
 *     { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
 *   ],
 *   password: [
 *     { required: true, message: '密码不能为空' },
 *     { min: 6, message: '密码至少6个字符' }
 *   ]
 * })
 *
 * const onSubmit = handleSubmit(async (values) => {
 *   console.log('提交数据:', values)
 *   // 提交逻辑
 * })
 * </script>
 *
 * <template>
 *   <form @submit.prevent="onSubmit">
 *     <div>
 *       <input
 *         v-model="values.username"
 *         @blur="() => setFieldTouched('username', true)"
 *         placeholder="用户名"
 *       />
 *       <span v-if="touched.username && errors.username" class="error">
 *         {{ errors.username }}
 *       </span>
 *     </div>
 *
 *     <div>
 *       <input
 *         v-model="values.email"
 *         @blur="() => setFieldTouched('email', true)"
 *         placeholder="邮箱"
 *       />
 *       <span v-if="touched.email && errors.email" class="error">
 *         {{ errors.email }}
 *       </span>
 *     </div>
 *
 *     <div>
 *       <input
 *         v-model="values.password"
 *         @blur="() => setFieldTouched('password', true)"
 *         type="password"
 *         placeholder="密码"
 *       />
 *       <span v-if="touched.password && errors.password" class="error">
 *         {{ errors.password }}
 *       </span>
 *     </div>
 *
 *     <button type="submit" :disabled="!valid">提交</button>
 *   </form>
 * </template>
 * ```
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Partial<Record<keyof T, ValidationRule[]>> = {}
) {
  const engine = useEngine()

  // 表单状态
  const values = reactive<T>({ ...initialValues })
  const errors = reactive({} as Record<keyof T, string | null>)
  const touched = reactive({} as Record<keyof T, boolean>)
  const dirty = reactive({} as Record<keyof T, boolean>)
  const submitting = ref(false)

  // 初始化状态
  Object.keys(initialValues).forEach(key => {
    const fieldKey = key as keyof T
    ;(errors as any)[fieldKey] = null
    ;(touched as any)[fieldKey] = false
    ;(dirty as any)[fieldKey] = false
  })

  // 验证单个字段
  const validateField = async (fieldName: keyof T): Promise<string | null> => {
    const value = (values as any)[fieldName]
    const rules = validationRules[fieldName] || []

    for (const rule of rules) {
      // 必填验证
      if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return rule.message || `${String(fieldName)} is required`
      }

      // 跳过空值的其他验证（除非是必填）
      if (!value && !rule.required) {
        continue
      }

      // 最小长度验证
      if (rule.min && typeof value === 'string' && value.length < rule.min) {
        return rule.message || `${String(fieldName)} must be at least ${rule.min} characters`
      }

      // 最大长度验证
      if (rule.max && typeof value === 'string' && value.length > rule.max) {
        return rule.message || `${String(fieldName)} must be at most ${rule.max} characters`
      }

      // 正则验证
      if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
        return rule.message || `${String(fieldName)} format is invalid`
      }

      // 自定义验证器
      if (rule.validator) {
        try {
          const result = await rule.validator(value)
          if (result === false) {
            return rule.message || `${String(fieldName)} is invalid`
          }
          if (typeof result === 'string') {
            return result
          }
        } catch (error) {
          return rule.message || `${String(fieldName)} validation failed`
        }
      }
    }

    return null
  }

  // 验证所有字段
  const validate = async (): Promise<boolean> => {
    const fieldNames = Object.keys(values) as (keyof T)[]
    const validationPromises = fieldNames.map(async fieldName => {
      const error = await validateField(fieldName)
      ;(errors as any)[fieldName] = error
      return error === null
    })

    const results = await Promise.all(validationPromises)
    return results.every(result => result)
  }

  // 设置字段值
  const setFieldValue = (fieldName: keyof T, value: T[keyof T]) => {
    ;(values as any)[fieldName] = value
    ;(dirty as any)[fieldName] = true

    // 如果字段已被触摸，立即验证
    if ((touched as any)[fieldName]) {
      validateField(fieldName).then(error => {
        ;(errors as any)[fieldName] = error
      })
    }
  }

  // 设置字段触摸状态
  const setFieldTouched = (fieldName: keyof T, isTouched = true) => {
    ;(touched as any)[fieldName] = isTouched

    if (isTouched) {
      validateField(fieldName).then(error => {
        ;(errors as any)[fieldName] = error
      })
    }
  }

  // 设置字段错误
  const setFieldError = (fieldName: keyof T, error: string | null) => {
    ;(errors as any)[fieldName] = error
  }

  // 重置表单
  const reset = () => {
    Object.keys(initialValues).forEach(key => {
      const fieldName = key as keyof T
      ;(values as any)[fieldName] = initialValues[fieldName]
      ;(errors as any)[fieldName] = null
      ;(touched as any)[fieldName] = false
      ;(dirty as any)[fieldName] = false
    })
    submitting.value = false
  }

  // 处理提交
  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => {
    return async (event?: Event) => {
      event?.preventDefault()

      submitting.value = true

      try {
        // 标记所有字段为已触摸
        Object.keys(values).forEach(key => {
          ;(touched as any)[key as keyof T] = true
        })

        // 验证表单
        const isValid = await validate()

        if (isValid) {
          await onSubmit({ ...values } as T)
        } else {
          if (engine.notifications && typeof engine.notifications.show === 'function') {
            try {
              engine.notifications.show('请检查表单错误' as any)
            } catch {
              console.warn('请检查表单错误')
            }
          }
        }
      } catch (error) {
        if (engine.notifications && typeof engine.notifications.show === 'function') {
          try {
            engine.notifications.show('提交失败' as any)
          } catch {
            console.warn('提交失败')
          }
        }
        engine.errors?.captureError(error as Error)
      } finally {
        submitting.value = false
      }
    }
  }

  // 计算属性
  const valid = computed(() => {
    return Object.values(errors).every(error => error === null)
  })

  const hasErrors = computed(() => {
    return Object.values(errors).some(error => error !== null)
  })

  const isDirty = computed(() => {
    return Object.values(dirty).some(isDirty => isDirty)
  })

  const isTouched = computed(() => {
    return Object.values(touched).some(isTouched => isTouched)
  })

  return {
    values,
    errors: computed(() => errors),
    touched: computed(() => touched),
    dirty: computed(() => dirty),
    submitting: computed(() => submitting.value),
    valid,
    hasErrors,
    isDirty,
    isTouched,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    validateField,
    validate,
    handleSubmit,
    reset
  }
}

/**
 * 表单字段组合式函数
 *
 * @param name 字段名
 * @param initialValue 初始值
 * @param rules 验证规则
 * @returns 字段管理工具
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFormField } from '@ldesign/engine'
 *
 * const { value, error, touched, setValue, setTouched, validate } = useFormField(
 *   'email',
 *   '',
 *   [
 *     { required: true, message: '邮箱不能为空' },
 *     { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' }
 *   ]
 * )
 * </script>
 *
 * <template>
 *   <div>
 *     <input
 *       :value="value"
 *       @input="setValue($event.target.value)"
 *       @blur="setTouched(true)"
 *       placeholder="邮箱"
 *     />
 *     <span v-if="touched && error" class="error">{{ error }}</span>
 *   </div>
 * </template>
 * ```
 */
export function useFormField<T>(
  name: string,
  initialValue: T,
  rules: ValidationRule[] = []
): {
  value: Ref<T>
  error: Ref<string | null>
  touched: Ref<boolean>
  setValue: (newValue: T) => void
  setTouched: (isTouched: boolean) => void
  validate: () => boolean | Promise<boolean>
  reset: () => void
} {
  const value = ref<T>(initialValue)
  const error = ref<string | null>(null)
  const touched = ref(false)
  const dirty = ref(false)

  // 验证字段
  const validate = async (): Promise<boolean> => {
    for (const rule of rules) {
      // 必填验证
      if (rule.required && (!value.value || (typeof value.value === 'string' && value.value.trim() === ''))) {
        error.value = rule.message || `${name} is required`
        return false
      }

      // 跳过空值的其他验证（除非是必填）
      if (!value.value && !rule.required) {
        continue
      }

      // 最小长度验证
      if (rule.min && typeof value.value === 'string' && value.value.length < rule.min) {
        error.value = rule.message || `${name} must be at least ${rule.min} characters`
        return false
      }

      // 最大长度验证
      if (rule.max && typeof value.value === 'string' && value.value.length > rule.max) {
        error.value = rule.message || `${name} must be at most ${rule.max} characters`
        return false
      }

      // 正则验证
      if (rule.pattern && typeof value.value === 'string' && !rule.pattern.test(value.value)) {
        error.value = rule.message || `${name} format is invalid`
        return false
      }

      // 自定义验证器
      if (rule.validator) {
        try {
          const result = await rule.validator(value.value)
          if (result === false) {
            error.value = rule.message || `${name} is invalid`
            return false
          }
          if (typeof result === 'string') {
            error.value = result
            return false
          }
        } catch {
          error.value = rule.message || `${name} validation failed`
          return false
        }
      }
    }

    error.value = null
    return true
  }

  // 设置值
  const setValue = (newValue: T) => {
    value.value = newValue
    dirty.value = true

    // 如果已触摸，立即验证
    if (touched.value) {
      validate()
    }
  }

  // 设置触摸状态
  const setTouched = (isTouched = true) => {
    touched.value = isTouched

    if (isTouched) {
      validate()
    }
  }

  // 重置字段
  const reset = () => {
    value.value = initialValue
    error.value = null
    touched.value = false
    dirty.value = false
  }

  return {
    value: value as Ref<T>,
    error: computed(() => error.value) as Ref<string | null>,
    touched: computed(() => touched.value),
    setValue,
    setTouched,
    validate,
    reset
  }
}
