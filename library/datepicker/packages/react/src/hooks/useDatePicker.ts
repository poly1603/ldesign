/**
 * React hook for DatePicker
 */

import { useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { DatePickerCore, type DatePickerConfig } from '@ldesign/datepicker-core';
import type { PickerValue } from '@ldesign/datepicker-shared';

export function useDatePicker(
  config: DatePickerConfig,
  onChange?: (value: PickerValue) => void
) {
  const coreRef = useRef<DatePickerCore | null>(null);
  const [visible, setVisible] = useState(false);

  // 初始化核心实例
  useEffect(() => {
    coreRef.current = new DatePickerCore({
      ...config,
      onChange: (value) => {
        onChange?.(value);
      },
      onVisibleChange: (vis) => {
        setVisible(vis);
      },
    });

    return () => {
      coreRef.current?.destroy();
    };
  }, []);

  // 使用 useSyncExternalStore 同步状态
  const state = useSyncExternalStore(
    (callback) => {
      const unsubscribe = coreRef.current?.on('change', callback) || (() => {});
      return unsubscribe;
    },
    () => coreRef.current?.getState(),
    () => coreRef.current?.getState()
  );

  const configState = useSyncExternalStore(
    () => () => {},
    () => coreRef.current?.getConfig(),
    () => coreRef.current?.getConfig()
  );

  return {
    core: coreRef.current,
    visible,
    state,
    config: configState,
    selectDate: (date: Date) => coreRef.current?.selectDate(date),
    clear: () => coreRef.current?.clear(),
    setVisible: (vis: boolean) => coreRef.current?.setVisible(vis),
    changeView: (view: any) => coreRef.current?.changeView(view),
    navigatePrev: () => coreRef.current?.navigatePrev(),
    navigateNext: () => coreRef.current?.navigateNext(),
    setHoverDate: (date: Date | null) => coreRef.current?.setHoverDate(date),
  };
}





