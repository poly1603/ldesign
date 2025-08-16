<script setup lang="ts">
import { computed, ref } from 'vue'

interface FormSwitchProps {
  modelValue?: boolean | string | number
  disabled?: boolean
  required?: boolean
  label?: string
  tooltip?: string
  description?: string
  showLabel?: boolean
  showColon?: boolean
  size?: 'small' | 'medium' | 'large'
  checkedValue?: boolean | string | number
  uncheckedValue?: boolean | string | number
  checkedText?: string
  uncheckedText?: string
  errors?: string[]
}

const props = withDefaults(defineProps<FormSwitchProps>(), {
  disabled: false,
  required: false,
  showLabel: true,
  showColon: false,
  size: 'medium',
  checkedValue: true,
  uncheckedValue: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string | number]
  change: [value: boolean | string | number, event: Event]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const inputRef = ref<HTMLInputElement>()

// 生成唯一ID
const inputId = computed(
  () => `form-switch-${Math.random().toString(36).substr(2, 9)}`
)

// 检查是否选中
const isChecked = computed(() => {
  return props.modelValue === props.checkedValue
})

// 样式类
const switchClasses = computed(() => [
  `form-switch--${props.size}`,
  {
    'form-switch--disabled': props.disabled,
    'form-switch--required': props.required,
    'form-switch--error': hasError.value,
    'form-switch--checked': isChecked.value,
  },
])

const labelClasses = computed(() => [`form-switch__label--${props.size}`])

const wrapperClasses = computed(() => [`form-switch__wrapper--${props.size}`])

const sliderClasses = computed(() => [
  `form-switch__slider--${props.size}`,
  {
    'form-switch__slider--checked': isChecked.value,
    'form-switch__slider--disabled': props.disabled,
  },
])

// 错误状态
const hasError = computed(() => props.errors && props.errors.length > 0)

// 事件处理
function handleChange(event: Event) {
  if (props.disabled) return

  const target = event.target as HTMLInputElement
  const newValue = target.checked ? props.checkedValue : props.uncheckedValue

  emit('update:modelValue', newValue)
  emit('change', newValue, event)
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
  <div class="form-switch" :class="switchClasses">
    <div v-if="showLabel" class="form-switch__label" :class="labelClasses">
      <label :for="inputId" class="form-switch__label-text">
        {{ label }}
        <span v-if="required" class="form-switch__required">*</span>
        <span v-if="showColon" class="form-switch__colon">:</span>
      </label>
      <div v-if="tooltip" class="form-switch__tooltip" :title="tooltip">?</div>
    </div>

    <div class="form-switch__wrapper" :class="wrapperClasses">
      <label class="form-switch__container">
        <input
          :id="inputId"
          ref="inputRef"
          type="checkbox"
          :checked="isChecked"
          :disabled="disabled"
          class="form-switch__input"
          @change="handleChange"
          @blur="handleBlur"
          @focus="handleFocus"
        />
        <span class="form-switch__slider" :class="sliderClasses">
          <span class="form-switch__handle" />
        </span>
        <span v-if="checkedText || uncheckedText" class="form-switch__text">
          {{ isChecked ? checkedText : uncheckedText }}
        </span>
      </label>
    </div>

    <div v-if="hasError" class="form-switch__error">
      <div v-for="error in errors" :key="error" class="form-switch__error-text">
        {{ error }}
      </div>
    </div>

    <div v-if="description" class="form-switch__description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-switch {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-switch__label {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 4px;
}

.form-switch__label-text {
  font-weight: 500;
  color: var(--form-label-color, #333);
  font-size: var(--form-label-font-size, 14px);
}

.form-switch__required {
  color: var(--form-error-color, #ff4d4f);
}

.form-switch__colon {
  margin-left: 2px;
}

.form-switch__tooltip {
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

.form-switch__wrapper {
  display: flex;
  align-items: center;
}

.form-switch__container {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-switch__input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

.form-switch__slider {
  position: relative;
  width: 44px;
  height: 22px;
  background: var(--form-border-color, #d9d9d9);
  border-radius: 11px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.form-switch__slider--checked {
  background: var(--form-primary-color, #1890ff);
}

.form-switch__slider--disabled {
  background: var(--form-disabled-bg, #f5f5f5);
  cursor: not-allowed;
}

.form-switch__handle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.form-switch__slider--checked .form-switch__handle {
  transform: translateX(22px);
}

.form-switch__text {
  font-size: var(--form-font-size, 14px);
  color: var(--form-text-color, #333);
  user-select: none;
}

.form-switch__error {
  margin-top: 4px;
}

.form-switch__error-text {
  color: var(--form-error-color, #ff4d4f);
  font-size: 12px;
  line-height: 1.4;
}

.form-switch__description {
  color: var(--form-text-secondary-color, #666);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

/* 尺寸变体 */
.form-switch--small .form-switch__slider {
  width: 36px;
  height: 18px;
  border-radius: 9px;
}

.form-switch--small .form-switch__handle {
  width: 14px;
  height: 14px;
}

.form-switch--small .form-switch__slider--checked .form-switch__handle {
  transform: translateX(18px);
}

.form-switch--small .form-switch__label-text {
  font-size: 12px;
}

.form-switch--small .form-switch__text {
  font-size: 12px;
}

.form-switch--large .form-switch__slider {
  width: 52px;
  height: 26px;
  border-radius: 13px;
}

.form-switch--large .form-switch__handle {
  width: 22px;
  height: 22px;
}

.form-switch--large .form-switch__slider--checked .form-switch__handle {
  transform: translateX(26px);
}

.form-switch--large .form-switch__label-text {
  font-size: 16px;
}

.form-switch--large .form-switch__text {
  font-size: 16px;
}

/* 禁用状态 */
.form-switch--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-switch--disabled .form-switch__container {
  cursor: not-allowed;
}

/* 错误状态 */
.form-switch--error .form-switch__slider {
  border: 1px solid var(--form-error-color, #ff4d4f);
}
</style>
