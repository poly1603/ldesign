<template>
  <div class="settings-page">
    <n-page-header title="设置" subtitle="管理系统配置和用户偏好">
      <template #extra>
        <n-button type="primary" @click="saveSettings">
          <template #icon>
            <n-icon :component="SaveOutline" />
          </template>
          保存设置
        </n-button>
      </template>
    </n-page-header>

    <n-card title="外观设置" style="margin-top: 20px">
      <n-form label-width="150px" label-placement="left">
        <n-form-item label="深色模式">
          <n-switch v-model:value="themeStore.isDark" />
        </n-form-item>

        <n-form-item label="主题色">
          <n-color-picker v-model:value="themeStore.primaryColor" />
        </n-form-item>

        <n-form-item label="语言">
          <n-select v-model:value="language" :options="languageOptions" style="width: 200px" />
        </n-form-item>
      </n-form>
    </n-card>

    <n-card title="通知设置" style="margin-top: 20px">
      <n-form label-width="150px" label-placement="left">
        <n-form-item label="启用通知">
          <n-switch v-model:value="settings.notifications" />
        </n-form-item>

        <n-form-item label="声音提示">
          <n-switch v-model:value="settings.soundEnabled" />
        </n-form-item>
      </n-form>
    </n-card>

    <n-card title="性能设置" style="margin-top: 20px">
      <n-form label-width="150px" label-placement="left">
        <n-form-item label="自动刷新间隔">
          <n-space align="center">
            <n-input-number v-model:value="settings.autoRefresh" :min="1" :max="60" style="width: 120px" />
            <n-text>秒</n-text>
          </n-space>
        </n-form-item>

        <n-form-item label="启用动画">
          <n-switch v-model:value="settings.enableAnimations" />
        </n-form-item>
      </n-form>
    </n-card>

    <n-card title="开发者设置" style="margin-top: 20px">
      <n-form label-width="150px" label-placement="left">
        <n-form-item label="显示调试信息">
          <n-switch v-model:value="settings.showDebugInfo" />
        </n-form-item>

        <n-form-item label="API 基础地址">
          <n-input v-model:value="settings.apiBaseUrl" placeholder="http://127.0.0.1:3000" style="width: 300px" />
        </n-form-item>
      </n-form>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { SaveOutline } from '@vicons/ionicons5'
import { useThemeStore } from '../store/theme'

const message = useMessage()
const themeStore = useThemeStore()

const language = ref('zh')
const languageOptions = [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
]

const settings = ref({
  notifications: true,
  soundEnabled: false,
  autoRefresh: 5,
  enableAnimations: true,
  showDebugInfo: false,
  apiBaseUrl: 'http://127.0.0.1:3000',
})

function saveSettings() {
  // 保存到 localStorage
  localStorage.setItem('app-settings', JSON.stringify({
    ...settings.value,
    language: language.value,
  }))
  message.success('设置保存成功')
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}
</style>

