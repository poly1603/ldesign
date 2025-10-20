<script lang="ts" setup>
import type { VersionedTemplate } from '../core/version'
import type { Template } from '../types'
import { ref, watch } from 'vue'
import { useTemplateVersion } from '../composables/useTemplateVersion'

interface Props {
  /**
   * 模板
   */
  template: Template
  
  /**
   * 是否只读
   */
  readonly?: boolean
  
  /**
   * 是否显示变更日志
   */
  showChangelog?: boolean
  
  /**
   * 是否自动迁移
   */
  autoMigrate?: boolean
  
  /**
   * 是否启用备份
   */
  enableBackup?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  showChangelog: true,
  autoMigrate: false,
  enableBackup: true
})

const emit = defineEmits<{
  'versionCreated': [version: VersionedTemplate]
  'versionSwitched': [version: string]
  'versionMigrated': [from: string, to: string]
  'versionDeprecated': [version: string]
}>()

// 使用版本控制
const {
  versionState,
  // versionedTemplate, // Removing unused variable
  isMigrating,
  createVersion,
  switchVersion,
  deprecate,
  getVersionHistory,
  restoreBackup
} = useTemplateVersion(props.template, {
  autoMigrate: props.autoMigrate,
  enableBackup: props.enableBackup
})

// UI状态
const showVersionHistory = ref(false)
const showCreateVersion = ref(false)
const selectedVersion = ref<VersionedTemplate | null>(null)
const versionHistory = ref<VersionedTemplate[]>([])
const migrationProgress = ref(0)
const migrationMessage = ref('')
const changelog = ref<Array<{id: string; version: string; date: string; content: string}>>([])

// 新版本表单
const newVersion = ref({
  version: '',
  description: '',
  changeType: 'minor',
  autoMigrate: false,
  migrationNotes: ''
})

const versionError = ref('')

// 获取版本历史
const loadVersionHistory = () => {
  versionHistory.value = getVersionHistory()
}

// 验证版本号
const validateVersion = () => {
  const pattern = /^\d+\.\d+\.\d+$/
  if (!pattern.test(newVersion.value.version)) {
    versionError.value = '版本号格式错误，应为 x.y.z'
  } else if (versionHistory.value.some(v => v.version.version === newVersion.value.version)) {
    versionError.value = '版本号已存在'
  } else {
    versionError.value = ''
  }
}

// 创建新版本
const handleCreateVersion = () => {
  if (versionError.value || !newVersion.value.version) return
  
  const changes = {
    // 这里可以根据实际需求收集变更内容
    ...props.template
  }
  
  const versionInfo = {
    description: newVersion.value.description,
    author: 'Current User', // 实际应该从用户系统获取
    changes: {
      type: newVersion.value.changeType,
      notes: newVersion.value.migrationNotes
    }
  }
  
  const created = createVersion(
    newVersion.value.version,
    changes,
    versionInfo
  )
  
  if (created) {
    emit('versionCreated', created)
    showCreateVersion.value = false
    loadVersionHistory()
    
    // 重置表单
    newVersion.value = {
      version: '',
      description: '',
      changeType: 'minor',
      autoMigrate: false,
      migrationNotes: ''
    }
  }
}

// 切换版本
const handleSwitchVersion = async (version: string) => {
  const success = await switchVersion(version)
  if (success) {
    emit('versionSwitched', version)
    loadVersionHistory()
  }
}

// 废弃版本
const handleDeprecateVersion = (version: string) => {
  // eslint-disable-next-line no-alert
  const reason = window.prompt('请输入废弃原因:')
  if (!reason) return
  
  // eslint-disable-next-line no-alert
  const alternative = window.prompt('推荐的替代版本 (可选):')
  
  deprecate(version, reason, alternative || undefined)
  emit('versionDeprecated', version)
  loadVersionHistory()
}

// 恢复版本
const handleRestoreVersion = (_version: VersionedTemplate) => {
  const restored = restoreBackup()
  if (restored) {
    loadVersionHistory()
  }
}

// 显示版本详情
const showVersionDetails = (version: VersionedTemplate) => {
  selectedVersion.value = version
}

// 判断是否可以恢复版本
const canRestoreVersion = (version: VersionedTemplate): boolean => {
  return !props.readonly && 
         version.version.version !== versionState.current &&
         !version.version.deprecated
}

