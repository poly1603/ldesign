<script setup lang="ts">
import type { LoginDesktopSplitProps } from '../../types'
import { computed, reactive, ref } from 'vue'

const props = withDefaults(defineProps<LoginDesktopSplitProps>(), {
  title: '欢迎回来',
  subtitle: '请输入您的账号信息登录',
  logo: '',
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
  sidebarTitle: '探索精彩内容',
  sidebarDescription: '立即登录开启您的专属体验',
  themeColor: '#667eea',
  backgroundImage: '',
})

const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)

const sidebarStyle = computed(() => ({
  backgroundImage: props.backgroundImage ? `url(${props.backgroundImage})` : `linear-gradient(135deg, ${props.themeColor} 0%, #764ba2 100%)`,
}))

const buttonStyle = computed(() => ({
  background: `linear-gradient(135deg, ${props.themeColor} 0%, #764ba2 100%)`,
}))

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
  <div class="login-split-container">
    <!-- 模板切换器插槽 -->
    <div v-if="$slots.switcher" class="template-switcher-container">
      <slot name="switcher" />
    </div>

    <!-- 左侧装饰区域 -->
    <div class="login-sidebar" :style="sidebarStyle">
      <div class="sidebar-content">
        <h1 class="sidebar-title">
          {{ sidebarTitle }}
        </h1>
        <p class="sidebar-description">
          {{ sidebarDescription }}
        </p>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-form-area">
      <div class="login-form-wrapper">
        <div class="login-header">
          <img v-if="logo" :src="logo" alt="Logo" class="login-logo">
          <h2 class="login-title">
            {{ title }}
          </h2>
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

          <button type="submit" class="login-button" :disabled="loading" :style="buttonStyle">
            {{ loading ? '登录中...' : '登录' }}
          </button>

          <div v-if="showRegister" class="register-link">
            还没有账号？
            <a href="#" @click.prevent="handleRegister">立即注册</a>
          </div>
        </form>
      </div>
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

.login-split-container {
  display: flex;
  min-height: 100vh;
}

.login-sidebar {
  flex: 1;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
}

.login-sidebar::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
}

.sidebar-content {
  position: relative;
  z-index: 1;
  color: white;
  text-align: center;
  max-width: 500px;
}

.sidebar-title {
  font-size: 42px;
  font-weight: 700;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.sidebar-description {
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
  line-height: 1.6;
}

.login-form-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: #f8f9fa;
}

.login-form-wrapper {
  width: 100%;
  max-width: 420px;
}

.login-header {
  text-align: center;
  margin-bottom: 36px;
}

.login-logo {
  width: 56px;
  height: 56px;
  margin-bottom: 16px;
}

.login-title {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-subtitle {
  font-size: 15px;
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
  padding: 14px 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
  background: white;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

.forgot-link:hover {
  text-decoration: underline;
}

.login-button {
  padding: 16px;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
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

@media (max-width: 1024px) {
  .login-split-container {
    flex-direction: column;
  }

  .login-sidebar {
    min-height: 40vh;
    padding: 40px 20px;
  }

  .sidebar-title {
    font-size: 32px;
  }

  .sidebar-description {
    font-size: 16px;
  }
}
</style>
