/**
 * 表单验证 Hook
 * 
 * @description
 * 提供灵活的表单验证功能，支持同步和异步验证、自定义验证规则、
 * 字段依赖验证等高级功能。
 */

import { ref, reactive, computed, watch, type Ref, type ComputedRef } from 'vue'

/**
 * 验证规则类型
 */
export type ValidatorFunction<T = any> = (
  value: T,
  formData?: Record<string, any>
) => string | Promise<string> | true | Promise<true>

/**
 * 内置验证规则
 */
export interface BuiltInRules {
  /** 必填 */
  required?: boolean | string
  /** 最小长度 */
  minLength?: number | [number, string]
  /** 最大长度 */
  maxLength?: number | [number, string]
  /** 最小值 */
  min?: number | [number, string]
  /** 最大值 */
  max?: number | [number, string]
  /** 正则表达式 */
  pattern?: RegExp | [RegExp, string]
  /** 邮箱验证 */
  email?: boolean | string
  /** URL 验证 */
  url?: boolean | string
  /** 手机号验证 */
  phone?: boolean | string
  /** 身份证验证 */
  idCard?: boolean | string
}

/**
 * 验证规则配置
 */
export interface ValidationRule extends BuiltInRules {
  /** 自定义验证函数 */
  validator?: ValidatorFunction
  /** 依赖的字段 */
  dependencies?: string[]
  /** 验证触发时机 */
  trigger?: 'change' | 'blur' | 'submit'
}

/**
 * 字段验证配置
 */
export interface FieldValidationConfig {
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 是否立即验证 */
  immediate?: boolean
  /** 防抖延迟（毫秒） */
  debounce?: number
}

/**
 * 验证状态
 */
export interface ValidationState {
  /** 是否正在验证 */
  validating: boolean
  /** 错误消息 */
  error: string
  /** 是否已验证 */
  validated: boolean
  /** 是否有效 */
  valid: boolean
}

/**
 * 表单验证状态
 */
export interface FormValidationState {
  /** 字段验证状态 */
  fields: Record<string, ValidationState>
  /** 是否正在验证 */
  validating: boolean
  /** 是否有错误 */
  hasErrors: boolean
  /** 是否全部有效 */
  isValid: boolean
  /** 错误消息列表 */
  errors: string[]
}

/**
 * 内置验证器
 */
const builtInValidators = {
  required: (value: any, message?: string) => {
    if (value === undefined || value === null || value === '') {
      return message || '此字段为必填项'
    }
    return true
  },

  minLength: (value: any, min: number, message?: string) => {
    if (String(value).length < min) {
      return message || `最少需要${min}个字符`
    }
    return true
  },

  maxLength: (value: any, max: number, message?: string) => {
    if (String(value).length > max) {
      return message || `最多允许${max}个字符`
    }
    return true
  },

  min: (value: any, min: number, message?: string) => {
    if (Number(value) < min) {
      return message || `值不能小于${min}`
    }
    return true
  },

  max: (value: any, max: number, message?: string) => {
    if (Number(value) > max) {
      return message || `值不能大于${max}`
    }
    return true
  },

  pattern: (value: any, pattern: RegExp, message?: string) => {
    if (!pattern.test(String(value))) {
      return message || '格式不正确'
    }
    return true
  },

  email: (value: any, message?: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(String(value))) {
      return message || '邮箱格式不正确'
    }
    return true
  },

  url: (value: any, message?: string) => {
    try {
      new URL(String(value))
      return true
    } catch {
      return message || 'URL格式不正确'
    }
  },

  phone: (value: any, message?: string) => {
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(String(value))) {
      return message || '手机号格式不正确'
    }
    return true
  },

  idCard: (value: any, message?: string) => {
    const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    if (!idCardRegex.test(String(value))) {
      return message || '身份证号格式不正确'
    }
    return true
  },
}

/**
 * 表单验证 Hook
 * 
 * @param formData - 表单数据（响应式对象）
 * @param config - 验证配置
 * @returns 验证状态和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const formData = reactive({
 *       username: '',
 *       email: '',
 *       password: '',
 *       confirmPassword: ''
 *     })
 * 
 *     const { state, validate, validateField, clearErrors } = useFormValidation(formData, {
 *       username: {
 *         rules: [
 *           { required: true },
 *           { minLength: 3, maxLength: 20 },
 *           { pattern: [/^[a-zA-Z0-9_]+$/, '只能包含字母、数字和下划线'] }
 *         ],
 *         debounce: 300
 *       },
 *       email: {
 *         rules: [
 *           { required: true },
 *           { email: true }
 *         ]
 *       },
 *       password: {
 *         rules: [
 *           { required: true },
 *           { minLength: 6 }
 *         ]
 *       },
 *       confirmPassword: {
 *         rules: [
 *           { required: true },
 *           {
 *             validator: (value) => {
 *               if (value !== formData.password) {
 *                 return '两次密码输入不一致'
 *               }
 *               return true
 *             },
 *             dependencies: ['password']
 *           }
 *         ]
 *       }
 *     })
 * 
 *     return {
 *       formData,
 *       state,
 *       validate,
 *       validateField,
 *       clearErrors
 *     }
 *   }
 * })
 * ```
 */
