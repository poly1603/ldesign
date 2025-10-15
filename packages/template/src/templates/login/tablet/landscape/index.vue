<script setup lang="ts">
import type { LoginTabletProps } from '../../types'
import { reactive, ref } from 'vue'

const props = withDefaults(defineProps<LoginTabletProps>(), {
  title: 'LDesign',
  subtitle: '欢迎使用我们的服务，请登录您的账号开始使用',
  logo: '',
  showRemember: true,
  showRegister: true,
  showForgotPassword: true,
  layout: 'landscape',
  useSplitLayout: true,
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
  <div class="landscape-login-container">
    <!-- 模板切换器插槽 -->
    <div v-if="$slots.switcher" class="template-switcher-container">
      <slot name="switcher" />
    </div>
    <div class="login-wrapper">
      <!-- 左侧信息区 -->
      <div class="info-section">
        <div class="info-content">
          <div class="brand">
            <img v-if="logo" :src="logo" alt="Logo" class="brand-logo">
            <h2 class="brand-name">
              {{ title }}
            </h2>
          </div>
          <p class="info-text">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <!-- 右侧表单区 -->
      <div class="form-section">
        <form class="login-form" @submit.prevent="handleSubmit">
          <h1 class="form-title">
            账号登录
          </h1>

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
              <span>记住密码</span>
            </label>
            <a v-if="showForgotPassword" href="#" class="forgot-link" @click.prevent="handleForgotPassword">
              忘记密码？
            </a>
          </div>

          <button type="submit" class="login-button" :disabled="loading">
            {{ loading ? '登录中...' : '立即登录' }}
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
.login-landscape-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px;
}

.login-wrapper {
  display: flex;
  width: 100%;
  max-width: 900px;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
}

.info-section {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.info-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.info-content {
  position: relative;
  z-index: 1;
  color: white;
  text-align: center;
}

.brand {
  margin-bottom: 24px;
}

.brand-logo {
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
}

.brand-name {
  font-size: 36px;
  font-weight: 700;
  margin: 0;
}

.info-text {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.95;
  max-width: 320px;
  margin: 0 auto;
}

.form-section {
  flex: 1;
  padding: 48px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-form {
  width: 100%;
  max-width: 360px;
}

.form-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 32px 0;
  text-align: center;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid #ddd;
  border-radius: 10px;
  font-size: 15px;
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
  margin-bottom: 24px;
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
  width: 16px;
  height: 16px;
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
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 20px;
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

@media (max-width: 900px) {
  .login-wrapper {
    flex-direction: column;
    max-width: 500px;
  }

  .info-section {
    padding: 32px 24px;
  }

  .form-section {
    padding: 32px 24px;
  }
}

@media (max-width: 640px) {
  .login-landscape-container {
    padding: 20px;
  }

  .info-section {
    min-height: 240px;
  }

  .brand-name {
    font-size: 28px;
  }

  .info-text {
    font-size: 14px;
  }

  .form-title {
    font-size: 24px;
  }
}
</style>
