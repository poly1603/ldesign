/**
 * @ldesign/form - Vue useForm Composable
 * Vue 表单 Hook
 */

import { ref, reactive, computed, onUnmounted, shallowRef, watch, type Ref } from 'vue'
import { createForm, type FormCore } from '../../../core'
import type { FormOptions, FormValues, FormState } from '../../../utils/types'

/**
 * useForm Hook 返回类型
 */
export interface UseFormReturn {
  /** 表单实例 */
  form: FormCore
  /** 表单值（响应式） */
  values: Ref<FormValues>
  /** 表单状态（响应式） */
  state: Ref<FormState>
  /** 是否提交中 */
  submitting: Ref<boolean>
  /** 是否验证中 */
  validating: Ref<boolean>
  /** 是否有效 */
  valid: Ref<boolean>
  /** 是否脏数据 */
  dirty: Ref<boolean>
  /** 是否已触摸 */
  touched: Ref<boolean>
  /** 设置字段值 */
  setFieldValue: (field: string, value: any) => void
  /** 批量设置字段值 */
  setFieldsValue: (values: FormValues) => void
  /** 获取字段值 */
  getFieldValue: <T = any>(field: string) => T
  /** 获取所有字段值 */
  getFieldsValue: () => FormValues
  /** 验证字段 */
  validateField: (field: string) => Promise<boolean>
  /** 验证表单 */
  validate: () => Promise<boolean>
  /** 提交表单 */
  submit: () => Promise<void>
  /** 重置表单 */
  reset: () => void
  /** 切换展开/收起 */
  toggleExpand: () => void
  /** 是否展开 */
  isExpanded: Ref<boolean>
}

/**
 * useForm Hook
 * @param options 表单选项
 */
export function useForm(options: FormOptions = {}): UseFormReturn {
  // 创建表单实例（使用 shallowRef 避免深度响应式）
  const formInstance = shallowRef<FormCore>(createForm(options))

  // 响应式状态
  const values = ref<FormValues>(formInstance.value.getFieldsValue())
  const state = ref<FormState>(formInstance.value.getFormState())
  const isExpanded = ref(formInstance.value.isExpanded())

  // 计算属性
  const submitting = computed(() => state.value.submitting)
  const validating = computed(() => state.value.validating)
  const valid = computed(() => state.value.valid)
  const dirty = computed(() => state.value.dirty)
  const touched = computed(() => state.value.touched)

  // 监听数据变更
  const unsubscribeData = formInstance.value.on('data:change', event => {
    values.value = formInstance.value.getFieldsValue()
  })

  // 监听状态变更
  const unsubscribeState = formInstance.value.on('state:change', () => {
    state.value = formInstance.value.getFormState()
  })

  // 监听展开收起
  const unsubscribeExpand = formInstance.value.on('expand:change', event => {
    isExpanded.value = event.expanded
  })

  // 组件卸载时清理
  onUnmounted(() => {
    unsubscribeData()
    unsubscribeState()
    unsubscribeExpand()
    formInstance.value.destroy()
  })

  // 方法
  const setFieldValue = (field: string, value: any) => {
    formInstance.value.setFieldValue(field, value)
  }

  const setFieldsValue = (newValues: FormValues) => {
    formInstance.value.setFieldsValue(newValues)
  }

  const getFieldValue = <T = any>(field: string): T => {
    return formInstance.value.getFieldValue<T>(field)
  }

  const getFieldsValue = (): FormValues => {
    return formInstance.value.getFieldsValue()
  }

  const validateField = async (field: string): Promise<boolean> => {
    return formInstance.value.validateField(field)
  }

  const validate = async (): Promise<boolean> => {
    const result = await formInstance.value.validate()
    return result.valid
  }

  const submit = async (): Promise<void> => {
    await formInstance.value.submit()
  }

  const reset = (): void => {
    formInstance.value.reset()
  }

  const toggleExpand = (): void => {
    formInstance.value.toggleExpand()
  }

  return {
    form: formInstance.value,
    values,
    state,
    submitting,
    validating,
    valid,
    dirty,
    touched,
    setFieldValue,
    setFieldsValue,
    getFieldValue,
    getFieldsValue,
    validateField,
    validate,
    submit,
    reset,
    toggleExpand,
    isExpanded
  }
}




