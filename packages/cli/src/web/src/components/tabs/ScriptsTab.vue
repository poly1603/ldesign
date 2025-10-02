<template>
  <div class="scripts-tab">
    <div class="tab-header">
      <div class="header-left">
        <Terminal :size="20" />
        <h3>Scripts 配置</h3>
      </div>
      <div class="header-actions">
        <button @click="loadScripts" :disabled="loading" class="btn-secondary">
          <RefreshCw :size="16" :class="{ spinning: loading }" />
          <span>刷新</span>
        </button>
        <button @click="showAddDialog" class="btn-primary">
          <Plus :size="16" />
          <span>添加 Script</span>
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <Loader2 :size="32" class="spinner" />
      <p>加载 Scripts...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <AlertCircle :size="32" />
      <p>{{ error }}</p>
      <button @click="loadScripts" class="btn-secondary">重试</button>
    </div>

    <div v-else class="scripts-content">
      <div v-if="scripts.length === 0" class="empty-state">
        <Terminal :size="48" />
        <p>暂无 Scripts</p>
        <button @click="showAddDialog" class="btn-primary">添加第一个 Script</button>
      </div>

      <div v-else class="scripts-list">
        <div v-for="script in scripts" :key="script.name" class="script-item">
          <div class="script-info">
            <div class="script-header">
              <div class="script-name">
                <Play :size="16" class="play-icon" />
                {{ script.name }}
              </div>
              <div class="script-actions">
                <button @click="runScript(script.name)" class="btn-run" :disabled="running">
                  <Play :size="14" />
                  <span>运行</span>
                </button>
                <button @click="editScript(script)" class="btn-icon">
                  <Edit2 :size="14" />
                </button>
                <button @click="deleteScript(script.name)" class="btn-icon btn-danger">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            <div class="script-command">
              <code>{{ script.command }}</code>
            </div>
          </div>
        </div>
      </div>

      <!-- Running Output -->
      <div v-if="runningOutput" class="output-panel">
        <div class="output-header">
          <h4>
            <Terminal :size="16" />
            命令输出
          </h4>
          <button @click="runningOutput = ''" class="btn-icon">
            <X :size="16" />
          </button>
        </div>
        <pre class="output-content">{{ runningOutput }}</pre>
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <div v-if="dialogVisible" class="dialog-overlay" @click.self="closeDialog">
      <div class="dialog-content">
        <div class="dialog-header">
          <h3>{{ editingScript ? '编辑 Script' : '添加 Script' }}</h3>
          <button @click="closeDialog" class="btn-icon">
            <X :size="18" />
          </button>
        </div>
        <div class="dialog-body">
          <div class="form-item">
            <label>Script 名称</label>
            <input 
              v-model="dialogData.name" 
              :disabled="!!editingScript"
              placeholder="例如: dev, build, test"
              class="input-field"
            />
          </div>
          <div class="form-item">
            <label>命令</label>
            <textarea 
              v-model="dialogData.command" 
              placeholder="例如: vite --host"
              class="textarea-field"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="dialog-footer">
          <button @click="closeDialog" class="btn-secondary">取消</button>
          <button @click="saveScript" :disabled="!dialogData.name || !dialogData.command" class="btn-primary">
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Terminal, RefreshCw, Plus, Loader2, AlertCircle, 
  Play, Edit2, Trash2, X
} from 'lucide-vue-next'
import { useApi } from '../../composables/useApi'
import { useMessage } from '../../composables/useMessage'

interface Props {
  projectPath: string
}

interface Script {
  name: string
  command: string
}

const props = defineProps<Props>()
const api = useApi()
const message = useMessage()

const loading = ref(true)
const running = ref(false)
const error = ref('')
const scripts = ref<Script[]>([])
const runningOutput = ref('')

const dialogVisible = ref(false)
const editingScript = ref<Script | null>(null)
const dialogData = ref({ name: '', command: '' })

const loadScripts = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await api.get(`/api/package-json`, {
      params: { projectPath: props.projectPath }
    })
    
    if (response.success && response.data) {
      const pkg = response.data
      scripts.value = Object.entries(pkg.scripts || {}).map(([name, command]) => ({
        name,
        command: command as string
      }))
    } else {
      error.value = response.message || '加载失败'
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
  } finally {
    loading.value = false
  }
}

const showAddDialog = () => {
  editingScript.value = null
  dialogData.value = { name: '', command: '' }
  dialogVisible.value = true
}

const editScript = (script: Script) => {
  editingScript.value = script
  dialogData.value = { ...script }
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  editingScript.value = null
  dialogData.value = { name: '', command: '' }
}

