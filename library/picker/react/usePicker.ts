import { useEffect, useRef, useState, useCallback, MutableRefObject } from 'react';
import { Picker, PickerOption, PickerConfig } from '../core/Picker';

export interface UsePickerOptions extends Omit<PickerConfig, 'onChange' | 'onPick'> {
  container?: MutableRefObject<HTMLElement | null> | string;
}

export interface UsePickerReturn {
  // 状态
  value: string | number | undefined;
  currentOption: PickerOption | undefined;
  isReady: boolean;
  
  // 方法
  scrollToIndex: (index: number, animate?: boolean) => void;
  scrollToValue: (value: string | number, animate?: boolean) => void;
  setValue: (value: string | number | undefined, animate?: boolean) => void;
  setOptions: (options: PickerOption[]) => void;
  setDisabled: (disabled: boolean) => void;
  refresh: () => void;
  destroy: () => void;
}

export function usePicker(options: UsePickerOptions): UsePickerReturn {
  // 状态
  const [value, setValueState] = useState<string | number | undefined>(
    options.value ?? options.defaultValue
  );
  const [currentOption, setCurrentOption] = useState<PickerOption | undefined>();
  const [isReady, setIsReady] = useState(false);
  
  // Refs
  const pickerInstanceRef = useRef<Picker | null>(null);
  const optionsRef = useRef(options);
  const changeCallbacksRef = useRef<Set<(value: string | number | undefined, option?: PickerOption) => void>>(new Set());
  const pickCallbacksRef = useRef<Set<(value: string | number | undefined, option?: PickerOption, trigger: string) => void>>(new Set());
  
  // 更新options引用
  optionsRef.current = options;
  
  // 初始化Picker
  const initPicker = useCallback(() => {
    let containerElement: HTMLElement | null = null;
    
    // 获取容器元素
    if (options.container) {
      if (typeof options.container === 'string') {
        containerElement = document.querySelector(options.container) as HTMLElement;
      } else if (options.container.current) {
        containerElement = options.container.current;
      }
    }
    
    if (!containerElement) {
      console.warn('usePicker: 未找到容器元素');
      return;
    }
    
    // 销毁旧实例
    if (pickerInstanceRef.current) {
      pickerInstanceRef.current.destroy();
    }
    
    // 创建配置
    const config: PickerConfig = {
      ...options,
      onChange: (val, opt) => {
        setValueState(val);
        setCurrentOption(opt);
        changeCallbacksRef.current.forEach(cb => cb(val, opt));
      },
      onPick: (val, opt, trigger) => {
        pickCallbacksRef.current.forEach(cb => cb(val, opt, trigger));
      }
    };
    
    // 创建实例
    pickerInstanceRef.current = new Picker(containerElement, config);
    setIsReady(true);
    
    // 初始化当前选项
    if ((options.value ?? options.defaultValue) !== undefined && options.options) {
      const initialOption = options.options.find(
        opt => opt.value === (options.value ?? options.defaultValue)
      );
      setCurrentOption(initialOption);
    }
  }, [options]);
  
  // 方法实现
  const scrollToIndex = useCallback((index: number, animate = true) => {
    pickerInstanceRef.current?.scrollToIndex(index, animate);
  }, []);
  
  const scrollToValue = useCallback((val: string | number, animate = true) => {
    pickerInstanceRef.current?.scrollToValue(val, animate);
  }, []);
  
  const setValue = useCallback((val: string | number | undefined, animate = true) => {
    setValueState(val);
    pickerInstanceRef.current?.setValue(val, animate);
    if (val !== undefined && optionsRef.current.options) {
      const option = optionsRef.current.options.find(opt => opt.value === val);
      setCurrentOption(option);
    }
  }, []);
  
  const setOptions = useCallback((newOptions: PickerOption[]) => {
    pickerInstanceRef.current?.setOptions(newOptions);
    // 更新当前选项
    if (value !== undefined) {
      const option = newOptions.find(opt => opt.value === value);
      setCurrentOption(option);
    }
  }, [value]);
  
  const setDisabled = useCallback((disabled: boolean) => {
    pickerInstanceRef.current?.setDisabled(disabled);
  }, []);
  
  const refresh = useCallback(() => {
    initPicker();
  }, [initPicker]);
  
  const destroy = useCallback(() => {
    if (pickerInstanceRef.current) {
      pickerInstanceRef.current.destroy();
      pickerInstanceRef.current = null;
      setIsReady(false);
    }
  }, []);
  
  // 初始化
  useEffect(() => {
    // 延迟初始化，确保DOM已准备好
    const timer = setTimeout(() => {
      initPicker();
    }, 0);
    
    return () => {
      clearTimeout(timer);
      destroy();
    };
  }, []);
  
  // 监听value prop变化
  useEffect(() => {
    if (pickerInstanceRef.current && options.value !== undefined) {
      pickerInstanceRef.current.setValue(options.value);
      setValueState(options.value);
    }
  }, [options.value]);
  
  return {
    value,
    currentOption,
    isReady,
    scrollToIndex,
    scrollToValue,
    setValue,
    setOptions,
    setDisabled,
    refresh,
    destroy
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
  container?: MutableRefObject<HTMLElement | null> | string;
  gap?: string;
  onChange?: (values: Record<string, string | number | undefined>) => void;
}

export interface UseMultiPickerReturn {
  values: Record<string, string | number | undefined>;
  setColumnValue: (key: string, value: string | number | undefined) => void;
  setColumnOptions: (key: string, options: PickerOption[]) => void;
  getColumnValue: (key: string) => string | number | undefined;
  destroy: () => void;
}

export function useMultiPicker(options: UseMultiPickerOptions): UseMultiPickerReturn {
  const [values, setValues] = useState<Record<string, string | number | undefined>>(() => {
    const initialValues: Record<string, string | number | undefined> = {};
    options.columns.forEach(column => {
      initialValues[column.key] = column.value;
    });
    return initialValues;
  });
  
  const pickersRef = useRef<Record<string, Picker>>({});
  const containerElementRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLElement | null>(null);
  
  // 初始化多列Picker
  const initMultiPicker = useCallback(() => {
    // 获取容器
    if (options.container) {
      if (typeof options.container === 'string') {
        containerElementRef.current = document.querySelector(options.container) as HTMLElement;
      } else if (options.container.current) {
        containerElementRef.current = options.container.current;
      }
    }
    
    if (!containerElementRef.current) {
      console.warn('useMultiPicker: 未找到容器元素');
      return;
    }
    
    // 清理旧的wrapper
    if (wrapperRef.current) {
      wrapperRef.current.remove();
    }
    
    // 创建wrapper
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.gap = options.gap || '8px';
    containerElementRef.current.appendChild(wrapper);
    wrapperRef.current = wrapper;
    
    // 创建每列
    const newValues: Record<string, string | number | undefined> = {};
    
    options.columns.forEach(column => {
      const columnEl = document.createElement('div');
      columnEl.style.flex = '1';
      wrapper.appendChild(columnEl);
      
      const config: PickerConfig = {
        ...column.config,
        options: column.options,
        value: column.value,
        onChange: (value) => {
          setValues(prev => ({
            ...prev,
            [column.key]: value
          }));
          options.onChange?.({
            ...values,
            [column.key]: value
          });
        }
      };
      
      pickersRef.current[column.key] = new Picker(columnEl, config);
      newValues[column.key] = column.value;
    });
    
    setValues(newValues);
  }, [options, values]);
  
  // 方法实现
  const setColumnValue = useCallback((key: string, value: string | number | undefined) => {
    if (pickersRef.current[key]) {
      pickersRef.current[key].setValue(value);
      setValues(prev => ({
        ...prev,
        [key]: value
      }));
    }
  }, []);
  
  const setColumnOptions = useCallback((key: string, options: PickerOption[]) => {
    if (pickersRef.current[key]) {
      pickersRef.current[key].setOptions(options);
    }
  }, []);
  
  const getColumnValue = useCallback((key: string) => {
    return values[key];
  }, [values]);
  
  const destroy = useCallback(() => {
    Object.values(pickersRef.current).forEach(picker => picker.destroy());
    pickersRef.current = {};
    if (wrapperRef.current) {
      wrapperRef.current.remove();
      wrapperRef.current = null;
    }
  }, []);
  
  // 初始化
  useEffect(() => {
    const timer = setTimeout(() => {
      initMultiPicker();
    }, 0);
    
    return () => {
      clearTimeout(timer);
      destroy();
    };
  }, []);
  
  return {
    values,
    setColumnValue,
    setColumnOptions,
    getColumnValue,
    destroy
  };
}