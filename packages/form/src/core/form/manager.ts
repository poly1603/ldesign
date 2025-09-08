/**
 * 表单管理器
 * 
 * 提供表单实例管理、事件处理、生命周期管理等功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { type Ref, type ComputedRef, provide, inject, onUnmounted } from 'vue'
import type { FormInstance, FormConfig, FieldConfig, FormEventHandlers } from '../../types'
import type { FormStore } from './store'
import { createFormStore } from './store'
import { generateId } from '../../utils'

/**
 * 表单管理器选项
 */
export interface FormManagerOptions<T = Record<string, any>> extends FormConfig<T> {
  /** 表单ID */
  id?: string
  /** 事件处理器 */
  eventHandlers?: Partial<FormEventHandlers<T>>
  /** 是否启用调试模式 */
  debug?: boolean
}

/**
 * 表单上下文键
 */
export const FORM_CONTEXT_KEY = Symbol('form-context')

/**
 * 表单管理器类
 */
export class FormManager<T = Record<string, any>> implements FormInstance<T> {
  /** 表单ID */
  public readonly id: string
  
  /** 表单状态存储 */
  public readonly store: FormStore<T>
  
  /** 字段配置映射 */
  private fieldConfigs = new Map<string, FieldConfig>()
  
  /** 事件处理器 */
  private eventHandlers: Partial<FormEventHandlers<T>>
  
  /** 是否启用调试模式 */
  private debug: boolean

  constructor(options: FormManagerOptions<T> = {}) {
    this.id = options.id || generateId('form')
    this.eventHandlers = options.eventHandlers || {}
    this.debug = options.debug || false
    
    // 创建表单状态存储
    this.store = createFormStore({
      ...options,
      id: this.id,
      debug: this.debug,
    })
    
    this.debugLog('Form manager created', { id: this.id, options })
  }

  // 调试日志
  private debugLog(message: string, data?: any): void {
    if (this.debug) {
      console.log(`[FormManager:${this.id}] ${message}`, data)
    }
  }

  // 获取表单状态
  get state(): Ref<any> {
    return this.store.state
  }

  // 获取表单值
  get values(): ComputedRef<T> {
    return this.store.values
  }

  // 获取表单错误
  get errors(): ComputedRef<Record<string, string[]>> {
    return this.store.errors
  }

  // 获取表单是否有效
  get valid(): ComputedRef<boolean> {
    return this.store.valid
  }

  // 获取表单是否正在提交
  get submitting(): ComputedRef<boolean> {
    return this.store.submitting
  }

  // 获取表单是否正在验证
  get validating(): ComputedRef<boolean> {
    return this.store.validating
  }

  // 获取表单是否为脏数据
  get dirty(): ComputedRef<boolean> {
    return this.store.dirty
  }

  // 注册字段
  registerField(name: string, config: FieldConfig): void {
    this.debugLog(`Registering field: ${name}`, config)
    
    this.fieldConfigs.set(name, config)
    
    // 如果字段有初始值，设置到表单中
    if (config.initialValue !== undefined) {
      this.setFieldValue(name, config.initialValue)
    }
    
    // 触发字段注册事件
    this.eventHandlers.onFieldRegister?.(name, config)
  }

  // 注销字段
  unregisterField(name: string): void {
    this.debugLog(`Unregistering field: ${name}`)
    
    this.fieldConfigs.delete(name)
    
    // 触发字段注销事件
    this.eventHandlers.onFieldUnregister?.(name)
  }

  // 获取字段配置
  getFieldConfig(name: string): FieldConfig | undefined {
    return this.fieldConfigs.get(name)
  }

  // 获取所有字段配置
  getFieldConfigs(): Map<string, FieldConfig> {
    return new Map(this.fieldConfigs)
  }

  // 设置字段值
  setFieldValue(name: string, value: any): void {
    this.debugLog(`Setting field value: ${name}`, value)
    
    const oldValue = this.getFieldValue(name)
    this.store.setFieldValue(name, value)
    
    // 触发字段值变化事件
    this.eventHandlers.onFieldChange?.(name, value, oldValue)
    
    // 如果启用了变化时验证，执行验证
    if (this.store.config.value.validateOnChange) {
      this.validateField(name)
    }
  }

  // 设置多个字段值
  setFieldsValue(values: Partial<T>): void {
    this.debugLog('Setting fields value', values)
    
    Object.keys(values).forEach(name => {
      const value = (values as any)[name]
      this.setFieldValue(name, value)
    })
  }

  // 获取字段值
  getFieldValue(name: string): any {
    return this.store.getFieldValue(name)
  }

  // 获取所有字段值
  getFieldsValue(): T {
    return this.store.getFieldsValue()
  }

  // 设置字段错误
  setFieldError(name: string, error: string): void {
    this.debugLog(`Setting field error: ${name}`, error)
    
    this.store.setFieldError(name, error)
    
    // 触发字段错误事件
    this.eventHandlers.onFieldError?.(name, error)
  }

