<template>
  <div class="readme-tab">
    <div class="tab-header">
      <div class="header-left">
        <FileText :size="20" />
        <h3>README.md</h3>
      </div>
      <div class="header-actions">
        <button v-if="!isEditing" @click="startEdit" class="btn-secondary">
          <Edit2 :size="16" />
          <span>编辑</span>
        </button>
        <template v-else>
          <button @click="cancelEdit" class="btn-secondary">
            <X :size="16" />
            <span>取消</span>
          </button>
          <button @click="saveReadme" :disabled="saving" class="btn-primary">
            <Save :size="16" />
            <span>{{ saving ? '保存中...' : '保存' }}</span>
          </button>
        </template>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="32" class="spinner" />
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <AlertCircle :size="32" />
      <p>{{ error }}</p>
      <button @click="loadReadme" class="btn-secondary">重试</button>
    </div>

    <div v-else class="readme-content">
      <!-- 编辑模式 -->
      <div v-if="isEditing" class="editor-container">
        <textarea
          v-model="editContent"
          class="markdown-editor"
          placeholder="在此输入 Markdown 内容..."
        ></textarea>
        <div class="editor-toolbar">
          <span class="toolbar-label">Markdown 语法支持</span>
          <span class="char-count">{{ editContent.length }} 字符</span>
        </div>
      </div>

      <!-- 预览模式 -->
      <div v-else class="markdown-preview">
        <div v-if="!content" class="empty-state">
          <FileText :size="48" />
          <p>暂无 README 文件</p>
          <button @click="startEdit" class="btn-primary">创建 README</button>
        </div>
        <div v-else v-html="renderedContent" class="markdown-body"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { FileText, Edit2, Save, X, Loader2, AlertCircle } from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useMessage } from '../../composables/useMessage'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'

interface Props {
  projectId: string
}

const props = defineProps<Props>()
const api = useApi()
const message = useMessage()

const loading = ref(true)
const error = ref('')
const content = ref('')
const editContent = ref('')
const isEditing = ref(false)
const saving = ref(false)

// Configure marked with highlight.js
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.error('Highlight error:', err)
      }
    }
    return hljs.highlightAuto(code).value
  }
})

const renderedContent = computed(() => {
  if (!content.value) return ''
  try {
    const html = marked(content.value)
    // Trigger syntax highlighting after render
    nextTick(() => {
      document.querySelectorAll('.markdown-body pre code').forEach((block) => {
        if (block instanceof HTMLElement && !block.dataset.highlighted) {
          hljs.highlightElement(block)
        }
      })
    })
    return html
  } catch (err) {
    return '<p>Markdown 渲染失败</p>'
  }
})

const loadReadme = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/api/projects/${props.projectId}/readme`)
    
    if (response.success) {
      content.value = response.data.content || ''
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  editContent.value = content.value
  isEditing.value = true
}

const cancelEdit = () => {
  editContent.value = ''
  isEditing.value = false
}

const saveReadme = async () => {
  saving.value = true
  
  try {
    const response = await api.post(`/api/projects/${props.projectId}/readme`, {
      content: editContent.value
    })
    
    if (response.success) {
      content.value = editContent.value
      isEditing.value = false
      message.success('保存成功')
    } else {
      message.error(response.message || '保存失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadReadme()
})
</script>

<style lang="less" scoped>
.readme-tab {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--ls-padding-base);
  border-bottom: 1px solid var(--ldesign-border-color);

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    svg {
      color: var(--ldesign-brand-color);
    }

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    gap: var(--ls-spacing-sm);
  }
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-xl) 0;
  gap: var(--ls-spacing-base);
  color: var(--ldesign-text-color-secondary);

  .spinner {
    animation: spin 1s linear infinite;
  }
}

.readme-content {
  min-height: 400px;
}

.editor-container {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);

  .markdown-editor {
    width: 100%;
    min-height: 500px;
    padding: var(--ls-padding-base);
    background: var(--ldesign-bg-color-page);
    border: 1px solid var(--ldesign-border-color);
    border-radius: var(--ls-border-radius-base);
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: var(--ls-font-size-sm);
    line-height: 1.6;
    color: var(--ldesign-text-color-primary);
    resize: vertical;

    &:focus {
      outline: none;
      border-color: var(--ldesign-brand-color);
      box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
    }
  }

  .editor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-secondary);

    .char-count {
      font-family: 'Consolas', 'Monaco', monospace;
    }
  }
}

.markdown-preview {
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--ls-padding-xl) 0;
    gap: var(--ls-spacing-base);
    color: var(--ldesign-text-color-placeholder);

    svg {
      color: var(--ldesign-text-color-placeholder);
    }

    p {
      margin: 0;
      color: var(--ldesign-text-color-secondary);
    }
  }

  .markdown-body {
    padding: var(--ls-padding-base);
    line-height: 1.8;

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }

    :deep(h1) { font-size: 2em; border-bottom: 1px solid var(--ldesign-border-color); padding-bottom: 0.3em; }
    :deep(h2) { font-size: 1.5em; border-bottom: 1px solid var(--ldesign-border-color); padding-bottom: 0.3em; }
    :deep(h3) { font-size: 1.25em; }
    :deep(h4) { font-size: 1em; }

    :deep(p) {
      margin: 1em 0;
      color: var(--ldesign-text-color-primary);
    }

    :deep(code) {
      padding: 0.2em 0.4em;
      background: var(--ldesign-bg-color-component);
      border-radius: var(--ls-border-radius-sm);
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 0.9em;
    }

    :deep(pre) {
      padding: var(--ls-padding-base);
      background: var(--ldesign-bg-color-page);
      border-radius: var(--ls-border-radius-base);
      overflow-x: auto;

      code {
        padding: 0;
        background: none;
      }
    }

    :deep(ul), :deep(ol) {
      padding-left: 2em;
      margin: 1em 0;
    }

    :deep(blockquote) {
      margin: 1em 0;
      padding-left: 1em;
      border-left: 4px solid var(--ldesign-brand-color);
      color: var(--ldesign-text-color-secondary);
    }

    :deep(table) {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;

      th, td {
        border: 1px solid var(--ldesign-border-color);
        padding: 0.5em 1em;
      }

      th {
        background: var(--ldesign-bg-color-component);
        font-weight: 600;
      }
    }

    :deep(a) {
      color: var(--ldesign-brand-color);
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--ls-spacing-xs);
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  border: 1px solid transparent;
  border-radius: var(--ls-border-radius-base);
  font-size: var(--ls-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  background: var(--ldesign-brand-color);
  color: white;

  &:hover:not(:disabled) {
    background: var(--ldesign-brand-color-hover);
  }
}

.btn-secondary {
  background: var(--ldesign-bg-color-container);
  color: var(--ldesign-text-color-primary);
  border-color: var(--ldesign-border-color);

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-container-hover);
    border-color: var(--ldesign-brand-color);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>