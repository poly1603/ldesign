<template>
  <div class="ldesign-form-input" :class="wrapperClasses">
    <input
      ref="inputRef"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :maxlength="maxlength"
      :class="inputClasses"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      @keydown="handleKeydown"
      v-bind="$attrs"
    />
    <div v-if="showClearable" class="ldesign-form-input__clear" @click="handleClear">
      <svg viewBox="0 0 16 16" width="16" height="16">
        <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zM12 10.6L10.6 12 8 9.4 5.4 12 4 10.6 6.6 8 4 5.4 5.4 4 8 6.6 10.6 4 12 5.4 9.4 8 12 10.6z"/>
      </svg>
    </div>
    <div v-if="error" class="ldesign-form-input__error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  modelValue?: string | number
  type?: 'text' | 'password' | 'number' | 'email' | 'tel' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  maxlength?: number
  error?: string
  size?: 'small' | 'medium' | 'large'
}

interface Emits {
  'update:modelValue': [value: string | number]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'clear': []
  'keydown': [event: KeyboardEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  size: 'medium'
})

const emit = defineEmits<Emits>()

const inputRef = ref<HTMLInputElement>()
const isFocused = ref(false)

// 计算样式类
const wrapperClasses = computed(() => ({
  [`ldesign-form-input--${props.size}`]: true,
  'is-disabled': props.disabled,
  'is-readonly': props.readonly,
  'is-error': !!props.error,
  'is-focused': isFocused.value
}))

const inputClasses = computed(() => ({
  'ldesign-form-input__control': true
}))

// 是否显示清除按钮
const showClearable = computed(() => {
  return props.clearable && 
         !props.disabled && 
         !props.readonly && 
         props.modelValue && 
         String(props.modelValue).length > 0
})

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  // 数字类型转换
  if (props.type === 'number' && value !== '') {
    const numValue = Number(value)
    if (!isNaN(numValue)) {
      value = numValue
    }
  }
  
  emit('update:modelValue', value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

const handleClear = () => {
  emit('update:modelValue', '')
  emit('clear')
  nextTick(() => {
    inputRef.value?.focus()
  })
}

// 暴露方法
defineExpose({
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select()
})
</script>

<style lang="less" scoped>
.ldesign-form-input {
  position: relative;
  display: inline-block;
  width: 100%;
  
  &__control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--td-border-level-1-color, #dcdcdc);
    border-radius: var(--td-radius-default, 3px);
    font-size: var(--td-font-size-body-medium, 14px);
    line-height: 1.5;
    color: var(--td-text-color-primary, #000000);
    background-color: var(--td-bg-color-container, #ffffff);
    transition: all 0.2s cubic-bezier(0.38, 0, 0.24, 1);
    
    &:hover {
      border-color: var(--td-border-level-2-color, #b5b5b5);
    }
    
    &:focus {
      outline: none;
      border-color: var(--td-brand-color, #0052d9);
      box-shadow: 0 0 0 2px var(--td-brand-color-focus, rgba(0, 82, 217, 0.1));
    }
    
    &::placeholder {
      color: var(--td-text-color-placeholder, #bbbbbb);
    }
  }
  
  &__clear {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    cursor: pointer;
    color: var(--td-text-color-placeholder, #bbbbbb);
    transition: color 0.2s;
    
    &:hover {
      color: var(--td-text-color-secondary, #666666);
    }
    
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  }
  
  &__error {
    margin-top: 4px;
    font-size: var(--td-font-size-body-small, 12px);
    color: var(--td-error-color, #e34d59);
    line-height: 1.4;
  }
  
  // 尺寸变体
  &--small {
    .ldesign-form-input__control {
      padding: 4px 8px;
      font-size: var(--td-font-size-body-small, 12px);
    }
  }
  
  &--large {
    .ldesign-form-input__control {
      padding: 12px 16px;
      font-size: var(--td-font-size-body-large, 16px);
    }
  }
  
  // 状态变体
  &.is-disabled {
    .ldesign-form-input__control {
      background-color: var(--td-bg-color-component-disabled, #f3f3f3);
      color: var(--td-text-color-disabled, #bbbbbb);
      cursor: not-allowed;
      
      &:hover {
        border-color: var(--td-border-level-1-color, #dcdcdc);
      }
    }
  }
  
  &.is-readonly {
    .ldesign-form-input__control {
      background-color: var(--td-bg-color-component, #f8f8f8);
      cursor: default;
    }
  }
  
  &.is-error {
    .ldesign-form-input__control {
      border-color: var(--td-error-color, #e34d59);
      
      &:hover,
      &:focus {
        border-color: var(--td-error-color, #e34d59);
      }
      
      &:focus {
        box-shadow: 0 0 0 2px var(--td-error-color-focus, rgba(227, 77, 89, 0.1));
      }
    }
  }
  
  &.is-focused {
    .ldesign-form-input__control {
      border-color: var(--td-brand-color, #0052d9);
    }
  }
}
</style>