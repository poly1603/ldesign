<template>
  <div class="build-config-tab">
    <div class="tab-header">
      <div class="header-left">
        <Settings :size="20" />
        <h3>产物配置</h3>
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
          <FileCode :size="16" />
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
              <span class="config-name">{{ config.name }}</span>
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
          <FileCode :size="48" />
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
              <FileCode :size="16" />
              <span class="file-name">{{ activeConfig }}</span>
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
  Settings, RefreshCw, Loader2, FileCode, Check, 
  AlertCircle, Edit2, Save, X, Plus
} from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useMessage } from '../../composables/useMessage'

interface Props {
  projectPath: string
}

interface ConfigFile {
  name: string
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
  { name: 'tsconfig.json', exists: false },
  { name: 'vite.config.ts', exists: false },
  { name: 'vite.config.js', exists: false },
  { name: 'webpack.config.js', exists: false },
  { name: 'rollup.config.js', exists: false },
  { name: 'tsup.config.ts', exists: false }
])

const activeConfigData = computed(() => {
  return configFiles.value.find(c => c.name === activeConfig.value)
})

const loadConfigs = async () => {
  loading.value = true
  
  try {
    const response = await api.post('/api/configs/load', {
      projectPath: props.projectPath,
      files: configFiles.value.map(c => c.name)
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
    const response = await api.post('/api/configs/save', {
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
    const response = await api.post('/api/configs/create', {
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
.build-config-tab {
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
  width: 240px;
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
    gap: var(--ls-spacing-xs);

    .config-name {
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: var(--ls-font-size-sm);
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
    gap: var(--ls-spacing-xs);
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: var(--ls-font-size-sm);
    color: var(--ldesign-text-color-primary);

    svg {
      color: var(--ldesign-brand-color);
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