  // 设置多个字段错误
  setFieldsError(errors: Record<string, string>): void {
    this.debugLog('Setting fields error', errors)
    
    Object.keys(errors).forEach(name => {
      this.setFieldError(name, errors[name])
    })
  }

  // 清除字段错误
  clearFieldError(name: string): void {
    this.debugLog(`Clearing field error: ${name}`)
    this.store.clearFieldError(name)
  }

  // 清除所有错误
  clearErrors(): void {
    this.debugLog('Clearing all errors')
    this.store.clearErrors()
  }

  // 验证字段
  async validateField(name: string): Promise<boolean> {
    this.debugLog(`Validating field: ${name}`)
    
    try {
      const result = await this.store.validateField(name)
      
      // 触发字段验证事件
      this.eventHandlers.onFieldValidate?.(name, result)
      
      return result
    } catch (error) {
      this.debugLog(`Field validation error: ${name}`, error)
      
      // 触发字段验证错误事件
      this.eventHandlers.onFieldValidateError?.(name, error as Error)
      
      return false
    }
  }

  // 验证多个字段
  async validateFields(names?: string[]): Promise<boolean> {
    this.debugLog('Validating fields', names)
    
    try {
      const result = await this.store.validateFields(names)
      
      // 触发字段验证事件
      this.eventHandlers.onFieldsValidate?.(names, result)
      
      return result
    } catch (error) {
      this.debugLog('Fields validation error', error)
      
      // 触发字段验证错误事件
      this.eventHandlers.onFieldsValidateError?.(names, error as Error)
      
      return false
    }
  }

  // 验证表单
  async validateForm(): Promise<boolean> {
    this.debugLog('Validating form')
    
    try {
      const result = await this.store.validateForm()
      
      // 触发表单验证事件
      this.eventHandlers.onFormValidate?.(result)
      
      return result
    } catch (error) {
      this.debugLog('Form validation error', error)
      
      // 触发表单验证错误事件
      this.eventHandlers.onFormValidateError?.(error as Error)
      
      return false
    }
  }

  // 重置字段
  resetField(name: string): void {
    this.debugLog(`Resetting field: ${name}`)
    
    this.store.resetField(name)
    
    // 触发字段重置事件
    this.eventHandlers.onFieldReset?.(name)
  }

  // 重置多个字段
  resetFields(names?: string[]): void {
    this.debugLog('Resetting fields', names)
    
    this.store.resetFields(names)
    
    // 触发字段重置事件
    this.eventHandlers.onFieldsReset?.(names)
  }

  // 重置表单
  resetForm(): void {
    this.debugLog('Resetting form')
    
    this.store.resetForm()
    
    // 触发表单重置事件
    this.eventHandlers.onFormReset?.()
  }

  // 提交表单
  async submitForm(): Promise<void> {
    this.debugLog('Submitting form')
    
    try {
      // 触发表单提交前事件
      const shouldContinue = await this.eventHandlers.onBeforeSubmit?.(this.getFieldsValue())
      
      if (shouldContinue === false) {
        this.debugLog('Form submission cancelled by onBeforeSubmit')
        return
      }
      
      await this.store.submitForm()
      
      // 触发表单提交成功事件
      this.eventHandlers.onSubmitSuccess?.(this.getFieldsValue())
      
    } catch (error) {
      this.debugLog('Form submission error', error)
      
      // 触发表单提交错误事件
      this.eventHandlers.onSubmitError?.(error as Error)
      
      throw error
    }
  }

  // 标记字段为已触摸
  touchField(name: string): void {
    this.debugLog(`Touching field: ${name}`)
    
    this.store.touchField(name)
    
    // 触发字段触摸事件
    this.eventHandlers.onFieldTouch?.(name)
    
    // 如果启用了失焦时验证，执行验证
    if (this.store.config.value.validateOnBlur) {
      this.validateField(name)
    }
  }

  // 标记多个字段为已触摸
  touchFields(names: string[]): void {
    this.debugLog('Touching fields', names)
    
    names.forEach(name => this.touchField(name))
  }

  // 销毁表单管理器
  destroy(): void {
    this.debugLog('Destroying form manager')
    
    // 清理字段配置
    this.fieldConfigs.clear()
    
    // 销毁状态存储
    this.store.destroy()
    
    // 触发表单销毁事件
    this.eventHandlers.onFormDestroy?.()
  }
}

/**
 * 提供表单上下文
 * 
 * @param formManager 表单管理器实例
 */
export function provideFormContext<T = Record<string, any>>(
  formManager: FormManager<T>
): void {
  provide(FORM_CONTEXT_KEY, formManager)
  
  // 在组件卸载时自动销毁表单管理器
  onUnmounted(() => {
    formManager.destroy()
  })
}

/**
 * 注入表单上下文
 * 
 * @returns 表单管理器实例
 */
export function injectFormContext<T = Record<string, any>>(): FormManager<T> | undefined {
  return inject<FormManager<T>>(FORM_CONTEXT_KEY)
}
