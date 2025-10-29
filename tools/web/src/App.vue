<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <n-notification-provider>
        <Layout>
          <router-view />
        </Layout>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { NConfigProvider, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui'
import Layout from './components/Layout.vue'
import { useThemeStore } from './store/theme'
import { apiClient } from './api/client'
import { DEBUG } from './config/env'

const themeStore = useThemeStore()
const theme = computed(() => (themeStore.isDark ? darkTheme : null))

// 应用初始化时检查后端连接
onMounted(async () => {
  try {
    const connected = await apiClient.checkConnection()
    if (connected) {
      console.log('后端连接成功')
    } else {
      console.warn('后端连接失败')
    }
  } catch (error) {
    console.error('后端连接失败:', error)
  }

  if (DEBUG) {
    console.log('LDesign CLI Web 已启动')
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
    sans-serif;
}
</style>

