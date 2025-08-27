<template>
  <div class="user-settings">
    <h1>账户设置</h1>
    <p>管理您的账户偏好和安全设置。</p>

    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn" :class="[{ active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="tab-content">
      <!-- 通知设置 -->
      <div v-if="activeTab === 'notifications'" class="tab-panel">
        <h3>通知设置</h3>
        <div class="setting-group">
          <label class="setting-item">
            <input v-model="settings.emailNotifications" type="checkbox">
            <span>邮件通知</span>
          </label>
          <label class="setting-item">
            <input v-model="settings.pushNotifications" type="checkbox">
            <span>推送通知</span>
          </label>
          <label class="setting-item">
            <input v-model="settings.smsNotifications" type="checkbox">
            <span>短信通知</span>
          </label>
        </div>
      </div>

      <!-- 隐私设置 -->
      <div v-if="activeTab === 'privacy'" class="tab-panel">
        <h3>隐私设置</h3>
        <div class="setting-group">
          <label class="setting-item">
            <input v-model="settings.profilePublic" type="checkbox">
            <span>公开个人资料</span>
          </label>
          <label class="setting-item">
            <input v-model="settings.showOnlineStatus" type="checkbox">
            <span>显示在线状态</span>
          </label>
          <label class="setting-item">
            <input v-model="settings.allowMessages" type="checkbox">
            <span>允许私信</span>
          </label>
        </div>
      </div>

      <!-- 安全设置 -->
      <div v-if="activeTab === 'security'" class="tab-panel">
        <h3>安全设置</h3>
        <div class="security-section">
          <div class="security-item">
            <div class="security-info">
              <h4>修改密码</h4>
              <p>定期更换密码以保护账户安全</p>
            </div>
            <button class="btn btn-secondary">
              修改密码
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h4>双因素认证</h4>
              <p>为您的账户添加额外的安全保护</p>
            </div>
            <button class="btn btn-primary">
              启用
            </button>
          </div>

          <div class="security-item">
            <div class="security-info">
              <h4>登录设备</h4>
              <p>查看和管理已登录的设备</p>
            </div>
            <button class="btn btn-secondary">
              管理设备
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button class="btn btn-primary" @click="saveSettings">
        保存设置
      </button>
      <button class="btn btn-secondary" @click="resetSettings">
        重置
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

const activeTab = ref('notifications')

const tabs = [
  { id: 'notifications', label: '通知' },
  { id: 'privacy', label: '隐私' },
  { id: 'security', label: '安全' },
]

const settings = reactive({
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  profilePublic: true,
  showOnlineStatus: true,
  allowMessages: true,
})

function saveSettings() {
  // 保存用户设置
}

function resetSettings() {
  settings.emailNotifications = true
  settings.pushNotifications = false
  settings.smsNotifications = false
  settings.profilePublic = true
  settings.showOnlineStatus = true
  settings.allowMessages = true
}
</script>

<style scoped>
.user-settings {
  max-width: 800px;
}

.settings-tabs {
  display: flex;
  gap: 1rem;
  margin: 2rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #374151;
}

.tab-btn.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-panel h3 {
  margin: 0 0 1.5rem 0;
  color: #1f2937;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.setting-item:hover {
  background: #f9fafb;
}

.setting-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}

.security-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.security-info h4 {
  margin: 0 0 0.25rem 0;
  color: #1f2937;
}

.security-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}
</style>
