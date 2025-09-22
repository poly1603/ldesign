/**
 * 异步验证器 Hook
 * 
 * @description
 * 提供异步验证功能，支持远程验证、防抖、取消请求等功能。
 * 适用于用户名唯一性检查、邮箱验证等需要服务器验证的场景。
 */

import { ref, computed, watch, onUnmounted, getCurrentInstance, type Ref, type ComputedRef } from 'vue'

/**
 * 异步验证函数类型
 */
export type AsyncValidatorFunction<T = any> = (
  value: T,
  signal?: AbortSignal
) => Promise<string | true>

/**
 * 异步验证配置
 */
export interface AsyncValidatorConfig<T = any> {
  /** 验证函数 */
  validator: AsyncValidatorFunction<T>
  /** 防抖延迟（毫秒），默认 300 */
  debounce?: number
  /** 是否立即验证 */
  immediate?: boolean
  /** 验证前的预检查函数 */
  preCheck?: (value: T) => boolean
  /** 成功消息 */
  successMessage?: string
}

/**
 * 异步验证状态
 */
export interface AsyncValidationState {
  /** 是否正在验证 */
  validating: boolean
  /** 错误消息 */
  error: string
  /** 成功消息 */
  success: string
  /** 是否已验证 */
  validated: boolean
  /** 是否有效 */
  valid: boolean
  /** 最后验证的值 */
  lastValidatedValue: any
}

/**
 * 异步验证器 Hook
 * 
 * @param value - 要验证的响应式值
 * @param config - 验证配置
 * @returns 验证状态和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const username = ref('')
 *     
 *     // 用户名唯一性验证
 *     const usernameValidation = useAsyncValidator(username, {
 *       validator: async (value, signal) => {
 *         if (!value) return true
 *         
 *         try {
 *           const response = await fetch(`/api/check-username?username=${value}`, {
 *             signal
 *           })
 *           const result = await response.json()
 *           
 *           if (!result.available) {
 *             return '用户名已被占用'
 *           }
 *           
 *           return true
 *         } catch (error) {
 *           if (error.name === 'AbortError') {
 *             throw error // 重新抛出取消错误
 *           }
 *           return '验证失败，请重试'
 *         }
 *       },
 *       debounce: 500,
 *       preCheck: (value) => value.length >= 3,
 *       successMessage: '用户名可用'
 *     })
 *     
 *     const email = ref('')
 *     
 *     // 邮箱验证
 *     const emailValidation = useAsyncValidator(email, {
 *       validator: async (value) => {
 *         if (!value) return true
 *         
 *         const response = await fetch('/api/validate-email', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify({ email: value })
 *         })
 *         
 *         const result = await response.json()
 *         return result.valid ? true : result.message
 *       },
 *       debounce: 300
 *     })
 *     
 *     return {
 *       username,
 *       usernameValidation,
 *       email,
 *       emailValidation
 *     }
 *   }
 * })
 * ```
 */
export function useAsyncValidator<T>(
  value: Ref<T>,
  config: AsyncValidatorConfig<T>
) {
  const validating = ref(false)
  const error = ref('')
  const success = ref('')
  const validated = ref(false)
  const lastValidatedValue = ref<T>()
  
  let debounceTimer: NodeJS.Timeout | null = null
  let abortController: AbortController | null = null

  /**
   * 执行验证
   */
  const validate = async (currentValue: T): Promise<boolean> => {
    // 预检查
    if (config.preCheck && !config.preCheck(currentValue)) {
      return true
    }

    // 取消之前的请求
    if (abortController) {
      abortController.abort()
    }

    // 创建新的 AbortController
    abortController = new AbortController()

    validating.value = true
    error.value = ''
    success.value = ''

    try {
      const result = await config.validator(currentValue, abortController.signal)
      
      // 检查请求是否被取消
      if (abortController.signal.aborted) {
        return false
      }

      if (result === true) {
        success.value = config.successMessage || ''
        lastValidatedValue.value = currentValue
        validated.value = true
        return true
      } else {
        error.value = result
        validated.value = true
        return false
      }
    } catch (err) {
      // 如果是取消错误，不处理
      if (err instanceof Error && err.name === 'AbortError') {
        return false
      }
      
      error.value = '验证失败'
      validated.value = true
      return false
    } finally {
      validating.value = false
      abortController = null
    }
  }

  /**
   * 手动触发验证
   */
  const trigger = async (): Promise<boolean> => {
    return validate(value.value)
  }

  /**
   * 清除验证状态
   */
  const clear = () => {
    // 取消正在进行的请求
    if (abortController) {
      abortController.abort()
      abortController = null
    }

    // 清除防抖定时器
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }

    validating.value = false
    error.value = ''
    success.value = ''
    validated.value = false
    lastValidatedValue.value = undefined
  }

  /**
   * 重置验证状态
   */
  const reset = () => {
    clear()
  }

  // 监听值变化
  watch(
    value,
    (newValue) => {
      // 如果值没有变化，不需要重新验证
      if (newValue === lastValidatedValue.value) {
        return
      }

      // 清除之前的状态
      error.value = ''
      success.value = ''
      validated.value = false

      // 取消之前的请求
      if (abortController) {
        abortController.abort()
        abortController = null
      }

      // 清除防抖定时器
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }

      // 设置新的防抖定时器
      const debounceTime = config.debounce ?? 300
      debounceTimer = setTimeout(() => {
        validate(newValue)
        debounceTimer = null
      }, debounceTime)
    },
    { immediate: config.immediate }
  )

  // 组件卸载时清理（仅在组件实例存在时）
  if (getCurrentInstance()) {
    onUnmounted(() => {
      clear()
    })
  }

  // 计算验证状态
  const state = computed<AsyncValidationState>(() => ({
    validating: validating.value,
    error: error.value,
    success: success.value,
    validated: validated.value,
    valid: validated.value && !error.value,
    lastValidatedValue: lastValidatedValue.value,
  }))

  return {
    state,
    trigger,
    clear,
    reset,
  }
}

