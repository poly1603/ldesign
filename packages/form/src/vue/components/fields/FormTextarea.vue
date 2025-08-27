<template>
  <div class="l-form-textarea-wrapper">
    <textarea
      :id="id"
      ref="textareaRef"
      :value="value"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :cols="cols"
      :maxlength="maxlength"
      :minlength="minlength"
      :class="[
        'l-form-textarea',
        `l-form-textarea--${size}`,
        {
          'l-form-textarea--disabled': disabled,
          'l-form-textarea--readonly': readonly,
          'l-form-textarea--error': hasError,
          'l-form-textarea--focused': isFocused,
          'l-form-textarea--resizable': resizable,
          'l-form-textarea--auto-height': autoHeight
        }
      ]"
      :style="textareaStyles"
      @input="handleInput"
      @change="handleChange"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @keyup="handleKeyup"
      @paste="handlePaste"
      @compositionstart="handleCompositionStart"
      @compositionend="handleCompositionEnd"
      @scroll="handleScroll"
    />
    
    <!-- 清除按钮 -->
    <button
      v-if="clearable && value && !disabled && !readonly"
      type="button"
      class="l-form-textarea-wrapper__clear"
      @click="handleClear"
    >
      ×
    </button>
    
    <!-- 字数统计 -->
    <div
      v-if="showWordLimit"
      :class="[
        'l-form-textarea-wrapper__word-limit',
        {
          'l-form-textarea-wrapper__word-limit--exceeded': isWordLimitExceeded
        }
      ]"
    >
      {{ currentLength }}{{ maxlength ? `/${maxlength}` : '' }}
    </div>
    
    <!-- 自动高度调整的隐藏元素 -->
    <div
      v-if="autoHeight"
      ref="hiddenTextareaRef"
      class="l-form-textarea__hidden"
      :style="hiddenTextareaStyles"
    >
      {{ value || placeholder }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, type CSSProperties } from 'vue'
import type { SizeType } from '../../../types'

// 组件属性
interface Props {
  id?: string
  value?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  size?: SizeType
  rows?: number
  cols?: number
  maxlength?: number
  minlength?: number
  hasError?: boolean
  // 功能相关
  resizable?: boolean
  autoHeight?: boolean
  clearable?: boolean
  showWordLimit?: boolean
  // 高度限制
  minHeight?: number
  maxHeight?: number
  // 格式化相关
  formatter?: (value: string) => string
  parser?: (value: string) => string
}

// 组件事件
interface Emits {
  (e: 'update:value', value: string): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'keydown', event: KeyboardEvent): void
  (e: 'keyup', event: KeyboardEvent): void
  (e: 'paste', event: ClipboardEvent): void
  (e: 'clear'): void
  (e: 'scroll', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  placeholder: '',
  disabled: false,
  readonly: false,
  size: 'medium',
  rows: 4,
  hasError: false,
  resizable: true,
  autoHeight: false,
  clearable: false,
  showWordLimit: false
})

const emit = defineEmits<Emits>()

// 响应式引用
const textareaRef = ref<HTMLTextAreaElement>()
const hiddenTextareaRef = ref<HTMLDivElement>()
const isFocused = ref(false)
const isComposing = ref(false)
const autoHeightValue = ref<number>()

// 计算属性
const currentLength = computed(() => {
  return String(props.value || '').length
})

const isWordLimitExceeded = computed(() => {
  return props.maxlength ? currentLength.value > props.maxlength : false
})

const textareaStyles = computed((): CSSProperties => {
  const styles: CSSProperties = {}
  
  // 自动高度
  if (props.autoHeight && autoHeightValue.value) {
    styles.height = `${autoHeightValue.value}px`
    styles.resize = 'none'
  } else if (!props.resizable) {
    styles.resize = 'none'
  }
  
  // 高度限制
  if (props.minHeight) {
    styles.minHeight = `${props.minHeight}px`
  }
  
  if (props.maxHeight) {
    styles.maxHeight = `${props.maxHeight}px`
  }
  
  return styles
})

const hiddenTextareaStyles = computed((): CSSProperties => {
  if (!textareaRef.value) return {}
  
  const computedStyle = window.getComputedStyle(textareaRef.value)
  
  return {
    position: 'absolute',
    top: '-9999px',
    left: '-9999px',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    width: computedStyle.width,
    padding: computedStyle.padding,
    border: computedStyle.border,
    fontSize: computedStyle.fontSize,
    fontFamily: computedStyle.fontFamily,
    fontWeight: computedStyle.fontWeight,
    lineHeight: computedStyle.lineHeight,
    letterSpacing: computedStyle.letterSpacing,
    textIndent: computedStyle.textIndent
  }
})

