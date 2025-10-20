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
  subtitle: 'LDesign 模板系统',
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
  forgotPassword: []
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

const handleForgotPassword = () => {
  emit('forgotPassword')
}

const handleSocialLogin = (provider: SocialProvider) => {
  emit('socialLogin', provider)
}
</script>

<template>
  <div class="login-desktop-default">
    <div class="login-container">
      <!-- Logo 插槽 -->
      <div v-if="$slots.logo || showLogo" class="login-logo">
        <slot name="logo">
          <div class="default-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor">
              <circle cx="24" cy="24" r="20" opacity="0.1" />
              <path d="M24 12 L32 24 L24 36 L16 24 Z" fill="currentColor" />
            </svg>
          </div>
        </slot>
      </div>

      <!-- 头部插槽 -->
      <div class="login-header">
        <slot name="header" :title="title" :subtitle="subtitle">
          <h1>{{ title }}</h1>
          <p class="subtitle">
            {{ subtitle }}
          </p>
        </slot>
      </div>

      <!-- 登录面板插槽 - 核心插槽 -->
      <slot name="loginPanel" :form="form" :loading="loading" :error="error" :handle-submit="handleSubmit">
        <!-- 默认表单 -->
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username">用户名</label>
            <input id="username" v-model="form.username" type="text" placeholder="请输入用户名" required>
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input id="password" v-model="form.password" type="password" placeholder="请输入密码" required>
          </div>

          <div v-if="showRememberMe" class="form-group">
            <label class="checkbox-label">
              <input v-model="form.rememberMe" type="checkbox">
              <span>记住我</span>
            </label>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-primary" :disabled="loading">
              {{ loading ? '登录中...' : '登录' }}
            </button>
          </div>
        </form>
      </slot>

      <!-- 社交登录插槽 -->
      <div v-if="$slots.socialLogin || showSocialLogin" class="social-section">
        <slot name="socialLogin">
          <div class="social-divider">
            <span>或</span>
          </div>
          <div class="social-buttons">
            <button
              v-for="provider in socialProviders" :key="provider.name" class="social-btn"
              @click="handleSocialLogin(provider)"
            >
              {{ provider.label }}
            </button>
          </div>
        </slot>
      </div>

      <!-- 底部插槽 -->
      <div class="login-footer">
        <slot name="footer">
          <p>还没有账号？ <a href="#" @click.prevent="handleRegister">立即注册</a></p>
          <p><a href="#" @click.prevent="handleForgotPassword">忘记密码？</a></p>
        </slot>
      </div>

      <!-- 额外内容插槽 -->
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.login-desktop-default {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 24px;
}

.login-header h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  margin: 0;
  font-size: 14px;
  color: #666;
}

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
  padding: 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-actions {
  margin-top: 24px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background: #667eea;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #5568d3;
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.login-footer a {
  color: #667eea;
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

/* Logo 样式 */
.login-logo {
  text-align: center;
  margin-bottom: 8px;
}

.default-logo {
  display: inline-block;
  color: #667eea;
}

/* 复选框样式 */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

/* 社交登录样式 */
.social-section {
  margin-top: 24px;
}

.social-divider {
  position: relative;
  text-align: center;
  margin: 20px 0;
}

.social-divider span {
  background: white;
  padding: 0 16px;
  color: #999;
  font-size: 13px;
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
  gap: 12px;
  margin-top: 16px;
}

.social-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 4px;
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

/* 加载状态 */
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
