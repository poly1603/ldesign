<template>
  <div class="login-example">
    <LoginPanel
      ref="loginPanelRef"
      title="系统登录"
      subtitle="欢迎使用管理系统"
      :show-social-login="true"
      @login="handleLogin"
      @social-login="handleSocialLogin"
      @forgot-password="handleForgotPassword"
      @register="handleRegister"
      @send-sms="handleSendSms"
      @refresh-captcha="handleRefreshCaptcha"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LoginPanel, useMessage, setGlobalMessage } from '../index'
import type { LoginFormData, SocialLoginType } from '../types'

const loginPanelRef = ref<InstanceType<typeof LoginPanel>>()
const message = useMessage()

// 设置全局消息服务
onMounted(() => {
  if (loginPanelRef.value?.message) {
    setGlobalMessage(loginPanelRef.value.message)
  }
})

// 处理登录
const handleLogin = async (data: LoginFormData & { type: 'username' | 'phone' }) => {
  console.log('Login data:', data)
  
  // 模拟登录请求
  setTimeout(() => {
    if (data.type === 'username') {
      // 模拟用户名密码登录
      if (data.username === 'admin' && data.password === 'admin123') {
        message.success('登录成功！')
        // 跳转到首页
        // router.push('/')
      } else {
        message.error('用户名或密码错误')
      }
    } else {
      // 模拟手机号登录
      if (data.smsCode === '123456') {
        message.success('登录成功！')
      } else {
        message.error('验证码错误')
      }
    }
  }, 1500)
}

// 处理第三方登录
const handleSocialLogin = (type: SocialLoginType) => {
  message.info(`正在使用 ${type} 登录...`)
  
  // 模拟第三方登录
  setTimeout(() => {
    message.success(`${type} 登录成功！`)
  }, 2000)
}

// 处理忘记密码
const handleForgotPassword = () => {
  message.info('即将跳转到找回密码页面...')
  // router.push('/forgot-password')
}

// 处理注册
const handleRegister = () => {
  message.info('即将跳转到注册页面...')
  // router.push('/register')
}

// 处理发送短信验证码
const handleSendSms = (phone: string) => {
  message.success(`验证码已发送到 ${phone}`)
  
  // 模拟发送验证码
  console.log('Sending SMS to:', phone)
}

// 处理刷新验证码
const handleRefreshCaptcha = () => {
  message.success('验证码已刷新')
  
  // 这里可以调用 API 获取新的验证码
  console.log('Refreshing captcha...')
}
</script>

<style scoped>
.login-example {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>