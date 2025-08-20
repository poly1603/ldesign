<script setup lang="ts">
import { useRouter, useQuery } from '@ldesign/router'
import { computed } from 'vue'
import { useAppStore } from '../stores/app'
import {
  TemplateRenderer,
  useTemplate,
} from '@ldesign/template/vue'
import LoginPanel from '../components/LoginPanel.vue'

const router = useRouter()
const query = useQuery()
const appStore = useAppStore()

// 使用模板系统，启用自动设备检测和模板切换
const {
  currentDevice,
  currentTemplate,
} = useTemplate({
  category: 'login',
  autoScan: true,
  autoDetectDevice: true, // 启用自动设备检测
  debug: true, // 启用调试模式以便观察设备变化
})

// 登录处理
async function handleLogin(loginData: any) {
  const success = appStore.login(loginData.username, loginData.password)
  if (success) {
    const redirect = (query.value.redirect as string) || '/home'
    await router.push(redirect)
  }
}

// 注册处理
function handleRegister() {
  router.push('/register')
}

// 忘记密码处理
function handleForgotPassword() {
  alert('忘记密码功能待实现')
}

// 第三方登录处理
function handleThirdPartyLogin(data: any) {
  alert(`使用 ${data.provider} 登录`)
}

// 传递给模板的属性
const templateProps = computed(() => ({
  // 传递 LoginPanel 组件
  loginPanel: LoginPanel,
}))
</script>

<template>
  <div class="login-container">
    <!-- 模板渲染器 - 自动内置模板选择器 -->
    <TemplateRenderer
      category="login"
      :device="currentDevice"
      :template="currentTemplate?.template"
      :template-props="templateProps"
      :selector="true"
      :allow-template-switch="true"
      @login="handleLogin"
      @register="handleRegister"
      @forgot-password="handleForgotPassword"
      @third-party-login="handleThirdPartyLogin"
    />
  </div>
</template>

<style lang="less" scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
