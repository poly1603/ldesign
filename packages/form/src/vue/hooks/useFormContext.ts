/**
 * useFormContext Hook 实现
 * 
 * @description
 * 提供 Vue 3 表单上下文的 Composition API
 */

import { inject, provide } from 'vue';
import type { UseFormContextReturn, ReactiveFormInstance, ReactiveFieldInstance } from '@/types/vue';
import type { FieldConfig } from '@/types/core';
import { FORM_CONTEXT_KEY } from './useField';
import { useField } from './useField';

/**
 * useFormContext Hook 实现
 * @returns 表单上下文
 */
export function useFormContext(): UseFormContextReturn {
  const formContext = inject<ReactiveFormInstance>(FORM_CONTEXT_KEY);

  /**
   * 注册字段
   * @param config 字段配置
   * @returns 响应式字段实例
   */
  const registerField = (config: FieldConfig): ReactiveFieldInstance => {
    if (!formContext) {
      throw new Error('useFormContext must be used within a form context');
    }
    
    return useField(config.name, { ...config, form: formContext.form });
  };

  /**
   * 注销字段
   * @param fieldName 字段名
   */
  const unregisterField = (fieldName: string): void => {
    if (!formContext) {
      throw new Error('useFormContext must be used within a form context');
    }
    
    formContext.form.unregisterField(fieldName);
  };

  /**
   * 获取字段实例
   * @param fieldName 字段名
   * @returns 响应式字段实例
   */
  const getField = (fieldName: string): ReactiveFieldInstance | undefined => {
    if (!formContext) {
      return undefined;
    }
    
    // 这里需要从表单上下文中获取已注册的字段
    // 由于我们没有在 ReactiveFormInstance 中存储字段映射
    // 我们需要通过其他方式获取
    return undefined;
  };

  return {
    form: formContext,
    registerField,
    unregisterField,
    getField
  };
}

/**
 * 提供表单上下文
 * @param formInstance 响应式表单实例
 */
export function provideFormContext(formInstance: ReactiveFormInstance): void {
  provide(FORM_CONTEXT_KEY, formInstance);
}

export default useFormContext;
