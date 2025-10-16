<script setup lang="ts">
import { reactive, ref } from 'vue'

interface SocialProvider { name: string; label: string; icon?: string }

interface Props {
  title?: string
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
  showLogo: false,
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
  <div class="login-tablet-simple">
    <div class="simple-container">
      <!-- Logo 插槽（简单版本） -->
      <div v-if="$slots.logo || showLogo" class="logo-area">
        <slot name="logo">
          <div class="simple-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="#667eea">
              <rect x="8" y="8" width="32" height="32" rx="8" opacity="0.1" />
              <rect x="16" y="16" width="16" height="16" rx="4" fill="#667eea" />
            </svg>
          </div>
        </slot>
      </div>

      <!-- 头部插槽（简化版） -->
      <slot name="header" :title="title">
        <h1 class="simple-title">
          {{ title }}
        </h1>
      </slot>

      <!-- 登录面板插槽（最简化） -->
      <slot
        name="loginPanel"
        :form="form"
        :loading="loading"
        :error="error"
        :handle-submit="handleSubmit"
      >
        <form class="simple-form" @submit.prevent="handleSubmit">
          <input
            v-model="form.username"
            type="text"
            placeholder="用户名"
            class="simple-input"
            required
          >
          <input
            v-model="form.password"
            type="password"
            placeholder="密码"
            class="simple-input"
            required
          >
          <button type="submit" class="simple-btn" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>
      </slot>

      <!-- 社交登录插槽（简化版） -->
      <div v-if="$slots.socialLogin || showSocialLogin" class="simple-social">
        <slot name="socialLogin" :providers="socialProviders">
          <div class="social-row">
            <button
              v-for="provider in socialProviders"
              :key="provider.name"
              class="social-icon-btn"
              :title="provider.label"
              @click="handleSocialLogin(provider)"
            >
              {{ provider.label[0] }}
            </button>
          </div>
        </slot>
      </div>

      <!-- 底部插槽（简单链接） -->
      <div class="simple-footer">
        <slot name="footer">
          <a href="#" @click.prevent="handleForgot">忘记密码</a>
          <span class="separator">·</span>
          <a href="#" @click.prevent="handleRegister">注册</a>
        </slot>
      </div>

      <!-- 额外内容插槽 -->
      <slot name="extra" />
    </div>
  </div>
</template>

<style scoped>
.login-tablet-simple {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  padding: 20px;
}

.simple-container {
  width: 100%;
  max-width: 420px;
  padding: 40px 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.08);
}

/* Logo */
.logo-area {
  text-align: center;
  margin-bottom: 24px;
}

.simple-logo {
  display: inline-block;
}

/* 标题 */
.simple-title {
  margin: 0 0 32px;
  font-size: 24px;
  font-weight: 500;
  text-align: center;
  color: #1a1a1a;
}

/* 表单 */
.simple-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.simple-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #f0f0f0;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.2s;
  box-sizing: border-box;
  background: #fafafa;
}

.simple-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
}

.simple-input::placeholder {
  color: #aaa;
}

.simple-btn {
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.simple-btn:hover:not(:disabled) {
  background: #5568d3;
  transform: translateY(-1px);
}

.simple-btn:active {
  transform: translateY(0);
}

.simple-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 社交登录 */
.simple-social {
  margin: 24px 0;
}

.social-row {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.social-icon-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 50%;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.social-icon-btn:hover {
  background: #667eea;
  border-color: #667eea;
  color: white;
  transform: scale(1.1);
}

/* 底部 */
.simple-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
}

.simple-footer a {
  color: #667eea;
  text-decoration: none;
}

.simple-footer a:hover {
  text-decoration: underline;
}

.separator {
  margin: 0 12px;
  color: #ccc;
}
</style>
