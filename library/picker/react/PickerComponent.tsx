import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Picker, PickerOption, PickerConfig } from '../core/Picker';

export interface PickerComponentProps {
  value?: string | number;
  options: PickerOption[];
  disabled?: boolean;
  visibleItems?: number;
  itemHeight?: number;
  panelHeight?: number;
  theme?: 'light' | 'dark' | 'auto';
  enable3d?: boolean;
  showMask?: boolean;
  momentum?: boolean;
  friction?: number;
  snapDuration?: number;
  resistance?: number;
  maxOverscroll?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchDebounce?: number;
  highlightMatch?: boolean;
  hapticFeedback?: boolean;
  hapticIntensity?: number;
  soundEffects?: boolean;
  soundVolume?: number;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (value: string | number | undefined, option?: PickerOption) => void;
  onPick?: (value: string | number | undefined, option?: PickerOption, trigger: string) => void;
}

export interface PickerComponentRef {
  scrollToIndex: (index: number, animate?: boolean) => void;
  scrollToValue: (value: string | number, animate?: boolean) => void;
  getValue: () => string | number | undefined;
  setValue: (value: string | number | undefined, animate?: boolean) => void;
  setOptions: (options: PickerOption[]) => void;
  setDisabled: (disabled: boolean) => void;
}

const PickerComponent = forwardRef<PickerComponentRef, PickerComponentProps>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerInstanceRef = useRef<Picker | null>(null);
  const lastValueRef = useRef<string | number | undefined>(props.value);

  // 初始化Picker
  useEffect(() => {
    if (!containerRef.current) return;

    const config: PickerConfig = {
      options: props.options,
      value: props.value,
      disabled: props.disabled ?? false,
      visibleItems: props.visibleItems ?? 5,
      itemHeight: props.itemHeight ?? 36,
      panelHeight: props.panelHeight,
      theme: props.theme ?? 'light',
      enable3d: props.enable3d ?? false,
      showMask: props.showMask ?? true,
      momentum: props.momentum ?? true,
      friction: props.friction ?? 0.92,
      snapDuration: props.snapDuration ?? 300,
      resistance: props.resistance ?? 0.3,
      maxOverscroll: props.maxOverscroll,
      searchable: props.searchable ?? false,
      searchPlaceholder: props.searchPlaceholder ?? 'Search...',
      searchDebounce: props.searchDebounce ?? 300,
      highlightMatch: props.highlightMatch ?? true,
      hapticFeedback: props.hapticFeedback ?? false,
      hapticIntensity: props.hapticIntensity ?? 5,
      soundEffects: props.soundEffects ?? false,
      soundVolume: props.soundVolume ?? 0.3,
      onChange: (value, option) => {
        lastValueRef.current = value;
        props.onChange?.(value, option);
      },
      onPick: (value, option, trigger) => {
        props.onPick?.(value, option, trigger);
      }
    };

    pickerInstanceRef.current = new Picker(containerRef.current, config);

    return () => {
      pickerInstanceRef.current?.destroy();
      pickerInstanceRef.current = null;
    };
  }, []); // 只在mount时初始化

  // 处理value变化
  useEffect(() => {
    if (pickerInstanceRef.current && props.value !== lastValueRef.current) {
      pickerInstanceRef.current.setValue(props.value);
      lastValueRef.current = props.value;
    }
  }, [props.value]);

  // 处理options变化
  useEffect(() => {
    if (pickerInstanceRef.current) {
      pickerInstanceRef.current.setOptions(props.options);
    }
  }, [props.options]);

  // 处理disabled变化
  useEffect(() => {
    if (pickerInstanceRef.current) {
      pickerInstanceRef.current.setDisabled(props.disabled ?? false);
    }
  }, [props.disabled]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number, animate = true) => {
      pickerInstanceRef.current?.scrollToIndex(index, animate);
    },
    scrollToValue: (value: string | number, animate = true) => {
      pickerInstanceRef.current?.scrollToValue(value, animate);
    },
    getValue: () => {
      return pickerInstanceRef.current?.getValue();
    },
    setValue: (value: string | number | undefined, animate = true) => {
      pickerInstanceRef.current?.setValue(value, animate);
      lastValueRef.current = value;
    },
    setOptions: (options: PickerOption[]) => {
      pickerInstanceRef.current?.setOptions(options);
    },
    setDisabled: (disabled: boolean) => {
      pickerInstanceRef.current?.setDisabled(disabled);
    }
  }));

  return (
    <div 
      ref={containerRef} 
      className={`react-picker-wrapper ${props.className || ''}`}
      style={props.style}
    />
  );
});

PickerComponent.displayName = 'PickerComponent';

export default PickerComponent;