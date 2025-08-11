/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@ldesign/form' {
  import type { App } from 'vue'

  export interface FormOptions {
    fields: FieldConfig[]
    layout?: LayoutConfig
    validation?: ValidationConfig
    groups?: GroupConfig[]
    submitButton?: ButtonConfig
  }

  export interface FieldConfig {
    name: string
    label: string
    component: string
    required?: boolean
    placeholder?: string
    props?: Record<string, any>
    rules?: ValidationRule[]
    span?: number | string | Record<string, number | string>
    className?: string
    style?: Record<string, any>
  }

  export interface LayoutConfig {
    columns?: number | Record<string, number>
    gap?: number | string | Record<string, number | string>
    rowGap?: number | string
    columnGap?: number | string
    labelPosition?: 'top' | 'left' | 'right'
    labelWidth?: number | string
    labelAlign?: 'left' | 'center' | 'right'
    className?: string
  }

  export interface ValidationRule {
    required?: boolean
    type?: string
    min?: number
    max?: number
    pattern?: RegExp
    validator?: (
      value: any,
      formData?: any
    ) => boolean | string | Promise<boolean | string>
    message?: string
    trigger?: 'change' | 'blur' | 'submit'
  }

  export interface GroupConfig {
    title: string
    fields: string[]
    layout?: LayoutConfig
    collapsible?: boolean
    collapsed?: boolean
  }

  export interface ButtonConfig {
    text: string
    type?: 'primary' | 'secondary' | 'danger'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
  }

  export const DynamicForm: DefineComponent<{
    modelValue: Record<string, any>
    options: FormOptions
    disabled?: boolean
    readonly?: boolean
  }>

  export const FormField: DefineComponent<{
    modelValue: any
    config: FieldConfig
    disabled?: boolean
    readonly?: boolean
  }>

  const plugin: {
    install(app: App): void
  }

  export default plugin
}
