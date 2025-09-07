/**
 * useForm Hook 实现
 * 
 * @description
 * 提供 Vue 3 表单管理的 Composition API
 */

import { ref, computed, onUnmounted, watch, type Ref, type ComputedRef } from 'vue';
import { createForm } from '../../core/form';
import type { FormInstance, FormConfig, ValidationResult, FormChangeEvent, FormSubmitEvent } from '../../types/core';
import type { UseFormOptions, UseFormReturn, ReactiveFormInstance, ReactiveFieldInstance } from '../../types/vue';
import { useField } from './useField';

/**
 * useForm Hook 实现
 * @param options 表单选项
 * @returns 响应式表单实例和操作方法
 */
export function useForm(options: UseFormOptions = {}): UseFormReturn {
  // 创建表单实例
  const form = createForm(options);

  // 响应式数据
  const data = ref(form.getValues());
  const validation = ref<Record<string, ValidationResult>>({});

  // 计算属性
  const state = computed(() => Array.from(form.state));
  const isValid = computed(() => {
    const validationResults = validation.value;
    return Object.keys(validationResults).length === 0 ||
      Object.values(validationResults).every(result => result.valid);
  });
  const isDirty = computed(() => {
    // 触发响应式更新，监听表单数据变化
    data.value;
    return form.hasState('dirty' as any);
  });
  const isPending = computed(() => {
    data.value;
    return form.hasState('pending' as any);
  });
  const isSubmitted = computed(() => {
    data.value;
    return form.hasState('submitted' as any);
  });

  // 监听表单变化
  form.onChange((event: FormChangeEvent) => {
    data.value = form.getValues();
  });

  // 监听验证结果变化
  form.events.on('form:validate', (results: Record<string, ValidationResult>) => {
    validation.value = results;
  });

  // 字段管理
  const registeredFields = new Map<string, ReactiveFieldInstance>();

  /**
   * 设置字段值
   * @param fieldName 字段名
   * @param value 字段值
   */
  const setFieldValue = (fieldName: string, value: any): void => {
    form.setFieldValue(fieldName, value);
  };

  /**
   * 获取字段值
   * @param fieldName 字段名
   * @returns 字段值
   */
  const getFieldValue = (fieldName: string): any => {
    return form.getFieldValue(fieldName);
  };

  /**
   * 设置多个字段值
   * @param values 字段值对象
   */
  const setValues = (values: Record<string, any>): void => {
    form.setValues(values);
  };

  /**
   * 获取所有字段值
   * @returns 表单数据
   */
  const getValues = (): Record<string, any> => {
    return form.getValues();
  };

  /**
   * 重置表单
   * @param values 重置值
   */
  const reset = (values?: Record<string, any>): void => {
    form.reset({ values });
    // 手动触发响应式更新
    data.value = { ...form.getValues() };
  };

  /**
   * 验证表单
   * @returns 验证结果
   */
  const validate = async (): Promise<Record<string, ValidationResult>> => {
    const results = await form.validate();
    validation.value = results;
    return results;
  };

  /**
   * 验证字段
   * @param fieldName 字段名
   * @returns 验证结果
   */
  const validateField = async (fieldName: string): Promise<ValidationResult> => {
    const result = await form.validateField(fieldName);
    validation.value = { ...validation.value, [fieldName]: result };
    return result;
  };

  /**
   * 清除验证结果
   * @param fieldNames 字段名数组
   */
  const clearValidation = (fieldNames?: string[]): void => {
    form.clearValidation(fieldNames);
    if (fieldNames) {
      const newValidation = { ...validation.value };
      fieldNames.forEach(name => {
        delete newValidation[name];
      });
      validation.value = newValidation;
    } else {
      validation.value = {};
    }
  };

  /**
   * 提交表单
   * @returns 提交结果
   */
  const submit = async (): Promise<FormSubmitEvent> => {
    return await form.submit();
  };

  /**
   * 注册字段
   * @param config 字段配置
   * @returns 响应式字段实例
   */
  const registerField = (config: import('../../types/core').FieldConfig): ReactiveFieldInstance => {
    // 检查字段是否已存在
    if (registeredFields.has(config.name)) {
      return registeredFields.get(config.name)!;
    }

    // 检查表单中是否已存在该字段
    let field = form.getField(config.name);
    if (!field) {
      field = form.registerField(config);
    }

    const reactiveField = useField(config.name, { form });
    registeredFields.set(config.name, reactiveField);
    return reactiveField;
  };

  /**
   * 注销字段
   * @param fieldName 字段名
   */
  const unregisterField = (fieldName: string): void => {
    form.unregisterField(fieldName);
    registeredFields.delete(fieldName);
  };

  /**
   * 获取字段实例
   * @param fieldName 字段名
   * @returns 响应式字段实例
   */
  const getField = (fieldName: string): ReactiveFieldInstance | undefined => {
    return registeredFields.get(fieldName);
  };

  // 响应式表单实例
  const reactiveFormInstance: ReactiveFormInstance = {
    form,
    data,
    state,
    validation: computed(() => validation.value),
    isValid,
    isDirty,
    isPending,
    isSubmitted
  };

  // 返回值
  const returnValue: UseFormReturn = {
    ...reactiveFormInstance,
    setFieldValue,
    getFieldValue,
    setValues,
    getValues,
    reset,
    validate,
    validateField,
    clearValidation,
    submit,
    registerField,
    unregisterField,
    getField
  };

  // 组件卸载时清理
  try {
    onUnmounted(() => {
      form.destroy();
      registeredFields.clear();
    });
  } catch (error) {
    // 如果没有活动的组件实例，忽略错误
    // 这通常发生在组件重新渲染或异步操作中
    console.warn('Failed to register onUnmounted hook:', error);
  }

  return returnValue;
}

export default useForm;
