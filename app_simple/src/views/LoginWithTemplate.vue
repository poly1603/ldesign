<template>
  <div class="login-template-page">
    <!-- 使用useTemplate composable直接获取和渲染模板 -->
    <div v-if="loading" class="loading">
      加载模板中...
    </div>
    <div v-else-if="error" class="error">
      {{ error.message }}
    </div>
    <component 
      v-else-if="component" 
      :is="component" 
      v-bind="templateProps"
    />
    <div v-else class="no-template">
      没有找到合适的登录模板
    </div>
    
    <!-- 调试信息 -->
    <div class="debug-info">
      <p>设备: {{ device }}</p>
      <p>模板: {{ metadata?.name || '无' }}</p>
      <p>可用模板数: {{ templates.length }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'
import { useTemplate } from '@ldesign/template'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 使用模板系统
const {
  component,
  metadata,
  templates,
  device,
  loading,
  error,
  switchTemplate
} = useTemplate({
  category: 'login',
  autoDeviceSwitch: true,
  enableCache: false
})

// 登录处理
const handleLogin = async (data: { username: string, password: string, remember: boolean }) => {
  const result = await auth.login({
    username: data.username,
    password: data.password
  })
  
  if (result.success) {
    if (data.remember) {
      localStorage.setItem('rememberMe', 'true')
    }
    
    const redirect = (route.query?.redirect as string) || '/'
    await router.replace(redirect)
  } else {
    throw new Error(result.error || t('login.errors.invalid'))
  }
}

// 模板属性
const templateProps = computed(() => ({
  title: t('login.title'),
  subtitle: t('login.subtitle'),
  username: '',
  password: '',
  rememberMe: false,
  error: '',
  loading: false,
  onSubmit: handleLogin
}))

// 检查是否已登录
onMounted(() => {
  if (auth.isLoggedIn.value) {
    const redirect = (route.query?.redirect as string) || '/'
    router.replace(redirect)
  }
  
  // 打印调试信息
  console.log('Template system status:', {
    device: device.value,
    templates: templates.value,
    metadata: metadata.value,
    component: component.value,
    loading: loading.value,
    error: error.value
  })
})
</script>

<style scoped>
.login-template-page {
  width: 100%;
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading,
.error,
.no-template {
  padding: 20px;
  text-align: center;
  color: white;
  font-size: 18px;
}

.error {
  background: rgba(255, 0, 0, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.debug-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  font-size: 12px;
}

.debug-info p {
  margin: 5px 0;
}
</style>