<template>
  <textarea
    :id="id"
    ref="textareaRef"
    v-model="internalValue"
    :class="textareaClass"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    :maxlength="maxlength"
    :style="textareaStyle"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    @keydown="handleKeydown"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

// Props 定义
interface Props {
  id?: string
  modelValue?: string | number
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  maxlength?: number
  minlength?: number
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  autosize?: boolean | { minRows?: number; maxRows?: number }
  size?: 'small' | 'medium' | 'large'
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  resize: 'vertical',
  size: 'medium',
  autosize: false
})

// Emits 定义
interface Emits {
  'update:modelValue': [value: string]
  'input': [value: string, event: Event]
  'change': [value: string, event: Event]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
  'keydown': [event: KeyboardEvent]
}

const emit = defineEmits<Emits>()

// 响应式数据
const textareaRef = ref<HTMLTextAreaElement>()
const internalValue = ref(props.modelValue || '')

// 计算属性
const textareaClass = computed(() => {
  const classes = ['l-textarea']
  
  if (props.size) {
    classes.push(`l-textarea--${props.size}`)
  }
  
  if (props.disabled) {
    classes.push('l-textarea--disabled')
  }
  
  if (props.readonly) {
    classes.push('l-textarea--readonly')
  }
  
  if (props.error) {
    classes.push('l-textarea--error')
  }
  
  return classes.join(' ')
})

const textareaStyle = computed(() => {
  const style: Record<string, any> = {}
  
  if (props.resize) {
    style.resize = props.resize
  }
  
  return style
})

// 自动调整高度
const adjustHeight = async () => {
  if (!props.autosize || !textareaRef.value) {
    return
  }
  
  await nextTick()
  
  const textarea = textareaRef.value
  const { minRows = 1, maxRows = Infinity } = typeof props.autosize === 'object' ? props.autosize : {}
  
  // 重置高度以获取正确的 scrollHeight
  textarea.style.height = 'auto'
  
  // 计算行高
  const computedStyle = window.getComputedStyle(textarea)
  const lineHeight = parseInt(computedStyle.lineHeight) || 20
  const paddingTop = parseInt(computedStyle.paddingTop) || 0
  const paddingBottom = parseInt(computedStyle.paddingBottom) || 0
  const borderTop = parseInt(computedStyle.borderTopWidth) || 0
  const borderBottom = parseInt(computedStyle.borderBottomWidth) || 0
  
  // 计算内容高度
  const contentHeight = textarea.scrollHeight - paddingTop - paddingBottom
  const lines = Math.max(Math.ceil(contentHeight / lineHeight), minRows)
  const maxLines = Math.min(lines, maxRows)
  
  // 设置新高度
  const newHeight = maxLines * lineHeight + paddingTop + paddingBottom + borderTop + borderBottom
  textarea.style.height = `${newHeight}px`
}

// 事件处理
const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  
  internalValue.value = value
  emit('update:modelValue', value)
  emit('input', value, event)
  
  // 自动调整高度
  if (props.autosize) {
    adjustHeight()
  }
}

const handleChange = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  const value = target.value
  
  emit('change', value, event)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  emit('keydown', event)
}

// 暴露方法
const focus = () => {
  textareaRef.value?.focus()
}

const blur = () => {
  textareaRef.value?.blur()
}

const select = () => {
  textareaRef.value?.select()
}

defineExpose({
  focus,
  blur,
  select,
  textareaRef
})

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== internalValue.value) {
      internalValue.value = newValue || ''
      if (props.autosize) {
        nextTick(() => adjustHeight())
      }
    }
  }
)

// 组件挂载后调整高度
onMounted(() => {
  if (props.autosize) {
    adjustHeight()
  }
})
</script>

<style scoped>
.l-textarea {
  display: block;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.2s;
  resize: vertical;
  font-family: inherit;
}

.l-textarea:hover {
  border-color: #40a9ff;
}

.l-textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.l-textarea::placeholder {
  color: #bfbfbf;
}

.l-textarea--small {
  padding: 4px 8px;
  font-size: 12px;
}

.l-textarea--large {
  padding: 12px 16px;
  font-size: 16px;
}

.l-textarea--disabled {
  background: #f5f5f5;
  border-color: #d9d9d9;
  color: #bfbfbf;
  cursor: not-allowed;
  resize: none;
}

.l-textarea--disabled:hover {
  border-color: #d9d9d9;
}

.l-textarea--readonly {
  background: #f5f5f5;
  cursor: default;
}

.l-textarea--error {
  border-color: #ff4d4f;
}

.l-textarea--error:hover,
.l-textarea--error:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}
</style>