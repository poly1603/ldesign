/**
 * @ldesign/form - React useForm Hook
 * React 表单 Hook
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { createForm, type FormCore } from '../../../core'
import type { FormOptions, FormValues, FormState } from '../../../utils/types'

/**
 * useForm Hook 返回类型
 */
export interface UseFormReturn {
  /** 表单实例 */
  form: FormCore
  /** 表单值 */
  values: FormValues
  /** 表单状态 */
  state: FormState
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
  isExpanded: boolean
}

/**
 * useForm Hook
 * @param options 表单选项
 */
export function useForm(options: FormOptions = {}): UseFormReturn {
  // 使用 ref 存储表单实例（避免重新创建）
  const formRef = useRef<FormCore>()

  if (!formRef.current) {
    formRef.current = createForm(options)
  }

  const form = formRef.current

  // 状态
  const [values, setValues] = useState<FormValues>(form.getFieldsValue())
  const [state, setState] = useState<FormState>(form.getFormState())
  const [isExpanded, setIsExpanded] = useState(form.isExpanded())

  // 监听数据变更
  useEffect(() => {
    const unsubscribeData = form.on('data:change', () => {
      setValues(form.getFieldsValue())
    })

    const unsubscribeState = form.on('state:change', () => {
      setState(form.getFormState())
    })

    const unsubscribeExpand = form.on('expand:change', (event) => {
      setIsExpanded(event.expanded)
    })

    return () => {
      unsubscribeData()
      unsubscribeState()
      unsubscribeExpand()
    }
  }, [form])

  // 清理
  useEffect(() => {
    return () => {
      form.destroy()
    }
  }, [])

  // 方法（使用 useCallback 优化）
  const setFieldValue = useCallback((field: string, value: any) => {
    form.setFieldValue(field, value)
  }, [form])

  const setFieldsValue = useCallback((newValues: FormValues) => {
    form.setFieldsValue(newValues)
  }, [form])

  const getFieldValue = useCallback(<T = any>(field: string): T => {
    return form.getFieldValue<T>(field)
  }, [form])

  const getFieldsValue = useCallback((): FormValues => {
    return form.getFieldsValue()
  }, [form])

  const validateField = useCallback(async (field: string): Promise<boolean> => {
    return form.validateField(field)
  }, [form])

  const validate = useCallback(async (): Promise<boolean> => {
    const result = await form.validate()
    return result.valid
  }, [form])

  const submit = useCallback(async (): Promise<void> => {
    await form.submit()
  }, [form])

  const reset = useCallback((): void => {
    form.reset()
  }, [form])

  const toggleExpand = useCallback((): void => {
    form.toggleExpand()
  }, [form])

  return {
    form,
    values,
    state,
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