/**
 * 多字段异步验证器 Hook
 * 
 * @param validators - 验证器配置对象
 * @returns 验证状态和方法
 * 
 * @example
 * ```typescript
 * export default defineComponent({
 *   setup() {
 *     const formData = reactive({
 *       username: '',
 *       email: ''
 *     })
 *     
 *     const { states, triggerAll, clearAll } = useMultiAsyncValidator({
 *       username: {
 *         value: () => formData.username,
 *         validator: async (value) => {
 *           // 验证用户名
 *           return true
 *         }
 *       },
 *       email: {
 *         value: () => formData.email,
 *         validator: async (value) => {
 *           // 验证邮箱
 *           return true
 *         }
 *       }
 *     })
 *     
 *     return {
 *       formData,
 *       states,
 *       triggerAll,
 *       clearAll
 *     }
 *   }
 * })
 * ```
 */
export function useMultiAsyncValidator<T extends Record<string, any>>(
  validators: {
    [K in keyof T]: {
      value: () => T[K]
      validator: AsyncValidatorFunction<T[K]>
      debounce?: number
      immediate?: boolean
      preCheck?: (value: T[K]) => boolean
      successMessage?: string
    }
  }
) {
  const validatorInstances = {} as {
    [K in keyof T]: ReturnType<typeof useAsyncValidator>
  }

  // 创建各个字段的验证器
  for (const field in validators) {
    const config = validators[field]
    const valueRef = computed(() => config.value())
    
    validatorInstances[field] = useAsyncValidator(valueRef, {
      validator: config.validator,
      debounce: config.debounce,
      immediate: config.immediate,
      preCheck: config.preCheck,
      successMessage: config.successMessage,
    })
  }

  // 计算整体状态
  const states = computed(() => {
    const result = {} as { [K in keyof T]: AsyncValidationState }
    
    for (const field in validatorInstances) {
      result[field] = validatorInstances[field].state.value
    }
    
    return result
  })

  // 整体验证状态
  const overallState = computed(() => {
    const allStates = Object.values(validatorInstances).map(v => v.state.value)
    
    return {
      validating: allStates.some(s => s.validating),
      hasErrors: allStates.some(s => s.error),
      allValid: allStates.every(s => s.valid),
      allValidated: allStates.every(s => s.validated),
    }
  })

  /**
   * 触发所有字段验证
   */
  const triggerAll = async (): Promise<boolean> => {
    const promises = Object.values(validatorInstances).map(v => v.trigger())
    const results = await Promise.all(promises)
    return results.every(result => result)
  }

  /**
   * 清除所有验证状态
   */
  const clearAll = () => {
    Object.values(validatorInstances).forEach(v => v.clear())
  }

  /**
   * 重置所有验证状态
   */
  const resetAll = () => {
    Object.values(validatorInstances).forEach(v => v.reset())
  }

  return {
    states,
    overallState,
    triggerAll,
    clearAll,
    resetAll,
    validators: validatorInstances,
  }
}
