<template>
  <div class="vue-integration-page">
    <div class="demo-section">
      <h2>💚 Vue 集成测试</h2>
      <p>测试编辑器与 Vue 3 的完整集成，包括响应式数据绑定、组件化等。</p>
    </div>

    <div class="demo-grid">
      <div class="demo-card">
        <h3>Vue 编辑器组件</h3>
        <EditorComponent 
          v-model="editorContent"
          :options="editorOptions"
          @change="handleContentChange"
          @focus="handleFocus"
          @blur="handleBlur"
        />
        
        <div class="editor-controls">
          <div class="btn-group">
            <button class="btn primary" @click="saveContent">💾 保存</button>
            <button class="btn" @click="loadContent">📂 加载</button>
            <button class="btn" @click="clearContent">🗑️ 清空</button>
            <button class="btn" @click="toggleAutoSave">
              {{ autoSave ? '⏸️ 停止自动保存' : '▶️ 开启自动保存' }}
            </button>
          </div>
        </div>
      </div>

      <div class="demo-card">
        <h3>响应式数据</h3>
        <div class="reactive-data">
          <div class="data-item">
            <strong>内容长度:</strong> {{ contentStats.length }}
          </div>
          <div class="data-item">
            <strong>字符数:</strong> {{ contentStats.charCount }}
          </div>
          <div class="data-item">
            <strong>单词数:</strong> {{ contentStats.wordCount }}
          </div>
          <div class="data-item">
            <strong>段落数:</strong> {{ contentStats.paragraphCount }}
          </div>
          <div class="data-item">
            <strong>编辑器状态:</strong> {{ editorState }}
          </div>
          <div class="data-item">
            <strong>最后更新:</strong> {{ lastUpdate }}
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>🔄 双向数据绑定</h2>
      <div class="demo-grid">
        <div class="demo-card">
          <h3>外部控制</h3>
          <div class="form-group">
            <label>直接修改内容:</label>
            <textarea 
              v-model="editorContent" 
              rows="6"
              class="form-control"
              placeholder="在这里输入内容，编辑器会同步更新"
            ></textarea>
          </div>
          
          <div class="form-group">
            <label>编辑器选项:</label>
            <div class="options-grid">
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="editorOptions.readonly"
                  @change="updateOptions"
                >
                只读模式
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="editorOptions.spellcheck"
                  @change="updateOptions"
                >
                拼写检查
              </label>
              <label class="checkbox-label">
                <input 
                  type="checkbox" 
                  v-model="editorOptions.autofocus"
                  @change="updateOptions"
                >
                自动聚焦
              </label>
            </div>
          </div>
        </div>

        <div class="demo-card">
          <h3>编辑历史</h3>
          <div class="history-list">
            <div 
              v-for="(item, index) in editHistory" 
              :key="index"
              class="history-item"
            >
              <div class="history-time">{{ item.timestamp }}</div>
              <div class="history-action">{{ item.action }}</div>
              <div class="history-length">长度: {{ item.length }}</div>
            </div>
          </div>
          
          <div class="btn-group">
            <button class="btn" @click="clearHistory">🗑️ 清空历史</button>
            <button class="btn" @click="exportHistory">📤 导出历史</button>
          </div>
        </div>
      </div>
    </div>

    <div class="demo-section">
      <h2>⚡ Vue 特性演示</h2>
      <div class="demo-card">
        <h3>Composition API 使用</h3>
        <div class="api-demo">
          <div class="api-item">
            <strong>ref 响应式:</strong> {{ refCount }}
            <button class="btn-small" @click="refCount++">+1</button>
          </div>
          <div class="api-item">
            <strong>reactive 对象:</strong> {{ reactiveData.count }}
            <button class="btn-small" @click="reactiveData.count++">+1</button>
          </div>
          <div class="api-item">
            <strong>computed 计算:</strong> {{ computedValue }}
          </div>
          <div class="api-item">
            <strong>watch 监听:</strong> {{ watchMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import EditorComponent from '../components/EditorComponent.vue'

// 编辑器内容和选项
const editorContent = ref(`<h2>Vue 3 集成演示</h2>
<p>这是一个完整的 Vue 3 + 编辑器集成示例。</p>
<ul>
  <li>响应式数据绑定</li>
  <li>双向数据流</li>
  <li>组件化封装</li>
  <li>Composition API</li>
</ul>
<p>尝试编辑这些内容，观察数据的实时变化！</p>`)

const editorOptions = reactive({
  readonly: false,
  spellcheck: true,
  autofocus: false,
  theme: 'default'
})

// 编辑器状态
const editorState = ref('就绪')
const lastUpdate = ref('-')
const autoSave = ref(false)

// 内容统计
const contentStats = computed(() => {
  const text = editorContent.value.replace(/<[^>]*>/g, '')
  return {
    length: editorContent.value.length,
    charCount: text.length,
    wordCount: text.trim().split(/\s+/).filter(word => word.length > 0).length,
    paragraphCount: (editorContent.value.match(/<\/p>|<\/h[1-6]>|<\/li>/g) || []).length
  }
})

// 编辑历史
const editHistory = ref<Array<{
  timestamp: string
  action: string
  length: number
}>>([])

// Vue 特性演示
const refCount = ref(0)
const reactiveData = reactive({
  count: 0,
  message: 'Hello Vue!'
})

const computedValue = computed(() => {
  return refCount.value + reactiveData.count
})

const watchMessage = ref('等待变化...')

// 自动保存定时器
let autoSaveTimer: number | null = null

// 监听内容变化
watch(editorContent, (newContent, oldContent) => {
  if (newContent !== oldContent) {
    addToHistory('内容修改', newContent.length)
    lastUpdate.value = new Date().toLocaleTimeString()
  }
}, { deep: true })

// 监听计算值变化
watch(computedValue, (newValue) => {
  watchMessage.value = `计算值变化为: ${newValue}`
})

// 事件处理
const handleContentChange = (content: string) => {
  editorContent.value = content
  editorState.value = '内容已更改'
  
  setTimeout(() => {
    editorState.value = '就绪'
  }, 1000)
}

const handleFocus = () => {
  editorState.value = '编辑中'
  addToHistory('获得焦点', editorContent.value.length)
}

const handleBlur = () => {
  editorState.value = '失去焦点'
  addToHistory('失去焦点', editorContent.value.length)
}

const addToHistory = (action: string, length: number) => {
  editHistory.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    action,
    length
  })
  
  // 保持历史记录不超过20条
  if (editHistory.value.length > 20) {
    editHistory.value = editHistory.value.slice(0, 20)
  }
}

