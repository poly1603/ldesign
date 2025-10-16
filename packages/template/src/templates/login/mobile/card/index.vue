<script setup lang="ts">
import { reactive, ref } from 'vue'

interface SocialProvider { name: string; label: string; icon?: string }

interface Props {
  title?: string
  subtitle?: string
  showLogo?: boolean
  showRememberMe?: boolean
  showSocialLogin?: boolean
  socialProviders?: Array<{
    name: string
    label: string
    icon?: string
  }>
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  title: '欢迎登录',
  subtitle: '',
  showLogo: true,
  showRememberMe: true,
  showSocialLogin: false,
  socialProviders: () => [],
  loading: false,
  error: null,
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string; rememberMe?: boolean }]
  register: []
  forgot: []
  socialLogin: [provider: SocialProvider]
}>()

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const loading = ref(props.loading)
const error = ref(props.error)

const handleSubmit = () => {
  emit('submit', { ...form })
}

const handleRegister = () => {
  emit('register')
}

const handleForgot = () => {
  emit('forgot')
}

const handleSocialLogin = (provider: SocialProvider) => {
  emit('socialLogin', provider)
}
</script>

<template>
  <div class="login-mobile-card">
    <div class="card-container">
      <!-- Logo 插槽 -->
      <div v-if="$slots.logo || showLogo" class="logo-section">
        <slot name="logo">
          <div class="default-logo">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="#667eea">
              <circle cx="28" cy="28" r="24" opacity="0.1" />
              <path d="M28 14 L38 28 L28 42 L18 28 Z" fill="#667eea" />
            </svg>
          </div>
        </slot>
      </div>

      <!-- 头部插槽 -->
      <div class="card-header">
        <slot name="header" :title="title" :subtitle="subtitle">
          <h1>{{ title }}</h1>
          <p v-if="subtitle" class="subtitle">
            {{ subtitle }}
          </p>
        </slot>
      </div>

      <!-- 登录面板插槽 -->
      <slot
        name="loginPanel"
        :form="form"
        :loading="loading"
        :error="error"
        :handle-submit="handleSubmit"
      >
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="form.username"
                type="text"
                placeholder="手机号/用户名/邮箱"
                required
              >
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <input
                v-model="form.password"
                type="password"
                placeholder="密码"
                required
              >
            </div>
          </div>

          <div v-if="showRememberMe" class="form-options">
            <label class="remember-me">
              <input v-model="form.rememberMe" type="checkbox">
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="handleForgot">忘记密码？</a>
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </slot>

      <!-- 社交登录插槽 -->
      <div v-if="$slots.socialLogin || showSocialLogin" class="social-section">
        <slot name="socialLogin" :providers="socialProviders">
          <div class="social-divider">
            <span>其他方式</span>
          </div>
          <div class="social-buttons">
            <button
              v-for="provider in socialProviders"
              :key="provider.name"
              class="social-btn"
              @click="handleSocialLogin(provider)"
            >
              <span>{{ provider.label }}</span>
            </button>
          </div>
        </slot>
      </div>

      <!-- 底部插槽 -->
      <div class="card-footer">
        <slot name="footer">
          <a href="#" @click.prevent="handleRegister">注册账号</a>
          <span class="divider">|</span>
          <a href="#" @click.prevent="handleForgot">忘记密码</a>
        </slot>
      </div>

      <!-- 额外内容插槽 -->
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.login-mobile-card {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-container {
  width: 100%;
  max-width: 380px;
  padding: 32px 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 24px;
}

.default-logo {
  display: inline-block;
}

/* 头部 */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-header h1 {
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 600;
  color: #1a1a1a;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

/* 表单 */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px;
  font-size: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #f8f8f8;
  transition: all 0.3s;
  box-sizing: border-box;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-wrapper input::placeholder {
  color: #999;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 13px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 13px;
}

.forgot-link:active {
  opacity: 0.8;
}

/* 登录按钮 */
.btn-login {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login:active {
  transform: scale(0.98);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 社交登录 */
.social-section {
  margin: 24px 0;
}

.social-divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.social-divider span {
  background: white;
  padding: 0 12px;
  color: #999;
  font-size: 12px;
  position: relative;
  z-index: 1;
}

.social-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
}

.social-buttons {
  display: flex;
  gap: 10px;
}

.social-btn {
  flex: 1;
  padding: 10px;
  background: #f8f8f8;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:active {
  background: #f0f0f0;
  transform: scale(0.98);
}

/* 底部 */
.card-footer {
  text-align: center;
  padding-top: 16px;
  font-size: 13px;
}

.card-footer a {
  color: #667eea;
  text-decoration: none;
}

.card-footer a:active {
  opacity: 0.8;
}

.divider {
  margin: 0 10px;
  color: #ddd;
}
</style>
