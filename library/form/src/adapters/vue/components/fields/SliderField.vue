<template>
  <div class="ldesign-slider-field">
    <div class="ldesign-slider" :class="sliderClass">
      <div ref="sliderRef" class="ldesign-slider-rail" @click="handleRailClick">
        <div class="ldesign-slider-track" :style="trackStyle" />
        
        <!-- 单值滑块 -->
        <div
          v-if="!range"
          class="ldesign-slider-handle"
          :style="{ left: `${getSinglePercent()}%` }"
          @mousedown="handleMouseDown($event, 'single')"
          @touchstart="handleTouchStart($event, 'single')"
        >
          <div v-if="showTooltip" class="ldesign-slider-tooltip">
            {{ formatTooltip(currentValue) }}
          </div>
        </div>
        
        <!-- 范围滑块 -->
        <template v-else>
          <div
            class="ldesign-slider-handle"
            :style="{ left: `${getStartPercent()}%` }"
            @mousedown="handleMouseDown($event, 'start')"
            @touchstart="handleTouchStart($event, 'start')"
          >
            <div v-if="showTooltip" class="ldesign-slider-tooltip">
              {{ formatTooltip(rangeValue[0]) }}
            </div>
          </div>
          <div
            class="ldesign-slider-handle"
            :style="{ left: `${getEndPercent()}%` }"
            @mousedown="handleMouseDown($event, 'end')"
            @touchstart="handleTouchStart($event, 'end')"
          >
            <div v-if="showTooltip" class="ldesign-slider-tooltip">
              {{ formatTooltip(rangeValue[1]) }}
            </div>
          </div>
        </template>

        <!-- 刻度标记 -->
        <div v-if="marks && Object.keys(marks).length" class="ldesign-slider-marks">
          <div
            v-for="(label, value) in marks"
            :key="value"
            class="ldesign-slider-mark"
            :style="{ left: `${getMarkPercent(Number(value))}%` }"
          >
            <span class="ldesign-slider-mark-text">{{ label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入框联动 -->
    <div v-if="withInput" class="ldesign-slider-input">
      <input
        v-if="!range"
        type="number"
        :value="currentValue"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="ldesign-input-number"
        @input="handleInputChange"
      />
      <template v-else>
        <input
          type="number"
          :value="rangeValue[0]"
          :min="min"
          :max="rangeValue[1]"
          :step="step"
          :disabled="disabled"
          class="ldesign-input-number"
          @input="handleStartInputChange"
        />
        <span class="ldesign-slider-separator">-</span>
        <input
          type="number"
          :value="rangeValue[1]"
          :min="rangeValue[0]"
          :max="max"
          :step="step"
          :disabled="disabled"
          class="ldesign-input-number"
          @input="handleEndInputChange"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  modelValue?: number | [number, number]
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  range?: boolean
  marks?: Record<number, string>
  showTooltip?: boolean
  formatTooltip?: (value: number) => string
  withInput?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  range: false,
  showTooltip: true,
  formatTooltip: (value: number) => String(value),
  withInput: false
})

const emit = defineEmits<{
  'update:modelValue': [value: number | [number, number]]
  'change': [value: number | [number, number]]
}>()

const sliderRef = ref<HTMLElement>()
const dragging = ref(false)
const dragType = ref<'single' | 'start' | 'end'>('single')

const currentValue = computed(() => {
  if (props.range) {
    return Array.isArray(props.modelValue) ? props.modelValue[0] : props.min
  }
  return typeof props.modelValue === 'number' ? props.modelValue : props.min
})

const rangeValue = computed((): [number, number] => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue
  }
  return [props.min, props.max]
})

const sliderClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-dragging': dragging.value
}))

const trackStyle = computed(() => {
  if (props.range) {
    const start = getStartPercent()
    const end = getEndPercent()
    return {
      left: `${start}%`,
      width: `${end - start}%`
    }
  }
  return {
    width: `${getSinglePercent()}%`
  }
})

const getSinglePercent = () => {
  return ((currentValue.value - props.min) / (props.max - props.min)) * 100
}

const getStartPercent = () => {
  return ((rangeValue.value[0] - props.min) / (props.max - props.min)) * 100
}

const getEndPercent = () => {
  return ((rangeValue.value[1] - props.min) / (props.max - props.min)) * 100
}

const getMarkPercent = (value: number) => {
  return ((value - props.min) / (props.max - props.min)) * 100
}

