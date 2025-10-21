<template>
  <div class="ldate-panel ldate-month-panel">
    <!-- 头部 -->
    <div class="ldate-panel__header">
      <span class="ldate-panel__arrow" @click="handlePrevYear">«</span>
      <span class="ldate-panel__header-label" @click="handleLabelClick">
        {{ headerLabel }}
      </span>
      <span class="ldate-panel__arrow" @click="handleNextYear">»</span>
    </div>
    
    <!-- 月份网格 -->
    <div class="ldate-month-panel__body">
      <div
        v-for="(row, rowIndex) in cells"
        :key="rowIndex"
        class="ldate-month-panel__row"
      >
        <div
          v-for="(cell, cellIndex) in row"
          :key="cellIndex"
          :class="getCellClass(cell)"
          @click="handleCellClick(cell)"
        >
          {{ cell.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MonthPanel as MonthPanelCore } from '@ldesign/datepicker-core';
import type { MonthCell } from '@ldesign/datepicker-shared';
import { zhCN } from '@ldesign/datepicker-shared';

const props = defineProps<{
  core: any;
  state: any;
  config: any;
}>();

const emit = defineEmits<{
  'select-month': [month: number];
}>();

// Computed
const headerLabel = computed(() => {
  if (!props.state) return '';
  return `${props.state.currentDate.getFullYear()}年`;
});

const cells = computed(() => {
  if (!props.state) return [];
  
  const date = props.state.currentDate;
  const value = props.state.value instanceof Date ? props.state.value : null;
  
  const panel = new MonthPanelCore({
    year: date.getFullYear(),
    value,
    monthsShort: zhCN.monthsShort,
    disabledDate: props.config?.disabledDate,
  });
  
  return panel.generateCells();
});

// Methods
const getCellClass = (cell: MonthCell) => {
  return [
    'ldate-cell',
    'ldate-month-cell',
    {
      'ldate-cell--selected': cell.selected,
      'ldate-cell--disabled': cell.disabled,
      'ldate-cell--in-range': cell.inRange,
      'ldate-cell--range-start': cell.rangeStart,
      'ldate-cell--range-end': cell.rangeEnd,
    },
  ];
};

const handleCellClick = (cell: MonthCell) => {
  if (!cell.disabled) {
    emit('select-month', cell.month);
  }
};

const handlePrevYear = () => {
  props.core?.navigatePrev();
};

const handleNextYear = () => {
  props.core?.navigateNext();
};

const handleLabelClick = () => {
  props.core?.changeView('year');
};
</script>





