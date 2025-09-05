import React, { forwardRef } from 'react'
import './Button.css'

// 定义 Props 接口
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 按钮类型
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  
  /**
   * 按钮尺寸
   */
  size?: 'small' | 'medium' | 'large'
  
  /**
   * 是否为块级按钮
   */
  block?: boolean
  
  /**
   * 是否为圆角按钮
   */
  round?: boolean
  
  /**
   * 是否显示加载状态
   */
  loading?: boolean
  
  /**
   * 加载状态文本
   */
  loadingText?: string
  
  /**
   * 图标（放在文本前面）
   */
  icon?: React.ReactNode
  
  /**
   * 子元素
   */
  children?: React.ReactNode
}

/**
 * Button 组件
 * 
 * 一个功能丰富的按钮组件，支持多种样式、尺寸和状态
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      block = false,
      round = false,
      loading = false,
      loadingText = '加载中...',
      icon,
      children,
      className,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    // 构建 CSS 类名
    const classNames = [
      'ld-btn',
      `ld-btn--${variant}`,
      `ld-btn--${size}`,
      block && 'ld-btn--block',
      round && 'ld-btn--round',
      loading && 'ld-btn--loading',
      className
    ].filter(Boolean).join(' ')

    // 处理点击事件
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && !loading && onClick) {
        onClick(event)
      }
    }

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <span className="ld-btn__loading">
            <span className="ld-btn__spinner" />
          </span>
        )}
        
        {!loading && icon && (
          <span className="ld-btn__icon">{icon}</span>
        )}
        
        <span className="ld-btn__content">
          {loading ? loadingText : children}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
