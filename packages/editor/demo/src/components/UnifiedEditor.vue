<template>
  <div class="unified-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <!-- 文本格式化组 -->
      <div class="toolbar-group">
        <button 
          @click="executeCommand('bold')"
          :class="{ active: isCommandActive('bold') }"
          class="toolbar-btn"
          title="加粗 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button 
          @click="executeCommand('italic')"
          :class="{ active: isCommandActive('italic') }"
          class="toolbar-btn"
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button 
          @click="executeCommand('underline')"
          :class="{ active: isCommandActive('underline') }"
          class="toolbar-btn"
          title="下划线 (Ctrl+U)"
        >
          <u>U</u>
        </button>
      </div>

      <!-- 段落格式组 -->
      <div class="toolbar-group">
        <select 
          @change="changeHeading($event)"
          class="heading-select"
          title="标题级别"
        >
          <option value="">正文</option>
          <option value="h1">标题 1</option>
          <option value="h2">标题 2</option>
          <option value="h3">标题 3</option>
          <option value="h4">标题 4</option>
          <option value="h5">标题 5</option>
          <option value="h6">标题 6</option>
        </select>
        <button 
          @click="executeCommand('list')"
          class="toolbar-btn"
          title="列表"
        >
          📝
        </button>
        <button 
          @click="executeCommand('blockquote')"
          class="toolbar-btn"
          title="引用"
        >
          💬
        </button>
      </div>

      <!-- 插入内容组 -->
      <div class="toolbar-group">
        <button 
          @click="insertImage"
          class="toolbar-btn"
          title="插入图片"
        >
          🖼️
        </button>
        <button 
          @click="insertLink"
          class="toolbar-btn"
          title="插入链接 (Ctrl+K)"
        >
          🔗
        </button>
        <button 
          @click="uploadFile"
          class="toolbar-btn"
          title="上传文件"
        >
          📁
        </button>
      </div>

      <!-- 主题和视图组 -->
      <div class="toolbar-group">
        <select 
          @change="changeTheme($event)"
          v-model="currentTheme"
          class="theme-select"
          title="主题"
        >
          <option value="default">默认主题</option>
          <option value="dark">暗色主题</option>
          <option value="minimal">简洁主题</option>
          <option value="rainbow">彩虹主题</option>
        </select>
        <button 
          @click="toggleFullscreen"
          class="toolbar-btn"
          title="全屏模式"
        >
          {{ isFullscreen ? '🗗' : '🗖' }}
        </button>
      </div>

      <!-- 操作组 -->
      <div class="toolbar-group">
        <button 
          @click="undo"
          :disabled="!canUndo"
          class="toolbar-btn"
          title="撤销 (Ctrl+Z)"
        >
          ↶
        </button>
        <button 
          @click="redo"
          :disabled="!canRedo"
          class="toolbar-btn"
          title="重做 (Ctrl+Y)"
        >
          ↷
        </button>
        <button 
          @click="clearContent"
          class="toolbar-btn"
          title="清空内容"
        >
          🗑️
        </button>
        <button 
          @click="exportContent"
          class="toolbar-btn"
          title="导出内容"
        >
          📤
        </button>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div 
      ref="editorContainer"
      class="editor-content"
      :class="{ fullscreen: isFullscreen }"
      contenteditable="true"
      @input="handleInput"
      @keydown="handleKeydown"
      @click="handleClick"
      @paste="handlePaste"
    >
      <h1>欢迎使用 LDesign Editor</h1>
      <p>这是一个功能完整的富文本编辑器，集成了所有已开发的功能：</p>
      <ul>
        <li><strong>文本格式化</strong>：支持加粗、斜体、下划线等格式</li>
        <li><strong>段落格式</strong>：支持标题、列表、引用等段落样式</li>
        <li><strong>图片管理</strong>：支持图片插入、上传、编辑和管理</li>
        <li><strong>链接功能</strong>：支持链接插入、编辑和管理</li>
        <li><strong>主题系统</strong>：支持多种主题切换</li>
        <li><strong>响应式设计</strong>：完美适配各种设备</li>
      </ul>
      <p>试试选择文本并使用工具栏功能，或者插入图片和链接！</p>
      <blockquote>
        <p>这是一个引用示例。你可以使用工具栏来创建各种格式的内容。</p>
      </blockquote>
    </div>

    <!-- 状态栏 -->
    <div class="editor-status">
      <div class="status-item">
        <span class="status-label">字数:</span>
        <span class="status-value">{{ wordCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">字符:</span>
        <span class="status-value">{{ charCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">段落:</span>
        <span class="status-value">{{ paragraphCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">图片:</span>
        <span class="status-value">{{ imageCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">链接:</span>
        <span class="status-value">{{ linkCount }}</span>
      </div>
      <div class="status-item">
        <span class="status-label">主题:</span>
        <span class="status-value">{{ currentTheme }}</span>
      </div>
    </div>

    <!-- 媒体上传对话框 -->
    <input 
      ref="fileInput"
      type="file"
      accept="image/*"
      multiple
      style="display: none"
      @change="handleFileUpload"
    >
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'

// 响应式数据
const editorContainer = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const currentTheme = ref('default')
const isFullscreen = ref(false)
const canUndo = ref(false)
const canRedo = ref(false)

// 编辑器状态
const editorState = reactive({
  content: '',
  selection: null as Selection | null,
  activeCommands: new Set<string>()
})

// 计算属性
const wordCount = computed(() => {
  if (!editorContainer.value) return 0
  const text = editorContainer.value.textContent || ''
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
})

const charCount = computed(() => {
  if (!editorContainer.value) return 0
  return (editorContainer.value.textContent || '').length
})

const paragraphCount = computed(() => {
  if (!editorContainer.value) return 0
  return editorContainer.value.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li').length
})

const imageCount = computed(() => {
  if (!editorContainer.value) return 0
  return editorContainer.value.querySelectorAll('img').length
})

const linkCount = computed(() => {
  if (!editorContainer.value) return 0
  return editorContainer.value.querySelectorAll('a').length
})

// 生命周期
onMounted(() => {
  console.log('🚀 统一编辑器已加载')
  initializeEditor()
  setupEventListeners()
})

// 初始化编辑器
function initializeEditor() {
  if (!editorContainer.value) return
  
  // 设置初始焦点
  editorContainer.value.focus()
  
  // 更新状态
  updateEditorState()
}

// 设置事件监听器
function setupEventListeners() {
  // 监听选区变化
  document.addEventListener('selectionchange', updateActiveCommands)
  
  // 监听主题变化
  document.addEventListener('themechange', (e: any) => {
    currentTheme.value = e.detail.theme
  })
}

// 执行命令
function executeCommand(command: string, value?: any) {
  try {
    switch (command) {
      case 'bold':
        document.execCommand('bold')
        break
      case 'italic':
        document.execCommand('italic')
        break
      case 'underline':
        document.execCommand('underline')
        break
      case 'list':
        document.execCommand('insertUnorderedList')
        break
      case 'blockquote':
        formatBlockquote()
        break
      default:
        document.execCommand(command, false, value)
    }
    
    updateActiveCommands()
    updateEditorState()
  } catch (error) {
    console.error('命令执行失败:', error)
  }
}

// 检查命令是否激活
function isCommandActive(command: string): boolean {
  try {
    return document.queryCommandState(command)
  } catch {
    return false
  }
}

// 更新激活的命令
function updateActiveCommands() {
  const commands = ['bold', 'italic', 'underline']
  editorState.activeCommands.clear()
  
  commands.forEach(command => {
    if (isCommandActive(command)) {
      editorState.activeCommands.add(command)
    }
  })
}

// 更改标题
function changeHeading(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  
  if (value) {
    document.execCommand('formatBlock', false, value)
  } else {
    document.execCommand('formatBlock', false, 'p')
  }
  
  updateEditorState()
}

// 格式化引用
function formatBlockquote() {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return
  
  const range = selection.getRangeAt(0)
  const blockquote = document.createElement('blockquote')
  
  try {
    range.surroundContents(blockquote)
  } catch {
    // 如果选区跨越多个元素，使用不同的方法
    const contents = range.extractContents()
    blockquote.appendChild(contents)
    range.insertNode(blockquote)
  }
  
  selection.removeAllRanges()
  selection.addRange(range)
}

// 插入图片
function insertImage() {
  const url = prompt('请输入图片URL:')
  if (url) {
    const img = document.createElement('img')
    img.src = url
    img.alt = '插入的图片'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    
    insertElementAtCursor(img)
    updateEditorState()
  }
}

// 插入链接
function insertLink() {
  const selection = window.getSelection()
  const selectedText = selection?.toString() || ''
  
  const url = prompt('请输入链接URL:')
  if (!url) return
  
  const text = prompt('请输入链接文本:', selectedText || url) || url
  
  const link = document.createElement('a')
  link.href = url
  link.textContent = text
  link.target = '_blank'
  link.rel = 'noopener noreferrer'
  
  if (selectedText) {
    document.execCommand('createLink', false, url)
  } else {
    insertElementAtCursor(link)
  }
  
  updateEditorState()
}

// 上传文件
function uploadFile() {
  fileInput.value?.click()
}

// 处理文件上传
async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (!files || files.length === 0) return
  
  for (const file of files) {
    if (file.type.startsWith('image/')) {
      try {
        const url = URL.createObjectURL(file)
        const img = document.createElement('img')
        img.src = url
        img.alt = file.name
        img.style.maxWidth = '100%'
        img.style.height = 'auto'
        
        insertElementAtCursor(img)
      } catch (error) {
        console.error('文件上传失败:', error)
        alert('文件上传失败: ' + (error instanceof Error ? error.message : '未知错误'))
      }
    }
  }
  
  updateEditorState()
  
  // 清空文件输入
  target.value = ''
}

// 在光标位置插入元素
function insertElementAtCursor(element: HTMLElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) {
    editorContainer.value?.appendChild(element)
    return
  }
  
  const range = selection.getRangeAt(0)
  range.deleteContents()
  range.insertNode(element)
  
  // 移动光标到元素后面
  range.setStartAfter(element)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

// 更改主题
function changeTheme(event: Event) {
  const target = event.target as HTMLSelectElement
  const theme = target.value
  
  // 移除所有主题类
  document.body.classList.remove('theme-default', 'theme-dark', 'theme-minimal', 'theme-rainbow')
  
  // 添加新主题类
  if (theme !== 'default') {
    document.body.classList.add(`theme-${theme}`)
  }
  
  currentTheme.value = theme
  
  // 触发主题变化事件
  document.dispatchEvent(new CustomEvent('themechange', {
    detail: { theme }
  }))
}

// 切换全屏
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  
  if (isFullscreen.value) {
    document.body.classList.add('editor-fullscreen')
  } else {
    document.body.classList.remove('editor-fullscreen')
  }
}

// 撤销
function undo() {
  document.execCommand('undo')
  updateEditorState()
}

// 重做
function redo() {
  document.execCommand('redo')
  updateEditorState()
}

// 清空内容
function clearContent() {
  if (confirm('确定要清空所有内容吗？')) {
    if (editorContainer.value) {
      editorContainer.value.innerHTML = '<p>开始编辑...</p>'
      updateEditorState()
    }
  }
}

// 导出内容
function exportContent() {
  if (!editorContainer.value) return
  
  const content = editorContainer.value.innerHTML
  const blob = new Blob([content], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = 'editor-content.html'
  a.click()
  
  URL.revokeObjectURL(url)
}

// 处理输入
function handleInput() {
  updateEditorState()
}

// 处理键盘事件
function handleKeydown(event: KeyboardEvent) {
  // 快捷键支持
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
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
      case 'k':
        event.preventDefault()
        insertLink()
        break
      case 'z':
        if (event.shiftKey) {
          event.preventDefault()
          redo()
        } else {
          event.preventDefault()
          undo()
        }
        break
      case 'y':
        event.preventDefault()
        redo()
        break
    }
  }
  
  // 更新状态
  nextTick(() => {
    updateActiveCommands()
    updateEditorState()
  })
}

// 处理点击
function handleClick() {
  updateActiveCommands()
  updateEditorState()
}

// 处理粘贴
function handlePaste(event: ClipboardEvent) {
  // 可以在这里添加粘贴处理逻辑
  nextTick(() => {
    updateEditorState()
  })
}

// 更新编辑器状态
function updateEditorState() {
  if (!editorContainer.value) return
  
  editorState.content = editorContainer.value.innerHTML
  editorState.selection = window.getSelection()
  
  // 更新撤销重做状态
  canUndo.value = document.queryCommandEnabled('undo')
  canRedo.value = document.queryCommandEnabled('redo')
}
</script>

<style lang="less" scoped>
.unified-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ls-spacing-sm);
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border-bottom: 1px solid var(--ldesign-border-color);

  .toolbar-group {
    display: flex;
    gap: var(--ls-spacing-xs);
    align-items: center;
    padding: 0 var(--ls-padding-xs);
    border-right: 1px solid var(--ldesign-border-color);

    &:last-child {
      border-right: none;
    }
  }

  .toolbar-btn {
    min-width: 32px;
    height: 32px;
    padding: var(--ls-padding-xs);
    background: var(--ldesign-bg-color-container);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    cursor: pointer;
    font-size: var(--ls-font-size-sm);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background: var(--ldesign-bg-color-container-hover);
      border-color: var(--ldesign-brand-color);
    }

    &.active {
      background: var(--ldesign-brand-color);
      color: var(--ldesign-font-white-1);
      border-color: var(--ldesign-brand-color);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  .heading-select,
  .theme-select {
    padding: var(--ls-padding-xs) var(--ls-padding-sm);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-sm);
    background: var(--ldesign-bg-color-container);
    font-size: var(--ls-font-size-xs);
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
    }
  }
}

.editor-content {
  flex: 1;
  padding: var(--ls-padding-base);
  overflow-y: auto;
  font-family: inherit;
  line-height: 1.6;
  outline: none;

  &.fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    background: var(--ldesign-bg-color-container);
  }

  h1, h2, h3, h4, h5, h6 {
    margin: var(--ls-margin-base) 0 var(--ls-margin-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: var(--ls-margin-sm) 0;
    color: var(--ldesign-text-color-primary);
  }

  ul, ol {
    margin: var(--ls-margin-sm) 0;
    padding-left: var(--ls-padding-lg);
  }

  blockquote {
    margin: var(--ls-margin-base) 0;
    padding: var(--ls-padding-base);
    border-left: 4px solid var(--ldesign-brand-color);
    background: var(--ldesign-bg-color-component);
    border-radius: var(--ls-border-radius-sm);
    font-style: italic;
  }

  img {
    max-width: 100%;
    height: auto;
    border-radius: var(--ls-border-radius-sm);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.9;
    }
  }

  a {
    color: var(--ldesign-brand-color);
    text-decoration: underline;
    cursor: pointer;

    &:hover {
      color: var(--ldesign-brand-color-hover);
    }
  }
}

.editor-status {
  display: flex;
  gap: var(--ls-spacing-base);
  padding: var(--ls-padding-sm);
  background: var(--ldesign-bg-color-component);
  border-top: 1px solid var(--ldesign-border-color);
  font-size: var(--ls-font-size-xs);

  .status-item {
    .status-label {
      color: var(--ldesign-text-color-secondary);
      margin-right: var(--ls-spacing-xs);
    }

    .status-value {
      color: var(--ldesign-text-color-primary);
      font-weight: 500;
    }
  }
}

// 全屏模式样式
:global(.editor-fullscreen) {
  .unified-editor {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
    border-radius: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .editor-toolbar {
    .toolbar-group {
      padding: 0;
      border-right: none;
      margin-bottom: var(--ls-margin-xs);
    }
  }

  .editor-status {
    flex-wrap: wrap;
    gap: var(--ls-spacing-sm);
  }
}
</style>
