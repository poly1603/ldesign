<template>
  <div class="other-config-tab">
    <div class="tab-header">
      <div class="header-left">
        <MoreHorizontal :size="20" />
        <h3>其他配置</h3>
      </div>
      <div class="header-actions">
        <button @click="loadConfigs" :disabled="loading" class="btn-secondary">
          <RefreshCw :size="16" :class="{ spinning: loading }" />
          <span>刷新</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="32" class="spinner" />
      <p>加载配置文件...</p>
    </div>

    <div v-else class="config-content">
      <div class="config-sidebar">
        <div class="sidebar-header">
          <FileText :size="16" />
          <span>配置文件</span>
        </div>
        <div class="config-list">
          <button
            v-for="config in configFiles"
            :key="config.name"
            :class="['config-item', { active: activeConfig === config.name }]"
            @click="selectConfig(config.name)"
          >
            <div class="config-info">
              <div class="config-details">
                <span class="config-name">{{ config.name }}</span>
                <span class="config-desc">{{ config.description }}</span>
              </div>
              <span v-if="config.exists" class="config-status exists">
                <Check :size="12" />
              </span>
              <span v-else class="config-status missing">
                <AlertCircle :size="12" />
              </span>
            </div>
          </button>
        </div>
      </div>

      <div class="config-editor">
        <div v-if="!activeConfigData" class="empty-editor">
          <FileText :size="48" />
          <p>请选择一个配置文件</p>
        </div>
        
        <div v-else-if="!activeConfigData.exists" class="file-not-found">
          <AlertCircle :size="48" />
          <h4>文件不存在</h4>
          <p>{{ activeConfig }} 文件未找到</p>
          <button @click="createConfigFile" class="btn-primary">
            <Plus :size="16" />
            <span>创建文件</span>
          </button>
        </div>

        <div v-else class="editor-container">
          <div class="editor-toolbar">
            <div class="toolbar-left">
              <FileText :size="16" />
              <div class="file-info">
                <span class="file-name">{{ activeConfig }}</span>
                <span class="file-desc">{{ activeConfigData.description }}</span>
              </div>
            </div>
            <div class="toolbar-actions">
              <button 
                v-if="!isEditing" 
                @click="startEdit" 
                class="btn-secondary"
              >
                <Edit2 :size="14" />
                <span>编辑</span>
              </button>
              <template v-else>
                <button @click="cancelEdit" class="btn-secondary">
                  <X :size="14" />
                  <span>取消</span>
                </button>
                <button @click="saveConfig" :disabled="saving" class="btn-primary">
                  <Save :size="14" />
                  <span>{{ saving ? '保存中...' : '保存' }}</span>
                </button>
              </template>
            </div>
          </div>

          <div v-if="isEditing" class="editor-area">
            <textarea
              v-model="editContent"
              class="code-editor"
              spellcheck="false"
            ></textarea>
          </div>

          <div v-else class="code-preview">
            <pre><code>{{ activeConfigData.content }}</code></pre>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  MoreHorizontal, RefreshCw, Loader2, FileText, Check, 
  AlertCircle, Edit2, Save, X, Plus
} from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useMessage } from '../../composables/useMessage'

interface Props {
  projectPath: string
}

interface ConfigFile {
  name: string
  description: string
  exists: boolean
  content?: string
}

const props = defineProps<Props>()
const api = useApi()
const message = useMessage()

const loading = ref(true)
const saving = ref(false)
const isEditing = ref(false)
const activeConfig = ref<string>('')
const editContent = ref('')

const configFiles = ref<ConfigFile[]>([
  { name: '.gitignore', description: 'Git 忽略文件', exists: false },
  { name: '.eslintrc.json', description: 'ESLint 配置', exists: false },
  { name: '.eslintrc.js', description: 'ESLint 配置 (JS)', exists: false },
  { name: '.prettierrc', description: 'Prettier 配置', exists: false },
  { name: '.prettierrc.json', description: 'Prettier 配置 (JSON)', exists: false },
  { name: '.editorconfig', description: 'EditorConfig', exists: false },
  { name: '.npmrc', description: 'npm 配置', exists: false },
  { name: '.nvmrc', description: 'Node 版本配置', exists: false },
  { name: 'LICENSE', description: '开源协议', exists: false },
  { name: '.env', description: '环境变量', exists: false },
  { name: '.env.local', description: '本地环境变量', exists: false },
  { name: '.env.development', description: '开发环境变量', exists: false },
  { name: '.env.production', description: '生产环境变量', exists: false }
])

const activeConfigData = computed(() => {
  return configFiles.value.find(c => c.name === activeConfig.value)
})

