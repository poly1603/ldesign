<template>
  <div class="ldate-panel ldate-year-panel">
    <!-- 头部 -->
    <div class="ldate-panel__header">
      <span class="ldate-panel__arrow" @click="handlePrevDecade">«</span>
      <span class="ldate-panel__header-label">
        {{ headerLabel }}
      </span>
      <span class="ldate-panel__arrow" @click="handleNextDecade">»</span>
    </div>
    
    <!-- 年份网格 -->
    <div class="ldate-year-panel__body">
      <div
        v-for="(row, rowIndex) in cells"
        :key="rowIndex"
        class="ldate-year-panel__row"
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
import { YearPanel as YearPanelCore } from '@ldesign/datepicker-core';
import type { YearCell } from '@ldesign/datepicker-shared';

const props = defineProps<{
  core: any;
  state: any;
  config: any;
}>();

const emit = defineEmits<{
  'select-year': [year: number];
}>();

// Computed
const headerLabel = computed(() => {
  if (!props.state) return '';
  
  const panel = new YearPanelCore({
    year: props.state.currentDate.getFullYear(),
    value: null,
  });
  
  const [start, end] = panel.getYearRange();
  return `${start} - ${end}`;
});

const cells = computed(() => {
  if (!props.state) return [];
  
  const date = props.state.currentDate;
  const value = props.state.value instanceof Date ? props.state.value : null;
  
  const panel = new YearPanelCore({
    year: date.getFullYear(),
    value,
    disabledDate: props.config?.disabledDate,
  });
  
  return panel.generateCells();
});

// Methods
const getCellClass = (cell: YearCell) => {
  return [
    'ldate-cell',
    'ldate-year-cell',
    {
      'ldate-cell--selected': cell.selected,
      'ldate-cell--disabled': cell.disabled,
      'ldate-cell--in-range': cell.inRange,
      'ldate-cell--range-start': cell.rangeStart,
      'ldate-cell--range-end': cell.rangeEnd,
    },
  ];
};

const handleCellClick = (cell: YearCell) => {
  if (!cell.disabled) {
    emit('select-year', cell.year);
  }
};

const handlePrevDecade = () => {
  props.core?.navigatePrev();
};

const handleNextDecade = () => {
  props.core?.navigateNext();
};
</script>





