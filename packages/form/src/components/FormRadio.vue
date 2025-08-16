<script setup lang="ts">
import type { FieldOption } from '../types/field'
import { computed, ref } from 'vue'
import { generateId } from '../utils/common'

interface Props {
  modelValue?: any
  label?: string
  required?: boolean
  showColon?: boolean
  disabled?: boolean
  options?: FieldOption[]
  direction?: 'horizontal' | 'vertical'
  size?: 'small' | 'medium' | 'large'
  errorMessage?: string
  showError?: boolean
  showLabel?: boolean
  description?: string
  name?: string
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  direction: 'horizontal',
  showColon: true,
  showError: true,
  showLabel: true,
  options: () => [],
})

const emit = defineEmits<Emits>()

const radioName = ref(props.name || generateId('form-radio'))

// 计算属性
const radioClasses = computed(() => [
  'form-radio',
  `form-radio--${props.size}`,
  `form-radio--${props.direction}`,
  {
    'form-radio--disabled': props.disabled,
    'form-radio--error': props.showError && props.errorMessage,
  },
])

const labelClasses = computed(() => [
  'form-radio__label',
  {
    'form-radio__label--required': props.required,
  },
])

const groupClasses = computed(() => [
  'form-radio__group',
  `form-radio__group--${props.direction}`,
])

// 方法
function isChecked(value: any): boolean {
  return props.modelValue === value
}

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  // 尝试转换为原始类型
  let parsedValue = value
  if (value === 'true') parsedValue = true
  else if (value === 'false') parsedValue = false
  else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value)

  emit('update:modelValue', parsedValue)
  emit('change', parsedValue)
}
</script>

<template>
  <div class="form-radio" :class="radioClasses">
    <div v-if="showLabel" class="form-radio__label" :class="labelClasses">
      <label class="form-radio__label-text">
        {{ label }}
        <span v-if="required" class="form-radio__required">*</span>
        <span v-if="showColon" class="form-radio__colon">:</span>
      </label>
    </div>

    <div class="form-radio__group" :class="groupClasses">
      <label
        v-for="option in options"
        :key="option.value"
        class="form-radio__option"
        :class="{
          'form-radio__option--disabled': option.disabled || disabled,
          'form-radio__option--checked': isChecked(option.value),
        }"
      >
        <input
          :value="option.value"
          :checked="isChecked(option.value)"
          :disabled="option.disabled || disabled"
          :name="radioName"
          type="radio"
          class="form-radio__input"
          @change="handleChange"
        />
        <span class="form-radio__indicator" />
        <span class="form-radio__text">{{ option.label }}</span>
      </label>
    </div>

    <div v-if="showError && errorMessage" class="form-radio__error">
      {{ errorMessage }}
    </div>

    <div v-if="description" class="form-radio__description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-radio {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-radio__label {
  display: flex;
  align-items: center;
  margin-bottom: var(--form-spacing-xs, 4px);
}

.form-radio__label-text {
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-primary, #262626);
  font-weight: var(--form-font-weight-medium, 500);
}

.form-radio__required {
  color: var(--form-color-error, #f5222d);
  margin-left: 2px;
}

.form-radio__colon {
  margin-left: 2px;
}

.form-radio__group {
  display: flex;
  gap: var(--form-spacing-base, 16px);
}

.form-radio__group--vertical {
  flex-direction: column;
  gap: var(--form-spacing-sm, 8px);
}

.form-radio__group--horizontal {
  flex-direction: row;
  flex-wrap: wrap;
}

.form-radio__option {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
  transition: all var(--form-animation-duration-fast, 150ms);
}

.form-radio__option--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.form-radio__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.form-radio__indicator {
  width: 16px;
  height: 16px;
  border: 2px solid var(--form-border-default, #d9d9d9);
  border-radius: 50%;
  background: var(--form-bg-primary, #ffffff);
  margin-right: var(--form-spacing-sm, 8px);
  position: relative;
  transition: all var(--form-animation-duration-fast, 150ms);
  flex-shrink: 0;
}

.form-radio__indicator::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--form-color-primary, #1890ff);
  transition: transform var(--form-animation-duration-fast, 150ms);
}

.form-radio__option:hover .form-radio__indicator {
  border-color: var(--form-border-hover, #40a9ff);
}

.form-radio__option--checked .form-radio__indicator {
  border-color: var(--form-color-primary, #1890ff);
}

.form-radio__option--checked .form-radio__indicator::after {
  transform: translate(-50%, -50%) scale(1);
}

.form-radio__option--disabled .form-radio__indicator {
  background: var(--form-bg-disabled, #f5f5f5);
  border-color: var(--form-border-default, #d9d9d9);
}

.form-radio__option--disabled.form-radio__option--checked
  .form-radio__indicator::after {
  background: var(--form-text-disabled, #bfbfbf);
}

.form-radio__text {
  font-size: var(--form-font-size-base, 16px);
  color: var(--form-text-primary, #262626);
  line-height: var(--form-line-height-normal, 1.5);
}

.form-radio__option--disabled .form-radio__text {
  color: var(--form-text-disabled, #bfbfbf);
}

.form-radio__error {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-color-error, #f5222d);
}

.form-radio__description {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-text-secondary, #595959);
}

/* 尺寸变体 */
.form-radio--small .form-radio__indicator {
  width: 14px;
  height: 14px;
}

.form-radio--small .form-radio__indicator::after {
  width: 6px;
  height: 6px;
}

.form-radio--small .form-radio__text {
  font-size: var(--form-font-size-sm, 14px);
}

.form-radio--large .form-radio__indicator {
  width: 18px;
  height: 18px;
}

.form-radio--large .form-radio__indicator::after {
  width: 10px;
  height: 10px;
}

.form-radio--large .form-radio__text {
  font-size: var(--form-font-size-lg, 18px);
}
</style>
