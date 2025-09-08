/**
 * useFormContext Hook
 * 
 * 提供表单上下文访问的自定义Hook
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { computed } from 'vue'
import { injectFormContext, type FormManager } from '../core/form/manager'

/**
 * 表单上下文Hook
 * 
 * @returns 表单上下文管理器
 */
export function useFormContext<T = Record<string, any>>(): FormManager<T> | undefined {
  return injectFormContext<T>()
}

/**
 * 表单上下文Hook（必需版本）
 * 
 * 如果没有找到表单上下文，会抛出错误
 * 
 * @returns 表单上下文管理器
 */
export function useFormContextRequired<T = Record<string, any>>(): FormManager<T> {
  const formContext = injectFormContext<T>()
  
  if (!formContext) {
    throw new Error('useFormContextRequired must be used within a Form component')
  }
  
  return formContext
}

/**
 * 表单值Hook
 * 
 * 提供对表单值的响应式访问
 * 
 * @returns 表单值的计算属性
 */
export function useFormValues<T = Record<string, any>>() {
  const formContext = useFormContext<T>()
  
  return computed(() => formContext?.values.value || ({} as T))
}

/**
 * 表单错误Hook
 * 
 * 提供对表单错误的响应式访问
 * 
 * @returns 表单错误的计算属性
 */
export function useFormErrors() {
  const formContext = useFormContext()
  
  return computed(() => formContext?.errors.value || {})
}

/**
 * 表单状态Hook
 * 
 * 提供对表单状态的响应式访问
 * 
 * @returns 表单状态的计算属性
 */
export function useFormState() {
  const formContext = useFormContext()
  
  return computed(() => ({
    valid: formContext?.valid.value || true,
    submitting: formContext?.submitting.value || false,
    validating: formContext?.validating.value || false,
    dirty: formContext?.dirty.value || false,
  }))
}

/**
 * 字段值Hook
 * 
 * 提供对特定字段值的响应式访问
 * 
 * @param name 字段名称
 * @returns 字段值的计算属性
 */
export function useFieldValue(name: string) {
  const formContext = useFormContext()
  
  return computed({
    get: () => formContext?.getFieldValue(name),
    set: (value) => formContext?.setFieldValue(name, value),
  })
}

/**
 * 字段错误Hook
 * 
 * 提供对特定字段错误的响应式访问
 * 
 * @param name 字段名称
 * @returns 字段错误的计算属性
 */
export function useFieldError(name: string) {
  const formContext = useFormContext()
  
  return computed(() => formContext?.errors.value[name] || [])
}

/**
 * 字段状态Hook
 * 
 * 提供对特定字段状态的响应式访问
 * 
 * @param name 字段名称
 * @returns 字段状态的计算属性
 */
export function useFieldState(name: string) {
  const formContext = useFormContext()
  
  return computed(() => {
    if (!formContext) {
      return {
        hasError: false,
        touched: false,
        dirty: false,
      }
    }
    
    const errors = formContext.errors.value[name] || []
    const touched = formContext.state.value.touched[name] || false
    const dirty = formContext.state.value.dirty[name] || false
    
    return {
      hasError: errors.length > 0,
      touched,
      dirty,
    }
  })
}
