<script setup lang="ts">
import type { LoginTemplateProps } from '../../types'
import { reactive, ref } from 'vue'

const props = withDefaults(defineProps<LoginTemplateProps>(), {
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
  if (!props.onLogin)
    return

  loading.value = true
  try {
    await props.onLogin(formData)
  }
  catch (error) {
    console.error('Login failed:', error)
  }
  finally {
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

<template>
  <div class="login-container">
    <!-- 模板切换器插槽 -->
    <div v-if="$slots.switcher" class="template-switcher-container">
      <slot name="switcher" />
    </div>

    <div class="login-card">
      <div class="login-header">
        <img v-if="logo" :src="logo" alt="Logo" class="login-logo">
        <h1 class="login-title">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="login-subtitle">
          {{ subtitle }}
        </p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">用户名 / 邮箱</label>
          <input id="username" v-model="formData.username" type="text" placeholder="请输入用户名或邮箱" required>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="formData.password" type="password" placeholder="请输入密码" required>
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

<style scoped>
.template-switcher-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 40px;
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
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
  color: #333;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
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
  color: #666;
}

.checkbox-label input {
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  font-size: 14px;
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
</style>