// 方法
const handleInput = (event: Event) => {
  if (isComposing.value) return
  
  const target = event.target as HTMLTextAreaElement
  let value = target.value
  
  // 应用解析器
  if (props.parser) {
    value = props.parser(value)
  }
  
  emit('update:value', value)
  emit('input', event)
  
  // 自动调整高度
  if (props.autoHeight) {
    adjustHeight()
  }
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
  if (event.key === 'Tab') {
    // Tab键处理（可以配置是否插入制表符）
    if (event.shiftKey) {
      // Shift+Tab 减少缩进
    } else {
      // Tab 增加缩进
    }
  } else if (event.key === 'Enter') {
    // 回车键处理
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+Enter 可以触发提交
      emit('change', event)
    }
  } else if (event.key === 'Escape') {
    // ESC键处理
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
  
  // 粘贴后调整高度
  if (props.autoHeight) {
    nextTick(() => {
      adjustHeight()
    })
  }
}

const handleCompositionStart = () => {
  isComposing.value = true
}

const handleCompositionEnd = (event: CompositionEvent) => {
  isComposing.value = false
  handleInput(event)
}

const handleScroll = (event: Event) => {
  emit('scroll', event)
}

const handleClear = () => {
  emit('update:value', '')
  emit('clear')
  focus()
  
  if (props.autoHeight) {
    adjustHeight()
  }
}

// 自动调整高度
const adjustHeight = () => {
  if (!props.autoHeight || !hiddenTextareaRef.value) return
  
  nextTick(() => {
    if (hiddenTextareaRef.value) {
      let height = hiddenTextareaRef.value.scrollHeight
      
      // 应用最小高度限制
      if (props.minHeight && height < props.minHeight) {
        height = props.minHeight
      }
      
      // 应用最大高度限制
      if (props.maxHeight && height > props.maxHeight) {
        height = props.maxHeight
      }
      
      autoHeightValue.value = height
    }
  })
}

// 公共方法
const focus = () => {
  nextTick(() => {
    textareaRef.value?.focus()
  })
}

const blur = () => {
  textareaRef.value?.blur()
}

const select = () => {
  textareaRef.value?.select()
}

const setSelectionRange = (start: number, end: number) => {
  textareaRef.value?.setSelectionRange(start, end)
}

const insertText = (text: string) => {
  if (!textareaRef.value) return
  
  const textarea = textareaRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const value = textarea.value
  
  const newValue = value.slice(0, start) + text + value.slice(end)
  emit('update:value', newValue)
  
  nextTick(() => {
    const newPosition = start + text.length
    textarea.setSelectionRange(newPosition, newPosition)
    
    if (props.autoHeight) {
      adjustHeight()
    }
  })
}

// 监听值变化
watch(() => props.value, () => {
  if (props.autoHeight) {
    adjustHeight()
  }
})

// 生命周期
onMounted(() => {
  if (props.autoHeight) {
    adjustHeight()
  }
})

// 暴露方法
defineExpose({
  focus,
  blur,
  select,
  setSelectionRange,
  insertText,
  textareaRef
})
</script>

<style lang="less">
.l-form-textarea-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.l-form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color, #d9d9d9);
  border-radius: 4px;
  background-color: var(--background-color, #ffffff);
  color: var(--text-color-primary, #262626);
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  transition: all 0.2s ease-in-out;
  outline: none;
  resize: vertical;
  
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
    resize: none;
    
    &::placeholder {
      color: var(--text-color-disabled, #bfbfbf);
    }
  }
  
  &--readonly {
    background-color: var(--background-color-readonly, #fafafa);
    cursor: default;
    resize: none;
  }
  
  &--error {
    border-color: var(--error-color, #ff4d4f);
    
    &:focus {
      border-color: var(--error-color, #ff4d4f);
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
    }
  }
  
  &--resizable {
    resize: vertical;
  }
  
  &--auto-height {
    resize: none;
    overflow-y: hidden;
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
  
  // 选中文本样式
  &::selection {
    background-color: var(--primary-color-light, #e6f7ff);
    color: var(--primary-color, #1890ff);
  }
  
  // 滚动条样式
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: var(--background-color-light, #fafafa);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: var(--border-color, #d9d9d9);
    border-radius: 4px;
    
    &:hover {
      background-color: var(--text-color-secondary, #8c8c8c);
    }
  }
}

.l-form-textarea-wrapper {
  &__clear {
    position: absolute;
    right: 8px;
    top: 8px;
    width: 16px;
    height: 16px;
    border: none;
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
  
  &:hover &__clear {
    opacity: 1;
  }
  
  &__word-limit {
    position: absolute;
    right: 8px;
    bottom: 8px;
    padding: 2px 4px;
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 2px;
    font-size: 12px;
    color: var(--text-color-secondary, #8c8c8c);
    pointer-events: none;
    
    &--exceeded {
      color: var(--error-color, #ff4d4f);
      background-color: rgba(255, 77, 79, 0.1);
    }
  }
}

.l-form-textarea__hidden {
  position: absolute;
  top: -9999px;
  left: -9999px;
  visibility: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
  pointer-events: none;
}
</style>
