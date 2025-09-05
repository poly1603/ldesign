/**
 * 按钮组件
 */

import type { EventType } from '../types'

/**
 * 按钮尺寸类型
 */
export type ButtonSize = 'small' | 'medium' | 'large'

/**
 * 按钮类型
 */
export type ButtonType = 'primary' | 'secondary' | 'danger' | 'success' | 'warning'

/**
 * 按钮属性接口
 */
export interface ButtonProps {
  text: string
  type?: ButtonType
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  onClick?: (event: Event) => void
}

/**
 * 按钮类
 */
export class Button {
  private props: ButtonProps
  private element: HTMLButtonElement | null = null

  constructor(props: ButtonProps) {
    this.props = { ...props }
  }

  /**
   * 渲染按钮
   */
  render(): HTMLButtonElement {
    this.element = document.createElement('button')
    this.element.textContent = this.props.text
    this.element.className = this.getClassName()
    this.element.disabled = this.props.disabled || this.props.loading || false

    if (this.props.onClick) {
      this.element.addEventListener('click', this.props.onClick)
    }

    return this.element
  }

  /**
   * 更新属性
   */
  updateProps(newProps: Partial<ButtonProps>): void {
    this.props = { ...this.props, ...newProps }
    if (this.element) {
      this.element.textContent = this.props.text
      this.element.className = this.getClassName()
      this.element.disabled = this.props.disabled || this.props.loading || false
    }
  }

  /**
   * 设置加载状态
   */
  setLoading(loading: boolean): void {
    this.updateProps({ loading })
  }

  /**
   * 设置禁用状态
   */
  setDisabled(disabled: boolean): void {
    this.updateProps({ disabled })
  }

  /**
   * 获取样式类名
   */
  private getClassName(): string {
    const classes = ['btn']
    
    if (this.props.type) {
      classes.push(`btn-${this.props.type}`)
    }
    
    if (this.props.size) {
      classes.push(`btn-${this.props.size}`)
    }
    
    if (this.props.loading) {
      classes.push('btn-loading')
    }
    
    if (this.props.disabled) {
      classes.push('btn-disabled')
    }

    return classes.join(' ')
  }

  /**
   * 销毁按钮
   */
  destroy(): void {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }
    this.element = null
  }
}

/**
 * 创建按钮实例
 */
export function createButton(props: ButtonProps): Button {
  return new Button(props)
}
