<template>
  <div class="editor-component">
    <div class="editor-toolbar">
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          @click="executeCommand('bold')"
          :class="{ active: isFormatActive('bold') }"
          title="加粗"
        >
          <strong>B</strong>
        </button>
        <button 
          class="toolbar-btn"
          @click="executeCommand('italic')"
          :class="{ active: isFormatActive('italic') }"
          title="斜体"
        >
          <em>I</em>
        </button>
        <button 
          class="toolbar-btn"
          @click="executeCommand('underline')"
          :class="{ active: isFormatActive('underline') }"
          title="下划线"
        >
          <u>U</u>
        </button>
      </div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          @click="executeCommand('formatBlock', 'h1')"
          title="标题1"
        >
          H1
        </button>
        <button 
          class="toolbar-btn"
          @click="executeCommand('formatBlock', 'h2')"
          title="标题2"
        >
          H2
        </button>
        <button 
          class="toolbar-btn"
          @click="executeCommand('formatBlock', 'p')"
          title="段落"
        >
          P
        </button>
      </div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          @click="executeCommand('insertUnorderedList')"
          title="无序列表"
        >
          • 列表
        </button>
        <button 
          class="toolbar-btn"
          @click="executeCommand('insertOrderedList')"
          title="有序列表"
        >
          1. 列表
        </button>
        <button 
          class="toolbar-btn"
          @click="insertQuote"
          title="引用"
        >
          " 引用
        </button>
      </div>
      
      <div class="toolbar-group">
        <button 
          class="toolbar-btn"
          @click="undo"
          :disabled="!canUndo"
          title="撤销"
        >
          ↶
        </button>
        <button 
          class="toolbar-btn"
          @click="redo"
          :disabled="!canRedo"
          title="重做"
        >
          ↷
        </button>
      </div>
    </div>
    
    <div 
      ref="editorRef"
      class="editor-content"
      :contenteditable="!options.readonly"
      :spellcheck="options.spellcheck"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
      @paste="handlePaste"
      v-html="modelValue"
    ></div>
    
    <div class="editor-status">
      <span class="status-item">
        字符: {{ stats.charCount }}
      </span>
      <span class="status-item">
        单词: {{ stats.wordCount }}
      </span>
      <span class="status-item">
        {{ editorState }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, nextTick } from 'vue'

// Props 定义
interface EditorOptions {
  readonly?: boolean
  spellcheck?: boolean
  autofocus?: boolean
  theme?: string
}

interface Props {
  modelValue: string
  options?: EditorOptions
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  options: () => ({
    readonly: false,
    spellcheck: true,
    autofocus: false,
    theme: 'default'
  })
})

const emit = defineEmits<Emits>()

// 编辑器引用
const editorRef = ref<HTMLElement>()

// 编辑器状态
const editorState = ref('就绪')
const isFocused = ref(false)

// 历史记录
const history = ref<string[]>([])
const historyIndex = ref(-1)
const maxHistorySize = 50

// 统计信息
const stats = reactive({
  charCount: 0,
  wordCount: 0
})

// 计算属性
const canUndo = computed(() => historyIndex.value > 0)
const canRedo = computed(() => historyIndex.value < history.value.length - 1)

// 监听 modelValue 变化
watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.innerHTML !== newValue) {
    editorRef.value.innerHTML = newValue
    updateStats()
  }
}, { immediate: true })

// 监听选项变化
watch(() => props.options, (newOptions) => {
  if (editorRef.value) {
    editorRef.value.contentEditable = (!newOptions.readonly).toString()
    editorRef.value.spellcheck = newOptions.spellcheck || false
    
    if (newOptions.autofocus) {
      nextTick(() => {
        editorRef.value?.focus()
      })
    }
  }
}, { deep: true, immediate: true })

// 事件处理
const handleInput = () => {
  if (!editorRef.value) return
  
  const content = editorRef.value.innerHTML
  emit('update:modelValue', content)
  emit('change', content)
  
  updateStats()
  addToHistory(content)
  editorState.value = '已修改'
  
  setTimeout(() => {
    if (editorState.value === '已修改') {
      editorState.value = '就绪'
    }
  }, 1000)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  editorState.value = '编辑中'
  emit('focus', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  editorState.value = '就绪'
  emit('blur', event)
}

const handleKeydown = (event: KeyboardEvent) => {
  // 快捷键处理
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        executeCommand('bold')
        break
      case 'i':
        event.preventDefault()
        executeCommand('italic')
        break
      case 'u':
        event.preventDefault()
        executeCommand('underline')
        break
      case 'z':
        event.preventDefault()
        if (event.shiftKey) {
          redo()
        } else {
          undo()
        }
        break
      case 'y':
        event.preventDefault()
        redo()
        break
    }
  }
  
  // Enter 键处理
  if (event.key === 'Enter') {
    // 可以在这里添加自定义的换行逻辑
  }
}

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault()
  
  const clipboardData = event.clipboardData
  if (!clipboardData) return
  
  // 获取纯文本内容
  const text = clipboardData.getData('text/plain')
  
  // 插入文本
  document.execCommand('insertText', false, text)
}

// 编辑器命令
const executeCommand = (command: string, value?: string) => {
  if (!editorRef.value || props.options.readonly) return
  
  editorRef.value.focus()
  
  try {
    if (value) {
      document.execCommand(command, false, value)
    } else {
      document.execCommand(command, false, null)
    }
    
    handleInput()
  } catch (error) {
    console.error('命令执行失败:', error)
  }
}

