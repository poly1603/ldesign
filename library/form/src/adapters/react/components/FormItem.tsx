/**
 * @ldesign/form - React FormItem Component
 * React 表单项组件
 */

import React, { useContext, useState, useEffect, type CSSProperties, type ReactNode } from 'react'
import { FormContext } from '../context'
import type { ValidationRule, FieldSpan } from '../../../utils/types'

/**
 * FormItem 组件 Props
 */
export interface FormItemProps {
  /** 字段名 */
  name: string
  /** 标签 */
  label?: string
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 占用列数 */
  span?: FieldSpan
  /** 提示信息 */
  tooltip?: string
  /** 帮助文本 */
  help?: string
  /** 是否显示错误 */
  showError?: boolean
  /** 标签宽度 */
  labelWidth?: number | string
  /** 标签对齐 */
  labelAlign?: 'left' | 'right' | 'top'
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 类名 */
  className?: string
  /** 样式 */
  style?: CSSProperties
  /** 子元素 */
  children?: ReactNode
}

/**
 * FormItem 组件
 */
export function FormItem(props: FormItemProps) {
  const {
    name,
    label,
    required = false,
    rules = [],
    span = 1,
    tooltip,
    help,
    showError = true,
    labelWidth,
    labelAlign,
    disabled = false,
    readonly = false,
    className = '',
    style = {},
    children
  } = props

  const form = useContext(FormContext)
  const [error, setError] = useState<string>()
  const [touched, setTouched] = useState(false)
  const [validating, setValidating] = useState(false)

  // 更新字段状态
  const updateFieldState = () => {
    if (!form) return

    const state = form.getFieldState(name)
    if (state) {
      setError(state.errors[0])
      setTouched(state.touched)
      setValidating(state.validating)
    }
  }

  // 监听字段变更
  useEffect(() => {
    if (!form) return

    const unsubscribeChange = form.on('field:change', (event) => {
      if (event.field === name) {
        updateFieldState()
      }
    })

    const unsubscribeState = form.on('state:change', (event) => {
      if (event.type === 'field' && event.field === name) {
        updateFieldState()
      }
    })

    updateFieldState()

    return () => {
      unsubscribeChange()
      unsubscribeState()
    }
  }, [form, name])

  const computedRequired = required || rules.some(rule => rule.type === 'required')

  const formItemClasses = [
    'ldesign-form-item',
    error && touched ? 'ldesign-form-item--error' : '',
    validating ? 'ldesign-form-item--validating' : '',
    disabled ? 'ldesign-form-item--disabled' : '',
    readonly ? 'ldesign-form-item--readonly' : '',
    labelAlign ? `ldesign-form-item--label-${labelAlign}` : '',
    className
  ].filter(Boolean).join(' ')

  const formItemStyles: CSSProperties = {
    ...style
  }

  if (typeof span === 'number') {
    formItemStyles.gridColumn = `span ${span}`
  } else if (typeof span === 'string') {
    if (span === '-1' || span === '100%') {
      formItemStyles.gridColumn = '1 / -1'
    }
  }

  const labelClasses = [
    'ldesign-form-item__label',
    labelAlign ? `ldesign-form-item__label--${labelAlign}` : ''
  ].filter(Boolean).join(' ')

  const labelStyles: CSSProperties = {}
  if (labelWidth) {
    labelStyles.width = typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth
  }

  return (
    <div className={formItemClasses} style={formItemStyles}>
      {(label || tooltip) && (
        <div className={labelClasses} style={labelStyles}>
          {computedRequired && <span className="ldesign-form-item__required">*</span>}
          {label && <label htmlFor={name}>{label}</label>}
          {tooltip && (
            <span className="ldesign-form-item__tooltip" title={tooltip}>
              ?
            </span>
          )}
        </div>
      )}

      <div className="ldesign-form-item__content">
        <div className="ldesign-form-item__control">
          {children}
        </div>

        {showError && error && touched && (
          <div className="ldesign-form-item__error">{error}</div>
        )}

        {help && <div className="ldesign-form-item__help">{help}</div>}
      </div>
    </div>
  )
}



