<template>
  <div class="ldesign-timepicker-field">
    <div
      ref="triggerRef"
      class="ldesign-timepicker-trigger"
      :class="triggerClass"
      @click="togglePicker"
    >
      <span v-if="!displayValue" class="ldesign-timepicker-placeholder">
        {{ placeholder }}
      </span>
      <span v-else class="ldesign-timepicker-value">
        {{ displayValue }}
      </span>
      <span class="ldesign-timepicker-icon">🕐</span>
      <span
        v-if="clearable && modelValue && !disabled"
        class="ldesign-timepicker-clear"
        @click.stop="handleClear"
      >
        ✕
      </span>
    </div>

    <!-- 时间选择器面板 -->
    <teleport to="body">
      <div
        v-if="pickerVisible"
        ref="pickerRef"
        class="ldesign-timepicker-panel"
        :style="pickerStyle"
      >
        <div class="ldesign-timepicker-content">
          <!-- 小时 -->
          <div class="ldesign-timepicker-column">
            <div class="ldesign-timepicker-column-title">时</div>
            <div ref="hourRef" class="ldesign-timepicker-column-list">
              <div
                v-for="hour in hours"
                :key="hour"
                class="ldesign-timepicker-option"
                :class="{
                  'is-selected': hour === selectedHour,
                  'is-disabled': isHourDisabled(hour)
                }"
                @click="selectHour(hour)"
              >
                {{ padZero(hour) }}
              </div>
            </div>
          </div>

          <!-- 分钟 -->
          <div class="ldesign-timepicker-column">
            <div class="ldesign-timepicker-column-title">分</div>
            <div ref="minuteRef" class="ldesign-timepicker-column-list">
              <div
                v-for="minute in minutes"
                :key="minute"
                class="ldesign-timepicker-option"
                :class="{
                  'is-selected': minute === selectedMinute,
                  'is-disabled': isMinuteDisabled(minute)
                }"
                @click="selectMinute(minute)"
              >
                {{ padZero(minute) }}
              </div>
            </div>
          </div>

          <!-- 秒 -->
          <div v-if="showSecond" class="ldesign-timepicker-column">
            <div class="ldesign-timepicker-column-title">秒</div>
            <div ref="secondRef" class="ldesign-timepicker-column-list">
              <div
                v-for="second in seconds"
                :key="second"
                class="ldesign-timepicker-option"
                :class="{
                  'is-selected': second === selectedSecond,
                  'is-disabled': isSecondDisabled(second)
                }"
                @click="selectSecond(second)"
              >
                {{ padZero(second) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="ldesign-timepicker-footer">
          <button type="button" class="ldesign-timepicker-btn" @click="selectNow">
            此刻
          </button>
          <button type="button" class="ldesign-timepicker-btn" @click="confirmTime">
            确定
          </button>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  format?: '12' | '24'
  showSecond?: boolean
  hourStep?: number
  minuteStep?: number
  secondStep?: number
  disabledHours?: () => number[]
  disabledMinutes?: (hour: number) => number[]
  disabledSeconds?: (hour: number, minute: number) => number[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '请选择时间',
  disabled: false,
  clearable: true,
  format: '24',
  showSecond: true,
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
}>()

const triggerRef = ref<HTMLElement>()
const pickerRef = ref<HTMLElement>()
const hourRef = ref<HTMLElement>()
const minuteRef = ref<HTMLElement>()
const secondRef = ref<HTMLElement>()

const pickerVisible = ref(false)
const pickerStyle = ref({})

const selectedHour = ref(0)
const selectedMinute = ref(0)
const selectedSecond = ref(0)

const triggerClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-open': pickerVisible.value,
  'has-value': !!props.modelValue
}))

// 生成小时列表
const hours = computed(() => {
  const maxHour = props.format === '12' ? 12 : 23
  const hours: number[] = []
  
  for (let i = 0; i <= maxHour; i += props.hourStep) {
    hours.push(i)
  }
  
  return hours
})

// 生成分钟列表
const minutes = computed(() => {
  const minutes: number[] = []
  
  for (let i = 0; i < 60; i += props.minuteStep) {
    minutes.push(i)
  }
  
  return minutes
})

// 生成秒列表
const seconds = computed(() => {
  const seconds: number[] = []
  
  for (let i = 0; i < 60; i += props.secondStep) {
    seconds.push(i)
  }
  
  return seconds
})

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  return props.modelValue
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    parseTimeValue(newVal)
  }
}, { immediate: true })

function parseTimeValue(timeStr: string) {
  const parts = timeStr.split(':')
  
  if (parts.length >= 2) {
    selectedHour.value = parseInt(parts[0], 10)
    selectedMinute.value = parseInt(parts[1], 10)
    
    if (parts.length >= 3 && props.showSecond) {
      selectedSecond.value = parseInt(parts[2], 10)
    }
  }
}

