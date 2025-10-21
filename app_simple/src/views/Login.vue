<template>
  <div class="login-page-wrapper">
    <!-- TemplateRenderer 现在自动处理设备检测和模板加载 -->
    <TemplateRenderer 
      category="login" 
      :component-props="{
        title: t('login.title'),
        subtitle: t('login.subtitle'),
        showSocialLogin: false
      }"
      @login="handleLogin" 
      @register="handleRegister"
      @forgot-password="handleForgotPassword">
      
      <!-- 如果要自定义登录面板，使用正确的插槽内容 -->
      <template #loginPanel="{ handleSubmit, loading, error }">
        <CustomLoginPanel
          :on-submit="handleSubmit"
          :loading="loading"
          :error="error"
          @forgot-password="handleForgotPassword"
        />
      </template>
      
      <!-- 或者使用简单的测试内容 -->
      <!-- <template #loginPanel="{ handleSubmit }">
        <div class="test-panel">
          <h3>自定义登录面板</h3>
          <form @submit.prevent="handleSubmit">
            <input v-model="testForm.username" placeholder="用户名" />
            <input v-model="testForm.password" type="password" placeholder="密码" />
            <button type="submit">登录</button>
          </form>
        </div>
      </template> -->
    </TemplateRenderer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from '@ldesign/router'
import { useI18n } from '../i18n'
import { auth } from '../composables/useAuth'
import { TemplateRenderer } from '@ldesign/template'
import CustomLoginPanel from '../components/CustomLoginPanel.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

// 测试表单数据（如果使用简单测试）
const testForm = reactive({
  username: '',
  password: ''
})

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

/* 测试面板样式 */
.test-panel {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.test-panel h3 {
  margin: 0 0 24px;
  text-align: center;
  color: #333;
}

.test-panel form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.test-panel input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.test-panel button {
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.test-panel button:hover {
  background: #5568d3;
}
</style>
