<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

interface FormDatePickerProps {
  modelValue?: string | Date | null
  type?: 'date' | 'datetime-local' | 'time' | 'month' | 'week'
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  label?: string
  placeholder?: string
  tooltip?: string
  description?: string
  showLabel?: boolean
  showColon?: boolean
  size?: 'small' | 'medium' | 'large'
  clearable?: boolean
  min?: string
  max?: string
  step?: string | number
  format?: string
  errors?: string[]
}

const props = withDefaults(defineProps<FormDatePickerProps>(), {
  type: 'date',
  disabled: false,
  readonly: false,
  required: false,
  showLabel: true,
  showColon: false,
  size: 'medium',
  clearable: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | Date | null]
  'change': [value: string | Date | null, event: Event]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'clear': []
}>()

const inputRef = ref<HTMLInputElement>()
const inputValue = ref<string>('')

// 生成唯一ID
const inputId = computed(
  () => `form-date-picker-${Math.random().toString(36).substr(2, 9)}`,
)

// 输入类型映射
const inputType = computed(() => {
  const typeMap = {
    'date': 'date',
    'datetime-local': 'datetime-local',
    'time': 'time',
    'month': 'month',
    'week': 'week',
  }
  return typeMap[props.type] || 'date'
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue instanceof Date) {
      inputValue.value = formatDateForInput(newValue)
    }
    else if (typeof newValue === 'string') {
      inputValue.value = newValue
    }
    else {
      inputValue.value = ''
    }
  },
  { immediate: true },
)

// 格式化日期为输入框格式
function formatDateForInput(date: Date): string {
  if (!date || !(date instanceof Date))
    return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  switch (props.type) {
    case 'date':
      return `${year}-${month}-${day}`
    case 'datetime-local':
      return `${year}-${month}-${day}T${hours}:${minutes}`
    case 'time':
      return `${hours}:${minutes}`
    case 'month':
      return `${year}-${month}`
    case 'week':
      const weekNumber = getWeekNumber(date)
      return `${year}-W${String(weekNumber).padStart(2, '0')}`
    default:
      return `${year}-${month}-${day}`
  }
}

// 获取周数
function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  )
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// 样式类
const datePickerClasses = computed(() => [
  `form-date-picker--${props.size}`,
  {
    'form-date-picker--disabled': props.disabled,
    'form-date-picker--readonly': props.readonly,
    'form-date-picker--required': props.required,
    'form-date-picker--error': hasError.value,
    'form-date-picker--clearable': props.clearable,
  },
])

const labelClasses = computed(() => [`form-date-picker__label--${props.size}`])

const wrapperClasses = computed(() => [
  `form-date-picker__wrapper--${props.size}`,
])

const inputClasses = computed(() => [
  `form-date-picker__input--${props.size}`,
  {
    'form-date-picker__input--error': hasError.value,
  },
])

// 错误状态
const hasError = computed(() => props.errors && props.errors.length > 0)

// 事件处理
function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  inputValue.value = target.value

  let emitValue: string | Date | null = target.value || null

  // 如果需要返回 Date 对象
  if (emitValue && props.format !== 'string') {
    try {
      emitValue = new Date(target.value)
    }
    catch {
      emitValue = target.value
    }
  }

  emit('update:modelValue', emitValue)
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  let emitValue: string | Date | null = target.value || null

  if (emitValue && props.format !== 'string') {
    try {
      emitValue = new Date(target.value)
    }
    catch {
      emitValue = target.value
    }
  }

  emit('change', emitValue, event)
}

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}

function handleClear() {
  inputValue.value = ''
  emit('update:modelValue', null)
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear: handleClear,
})
</script>

<template>
  <div class="form-date-picker" :class="datePickerClasses">
    <div v-if="showLabel" class="form-date-picker__label" :class="labelClasses">
      <label :for="inputId" class="form-date-picker__label-text">
        {{ label }}
        <span v-if="required" class="form-date-picker__required">*</span>
        <span v-if="showColon" class="form-date-picker__colon">:</span>
      </label>
      <div v-if="tooltip" class="form-date-picker__tooltip" :title="tooltip">
        ?
      </div>
    </div>

    <div class="form-date-picker__wrapper" :class="wrapperClasses">
      <input
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        :type="inputType"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :min="min"
        :max="max"
        :step="step"
        class="form-date-picker__input"
        :class="inputClasses"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      >

      <div
        v-if="clearable && inputValue && !disabled && !readonly"
        class="form-date-picker__clear"
        @click="handleClear"
      >
        ×
      </div>
    </div>

    <div v-if="hasError" class="form-date-picker__error">
      <div
        v-for="error in errors"
        :key="error"
        class="form-date-picker__error-text"
      >
        {{ error }}
      </div>
    </div>

    <div v-if="description" class="form-date-picker__description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-date-picker {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-date-picker__label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.form-date-picker__label-text {
  font-weight: 500;
  color: var(--form-label-color, #333);
  font-size: var(--form-label-font-size, 14px);
}

.form-date-picker__required {
  color: var(--form-error-color, #ff4d4f);
}

.form-date-picker__colon {
  margin-left: 2px;
}

.form-date-picker__tooltip {
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

.form-date-picker__wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-date-picker__input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--form-border-color, #d9d9d9);
  border-radius: var(--form-border-radius, 4px);
  font-size: var(--form-font-size, 14px);
  line-height: 1.5;
  color: var(--form-text-color, #333);
  background: var(--form-bg-color, #fff);
  transition: all 0.2s ease;
  outline: none;
}

.form-date-picker__input:hover:not(:disabled) {
  border-color: var(--form-primary-color, #1890ff);
}

.form-date-picker__input:focus {
  border-color: var(--form-primary-color, #1890ff);
  box-shadow: 0 0 0 2px var(--form-primary-color-light, rgba(24, 144, 255, 0.2));
}

.form-date-picker__input:disabled {
  background: var(--form-disabled-bg, #f5f5f5);
  color: var(--form-disabled-color, #999);
  cursor: not-allowed;
}

.form-date-picker__input--error {
  border-color: var(--form-error-color, #ff4d4f);
}

.form-date-picker__clear {
  position: absolute;
  right: 8px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--form-text-secondary-color, #999);
  font-size: 14px;
  line-height: 1;
  transition: color 0.2s ease;
}

.form-date-picker__clear:hover {
  color: var(--form-text-color, #333);
}

.form-date-picker__error {
  margin-top: 4px;
}

.form-date-picker__error-text {
  color: var(--form-error-color, #ff4d4f);
  font-size: 12px;
  line-height: 1.4;
}

.form-date-picker__description {
  color: var(--form-text-secondary-color, #666);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

/* 尺寸变体 */
.form-date-picker--small .form-date-picker__input {
  padding: 4px 8px;
  font-size: 12px;
}

.form-date-picker--small .form-date-picker__label-text {
  font-size: 12px;
}

.form-date-picker--large .form-date-picker__input {
  padding: 12px 16px;
  font-size: 16px;
}

.form-date-picker--large .form-date-picker__label-text {
  font-size: 16px;
}

/* 禁用状态 */
.form-date-picker--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 只读状态 */
.form-date-picker--readonly .form-date-picker__input {
  background: var(--form-readonly-bg, #fafafa);
  cursor: default;
}
</style>
