<template>
  <div class="login-page">
    <!-- 直接使用Login组件，暂时不使用模板系统 -->
    <Login />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { auth } from '@/composables/useAuth'
import Login from './Login.vue'

const router = useRouter()
const route = useRoute()

// 检查是否已登录
onMounted(() => {
  if (auth.isLoggedIn.value) {
    const redirect = (route.query?.redirect as string) || '/'
    router.replace(redirect)
  }
})
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.template-switcher {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 确保模板能正确渲染 */
:deep(.login-container) {
  min-height: 100vh;
}
</style>