export function useFormValidation<T extends Record<string, any>>(
  formData: T,
  config: Record<keyof T, FieldValidationConfig>
) {
  // 验证状态
  const validationStates = reactive<Record<string, ValidationState>>({})
  
  // 防抖定时器
  const debounceTimers = new Map<string, NodeJS.Timeout>()

  // 初始化验证状态
  for (const field in config) {
    validationStates[field] = {
      validating: false,
      error: '',
      validated: false,
      valid: true,
    }
  }

  /**
   * 执行单个验证规则
   */
  const executeRule = async (
    rule: ValidationRule,
    value: any,
    fieldName: string
  ): Promise<string | true> => {
    // 如果值为空且不是必填，跳过验证
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return true
    }

    // 内置验证规则
    for (const [ruleName, ruleValue] of Object.entries(rule)) {
      if (ruleName === 'validator' || ruleName === 'dependencies' || ruleName === 'trigger') {
        continue
      }

      const validator = builtInValidators[ruleName as keyof typeof builtInValidators]
      if (!validator || ruleValue === undefined) {
        continue
      }

      let result: string | true
      
      if (Array.isArray(ruleValue)) {
        // [value, message] 格式
        result = (validator as any)(value, ruleValue[0], ruleValue[1])
      } else if (typeof ruleValue === 'boolean' && ruleValue) {
        // boolean 格式
        result = (validator as any)(value)
      } else if (typeof ruleValue === 'string') {
        // 自定义消息格式
        result = (validator as any)(value, undefined, ruleValue)
      } else {
        // 直接传值格式
        result = (validator as any)(value, ruleValue)
      }

      if (result !== true) {
        return result
      }
    }

    // 自定义验证函数
    if (rule.validator) {
      return await rule.validator(value, formData)
    }

    return true
  }

  /**
   * 验证单个字段
   */
  const validateField = async (fieldName: keyof T): Promise<boolean> => {
    const fieldConfig = config[fieldName]
    const fieldState = validationStates[fieldName as string]
    
    if (!fieldConfig?.rules) {
      return true
    }

    fieldState.validating = true
    fieldState.error = ''

    try {
      const value = formData[fieldName]

      for (const rule of fieldConfig.rules) {
        const result = await executeRule(rule, value, fieldName as string)
        
        if (result !== true) {
          fieldState.error = result
          fieldState.valid = false
          break
        }
      }

      if (!fieldState.error) {
        fieldState.valid = true
      }
    } catch (error) {
      fieldState.error = '验证失败'
      fieldState.valid = false
    } finally {
      fieldState.validating = false
      fieldState.validated = true
    }

    return fieldState.valid
  }

  /**
   * 验证所有字段
   */
  const validate = async (): Promise<boolean> => {
    const validationPromises = Object.keys(config).map(field => 
      validateField(field as keyof T)
    )
    
    const results = await Promise.all(validationPromises)
    return results.every(result => result)
  }

  /**
   * 清除错误
   */
  const clearErrors = (fieldName?: keyof T) => {
    if (fieldName) {
      const fieldState = validationStates[fieldName as string]
      if (fieldState) {
        fieldState.error = ''
        fieldState.valid = true
        fieldState.validated = false
      }
    } else {
      for (const field in validationStates) {
        validationStates[field].error = ''
        validationStates[field].valid = true
        validationStates[field].validated = false
      }
    }
  }

  /**
   * 设置字段错误
   */
  const setFieldError = (fieldName: keyof T, error: string) => {
    const fieldState = validationStates[fieldName as string]
    if (fieldState) {
      fieldState.error = error
      fieldState.valid = false
      fieldState.validated = true
    }
  }

  // 监听表单数据变化
  for (const field in config) {
    const fieldConfig = config[field]
    
    watch(
      () => formData[field],
      (newValue) => {
        // 清除防抖定时器
        const timerId = debounceTimers.get(field)
        if (timerId) {
          clearTimeout(timerId)
        }

        // 如果配置了立即验证
        if (fieldConfig.immediate) {
          const debounceTime = fieldConfig.debounce || 0
          
          if (debounceTime > 0) {
            const newTimerId = setTimeout(() => {
              validateField(field as keyof T)
              debounceTimers.delete(field)
            }, debounceTime)
            debounceTimers.set(field, newTimerId)
          } else {
            validateField(field as keyof T)
          }
        }

        // 验证依赖此字段的其他字段
        for (const otherField in config) {
          const otherConfig = config[otherField]
          if (otherConfig.rules) {
            for (const rule of otherConfig.rules) {
              if (rule.dependencies?.includes(field)) {
                validateField(otherField as keyof T)
              }
            }
          }
        }
      }
    )
  }

  // 计算整体验证状态
  const state = computed<FormValidationState>(() => {
    const fields = validationStates
    const validating = Object.values(fields).some(field => field.validating)
    const hasErrors = Object.values(fields).some(field => field.error)
    const isValid = Object.values(fields).every(field => field.valid)
    const errors = Object.values(fields)
      .filter(field => field.error)
      .map(field => field.error)

    return {
      fields,
      validating,
      hasErrors,
      isValid,
      errors,
    }
  })

  return {
    state,
    validate,
    validateField,
    clearErrors,
    setFieldError,
  }
}
