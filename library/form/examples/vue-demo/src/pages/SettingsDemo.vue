<template>
  <div class="settings-demo">
    <div class="settings-layout">
      <div class="settings-sidebar">
        <div
          v-for="tab in tabs"
          :key="tab.value"
          class="sidebar-item"
          :class="{ active: currentTab === tab.value }"
          @click="currentTab = tab.value"
        >
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
        </div>
      </div>

      <div class="settings-content">
        <!-- 账户设置 -->
        <div v-if="currentTab === 'account'" class="settings-panel">
          <h3>账户设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">用户名</div>
              <div class="setting-desc">您的用户名用于登录和展示</div>
            </div>
            <InputField v-model="settings.username" style="width: 200px;" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">邮箱地址</div>
              <div class="setting-desc">用于接收通知</div>
            </div>
            <InputField v-model="settings.email" type="email" style="width: 200px;" />
          </div>
        </div>

        <!-- 隐私设置 -->
        <div v-if="currentTab === 'privacy'" class="settings-panel">
          <h3>隐私设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">个人资料可见性</div>
              <div class="setting-desc">设置谁可以查看您的个人资料</div>
            </div>
            <SelectField v-model="settings.profileVisibility" :options="visibilityOptions" style="width: 150px;" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">允许搜索</div>
              <div class="setting-desc">其他用户是否可以搜索到您</div>
            </div>
            <SwitchField v-model="settings.allowSearch" @change="autoSave" />
          </div>
        </div>

        <!-- 通知设置 -->
        <div v-if="currentTab === 'notification'" class="settings-panel">
          <h3>通知设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">邮件通知</div>
            </div>
            <SwitchField v-model="settings.emailNotify" @change="autoSave" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">浏览器推送</div>
            </div>
            <SwitchField v-model="settings.browserNotify" @change="autoSave" />
          </div>
        </div>

        <!-- 外观设置 -->
        <div v-if="currentTab === 'appearance'" class="settings-panel">
          <h3>外观设置</h3>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">主题模式</div>
            </div>
            <SelectField v-model="settings.theme" :options="themeOptions" style="width: 150px;" @change="applyTheme" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-title">主题颜色</div>
            </div>
            <ColorPickerField v-model="settings.themeColor" :presetColors="presetColors" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="saved" class="save-indicator">✓ 设置已保存</div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { InputField, SelectField, SwitchField, ColorPickerField } from '../../../src/adapters/vue/components/fields'

const currentTab = ref('account')
const saved = ref(false)

const tabs = [
  { label: '账户设置', value: 'account', icon: '👤' },
  { label: '隐私设置', value: 'privacy', icon: '🔒' },
  { label: '通知设置', value: 'notification', icon: '🔔' },
  { label: '外观设置', value: 'appearance', icon: '🎨' }
]

const settings = reactive({
  username: 'user123',
  email: 'user@example.com',
  profileVisibility: 'public',
  allowSearch: true,
  emailNotify: true,
  browserNotify: false,
  theme: 'light',
  themeColor: '#722ED1'
})

const visibilityOptions = [
  { label: '所有人', value: 'public' },
  { label: '仅好友', value: 'friends' },
  { label: '仅自己', value: 'private' }
]

const themeOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
  { label: '跟随系统', value: 'auto' }
]

const presetColors = ['#722ED1', '#1890ff', '#52c41a', '#fa8c16']

const autoSave = () => {
  saved.value = true
  setTimeout(() => saved.value = false, 2000)
  localStorage.setItem('userSettings', JSON.stringify(settings))
}

const applyTheme = () => {
  document.documentElement.setAttribute('data-theme', settings.theme)
  autoSave()
}
</script>

<style scoped>
.settings-demo {
  max-width: 1000px;
  margin: 0 auto;
}

.settings-layout {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 24px;
}

.settings-sidebar {
  background: #fff;
  border-radius: 8px;
  padding: 16px 0;
}

.sidebar-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.3s;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background: #f5f5f5;
}

.sidebar-item.active {
  background: rgba(114, 46, 209, 0.05);
  color: #722ED1;
  border-left-color: #722ED1;
  font-weight: 500;
}

.tab-icon {
  margin-right: 8px;
}

.settings-content {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
}

.settings-panel h3 {
  font-size: 18px;
  margin-bottom: 24px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-title {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.save-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 12px 20px;
  background: #fff;
  border-left: 4px solid #52c41a;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s;
}

@keyframes slideIn {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}
</style>



