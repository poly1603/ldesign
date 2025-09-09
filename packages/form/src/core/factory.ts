/**
 * 表单工厂函数
 * 
 * 提供便捷的表单创建函数，简化表单实例的创建过程
 * 
 * @author LDesign Team
 * @since 2.0.0
 */

import { FormCore } from './form-core'
import type { FormConfig, FormEventCallbacks, FormInstance } from '../types'

/**
 * 创建表单实例
 * 
 * 这是创建表单的主要入口函数，提供了简洁的API来创建表单实例
 * 
 * @param config 表单配置
 * @param callbacks 事件回调
 * @returns 表单实例
 * 
 * @example
 * ```typescript
 * import { createForm } from '@ldesign/form'
 * 
 * const form = createForm({
 *   initialValues: {
 *     name: '',
 *     email: ''
 *   },
 *   fields: [
 *     {
 *       name: 'name',
 *       label: '姓名',
 *       type: 'input',
 *       rules: [{ type: 'required', message: '请输入姓名' }]
 *     },
 *     {
 *       name: 'email',
 *       label: '邮箱',
 *       type: 'input',
 *       rules: [
 *         { type: 'required', message: '请输入邮箱' },
 *         { type: 'email', message: '请输入有效的邮箱地址' }
 *       ]
 *     }
 *   ]
 * }, {
 *   onSubmit: async (values) => {
 *     console.log('提交数据:', values)
 *   },
 *   onFieldChange: (name, value) => {
 *     console.log(`字段 ${name} 变化:`, value)
 *   }
 * })
 * 
 * // 设置字段值
 * form.setFieldValue('name', 'John Doe')
 * 
 * // 验证表单
 * const result = await form.validate()
 * 
 * // 提交表单
 * if (result.valid) {
 *   await form.submit()
 * }
 * ```
 */
export function createForm<T = Record<string, any>>(
  config: FormConfig<T>,
  callbacks: FormEventCallbacks<T> = {}
): FormInstance<T> {
  return new FormCore<T>(config, callbacks)
}

/**
 * 创建简单表单实例
 * 
 * 提供更简洁的API来创建只有初始值的表单
 * 
 * @param initialValues 初始值
 * @param callbacks 事件回调
 * @returns 表单实例
 * 
 * @example
 * ```typescript
 * import { createSimpleForm } from '@ldesign/form'
 * 
 * const form = createSimpleForm({
 *   name: '',
 *   age: 0,
 *   email: ''
 * }, {
 *   onSubmit: async (values) => {
 *     console.log('提交数据:', values)
 *   }
 * })
 * ```
 */
export function createSimpleForm<T = Record<string, any>>(
  initialValues: T,
  callbacks: FormEventCallbacks<T> = {}
): FormInstance<T> {
  return createForm<T>({ initialValues }, callbacks)
}

/**
 * 创建带验证的表单实例
 * 
 * 提供便捷的API来创建带有验证规则的表单
 * 
 * @param initialValues 初始值
 * @param validationRules 验证规则映射
 * @param callbacks 事件回调
 * @returns 表单实例
 * 
 * @example
 * ```typescript
 * import { createValidatedForm } from '@ldesign/form'
 * 
 * const form = createValidatedForm({
 *   name: '',
 *   email: ''
 * }, {
 *   name: [{ type: 'required', message: '请输入姓名' }],
 *   email: [
 *     { type: 'required', message: '请输入邮箱' },
 *     { type: 'email', message: '请输入有效的邮箱地址' }
 *   ]
 * }, {
 *   onSubmit: async (values) => {
 *     console.log('提交数据:', values)
 *   }
 * })
 * ```
 */
export function createValidatedForm<T = Record<string, any>>(
  initialValues: T,
  validationRules: Record<keyof T, any[]>,
  callbacks: FormEventCallbacks<T> = {}
): FormInstance<T> {
  // 将验证规则转换为字段配置
  const fields = Object.keys(initialValues).map(key => ({
    name: key,
    type: 'input',
    rules: validationRules[key as keyof T] || []
  }))
  
  return createForm<T>({
    initialValues,
    fields
  }, callbacks)
}

/**
 * 表单构建器类
 * 
 * 提供链式API来构建复杂的表单配置
 * 
 * @example
 * ```typescript
 * import { FormBuilder } from '@ldesign/form'
 * 
 * const form = new FormBuilder()
 *   .setInitialValues({ name: '', email: '' })
 *   .addField({
 *     name: 'name',
 *     label: '姓名',
 *     type: 'input',
 *     rules: [{ type: 'required', message: '请输入姓名' }]
 *   })
 *   .addField({
 *     name: 'email',
 *     label: '邮箱',
 *     type: 'input',
 *     rules: [
 *       { type: 'required', message: '请输入邮箱' },
 *       { type: 'email', message: '请输入有效的邮箱地址' }
 *     ]
 *   })
 *   .onSubmit(async (values) => {
 *     console.log('提交数据:', values)
 *   })
 *   .build()
 * ```
 */
export class FormBuilder<T = Record<string, any>> {
  private config: FormConfig<T> = {}
  private callbacks: FormEventCallbacks<T> = {}

  /**
   * 设置初始值
   */
  setInitialValues(initialValues: T): this {
    this.config.initialValues = initialValues
    return this
  }

  /**
   * 设置表单ID
   */
  setId(id: string): this {
    this.config.id = id
    return this
  }

  /**
   * 添加字段
   */
  addField(field: any): this {
    if (!this.config.fields) {
      this.config.fields = []
    }
    this.config.fields.push(field)
    return this
  }

  /**
   * 设置验证配置
   */
  setValidationConfig(config: any): this {
    this.config.validationConfig = config
    return this
  }

  /**
   * 设置布局配置
   */
  setLayout(layout: any): this {
    this.config.layout = layout
    return this
  }

  /**
   * 设置验证时机
   */
  setValidationTiming(options: {
    validateOnChange?: boolean
    validateOnBlur?: boolean
    validateOnSubmit?: boolean
    validateOnMount?: boolean
  }): this {
    Object.assign(this.config, options)
    return this
  }

  /**
   * 设置提交回调
   */
  onSubmit(callback: (values: T) => void | Promise<void>): this {
    this.callbacks.onSubmit = callback
    return this
  }

  /**
   * 设置字段变化回调
   */
  onFieldChange(callback: (name: string, value: any, values: T) => void): this {
    this.callbacks.onFieldChange = callback
    return this
  }

  /**
   * 设置值变化回调
   */
  onValuesChange(callback: (values: T, changedValues: Partial<T>) => void): this {
    this.callbacks.onValuesChange = callback
    return this
  }

  /**
   * 设置重置回调
   */
  onReset(callback: (values: T) => void): this {
    this.callbacks.onReset = callback
    return this
  }

  /**
   * 构建表单实例
   */
  build(): FormInstance<T> {
    return createForm<T>(this.config, this.callbacks)
  }
}
