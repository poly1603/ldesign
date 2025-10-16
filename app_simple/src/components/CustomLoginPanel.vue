<template>
  <LoginPanelV2 ref="loginPanelRef" @login="handleLogin" @social-login="handleSocialLogin"
    @forgot="handleForgotPassword" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from '@ldesign/router'
import LoginPanelV2 from './login-panel/LoginPanelV2.vue'
import { useAuth } from '@/composables/useAuth'
import { setGlobalMessage, useMessage } from './login-panel/composables/useMessage'

const router = useRouter()
const { login } = useAuth()
const loginPanelRef = ref<InstanceType<typeof LoginPanelV2>>()
const message = useMessage()

// 在组件挂载后设置全局消息服务
onMounted(() => {
  if (loginPanelRef.value?.message) {
    setGlobalMessage(loginPanelRef.value.message)
  }
})

const handleLogin = async (data: any) => {
  try {
    let success = false

    if (data.type === 'account') {
      // 用户名密码登录
      success = await login(data.username!, data.password!)
    } else {
      // 手机号验证码登录
      // 这里需要实现手机号登录的逻辑
      console.log('Phone login:', data.phone, data.smsCode)
      // success = await loginByPhone(data.phone!, data.smsCode!)
      message.info('手机号登录功能待实现')
      return
    }

    if (success) {
      message.success('登录成功')
      if (data.remember) {
        // 保存登录信息到本地存储
        localStorage.setItem('remember', 'true')
      }
      router.push('/')
    } else {
      message.error('用户名或密码错误')
    }
  } catch (error) {
    console.error('登录失败', error)
    message.error('登录失败，请重试')
  }
}

const handleSocialLogin = (type: string) => {
  console.log('Social login:', type)
  message.info(`${type} 登录功能待实现`)
  // 实现第三方登录逻辑
}

const handleForgotPassword = () => {
  message.info('忘记密码功能待实现')
  // router.push('/forgot-password')
}

</script>

<style scoped>
/* 样式已经在 LoginPanelV2 组件中定义 */
</style>
