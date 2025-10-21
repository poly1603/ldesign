<template>
  <div class="ldate-range-panel ldate-month-range-panel">
    <!-- 左侧面板 -->
    <div class="ldate-range-panel__left">
      <div class="ldate-panel ldate-month-panel">
        <!-- 头部 -->
        <div class="ldate-panel__header">
          <span class="ldate-panel__arrow" @click="handlePrevYear('left')">«</span>
          <span class="ldate-panel__header-label">
            {{ leftHeaderLabel }}
          </span>
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">»</span>
        </div>
        
        <!-- 月份网格 -->
        <div class="ldate-month-panel__body">
          <div
            v-for="(row, rowIndex) in leftCells"
            :key="rowIndex"
            class="ldate-month-panel__row"
          >
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :class="getMonthCellClass(cell)"
              @click="handleCellClick(cell)"
              @mouseenter="handleCellHover(cell)"
            >
              {{ cell.text }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧面板 -->
    <div class="ldate-range-panel__right">
      <div class="ldate-panel ldate-month-panel">
        <!-- 头部 -->
        <div class="ldate-panel__header">
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">«</span>
          <span class="ldate-panel__header-label">
            {{ rightHeaderLabel }}
          </span>
          <span class="ldate-panel__arrow" @click="handleNextYear('right')">»</span>
        </div>
        
        <!-- 月份网格 -->
        <div class="ldate-month-panel__body">
          <div
            v-for="(row, rowIndex) in rightCells"
            :key="rowIndex"
            class="ldate-month-panel__row"
          >
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :class="getMonthCellClass(cell)"
              @click="handleCellClick(cell)"
              @mouseenter="handleCellHover(cell)"
            >
              {{ cell.text }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

// 左右面板的当前年份
const leftYear = ref(new Date().getFullYear());
const rightYear = ref(new Date().getFullYear() + 1);

// 监听 state 变化
if (props.state?.currentDate) {
  leftYear.value = props.state.currentDate.getFullYear();
  rightYear.value = props.state.currentDate.getFullYear() + 1;
}

// Computed
const leftHeaderLabel = computed(() => {
  return `${leftYear.value}年`;
});

const rightHeaderLabel = computed(() => {
  return `${rightYear.value}年`;
});

const leftCells = computed(() => {
  return generateMonthCells(leftYear.value);
});

const rightCells = computed(() => {
  return generateMonthCells(rightYear.value);
});

// Methods
const generateMonthCells = (year: number) => {
  const value = props.state?.value;
  const rangeStart = Array.isArray(value) && value[0] ? value[0] : null;
  const rangeEnd = Array.isArray(value) && value[1] ? value[1] : null;
  
  const panel = new MonthPanelCore({
    year,
    value: null,
    rangeStart,
    rangeEnd,
    disabledDate: props.config?.disabledDate,
  });
  
  return panel.generateCells();
};

const getMonthCellClass = (cell: MonthCell) => {
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

const handleCellHover = (cell: MonthCell) => {
  if (!cell.disabled) {
    // props.core?.setHoverMonth(cell.month);
  }
};

const handlePrevYear = (side: 'left' | 'right') => {
  if (side === 'left') {
    leftYear.value -= 1;
    rightYear.value -= 1;
  }
};

const handleNextYear = (side: 'left' | 'right') => {
  if (side === 'right') {
    leftYear.value += 1;
    rightYear.value += 1;
  }
};
</script>







