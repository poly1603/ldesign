<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-title">{{ title || '欢迎登录' }}</h1>
        <p v-if="subtitle" class="login-subtitle">{{ subtitle }}</p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="login-form">
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

        <div class="form-options">
          <label class="checkbox-label">
            <input v-model="formData.remember" type="checkbox">
            <span>记住我</span>
          </label>
          <a v-if="onForgotPassword" href="#" class="forgot-link" @click.prevent="handleForgotPassword">
            忘记密码？
          </a>
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>

        <div v-if="onRegister" class="register-link">
          还没有账号？
          <a href="#" @click.prevent="handleRegister">立即注册</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'

interface Props {
  title?: string
  subtitle?: string
  logo?: string
  showRemember?: boolean
  showRegister?: boolean
  showForgotPassword?: boolean
  onLogin?: (data: { username: string, password: string, remember: boolean }) => void | Promise<void>
  onRegister?: () => void
  onForgotPassword?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎登录',
  subtitle: '',
  logo: '',
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
})

const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)

async function handleSubmit() {
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

function handleRegister() {
  props.onRegister?.()
}

function handleForgotPassword() {
  props.onForgotPassword?.()
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  padding: 20px;
}

.login-card {
  background: var(--color-bg-container);
  border-radius: 12px;
  box-shadow: var(--shadow-xl);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  background: var(--color-bg-component);
  color: var(--color-text-primary);
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--color-border-input-focus);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: var(--color-text-secondary);
}

.checkbox-label input {
  cursor: pointer;
}

.forgot-link {
  color: var(--color-text-link);
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 14px;
  background: linear-gradient(135deg, var(--color-primary-default) 0%, var(--color-primary-active) 100%);
  color: var(--color-text-inverse);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.register-link a {
  color: var(--color-text-link);
  text-decoration: none;
  font-weight: 500;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>