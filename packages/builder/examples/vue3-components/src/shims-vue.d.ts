/**
 * Vue 3 组件类型声明文件
 * 为 .vue 文件提供 TypeScript 类型支持
 */

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 为组件提供更具体的类型声明
declare module './components/Button.vue' {
  import type { DefineComponent } from 'vue'
  
  export interface ButtonProps {
    type?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
    loading?: boolean
    block?: boolean
  }
  
  const Button: DefineComponent<ButtonProps>
  export default Button
}

declare module './components/Input.vue' {
  import type { DefineComponent } from 'vue'
  
  export interface InputProps {
    modelValue?: string | number
    type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url'
    placeholder?: string
    disabled?: boolean
    readonly?: boolean
    clearable?: boolean
    showPassword?: boolean
    size?: 'small' | 'medium' | 'large'
    maxlength?: number
    minlength?: number
    autocomplete?: string
  }
  
  const Input: DefineComponent<InputProps>
  export default Input
}

declare module './components/Card.vue' {
  import type { DefineComponent } from 'vue'
  
  export interface CardProps {
    title?: string
    subtitle?: string
    shadow?: 'always' | 'hover' | 'never'
    bodyStyle?: Record<string, any>
  }
  
  const Card: DefineComponent<CardProps>
  export default Card
}
