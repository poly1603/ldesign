<template>
  <div class="basic-editor-page">
    <div class="demo-section">
      <h2>📝 基础编辑器测试</h2>
      <p>测试编辑器的核心功能，包括文本编辑、格式化、插件系统等。</p>
    </div>

    <div class="demo-grid">
      <!-- 编辑器实例 -->
      <div class="demo-card">
        <h3>编辑器实例</h3>
        <div class="toolbar">
          <div class="toolbar-group">
            <button class="toolbar-btn" @click="executeCommand('bold')" title="加粗">
              <strong>B</strong>
            </button>
            <button class="toolbar-btn" @click="executeCommand('italic')" title="斜体">
              <em>I</em>
            </button>
            <button class="toolbar-btn" @click="executeCommand('underline')" title="下划线">
              <u>U</u>
            </button>
          </div>
          <div class="toolbar-group">
            <button class="toolbar-btn" @click="executeCommand('heading1')" title="标题1">H1</button>
            <button class="toolbar-btn" @click="executeCommand('heading2')" title="标题2">H2</button>
            <button class="toolbar-btn" @click="executeCommand('heading3')" title="标题3">H3</button>
          </div>
          <div class="toolbar-group">
            <button class="toolbar-btn" @click="executeCommand('bulletList')" title="无序列表">• 列表</button>
            <button class="toolbar-btn" @click="executeCommand('orderedList')" title="有序列表">1. 列表</button>
            <button class="toolbar-btn" @click="executeCommand('blockquote')" title="引用">" 引用</button>
          </div>
        </div>
        <div 
          ref="editorRef" 
          class="editor-container"
          contenteditable="true"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <h2>LDesign Editor 基础测试</h2>
          <p>这是一个基于 <strong>Vite</strong> 构建的富文本编辑器测试页面。</p>
          <ul>
            <li>支持基础文本格式化</li>
            <li>支持标题和列表</li>
            <li>支持引用块</li>
            <li>完整的 TypeScript 支持</li>
          </ul>
          <blockquote>
            通过 alias 配置，可以直接导入编辑器源码进行测试。
          </blockquote>
          <p>开始编辑这些内容，体验编辑器的功能吧！</p>
        </div>
        
        <div class="editor-controls">
          <div class="btn-group">
            <button class="btn primary" @click="saveContent">💾 保存内容</button>
            <button class="btn" @click="clearContent">🗑️ 清空内容</button>
            <button class="btn" @click="toggleReadonly">
              {{ isReadonly ? '📝 启用编辑' : '🔒 只读模式' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 编辑器状态 -->
      <div class="demo-card">
        <h3>编辑器状态</h3>
        <div class="status-grid">
          <div class="status-item">
            <div class="status-label">字符数</div>
            <div class="status-value">{{ stats.charCount }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">单词数</div>
            <div class="status-value">{{ stats.wordCount }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">段落数</div>
            <div class="status-value">{{ stats.paragraphCount }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">选中文本</div>
            <div class="status-value">{{ stats.selectedText || '无' }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">编辑器状态</div>
            <div class="status-value">{{ editorState }}</div>
          </div>
          <div class="status-item">
            <div class="status-label">最后更新</div>
            <div class="status-value">{{ lastUpdate }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 源码导入测试 -->
    <div class="demo-section">
      <h2>🔧 源码导入测试</h2>
      <div class="demo-card">
        <h3>模块导入状态</h3>
        <div class="import-status">
          <div class="import-item" :class="{ success: importStatus.core }">
            <span class="import-icon">{{ importStatus.core ? '✅' : '❌' }}</span>
            <span class="import-text">核心模块 (@ldesign/editor)</span>
          </div>
          <div class="import-item" :class="{ success: importStatus.types }">
            <span class="import-icon">{{ importStatus.types ? '✅' : '❌' }}</span>
            <span class="import-text">类型定义 (@ldesign/editor/types)</span>
          </div>
          <div class="import-item" :class="{ success: importStatus.themes }">
            <span class="import-icon">{{ importStatus.themes ? '✅' : '❌' }}</span>
            <span class="import-text">主题系统 (@ldesign/editor/themes)</span>
          </div>
          <div class="import-item" :class="{ success: importStatus.plugins }">
            <span class="import-icon">{{ importStatus.plugins ? '✅' : '❌' }}</span>
            <span class="import-text">插件系统 (@ldesign/editor/plugins)</span>
          </div>
        </div>
        
        <div class="import-code">
          <h4>导入代码示例：</h4>
          <pre><code>{{ importCode }}</code></pre>
        </div>
      </div>
    </div>

    <!-- HTML 输出 -->
    <div class="demo-section">
      <h2>📄 HTML 输出</h2>
      <div class="demo-card">
        <h3>实时 HTML 预览</h3>
        <div class="html-output">
          <pre><code>{{ htmlContent }}</code></pre>
        </div>
        <div class="btn-group">
          <button class="btn" @click="copyHtml">📋 复制 HTML</button>
          <button class="btn" @click="downloadHtml">💾 下载 HTML</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'

// 编辑器引用
const editorRef = ref<HTMLElement>()

// 编辑器状态
const isReadonly = ref(false)
const editorState = ref('就绪')
const lastUpdate = ref('-')
const htmlContent = ref('')

// 统计信息
const stats = reactive({
  charCount: 0,
  wordCount: 0,
  paragraphCount: 0,
  selectedText: ''
})

// 导入状态
const importStatus = reactive({
  core: false,
  types: false,
  themes: false,
  plugins: false
})

const importCode = `// 测试模块导入
import { LDesignEditor } from '@ldesign/editor'
import type { EditorOptions } from '@ldesign/editor/types'
import { ThemeManager } from '@ldesign/editor/themes'
import { PluginRegistry } from '@ldesign/editor/plugins'

// 创建编辑器实例
const editor = new LDesignEditor({
  container: '#editor',
  theme: 'default'
})`

// 测试模块导入
const testImports = async () => {
  try {
    // 测试核心模块导入
    const coreModule = await import('@ldesign/editor')
    importStatus.core = !!coreModule
    console.log('✅ 核心模块导入成功:', coreModule)
  } catch (error) {
    console.error('❌ 核心模块导入失败:', error)
    importStatus.core = false
  }

  try {
    // 测试类型定义导入
    const typesModule = await import('@ldesign/editor/types')
    importStatus.types = !!typesModule
    console.log('✅ 类型定义导入成功:', typesModule)
  } catch (error) {
    console.error('❌ 类型定义导入失败:', error)
    importStatus.types = false
  }

  try {
    // 测试主题系统导入
    const themesModule = await import('@ldesign/editor/themes')
    importStatus.themes = !!themesModule
    console.log('✅ 主题系统导入成功:', themesModule)
  } catch (error) {
    console.error('❌ 主题系统导入失败:', error)
    importStatus.themes = false
  }

  try {
    // 测试插件系统导入
    const pluginsModule = await import('@ldesign/editor/plugins')
    importStatus.plugins = !!pluginsModule
    console.log('✅ 插件系统导入成功:', pluginsModule)
  } catch (error) {
    console.error('❌ 插件系统导入失败:', error)
    importStatus.plugins = false
  }
}

// 执行编辑命令
const executeCommand = (command: string) => {
  if (!editorRef.value) return
  
  editorRef.value.focus()
  
  try {
    document.execCommand(command, false, null)
    editorState.value = `执行命令: ${command}`
    updateStats()
    
    setTimeout(() => {
      editorState.value = '就绪'
    }, 2000)
  } catch (error) {
    console.error('命令执行失败:', error)
    editorState.value = '命令执行失败'
  }
}

// 处理输入事件
const handleInput = () => {
  updateStats()
  updateHtmlContent()
  lastUpdate.value = new Date().toLocaleTimeString()
}

// 处理焦点事件
const handleFocus = () => {
  editorState.value = '编辑中'
}

const handleBlur = () => {
  editorState.value = '就绪'
}

// 更新统计信息
const updateStats = () => {
  if (!editorRef.value) return
  
  const text = editorRef.value.textContent || ''
  const html = editorRef.value.innerHTML || ''
  
  stats.charCount = text.length
  stats.wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
  stats.paragraphCount = html.split(/<\/p>|<\/h[1-6]>|<\/li>/).filter(p => p.trim().length > 0).length
  
  // 获取选中文本
  const selection = window.getSelection()
  stats.selectedText = selection?.toString() || ''
}

// 更新HTML内容
const updateHtmlContent = () => {
  if (!editorRef.value) return
  htmlContent.value = editorRef.value.innerHTML
}

// 保存内容
const saveContent = () => {
  const content = editorRef.value?.innerHTML || ''
  localStorage.setItem('ldesign-editor-content', content)
  editorState.value = '内容已保存'
  
  setTimeout(() => {
    editorState.value = '就绪'
  }, 2000)
}

// 清空内容
const clearContent = () => {
  if (!editorRef.value) return
  
  if (confirm('确定要清空所有内容吗？')) {
    editorRef.value.innerHTML = '<p>内容已清空，开始输入新内容...</p>'
    updateStats()
    updateHtmlContent()
    editorState.value = '内容已清空'
    
    setTimeout(() => {
      editorState.value = '就绪'
    }, 2000)
  }
}

// 切换只读模式
const toggleReadonly = () => {
  if (!editorRef.value) return
  
  isReadonly.value = !isReadonly.value
  editorRef.value.contentEditable = (!isReadonly.value).toString()
  editorRef.value.style.backgroundColor = isReadonly.value ? '#f5f5f5' : 'white'
  
  editorState.value = isReadonly.value ? '只读模式' : '编辑模式'
}

// 复制HTML
const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(htmlContent.value)
    editorState.value = 'HTML已复制'
    
    setTimeout(() => {
      editorState.value = '就绪'
    }, 2000)
  } catch (error) {
    console.error('复制失败:', error)
    editorState.value = '复制失败'
  }
}

// 下载HTML
const downloadHtml = () => {
  const blob = new Blob([htmlContent.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'editor-content.html'
  a.click()
  URL.revokeObjectURL(url)
  
  editorState.value = 'HTML已下载'
  
  setTimeout(() => {
    editorState.value = '就绪'
  }, 2000)
}

// 组件挂载
onMounted(async () => {
  await nextTick()
  
  // 测试模块导入
  await testImports()
  
  // 初始化统计
  updateStats()
  updateHtmlContent()
  
  // 尝试恢复保存的内容
  const savedContent = localStorage.getItem('ldesign-editor-content')
  if (savedContent && editorRef.value) {
    editorRef.value.innerHTML = savedContent
    updateStats()
    updateHtmlContent()
  }
  
  console.log('📝 基础编辑器页面已加载')
})
</script>

<style scoped lang="less">
.basic-editor-page {
  max-width: 1200px;
  margin: 0 auto;
}

.editor-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.status-item {
  text-align: center;
  padding: 1rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 6px;
  border: 1px solid var(--ldesign-border-level-1-color);

  .status-label {
    font-size: 0.85rem;
    color: var(--ldesign-text-color-secondary);
    margin-bottom: 0.5rem;
  }

  .status-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--ldesign-brand-color);
    word-break: break-all;
  }
}

.import-status {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.import-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 6px;
  border: 1px solid var(--ldesign-border-level-1-color);
  transition: all 0.2s ease;

  &.success {
    border-color: var(--ldesign-success-color);
    background: var(--ldesign-success-color-1);
  }

  .import-icon {
    font-size: 1.2rem;
  }

  .import-text {
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.9rem;
  }
}

.import-code {
  h4 {
    margin: 0 0 0.75rem 0;
    color: var(--ldesign-text-color-primary);
  }

  pre {
    background: var(--ldesign-bg-color-component);
    border: 1px solid var(--ldesign-border-level-1-color);
    border-radius: 6px;
    padding: 1rem;
    overflow-x: auto;
    margin: 0;

    code {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--ldesign-text-color-primary);
    }
  }
}

.html-output {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;

  pre {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;

    code {
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.85rem;
      line-height: 1.5;
      color: var(--ldesign-text-color-primary);
    }
  }
}

@media (max-width: 768px) {
  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .status-item {
    padding: 0.75rem;

    .status-label {
      font-size: 0.8rem;
    }

    .status-value {
      font-size: 1rem;
    }
  }

  .import-item {
    padding: 0.5rem;

    .import-text {
      font-size: 0.8rem;
    }
  }
}
</style>
