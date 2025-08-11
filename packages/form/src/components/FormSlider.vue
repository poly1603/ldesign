<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface SliderMark {
  value: number
  label?: string
}

interface FormSliderProps {
  modelValue?: number
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  required?: boolean
  label?: string
  tooltip?: string
  description?: string
  showLabel?: boolean
  showColon?: boolean
  showValue?: boolean
  showRange?: boolean
  showMarks?: boolean
  size?: 'small' | 'medium' | 'large'
  marks?: SliderMark[]
  formatter?: (value: number) => string
  errors?: string[]
}

const props = withDefaults(defineProps<FormSliderProps>(), {
  modelValue: 0,
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  required: false,
  showLabel: true,
  showColon: false,
  showValue: true,
  showRange: false,
  showMarks: false,
  size: 'medium',
  marks: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number, event: Event]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref<number>(props.modelValue)

// 监听外部值变化
watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = newValue
  },
  { immediate: true }
)

// 显示值
const displayValue = computed(() => {
  if (props.formatter) {
    return props.formatter(inputValue.value)
  }
  return inputValue.value.toString()
})

// 样式类
const sliderClasses = computed(() => [
  `form-slider--${props.size}`,
  {
    'form-slider--disabled': props.disabled,
    'form-slider--required': props.required,
    'form-slider--error': hasError.value,
  },
])

const labelClasses = computed(() => [`form-slider__label--${props.size}`])

const wrapperClasses = computed(() => [`form-slider__wrapper--${props.size}`])

const inputClasses = computed(() => [
  `form-slider__input--${props.size}`,
  {
    'form-slider__input--error': hasError.value,
  },
])

// 错误状态
const hasError = computed(() => props.errors && props.errors.length > 0)

// 获取标记样式
function getMarkStyle(value: number) {
  const percentage = ((value - props.min) / (props.max - props.min)) * 100
  return {
    left: `${percentage}%`,
  }
}

// 事件处理
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  inputValue.value = value
  emit('update:modelValue', value)
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)
  emit('change', value, event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
</script>

<template>
  <div class="form-slider" :class="sliderClasses">
    <div v-if="showLabel" class="form-slider__label" :class="labelClasses">
      <label class="form-slider__label-text">
        {{ label }}
        <span v-if="required" class="form-slider__required">*</span>
        <span v-if="showColon" class="form-slider__colon">:</span>
      </label>
      <div v-if="tooltip" class="form-slider__tooltip" :title="tooltip">?</div>
    </div>

    <div class="form-slider__wrapper" :class="wrapperClasses">
      <div v-if="showValue" class="form-slider__value">
        {{ displayValue }}
      </div>

      <div class="form-slider__container">
        <input
          ref="inputRef"
          type="range"
          :value="inputValue"
          :min="min"
          :max="max"
          :step="step"
          :disabled="disabled"
          class="form-slider__input"
          :class="inputClasses"
          @input="handleInput"
          @change="handleChange"
          @blur="handleBlur"
          @focus="handleFocus"
        />

        <div v-if="showMarks && marks.length" class="form-slider__marks">
          <div
            v-for="mark in marks"
            :key="mark.value"
            class="form-slider__mark"
            :style="getMarkStyle(mark.value)"
          >
            <div class="form-slider__mark-dot" />
            <div v-if="mark.label" class="form-slider__mark-label">
              {{ mark.label }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="showRange" class="form-slider__range">
        <span class="form-slider__range-min">{{ min }}</span>
        <span class="form-slider__range-max">{{ max }}</span>
      </div>
    </div>

    <div v-if="hasError" class="form-slider__error">
      <div v-for="error in errors" :key="error" class="form-slider__error-text">
        {{ error }}
      </div>
    </div>

    <div v-if="description" class="form-slider__description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-slider {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-slider__label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.form-slider__label-text {
  font-weight: 500;
  color: var(--form-label-color, #333);
  font-size: var(--form-label-font-size, 14px);
}

.form-slider__required {
  color: var(--form-error-color, #ff4d4f);
}

.form-slider__colon {
  margin-left: 2px;
}

.form-slider__tooltip {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--form-info-color, #1890ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: help;
}

.form-slider__wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-slider__value {
  text-align: center;
  font-weight: 500;
  color: var(--form-primary-color, #1890ff);
  font-size: var(--form-font-size, 14px);
}

.form-slider__container {
  position: relative;
  padding: 8px 0;
}

.form-slider__input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--form-border-color, #d9d9d9);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.form-slider__input::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--form-primary-color, #1890ff);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.form-slider__input::-webkit-slider-thumb:hover {
  transform: scale(1.1);
}

.form-slider__input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--form-primary-color, #1890ff);
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.form-slider__input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-slider__input:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
  background: var(--form-disabled-color, #999);
}

.form-slider__input:disabled::-moz-range-thumb {
  cursor: not-allowed;
  background: var(--form-disabled-color, #999);
}

.form-slider__marks {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  pointer-events: none;
}

.form-slider__mark {
  position: absolute;
  top: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.form-slider__mark-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--form-border-color, #d9d9d9);
}

.form-slider__mark-label {
  font-size: 12px;
  color: var(--form-text-secondary-color, #666);
  white-space: nowrap;
}

.form-slider__range {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--form-text-secondary-color, #666);
}

.form-slider__error {
  margin-top: 4px;
}

.form-slider__error-text {
  color: var(--form-error-color, #ff4d4f);
  font-size: 12px;
  line-height: 1.4;
}

.form-slider__description {
  color: var(--form-text-secondary-color, #666);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

/* 尺寸变体 */
.form-slider--small .form-slider__input {
  height: 4px;
}

.form-slider--small .form-slider__input::-webkit-slider-thumb {
  width: 12px;
  height: 12px;
}

.form-slider--small .form-slider__input::-moz-range-thumb {
  width: 12px;
  height: 12px;
}

.form-slider--small .form-slider__label-text {
  font-size: 12px;
}

.form-slider--small .form-slider__value {
  font-size: 12px;
}

.form-slider--large .form-slider__input {
  height: 8px;
}

.form-slider--large .form-slider__input::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
}

.form-slider--large .form-slider__input::-moz-range-thumb {
  width: 20px;
  height: 20px;
}

.form-slider--large .form-slider__label-text {
  font-size: 16px;
}

.form-slider--large .form-slider__value {
  font-size: 16px;
}

/* 禁用状态 */
.form-slider--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 错误状态 */
.form-slider--error .form-slider__input {
  background: var(--form-error-color-light, rgba(255, 77, 79, 0.1));
}
</style>
