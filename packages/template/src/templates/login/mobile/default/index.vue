<script setup lang="ts">
import { reactive, ref } from 'vue'

interface SocialProvider { name: string; label: string; icon?: string }

interface Props {
  title?: string
  subtitle?: string
  showLogo?: boolean
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
  title: '登录',
  subtitle: '',
  showLogo: true,
  showSocialLogin: false,
  socialProviders: () => [],
  loading: false,
  error: null,
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string }]
  register: []
  forgot: []
  socialLogin: [provider: SocialProvider]
}>()

const form = reactive({
  username: '',
  password: '',
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
  <div class="login-mobile-default">
    <!-- Logo 插槽 -->
    <div v-if="$slots.logo || showLogo" class="logo-section">
      <slot name="logo">
        <div class="default-logo">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="white">
            <circle cx="30" cy="30" r="25" opacity="0.2" />
            <path d="M30 15 L40 30 L30 45 L20 30 Z" fill="white" />
          </svg>
        </div>
      </slot>
    </div>

    <!-- 头部插槽 -->
    <div class="login-header">
      <slot name="header" :title="title">
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
          <input
            v-model="form.username"
            type="text"
            placeholder="手机号/用户名"
            required
          >
        </div>

        <div class="form-group">
          <input
            v-model="form.password"
            type="password"
            placeholder="密码"
            required
          >
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
          <span>其他登录方式</span>
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
    <div class="login-footer">
      <slot name="footer">
        <a href="#" @click.prevent="handleRegister">注册账号</a>
        <span class="divider">|</span>
        <a href="#" @click.prevent="handleForgot">忘记密码</a>
      </slot>
    </div>

    <!-- 额外内容插槽 -->
    <slot name="extra" />
  </div>
</template>

<style scoped>
.login-mobile-default {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 60px;
  padding-top: 40px;
}

.login-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
  color: white;
}

.login-form {
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input {
  width: 100%;
  padding: 16px;
  font-size: 16px;
  color: #333;
  background: white;
  border: none;
  border-radius: 8px;
  box-sizing: border-box;
}

.form-group input::placeholder {
  color: #999;
}

.btn-login {
  width: 100%;
  padding: 16px;
  margin-top: 24px;
  font-size: 18px;
  font-weight: 500;
  color: #667eea;
  background: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-login:active {
  transform: scale(0.98);
}

.login-footer {
  text-align: center;
  font-size: 14px;
  color: white;
}

.login-footer a {
  color: white;
  text-decoration: none;
}

.divider {
  margin: 0 12px;
}

/* Logo 样式 */
.logo-section {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 40px;
}

.default-logo {
  display: inline-block;
}

/* 副标题 */
.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 社交登录 */
.social-section {
  margin: 30px 0;
}

.social-divider {
  text-align: center;
  margin: 20px 0;
  position: relative;
}

.social-divider span {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0 16px;
  color: white;
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
  background: rgba(255, 255, 255, 0.3);
}

.social-buttons {
  display: flex;
  gap: 10px;
}

.social-btn {
  flex: 1;
  padding: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.social-btn:active {
  background: rgba(255, 255, 255, 0.3);
}

/* 加载状态 */
.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
