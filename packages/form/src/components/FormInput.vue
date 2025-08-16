<script setup lang="ts">
import type { FormInputProps } from '../types/components'
import { computed, nextTick, ref } from 'vue'
import { generateId } from '../utils/common'
import FormContainer from './FormContainer.vue'

interface Props extends FormInputProps {
  label?: string
  required?: boolean
  showColon?: boolean
  tooltip?: string
  description?: string
  errorMessage?: string
  showError?: boolean
  showLabel?: boolean
  autocomplete?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'clear'): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'keyup', event: KeyboardEvent): void
  (e: 'keypress', event: KeyboardEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium',
  showColon: true,
  showError: true,
  showLabel: true,
  clearable: false,
  showCount: false,
  autocomplete: 'off',
  labelPosition: 'top',
  labelAlign: 'left',
  labelGap: 8,
  showLabelColon: false,
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const inputId = ref(generateId('form-input'))
const focused = ref(false)

// 计算属性
const inputValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value),
})

const currentLength = computed(() => {
  return String(inputValue.value).length
})

const inputClasses = computed(() => [
  'form-input',
  `form-input--${props.size}`,
  {
    'form-input--disabled': props.disabled,
    'form-input--readonly': props.readonly,
    'form-input--focused': focused.value,
    'form-input--error': props.showError && props.errorMessage,
    'form-input--with-prefix': props.prefix || props.prefixIcon,
    'form-input--with-suffix':
      props.suffix || props.suffixIcon || props.clearable || props.showCount,
  },
])

const labelClasses = computed(() => [
  'form-input__label',
  {
    'form-input__label--required': props.required,
  },
])

const wrapperClasses = computed(() => [
  'form-input__wrapper',
  {
    'form-input__wrapper--focused': focused.value,
    'form-input__wrapper--disabled': props.disabled,
    'form-input__wrapper--readonly': props.readonly,
    'form-input__wrapper--error': props.showError && props.errorMessage,
  },
])

// 事件处理
function handleFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function handleBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function handleInput(event: Event) {
  emit('input', event)
}

function handleChange(event: Event) {
  emit('change', event)
}

function handleClear() {
  inputValue.value = ''
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function handleKeydown(event: KeyboardEvent) {
  emit('keydown', event)
}

function handleKeyup(event: KeyboardEvent) {
  emit('keyup', event)
}

function handleKeypress(event: KeyboardEvent) {
  emit('keypress', event)
}

// 公开方法
function focus() {
  inputRef.value?.focus()
}

function blur() {
  inputRef.value?.blur()
}

function select() {
  inputRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  inputRef,
})
</script>

<template>
  <FormContainer
    :label="label"
    :required="required"
    :show-colon="showColon || showLabelColon"
    :label-position="labelPosition"
    :label-width="labelWidth"
    :label-align="labelAlign"
    :label-gap="labelGap"
    :for="inputId"
    :tooltip="tooltip"
    :error-message="errorMessage"
    :show-error="showError"
    :description="description"
    :show-label="showLabel"
  >
    <div class="form-input__wrapper" :class="wrapperClasses">
      <div v-if="prefix || prefixIcon" class="form-input__prefix">
        <span
          v-if="prefixIcon"
          class="form-input__prefix-icon"
          :class="prefixIcon"
        />
        <span v-if="prefix" class="form-input__prefix-text">{{ prefix }}</span>
      </div>

      <input
        :id="inputId"
        ref="inputRef"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :minlength="minlength"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :tabindex="tabindex"
        class="form-input__input"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
        @keydown="handleKeydown"
        @keyup="handleKeyup"
        @keypress="handleKeypress"
      >

      <div
        v-if="suffix || suffixIcon || clearable || showCount"
        class="form-input__suffix"
      >
        <span v-if="showCount" class="form-input__count">
          {{ currentLength }}/{{ maxlength }}
        </span>
        <button
          v-if="clearable && inputValue && !disabled && !readonly"
          type="button"
          class="form-input__clear"
          @click="handleClear"
        >
          ×
        </button>
        <span
          v-if="suffixIcon"
          class="form-input__suffix-icon"
          :class="suffixIcon"
        />
        <span v-if="suffix" class="form-input__suffix-text">{{ suffix }}</span>
      </div>
    </div>
  </FormContainer>
</template>

<style scoped>
.form-input__label-text {
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-primary, #262626);
  font-weight: var(--form-font-weight-medium, 500);
}

.form-input__required {
  color: var(--form-color-error, #f5222d);
  margin-left: 2px;
}

.form-input__colon {
  margin-left: 2px;
}

.form-input__tooltip {
  margin-left: var(--form-spacing-xs, 4px);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--form-color-info, #1890ff);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: help;
}

.form-input__wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: var(--form-border-width, 1px) var(--form-border-style, solid) var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  background: var(--form-bg-primary, #ffffff);
  transition: all var(--form-animation-duration-normal, 300ms)
    var(--form-animation-easing-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
}

.form-input__wrapper--focused {
  border-color: var(--form-border-active, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input__wrapper--error {
  border-color: var(--form-border-error, #f5222d);
}

.form-input__wrapper--disabled {
  background: var(--form-bg-disabled, #f5f5f5);
  border-color: var(--form-border-default, #d9d9d9);
  cursor: not-allowed;
}

.form-input__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-base, 16px);
  font-size: var(--form-font-size-base, 16px);
  color: var(--form-text-primary, #262626);
  line-height: var(--form-line-height-normal, 1.5);
}

.form-input__input::placeholder {
  color: var(--form-text-placeholder, #bfbfbf);
}

.form-input__input:disabled {
  cursor: not-allowed;
  color: var(--form-text-disabled, #bfbfbf);
}

.form-input__prefix,
.form-input__suffix {
  display: flex;
  align-items: center;
  padding: 0 var(--form-spacing-sm, 8px);
  color: var(--form-text-secondary, #595959);
}

.form-input__clear {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  margin: 0 var(--form-spacing-xs, 4px);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--form-text-secondary, #595959);
  transition: all var(--form-animation-duration-fast, 150ms);
}

.form-input__clear:hover {
  background: var(--form-bg-hover, #f5f5f5);
  color: var(--form-text-primary, #262626);
}

.form-input__count {
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-text-secondary, #595959);
}

.form-input__error {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-color-error, #f5222d);
}

.form-input__description {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-text-secondary, #595959);
}

/* 尺寸变体 */
.form-input--small .form-input__input {
  padding: var(--form-spacing-xs, 4px) var(--form-spacing-sm, 8px);
  font-size: var(--form-font-size-sm, 14px);
}

.form-input--large .form-input__input {
  padding: var(--form-spacing-base, 16px) var(--form-spacing-lg, 24px);
  font-size: var(--form-font-size-lg, 18px);
}
</style>
