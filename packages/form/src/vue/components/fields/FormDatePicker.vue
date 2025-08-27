<template>
  <div
    :class="[
      'l-form-date-picker',
      `l-form-date-picker--${size}`,
      {
        'l-form-date-picker--disabled': disabled,
        'l-form-date-picker--readonly': readonly,
        'l-form-date-picker--error': hasError,
        'l-form-date-picker--focused': isFocused,
        'l-form-date-picker--open': isOpen
      }
    ]"
  >
    <input
      :id="id"
      ref="inputRef"
      type="text"
      :value="displayValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly || !editable"
      class="l-form-date-picker__input"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @click="handleClick"
      @keydown="handleKeydown"
    />
    
    <!-- 日期图标 -->
    <i class="l-form-date-picker__icon l-icon-calendar"></i>
    
    <!-- 清除按钮 -->
    <button
      v-if="clearable && value && !disabled && !readonly"
      type="button"
      class="l-form-date-picker__clear"
      @click="handleClear"
    >
      ×
    </button>
    
    <!-- 日期面板 -->
    <Transition name="l-date-picker-dropdown">
      <div
        v-if="isOpen"
        ref="panelRef"
        class="l-form-date-picker__panel"
      >
        <!-- 这里应该是完整的日期选择面板 -->
        <!-- 为了简化，这里只显示一个简单的提示 -->
        <div class="l-form-date-picker__placeholder-panel">
          <p>日期选择器面板</p>
          <p>当前值: {{ value || '未选择' }}</p>
          <button @click="selectToday">选择今天</button>
          <button @click="close">关闭</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { SizeType } from '../../../types'
import { formatDate } from '../../../core/utils'

// 组件属性
interface Props {
  id?: string
  value?: string | Date
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  hasError?: boolean
  format?: string
  clearable?: boolean
  editable?: boolean
  // 日期范围
  minDate?: string | Date
  maxDate?: string | Date
  // 禁用日期
  disabledDate?: (date: Date) => boolean
}

// 组件事件
interface Emits {
  (e: 'update:value', value: string | Date | null): void
  (e: 'change', value: string | Date | null): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'panel-change', date: Date): void
}

const props = withDefaults(defineProps<Props>(), {
  id: 'date-picker',
  value: undefined,
  placeholder: '请选择日期',
  disabled: false,
  readonly: false,
  size: 'medium',
  hasError: false,
  format: 'YYYY-MM-DD',
  clearable: true,
  editable: true
})

const emit = defineEmits<Emits>()

// 响应式引用
const inputRef = ref<HTMLInputElement>()
const panelRef = ref<HTMLDivElement>()
const isFocused = ref(false)
const isOpen = ref(false)

// 计算属性
const displayValue = computed(() => {
  if (!props.value) return ''
  
  const date = props.value instanceof Date ? props.value : new Date(props.value)
  if (isNaN(date.getTime())) return ''
  
  return formatDate(date, props.format)
})

// 方法
const handleInput = (event: Event) => {
  if (!props.editable) return
  
  const target = event.target as HTMLInputElement
  const value = target.value
  
  // 简单的日期解析
  if (value) {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      emit('update:value', date)
      emit('change', date)
    }
  } else {
    emit('update:value', null)
    emit('change', null)
  }
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleClick = () => {
  if (props.disabled || props.readonly) return
  
  if (isOpen.value) {
    close()
  } else {
    open()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
      if (isOpen.value) {
        close()
      } else {
        open()
      }
      break
    case 'Escape':
      close()
      break
    case 'Tab':
      close()
      break
  }
}

const handleClear = () => {
  emit('update:value', null)
  emit('change', null)
  emit('clear')
}

const open = () => {
  if (isOpen.value) return
  isOpen.value = true
}

const close = () => {
  if (!isOpen.value) return
  isOpen.value = false
}

const selectToday = () => {
  const today = new Date()
  emit('update:value', today)
  emit('change', today)
  close()
}

