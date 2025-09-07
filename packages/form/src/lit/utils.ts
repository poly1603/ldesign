/**
 * Lit 适配器工具函数
 * 
 * @description
 * 提供 Lit 框架中表单组件的工具函数
 */

import { createForm } from '../core'
import { LitFormConfig } from './types'

/**
 * 创建 Lit 表单实例
 * 
 * @param config 表单配置
 * @returns 表单实例
 */
export function createLitForm(config: LitFormConfig) {
  const formInstance = createForm({
    initialValues: config.initialValues || {}
  })

  // 注册字段
  if (config.fields) {
    config.fields.forEach(field => {
      formInstance.registerField({
        name: field.name,
        rules: field.rules || []
      })
    })
  }

  return formInstance
}

/**
 * 注册所有 Lit 组件
 * 
 * @description
 * 自动注册所有 LDesign Lit 组件到全局
 */
export function registerLitComponents() {
  // 动态导入所有组件
  import('./components/form')
  import('./components/form-item')
  import('./components/query-form')
  import('./components/button')
  import('./components/input')
  import('./components/select')
  import('./components/textarea')
  import('./components/checkbox')
}

/**
 * 创建自定义事件
 * 
 * @param type 事件类型
 * @param detail 事件详情
 * @returns CustomEvent 实例
 */
export function createLitEvent<T = any>(type: string, detail?: T): CustomEvent<T> {
  return new CustomEvent(type, {
    detail,
    bubbles: true,
    composed: true
  })
}

/**
 * 验证 Lit 组件属性
 * 
 * @param props 属性对象
 * @param required 必需属性列表
 * @returns 验证结果
 */
export function validateLitProps(props: Record<string, any>, required: string[] = []): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // 检查必需属性
  required.forEach(prop => {
    if (!(prop in props) || props[prop] === undefined || props[prop] === null) {
      errors.push(`属性 "${prop}" 是必需的`)
    }
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 转换表单数据
 * 
 * @param data 原始数据
 * @param fields 字段配置
 * @returns 转换后的数据
 */
export function transformFormData(data: Record<string, any>, fields: any[] = []): Record<string, any> {
  const transformed: Record<string, any> = {}

  fields.forEach(field => {
    const value = data[field.name]
    
    // 根据字段类型转换数据
    switch (field.type) {
      case 'number':
        transformed[field.name] = value ? Number(value) : 0
        break
      case 'boolean':
        transformed[field.name] = Boolean(value)
        break
      default:
        transformed[field.name] = value || ''
    }
  })

  return transformed
}

/**
 * 格式化验证错误
 * 
 * @param errors 错误对象
 * @returns 格式化后的错误信息
 */
export function formatValidationErrors(errors: Record<string, string[]>): string {
  const messages: string[] = []

  Object.entries(errors).forEach(([field, fieldErrors]) => {
    fieldErrors.forEach(error => {
      messages.push(`${field}: ${error}`)
    })
  })

  return messages.join('\n')
}

/**
 * 深度合并对象
 * 
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target }

  Object.keys(source).forEach(key => {
    const sourceValue = source[key]
    const targetValue = result[key]

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue)) {
        result[key] = deepMerge(targetValue, sourceValue)
      } else {
        result[key] = sourceValue
      }
    } else {
      result[key] = sourceValue
    }
  })

  return result
}

/**
 * 防抖函数
 * 
 * @param func 要防抖的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * 节流函数
 * 
 * @param func 要节流的函数
 * @param delay 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0

  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}
