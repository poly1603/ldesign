/**
 * 类型守卫函数
 * 
 * 提供运行时类型检查功能
 */

import type {
  FormConfig,
  FormFieldConfig,
  FormGroupConfig,
  FormActionsConfig,
  FormFieldItem,
  ValidationRule,
  LayoutConfig,
  BreakpointConfig,
  AnyObject
} from '../types'

/**
 * 检查是否为有效的对象
 */
export function isObject(value: unknown): value is AnyObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 检查是否为有效的数组
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value)
}

/**
 * 检查是否为有效的字符串
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

/**
 * 检查是否为有效的数字
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value)
}

/**
 * 检查是否为有效的布尔值
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean'
}

/**
 * 检查是否为有效的函数
 */
export function isFunction(value: unknown): value is Function {
  return typeof value === 'function'
}

/**
 * 检查是否为有效的表单配置
 */
export function isFormConfig(value: unknown): value is FormConfig {
  if (!isObject(value)) return false
  
  const config = value as Partial<FormConfig>
  
  // 检查必需字段
  if (!isArray(config.fields)) return false
  
  // 检查可选字段
  if (config.layout !== undefined && !isLayoutConfig(config.layout)) return false
  if (config.validation !== undefined && !isObject(config.validation)) return false
  if (config.mode !== undefined && !isString(config.mode)) return false
  if (config.size !== undefined && !isString(config.size)) return false
  if (config.theme !== undefined && !isString(config.theme)) return false
  
  return true
}

/**
 * 检查是否为有效的字段配置
 */
export function isFormFieldConfig(value: unknown): value is FormFieldConfig {
  if (!isObject(value)) return false
  
  const config = value as Partial<FormFieldConfig>
  
  // 检查必需字段
  if (!isString(config.name)) return false
  if (!isString(config.type)) return false
  
  // 检查可选字段
  if (config.label !== undefined && !isString(config.label)) return false
  if (config.component !== undefined && !isString(config.component)) return false
  if (config.defaultValue !== undefined) {
    // defaultValue 可以是任何类型
  }
  if (config.required !== undefined && !isBoolean(config.required) && !isFunction(config.required)) return false
  if (config.hidden !== undefined && !isBoolean(config.hidden) && !isFunction(config.hidden)) return false
  if (config.disabled !== undefined && !isBoolean(config.disabled) && !isFunction(config.disabled)) return false
  if (config.rules !== undefined && !isArray(config.rules)) return false
  if (config.props !== undefined && !isObject(config.props)) return false
  
  return true
}

/**
 * 检查是否为有效的分组配置
 */
export function isFormGroupConfig(value: unknown): value is FormGroupConfig {
  if (!isObject(value)) return false
  
  const config = value as Partial<FormGroupConfig>
  
  // 检查必需字段
  if (config.type !== 'group') return false
  if (!isString(config.name)) return false
  if (!isArray(config.fields)) return false
  
  // 检查可选字段
  if (config.title !== undefined && !isString(config.title)) return false
  if (config.description !== undefined && !isString(config.description)) return false
  if (config.collapsible !== undefined && !isBoolean(config.collapsible)) return false
  if (config.collapsed !== undefined && !isBoolean(config.collapsed)) return false
  
  return true
}

/**
 * 检查是否为有效的操作配置
 */
export function isFormActionsConfig(value: unknown): value is FormActionsConfig {
  if (!isObject(value)) return false
  
  const config = value as Partial<FormActionsConfig>
  
  // 检查必需字段
  if (config.type !== 'actions') return false
  if (!isArray(config.buttons)) return false
  
  // 检查可选字段
  if (config.align !== undefined && !isString(config.align)) return false
  if (config.size !== undefined && !isString(config.size)) return false
  
  return true
}

/**
 * 检查是否为有效的字段项
 */
export function isFormFieldItem(value: unknown): value is FormFieldItem {
  if (!isObject(value)) return false
  
  const item = value as Partial<FormFieldItem>
  
  if (!isString(item.type)) return false
  
  switch (item.type) {
    case 'group':
      return isFormGroupConfig(value)
    case 'actions':
      return isFormActionsConfig(value)
    default:
      return isFormFieldConfig(value)
  }
}

/**
 * 检查是否为有效的验证规则
 */
export function isValidationRule(value: unknown): value is ValidationRule {
  if (!isObject(value)) return false
  
  const rule = value as Partial<ValidationRule>
  
  // 检查必需字段
  if (!isString(rule.type)) return false
  
  // 检查可选字段
  if (rule.value !== undefined) {
    // value 可以是任何类型
  }
  if (rule.message !== undefined && !isString(rule.message)) return false
  if (rule.validator !== undefined && !isFunction(rule.validator)) return false
  
  return true
}

