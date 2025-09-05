/**
 * Vue 3 组件类型定义
 * 
 * 为所有 Vue 组件提供 TypeScript 类型支持
 */

/**
 * 按钮组件 Props
 */
export interface ButtonProps {
  type?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  block?: boolean
  round?: boolean
}

/**
 * 按钮组件 Emits
 */
export interface ButtonEmits {
  click: [event: MouseEvent]
}

/**
 * 输入框组件 Props
 */
export interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  showPassword?: boolean
  error?: string
  help?: string
  size?: 'small' | 'medium' | 'large'
  maxlength?: number
}

/**
 * 卡片组件 Props
 */
export interface CardProps {
  title?: string
  bordered?: boolean
  hoverable?: boolean
  loading?: boolean
  size?: 'small' | 'default' | 'large'
  shadow?: 'never' | 'hover' | 'always'
}
