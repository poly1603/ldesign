/**
 * @ldesign/form - Vue useField Composable
 * Vue 字段 Hook
 */

import { ref, computed, inject, watch, onUnmounted, type Ref } from 'vue'
import type { FormCore } from '../../../core'
import type { FieldState } from '../../../utils/types'

/**
 * 表单上下文注入 key
 */
export const FORM_INJECTION_KEY = Symbol('ldesign-form')

/**
 * useField Hook 返回类型
 */
export interface UseFieldReturn {
  /** 字段值 */
  value: Ref<any>
  /** 字段错误 */
  error: Ref<string | undefined>
  /** 字段错误列表 */
  errors: Ref<string[]>
  /** 是否触摸 */
  touched: Ref<boolean>
  /** 是否脏数据 */
  dirty: Ref<boolean>
  /** 是否验证中 */
  validating: Ref<boolean>
  /** 是否有效 */
  valid: Ref<boolean>
  /** 字段状态 */
  fieldState: Ref<FieldState | undefined>
  /** 设置值 */
  setValue: (value: any) => void
  /** 处理变更 */
  onChange: (value: any) => void
  /** 处理失焦 */
  onBlur: () => void
  /** 处理聚焦 */
  onFocus: () => void
  /** 验证字段 */
  validate: () => Promise<boolean>
}

/**
 * useField Hook
 * @param name 字段名
 */
export function useField(name: string | Ref<string>): UseFieldReturn {
  // 注入表单实例
  const form = inject<FormCore>(FORM_INJECTION_KEY)
  if (!form) {
    throw new Error('useField must be used within a Form component or provide form instance')
  }

  // 字段名（支持响应式）
  const fieldName = computed(() => (typeof name === 'string' ? name : name.value))

  // 响应式状态
  const fieldState = ref<FieldState | undefined>(form.getFieldState(fieldName.value))
  const value = ref(form.getFieldValue(fieldName.value))

  // 计算属性
  const error = computed(() => fieldState.value?.errors[0])
  const errors = computed(() => fieldState.value?.errors || [])
  const touched = computed(() => fieldState.value?.touched || false)
  const dirty = computed(() => fieldState.value?.dirty || false)
  const validating = computed(() => fieldState.value?.validating || false)
  const valid = computed(() => fieldState.value?.valid || true)

  // 更新字段状态
  const updateFieldState = () => {
    fieldState.value = form.getFieldState(fieldName.value)
  }

  // 监听字段变更
  const unsubscribeChange = form.on('field:change', event => {
    if (event.field === fieldName.value) {
      value.value = event.value
      updateFieldState()
    }
  })

  // 监听状态变更
  const unsubscribeState = form.on('state:change', event => {
    if (event.type === 'field' && event.field === fieldName.value) {
      updateFieldState()
    }
  })

  // 监听重置事件
  const unsubscribeReset = form.on('reset', () => {
    value.value = form.getFieldValue(fieldName.value)
    updateFieldState()
  })

  // 组件卸载时清理
  onUnmounted(() => {
    unsubscribeChange()
    unsubscribeState()
    unsubscribeReset()
  })

  // 方法
  const setValue = (newValue: any) => {
    form.setFieldValue(fieldName.value, newValue)
  }

  const onChange = (newValue: any) => {
    setValue(newValue)
  }

  const onBlur = () => {
    form.handleFieldBlur(fieldName.value)
  }

  const onFocus = () => {
    form.handleFieldFocus(fieldName.value)
  }

  const validate = async (): Promise<boolean> => {
    return form.validateField(fieldName.value)
  }

  return {
    value,
    error,
    errors,
    touched,
    dirty,
    validating,
    valid,
    fieldState,
    setValue,
    onChange,
    onBlur,
    onFocus,
    validate
  }
}




