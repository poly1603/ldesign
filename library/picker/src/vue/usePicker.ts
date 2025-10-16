import { ref, onMounted, onUnmounted, Ref, watch } from 'vue';
import { Picker, PickerOption, PickerConfig } from '../core/Picker';

export interface UsePickerOptions extends Omit<PickerConfig, 'onChange' | 'onPick'> {
  container?: Ref<HTMLElement | undefined> | string;
}

export interface UsePickerReturn {
  // 响应式数据
  value: Ref<string | number | undefined>;
  currentOption: Ref<PickerOption | undefined>;
  isSearching: Ref<boolean>;
  
  // 方法
  scrollToIndex: (index: number, animate?: boolean) => void;
  scrollToValue: (value: string | number, animate?: boolean) => void;
  setValue: (value: string | number | undefined, animate?: boolean) => void;
  setOptions: (options: PickerOption[]) => void;
  setDisabled: (disabled: boolean) => void;
  refresh: () => void;
  destroy: () => void;
  
  // 事件
  onChange: (callback: (value: string | number | undefined, option?: PickerOption) => void) => void;
  onPick: (callback: (value: string | number | undefined, option?: PickerOption, trigger: string) => void) => void;
}

export function usePicker(options: UsePickerOptions): UsePickerReturn {
  // 响应式状态
  const value = ref<string | number | undefined>(options.value ?? options.defaultValue);
  const currentOption = ref<PickerOption | undefined>();
  const isSearching = ref(false);
  
  // 实例引用
  let pickerInstance: Picker | null = null;
  let containerElement: HTMLElement | null = null;
  
  // 事件回调
  let changeCallback: ((value: string | number | undefined, option?: PickerOption) => void) | null = null;
  let pickCallback: ((value: string | number | undefined, option?: PickerOption, trigger: string) => void) | null = null;
  
  // 初始化Picker
  const initPicker = () => {
    // 获取容器元素
    if (options.container) {
      if (typeof options.container === 'string') {
        containerElement = document.querySelector(options.container) as HTMLElement;
      } else if (options.container.value) {
        containerElement = options.container.value;
      }
    }
    
    if (!containerElement) {
      console.warn('usePicker: 未找到容器元素');
      return;
    }
    
    // 创建配置
    const config: PickerConfig = {
      ...options,
      value: value.value,
      onChange: (val, opt) => {
        value.value = val;
        currentOption.value = opt;
        changeCallback?.(val, opt);
      },
      onPick: (val, opt, trigger) => {
        pickCallback?.(val, opt, trigger);
      }
    };
    
    // 创建实例
    pickerInstance = new Picker(containerElement, config);
    
    // 初始化当前选项
    if (value.value !== undefined && options.options) {
      currentOption.value = options.options.find(opt => opt.value === value.value);
    }
  };
  
  // 方法实现
  const scrollToIndex = (index: number, animate = true) => {
    pickerInstance?.scrollToIndex(index, animate);
  };
  
  const scrollToValue = (val: string | number, animate = true) => {
    pickerInstance?.scrollToValue(val, animate);
  };
  
  const setValue = (val: string | number | undefined, animate = true) => {
    value.value = val;
    pickerInstance?.setValue(val, animate);
    if (val !== undefined && options.options) {
      currentOption.value = options.options.find(opt => opt.value === val);
    }
  };
  
  const setOptions = (newOptions: PickerOption[]) => {
    pickerInstance?.setOptions(newOptions);
    // 更新当前选项
    if (value.value !== undefined) {
      currentOption.value = newOptions.find(opt => opt.value === value.value);
    }
  };
  
  const setDisabled = (disabled: boolean) => {
    pickerInstance?.setDisabled(disabled);
  };
  
  const refresh = () => {
    destroy();
    initPicker();
  };
  
  const destroy = () => {
    if (pickerInstance) {
      pickerInstance.destroy();
      pickerInstance = null;
    }
  };
  
  // 事件注册
  const onChange = (callback: (value: string | number | undefined, option?: PickerOption) => void) => {
    changeCallback = callback;
  };
  
  const onPick = (callback: (value: string | number | undefined, option?: PickerOption, trigger: string) => void) => {
    pickCallback = callback;
  };
  
  // 监听value变化
  watch(value, (newValue) => {
    if (pickerInstance && pickerInstance.getValue() !== newValue) {
      pickerInstance.setValue(newValue);
    }
  });
  
  // 生命周期
  onMounted(() => {
    // 延迟初始化，确保DOM已准备好
    setTimeout(() => {
      initPicker();
    }, 0);
  });
  
  onUnmounted(() => {
    destroy();
  });
  
  return {
    // 响应式数据
    value,
    currentOption,
    isSearching,
    
    // 方法
    scrollToIndex,
    scrollToValue,
    setValue,
    setOptions,
    setDisabled,
    refresh,
    destroy,
    
    // 事件
    onChange,
    onPick
  };
}

