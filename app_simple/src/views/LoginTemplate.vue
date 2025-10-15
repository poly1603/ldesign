<template>
  <div class="login-page">
    <!-- 使用 TemplateRenderer 渲染登录模板 -->
    <TemplateRenderer
      category="login"
      :responsive="true"
      :props="loginProps"
      @template-change="onTemplateChange"
      @device-change="onDeviceChange"
    >
      <!-- 模板切换器插槽 -->
      <template #switcher>
        <TemplateSelector
          category="login"
          :device="currentDevice"
          @select="switchTemplate"
          class="template-switcher"
        />
      </template>
    </TemplateRenderer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'
import { TemplateRenderer, TemplateSelector } from '@ldesign/template'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 当前设备类型
const currentDevice = ref<'desktop' | 'mobile' | 'tablet'>('desktop')
// 当前模板名称
const currentTemplate = ref<string>('')

// 登录表单处理
const handleLogin = async (data: { username: string, password: string, remember: boolean }) => {
  // 使用认证模块登录
  const result = await auth.login({
    username: data.username,
    password: data.password
  })
  
  if (result.success) {
    if (data.remember) {
      localStorage.setItem('rememberMe', 'true')
    }
    
    console.log('登录成功！')
    
    // 获取重定向地址
    const redirect = (route.query?.redirect as string) || '/'
    await router.replace(redirect)
  } else {
    // 错误会通过 auth 模块内部处理
    throw new Error(result.error || t('login.errors.invalid'))
  }
}

// 注册处理
const handleRegister = () => {
  console.log('Navigate to register page')
  // router.push('/register')
}

// 忘记密码处理
const handleForgotPassword = () => {
  console.log('Navigate to forgot password page')
  // router.push('/forgot-password')
}

// 登录模板的 props
const loginProps = computed(() => ({
  title: t('login.title'),
  subtitle: t('login.subtitle'),
  logo: '/logo.svg', // 可以替换为实际的 logo 路径
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
  onLogin: handleLogin,
  onRegister: handleRegister,
  onForgotPassword: handleForgotPassword
}))

// 模板切换
const switchTemplate = (templateName: string) => {
  currentTemplate.value = templateName
  console.log('Switch to template:', templateName)
}

// 模板变化事件
const onTemplateChange = (templateName: string) => {
  currentTemplate.value = templateName
  console.log('Template changed to:', templateName)
}

// 设备变化事件
const onDeviceChange = (device: 'desktop' | 'mobile' | 'tablet') => {
  currentDevice.value = device
  console.log('Device changed to:', device)
}

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