const handleClickOutside = (event: Event) => {
  if (
    panelRef.value &&
    !panelRef.value.contains(event.target as Node) &&
    inputRef.value &&
    !inputRef.value.contains(event.target as Node)
  ) {
    close()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// 暴露方法
defineExpose({
  open,
  close,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur()
})
</script>

<style lang="less">
.l-form-date-picker {
  position: relative;
  display: inline-block;
  width: 100%;
  
  &__input {
    width: 100%;
    padding: 8px 32px 8px 12px;
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
    
    &:hover:not(:disabled) {
      border-color: var(--primary-color, #1890ff);
    }
    
    &:focus {
      border-color: var(--primary-color, #1890ff);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  &__icon {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-color-secondary, #8c8c8c);
    font-size: 16px;
    pointer-events: none;
  }
  
  &__clear {
    position: absolute;
    right: 28px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background-color: var(--border-color, #d9d9d9);
    color: var(--background-color, #ffffff);
    font-size: 12px;
    cursor: pointer;
    z-index: 1;
    
    &:hover {
      background-color: var(--text-color-secondary, #8c8c8c);
    }
  }
  
  &__panel {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    margin-top: 4px;
    background-color: var(--background-color, #ffffff);
    border: 1px solid var(--border-color, #d9d9d9);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-width: 280px;
  }
  
  &__placeholder-panel {
    padding: 16px;
    text-align: center;
    
    p {
      margin: 0 0 8px 0;
      color: var(--text-color-secondary, #8c8c8c);
    }
    
    button {
      margin: 4px;
      padding: 4px 8px;
      border: 1px solid var(--border-color, #d9d9d9);
      border-radius: 2px;
      background-color: var(--background-color, #ffffff);
      cursor: pointer;
      
      &:hover {
        border-color: var(--primary-color, #1890ff);
        color: var(--primary-color, #1890ff);
      }
    }
  }
  
  // 状态样式
  &--disabled {
    .l-form-date-picker__input {
      background-color: var(--background-color-disabled, #f5f5f5);
      color: var(--text-color-disabled, #bfbfbf);
      cursor: not-allowed;
    }
    
    .l-form-date-picker__icon {
      color: var(--text-color-disabled, #bfbfbf);
    }
  }
  
  &--readonly {
    .l-form-date-picker__input {
      background-color: var(--background-color-readonly, #fafafa);
      cursor: default;
    }
  }
  
  &--error {
    .l-form-date-picker__input {
      border-color: var(--error-color, #ff4d4f);
      
      &:focus {
        border-color: var(--error-color, #ff4d4f);
        box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
      }
    }
  }
  
  &--focused,
  &--open {
    .l-form-date-picker__input {
      border-color: var(--primary-color, #1890ff);
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
  
  // 尺寸样式
  &--small {
    .l-form-date-picker__input {
      padding: 4px 28px 4px 8px;
      font-size: 12px;
    }
    
    .l-form-date-picker__icon {
      font-size: 14px;
      right: 6px;
    }
    
    .l-form-date-picker__clear {
      right: 24px;
      width: 14px;
      height: 14px;
      font-size: 10px;
    }
  }
  
  &--large {
    .l-form-date-picker__input {
      padding: 12px 36px 12px 16px;
      font-size: 16px;
    }
    
    .l-form-date-picker__icon {
      font-size: 18px;
      right: 10px;
    }
    
    .l-form-date-picker__clear {
      right: 32px;
      width: 18px;
      height: 18px;
      font-size: 14px;
    }
  }
}

// 下拉动画
.l-date-picker-dropdown-enter-active,
.l-date-picker-dropdown-leave-active {
  transition: all 0.2s ease-in-out;
  transform-origin: top;
}

.l-date-picker-dropdown-enter-from,
.l-date-picker-dropdown-leave-to {
  opacity: 0;
  transform: scaleY(0.8);
}
</style>
