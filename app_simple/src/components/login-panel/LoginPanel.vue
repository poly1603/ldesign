<template>
  <div class="login-panel">
    <MessageToast ref="messageRef" />
    <div class="login-panel-container">
      <div class="login-header">
        <h2 class="login-title">{{ title }}</h2>
        <p v-if="subtitle" class="login-subtitle">{{ subtitle }}</p>
      </div>
      
      <LoginTabs
        v-model="activeTab"
        :tabs="tabs"
        @change="handleTabChange"
      >
        <template #username>
          <UsernameLoginForm
            :captcha-url="captchaUrl"
            :loading="isLoading"
            @submit="handleUsernameLogin"
            @refresh-captcha="handleRefreshCaptcha"
            @forgot-password="handleForgotPassword"
          />
        </template>
        
        <template #phone>
          <PhoneLoginForm
            :loading="isLoading"
            @submit="handlePhoneLogin"
            @send-sms="handleSendSms"
            @switch-to-username="activeTab = 'username'"
            @register="handleRegister"
          />
        </template>
      </LoginTabs>
      
      <SocialLogin
        v-if="showSocialLogin"
        :social-list="socialList"
        @social-login="handleSocialLogin"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, provide } from 'vue'
import LoginTabs from './components/LoginTabs.vue'
import UsernameLoginForm from './components/UsernameLoginForm.vue'
import PhoneLoginForm from './components/PhoneLoginForm.vue'
import SocialLogin from './components/SocialLogin.vue'
import MessageToast from './components/MessageToast.vue'
import type { LoginFormData, SocialLoginType, SocialLoginConfig, TabItem } from './types'

interface Props {
  title?: string
  subtitle?: string
  showSocialLogin?: boolean
  socialList?: SocialLoginConfig[]
  defaultTab?: 'username' | 'phone'
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎登录',
  subtitle: '请使用您的账户登录系统',
  showSocialLogin: true,
  defaultTab: 'username'
})

const emit = defineEmits<{
  'login': [data: LoginFormData & { type: 'username' | 'phone' }]
  'social-login': [type: SocialLoginType]
  'forgot-password': []
  'register': []
  'send-sms': [phone: string]
  'refresh-captcha': []
}>()

const activeTab = ref(props.defaultTab)
const isLoading = ref(false)
const captchaUrl = ref('')
const messageRef = ref<InstanceType<typeof MessageToast>>()

// 定时器引用
let loginTimer: number | null = null

// 提供消息服务给子组件
onMounted(() => {
  if (messageRef.value?.message) {
    provide('message', messageRef.value.message)
  }
})

// 暴露消息服务给父组件
defineExpose({
  message: messageRef.value?.message
})

const tabs: TabItem[] = [
  { key: 'username', label: '账号登录', icon: 'icon-user' },
  { key: 'phone', label: '手机登录', icon: 'icon-phone' }
]

const handleTabChange = (key: string) => {
  console.log('Tab changed to:', key)
}

const handleUsernameLogin = async (data: LoginFormData) => {
  isLoading.value = true
  
  // 清理之前的定时器
  if (loginTimer !== null) {
    clearTimeout(loginTimer)
  }
  
  try {
    emit('login', { ...data, type: 'username' })
    // 模拟登录延迟
    loginTimer = window.setTimeout(() => {
      isLoading.value = false
      console.log('Username login:', data)
      loginTimer = null
    }, 1500)
  } catch (error) {
    isLoading.value = false
    console.error('Login failed:', error)
  }
}

const handlePhoneLogin = async (data: LoginFormData) => {
  isLoading.value = true
  
  // 清理之前的定时器
  if (loginTimer !== null) {
    clearTimeout(loginTimer)
  }
  
  try {
    emit('login', { ...data, type: 'phone' })
    // 模拟登录延迟
    loginTimer = window.setTimeout(() => {
      isLoading.value = false
      console.log('Phone login:', data)
      loginTimer = null
    }, 1500)
  } catch (error) {
    isLoading.value = false
    console.error('Login failed:', error)
  }
}

const handleSocialLogin = (type: SocialLoginType) => {
  console.log('Social login:', type)
  emit('social-login', type)
}

const handleRefreshCaptcha = () => {
  // 模拟刷新验证码
  captchaUrl.value = `https://via.placeholder.com/120x44?text=${Math.random().toString(36).substr(2, 4).toUpperCase()}`
  emit('refresh-captcha')
}

const handleForgotPassword = () => {
  console.log('Forgot password clicked')
  emit('forgot-password')
}

const handleRegister = () => {
  console.log('Register clicked')
  emit('register')
}

const handleSendSms = (phone: string) => {
  console.log('Send SMS to:', phone)
  emit('send-sms', phone)
}

onMounted(() => {
  // 初始化时加载验证码
  handleRefreshCaptcha()
})

onBeforeUnmount(() => {
  // 清理定时器
  if (loginTimer !== null) {
    clearTimeout(loginTimer)
    loginTimer = null
  }
})
</script>

<style scoped>
.login-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-panel-container {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.2;
}

.login-subtitle {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-panel {
    padding: 0;
  }
  
  .login-panel-container {
    max-width: 100%;
    border-radius: 0;
    padding: 32px 24px;
  }
  
  .login-title {
    font-size: 24px;
  }
}
</style>