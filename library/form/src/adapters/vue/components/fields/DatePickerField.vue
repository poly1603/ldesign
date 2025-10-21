<template>
  <div class="ldesign-datepicker-field">
    <div
      ref="triggerRef"
      class="ldesign-datepicker-trigger"
      :class="triggerClass"
      @click="togglePicker"
    >
      <span v-if="!displayValue" class="ldesign-datepicker-placeholder">
        {{ placeholder }}
      </span>
      <span v-else class="ldesign-datepicker-value">
        {{ displayValue }}
      </span>
      <span class="ldesign-datepicker-icon">📅</span>
      <span
        v-if="clearable && modelValue && !disabled"
        class="ldesign-datepicker-clear"
        @click.stop="handleClear"
      >
        ✕
      </span>
    </div>

    <!-- 日期选择器面板 -->
    <teleport to="body">
      <div
        v-if="pickerVisible"
        ref="pickerRef"
        class="ldesign-datepicker-panel"
        :style="pickerStyle"
      >
        <!-- 快捷选择 -->
        <div v-if="shortcuts && shortcuts.length" class="ldesign-datepicker-shortcuts">
          <div
            v-for="(shortcut, index) in shortcuts"
            :key="index"
            class="ldesign-datepicker-shortcut"
            @click="handleShortcut(shortcut)"
          >
            {{ shortcut.text }}
          </div>
        </div>

        <!-- 日历面板 -->
        <div class="ldesign-datepicker-calendar">
          <!-- 头部 -->
          <div class="ldesign-datepicker-header">
            <span class="ldesign-datepicker-prev-year" @click="changeYear(-1)">«</span>
            <span class="ldesign-datepicker-prev-month" @click="changeMonth(-1)">‹</span>
            <span class="ldesign-datepicker-current">
              {{ currentYear }} 年 {{ currentMonth + 1 }} 月
            </span>
            <span class="ldesign-datepicker-next-month" @click="changeMonth(1)">›</span>
            <span class="ldesign-datepicker-next-year" @click="changeYear(1)">»</span>
          </div>

          <!-- 星期 -->
          <div class="ldesign-datepicker-weekdays">
            <span v-for="day in weekdays" :key="day" class="ldesign-datepicker-weekday">
              {{ day }}
            </span>
          </div>

          <!-- 日期 -->
          <div class="ldesign-datepicker-days">
            <span
              v-for="date in calendarDays"
              :key="date.timestamp"
              class="ldesign-datepicker-day"
              :class="{
                'is-today': date.isToday,
                'is-selected': date.isSelected,
                'is-disabled': date.isDisabled,
                'is-other-month': date.isOtherMonth
              }"
              @click="selectDate(date)"
            >
              {{ date.day }}
            </span>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="ldesign-datepicker-footer">
          <button type="button" class="ldesign-datepicker-btn" @click="selectToday">
            今天
          </button>
          <button type="button" class="ldesign-datepicker-btn" @click="closePicker">
            确定
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

interface DateShortcut {
  text: string
  value: Date | (() => Date)
}

interface CalendarDay {
  day: number
  month: number
  year: number
  timestamp: number
  isToday: boolean
  isSelected: boolean
  isDisabled: boolean
  isOtherMonth: boolean
}

interface Props {
  modelValue?: string | Date
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  format?: string
  shortcuts?: DateShortcut[]
  disabledDate?: (date: Date) => boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择日期',
  disabled: false,
  clearable: true,
  format: 'YYYY-MM-DD'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const triggerRef = ref<HTMLElement>()
const pickerRef = ref<HTMLElement>()
const pickerVisible = ref(false)
const pickerStyle = ref({})

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const weekdays = ['日', '一', '二', '三', '四', '五', '六']

const triggerClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-open': pickerVisible.value,
  'has-value': !!props.modelValue
}))

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  const date = typeof props.modelValue === 'string' 
    ? new Date(props.modelValue) 
    : props.modelValue
  
  return formatDate(date, props.format)
})

// 生成日历天数
const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // 当月第一天
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const firstDayWeek = firstDay.getDay()
  
  // 当月最后一天
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const lastDayDate = lastDay.getDate()
  
  // 上月需要显示的天数
  const prevMonthDays = firstDayWeek
  const prevMonthLastDay = new Date(currentYear.value, currentMonth.value, 0).getDate()
  
  // 添加上月天数
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i
    const date = new Date(currentYear.value, currentMonth.value - 1, day)
    days.push(createDayObject(date, true))
  }
  
  // 添加当月天数
  for (let i = 1; i <= lastDayDate; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    days.push(createDayObject(date, false))
  }
  
  // 添加下月天数（补足6行42天）
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(currentYear.value, currentMonth.value + 1, i)
    days.push(createDayObject(date, true))
  }
  
  return days
})

function createDayObject(date: Date, isOtherMonth: boolean): CalendarDay {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const selectedDate = props.modelValue 
    ? (typeof props.modelValue === 'string' ? new Date(props.modelValue) : props.modelValue)
    : null
  
  if (selectedDate) {
    selectedDate.setHours(0, 0, 0, 0)
  }
  
  const timestamp = date.getTime()
  
  return {
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    timestamp,
    isToday: timestamp === today.getTime(),
    isSelected: selectedDate ? timestamp === selectedDate.getTime() : false,
    isDisabled: props.disabledDate ? props.disabledDate(date) : false,
    isOtherMonth
  }
}

