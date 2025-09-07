/**
 * useFieldArray Hook 实现
 * 
 * @description
 * 提供 Vue 3 数组字段管理的 Composition API
 */

import { ref, computed, watch, onUnmounted } from 'vue';
import { useField } from './useField';
import type { UseFieldArrayOptions, UseFieldArrayReturn, ReactiveFieldArrayInstance, ReactiveFieldInstance } from '../../types/vue';

/**
 * useFieldArray Hook 实现
 * @param name 字段名
 * @param options 字段数组选项
 * @returns 响应式字段数组实例和操作方法
 */
export function useFieldArray(name: string, options: UseFieldArrayOptions = {}): UseFieldArrayReturn {
  // 使用基础字段功能
  const baseField = useField(name, options);

  // 数组特定的响应式数据
  const arrayValue = ref<any[]>([]);

  // 初始化数组值
  const form = options.form || baseField.field.form;
  const initialValue = form.getFieldValue(name);
  arrayValue.value = Array.isArray(initialValue) ? [...initialValue] : [];

  // 监听表单数据变化
  watch(() => form.getFieldValue(name), (newValue) => {
    const newArray = Array.isArray(newValue) ? [...newValue] : [];
    if (JSON.stringify(newArray) !== JSON.stringify(arrayValue.value)) {
      arrayValue.value = newArray;
    }
  }, { deep: true });

  const length = computed(() => arrayValue.value.length);

  // 为了保持ID稳定性，使用一个稳定的ID生成器
  const stableIdSuffix = Math.random().toString(36).substring(2, 11);

  // 创建数组项的响应式字段实例
  const items = computed(() => {
    return arrayValue.value.map((value, index) => {
      // 为每个数组项生成稳定的ID，基于字段名和索引
      const itemId = `${name}[${index}]_${stableIdSuffix}_${index}`;

      return {
        field: {
          id: itemId,
          config: { name: `${name}[${index}]` },
          value: value,
          validation: null
        },
        id: itemId, // 添加直接的 id 属性供测试使用
        value: value, // 直接返回值
        validation: computed(() => null),
        isValid: computed(() => true),
        isDirty: computed(() => false),
        isTouched: computed(() => false),
        isPending: computed(() => false),
        setValue: (newValue: any) => {
          const form = options.form || baseField.field.form;
          const currentArray = form.getFieldValue(name) || [];
          const newArray = [...currentArray];
          newArray[index] = newValue;
          form.setFieldValue(name, newArray);
        },
        getValue: () => value,
        validate: async () => ({ valid: true }),
        reset: () => {
          const form = options.form || baseField.field.form;
          const currentArray = form.getFieldValue(name) || [];
          const newArray = [...currentArray];
          // 获取初始值
          const initialArray = form.getInitialValue(name) || [];
          const initialValue = initialArray[index];
          newArray[index] = initialValue; // 重置到初始值
          form.setFieldValue(name, newArray);
        }
      } as ReactiveFieldInstance;
    });
  });

  /**
   * 添加数组项
   * @param value 项值
   * @returns 新增的字段实例
   */
  const push = (value?: any): ReactiveFieldInstance => {
    const defaultValue = value ?? options.defaultItem ?? '';
    const form = options.form || baseField.field.form;
    const currentArray = form.getFieldValue(name) || [];
    const newArray = [...currentArray, defaultValue];

    form.setFieldValue(name, newArray);

    // 返回新增的项（从计算属性中获取）
    const newIndex = newArray.length - 1;
    return items.value[newIndex];
  };

  /**
   * 移除最后一个数组项
   * @returns 移除的字段实例
   */
  const pop = (): ReactiveFieldInstance | undefined => {
    const form = options.form || baseField.field.form;
    const currentArray = form.getFieldValue(name) || [];
    if (currentArray.length === 0) {
      return undefined;
    }

    const removedItem = items.value[currentArray.length - 1];
    const newArray = currentArray.slice(0, -1);
    form.setFieldValue(name, newArray);

    return removedItem;
  };

  /**
   * 在指定位置插入数组项
   * @param index 插入位置
   * @param value 项值
   * @returns 新增的字段实例
   */
  const insert = (index: number, value?: any): ReactiveFieldInstance => {
    const defaultValue = value ?? options.defaultItem ?? '';
    const form = options.form || baseField.field.form;
    const currentArray = form.getFieldValue(name) || [];
    const newArray = [...currentArray];
    newArray.splice(index, 0, defaultValue);

    form.setFieldValue(name, newArray);

    // 返回插入的项
    return items.value[index];
  };

  /**
   * 移除指定位置的数组项
   * @param index 移除位置
   * @returns 移除的字段实例
   */
  const remove = (index: number): ReactiveFieldInstance | undefined => {
    const form = options.form || baseField.field.form;
    const currentArray = form.getFieldValue(name) || [];
    if (index < 0 || index >= currentArray.length) {
      return undefined;
    }

    const removedItem = items.value[index];
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    form.setFieldValue(name, newArray);

    return removedItem;
  };

  /**
   * 移动数组项
   * @param fromIndex 源位置
   * @param toIndex 目标位置
   */
  const move = (fromIndex: number, toIndex: number): void => {
    const form = options.form || baseField.field.form;
    const currentArray = form.getFieldValue(name) || [];
    if (fromIndex < 0 || fromIndex >= currentArray.length ||
      toIndex < 0 || toIndex >= currentArray.length) {
      return;
    }

    const newArray = [...currentArray];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);

    form.setFieldValue(name, newArray);
  };

  /**
   * 交换数组项
   * @param indexA 位置A
   * @param indexB 位置B
   */
  const swap = (indexA: number, indexB: number): void => {
    const form = options.form || baseField.field.form;
    const currentArray = form.getFieldValue(name) || [];
    if (indexA < 0 || indexA >= currentArray.length ||
      indexB < 0 || indexB >= currentArray.length) {
      return;
    }

    const newArray = [...currentArray];
    [newArray[indexA], newArray[indexB]] = [newArray[indexB], newArray[indexA]];

    form.setFieldValue(name, newArray);
  };

  /**
   * 获取指定位置的字段实例
   * @param index 位置
   * @returns 字段实例
   */
  const getItem = (index: number): ReactiveFieldInstance | undefined => {
    return items.value[index];
  };

  /**
   * 设置数组值
   * @param values 数组值
   */
  const setArrayValue = (values: any[]): void => {
    baseField.setValue(values);
  };

  /**
   * 获取数组值
   * @returns 数组值
   */
  const getArrayValue = (): any[] => {
    return arrayValue.value;
  };

  // 创建一个简化的 fieldArray 实例
  const fieldArrayInstance = {
    onChange: (callback: (value: any[]) => void) => {
      // 监听数组值变化
      watch(arrayValue, (newValue) => {
        callback(newValue);
      }, { immediate: true });
    },
    onItemChange: (callback: (index: number, value: any) => void) => {
      // 监听单个项变化
      watch(arrayValue, (newArray, oldArray) => {
        if (oldArray) {
          newArray.forEach((value, index) => {
            if (value !== oldArray[index]) {
              callback(index, value);
            }
          });
        }
      });
    }
  };

  // 响应式字段数组实例
  const reactiveFieldArrayInstance: ReactiveFieldArrayInstance = {
    ...baseField,
    fieldArray: fieldArrayInstance as any,
    items,
    length
  };

  // 验证功能
  const validateArray = async () => {
    // 如果有数组级别的验证器，执行验证
    if (options.validator) {
      const result = await options.validator(arrayValue.value, { form });
      return result;
    }
    return { valid: true };
  };

  const validateItem = async (index: number) => {
    // 如果有元素级别的验证器，执行验证
    if (options.itemValidator) {
      const value = arrayValue.value[index];
      const result = await options.itemValidator(value, { form, index });
      return result;
    }
    return { valid: true };
  };

  // 重置功能
  const reset = () => {
    const form = options.form || baseField.field.form;
    const initialValue = form.getInitialValue(name);
    const initialArray = Array.isArray(initialValue) ? [...initialValue] : [];
    form.setFieldValue(name, initialArray);
  };

  // 返回值
  const returnValue: UseFieldArrayReturn = {
    ...reactiveFieldArrayInstance,
    push,
    pop,
    insert,
    remove,
    move,
    swap,
    getItem,
    setArrayValue,
    getArrayValue,
    validateItem,
    validateArray,
    reset
  };

  // 组件卸载时清理
  onUnmounted(() => {
    // 清理资源
  });

  return returnValue;
}

export default useFieldArray;