// 多列Picker Hook
export interface UseMultiPickerColumn {
  key: string;
  options: PickerOption[];
  value?: string | number;
  config?: Partial<PickerConfig>;
}

export interface UseMultiPickerOptions {
  columns: UseMultiPickerColumn[];
  container?: Ref<HTMLElement | undefined> | string;
  gap?: string;
  onChange?: (values: Record<string, string | number | undefined>) => void;
}

export interface UseMultiPickerReturn {
  values: Ref<Record<string, string | number | undefined>>;
  setColumnValue: (key: string, value: string | number | undefined) => void;
  setColumnOptions: (key: string, options: PickerOption[]) => void;
  getColumnValue: (key: string) => string | number | undefined;
  destroy: () => void;
}

export function useMultiPicker(options: UseMultiPickerOptions): UseMultiPickerReturn {
  const values = ref<Record<string, string | number | undefined>>({});
  const pickers: Record<string, Picker> = {};
  let containerElement: HTMLElement | null = null;
  
  const initMultiPicker = () => {
    // 获取容器
    if (options.container) {
      if (typeof options.container === 'string') {
        containerElement = document.querySelector(options.container) as HTMLElement;
      } else if (options.container.value) {
        containerElement = options.container.value;
      }
    }
    
    if (!containerElement) {
      console.warn('useMultiPicker: 未找到容器元素');
      return;
    }
    
    // 创建wrapper
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = options.gap || '8px';
    containerElement.appendChild(wrapper);
    
    // 创建每列
    options.columns.forEach(column => {
      const columnEl = document.createElement('div');
      columnEl.style.flex = '1';
      wrapper.appendChild(columnEl);
      
      const config: PickerConfig = {
        ...column.config,
        options: column.options,
        value: column.value,
        onChange: (value) => {
          values.value[column.key] = value;
          options.onChange?.(values.value);
        }
      };
      
      pickers[column.key] = new Picker(columnEl, config);
      values.value[column.key] = column.value;
    });
  };
  
  const setColumnValue = (key: string, value: string | number | undefined) => {
    if (pickers[key]) {
      pickers[key].setValue(value);
      values.value[key] = value;
    }
  };
  
  const setColumnOptions = (key: string, options: PickerOption[]) => {
    if (pickers[key]) {
      pickers[key].setOptions(options);
    }
  };
  
  const getColumnValue = (key: string) => {
    return values.value[key];
  };
  
  const destroy = () => {
    Object.values(pickers).forEach(picker => picker.destroy());
    if (containerElement) {
      containerElement.innerHTML = '';
    }
  };
  
  onMounted(() => {
    setTimeout(() => {
      initMultiPicker();
    }, 0);
  });
  
  onUnmounted(() => {
    destroy();
  });
  
  return {
    values,
    setColumnValue,
    setColumnOptions,
    getColumnValue,
    destroy
  };
}