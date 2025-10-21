/**
 * @ldesign/form - React useField Hook
 * React 字段 Hook
 */

import { useState, useEffect, useCallback, useContext } from 'react'
import { FormContext } from '../context'
import type { FieldState } from '../../../utils/types'

/**
 * useField Hook 返回类型
 */
export interface UseFieldReturn {
  /** 字段值 */
  value: any
  /** 字段错误 */
  error?: string
  /** 字段错误列表 */
  errors: string[]
  /** 是否触摸 */
  touched: boolean
  /** 是否脏数据 */
  dirty: boolean
  /** 是否验证中 */
  validating: boolean
  /** 是否有效 */
  valid: boolean
  /** 字段状态 */
  fieldState?: FieldState
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
export function useField(name: string): UseFieldReturn {
  // 获取表单实例
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('useField must be used within a FormProvider')
  }

  // 状态
  const [fieldState, setFieldState] = useState<FieldState | undefined>(
    form.getFieldState(name)
  )
  const [value, setValue] = useState(form.getFieldValue(name))

  // 监听字段变更
  useEffect(() => {
    const updateFieldState = () => {
      setFieldState(form.getFieldState(name))
    }

    const unsubscribeChange = form.on('field:change', (event) => {
      if (event.field === name) {
        setValue(event.value)
        updateFieldState()
      }
    })

    const unsubscribeState = form.on('state:change', (event) => {
      if (event.type === 'field' && event.field === name) {
        updateFieldState()
      }
    })

    const unsubscribeReset = form.on('reset', () => {
      setValue(form.getFieldValue(name))
      updateFieldState()
    })

    return () => {
      unsubscribeChange()
      unsubscribeState()
      unsubscribeReset()
    }
  }, [form, name])

  // 方法
  const handleSetValue = useCallback((newValue: any) => {
    form.setFieldValue(name, newValue)
  }, [form, name])

  const handleChange = useCallback((newValue: any) => {
    handleSetValue(newValue)
  }, [handleSetValue])

  const handleBlur = useCallback(() => {
    form.handleFieldBlur(name)
  }, [form, name])

  const handleFocus = useCallback(() => {
    form.handleFieldFocus(name)
  }, [form, name])

  const handleValidate = useCallback(async (): Promise<boolean> => {
    return form.validateField(name)
  }, [form, name])

  return {
    value,
    error: fieldState?.errors[0],
    errors: fieldState?.errors || [],
    touched: fieldState?.touched || false,
    dirty: fieldState?.dirty || false,
    validating: fieldState?.validating || false,
    valid: fieldState?.valid || true,
    fieldState,
    setValue: handleSetValue,
    onChange: handleChange,
    onBlur: handleBlur,
    onFocus: handleFocus,
    validate: handleValidate
  }
}




