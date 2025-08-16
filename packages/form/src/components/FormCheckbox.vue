<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface CheckboxOption {
  label: string
  value: any
  disabled?: boolean
  description?: string
}

interface FormCheckboxProps {
  modelValue?: any[]
  options?: (string | number | CheckboxOption)[]
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  label?: string
  tooltip?: string
  description?: string
  showLabel?: boolean
  showColon?: boolean
  size?: 'small' | 'medium' | 'large'
  direction?: 'horizontal' | 'vertical'
  max?: number
  min?: number
  errors?: string[]
}

const props = withDefaults(defineProps<FormCheckboxProps>(), {
  modelValue: () => [],
  options: () => [],
  disabled: false,
  readonly: false,
  required: false,
  showLabel: true,
  showColon: false,
  size: 'medium',
  direction: 'horizontal',
  max: undefined,
  min: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  change: [value: any[], option: CheckboxOption]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputValue = ref<any[]>(
  Array.isArray(props.modelValue) ? [...props.modelValue] : []
)

// 监听外部值变化
watch(
  () => props.modelValue,
  newValue => {
    inputValue.value = Array.isArray(newValue) ? [...newValue] : []
  },
  { immediate: true }
)

// 标准化选项
const normalizedOptions = computed(() => {
  return props.options.map(option => {
    if (typeof option === 'string' || typeof option === 'number') {
      return {
        label: String(option),
        value: option,
        disabled: false,
      }
    }
    return {
      label: option.label,
      value: option.value,
      disabled: option.disabled || false,
      description: option.description,
    }
  })
})

// 样式类
const checkboxClasses = computed(() => [
  `form-checkbox--${props.size}`,
  `form-checkbox--${props.direction}`,
  {
    'form-checkbox--disabled': props.disabled,
    'form-checkbox--readonly': props.readonly,
    'form-checkbox--required': props.required,
    'form-checkbox--error': hasError.value,
  },
])

const labelClasses = computed(() => [`form-checkbox__label--${props.size}`])

const wrapperClasses = computed(() => [
  `form-checkbox__wrapper--${props.size}`,
  `form-checkbox__wrapper--${props.direction}`,
])

// 错误状态
const hasError = computed(() => props.errors && props.errors.length > 0)

// 检查是否选中
function isChecked(value: any): boolean {
  return inputValue.value.includes(value)
}

// 获取选项样式类
function getItemClasses(option: CheckboxOption) {
  return [
    {
      'form-checkbox__item--disabled': props.disabled || option.disabled,
      'form-checkbox__item--checked': isChecked(option.value),
    },
  ]
}

// 处理变化
function handleChange(event: Event, value: any) {
  if (props.disabled || props.readonly) return

  const target = event.target as HTMLInputElement
  const newValue = [...inputValue.value]

  if (target.checked) {
    // 检查最大选择数量
    if (props.max && newValue.length >= props.max) {
      target.checked = false
      return
    }
    newValue.push(value)
  } else {
    const index = newValue.indexOf(value)
    if (index > -1) {
      newValue.splice(index, 1)
    }
  }

  // 检查最小选择数量
  if (
    props.min &&
    newValue.length < props.min &&
    newValue.length < inputValue.value.length
  ) {
    target.checked = true
    return
  }

  inputValue.value = newValue
  emit('update:modelValue', newValue)

  const option = normalizedOptions.value.find(opt => opt.value === value)
  if (option) {
    emit('change', newValue, option)
  }
}
</script>

<template>
  <div class="form-checkbox" :class="checkboxClasses">
    <div v-if="showLabel" class="form-checkbox__label" :class="labelClasses">
      <label class="form-checkbox__label-text">
        {{ label }}
        <span v-if="required" class="form-checkbox__required">*</span>
        <span v-if="showColon" class="form-checkbox__colon">:</span>
      </label>
      <div v-if="tooltip" class="form-checkbox__tooltip" :title="tooltip">
        ?
      </div>
    </div>

    <div class="form-checkbox__wrapper" :class="wrapperClasses">
      <div class="form-checkbox__group">
        <label
          v-for="option in normalizedOptions"
          :key="option.value"
          class="form-checkbox__item"
          :class="getItemClasses(option)"
        >
          <input
            type="checkbox"
            :value="option.value"
            :checked="isChecked(option.value)"
            :disabled="disabled || option.disabled"
            class="form-checkbox__input"
            @change="handleChange($event, option.value)"
          />
          <span class="form-checkbox__checkmark" />
          <span class="form-checkbox__text">{{ option.label }}</span>
          <span v-if="option.description" class="form-checkbox__description">
            {{ option.description }}
          </span>
        </label>
      </div>
    </div>

    <div v-if="hasError" class="form-checkbox__error">
      <div
        v-for="error in errors"
        :key="error"
        class="form-checkbox__error-text"
      >
        {{ error }}
      </div>
    </div>

    <div v-if="description" class="form-checkbox__description-text">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-checkbox {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-checkbox__label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.form-checkbox__label-text {
  font-weight: 500;
  color: var(--form-label-color, #333);
  font-size: var(--form-label-font-size, 14px);
}

.form-checkbox__required {
  color: var(--form-error-color, #ff4d4f);
}

.form-checkbox__colon {
  margin-left: 2px;
}

.form-checkbox__tooltip {
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

.form-checkbox__wrapper {
  position: relative;
}

.form-checkbox__group {
  display: flex;
  gap: 12px;
}

.form-checkbox--horizontal .form-checkbox__group {
  flex-direction: row;
  flex-wrap: wrap;
}

.form-checkbox--vertical .form-checkbox__group {
  flex-direction: column;
}

.form-checkbox__item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 0;
  transition: all 0.2s ease;
}

.form-checkbox__item:hover:not(.form-checkbox__item--disabled) {
  color: var(--form-primary-color, #1890ff);
}

.form-checkbox__item--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-checkbox__input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.form-checkbox__checkmark {
  position: relative;
  width: 16px;
  height: 16px;
  border: 1px solid var(--form-border-color, #d9d9d9);
  border-radius: 2px;
  background: white;
  transition: all 0.2s ease;
}

.form-checkbox__input:checked + .form-checkbox__checkmark {
  background: var(--form-primary-color, #1890ff);
  border-color: var(--form-primary-color, #1890ff);
}

.form-checkbox__input:checked + .form-checkbox__checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.form-checkbox__text {
  font-size: var(--form-font-size, 14px);
  color: var(--form-text-color, #333);
}

.form-checkbox__description {
  font-size: 12px;
  color: var(--form-text-secondary-color, #666);
  margin-left: 4px;
}

.form-checkbox__error {
  margin-top: 4px;
}

.form-checkbox__error-text {
  color: var(--form-error-color, #ff4d4f);
  font-size: 12px;
  line-height: 1.4;
}

.form-checkbox__description-text {
  color: var(--form-text-secondary-color, #666);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

/* 尺寸变体 */
.form-checkbox--small .form-checkbox__label-text {
  font-size: 12px;
}

.form-checkbox--small .form-checkbox__text {
  font-size: 12px;
}

.form-checkbox--small .form-checkbox__checkmark {
  width: 14px;
  height: 14px;
}

.form-checkbox--large .form-checkbox__label-text {
  font-size: 16px;
}

.form-checkbox--large .form-checkbox__text {
  font-size: 16px;
}

.form-checkbox--large .form-checkbox__checkmark {
  width: 18px;
  height: 18px;
}

/* 禁用状态 */
.form-checkbox--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-checkbox--disabled .form-checkbox__item {
  cursor: not-allowed;
}

/* 错误状态 */
.form-checkbox--error .form-checkbox__checkmark {
  border-color: var(--form-error-color, #ff4d4f);
}
</style>
