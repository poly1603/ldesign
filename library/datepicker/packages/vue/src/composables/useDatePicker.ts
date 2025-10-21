/**
 * Vue composable for DatePicker
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref } from 'vue';
import { DatePickerCore, type DatePickerConfig } from '@ldesign/datepicker-core';
import type { PickerValue } from '@ldesign/datepicker-shared';

export function useDatePicker(
  props: DatePickerConfig,
  emit: (event: string, ...args: any[]) => void
) {
  const core = ref<DatePickerCore>();
  const visible = ref(false);
  const currentValue = ref<PickerValue>(props.defaultValue || null);

  // 初始化核心实例
  onMounted(() => {
    core.value = new DatePickerCore({
      ...props,
      onChange: (value) => {
        currentValue.value = value;
        emit('update:modelValue', value);
        emit('change', value);
      },
      onVisibleChange: (vis) => {
        visible.value = vis;
        emit('visible-change', vis);
      },
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
      onClear: () => emit('clear'),
      onPanelChange: (date, mode) => emit('panel-change', date, mode),
    });
  });

  // 清理
  onUnmounted(() => {
    core.value?.destroy();
  });

  // 状态
  const state = computed(() => core.value?.getState());
  const config = computed(() => core.value?.getConfig());

  // 方法
  const methods = {
    selectDate: (date: Date) => core.value?.selectDate(date),
    clear: () => core.value?.clear(),
    setVisible: (vis: boolean) => core.value?.setVisible(vis),
    changeView: (view: any) => core.value?.changeView(view),
    navigatePrev: () => core.value?.navigatePrev(),
    navigateNext: () => core.value?.navigateNext(),
    setHoverDate: (date: Date | null) => core.value?.setHoverDate(date),
  };

  return {
    core,
    visible,
    currentValue,
    state,
    config,
    ...methods,
  };
}





