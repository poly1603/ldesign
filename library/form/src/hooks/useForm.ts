/**
 * useForm Hook
 * 
 * 提供表单状态管理和操作的自定义Hook
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

import { onUnmounted } from 'vue'
import type { UseFormOptions, UseFormReturn } from './types'
import { FormManager, provideFormContext } from '../core/form/manager'

/**
 * 表单管理Hook
 * 
 * @param options 表单配置选项
 * @returns 表单管理接口
 */
export function useForm<T = Record<string, any>>(
  options: UseFormOptions<T> = {}
): UseFormReturn<T> {
  // 创建表单管理器
  const formManager = new FormManager<T>(options)
  
  // 提供表单上下文
  provideFormContext(formManager)
  
  // 组件卸载时清理
  onUnmounted(() => {
    formManager.destroy()
  })
  
  return {
    // 计算属性
    values: formManager.values,
    errors: formManager.errors,
    valid: formManager.valid,
    submitting: formManager.submitting,
    validating: formManager.validating,
    dirty: formManager.dirty,
    
    // 字段值操作
    setFieldValue: formManager.setFieldValue.bind(formManager),
    setFieldsValue: formManager.setFieldsValue.bind(formManager),
    getFieldValue: formManager.getFieldValue.bind(formManager),
    getFieldsValue: formManager.getFieldsValue.bind(formManager),
    
    // 验证操作
    validateField: formManager.validateField.bind(formManager),
    validateFields: formManager.validateFields.bind(formManager),
    validateForm: formManager.validateForm.bind(formManager),
    
    // 重置操作
    resetField: formManager.resetField.bind(formManager),
    resetFields: formManager.resetFields.bind(formManager),
    resetForm: formManager.resetForm.bind(formManager),
    
    // 提交操作
    submitForm: formManager.submitForm.bind(formManager),
    
    // 错误操作
    clearErrors: formManager.clearErrors.bind(formManager),
    clearFieldError: formManager.clearFieldError.bind(formManager),
    setFieldError: formManager.setFieldError.bind(formManager),
    setFieldsError: formManager.setFieldsError.bind(formManager),
  }
}
