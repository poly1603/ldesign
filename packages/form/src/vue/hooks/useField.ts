/**
 * useField Hook 实现
 * 
 * @description
 * 提供 Vue 3 字段管理的 Composition API
 */

import { ref, computed, onUnmounted, watch, inject, type Ref, type ComputedRef } from 'vue';
import type { FieldInstance, ValidationResult, FieldChangeEvent } from '@/types/core';
import type { UseFieldOptions, UseFieldReturn, ReactiveFieldInstance, ReactiveFormInstance } from '@/types/vue';

/**
 * 表单上下文注入键
 */
export const FORM_CONTEXT_KEY = Symbol('form-context');

/**
 * useField Hook 实现
 * @param name 字段名
 * @param options 字段选项
 * @returns 响应式字段实例和操作方法
 */
export function useField(name: string, options: UseFieldOptions = {}): UseFieldReturn {
  // 获取表单实例
  const formContext = inject<ReactiveFormInstance>(FORM_CONTEXT_KEY);
  const form = options.form || formContext?.form;

  if (!form) {
    throw new Error('useField must be used within a form context or provide a form instance');
  }

  // 注册字段到表单
  const fieldConfig = {
    name,
    ...options
  };

  // 检查字段是否已存在，如果存在则获取现有字段
  let field = form.getField(name);
  if (!field) {
    field = form.registerField(fieldConfig);
  }

  // 响应式数据
  const value = ref(field.getValue());
  const validation = ref<ValidationResult | null>(field.validation);

  // 计算属性
  const state = computed(() => Array.from(field.state));
  const isValid = computed(() => {
    const result = validation.value;
    return result === null || result.valid;
  });
  const isDirty = computed(() => field.isDirty());
  const isTouched = computed(() => field.isTouched());
  const isPending = computed(() => field.isPending());

  // 监听字段变化
  field.onChange((event: FieldChangeEvent) => {
    if (event.fieldName === name) {
      value.value = event.value;
    }
  });

  // 监听验证结果变化
  field.onValidate((result: ValidationResult) => {
    validation.value = result;
  });

  // 监听值变化，同步到字段
  watch(value, (newValue) => {
    if (newValue !== field.getValue()) {
      field.setValue(newValue);
    }
  }, { deep: true });

  // 监听字段值变化，同步到响应式值
  watch(() => field.getValue(), (newValue) => {
    if (newValue !== value.value) {
      value.value = newValue;
    }
  }, { deep: true });

  /**
   * 设置字段值
   * @param newValue 新值
   */
  const setValue = (newValue: any): void => {
    // 更新字段值（这会自动同步到表单数据）
    field.setValue(newValue);
    // 更新响应式值
    value.value = newValue;
  };

  /**
   * 获取字段值
   * @returns 字段值
   */
  const getValue = (): any => {
    return field.getValue();
  };

  /**
   * 重置字段
   * @param resetValue 重置值
   */
  const reset = (resetValue?: any): void => {
    field.reset({ value: resetValue });
    value.value = field.getValue();
  };

  /**
   * 验证字段
   * @returns 验证结果
   */
  const validate = async (): Promise<ValidationResult> => {
    const result = await field.validate();
    validation.value = result;
    return result;
  };

  /**
   * 清除验证结果
   */
  const clearValidation = (): void => {
    field.clearValidation();
    validation.value = null;
  };

  /**
   * 标记为已触摸
   */
  const touch = (): void => {
    field.touch();
  };

  /**
   * 标记为未触摸
   */
  const untouch = (): void => {
    field.untouch();
  };

  // 响应式字段实例
  const reactiveFieldInstance: ReactiveFieldInstance = {
    field,
    value,
    state,
    validation: computed(() => validation.value),
    isValid,
    isDirty,
    isTouched,
    isPending
  };

  // 返回值
  const returnValue: UseFieldReturn = {
    ...reactiveFieldInstance,
    setValue,
    getValue,
    reset,
    validate,
    clearValidation,
    touch,
    untouch
  };

  // 组件卸载时清理
  onUnmounted(() => {
    form.unregisterField(name);
  });

  return returnValue;
}

export default useField;
