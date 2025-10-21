<template>
  <div class="ldate-picker" ref="pickerRef">
    <!-- 输入框 -->
    <div class="ldate-input" @click="handleInputClick">
      <input
        v-if="!isRange"
        class="ldate-input__inner"
        :value="displayValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="!editable"
        @focus="handleFocus"
        @blur="handleBlur"
      />
      
      <!-- 范围输入 -->
      <div v-else class="ldate-range-input">
        <input
          class="ldate-range-input__inner"
          :value="displayStartValue"
          :placeholder="startPlaceholder"
          :disabled="disabled"
          :readonly="!editable"
          @focus="handleFocus"
        />
        <span class="ldate-range-separator">{{ rangeSeparator }}</span>
        <input
          class="ldate-range-input__inner"
          :value="displayEndValue"
          :placeholder="endPlaceholder"
          :disabled="disabled"
          :readonly="!editable"
          @focus="handleFocus"
        />
      </div>
      
      <!-- 清除按钮 -->
      <span
        v-if="clearable && currentValue && !disabled"
        class="ldate-input__suffix"
        @click.stop="handleClear"
      >
        ✕
      </span>
    </div>
    
    <!-- 下拉面板 -->
    <teleport to="body">
      <div
        v-if="visible"
        class="ldate-popper ldate-zoom-enter"
        :class="{ 'ldate-popper--range': isRange }"
        :style="popperStyle"
        ref="popperRef"
      >
        <!-- 日期范围双面板 -->
        <date-range-panel
          v-if="type === 'daterange' && state?.view === 'date'"
          :core="core"
          :state="state"
          :config="config"
          @select-date="handleSelectDate"
        />
        
        <!-- 单个日期选择 -->
        <date-panel
          v-else-if="!isRange && state?.view === 'date'"
          :core="core"
          :state="state"
          :config="config"
          @select-date="handleSelectDate"
        />
        
        <!-- 月份范围双面板 -->
        <month-range-panel
          v-else-if="type === 'monthrange' && state?.view === 'month'"
          :core="core"
          :state="state"
          :config="config"
          @select-month="handleSelectMonth"
        />
        
        <!-- 单个月份选择 -->
        <month-panel
          v-else-if="!isRange && state?.view === 'month'"
          :core="core"
          :state="state"
          :config="config"
          @select-month="handleSelectMonth"
        />
        
        <!-- 年份范围双面板 -->
        <year-range-panel
          v-else-if="type === 'yearrange' && state?.view === 'year'"
          :core="core"
          :state="state"
          :config="config"
          @select-year="handleSelectYear"
        />
        
        <!-- 单个年份选择 -->
        <year-panel
          v-else-if="!isRange && state?.view === 'year'"
          :core="core"
          :state="state"
          :config="config"
          @select-year="handleSelectYear"
        />
        
        <time-panel
          v-else-if="state?.view === 'time'"
          :core="core"
          :state="state"
          :config="config"
          @select-time="handleSelectTime"
        />
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useDatePicker } from '../composables/useDatePicker';
import { formatDate } from '@ldesign/datepicker-shared';
import type { PickerType, PickerValue } from '@ldesign/datepicker-shared';
import DatePanel from './panels/DatePanel.vue';
import DateRangePanel from './panels/DateRangePanel.vue';
import MonthPanel from './panels/MonthPanel.vue';
import MonthRangePanel from './panels/MonthRangePanel.vue';
import YearPanel from './panels/YearPanel.vue';
import YearRangePanel from './panels/YearRangePanel.vue';
import TimePanel from './panels/TimePanel.vue';

// Props
const props = withDefaults(
  defineProps<{
    modelValue?: PickerValue;
    type?: PickerType;
    format?: string;
    placeholder?: string;
    startPlaceholder?: string;
    endPlaceholder?: string;
    rangeSeparator?: string;
    clearable?: boolean;
    editable?: boolean;
    disabled?: boolean;
  }>(),
  {
    type: 'date',
    placeholder: '选择日期',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    rangeSeparator: '至',
    clearable: true,
    editable: true,
    disabled: false,
  }
);

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: PickerValue];
  change: [value: PickerValue];
  focus: [];
  blur: [];
  clear: [];
  'visible-change': [visible: boolean];
  'panel-change': [date: Date, mode: string];
}>();

// Use composable
const {
  core,
  visible,
  currentValue,
  state,
  config,
  selectDate,
  clear,
  setVisible,
  changeView,
  navigatePrev,
  navigateNext,
} = useDatePicker(
  {
    type: props.type,
    format: props.format,
    placeholder: props.placeholder,
    clearable: props.clearable,
    editable: props.editable,
  },
  emit
);

// Refs
const pickerRef = ref<HTMLElement>();
const popperRef = ref<HTMLElement>();

// Computed
const isRange = computed(() => props.type.endsWith('range'));

const displayValue = computed(() => {
  if (!currentValue.value) return '';
  if (currentValue.value instanceof Date) {
    return formatDate(currentValue.value, props.format || 'YYYY-MM-DD');
  }
  return '';
});

const displayStartValue = computed(() => {
  if (!currentValue.value || !Array.isArray(currentValue.value)) return '';
  const [start] = currentValue.value;
  return start ? formatDate(start, props.format || 'YYYY-MM-DD') : '';
});

const displayEndValue = computed(() => {
  if (!currentValue.value || !Array.isArray(currentValue.value)) return '';
  const [, end] = currentValue.value;
  return end ? formatDate(end, props.format || 'YYYY-MM-DD') : '';
});

const popperStyle = computed(() => {
  if (!pickerRef.value) return {};
  
  const rect = pickerRef.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
  };
});

// Methods
const handleInputClick = () => {
  if (!props.disabled) {
    setVisible(!visible.value);
  }
};

const handleFocus = () => {
  emit('focus');
};

const handleBlur = () => {
  emit('blur');
};

const handleClear = () => {
  clear();
};

const handleSelectDate = (date: Date) => {
  selectDate(date);
};

const handleSelectMonth = (month: number) => {
  // 选择月份逻辑
  if (state.value) {
    const newDate = new Date(state.value.currentDate.getFullYear(), month, 1);
    selectDate(newDate);
  }
};

const handleSelectYear = (year: number) => {
  // 选择年份逻辑
  if (state.value) {
    const newDate = new Date(year, state.value.currentDate.getMonth(), 1);
    selectDate(newDate);
  }
};

const handleSelectTime = (time: Date) => {
  selectDate(time);
};

// 监听外部点击
const handleClickOutside = (e: MouseEvent) => {
  if (
    pickerRef.value &&
    popperRef.value &&
    !pickerRef.value.contains(e.target as Node) &&
    !popperRef.value.contains(e.target as Node)
  ) {
    setVisible(false);
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

// 同步外部 modelValue
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== currentValue.value) {
      currentValue.value = newVal || null;
    }
  },
  { immediate: true }
);
</script>

<style>
@import '@ldesign/datepicker-core/dist/style.css';
</style>