const loadConfigs = async () => {
  loading.value = true
  
  try {
    const response = await api.post('/api/other-configs/load', {
      projectPath: props.projectPath,
      files: configFiles.value.map(c => ({ name: c.name, description: c.description }))
    })
    
    if (response.success && response.data) {
      configFiles.value = response.data
      
      // 默认选中第一个存在的配置文件
      if (!activeConfig.value) {
        const firstExists = configFiles.value.find(c => c.exists)
        if (firstExists) {
          activeConfig.value = firstExists.name
        }
      }
    } else {
      message.error(response.message || '加载失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '加载失败')
  } finally {
    loading.value = false
  }
}

const selectConfig = (name: string) => {
  if (isEditing.value) {
    if (!confirm('有未保存的更改，确定要切换吗？')) {
      return
    }
    isEditing.value = false
  }
  activeConfig.value = name
}

const startEdit = () => {
  if (activeConfigData.value?.content) {
    editContent.value = activeConfigData.value.content
    isEditing.value = true
  }
}

const cancelEdit = () => {
  isEditing.value = false
  editContent.value = ''
}

const saveConfig = async () => {
  saving.value = true
  
  try {
    const response = await api.post('/api/other-configs/save', {
      projectPath: props.projectPath,
      fileName: activeConfig.value,
      content: editContent.value
    })
    
    if (response.success) {
      message.success('保存成功')
      isEditing.value = false
      await loadConfigs()
    } else {
      message.error(response.message || '保存失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  } finally {
    saving.value = false
  }
}

const createConfigFile = async () => {
  try {
    const response = await api.post('/api/other-configs/create', {
      projectPath: props.projectPath,
      fileName: activeConfig.value
    })
    
    if (response.success) {
      message.success('文件创建成功')
      await loadConfigs()
    } else {
      message.error(response.message || '创建失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '创建失败')
  }
}

onMounted(() => {
  loadConfigs()
})
</script>

<style lang="less" scoped>
.other-config-tab {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
  height: 100%;
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

.loading-state {
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

.config-content {
  display: flex;
  gap: var(--ls-spacing-base);
  height: 600px;
  overflow: hidden;
}

.config-sidebar {
  width: 280px;
  flex-shrink: 0;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;

  .sidebar-header {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-xs);
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    background: var(--ldesign-bg-color-page);
    border-bottom: 1px solid var(--ldesign-border-color);
    font-size: var(--ls-font-size-sm);
    font-weight: 600;
    color: var(--ldesign-text-color-primary);

    svg {
      color: var(--ldesign-brand-color);
    }
  }

  .config-list {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    max-height: calc(600px - 40px);
  }
}

.config-item {
  display: flex;
  align-items: center;
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--ldesign-border-color);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--ldesign-bg-color-container-hover);
  }

  &.active {
    background: var(--ldesign-brand-color-focus);
    color: var(--ldesign-brand-color);
    font-weight: 600;
  }

  .config-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: var(--ls-spacing-sm);

    .config-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
      min-width: 0;

      .config-name {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        font-weight: 500;
      }

      .config-desc {
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-placeholder);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .config-status {
      display: flex;
      align-items: center;
      flex-shrink: 0;

      &.exists {
        color: var(--ldesign-success-color);
      }

      &.missing {
        color: var(--ldesign-text-color-placeholder);
      }
    }
  }
}

.config-editor {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
}

.empty-editor,
.file-not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--ls-spacing-base);
  color: var(--ldesign-text-color-placeholder);

  svg {
    opacity: 0.3;
  }

  h4 {
    margin: 0;
    color: var(--ldesign-text-color-primary);
  }

  p {
    margin: 0;
  }
}

.editor-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ls-padding-sm) var(--ls-padding-base);
  background: var(--ldesign-bg-color-page);
  border-bottom: 1px solid var(--ldesign-border-color);

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);

    svg {
      color: var(--ldesign-brand-color);
      flex-shrink: 0;
    }

    .file-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .file-name {
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        font-weight: 500;
      }

      .file-desc {
        font-size: var(--ls-font-size-xs);
        color: var(--ldesign-text-color-placeholder);
      }
    }
  }

  .toolbar-actions {
    display: flex;
    gap: var(--ls-spacing-xs);
  }
}

.editor-area,
.code-preview {
  flex: 1;
  overflow: auto;
}

.code-editor {
  width: 100%;
  height: 100%;
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-page);
  border: none;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: var(--ls-font-size-sm);
  line-height: 1.6;
  color: var(--ldesign-text-color-primary);
  resize: none;
  tab-size: 2;

  &:focus {
    outline: none;
  }
}

.code-preview {
  pre {
    margin: 0;
    padding: var(--ls-padding-base);
    
    code {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-sm);
      line-height: 1.6;
      color: var(--ldesign-text-color-primary);
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

  .spinning {
    animation: spin 1s linear infinite;
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

@media (max-width: 768px) {
  .config-content {
    flex-direction: column;
    height: auto;
  }

  .config-sidebar {
    width: 100%;
  }

  .config-editor {
    min-height: 400px;
  }
}
</style>