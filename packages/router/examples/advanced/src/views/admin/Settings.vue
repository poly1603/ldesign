<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  siteTitle: '@ldesign/router 高级示例',
  siteDescription: '展示路由器的高级功能',
  enableTwoFactor: true,
  enableAuditLog: false,
})

function saveSettings() {
  // 保存设置
}

function resetSettings() {
  settings.siteTitle = '@ldesign/router 高级示例'
  settings.siteDescription = '展示路由器的高级功能'
  settings.enableTwoFactor = true
  settings.enableAuditLog = false
}
</script>

<template>
  <div class="admin-settings">
    <h1>系统设置</h1>
    <p>配置系统的各项参数。</p>

    <div class="settings-form">
      <div class="form-section">
        <h3>基本设置</h3>
        <div class="form-group">
          <label>网站标题</label>
          <input v-model="settings.siteTitle" type="text">
        </div>
        <div class="form-group">
          <label>网站描述</label>
          <textarea v-model="settings.siteDescription" />
        </div>
      </div>

      <div class="form-section">
        <h3>安全设置</h3>
        <div class="form-group">
          <label>
            <input v-model="settings.enableTwoFactor" type="checkbox">
            启用双因素认证
          </label>
        </div>
        <div class="form-group">
          <label>
            <input v-model="settings.enableAuditLog" type="checkbox">
            启用审计日志
          </label>
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
  </div>
</template>

<style scoped>
.admin-settings {
  padding: 1rem;
}

.settings-form {
  background: white;
  padding: 2rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section h3 {
  margin: 0 0 1rem 0;
  color: #1f2937;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

.form-group input[type="text"],
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}

.form-group textarea {
  height: 100px;
  resize: vertical;
}

.form-group input[type="checkbox"] {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
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
