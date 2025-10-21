<template>
  <div class="ldate-range-panel ldate-year-range-panel">
    <!-- 左侧面板 -->
    <div class="ldate-range-panel__left">
      <div class="ldate-panel ldate-year-panel">
        <!-- 头部 -->
        <div class="ldate-panel__header">
          <span class="ldate-panel__arrow" @click="handlePrevDecade('left')">«</span>
          <span class="ldate-panel__header-label">
            {{ leftHeaderLabel }}
          </span>
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">»</span>
        </div>
        
        <!-- 年份网格 -->
        <div class="ldate-year-panel__body">
          <div
            v-for="(row, rowIndex) in leftCells"
            :key="rowIndex"
            class="ldate-year-panel__row"
          >
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :class="getYearCellClass(cell)"
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
      <div class="ldate-panel ldate-year-panel">
        <!-- 头部 -->
        <div class="ldate-panel__header">
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">«</span>
          <span class="ldate-panel__header-label">
            {{ rightHeaderLabel }}
          </span>
          <span class="ldate-panel__arrow" @click="handleNextDecade('right')">»</span>
        </div>
        
        <!-- 年份网格 -->
        <div class="ldate-year-panel__body">
          <div
            v-for="(row, rowIndex) in rightCells"
            :key="rowIndex"
            class="ldate-year-panel__row"
          >
            <div
              v-for="(cell, cellIndex) in row"
              :key="cellIndex"
              :class="getYearCellClass(cell)"
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

// 左右面板的起始年份（每个面板显示12年）
const leftStartYear = ref(Math.floor(new Date().getFullYear() / 10) * 10);
const rightStartYear = ref(Math.floor(new Date().getFullYear() / 10) * 10 + 10);

// 监听 state 变化
if (props.state?.currentDate) {
  const year = props.state.currentDate.getFullYear();
  leftStartYear.value = Math.floor(year / 10) * 10;
  rightStartYear.value = Math.floor(year / 10) * 10 + 10;
}

// Computed
const leftHeaderLabel = computed(() => {
  return `${leftStartYear.value} - ${leftStartYear.value + 11}`;
});

const rightHeaderLabel = computed(() => {
  return `${rightStartYear.value} - ${rightStartYear.value + 11}`;
});

const leftCells = computed(() => {
  return generateYearCells(leftStartYear.value);
});

const rightCells = computed(() => {
  return generateYearCells(rightStartYear.value);
});

// Methods
const generateYearCells = (startYear: number) => {
  const value = props.state?.value;
  const rangeStart = Array.isArray(value) && value[0] ? value[0] : null;
  const rangeEnd = Array.isArray(value) && value[1] ? value[1] : null;
  
  const panel = new YearPanelCore({
    startYear,
    value: null,
    rangeStart,
    rangeEnd,
    disabledDate: props.config?.disabledDate,
  });
  
  return panel.generateCells();
};

const getYearCellClass = (cell: YearCell) => {
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

const handleCellHover = (cell: YearCell) => {
  if (!cell.disabled) {
    // props.core?.setHoverYear(cell.year);
  }
};

const handlePrevDecade = (side: 'left' | 'right') => {
  if (side === 'left') {
    leftStartYear.value -= 10;
    rightStartYear.value -= 10;
  }
};

const handleNextDecade = (side: 'left' | 'right') => {
  if (side === 'right') {
    leftStartYear.value += 10;
    rightStartYear.value += 10;
  }
};
</script>







