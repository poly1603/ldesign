<script setup lang="ts">
import { reactive } from 'vue'

const settings = reactive({
  emailNotifications: true,
  pushNotifications: false,
  profilePublic: true,
  showOnlineStatus: true,
  language: 'zh-CN',
})

function saveSettings() {
  // 模拟保存操作
}
</script>

<template>
  <div class="user-settings">
    <h3>⚙️ 用户设置</h3>
    <p>配置您的账户偏好和隐私设置。</p>

    <div class="settings-sections">
      <div class="settings-section">
        <h4>通知设置</h4>
        <div class="setting-item">
          <label>
            <input v-model="settings.emailNotifications" type="checkbox">
            接收邮件通知
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input v-model="settings.pushNotifications" type="checkbox">
            接收推送通知
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h4>隐私设置</h4>
        <div class="setting-item">
          <label>
            <input v-model="settings.profilePublic" type="checkbox">
            公开个人资料
          </label>
        </div>
        <div class="setting-item">
          <label>
            <input v-model="settings.showOnlineStatus" type="checkbox">
            显示在线状态
          </label>
        </div>
      </div>

      <div class="settings-section">
        <h4>语言设置</h4>
        <div class="setting-item">
          <label>界面语言</label>
          <select v-model="settings.language">
            <option value="zh-CN">
              简体中文
            </option>
            <option value="en-US">
              English
            </option>
            <option value="ja-JP">
              日本語
            </option>
          </select>
        </div>
      </div>
    </div>

    <button class="save-btn" @click="saveSettings">
      保存设置
    </button>
  </div>
</template>

<style scoped>
.user-settings h3 {
  color: #1f2937;
  margin-bottom: 1rem;
}

.settings-sections {
  max-width: 500px;
}

.settings-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.settings-section h4 {
  margin: 0 0 1rem 0;
  color: #374151;
  font-size: 1.1rem;
}

.setting-item {
  margin-bottom: 1rem;
}

.setting-item label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #374151;
}

.setting-item input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}

.setting-item select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
}

.save-btn {
  background: #2563eb;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.save-btn:hover {
  background: #1d4ed8;
}
</style>
