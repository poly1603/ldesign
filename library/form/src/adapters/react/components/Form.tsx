/**
 * @ldesign/form - React Form Component
 * React 表单组件
 */

import React, { useRef, useEffect, useState, type CSSProperties } from 'react'
import { createForm, type FormCore } from '../../../core'
import type { FormOptions, FormValues } from '../../../utils/types'
import { FormProvider } from '../context'

/**
 * Form 组件 Props
 */
export interface FormProps extends FormOptions {
  /** 表单实例（外部传入） */
  form?: FormCore
  /** 表单类名 */
  className?: string
  /** 表单样式 */
  style?: CSSProperties
  /** 子元素 */
  children?: React.ReactNode
  
  // 布局配置
  spanWidth?: number
  maxSpan?: number
  minSpan?: number
  space?: number
  gap?: number
  labelAlign?: 'left' | 'right' | 'top'
  
  // 展开收起
  previewRows?: number
  expandMode?: 'visible' | 'popup'
  collapsible?: boolean
  
  // 按钮配置
  buttonPosition?: 'inline' | 'block'
  buttonAlign?: 'left' | 'center' | 'right'
  buttonSpan?: number
  showSubmit?: boolean
  submitText?: string
  showReset?: boolean
  resetText?: string
  showExpand?: boolean
  expandText?: string
  collapseText?: string
  
  // 事件
  onSubmit?: (values: FormValues) => void | Promise<void>
  onReset?: () => void
  onChange?: (field: string, value: any, values: FormValues) => void
  onExpandChange?: (expanded: boolean) => void
}

/**
 * Form 组件
 */
export function Form(props: FormProps) {
  const {
    form: externalForm,
    className = '',
    style = {},
    children,
    spanWidth = 200,
    maxSpan = 4,
    minSpan = 1,
    space = 16,
    gap = 8,
    labelAlign = 'right',
    previewRows = 1,
    expandMode = 'visible',
    collapsible = false,
    buttonPosition = 'inline',
    buttonAlign = 'right',
    buttonSpan = 1,
    showSubmit = true,
    submitText = '查询',
    showReset = true,
    resetText = '重置',
    showExpand = true,
    expandText = '展开',
    collapseText = '收起',
    onSubmit,
    onReset,
    onChange,
    onExpandChange,
    ...restOptions
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const formInstanceRef = useRef<FormCore>()
  const [expanded, setExpanded] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // 创建或使用外部表单实例
  if (!formInstanceRef.current) {
    formInstanceRef.current = externalForm || createForm({
      ...restOptions,
      layout: {
        spanWidth,
        maxSpan,
        minSpan,
        space,
        gap,
        labelAlign,
        ...restOptions.layout
      },
      expand: {
        previewRows,
        expandMode,
        defaultExpanded: !collapsible,
        expandText,
        collapseText,
        ...restOptions.expand
      },
      button: {
        buttonPosition,
        buttonAlign,
        buttonSpan,
        showSubmit,
        submitText,
        showReset,
        resetText,
        showExpand,
        ...restOptions.button
      },
      onSubmit,
      onReset,
      onChange,
      onExpandChange: (exp) => {
        setExpanded(exp)
        onExpandChange?.(exp)
      }
    })
  }

  const formInstance = formInstanceRef.current

  // 监听状态变更
  useEffect(() => {
    const unsubscribe = formInstance.on('state:change', (event) => {
      if (event.type === 'form') {
        const state = event.state as any
        setSubmitting(state.submitting)
      }
    })

    const unsubscribeExpand = formInstance.on('expand:change', (event) => {
      setExpanded(event.expanded)
    })

    return () => {
      unsubscribe()
      unsubscribeExpand()
    }
  }, [formInstance])

  // 初始化布局引擎
  useEffect(() => {
    if (containerRef.current) {
      formInstance.getLayoutEngine().init(containerRef.current)
    }
  }, [formInstance])

  // 清理
  useEffect(() => {
    return () => {
      if (!externalForm) {
        formInstance.destroy()
      }
    }
  }, [])

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await formInstance.submit()
  }

  // 处理重置
  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    formInstance.reset()
  }

  // 处理展开收起
  const handleToggleExpand = () => {
    formInstance.toggleExpand()
  }

  const formClasses = [
    'ldesign-form',
    `ldesign-form--label-${labelAlign}`,
    className
  ].filter(Boolean).join(' ')

  const containerStyles: CSSProperties = {
    display: 'grid',
    gap: `${space}px`,
    ...style,
    ['--form-space' as any]: `${space}px`,
    ['--form-gap' as any]: `${gap}px`
  }

  const showButtons = showSubmit || showReset || (showExpand && collapsible)

  const buttonClasses = [
    'ldesign-form__buttons',
    `ldesign-form__buttons--${buttonPosition}`,
    `ldesign-form__buttons--${buttonAlign}`
  ].join(' ')

  const layout = formInstance.getLayoutEngine()
  const columns = layout.getColumns()

  const buttonStyles: CSSProperties = {
    gridColumn: buttonPosition === 'block' ? `span ${columns}` : `span ${buttonSpan}`
  }

  return (
    <FormProvider form={formInstance}>
      <form className={formClasses} onSubmit={handleSubmit} onReset={handleReset}>
        <div ref={containerRef} className="ldesign-form__container" style={containerStyles}>
          {children}

          {showButtons && (
            <div className={buttonClasses} style={buttonStyles}>
              {showSubmit && (
                <button
                  type="submit"
                  className="ldesign-form__button ldesign-form__button--submit"
                  disabled={submitting}
                >
                  {submitText}
                </button>
              )}

              {showReset && (
                <button
                  type="reset"
                  className="ldesign-form__button ldesign-form__button--reset"
                >
                  {resetText}
                </button>
              )}

              {showExpand && collapsible && (
                <button
                  type="button"
                  className="ldesign-form__button ldesign-form__button--expand"
                  onClick={handleToggleExpand}
                >
                  {expanded ? collapseText : expandText}
                </button>
              )}
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  )
}