const getValueFromPosition = (clientX: number): number => {
  if (!sliderRef.value) return props.min

  const rect = sliderRef.value.getBoundingClientRect()
  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  const rawValue = props.min + percent * (props.max - props.min)
  
  // 应用步长
  const steps = Math.round((rawValue - props.min) / props.step)
  return Math.max(props.min, Math.min(props.max, props.min + steps * props.step))
}

const handleRailClick = (e: MouseEvent) => {
  if (props.disabled) return

  const newValue = getValueFromPosition(e.clientX)
  
  if (props.range) {
    const [start, end] = rangeValue.value
    const toStart = Math.abs(newValue - start)
    const toEnd = Math.abs(newValue - end)
    
    if (toStart < toEnd) {
      emit('update:modelValue', [newValue, end])
    } else {
      emit('update:modelValue', [start, newValue])
    }
  } else {
    emit('update:modelValue', newValue)
  }
}

const handleMouseDown = (e: MouseEvent, type: 'single' | 'start' | 'end') => {
  if (props.disabled) return
  
  e.preventDefault()
  dragging.value = true
  dragType.value = type
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!dragging.value) return
  
  const newValue = getValueFromPosition(e.clientX)
  updateValue(newValue)
}

const handleMouseUp = () => {
  if (dragging.value) {
    dragging.value = false
    emit('change', props.modelValue!)
  }
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleTouchStart = (e: TouchEvent, type: 'single' | 'start' | 'end') => {
  if (props.disabled) return
  
  e.preventDefault()
  dragging.value = true
  dragType.value = type
  
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!dragging.value || !e.touches.length) return
  
  const newValue = getValueFromPosition(e.touches[0].clientX)
  updateValue(newValue)
}

const handleTouchEnd = () => {
  if (dragging.value) {
    dragging.value = false
    emit('change', props.modelValue!)
  }
  
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

const updateValue = (newValue: number) => {
  if (props.range) {
    const [start, end] = rangeValue.value
    
    if (dragType.value === 'start') {
      emit('update:modelValue', [Math.min(newValue, end), end])
    } else {
      emit('update:modelValue', [start, Math.max(newValue, start)])
    }
  } else {
    emit('update:modelValue', newValue)
  }
}

const handleInputChange = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    emit('update:modelValue', Math.max(props.min, Math.min(props.max, value)))
  }
}

const handleStartInputChange = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    emit('update:modelValue', [
      Math.max(props.min, Math.min(rangeValue.value[1], value)),
      rangeValue.value[1]
    ])
  }
}

const handleEndInputChange = (e: Event) => {
  const value = Number((e.target as HTMLInputElement).value)
  if (!isNaN(value)) {
    emit('update:modelValue', [
      rangeValue.value[0],
      Math.max(rangeValue.value[0], Math.min(props.max, value))
    ])
  }
}
</script>

<style lang="less" scoped>
.ldesign-slider-field {
  width: 100%;
}

.ldesign-slider {
  position: relative;
  padding: 5px 0;

  &.is-disabled {
    opacity: 0.4;
    cursor: not-allowed;

    .ldesign-slider-handle {
      cursor: not-allowed;
    }
  }
}

.ldesign-slider-rail {
  position: relative;
  width: 100%;
  height: 4px;
  background-color: #f5f5f5;
  border-radius: 2px;
  cursor: pointer;
}

.ldesign-slider-track {
  position: absolute;
  height: 4px;
  background-color: #722ED1;
  border-radius: 2px;
  transition: all 0.3s;
}

.ldesign-slider-handle {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  margin-top: -7px;
  margin-left: -7px;
  background-color: #fff;
  border: 2px solid #722ED1;
  border-radius: 50%;
  cursor: grab;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.2);
  }

  &:active {
    cursor: grabbing;
  }

  .is-dragging & {
    box-shadow: 0 0 0 5px rgba(114, 46, 209, 0.1);
  }
}

.ldesign-slider-tooltip {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.75);
  color: #fff;
  font-size: 12px;
  border-radius: 2px;
  white-space: nowrap;
  pointer-events: none;
}

.ldesign-slider-marks {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
}

.ldesign-slider-mark {
  position: absolute;
  transform: translateX(-50%);
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  white-space: nowrap;
}

.ldesign-slider-mark-text {
  display: inline-block;
  margin-top: 4px;
}

.ldesign-slider-input {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
}

.ldesign-input-number {
  width: 80px;
  padding: 4px 11px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  outline: none;

  &:focus {
    border-color: #722ED1;
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
}

.ldesign-slider-separator {
  color: rgba(0, 0, 0, 0.45);
}
</style>






