<template>
  <div class="ldate-range-panel">
    <!-- 左侧面板 -->
    <div class="ldate-range-panel__left">
      <div class="ldate-panel ldate-date-panel">
        <!-- 头部 -->
        <div class="ldate-panel__header">
          <span class="ldate-panel__arrow" @click="handlePrevYear('left')">«</span>
          <span class="ldate-panel__arrow" @click="handlePrevMonth('left')">‹</span>
          <span class="ldate-panel__header-label">
            {{ leftHeaderLabel }}
          </span>
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">›</span>
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">»</span>
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
            v-for="(row, rowIndex) in leftCells"
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
    </div>

    <!-- 右侧面板 -->
    <div class="ldate-range-panel__right">
      <div class="ldate-panel ldate-date-panel">
        <!-- 头部 -->
        <div class="ldate-panel__header">
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">«</span>
          <span class="ldate-panel__arrow ldate-panel__arrow--hidden">‹</span>
          <span class="ldate-panel__header-label">
            {{ rightHeaderLabel }}
          </span>
          <span class="ldate-panel__arrow" @click="handleNextMonth('right')">›</span>
          <span class="ldate-panel__arrow" @click="handleNextYear('right')">»</span>
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
            v-for="(row, rowIndex) in rightCells"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

// 左右面板的当前月份
const leftDate = ref(new Date());
const rightDate = ref(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1));

// 监听 state 变化，同步左面板日期
if (props.state?.currentDate) {
  leftDate.value = new Date(props.state.currentDate);
  rightDate.value = new Date(
    props.state.currentDate.getFullYear(),
    props.state.currentDate.getMonth() + 1,
    1
  );
}

// Computed
const leftHeaderLabel = computed(() => {
  return `${leftDate.value.getFullYear()}年 ${leftDate.value.getMonth() + 1}月`;
});

const rightHeaderLabel = computed(() => {
  return `${rightDate.value.getFullYear()}年 ${rightDate.value.getMonth() + 1}月`;
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

const leftCells = computed(() => {
  return generateCells(leftDate.value);
});

const rightCells = computed(() => {
  return generateCells(rightDate.value);
});

// Methods
const generateCells = (date: Date) => {
  const value = props.state?.value;
  const rangeStart = Array.isArray(value) && value[0] ? value[0] : props.state?.rangeStart;
  const rangeEnd = Array.isArray(value) && value[1] ? value[1] : null;
  const hoverDate = props.state?.hoverDate;
  
  const panel = new DatePanelCore({
    year: date.getFullYear(),
    month: date.getMonth(),
    value: null,
    rangeStart,
    rangeEnd,
    hoverDate,
    weekStartsOn: 1,
    disabledDate: props.config?.disabledDate,
  });
  
  return panel.generateCells();
};

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
      'ldate-cell--today': cell.type === 'today',
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

const handlePrevYear = (side: 'left' | 'right') => {
  if (side === 'left') {
    const newDate = new Date(leftDate.value);
    newDate.setFullYear(newDate.getFullYear() - 1);
    leftDate.value = newDate;
    
    // 同步右侧面板
    const newRightDate = new Date(rightDate.value);
    newRightDate.setFullYear(newRightDate.getFullYear() - 1);
    rightDate.value = newRightDate;
  }
};

const handlePrevMonth = (side: 'left' | 'right') => {
  if (side === 'left') {
    const newDate = new Date(leftDate.value);
    newDate.setMonth(newDate.getMonth() - 1);
    leftDate.value = newDate;
    
    // 同步右侧面板
    const newRightDate = new Date(rightDate.value);
    newRightDate.setMonth(newRightDate.getMonth() - 1);
    rightDate.value = newRightDate;
  }
};

const handleNextMonth = (side: 'left' | 'right') => {
  if (side === 'right') {
    const newDate = new Date(leftDate.value);
    newDate.setMonth(newDate.getMonth() + 1);
    leftDate.value = newDate;
    
    // 同步右侧面板
    const newRightDate = new Date(rightDate.value);
    newRightDate.setMonth(newRightDate.getMonth() + 1);
    rightDate.value = newRightDate;
  }
};

const handleNextYear = (side: 'left' | 'right') => {
  if (side === 'right') {
    const newDate = new Date(leftDate.value);
    newDate.setFullYear(newDate.getFullYear() + 1);
    leftDate.value = newDate;
    
    // 同步右侧面板
    const newRightDate = new Date(rightDate.value);
    newRightDate.setFullYear(newRightDate.getFullYear() + 1);
    rightDate.value = newRightDate;
  }
};
</script>