function formatDate(date: Date, format: string): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr)
}

const togglePicker = () => {
  if (props.disabled) return
  
  pickerVisible.value = !pickerVisible.value
  
  if (pickerVisible.value) {
    // 如果有选中的日期，跳转到该日期所在月份
    if (props.modelValue) {
      const date = typeof props.modelValue === 'string' 
        ? parseDate(props.modelValue) 
        : props.modelValue
      currentYear.value = date.getFullYear()
      currentMonth.value = date.getMonth()
    }
    
    updatePickerPosition()
  }
}

const updatePickerPosition = () => {
  if (!triggerRef.value || !pickerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const pickerHeight = 350

  const spaceBelow = window.innerHeight - triggerRect.bottom
  const spaceAbove = triggerRect.top

  let top = triggerRect.bottom + window.scrollY + 4

  if (spaceBelow < pickerHeight && spaceAbove > spaceBelow) {
    top = triggerRect.top + window.scrollY - pickerHeight - 4
  }

  pickerStyle.value = {
    position: 'absolute',
    top: `${top}px`,
    left: `${triggerRect.left + window.scrollX}px`,
    zIndex: '1000'
  }
}

const changeYear = (offset: number) => {
  currentYear.value += offset
}

const changeMonth = (offset: number) => {
  const newMonth = currentMonth.value + offset
  
  if (newMonth < 0) {
    currentMonth.value = 11
    currentYear.value -= 1
  } else if (newMonth > 11) {
    currentMonth.value = 0
    currentYear.value += 1
  } else {
    currentMonth.value = newMonth
  }
}

const selectDate = (date: CalendarDay) => {
  if (date.isDisabled || props.disabled) return
  
  const selectedDate = new Date(date.year, date.month, date.day)
  const formattedDate = formatDate(selectedDate, props.format)
  
  emit('update:modelValue', formattedDate)
  emit('change', formattedDate)
  
  pickerVisible.value = false
}

const selectToday = () => {
  const today = new Date()
  const formattedDate = formatDate(today, props.format)
  
  emit('update:modelValue', formattedDate)
  emit('change', formattedDate)
  
  currentYear.value = today.getFullYear()
  currentMonth.value = today.getMonth()
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('change', '')
}

const closePicker = () => {
  pickerVisible.value = false
}

const handleShortcut = (shortcut: DateShortcut) => {
  const date = typeof shortcut.value === 'function' ? shortcut.value() : shortcut.value
  const formattedDate = formatDate(date, props.format)
  
  emit('update:modelValue', formattedDate)
  emit('change', formattedDate)
  
  pickerVisible.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (
    pickerVisible.value &&
    triggerRef.value &&
    pickerRef.value &&
    !triggerRef.value.contains(event.target as Node) &&
    !pickerRef.value.contains(event.target as Node)
  ) {
    pickerVisible.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', updatePickerPosition)
  window.addEventListener('resize', updatePickerPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', updatePickerPosition)
  window.removeEventListener('resize', updatePickerPosition)
})
</script>

<style lang="less" scoped>
.ldesign-datepicker-field {
  display: inline-block;
  width: 100%;
}

.ldesign-datepicker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 11px;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    border-color: #722ED1;
  }

  &.is-open {
    border-color: #722ED1;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  &.is-disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
}

.ldesign-datepicker-placeholder {
  color: #bfbfbf;
  font-size: 14px;
}

.ldesign-datepicker-value {
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
}

.ldesign-datepicker-icon {
  margin-left: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
}

.ldesign-datepicker-clear {
  margin-left: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.65);
  }
}

.ldesign-datepicker-panel {
  display: flex;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.ldesign-datepicker-shortcuts {
  width: 100px;
  padding: 8px;
  border-right: 1px solid #f0f0f0;
}

.ldesign-datepicker-shortcut {
  padding: 8px 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    color: #722ED1;
  }
}

.ldesign-datepicker-calendar {
  padding: 8px;
  width: 280px;
}

.ldesign-datepicker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 8px;
}

.ldesign-datepicker-prev-year,
.ldesign-datepicker-prev-month,
.ldesign-datepicker-next-month,
.ldesign-datepicker-next-year {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.85);
  }
}

.ldesign-datepicker-current {
  flex: 1;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.ldesign-datepicker-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 4px;
}

.ldesign-datepicker-weekday {
  padding: 8px 0;
  text-align: center;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.ldesign-datepicker-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.ldesign-datepicker-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover:not(.is-disabled):not(.is-other-month) {
    background: #f5f5f5;
  }

  &.is-today {
    color: #722ED1;
    font-weight: 600;
  }

  &.is-selected {
    background: #722ED1;
    color: #fff;

    &:hover {
      background: #5c24a8;
    }
  }

  &.is-disabled {
    color: rgba(0, 0, 0, 0.25);
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }

  &.is-other-month {
    color: rgba(0, 0, 0, 0.25);
  }
}

.ldesign-datepicker-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-top: 1px solid #f0f0f0;
}

.ldesign-datepicker-btn {
  padding: 4px 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: #722ED1;
    border-color: #722ED1;
  }
}
</style>