const insertQuote = () => {
  const selection = window.getSelection()
  if (!selection || !editorRef.value) return
  
  const range = selection.getRangeAt(0)
  const blockquote = document.createElement('blockquote')
  blockquote.innerHTML = range.toString() || '引用内容'
  
  range.deleteContents()
  range.insertNode(blockquote)
  
  handleInput()
}

// 历史记录管理
const addToHistory = (content: string) => {
  // 如果内容与当前历史记录相同，则不添加
  if (history.value[historyIndex.value] === content) return
  
  // 删除当前位置之后的历史记录
  history.value = history.value.slice(0, historyIndex.value + 1)
  
  // 添加新的历史记录
  history.value.push(content)
  historyIndex.value = history.value.length - 1
  
  // 限制历史记录大小
  if (history.value.length > maxHistorySize) {
    history.value.shift()
    historyIndex.value--
  }
}

const undo = () => {
  if (!canUndo.value || !editorRef.value) return
  
  historyIndex.value--
  const content = history.value[historyIndex.value]
  editorRef.value.innerHTML = content
  emit('update:modelValue', content)
  updateStats()
  
  editorState.value = '已撤销'
  setTimeout(() => {
    editorState.value = '就绪'
  }, 1000)
}

const redo = () => {
  if (!canRedo.value || !editorRef.value) return
  
  historyIndex.value++
  const content = history.value[historyIndex.value]
  editorRef.value.innerHTML = content
  emit('update:modelValue', content)
  updateStats()
  
  editorState.value = '已重做'
  setTimeout(() => {
    editorState.value = '就绪'
  }, 1000)
}

// 格式检查
const isFormatActive = (format: string): boolean => {
  try {
    return document.queryCommandState(format)
  } catch {
    return false
  }
}

// 统计更新
const updateStats = () => {
  if (!editorRef.value) return
  
  const text = editorRef.value.textContent || ''
  stats.charCount = text.length
  stats.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
}

// 公共方法
const focus = () => {
  editorRef.value?.focus()
}

const blur = () => {
  editorRef.value?.blur()
}

const getContent = () => {
  return editorRef.value?.innerHTML || ''
}

const setContent = (content: string) => {
  if (editorRef.value) {
    editorRef.value.innerHTML = content
    emit('update:modelValue', content)
    updateStats()
    addToHistory(content)
  }
}

const clear = () => {
  setContent('')
}

// 暴露方法给父组件
defineExpose({
  focus,
  blur,
  getContent,
  setContent,
  clear,
  undo,
  redo,
  executeCommand
})

// 组件挂载
onMounted(() => {
  if (editorRef.value) {
    // 初始化历史记录
    addToHistory(props.modelValue)
    
    // 更新统计
    updateStats()
    
    // 自动聚焦
    if (props.options.autofocus) {
      nextTick(() => {
        focus()
      })
    }
  }
})
</script>

<style scoped lang="less">
.editor-component {
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 8px;
  background: var(--ldesign-bg-color-container);
  overflow: hidden;
  transition: all 0.2s ease;

  &:focus-within {
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
  }
}

.editor-toolbar {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--ldesign-bg-color-component);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  flex-wrap: wrap;
}

.toolbar-group {
  display: flex;
  gap: 0.25rem;
  padding-right: 0.75rem;
  border-right: 1px solid var(--ldesign-border-level-1-color);

  &:last-child {
    border-right: none;
    padding-right: 0;
  }
}

.toolbar-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--ldesign-text-color-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-component-hover);
    border-color: var(--ldesign-border-level-1-color);
  }

  &.active {
    background: var(--ldesign-brand-color);
    color: white;
    border-color: var(--ldesign-brand-color);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.editor-content {
  min-height: 200px;
  padding: 1rem;
  outline: none;
  line-height: 1.6;
  font-size: 0.9rem;
  color: var(--ldesign-text-color-primary);

  // 编辑器内容样式
  :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
    margin: 0.5rem 0;
    color: var(--ldesign-text-color-primary);
  }

  :deep(p) {
    margin: 0.5rem 0;
  }

  :deep(ul), :deep(ol) {
    margin: 0.5rem 0;
    padding-left: 2rem;
  }

  :deep(blockquote) {
    margin: 1rem 0;
    padding: 0.75rem 1rem;
    border-left: 4px solid var(--ldesign-brand-color);
    background: var(--ldesign-brand-color-1);
    color: var(--ldesign-text-color-secondary);
    font-style: italic;
  }

  :deep(code) {
    padding: 0.25rem 0.5rem;
    background: var(--ldesign-bg-color-component);
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.85rem;
  }

  :deep(pre) {
    margin: 1rem 0;
    padding: 1rem;
    background: var(--ldesign-bg-color-component);
    border-radius: 6px;
    overflow-x: auto;

    code {
      padding: 0;
      background: none;
    }
  }

  &[contenteditable="false"] {
    background: var(--ldesign-bg-color-component-disabled);
    cursor: not-allowed;
  }
}

.editor-status {
  display: flex;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--ldesign-bg-color-component);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  font-size: 0.8rem;
  color: var(--ldesign-text-color-secondary);
}

.status-item {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .editor-toolbar {
    padding: 0.5rem;
    gap: 0.25rem;
  }

  .toolbar-group {
    padding-right: 0.5rem;
  }

  .toolbar-btn {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
    min-width: 32px;
  }

  .editor-content {
    padding: 0.75rem;
    font-size: 0.85rem;
  }

  .editor-status {
    padding: 0.375rem 0.75rem;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
}
</style>
