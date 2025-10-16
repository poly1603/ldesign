<template>
  <div class="login-page-wrapper">
    <!-- TemplateRenderer 现在自动处理设备检测和模板加载 -->
    <TemplateRenderer 
      category="login"
      @login="handleLogin"
      @register="handleRegister"
      @forgot-password="handleForgotPassword"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useI18n } from '@/i18n'
import { auth } from '@/composables/useAuth'
import { TemplateRenderer } from '@ldesign/template'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 登录处理
const handleLogin = async (data: { username: string; password: string; remember?: boolean }) => {
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
    const error = result.error || t('login.errors.invalid')
    throw new Error(error)
  }
}

// 注册处理
const handleRegister = () => {
  console.log('跳转到注册页')
  // router.push('/register')
}

// 忘记密码处理
const handleForgotPassword = () => {
  console.log('跳转到忘记密码页')
  // router.push('/forgot-password')
}

// 组件挂载时检查是否已登录
onMounted(() => {
  if (auth.isLoggedIn.value) {
    // 已登录的用户访问登录页，重定向到首页或查询参数中指定的页面
    const redirect = (route.query?.redirect as string) || '/'
    router.replace(redirect)
  }
})
</script>

<style scoped>
/* 登录页面包装器，使用简单的全屏布局 */
.login-page-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
