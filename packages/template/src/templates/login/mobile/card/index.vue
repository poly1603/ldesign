<script setup lang="ts">
import type { LoginMobileCardProps } from '../../types'
import { reactive, ref } from 'vue'

const props = withDefaults(defineProps<LoginMobileCardProps>(), {
  title: '欢迎登录',
  subtitle: '',
  logo: '',
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
  borderRadius: 'medium',
  showTopBackground: true,
  compact: false,
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
  <div class="login-mobile-container" :class="{ compact }">
    <!-- 模板切换器插槽 -->
    <div v-if="$slots.switcher" class="template-switcher-container">
      <slot name="switcher" />
    </div>

    <!-- 顶部装饰背景 -->
    <div v-if="showTopBackground" class="top-background" />

    <!-- 登录卡片 -->
    <div class="login-card" :class="`radius-${borderRadius}`">
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

<style scoped>
.template-switcher-container {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 1000;
}

.login-mobile-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
  padding: 0;
  position: relative;
}

.login-mobile-container.compact {
  padding: 16px;
}

.top-background {
  width: 100%;
  height: 220px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 0 40px 40px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.login-card {
  background: white;
  padding: 32px 24px;
  width: 100%;
  position: relative;
  z-index: 1;
  margin-top: 140px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.compact .login-card {
  margin-top: 0;
}

.login-card.radius-small {
  border-radius: 12px;
}

.login-card.radius-medium {
  border-radius: 20px;
}

.login-card.radius-large {
  border-radius: 28px;
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
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
  gap: 18px;
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
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 16px;
  background: #fafafa;
  transition: border-color 0.3s, background-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
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
  font-weight: 500;
}

.forgot-link:active {
  opacity: 0.7;
}

.login-button {
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.login-button:active:not(:disabled) {
  transform: scale(0.98);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
  padding-top: 8px;
}

.register-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.register-link a:active {
  opacity: 0.7;
}

@media (min-width: 640px) {
  .login-mobile-container {
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .login-mobile-container.compact {
    padding: 20px;
  }

  .top-background {
    display: none;
  }

  .login-card {
    max-width: 420px;
    margin-top: 0;
  }

  .compact .login-card {
    margin-top: 0;
  }
}
</style>
