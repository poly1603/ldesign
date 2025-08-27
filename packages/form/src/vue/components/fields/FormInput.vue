<template>
  <input
    :id="id"
    ref="inputRef"
    :type="inputType"
    :value="value"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :maxlength="maxlength"
    :minlength="minlength"
    :max="max"
    :min="min"
    :step="step"
    :pattern="pattern"
    :autocomplete="autocomplete"
    :class="[
      'l-form-input',
      `l-form-input--${size}`,
      {
        'l-form-input--disabled': disabled,
        'l-form-input--readonly': readonly,
        'l-form-input--error': hasError,
        'l-form-input--focused': isFocused
      }
    ]"
    @input="handleInput"
    @change="handleChange"
    @focus="handleFocus"
    @blur="handleBlur"
    @keydown="handleKeydown"
    @keyup="handleKeyup"
    @paste="handlePaste"
    @compositionstart="handleCompositionStart"
    @compositionend="handleCompositionEnd"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { SizeType } from '../../../types'

// 组件属性
interface Props {
  id?: string
  value?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  maxlength?: number
  minlength?: number
  max?: number | string
  min?: number | string
  step?: number | string
  pattern?: string
  autocomplete?: string
  hasError?: boolean
  // 格式化相关
  formatter?: (value: string) => string
  parser?: (value: string) => string | number
  // 验证相关
  validateOnInput?: boolean
  validateOnChange?: boolean
  // 其他属性
  clearable?: boolean
  showPassword?: boolean
  showWordLimit?: boolean
}

// 组件事件
interface Emits {
  (e: 'update:value', value: string | number): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'keyup', event: KeyboardEvent): void
  (e: 'paste', event: ClipboardEvent): void
  (e: 'clear'): void
  (e: 'password-toggle', visible: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  size: 'medium',
  hasError: false,
  validateOnInput: true,
  validateOnChange: true,
  clearable: false,
  showPassword: false,
  showWordLimit: false
})

const emit = defineEmits<Emits>()

// 响应式引用
const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const passwordVisible = ref(false)

// 计算属性
const inputType = computed(() => {
  if (props.type === 'password' && props.showPassword) {
    return passwordVisible.value ? 'text' : 'password'
  }
  return props.type
})

const displayValue = computed(() => {
  if (props.formatter && typeof props.value === 'string') {
    return props.formatter(props.value)
  }
  return props.value
})

const currentLength = computed(() => {
  return String(props.value || '').length
})

// 方法
const handleInput = (event: Event) => {
  if (isComposing.value) return
  
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  // 应用解析器
  if (props.parser) {
    value = props.parser(value)
  }
  
  // 数字类型处理
  if (props.type === 'number' && value !== '') {
    value = Number(value)
    if (isNaN(value as number)) {
      return // 无效数字，不更新
    }
  }
  
  emit('update:value', value)
  emit('input', event)
}

const handleChange = (event: Event) => {
  emit('change', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  // 处理特殊按键
  if (event.key === 'Enter') {
    // 回车键处理
    if (props.type === 'search') {
      // 搜索框回车触发搜索
      emit('change', event)
    }
  } else if (event.key === 'Escape') {
    // ESC键清空
    if (props.clearable) {
      handleClear()
    }
  }
  
  emit('keydown', event)
}

const handleKeyup = (event: KeyboardEvent) => {
  emit('keyup', event)
}

const handlePaste = (event: ClipboardEvent) => {
  emit('paste', event)
  
  // 粘贴后触发输入事件
  nextTick(() => {
    if (inputRef.value) {
      handleInput(new Event('input', { target: inputRef.value } as any))
    }
  })
}

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false
  handleInput(event)
}

const handleClear = () => {
  emit('update:value', '')
  emit('clear')
  focus()
}

const handlePasswordToggle = () => {
  passwordVisible.value = !passwordVisible.value
  emit('password-toggle', passwordVisible.value)
  focus()
}

// 公共方法
const focus = () => {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

const blur = () => {
  inputRef.value?.blur()
}

const select = () => {
  inputRef.value?.select()
}

const setSelectionRange = (start: number, end: number) => {
  inputRef.value?.setSelectionRange(start, end)
}

// 监听值变化，同步到输入框
watch(() => props.value, (newValue) => {
  if (inputRef.value && document.activeElement !== inputRef.value) {
    // 只有在输入框未聚焦时才同步值，避免输入过程中的干扰
    inputRef.value.value = String(displayValue.value)
  }
})

// 暴露方法
defineExpose({
  focus,
  blur,
  select,
  setSelectionRange,
  inputRef
})
</script>

<style lang="less">
.l-form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  background-color: var(--background-color, #ffffff);
  color: var(--text-color-primary, #262626);
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s ease-in-out;
  outline: none;
  
  &::placeholder {
    color: var(--text-color-placeholder, #bfbfbf);
  }
  
  &:hover:not(&--disabled):not(&--readonly) {
    border-color: var(--primary-color, #1890ff);
  }
  
  &:focus,
  &--focused {
    border-color: var(--primary-color, #1890ff);
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  
  // 状态样式
  &--disabled {
    background-color: var(--background-color-disabled, #f5f5f5);
    color: var(--text-color-disabled, #bfbfbf);
    cursor: not-allowed;
    
    &::placeholder {
      color: var(--text-color-disabled, #bfbfbf);
    }
  }
  
  &--readonly {
    background-color: var(--background-color-readonly, #fafafa);
    cursor: default;
  }
  
  &--error {
    border-color: var(--error-color, #ff4d4f);
    
    &:focus {
      border-color: var(--error-color, #ff4d4f);
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }
  }
  
  // 尺寸样式
  &--small {
    padding: 4px 8px;
    font-size: 12px;
  }
  
  &--large {
    padding: 12px 16px;
    font-size: 16px;
  }
  
  // 特殊类型样式
  &[type="number"] {
    text-align: right;
    
    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    
    &[type="number"] {
      -moz-appearance: textfield;
    }
  }
  
  &[type="search"] {
    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      -webkit-appearance: none;
    }
  }
  
  &[type="password"] {
    font-family: 'Courier New', monospace;
    letter-spacing: 2px;
  }
  
  // 自动填充样式
  &:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px var(--background-color, #ffffff) inset;
    -webkit-text-fill-color: var(--text-color-primary, #262626);
  }
  
  // 选中文本样式
  &::selection {
    background-color: var(--primary-color-light, #e6f7ff);
    color: var(--primary-color, #1890ff);
  }
}

// 输入框容器（如果需要添加前缀、后缀等）
.l-form-input-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  
  .l-form-input {
    padding-right: 32px; // 为清除按钮留空间
  }
  
  &__clear {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--border-color, #d9d9d9);
    color: var(--background-color, #ffffff);
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    
    &:hover {
      background-color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &:hover .l-form-input-wrapper__clear {
    opacity: 1;
  }
  
  &__password-toggle {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    color: var(--text-color-secondary, #8c8c8c);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      color: var(--text-color-primary, #262626);
    }
  }
  
  &__word-limit {
    position: absolute;
    right: 8px;
    bottom: -20px;
    font-size: 12px;
    color: var(--text-color-secondary, #8c8c8c);
    
    &--exceeded {
      color: var(--error-color, #ff4d4f);
    }
  }
}
</style>