/**
 * 检查是否为有效的布局配置
 */
export function isLayoutConfig(value: unknown): value is LayoutConfig {
  if (!isObject(value)) return false
  
  const config = value as Partial<LayoutConfig>
  
  // 检查可选字段
  if (config.type !== undefined && !isString(config.type)) return false
  if (config.columns !== undefined && !isNumber(config.columns)) return false
  if (config.gap !== undefined) {
    if (!isNumber(config.gap) && !isObject(config.gap)) return false
    if (isObject(config.gap)) {
      const gap = config.gap as any
      if (gap.horizontal !== undefined && !isNumber(gap.horizontal)) return false
      if (gap.vertical !== undefined && !isNumber(gap.vertical)) return false
    }
  }
  if (config.responsive !== undefined && !isObject(config.responsive)) return false
  
  return true
}

/**
 * 检查是否为有效的断点配置
 */
export function isBreakpointConfig(value: unknown): value is BreakpointConfig {
  if (!isObject(value)) return false
  
  const config = value as Partial<BreakpointConfig>
  
  // 检查必需字段
  if (!isNumber(config.value)) return false
  if (!isString(config.name)) return false
  if (!isNumber(config.columns)) return false
  
  return true
}

/**
 * 检查是否为有效的表单数据
 */
export function isFormData(value: unknown): value is AnyObject {
  return isObject(value)
}

/**
 * 检查是否为空值
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (isString(value)) return value.trim() === ''
  if (isArray(value)) return value.length === 0
  if (isObject(value)) return Object.keys(value).length === 0
  return false
}

/**
 * 检查是否为有效的字段名
 */
export function isValidFieldName(value: unknown): value is string {
  if (!isString(value)) return false
  
  // 字段名不能为空
  if (value.trim() === '') return false
  
  // 字段名只能包含字母、数字、下划线和点号
  const fieldNameRegex = /^[a-zA-Z_][a-zA-Z0-9_.]*$/
  return fieldNameRegex.test(value)
}

/**
 * 检查是否为有效的组件名
 */
export function isValidComponentName(value: unknown): value is string {
  if (!isString(value)) return false
  
  // 组件名不能为空
  if (value.trim() === '') return false
  
  // 组件名只能包含字母、数字和连字符
  const componentNameRegex = /^[a-zA-Z][a-zA-Z0-9-]*$/
  return componentNameRegex.test(value)
}

/**
 * 检查是否为有效的CSS类名
 */
export function isValidCssClass(value: unknown): value is string {
  if (!isString(value)) return false
  
  // CSS类名不能为空
  if (value.trim() === '') return false
  
  // CSS类名只能包含字母、数字、连字符和下划线
  const cssClassRegex = /^[a-zA-Z_-][a-zA-Z0-9_-]*$/
  return cssClassRegex.test(value)
}

/**
 * 检查是否为有效的事件名
 */
export function isValidEventName(value: unknown): value is string {
  if (!isString(value)) return false
  
  // 事件名不能为空
  if (value.trim() === '') return false
  
  // 事件名只能包含字母、数字、冒号和连字符
  const eventNameRegex = /^[a-zA-Z][a-zA-Z0-9:-]*$/
  return eventNameRegex.test(value)
}

/**
 * 检查值是否匹配指定类型
 */
export function isValueOfType(value: unknown, type: string): boolean {
  switch (type) {
    case 'string':
      return isString(value)
    case 'number':
      return isNumber(value)
    case 'boolean':
      return isBoolean(value)
    case 'array':
      return isArray(value)
    case 'object':
      return isObject(value)
    case 'function':
      return isFunction(value)
    case 'date':
      return value instanceof Date
    case 'null':
      return value === null
    case 'undefined':
      return value === undefined
    default:
      return false
  }
}

/**
 * 检查对象是否包含指定的键
 */
export function hasKey<T extends AnyObject>(obj: T, key: string): key is keyof T {
  return isObject(obj) && key in obj
}

/**
 * 检查对象是否包含所有指定的键
 */
export function hasKeys<T extends AnyObject>(obj: T, keys: string[]): boolean {
  return isObject(obj) && keys.every(key => key in obj)
}

/**
 * 安全地获取对象属性
 */
export function safeGet<T = unknown>(obj: unknown, key: string, defaultValue?: T): T | undefined {
  if (!isObject(obj) || !hasKey(obj, key)) {
    return defaultValue
  }
  return obj[key] as T
}

/**
 * 检查是否为Promise
 */
export function isPromise<T = unknown>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (
    isObject(value) && 
    isFunction((value as any).then) && 
    isFunction((value as any).catch)
  )
}
