<!--
富文本编辑器组件
-->

<template>
  <div class="rich-text-editor">
    <div class="editor-toolbar">
      <button
        type="button"
        :class="{ active: isActive('bold') }"
        @click="execCommand('bold')"
        title="粗体"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        :class="{ active: isActive('italic') }"
        @click="execCommand('italic')"
        title="斜体"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        :class="{ active: isActive('underline') }"
        @click="execCommand('underline')"
        title="下划线"
      >
        <u>U</u>
      </button>
      <div class="toolbar-separator"></div>
      <button
        type="button"
        @click="execCommand('insertUnorderedList')"
        title="无序列表"
      >
        • 列表
      </button>
      <button
        type="button"
        @click="execCommand('insertOrderedList')"
        title="有序列表"
      >
        1. 列表
      </button>
      <div class="toolbar-separator"></div>
      <button
        type="button"
        @click="insertLink"
        title="插入链接"
      >
        🔗
      </button>
      <button
        type="button"
        @click="clearFormat"
        title="清除格式"
      >
        清除
      </button>
    </div>
    
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable
      :style="{ minHeight: minHeight + 'px' }"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    ></div>
    
    <div v-if="showWordCount" class="editor-footer">
      <span class="word-count">字数: {{ wordCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

interface Props {
  modelValue?: string
  placeholder?: string
  minHeight?: number
  maxLength?: number
  showWordCount?: boolean
  disabled?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: '请输入内容...',
  minHeight: 200,
  maxLength: undefined,
  showWordCount: true,
  disabled: false
})

const emit = defineEmits<Emits>()

// 响应式数据
const editorRef = ref<HTMLDivElement>()
const wordCount = ref(0)
const isFocused = ref(false)

// 执行编辑命令
const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  updateContent()
}

// 检查命令是否激活
const isActive = (command: string): boolean => {
  return document.queryCommandState(command)
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接地址:')
  if (url) {
    execCommand('createLink', url)
  }
}

// 清除格式
const clearFormat = () => {
  execCommand('removeFormat')
}

// 处理输入
const handleInput = () => {
  updateContent()
}

// 更新内容
const updateContent = () => {
  if (!editorRef.value) return
  
  const content = editorRef.value.innerHTML
  emit('update:modelValue', content)
  
  // 更新字数统计
  const textContent = editorRef.value.textContent || ''
  wordCount.value = textContent.length
  
  // 检查最大长度限制
  if (props.maxLength && textContent.length > props.maxLength) {
    // 截断内容
    const truncated = textContent.substring(0, props.maxLength)
    editorRef.value.textContent = truncated
    wordCount.value = props.maxLength
  }
}

// 处理聚焦
const handleFocus = () => {
  isFocused.value = true
  emit('focus')
}

// 处理失焦
const handleBlur = () => {
  isFocused.value = false
  emit('blur')
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  // 处理快捷键
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        execCommand('bold')
        break
      case 'i':
        event.preventDefault()
        execCommand('italic')
        break
      case 'u':
        event.preventDefault()
        execCommand('underline')
        break
    }
  }
  
  // 检查最大长度
  if (props.maxLength) {
    const textContent = editorRef.value?.textContent || ''
    if (textContent.length >= props.maxLength && !['Backspace', 'Delete'].includes(event.key)) {
      event.preventDefault()
    }
  }
}

// 设置内容
const setContent = (content: string) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content
    updateContent()
  }
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.innerHTML !== newValue) {
    setContent(newValue)
  }
}, { immediate: true })

// 组件挂载后设置初始内容
onMounted(() => {
  if (props.modelValue) {
    nextTick(() => {
      setContent(props.modelValue)
    })
  }
  
  // 设置占位符
  if (!props.modelValue && props.placeholder) {
    editorRef.value!.setAttribute('data-placeholder', props.placeholder)
  }
})
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  transition: border-color 0.2s;
}

.rich-text-editor:focus-within {
  border-color: #f39c12;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 4px 4px 0 0;
}

.editor-toolbar button {
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 3px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.editor-toolbar button:hover {
  background: #e9ecef;
  border-color: #ddd;
}

.editor-toolbar button.active {
  background: #f39c12;
  color: white;
  border-color: #f39c12;
}

.toolbar-separator {
  width: 1px;
  height: 20px;
  background: #ddd;
  margin: 0 4px;
}

.editor-content {
  padding: 12px;
  outline: none;
  line-height: 1.6;
  font-size: 14px;
  color: #333;
  overflow-y: auto;
}

.editor-content:empty::before {
  content: attr(data-placeholder);
  color: #999;
  pointer-events: none;
}

.editor-content p {
  margin: 0 0 8px 0;
}

.editor-content ul,
.editor-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.editor-content a {
  color: #f39c12;
  text-decoration: underline;
}

.editor-content strong {
  font-weight: bold;
}

.editor-content em {
  font-style: italic;
}

.editor-content u {
  text-decoration: underline;
}

.editor-footer {
  padding: 8px 12px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
  border-radius: 0 0 4px 4px;
  display: flex;
  justify-content: flex-end;
}

.word-count {
  font-size: 12px;
  color: #666;
}

.rich-text-editor[data-disabled="true"] {
  opacity: 0.6;
  pointer-events: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .editor-toolbar {
    flex-wrap: wrap;
    gap: 2px;
  }
  
  .editor-toolbar button {
    font-size: 11px;
    padding: 3px 6px;
    min-width: 24px;
    height: 24px;
  }
}
</style>