function formatTimeValue(): string {
  const hour = padZero(selectedHour.value)
  const minute = padZero(selectedMinute.value)
  
  if (props.showSecond) {
    const second = padZero(selectedSecond.value)
    return `${hour}:${minute}:${second}`
  }
  
  return `${hour}:${minute}`
}

function padZero(num: number): string {
  return String(num).padStart(2, '0')
}

const togglePicker = () => {
  if (props.disabled) return
  
  pickerVisible.value = !pickerVisible.value
  
  if (pickerVisible.value) {
    updatePickerPosition()
    nextTick(() => {
      scrollToSelected()
    })
  }
}

const updatePickerPosition = () => {
  if (!triggerRef.value || !pickerRef.value) return

  const triggerRect = triggerRef.value.getBoundingClientRect()
  const pickerHeight = 300

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

const selectHour = (hour: number) => {
  if (isHourDisabled(hour)) return
  selectedHour.value = hour
  updateTimeValue()
}

const selectMinute = (minute: number) => {
  if (isMinuteDisabled(minute)) return
  selectedMinute.value = minute
  updateTimeValue()
}

const selectSecond = (second: number) => {
  if (isSecondDisabled(second)) return
  selectedSecond.value = second
  updateTimeValue()
}

const updateTimeValue = () => {
  const timeStr = formatTimeValue()
  emit('update:modelValue', timeStr)
}

const confirmTime = () => {
  const timeStr = formatTimeValue()
  emit('change', timeStr)
  pickerVisible.value = false
}

const selectNow = () => {
  const now = new Date()
  selectedHour.value = now.getHours()
  selectedMinute.value = now.getMinutes()
  
  if (props.showSecond) {
    selectedSecond.value = now.getSeconds()
  }
  
  updateTimeValue()
  scrollToSelected()
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('change', '')
}

const isHourDisabled = (hour: number): boolean => {
  if (props.disabledHours) {
    const disabled = props.disabledHours()
    return disabled.includes(hour)
  }
  return false
}

const isMinuteDisabled = (minute: number): boolean => {
  if (props.disabledMinutes) {
    const disabled = props.disabledMinutes(selectedHour.value)
    return disabled.includes(minute)
  }
  return false
}

const isSecondDisabled = (second: number): boolean => {
  if (props.disabledSeconds) {
    const disabled = props.disabledSeconds(selectedHour.value, selectedMinute.value)
    return disabled.includes(second)
  }
  return false
}

const scrollToSelected = () => {
  nextTick(() => {
    scrollColumnToSelected(hourRef.value, selectedHour.value, props.hourStep)
    scrollColumnToSelected(minuteRef.value, selectedMinute.value, props.minuteStep)
    
    if (props.showSecond && secondRef.value) {
      scrollColumnToSelected(secondRef.value, selectedSecond.value, props.secondStep)
    }
  })
}

const scrollColumnToSelected = (
  columnRef: HTMLElement | undefined,
  value: number,
  step: number
) => {
  if (!columnRef) return
  
  const index = Math.floor(value / step)
  const optionHeight = 32
  const scrollTop = index * optionHeight - columnRef.offsetHeight / 2 + optionHeight / 2
  
  columnRef.scrollTop = Math.max(0, scrollTop)
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
.ldesign-timepicker-field {
  display: inline-block;
  width: 100%;
}

.ldesign-timepicker-trigger {
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

.ldesign-timepicker-placeholder {
  color: #bfbfbf;
  font-size: 14px;
}

.ldesign-timepicker-value {
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
}

.ldesign-timepicker-icon {
  margin-left: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.25);
}

.ldesign-timepicker-clear {
  margin-left: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: color 0.3s;

  &:hover {
    color: rgba(0, 0, 0, 0.65);
  }
}

.ldesign-timepicker-panel {
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.ldesign-timepicker-content {
  display: flex;
  padding: 8px 0;
}

.ldesign-timepicker-column {
  width: 80px;
  border-right: 1px solid #f0f0f0;

  &:last-child {
    border-right: none;
  }
}

.ldesign-timepicker-column-title {
  padding: 8px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
  border-bottom: 1px solid #f0f0f0;
}

.ldesign-timepicker-column-list {
  max-height: 200px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
}

.ldesign-timepicker-option {
  padding: 6px 12px;
  text-align: center;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    background: #f5f5f5;
  }

  &.is-selected {
    background: #f0e5ff;
    color: #722ED1;
    font-weight: 600;
  }

  &.is-disabled {
    color: rgba(0, 0, 0, 0.25);
    cursor: not-allowed;

    &:hover {
      background: transparent;
    }
  }
}

.ldesign-timepicker-footer {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border-top: 1px solid #f0f0f0;
}

.ldesign-timepicker-btn {
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




