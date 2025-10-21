<template>
  <div class="ldate-panel ldate-date-panel">
    <!-- 头部 -->
    <div class="ldate-panel__header">
      <span class="ldate-panel__arrow" @click="handlePrevYear">«</span>
      <span class="ldate-panel__arrow" @click="handlePrevMonth">‹</span>
      <span class="ldate-panel__header-label" @click="handleLabelClick">
        {{ headerLabel }}
      </span>
      <span class="ldate-panel__arrow" @click="handleNextMonth">›</span>
      <span class="ldate-panel__arrow" @click="handleNextYear">»</span>
    </div>
    
    <!-- 星期标题 -->
    <div class="ldate-date-panel__week">
      <div
        v-for="(day, index) in weekdays"
        :key="index"
        class="ldate-date-panel__week-day"
      >
        {{ day }}
      </div>
    </div>
    
    <!-- 日期网格 -->
    <div class="ldate-date-panel__body">
      <div
        v-for="(row, rowIndex) in cells"
        :key="rowIndex"
        class="ldate-date-panel__row"
      >
        <div
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          :class="getCellClass(cell)"
          @click="handleCellClick(cell)"
          @mouseenter="handleCellHover(cell)"
        >
          {{ cell.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DatePanel as DatePanelCore } from '@ldesign/datepicker-core';
import type { DateCell } from '@ldesign/datepicker-shared';
import { zhCN } from '@ldesign/datepicker-shared';

const props = defineProps<{
  core: any;
  state: any;
  config: any;
}>();

const emit = defineEmits<{
  'select-date': [date: Date];
}>();

// Computed
const headerLabel = computed(() => {
  if (!props.state) return '';
  const date = props.state.currentDate;
  return `${date.getFullYear()}年 ${date.getMonth() + 1}月`;
});

const weekdays = computed(() => {
  const panel = new DatePanelCore({
    year: 2024,
    month: 0,
    value: null,
    weekStartsOn: 1,
  });
  return panel.getWeekdayHeaders(zhCN.weekdaysMin);
});

const cells = computed(() => {
  if (!props.state) return [];
  
  const date = props.state.currentDate;
  const value = props.state.value instanceof Date ? props.state.value : null;
  const rangeStart = props.state.rangeStart;
  const rangeEnd = Array.isArray(props.state.value) && props.state.value[1] 
    ? props.state.value[1] 
    : null;
  const hoverDate = props.state.hoverDate;
  
  const panel = new DatePanelCore({
    year: date.getFullYear(),
    month: date.getMonth(),
    value,
    rangeStart,
    rangeEnd,
    hoverDate,
    weekStartsOn: 1,
    disabledDate: props.config?.disabledDate,
  });
  
  return panel.generateCells();
});

// Methods
const getCellClass = (cell: DateCell) => {
  return [
    'ldate-cell',
    `ldate-cell--${cell.type}`,
    {
      'ldate-cell--selected': cell.selected,
      'ldate-cell--disabled': cell.disabled,
      'ldate-cell--in-range': cell.inRange,
      'ldate-cell--range-start': cell.rangeStart,
      'ldate-cell--range-end': cell.rangeEnd,
    },
  ];
};

const handleCellClick = (cell: DateCell) => {
  if (!cell.disabled) {
    emit('select-date', cell.date);
  }
};

const handleCellHover = (cell: DateCell) => {
  if (!cell.disabled) {
    props.core?.setHoverDate(cell.date);
  }
};

const handlePrevYear = () => {
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
  props.core?.navigatePrev();
};

const handlePrevMonth = () => {
  props.core?.navigatePrev();
};

const handleNextMonth = () => {
  props.core?.navigateNext();
};

const handleNextYear = () => {
  for (let i = 0; i < 12; i++) {
    props.core?.navigateNext();
  }
};

const handleLabelClick = () => {
  props.core?.changeView('month');
};
</script>





