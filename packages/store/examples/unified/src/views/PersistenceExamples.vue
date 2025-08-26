<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePersistenceStore } from '@/stores/persistence/PersistenceStore'

// 使用持久化 Store
const persistenceStore = usePersistenceStore()

// 文件输入引用
const fileInput = ref<HTMLInputElement>()

// 更新用户偏好
function updatePreferences() {
  persistenceStore.addRecentAction('更新用户偏好设置')
}

// 更新表单数据
function updateFormData() {
  persistenceStore.addRecentAction('更新表单数据')
}

// 增加页面浏览次数
function incrementPageViews() {
  persistenceStore.updateSessionData({
    pageViews: persistenceStore.sessionData.pageViews + 1
  })
  persistenceStore.addRecentAction('增加页面浏览次数')
}

// 更新活动时间
function updateActivity() {
  persistenceStore.updateSessionData({
    lastActivity: Date.now()
  })
  persistenceStore.addRecentAction('更新最后活动时间')
}

// 触发文件输入
function triggerFileInput() {
  fileInput.value?.click()
}

// 处理文件导入
function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (file) {
    persistenceStore.importData(file)
    persistenceStore.addRecentAction('导入数据文件')
    // 清空文件输入
    target.value = ''
  }
}

// 格式化时长
function formatDuration(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}小时${minutes % 60}分钟`
  } else if (minutes > 0) {
    return `${minutes}分钟${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

// 组件挂载时初始化
onMounted(() => {
  persistenceStore.initializePersistence()
  persistenceStore.addRecentAction('初始化持久化示例')
})
</script>

<template>
  <div class="persistence-examples">
    <div class="page-header">
      <h1>状态持久化示例</h1>
      <p>展示 localStorage、sessionStorage 等持久化功能</p>
    </div>

    <!-- 通知区域 -->
    <div class="notifications">
      <div
        v-for="notification in persistenceStore.tempData.notifications" :key="notification.id" class="notification"
        :class="`notification-${notification.type}`"
      >
        <span>{{ notification.message }}</span>
        <button class="notification-close" @click="persistenceStore.removeNotification(notification.id)">×</button>
      </div>
    </div>

    <!-- 存储状态概览 -->
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">存储状态概览</h2>
        <p class="card-description">查看本地存储和会话存储的使用情况</p>
      </div>

      <div class="example-content">
        <div class="storage-overview">
          <div class="storage-stats">
            <div class="storage-stat">
              <h4>localStorage</h4>
              <div class="stat-details">
                <div class="stat-item">
                  <span class="stat-label">可用性:</span>
                  <span
                    class="stat-value"
                    :class="{ success: persistenceStore.persistenceStatus.localStorage.available, danger: !persistenceStore.persistenceStatus.localStorage.available }"
                  >
                    {{ persistenceStore.persistenceStatus.localStorage.available ? '可用' : '不可用' }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已使用:</span>
                  <span class="stat-value">{{ persistenceStore.formattedStorageSize.localStorage.used }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">项目数:</span>
                  <span class="stat-value">{{ persistenceStore.persistenceStatus.localStorage.items }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">使用率:</span>
                  <span class="stat-value">{{ persistenceStore.storageUsage.localStorage.toFixed(2) }}%</span>
                </div>
              </div>
              <div class="usage-bar">
                <div
                  class="usage-fill localStorage"
                  :style="{ width: `${Math.min(persistenceStore.storageUsage.localStorage, 100)}%` }"
                />
              </div>
            </div>

            <div class="storage-stat">
              <h4>sessionStorage</h4>
              <div class="stat-details">
                <div class="stat-item">
                  <span class="stat-label">可用性:</span>
                  <span
                    class="stat-value"
                    :class="{ success: persistenceStore.persistenceStatus.sessionStorage.available, danger: !persistenceStore.persistenceStatus.sessionStorage.available }"
                  >
                    {{ persistenceStore.persistenceStatus.sessionStorage.available ? '可用' : '不可用' }}
                  </span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">已使用:</span>
                  <span class="stat-value">{{ persistenceStore.formattedStorageSize.sessionStorage.used }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">项目数:</span>
                  <span class="stat-value">{{ persistenceStore.persistenceStatus.sessionStorage.items }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">使用率:</span>
                  <span class="stat-value">{{ persistenceStore.storageUsage.sessionStorage.toFixed(2) }}%</span>
                </div>
              </div>
              <div class="usage-bar">
                <div
                  class="usage-fill sessionStorage"
                  :style="{ width: `${Math.min(persistenceStore.storageUsage.sessionStorage, 100)}%` }"
                />
              </div>
            </div>
          </div>

          <div class="storage-actions">
            <button class="btn btn-primary" @click="persistenceStore.saveToStorage(true)">
              手动保存
            </button>
            <button class="btn btn-secondary" @click="persistenceStore.updateStorageStats()">
              刷新统计
            </button>
            <button class="btn btn-warning" @click="persistenceStore.clearStorage('localStorage')">
              清空 localStorage
            </button>
            <button class="btn btn-warning" @click="persistenceStore.clearStorage('sessionStorage')">
              清空 sessionStorage
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 用户偏好设置和表单数据 -->
  <div class="persistence-grid">
    <div class="card">
      <div class="card-header">
        <h2 class="card-title">用户偏好设置 (localStorage)</h2>
        <p class="card-description">用户偏好会自动保存到 localStorage</p>
      </div>

      <div class="example-content">
        <div class="preferences-form">
          <div class="form-group">
            <label>主题:</label>
            <select v-model="persistenceStore.userPreferences.theme" class="form-select" @change="updatePreferences">
              <option value="light">浅色</option>
              <option value="dark">深色</option>
              <option value="auto">自动</option>
            </select>
          </div>

          <div class="form-group">
            <label>语言:</label>
            <select v-model="persistenceStore.userPreferences.language" class="form-select" @change="updatePreferences">
              <option value="zh">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          <div class="form-group">
            <label>字体大小: {{ persistenceStore.userPreferences.fontSize }}px</label>
            <input
              v-model.number="persistenceStore.userPreferences.fontSize" type="range" :min="12" :max="24"
              class="range-input" @input="updatePreferences"
            >
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="persistenceStore.userPreferences.autoSave" type="checkbox" @change="updatePreferences">
              自动保存
            </label>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2 class="card-title">表单数据 (localStorage)</h2>
        <p class="card-description">表单数据会自动保存，刷新页面后恢复</p>
      </div>

      <div class="example-content">
        <div class="form-data">
          <div class="form-group">
            <label>姓名:</label>
            <input
              v-model="persistenceStore.formData.name" type="text" class="form-input" placeholder="请输入姓名"
              @input="updateFormData"
            >
          </div>

          <div class="form-group">
            <label>邮箱:</label>
            <input
              v-model="persistenceStore.formData.email" type="email" class="form-input" placeholder="请输入邮箱"
              @input="updateFormData"
            >
          </div>

          <div class="form-group">
            <label>个人简介:</label>
            <textarea
              v-model="persistenceStore.formData.bio" class="form-textarea" placeholder="请输入个人简介" rows="3"
              @input="updateFormData"
            />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 会话数据和数据导入导出 -->
  <div class="card">
    <div class="card-header">
      <h2 class="card-title">会话数据 (sessionStorage)</h2>
      <p class="card-description">会话数据仅在当前标签页有效</p>
    </div>

    <div class="example-content">
      <div class="session-data">
        <div class="session-stats">
          <div class="stat-item">
            <span class="stat-label">登录时间:</span>
            <span class="stat-value">{{ new Date(persistenceStore.sessionData.loginTime).toLocaleString() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最后活动:</span>
            <span class="stat-value">{{ persistenceStore.lastActivityFormatted }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">页面浏览:</span>
            <span class="stat-value">{{ persistenceStore.sessionData.pageViews }}</span>
          </div>
        </div>

        <div class="session-actions">
          <button class="btn btn-primary btn-sm" @click="incrementPageViews">
            增加页面浏览
          </button>
          <button class="btn btn-secondary btn-sm" @click="updateActivity">
            更新活动时间
          </button>
        </div>

        <div class="import-export">
          <button class="btn btn-success" @click="persistenceStore.exportData()">
            导出所有数据
          </button>
          <input
            ref="fileInput" type="file" accept=".json" class="file-input" style="display: none;"
            @change="handleFileImport"
          >
          <button class="btn btn-primary" @click="triggerFileInput">
            导入数据
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.persistence-examples {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  color: #1a202c;
}

.page-header p {
  font-size: 1.125rem;
  color: #718096;
  margin: 0;
}

.notifications {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 300px;
  animation: slideIn 0.3s ease;
}

.notification-info {
  background: #ebf8ff;
  border: 1px solid #90cdf4;
  color: #2b6cb0;
}

.notification-success {
  background: #f0fff4;
  border: 1px solid #9ae6b4;
  color: #276749;
}

.notification-warning {
  background: #fffbeb;
  border: 1px solid #f6ad55;
  color: #744210;
}

.notification-error {
  background: #fed7d7;
  border: 1px solid #fc8181;
  color: #742a2a;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 0;
  margin-left: 1rem;
  opacity: 0.7;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.storage-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.storage-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.storage-stat {
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.storage-stat h4 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: #2d3748;
}

.stat-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
}

.stat-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.stat-value.success {
  color: #38a169;
}

.stat-value.danger {
  color: #e53e3e;
}

.usage-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.usage-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.usage-fill.localStorage {
  background: linear-gradient(90deg, #4299e1, #3182ce);
}

.usage-fill.sessionStorage {
  background: linear-gradient(90deg, #48bb78, #38a169);
}

.storage-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.last-saved {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: #718096;
}

.persistence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.preferences-form,
.form-data {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  color: #4a5568;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.range-input {
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.session-data {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.session-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.session-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.import-export {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.file-input {
  display: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .persistence-grid {
    grid-template-columns: 1fr;
  }

  .storage-stats {
    grid-template-columns: 1fr;
  }

  .storage-actions {
    flex-direction: column;
  }

  .notifications {
    left: 1rem;
    right: 1rem;
  }

  .notification {
    min-width: auto;
  }
}
</style>
