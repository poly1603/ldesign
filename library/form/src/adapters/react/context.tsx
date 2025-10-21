/**
 * @ldesign/form - React Form Context
 * React 表单上下文
 */

import { createContext } from 'react'
import type { FormCore } from '../../core'

/**
 * 表单上下文
 */
export const FormContext = createContext<FormCore | null>(null)

/**
 * 表单提供者 Props
 */
export interface FormProviderProps {
  /** 表单实例 */
  form: FormCore
  /** 子元素 */
  children: React.ReactNode
}

/**
 * 表单提供者组件
 */
export function FormProvider({ form, children }: FormProviderProps) {
  return <FormContext.Provider value={form}>{children}</FormContext.Provider>
}




