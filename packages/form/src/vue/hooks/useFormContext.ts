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
  const formContext = inject<any>(FORM_CONTEXT_KEY);

  // 如果没有表单上下文，返回null
  if (!formContext) {
    return null;
  }

  // formContext 本身就是一个 computed，需要通过 .value 访问
  const context = formContext.value;

  // 如果上下文为null，返回null
  if (!context) {
    return null;
  }

  /**
   * 注册字段
   * @param config 字段配置
   * @returns 响应式字段实例
   */
  const registerField = (config: FieldConfig): ReactiveFieldInstance => {
    if (!context || !context.form) {
      throw new Error('useFormContext must be used within a form context');
    }

    return useField(config.name, { ...config, form: context.form });
  };

  /**
   * 注销字段
   * @param fieldName 字段名
   */
  const unregisterField = (fieldName: string): void => {
    if (!context || !context.form) {
      throw new Error('useFormContext must be used within a form context');
    }

    context.form.unregisterField(fieldName);
  };

  /**
   * 获取字段实例
   * @param fieldName 字段名
   * @returns 响应式字段实例
   */
  const getField = (fieldName: string): ReactiveFieldInstance | undefined => {
    if (!context || !context.form) {
      return undefined;
    }

    // 这里需要从表单上下文中获取已注册的字段
    // 由于我们没有在 ReactiveFormInstance 中存储字段映射
    // 我们需要通过其他方式获取
    return undefined;
  };

  return {
    form: context.form,
    formId: context.formId,
    formData: context.formData,
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