const saveContent = () => {
  localStorage.setItem('vue-editor-content', editorContent.value)
  addToHistory('保存内容', editorContent.value.length)
  editorState.value = '内容已保存'
  
  setTimeout(() => {
    editorState.value = '就绪'
  }, 2000)
}

const loadContent = () => {
  const saved = localStorage.getItem('vue-editor-content')
  if (saved) {
    editorContent.value = saved
    addToHistory('加载内容', saved.length)
    editorState.value = '内容已加载'
  } else {
    editorState.value = '没有保存的内容'
  }
  
  setTimeout(() => {
    editorState.value = '就绪'
  }, 2000)
}

const clearContent = () => {
  if (confirm('确定要清空内容吗？')) {
    editorContent.value = '<p>内容已清空...</p>'
    addToHistory('清空内容', 0)
    editorState.value = '内容已清空'
    
    setTimeout(() => {
      editorState.value = '就绪'
    }, 2000)
  }
}

const toggleAutoSave = () => {
  autoSave.value = !autoSave.value
  
  if (autoSave.value) {
    autoSaveTimer = window.setInterval(() => {
      saveContent()
    }, 10000) // 每10秒自动保存
    addToHistory('开启自动保存', editorContent.value.length)
  } else {
    if (autoSaveTimer) {
      clearInterval(autoSaveTimer)
      autoSaveTimer = null
    }
    addToHistory('关闭自动保存', editorContent.value.length)
  }
}

const updateOptions = () => {
  addToHistory('更新选项', editorContent.value.length)
}

const clearHistory = () => {
  editHistory.value = []
}

const exportHistory = () => {
  const data = {
    history: editHistory.value,
    exportTime: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'editor-history.json'
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  addToHistory('页面加载', editorContent.value.length)
  console.log('💚 Vue 集成页面已加载')
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer)
  }
})
</script>

<style scoped lang="less">
.vue-integration-page {
  max-width: 1200px;
  margin: 0 auto;
}

.editor-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--ldesign-border-level-1-color);
}

.reactive-data {
  display: grid;
  gap: 0.75rem;
}

.data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 4px;
  border: 1px solid var(--ldesign-border-level-1-color);
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 6px;
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--ldesign-brand-color);
    box-shadow: 0 0 0 3px var(--ldesign-brand-color-focus);
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 4px;
  border: 1px solid var(--ldesign-border-level-1-color);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-bg-color-component-hover);
  }

  input[type="checkbox"] {
    width: auto;
    margin: 0;
  }
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.history-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 4px;
  border: 1px solid var(--ldesign-border-level-1-color);
  margin-bottom: 0.5rem;
  font-size: 0.85rem;

  .history-time {
    color: var(--ldesign-text-color-secondary);
    font-family: monospace;
  }

  .history-action {
    color: var(--ldesign-text-color-primary);
  }

  .history-length {
    color: var(--ldesign-brand-color);
    font-weight: 500;
  }
}

.api-demo {
  display: grid;
  gap: 1rem;
}

.api-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: var(--ldesign-bg-color-component);
  border-radius: 6px;
  border: 1px solid var(--ldesign-border-level-1-color);
}

.btn-small {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--ldesign-border-level-1-color);
  border-radius: 4px;
  background: var(--ldesign-brand-color);
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--ldesign-brand-color-hover);
  }
}

@media (max-width: 768px) {
  .data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .options-grid {
    grid-template-columns: 1fr;
  }

  .history-item {
    grid-template-columns: 1fr;
    gap: 0.25rem;
  }

  .api-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
