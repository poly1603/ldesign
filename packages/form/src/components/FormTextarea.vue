<script setup lang="ts">
import { computed, ref } from 'vue'
import { generateId } from '../utils/common'

interface Props {
  modelValue?: string
  label?: string
  required?: boolean
  showColon?: boolean
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  maxlength?: number
  rows?: number
  cols?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  showCount?: boolean
  size?: 'small' | 'medium' | 'large'
  errorMessage?: string
  showError?: boolean
  showLabel?: boolean
  description?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  rows: 3,
  resize: 'vertical',
  showColon: true,
  showError: true,
  showLabel: true,
  showCount: false,
})

const emit = defineEmits<Emits>()

const textareaRef = ref<HTMLTextAreaElement>()
const textareaId = ref(generateId('form-textarea'))
const focused = ref(false)

// 计算属性
const textareaValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value),
})

const currentLength = computed(() => {
  return String(textareaValue.value).length
})

const textareaClasses = computed(() => [
  'form-textarea',
  `form-textarea--${props.size}`,
  {
    'form-textarea--disabled': props.disabled,
    'form-textarea--readonly': props.readonly,
    'form-textarea--focused': focused.value,
    'form-textarea--error': props.showError && props.errorMessage,
    'form-textarea--with-count': props.showCount && props.maxlength,
  },
])

const labelClasses = computed(() => [
  'form-textarea__label',
  {
    'form-textarea__label--required': props.required,
  },
])

const wrapperClasses = computed(() => [
  'form-textarea__wrapper',
  {
    'form-textarea__wrapper--focused': focused.value,
    'form-textarea__wrapper--disabled': props.disabled,
    'form-textarea__wrapper--readonly': props.readonly,
    'form-textarea__wrapper--error': props.showError && props.errorMessage,
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

// 公开方法
function focus() {
  textareaRef.value?.focus()
}

function blur() {
  textareaRef.value?.blur()
}

function select() {
  textareaRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  textareaRef,
})
</script>

<template>
  <div class="form-textarea" :class="textareaClasses">
    <div v-if="showLabel" class="form-textarea__label" :class="labelClasses">
      <label :for="textareaId" class="form-textarea__label-text">
        {{ label }}
        <span v-if="required" class="form-textarea__required">*</span>
        <span v-if="showColon" class="form-textarea__colon">:</span>
      </label>
    </div>

    <div class="form-textarea__wrapper" :class="wrapperClasses">
      <textarea
        :id="textareaId"
        ref="textareaRef"
        v-model="textareaValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :rows="rows"
        :cols="cols"
        :resize="resize"
        class="form-textarea__textarea"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
      />

      <div v-if="showCount && maxlength" class="form-textarea__count">
        {{ currentLength }}/{{ maxlength }}
      </div>
    </div>

    <div v-if="showError && errorMessage" class="form-textarea__error">
      {{ errorMessage }}
    </div>

    <div v-if="description" class="form-textarea__description">
      {{ description }}
    </div>
  </div>
</template>

<style scoped>
.form-textarea {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.form-textarea__label {
  display: flex;
  align-items: center;
  margin-bottom: var(--form-spacing-xs, 4px);
}

.form-textarea__label-text {
  font-size: var(--form-font-size-sm, 14px);
  color: var(--form-text-primary, #262626);
  font-weight: var(--form-font-weight-medium, 500);
}

.form-textarea__required {
  color: var(--form-color-error, #f5222d);
  margin-left: 2px;
}

.form-textarea__colon {
  margin-left: 2px;
}

.form-textarea__wrapper {
  position: relative;
  border: var(--form-border-width, 1px) var(--form-border-style, solid)
    var(--form-border-default, #d9d9d9);
  border-radius: var(--form-border-radius-base, 4px);
  background: var(--form-bg-primary, #ffffff);
  transition: all var(--form-animation-duration-normal, 300ms)
    var(--form-animation-easing-ease-in-out, cubic-bezier(0.4, 0, 0.2, 1));
}

.form-textarea__wrapper--focused {
  border-color: var(--form-border-active, #1890ff);
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-textarea__wrapper--error {
  border-color: var(--form-border-error, #f5222d);
}

.form-textarea__wrapper--disabled {
  background: var(--form-bg-disabled, #f5f5f5);
  border-color: var(--form-border-default, #d9d9d9);
  cursor: not-allowed;
}

.form-textarea__textarea {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: var(--form-spacing-sm, 8px) var(--form-spacing-base, 16px);
  font-size: var(--form-font-size-base, 16px);
  color: var(--form-text-primary, #262626);
  line-height: var(--form-line-height-normal, 1.5);
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
}

.form-textarea__textarea::placeholder {
  color: var(--form-text-placeholder, #bfbfbf);
}

.form-textarea__textarea:disabled {
  cursor: not-allowed;
  color: var(--form-text-disabled, #bfbfbf);
}

.form-textarea__count {
  position: absolute;
  bottom: var(--form-spacing-xs, 4px);
  right: var(--form-spacing-sm, 8px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-text-secondary, #595959);
  background: var(--form-bg-primary, #ffffff);
  padding: 2px 4px;
  border-radius: var(--form-border-radius-sm, 2px);
}

.form-textarea__error {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-color-error, #f5222d);
}

.form-textarea__description {
  margin-top: var(--form-spacing-xs, 4px);
  font-size: var(--form-font-size-xs, 12px);
  color: var(--form-text-secondary, #595959);
}

/* 尺寸变体 */
.form-textarea--small .form-textarea__textarea {
  padding: var(--form-spacing-xs, 4px) var(--form-spacing-sm, 8px);
  font-size: var(--form-font-size-sm, 14px);
  min-height: 48px;
}

.form-textarea--large .form-textarea__textarea {
  padding: var(--form-spacing-base, 16px) var(--form-spacing-lg, 24px);
  font-size: var(--form-font-size-lg, 18px);
  min-height: 80px;
}

/* 禁用调整大小 */
.form-textarea--resize-none .form-textarea__textarea {
  resize: none;
}

.form-textarea--resize-horizontal .form-textarea__textarea {
  resize: horizontal;
}

.form-textarea--resize-both .form-textarea__textarea {
  resize: both;
}
</style>
