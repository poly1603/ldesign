/**
 * useFieldArray Hook 实现
 * 
 * @description
 * 提供 Vue 3 数组字段管理的 Composition API
 */

import { ref, computed, watch, onUnmounted } from 'vue';
import { useField } from './useField';
import type { UseFieldArrayOptions, UseFieldArrayReturn, ReactiveFieldArrayInstance, ReactiveFieldInstance } from '@/types/vue';

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
  const items = ref<ReactiveFieldInstance[]>([]);
  const length = computed(() => items.value.length);
  
  // 初始化数组项
  const initializeItems = (values: any[] = []) => {
    items.value = values.map((value, index) => {
      const itemName = `${name}[${index}]`;
      return useField(itemName, {
        ...options,
        name: itemName,
        initialValue: value
      });
    });
  };

  // 监听数组值变化
  watch(baseField.value, (newValue) => {
    if (Array.isArray(newValue)) {
      initializeItems(newValue);
    }
  }, { immediate: true, deep: true });

  /**
   * 添加数组项
   * @param value 项值
   * @returns 新增的字段实例
   */
  const push = (value?: any): ReactiveFieldInstance => {
    const defaultValue = value ?? options.defaultItem ?? null;
    const currentArray = baseField.getValue() || [];
    const newArray = [...currentArray, defaultValue];
    
    baseField.setValue(newArray);
    
    const newIndex = newArray.length - 1;
    const itemName = `${name}[${newIndex}]`;
    const newItem = useField(itemName, {
      ...options,
      name: itemName,
      initialValue: defaultValue
    });
    
    items.value.push(newItem);
    return newItem;
  };

  /**
   * 移除最后一个数组项
   * @returns 移除的字段实例
   */
  const pop = (): ReactiveFieldInstance | undefined => {
    const currentArray = baseField.getValue() || [];
    if (currentArray.length === 0) {
      return undefined;
    }
    
    const newArray = currentArray.slice(0, -1);
    baseField.setValue(newArray);
    
    return items.value.pop();
  };

  /**
   * 在指定位置插入数组项
   * @param index 插入位置
   * @param value 项值
   * @returns 新增的字段实例
   */
  const insert = (index: number, value?: any): ReactiveFieldInstance => {
    const defaultValue = value ?? options.defaultItem ?? null;
    const currentArray = baseField.getValue() || [];
    const newArray = [...currentArray];
    newArray.splice(index, 0, defaultValue);
    
    baseField.setValue(newArray);
    
    // 重新初始化所有项（因为索引发生了变化）
    initializeItems(newArray);
    
    return items.value[index];
  };

  /**
   * 移除指定位置的数组项
   * @param index 移除位置
   * @returns 移除的字段实例
   */
  const remove = (index: number): ReactiveFieldInstance | undefined => {
    const currentArray = baseField.getValue() || [];
    if (index < 0 || index >= currentArray.length) {
      return undefined;
    }
    
    const newArray = [...currentArray];
    newArray.splice(index, 1);
    baseField.setValue(newArray);
    
    const removedItem = items.value[index];
    
    // 重新初始化所有项（因为索引发生了变化）
    initializeItems(newArray);
    
    return removedItem;
  };

  /**
   * 移动数组项
   * @param fromIndex 源位置
   * @param toIndex 目标位置
   */
  const move = (fromIndex: number, toIndex: number): void => {
    const currentArray = baseField.getValue() || [];
    if (fromIndex < 0 || fromIndex >= currentArray.length || 
        toIndex < 0 || toIndex >= currentArray.length) {
      return;
    }
    
    const newArray = [...currentArray];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);
    
    baseField.setValue(newArray);
    initializeItems(newArray);
  };

  /**
   * 交换数组项
   * @param indexA 位置A
   * @param indexB 位置B
   */
  const swap = (indexA: number, indexB: number): void => {
    const currentArray = baseField.getValue() || [];
    if (indexA < 0 || indexA >= currentArray.length || 
        indexB < 0 || indexB >= currentArray.length) {
      return;
    }
    
    const newArray = [...currentArray];
    [newArray[indexA], newArray[indexB]] = [newArray[indexB], newArray[indexA]];
    
    baseField.setValue(newArray);
    initializeItems(newArray);
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
    return baseField.getValue() || [];
  };

  // 响应式字段数组实例
  const reactiveFieldArrayInstance: ReactiveFieldArrayInstance = {
    ...baseField,
    fieldArray: null as any, // 这里需要实际的 FieldArrayInstance
    items,
    length
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
    getArrayValue
  };

  // 组件卸载时清理
  onUnmounted(() => {
    items.value.forEach(item => {
      // 清理每个数组项
    });
    items.value = [];
  });

  return returnValue;
}

export default useFieldArray;
