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
  subtitle: '请输入您的账号信息',
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
  <div class="login-tablet-default">
    <div class="container">
      <!-- Logo 插槽 -->
      <div v-if="$slots.logo || showLogo" class="logo-section">
        <slot name="logo">
          <div class="default-logo">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="#667eea">
              <circle cx="32" cy="32" r="28" opacity="0.1" />
              <path d="M32 16 L42 32 L32 48 L22 32 Z" fill="#667eea" />
            </svg>
          </div>
        </slot>
      </div>

      <!-- 头部插槽 -->
      <div class="header-section">
        <slot name="header" :title="title" :subtitle="subtitle">
          <h1>{{ title }}</h1>
          <p class="subtitle">
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
            <label for="username">用户名</label>
            <input 
              id="username"
              v-model="form.username" 
              type="text" 
              placeholder="请输入用户名或邮箱" 
              required 
            >
          </div>
          
          <div class="form-group">
            <label for="password">密码</label>
            <input 
              id="password"
              v-model="form.password" 
              type="password" 
              placeholder="请输入密码" 
              required 
            >
          </div>

          <div v-if="showRememberMe" class="form-options">
            <label class="remember-me">
              <input v-model="form.rememberMe" type="checkbox">
              <span>记住我</span>
            </label>
            <a href="#" class="forgot-link" @click.prevent="handleForgot">忘记密码？</a>
          </div>
          
          <button type="submit" class="btn-submit" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </slot>

      <!-- 社交登录插槽 -->
      <div v-if="$slots.socialLogin || showSocialLogin" class="social-section">
        <slot name="socialLogin" :providers="socialProviders">
          <div class="social-divider">
            <span>或使用以下方式登录</span>
          </div>
          <div class="social-buttons">
            <button
              v-for="provider in socialProviders"
              :key="provider.name"
              class="social-btn"
              @click="handleSocialLogin(provider)"
            >
              {{ provider.label }}
            </button>
          </div>
        </slot>
      </div>

      <!-- 底部插槽 -->
      <div class="footer-section">
        <slot name="footer">
          <p class="footer-text">
            还没有账号？ <a href="#" @click.prevent="handleRegister">立即注册</a>
          </p>
        </slot>
      </div>

      <!-- 额外内容插槽 -->
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.login-tablet-default {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 500px;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.default-logo {
  display: inline-block;
}

/* 头部 */
.header-section {
  text-align: center;
  margin-bottom: 32px;
}

.header-section h1 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  margin: 0;
  font-size: 15px;
  color: #666;
}

/* 表单 */
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.remember-me input[type="checkbox"] {
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* 按钮 */
.btn-submit {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 社交登录 */
.social-section {
  margin: 32px 0;
}

.social-divider {
  text-align: center;
  margin: 24px 0;
  position: relative;
}

.social-divider span {
  background: white;
  padding: 0 16px;
  color: #999;
  font-size: 14px;
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
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.social-btn {
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: #f5f7ff;
}

/* 底部 */
.footer-section {
  text-align: center;
  margin-top: 24px;
}

.footer-text {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.footer-text a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.footer-text a:hover {
  text-decoration: underline;
}
</style>