// 格式化日期
const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 监听迁移进度
watch(isMigrating, (migrating) => {
  if (migrating) {
    migrationProgress.value = 0
    migrationMessage.value = '准备迁移...'
    
    // 模拟进度更新
    const interval = setInterval(() => {
      migrationProgress.value += 10
      if (migrationProgress.value >= 90) {
        migrationMessage.value = '完成迁移...'
        clearInterval(interval)
      } else if (migrationProgress.value >= 60) {
        migrationMessage.value = '应用变更...'
      } else if (migrationProgress.value >= 30) {
        migrationMessage.value = '验证数据...'
      }
    }, 200)
  }
})

// 初始化
loadVersionHistory()
</script>

<template>
  <div class="template-version">
    <!-- 版本信息头部 -->
    <div class="version-header">
      <div class="version-info">
        <span class="version-label">当前版本:</span>
        <span class="version-number">{{ versionState.current }}</span>
        <template v-if="versionState.isDeprecated">
          <span class="deprecated-badge">已废弃</span>
        </template>
        <template v-if="versionState.hasUpdate">
          <span class="update-badge">有新版本</span>
        </template>
      </div>
      
      <div class="version-actions">
        <button @click="showVersionHistory = !showVersionHistory">
          版本历史
        </button>
        <button v-if="!readonly" @click="showCreateVersion = true">
          创建新版本
        </button>
      </div>
    </div>
    
    <!-- 版本历史面板 -->
    <transition name="slide">
      <div v-if="showVersionHistory" class="version-history">
        <h3>版本历史</h3>
        <div class="version-list">
          <div 
            v-for="version in versionHistory" 
            :key="version.version.version"
            class="version-item"
            :class="{ 
              active: version.version.version === versionState.current,
              deprecated: version.version.deprecated
            }"
          >
            <div class="version-item-header">
              <span class="version-num">{{ version.version.version }}</span>
              <span class="version-date">{{ formatDate(version.version.createdAt) }}</span>
            </div>
            
            <div v-if="version.version.description" class="version-desc">
              {{ version.version.description }}
            </div>
            
            <div class="version-item-actions">
              <button 
                :disabled="version.version.version === versionState.current"
                @click="handleSwitchVersion(version.version.version)"
              >
                切换到此版本
              </button>
              <button 
                v-if="!readonly && !version.version.deprecated"
                @click="handleDeprecateVersion(version.version.version)"
              >
                废弃
              </button>
              <button 
                @click="showVersionDetails(version)"
              >
                详情
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 创建新版本对话框 -->
    <transition name="fade">
      <div v-if="showCreateVersion" class="version-dialog-overlay" @click.self="showCreateVersion = false">
        <div class="version-dialog">
          <h3>创建新版本</h3>
          
          <div class="form-group">
            <label>版本号:</label>
            <input 
              v-model="newVersion.version" 
              placeholder="例如: 1.1.0"
              @input="validateVersion"
            >
            <span v-if="versionError" class="error">{{ versionError }}</span>
          </div>
          
          <div class="form-group">
            <label>描述:</label>
            <textarea 
              v-model="newVersion.description" 
              placeholder="版本更新说明..."
              rows="4"
            />
          </div>
          
          <div class="form-group">
            <label>变更类型:</label>
            <select v-model="newVersion.changeType">
              <option value="major">
                主要版本 (不兼容的变更)
              </option>
              <option value="minor">
                次要版本 (新功能)
              </option>
              <option value="patch">
                补丁版本 (Bug修复)
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label>
              <input v-model="newVersion.autoMigrate" type="checkbox">
              启用自动迁移
            </label>
          </div>
          
          <div v-if="newVersion.autoMigrate" class="form-group">
            <label>迁移说明:</label>
            <textarea 
              v-model="newVersion.migrationNotes" 
              placeholder="迁移注意事项..."
              rows="3"
            />
          </div>
          
          <div class="dialog-actions">
            <button @click="showCreateVersion = false">
              取消
            </button>
            <button 
              :disabled="!!versionError || !newVersion.version" 
              class="primary"
              @click="handleCreateVersion"
            >
              创建版本
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 版本详情对话框 -->
    <transition name="fade">
      <div v-if="selectedVersion" class="version-dialog-overlay" @click.self="selectedVersion = null">
        <div class="version-dialog version-details">
          <h3>版本详情 - {{ selectedVersion.version.version }}</h3>
          
          <div class="detail-section">
            <h4>基本信息</h4>
            <dl>
              <dt>版本号:</dt>
              <dd>{{ selectedVersion.version.version }}</dd>
              
              <dt>创建时间:</dt>
              <dd>{{ formatDate(selectedVersion.version.createdAt) }}</dd>
              
              <dt>作者:</dt>
              <dd>{{ selectedVersion.version.author || '未知' }}</dd>
              
              <dt>状态:</dt>
              <dd>
                <span v-if="selectedVersion.version.published" class="status-published">已发布</span>
                <span v-else-if="selectedVersion.version.deprecated" class="status-deprecated">已废弃</span>
                <span v-else class="status-draft">草稿</span>
              </dd>
            </dl>
          </div>
          
          <div v-if="selectedVersion.version.description" class="detail-section">
            <h4>描述</h4>
            <p>{{ selectedVersion.version.description }}</p>
          </div>
          
          <div v-if="selectedVersion.changelog && selectedVersion.changelog.length > 0" class="detail-section">
            <h4>变更内容</h4>
            <pre>{{ JSON.stringify(selectedVersion.changelog[0].changes, null, 2) }}</pre>
          </div>
          
          <div class="dialog-actions">
            <button @click="selectedVersion = null">
              关闭
            </button>
            <button 
              v-if="canRestoreVersion(selectedVersion)"
              class="primary"
              @click="handleRestoreVersion(selectedVersion)"
            >
              恢复此版本
            </button>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- 迁移进度 -->
    <transition name="fade">
      <div v-if="isMigrating" class="migration-progress">
        <div class="progress-content">
          <h4>正在迁移版本...</h4>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${migrationProgress }%` }"
            />
          </div>
          <p>{{ migrationMessage }}</p>
        </div>
      </div>
    </transition>
    
    <!-- 变更日志 -->
    <div v-if="showChangelog && changelog.length > 0" class="changelog">
      <h3>变更日志</h3>
      <div class="changelog-list">
        <div v-for="log in changelog" :key="log.id" class="changelog-item">
          <div class="changelog-header">
            <span class="changelog-version">{{ log.version }}</span>
            <span class="changelog-date">{{ formatDate(log.date) }}</span>
          </div>
          <div class="changelog-content">
            {{ log.content }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-version {
  padding: 1rem;
}

.version-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.version-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.version-label {
  color: #666;
}

.version-number {
  font-weight: bold;
  font-size: 1.2em;
}

.deprecated-badge,
.update-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85em;
}

.deprecated-badge {
  background: #ffebee;
  color: #c62828;
}

.update-badge {
  background: #e8f5e9;
  color: #2e7d32;
}

.version-actions {
  display: flex;
  gap: 0.5rem;
}

.version-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.version-actions button:hover {
  background: #f5f5f5;
}

.version-history {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.version-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.version-item {
  padding: 1rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  transition: all 0.2s;
}

.version-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.version-item.deprecated {
  opacity: 0.6;
}

.version-item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.version-num {
  font-weight: bold;
}

.version-date {
  color: #666;
  font-size: 0.9em;
}

.version-desc {
  color: #666;
  margin-bottom: 0.5rem;
}

.version-item-actions {
  display: flex;
  gap: 0.5rem;
}

.version-item-actions button {
  padding: 0.25rem 0.75rem;
  font-size: 0.9em;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.version-item-actions button:hover:not(:disabled) {
  background: #f5f5f5;
}

.version-item-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.version-dialog-overlay {
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
}

.version-dialog {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.version-dialog h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group .error {
  color: #f44336;
  font-size: 0.85em;
  margin-top: 0.25rem;
  display: block;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.dialog-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.dialog-actions button.primary {
  background: #2196f3;
  color: white;
  border-color: #2196f3;
}

.dialog-actions button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dialog-actions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.version-details dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem 1rem;
}

.version-details dt {
  font-weight: 500;
  color: #666;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-section h4 {
  margin-bottom: 0.75rem;
  color: #333;
}

.detail-section pre {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
}

.status-published {
  color: #4caf50;
}

.status-deprecated {
  color: #f44336;
}

.status-draft {
  color: #ff9800;
}

.migration-progress {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 2000;
  min-width: 300px;
}

.progress-content h4 {
  margin-top: 0;
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: #2196f3;
  transition: width 0.3s ease;
}

.changelog {
  margin-top: 2rem;
}

.changelog h3 {
  margin-bottom: 1rem;
}

.changelog-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.changelog-item {
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 6px;
}

.changelog-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.changelog-version {
  font-weight: bold;
  color: #2196f3;
}

.changelog-date {
  color: #666;
  font-size: 0.9em;
}

.changelog-content {
  color: #333;
}

/* 过渡动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>