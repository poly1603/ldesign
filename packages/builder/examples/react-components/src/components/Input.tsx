import React, { forwardRef, useState, useId } from 'react'
import './Input.css'

// 定义 Props 接口
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'> {
  /**
   * 输入框标签
   */
  label?: string

  /**
   * 是否必填
   */
  required?: boolean

  /**
   * 错误信息
   */
  error?: string

  /**
   * 帮助文本
   */
  help?: string

  /**
   * 输入框尺寸
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * 是否可清空
   */
  clearable?: boolean

  /**
   * 是否显示密码切换按钮
   */
  showPassword?: boolean

  /**
   * 前缀图标
   */
  prefix?: React.ReactNode

  /**
   * 后缀图标
   */
  suffix?: React.ReactNode

  /**
   * 清空回调
   */
  onClear?: () => void
}

/**
 * Input 组件
 * 
 * 一个功能丰富的输入框组件，支持多种状态和交互
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
      error,
      help,
      size = 'medium',
      clearable = false,
      showPassword = false,
      prefix,
      suffix,
      className,
      type = 'text',
      value,
      onChange,
      onClear,
      disabled,
      readOnly,
      ...props
    },
    ref
  ) => {
    const inputId = useId()
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // 确定实际的输入类型
    const actualType = showPassword && type === 'password'
      ? (passwordVisible ? 'text' : 'password')
      : type

    // 构建容器类名
    const wrapperClassNames = [
      'ld-input-wrapper',
      className
    ].filter(Boolean).join(' ')

    // 构建输入框类名
    const inputClassNames = [
      'ld-input',
      `ld-input--${size}`,
      isFocused && 'ld-input--focused',
      disabled && 'ld-input--disabled',
      readOnly && 'ld-input--readonly',
      error && 'ld-input--error',
      prefix && 'ld-input--has-prefix',
      (suffix || clearable || showPassword) && 'ld-input--has-suffix'
    ].filter(Boolean).join(' ')

    // 处理清空
    const handleClear = () => {
      if (onChange) {
        const event = {
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>
        onChange(event)
      }
      onClear?.()
    }

    // 切换密码可见性
    const togglePasswordVisibility = () => {
      setPasswordVisible(!passwordVisible)
    }

    // 是否显示清空按钮
    const showClearButton = clearable && value && !disabled && !readOnly

    return (
      <div className={wrapperClassNames}>
        {label && (
          <label htmlFor={inputId} className="ld-input-label">
            {label}
            {required && <span className="ld-input-required">*</span>}
          </label>
        )}

        <div className="ld-input-container">
          {prefix && (
            <span className="ld-input-prefix">{prefix}</span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={actualType}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={inputClassNames}
            disabled={disabled}
            readOnly={readOnly}
            {...props}
          />

          {(suffix || showClearButton || showPassword) && (
            <div className="ld-input-suffix">
              {showClearButton && (
                <button
                  type="button"
                  className="ld-input-clear"
                  onClick={handleClear}
                  tabIndex={-1}
                >
                  ×
                </button>
              )}

              {showPassword && type === 'password' && (
                <button
                  type="button"
                  className="ld-input-password"
                  onClick={togglePasswordVisibility}
                  tabIndex={-1}
                >
                  {passwordVisible ? '🙈' : '👁️'}
                </button>
              )}

              {suffix && <span className="ld-input-suffix-icon">{suffix}</span>}
            </div>
          )}
        </div>

        {error && (
          <div className="ld-input-error">{error}</div>
        )}

        {help && !error && (
          <div className="ld-input-help">{help}</div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
