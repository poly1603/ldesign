// @ldesign/form 类型声明文件

declare module '@ldesign/form' {
  import type { Component } from 'vue'

  // 基础类型
  export interface FormData {
    [key: string]: any
  }

  export interface FormField {
    name: string
    title: string
    component: string
    type?: string
    required?: boolean
    placeholder?: string
    span?: number
    options?: Array<{ label: string; value: any }>
    props?: Record<string, any>
    rules?: FormRule[]
    condition?: (value: any, formData: FormData) => boolean
  }

  export interface FormRule {
    type: string
    message?: string
    value?: any
    params?: any
    validator?: (
      value: any,
      formData?: FormData
    ) => boolean | Promise<boolean> | string
  }

  export interface FormGroup {
    name: string
    title: string
    description?: string
    fields: FormField[]
    collapsible?: boolean
    collapsed?: boolean
  }

  export interface FormLayout {
    columns?: number
    horizontalGap?: number
    verticalGap?: number
  }

  export interface FormTheme {
    name: string
    colors?: Record<string, string>
  }

  export interface FormOptions {
    title?: string
    description?: string
    fields?: FormField[]
    groups?: FormGroup[]
    layout?: FormLayout
    theme?: FormTheme
    data?: FormData
  }

  export interface FormState {
    valid: boolean
    dirty: boolean
    touched: boolean
    validating: boolean
  }

  // 组件导出
  export const DynamicForm: Component

  // Composition API
  export interface FormInstance {
    data: FormData
    formData: FormData
    formState: FormState
    formErrors: Record<string, string>
    validate(): Promise<boolean>
    reset(): void
    clear(): void
    submit(): void
    setFieldValue(name: string, value: any): void
    getFieldValue(name: string): any
    setFormData(data: FormData): void
    addField(field: FormField): void
    removeField(name: string): void
    hideField(name: string): void
    showField(name: string): void
    enableField(name: string): void
    disableField(name: string): void
    isFieldVisible(name: string): boolean
    isFieldDisabled(name: string): boolean
    renderForm(): Component
    on(event: string, handler: Function): void
    off(event: string, handler: Function): void
  }

  export function useForm(options?: FormOptions): FormInstance

  // 原生 JavaScript API
  export function createFormInstance(options?: FormOptions): FormInstance
  export type { FormInstance }
}

declare module '@ldesign/form/vanilla' {
  export { createFormInstance, FormInstance } from '@ldesign/form'
  export type { FormOptions, FormData } from '@ldesign/form'
}

declare module '@ldesign/form/styles/index.css' {
  const content: string
  export default content
}