const saveScript = async () => {
  try {
    const response = await api.post('/api/scripts/save', {
      projectPath: props.projectPath,
      name: dialogData.value.name,
      command: dialogData.value.command
    })
    
    if (response.success) {
      message.success(editingScript.value ? '保存成功' : '添加成功')
      closeDialog()
      await loadScripts()
    } else {
      message.error(response.message || '保存失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '保存失败')
  }
}

const deleteScript = async (name: string) => {
  if (!confirm(`确定要删除 "${name}" 脚本吗？`)) return
  
  try {
    const response = await api.post('/api/scripts/delete', {
      projectPath: props.projectPath,
      name
    })
    
    if (response.success) {
      message.success('删除成功')
      await loadScripts()
    } else {
      message.error(response.message || '删除失败')
    }
  } catch (err) {
    message.error(err instanceof Error ? err.message : '删除失败')
  }
}

const runScript = async (name: string) => {
  running.value = true
  runningOutput.value = `正在运行: npm run ${name}\n\n`
  
  try {
    const response = await api.post('/api/scripts/run', {
      projectPath: props.projectPath,
      name
    })
    
    if (response.success) {
      runningOutput.value += response.data.output || '命令执行完成'
      message.success('执行成功')
    } else {
      runningOutput.value += `错误: ${response.message}`
      message.error(response.message || '执行失败')
    }
  } catch (err) {
    runningOutput.value += `错误: ${err instanceof Error ? err.message : '执行失败'}`
    message.error(err instanceof Error ? err.message : '执行失败')
  } finally {
    running.value = false
  }
}

onMounted(() => {
  loadScripts()
})
</script>

<style lang="less" scoped>
.scripts-tab {
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
.error-state,
.empty-state {
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

  svg {
    color: var(--ldesign-text-color-placeholder);
  }
}

.scripts-content {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-base);
}

.scripts-list {
  display: flex;
  flex-direction: column;
  gap: var(--ls-spacing-sm);
}

.script-item {
  background: var(--ldesign-bg-color-component);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  padding: var(--ls-padding-base);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--ldesign-brand-color);
    box-shadow: var(--ldesign-shadow-1);
  }

  .script-info {
    display: flex;
    flex-direction: column;
    gap: var(--ls-spacing-sm);

    .script-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .script-name {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-xs);
        font-size: var(--ls-font-size-base);
        font-weight: 600;
        color: var(--ldesign-text-color-primary);

        .play-icon {
          color: var(--ldesign-brand-color);
        }
      }

      .script-actions {
        display: flex;
        gap: var(--ls-spacing-xs);
      }
    }

    .script-command {
      code {
        display: block;
        padding: var(--ls-padding-sm);
        background: var(--ldesign-bg-color-page);
        border-radius: var(--ls-border-radius-sm);
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        overflow-x: auto;
      }
    }
  }
}

.output-panel {
  background: var(--ldesign-bg-color-page);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;

  .output-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ls-padding-sm) var(--ls-padding-base);
    background: var(--ldesign-bg-color-component);
    border-bottom: 1px solid var(--ldesign-border-color);

    h4 {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      margin: 0;
      font-size: var(--ls-font-size-sm);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);

      svg {
        color: var(--ldesign-brand-color);
      }
    }
  }

  .output-content {
    padding: var(--ls-padding-base);
    margin: 0;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: var(--ls-font-size-sm);
    line-height: 1.6;
    color: var(--ldesign-text-color-primary);
    overflow-x: auto;
    max-height: 400px;
    overflow-y: auto;
  }
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--ls-padding-base);
}

.dialog-content {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-4);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--ls-padding-base) var(--ls-padding-lg);
    border-bottom: 1px solid var(--ldesign-border-color);

    h3 {
      margin: 0;
      font-size: var(--ls-font-size-lg);
      color: var(--ldesign-text-color-primary);
    }
  }

  .dialog-body {
    padding: var(--ls-padding-lg);
    overflow-y: auto;

    .form-item {
      margin-bottom: var(--ls-margin-base);

      &:last-child {
        margin-bottom: 0;
      }

      label {
        display: block;
        margin-bottom: var(--ls-margin-xs);
        font-size: var(--ls-font-size-sm);
        font-weight: 500;
        color: var(--ldesign-text-color-secondary);
      }

      .input-field,
      .textarea-field {
        width: 100%;
        padding: var(--ls-padding-sm);
        background: var(--ldesign-bg-color-page);
        border: 1px solid var(--ldesign-border-color);
        border-radius: var(--ls-border-radius-base);
        font-family: 'Consolas', 'Monaco', monospace;
        font-size: var(--ls-font-size-sm);
        color: var(--ldesign-text-color-primary);
        transition: all 0.2s ease;

        &:focus {
          outline: none;
          border-color: var(--ldesign-brand-color);
          box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      .textarea-field {
        resize: vertical;
        min-height: 80px;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--ls-spacing-sm);
    padding: var(--ls-padding-base) var(--ls-padding-lg);
    border-top: 1px solid var(--ldesign-border-color);
  }
}

.btn-primary,
.btn-secondary,
.btn-run,
.btn-icon {
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

.btn-run {
  background: var(--ldesign-success-bg);
  color: var(--ldesign-success-color);
  border-color: var(--ldesign-success-color);

  &:hover:not(:disabled) {
    background: var(--ldesign-success-color);
    color: white;
  }
}

.btn-icon {
  padding: var(--ls-padding-xs);
  background: transparent;
  color: var(--ldesign-text-color-secondary);

  &:hover:not(:disabled) {
    background: var(--ldesign-bg-color-container-hover);
    color: var(--ldesign-text-color-primary);
  }

  &.btn-danger {
    color: var(--ldesign-error-color);

    &:hover:not(:disabled) {
      background: var(--ldesign-error-bg);
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>