<template>
  <div class="login-tablet-container" :class="`layout-${layout}`">
    <div class="login-content">
      <div class="login-header">
        <img v-if="logo" :src="logo" alt="Logo" class="login-logo">
        <h1 class="login-title">{{ title }}</h1>
        <p v-if="subtitle" class="login-subtitle">{{ subtitle }}</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名 / 邮箱</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="请输入用户名或邮箱"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            required
          >
        </div>

        <div v-if="showRemember || showForgotPassword" class="form-options">
          <label v-if="showRemember" class="checkbox-label">
            <input v-model="formData.remember" type="checkbox">
            <span>记住我</span>
          </label>
          <a v-if="showForgotPassword" href="#" class="forgot-link" @click.prevent="handleForgotPassword">
            忘记密码？
          </a>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div v-if="showRegister" class="register-link">
          还没有账号？
          <a href="#" @click.prevent="handleRegister">立即注册</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { LoginTabletProps } from '../../types'

const props = withDefaults(defineProps<LoginTabletProps>(), {
  title: '欢迎登录',
  subtitle: '请输入您的账号信息',
  logo: '',
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
  layout: 'portrait',
  useSplitLayout: false,
})

const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)

const handleSubmit = async () => {
  if (!props.onLogin) return

  loading.value = true
  try {
    await props.onLogin(formData)
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}

const handleRegister = () => {
  props.onRegister?.()
}

const handleForgotPassword = () => {
  props.onForgotPassword?.()
}
</script>

<style scoped>
.login-tablet-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 32px;
}

.login-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
  padding: 48px;
  width: 100%;
  max-width: 520px;
}

.layout-landscape .login-content {
  max-width: 640px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.login-subtitle {
  font-size: 16px;
  color: #666;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-group label {
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 16px 18px;
  border: 1.5px solid #ddd;
  border-radius: 12px;
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: #666;
}

.checkbox-label input {
  cursor: pointer;
  width: 18px;
  height: 18px;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.35);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  font-size: 15px;
  color: #666;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-tablet-container {
    padding: 20px;
  }

  .login-content {
    padding: 36px 28px;
    max-width: 100%;
  }

  .layout-landscape .login-content {
    max-width: 100%;
  }
}
</style>
