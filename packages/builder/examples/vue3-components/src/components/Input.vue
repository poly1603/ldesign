<template>
  <div class="ld-input-wrapper">
    <label v-if="label" :for="inputId" class="ld-input-label">
      {{ label }}
      <span v-if="required" class="ld-input-required">*</span>
    </label>
    
    <div class="ld-input-container">
      <span v-if="$slots.prefix" class="ld-input-prefix">
        <slot name="prefix" />
      </span>
      
      <input
        :id="inputId"
        v-model="inputValue"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :class="inputClass"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @change="handleChange"
        @keydown="handleKeydown"
      />
      
      <div v-if="$slots.suffix || clearable || showPassword" class="ld-input-suffix">
        <button
          v-if="clearable && inputValue && !disabled && !readonly"
          class="ld-input-clear"
          @click="handleClear"
        >
          ×
        </button>
        
        <button
          v-if="showPassword && type === 'password'"
          class="ld-input-password"
          @click="togglePasswordVisibility"
        >
          {{ passwordVisible ? '🙈' : '👁️' }}
        </button>
        
        <slot name="suffix" />
      </div>
    </div>
    
    <div v-if="error || $slots.error" class="ld-input-error">
      <slot name="error">{{ error }}</slot>
    </div>
    
    <div v-if="help && !error" class="ld-input-help">
      {{ help }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  clearable?: boolean
  showPassword?: boolean
  error?: string
  help?: string
  size?: 'small' | 'medium' | 'large'
  maxlength?: number
}>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false,
  clearable: false,
  showPassword: false,
  size: 'medium'
})

// 定义 Emits
export interface InputEmits {
  'update:modelValue': [value: string | number]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  input: [event: Event]
  change: [event: Event]
  clear: []
  keydown: [event: KeyboardEvent]
}

const emit = defineEmits<InputEmits>()

// 生成唯一 ID
const inputId = useId()

// 内部状态
const isFocused = ref(false)
const passwordVisible = ref(false)

// 计算属性
const inputValue = computed({
  get: () => props.modelValue ?? '',
  set: (value) => emit('update:modelValue', value)
})

const inputClass = computed(() => [
  'ld-input',
  `ld-input--${props.size}`,
  {
    'ld-input--focused': isFocused.value,
    'ld-input--disabled': props.disabled,
    'ld-input--readonly': props.readonly,
    'ld-input--error': props.error,
    'ld-input--has-prefix': !!props.$slots?.prefix,
    'ld-input--has-suffix': !!props.$slots?.suffix || props.clearable || props.showPassword
  }
])

// 事件处理
const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleInput = (event: Event) => {
  emit('input', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleClear = () => {
  inputValue.value = ''
  emit('clear')
}

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value
  // 动态改变 input type
  const input = document.getElementById(inputId) as HTMLInputElement
  if (input) {
    input.type = passwordVisible.value ? 'text' : 'password'
  }
}
</script>

<style scoped lang="less">
.ld-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ld-input-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--ld-color-text, #333);
}

.ld-input-required {
  color: var(--ld-color-danger, #ff4d4f);
  margin-left: 2px;
}

.ld-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.ld-input {
  width: 100%;
  border: 1px solid var(--ld-color-border, #d9d9d9);
  border-radius: var(--ld-border-radius, 6px);
  background-color: var(--ld-color-bg, #fff);
  color: var(--ld-color-text, #333);
  transition: all 0.2s ease;
  outline: none;
}

.ld-input:focus {
  border-color: var(--ld-color-primary, #722ed1);
  box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
}

.ld-input--small {
  padding: 4px 8px;
  font-size: 12px;
  height: 28px;
}

.ld-input--medium {
  padding: 8px 12px;
  font-size: 14px;
  height: 36px;
}

.ld-input--large {
  padding: 12px 16px;
  font-size: 16px;
  height: 44px;
}

.ld-input--disabled {
  background-color: var(--ld-color-bg-disabled, #f5f5f5);
  color: var(--ld-color-text-disabled, #999);
  cursor: not-allowed;
}

.ld-input--readonly {
  background-color: var(--ld-color-bg-readonly, #fafafa);
  cursor: default;
}

.ld-input--error {
  border-color: var(--ld-color-danger, #ff4d4f);
}

.ld-input--error:focus {
  border-color: var(--ld-color-danger, #ff4d4f);
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
}

.ld-input--has-prefix {
  padding-left: 32px;
}

.ld-input--has-suffix {
  padding-right: 32px;
}

.ld-input-prefix,
.ld-input-suffix {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--ld-color-text-secondary, #999);
}

.ld-input-prefix {
  left: 8px;
}

.ld-input-suffix {
  right: 8px;
}

.ld-input-clear,
.ld-input-password {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  color: var(--ld-color-text-secondary, #999);
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  transition: color 0.2s ease;
}

.ld-input-clear:hover,
.ld-input-password:hover {
  color: var(--ld-color-text, #666);
}

.ld-input-error {
  font-size: 12px;
  color: var(--ld-color-danger, #ff4d4f);
}

.ld-input-help {
  font-size: 12px;
  color: var(--ld-color-text-secondary, #999);
}
</style>
