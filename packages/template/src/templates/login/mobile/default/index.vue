<template>
  <div class="mobile-login-container">
    <!-- 模板切换器插槽 -->
    <div v-if="$slots.switcher" class="template-switcher-container">
      <slot name="switcher"></slot>
    </div>
    <div class="mobile-login-header">
      <img v-if="logo" :src="logo" alt="Logo" class="mobile-logo">
      <h1 class="mobile-title">{{ title }}</h1>
      <p v-if="subtitle" class="mobile-subtitle">{{ subtitle }}</p>
    </div>

    <form class="mobile-form" @submit.prevent="handleSubmit">
      <div class="mobile-input-group">
        <input
          v-model="formData.username"
          type="text"
          placeholder="手机号 / 邮箱"
          required
        >
      </div>

      <div class="mobile-input-group">
        <input
          v-model="formData.password"
          type="password"
          placeholder="密码"
          required
        >
      </div>

      <button type="submit" class="mobile-login-btn" :disabled="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <div v-if="showForgotPassword" class="mobile-forgot">
        <a href="#" @click.prevent="handleForgotPassword">忘记密码？</a>
      </div>
    </form>

    <div v-if="showRegister" class="mobile-register">
      <span>还没有账号？</span>
      <a href="#" @click.prevent="handleRegister">立即注册</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { LoginTemplateProps } from '../../types'

const props = withDefaults(defineProps<LoginTemplateProps>(), {
  title: '欢迎登录',
  subtitle: '',
  logo: '',
  showRegister: true,
  showForgotPassword: true,
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
.template-switcher-container {
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 1000;
}

.mobile-login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.mobile-login-header {
  text-align: center;
  padding: 60px 0 40px;
  color: white;
}

.mobile-logo {
  width: 80px;
  height: 80px;
  margin-bottom: 20px;
  border-radius: 20px;
}

.mobile-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.mobile-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

.mobile-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-input-group {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.mobile-input-group input {
  width: 100%;
  padding: 18px 20px;
  border: none;
  font-size: 16px;
  box-sizing: border-box;
}

.mobile-input-group input:focus {
  outline: none;
}

.mobile-login-btn {
  padding: 18px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  margin-top: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.mobile-login-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.mobile-login-btn:disabled {
  opacity: 0.6;
}

.mobile-forgot {
  text-align: center;
  margin-top: 8px;
}

.mobile-forgot a {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.mobile-register {
  text-align: center;
  padding: 20px 0;
  color: white;
  font-size: 14px;
}

.mobile-register a {
  color: white;
  text-decoration: underline;
  font-weight: 600;
  margin-left: 8px;
}
</style>
