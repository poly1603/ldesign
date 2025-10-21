<template>
  <div class="ldesign-textarea-field">
    <div class="ldesign-textarea-wrapper" :class="wrapperClass">
      <textarea
        :id="id"
        ref="textareaRef"
        v-model="textValue"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :rows="rows"
        :maxlength="maxLength"
        :style="textareaStyle"
        class="ldesign-textarea"
        @input="handleInput"
        @change="handleChange"
        @blur="handleBlur"
        @focus="handleFocus"
      />
    </div>

    <div v-if="showCount || showMarkdownPreview" class="ldesign-textarea-footer">
      <!-- 字符计数 -->
      <div v-if="showCount && maxLength" class="ldesign-textarea-count">
        {{ textValue?.length || 0 }} / {{ maxLength }}
      </div>

      <!-- Markdown 预览切换 -->
      <div v-if="showMarkdownPreview" class="ldesign-textarea-actions">
        <button
          type="button"
          class="ldesign-btn-link"
          @click="toggleMarkdownPreview"
        >
          {{ markdownPreviewVisible ? '编辑' : '预览' }}
        </button>
      </div>
    </div>

    <!-- Markdown 预览 -->
    <div
      v-if="markdownPreviewVisible"
      class="ldesign-markdown-preview"
      v-html="markdownHTML"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue'

interface Props {
  id?: string
  name?: string
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  rows?: number
  autosize?: boolean | { minRows?: number; maxRows?: number }
  showCount?: boolean
  maxLength?: number
  showMarkdownPreview?: boolean
  error?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  autosize: false,
  showCount: false,
  showMarkdownPreview: false,
  error: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const textareaRef = ref<HTMLTextAreaElement>()
const textValue = ref(props.modelValue || '')
const isFocused = ref(false)
const markdownPreviewVisible = ref(false)
const textareaHeight = ref<string>()

const wrapperClass = computed(() => ({
  'is-disabled': props.disabled,
  'is-focused': isFocused.value,
  'is-error': props.error
}))

const textareaStyle = computed(() => {
  if (textareaHeight.value) {
    return { height: textareaHeight.value }
  }
  return {}
})

// 简单的 Markdown 转 HTML（实际项目中应使用专门的库）
const markdownHTML = computed(() => {
  if (!textValue.value) return ''
  
  let html = textValue.value
  // 标题
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  // 粗体
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // 斜体
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // 换行
  html = html.replace(/\n/g, '<br>')
  
  return html
})

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  textValue.value = newVal || ''
  if (props.autosize) {
    nextTick(() => adjustHeight())
  }
})

// 监听 autosize 变化
watch(() => props.autosize, () => {
  if (props.autosize) {
    nextTick(() => adjustHeight())
  } else {
    textareaHeight.value = undefined
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  textValue.value = target.value
  emit('update:modelValue', textValue.value)
  
  if (props.autosize) {
    adjustHeight()
  }
}

const handleChange = () => {
  emit('change', textValue.value)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  emit('focus', event)
}

const toggleMarkdownPreview = () => {
  markdownPreviewVisible.value = !markdownPreviewVisible.value
}

// 自动调整高度
const adjustHeight = () => {
  if (!textareaRef.value) return

  const textarea = textareaRef.value
  textarea.style.height = 'auto'
  
  let minHeight = 0
  let maxHeight = Infinity

  if (typeof props.autosize === 'object') {
    if (props.autosize.minRows) {
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      minHeight = props.autosize.minRows * lineHeight
    }
    if (props.autosize.maxRows) {
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      maxHeight = props.autosize.maxRows * lineHeight
    }
  }

  const scrollHeight = textarea.scrollHeight
  let height = Math.max(minHeight, Math.min(maxHeight, scrollHeight))
  
  textareaHeight.value = `${height}px`
}

// 聚焦方法
const focus = () => {
  textareaRef.value?.focus()
}

// 失焦方法
const blur = () => {
  textareaRef.value?.blur()
}

onMounted(() => {
  if (props.autosize) {
    adjustHeight()
  }
})

defineExpose({
  focus,
  blur,
  textareaRef
})
</script>

<style lang="less" scoped>
.ldesign-textarea-field {
  width: 100%;
}

.ldesign-textarea-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
  background-color: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  transition: all 0.3s;

  &:hover:not(.is-disabled) {
    border-color: #722ED1;
  }

  &.is-focused {
    border-color: #722ED1;
    box-shadow: 0 0 0 2px rgba(114, 46, 209, 0.1);
  }

  &.is-error {
    border-color: #ff4d4f;

    &:hover,
    &.is-focused {
      border-color: #ff4d4f;
    }

    &.is-focused {
      box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.1);
    }
  }

  &.is-disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;

    .ldesign-textarea {
      cursor: not-allowed;
    }
  }
}

.ldesign-textarea {
  width: 100%;
  padding: 4px 11px;
  font-size: 14px;
  line-height: 1.5715;
  color: rgba(0, 0, 0, 0.85);
  background: transparent;
  border: none;
  outline: none;
  resize: vertical;
  font-family: inherit;

  &::placeholder {
    color: #bfbfbf;
  }

  &:disabled {
    color: rgba(0, 0, 0, 0.25);
    resize: none;
  }
}

.ldesign-textarea-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 12px;
}

.ldesign-textarea-count {
  color: rgba(0, 0, 0, 0.45);
}

.ldesign-textarea-actions {
  .ldesign-btn-link {
    padding: 0;
    font-size: 12px;
    color: #722ED1;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.3s;

    &:hover {
      color: #5c24a8;
    }
  }
}

.ldesign-markdown-preview {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5715;

  h1, h2, h3 {
    margin: 12px 0 8px;
    font-weight: 600;
  }

  h1 {
    font-size: 24px;
  }

  h2 {
    font-size: 20px;
  }

  h3 {
    font-size: 16px;
  }

  strong {
    font-weight: 600;
  }

  em {
    font-style: italic;
  }
}
</style>






