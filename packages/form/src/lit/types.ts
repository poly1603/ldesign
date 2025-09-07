/**
 * Lit 适配器类型定义
 * 
 * @description
 * 定义 Lit 框架中表单组件的类型接口
 */

import { LitElement, PropertyValues } from 'lit'
import { FormConfig, FormField, QueryFormConfig } from '../types'

/**
 * Lit 表单配置接口
 */
export interface LitFormConfig extends FormConfig {
  /**
   * 表单提交事件处理器
   */
  onSubmit?: (data: Record<string, any>) => void | Promise<void>
  
  /**
   * 表单重置事件处理器
   */
  onReset?: () => void
  
  /**
   * 表单验证失败事件处理器
   */
  onValidationError?: (errors: Record<string, string[]>) => void
  
  /**
   * 字段值变化事件处理器
   */
  onFieldChange?: (name: string, value: any) => void
}

/**
 * Lit 表单项配置接口
 */
export interface LitFormItemConfig {
  /**
   * 字段名称
   */
  name: string
  
  /**
   * 字段标签
   */
  label?: string
  
  /**
   * 字段类型
   */
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  
  /**
   * 占位符文本
   */
  placeholder?: string
  
  /**
   * 是否必填
   */
  required?: boolean
  
  /**
   * 是否禁用
   */
  disabled?: boolean
  
  /**
   * 是否只读
   */
  readonly?: boolean
  
  /**
   * 验证规则
   */
  rules?: Array<{
    validator: (value: any) => boolean | Promise<boolean>
    message: string
  }>
  
  /**
   * 字段值
   */
  value?: any
  
  /**
   * 默认值
   */
  defaultValue?: any
}

/**
 * Lit 查询表单配置接口
 */
export interface LitQueryFormConfig extends QueryFormConfig {
  /**
   * 查询事件处理器
   */
  onQuery?: (data: Record<string, any>) => void | Promise<void>
  
  /**
   * 重置事件处理器
   */
  onReset?: () => void
  
  /**
   * 展开收起事件处理器
   */
  onToggleExpand?: (expanded: boolean) => void
  
  /**
   * 导出事件处理器
   */
  onExport?: (data: Record<string, any>) => void | Promise<void>
}

/**
 * Lit 表单事件接口
 */
export interface LitFormEvents {
  /**
   * 表单提交事件
   */
  'form-submit': CustomEvent<{ data: Record<string, any> }>
  
  /**
   * 表单重置事件
   */
  'form-reset': CustomEvent<void>
  
  /**
   * 字段值变化事件
   */
  'field-change': CustomEvent<{ name: string; value: any }>
  
  /**
   * 表单验证事件
   */
  'form-validate': CustomEvent<{ valid: boolean; errors: Record<string, string[]> }>
  
  /**
   * 查询表单查询事件
   */
  'query-submit': CustomEvent<{ data: Record<string, any> }>
  
  /**
   * 查询表单展开收起事件
   */
  'query-toggle': CustomEvent<{ expanded: boolean }>
}

/**
 * Lit 表单状态接口
 */
export interface LitFormState {
  /**
   * 表单数据
   */
  data: Record<string, any>
  
  /**
   * 表单是否有效
   */
  isValid: boolean
  
  /**
   * 表单是否已修改
   */
  isDirty: boolean
  
  /**
   * 表单是否正在提交
   */
  isPending: boolean
  
  /**
   * 表单验证错误
   */
  errors: Record<string, string[]>
  
  /**
   * 表单字段状态
   */
  fields: Record<string, {
    value: any
    error: string[]
    touched: boolean
    dirty: boolean
  }>
}

/**
 * Lit 表单组件基类接口
 */
export interface LitFormComponent extends LitElement {
  /**
   * 表单配置
   */
  config: LitFormConfig
  
  /**
   * 表单状态
   */
  state: LitFormState
  
  /**
   * 提交表单
   */
  submit(): Promise<void>
  
  /**
   * 重置表单
   */
  reset(): void
  
  /**
   * 验证表单
   */
  validate(): Promise<boolean>
  
  /**
   * 设置字段值
   */
  setFieldValue(name: string, value: any): void
  
  /**
   * 获取字段值
   */
  getFieldValue(name: string): any
  
  /**
   * 获取表单数据
   */
  getFormData(): Record<string, any>
}

/**
 * Lit 查询表单组件接口
 */
export interface LitQueryFormComponent extends LitElement {
  /**
   * 查询表单配置
   */
  config: LitQueryFormConfig
  
  /**
   * 是否展开
   */
  expanded: boolean
  
  /**
   * 查询数据
   */
  queryData: Record<string, any>
  
  /**
   * 执行查询
   */
  query(): Promise<void>
  
  /**
   * 重置查询
   */
  reset(): void
  
  /**
   * 切换展开收起
   */
  toggleExpand(): void
  
  /**
   * 导出数据
   */
  export(): Promise<void>
}

/**
 * Lit 组件属性装饰器选项
 */
export interface LitPropertyOptions {
  /**
   * 属性类型
   */
  type?: any
  
  /**
   * 是否反映到属性
   */
  reflect?: boolean
  
  /**
   * 属性转换器
   */
  converter?: any
  
  /**
   * 是否有属性
   */
  hasChanged?: (value: any, oldValue: any) => boolean
}

/**
 * Lit 样式选项
 */
export interface LitStyleOptions {
  /**
   * CSS 样式字符串
   */
  styles?: string
  
  /**
   * 是否使用 Shadow DOM
   */
  shadowRoot?: boolean
  
  /**
   * 主题变量
   */
  theme?: Record<string, string>
}
