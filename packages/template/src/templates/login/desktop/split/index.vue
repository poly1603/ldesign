<script setup lang="ts">
import { reactive, ref } from 'vue'

interface SocialProvider { name: string; label: string; icon?: string }

interface Props {
  title?: string
  subtitle?: string
  brandName?: string
  slogan?: string
  bgImage?: string
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
  title: '欢迎回来',
  subtitle: '请输入您的账号信息',
  brandName: 'LDesign',
  slogan: '专业的模板管理系统',
  bgImage: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800',
  showLogo: false,
  showSocialLogin: false,
  socialProviders: () => [],
  loading: false,
  error: null,
})

const emit = defineEmits<{
  submit: [data: { username: string; password: string; remember: boolean }]
  register: []
  forgot: []
  socialLogin: [provider: SocialProvider]
}>()

const form = reactive({
  username: '',
  password: '',
  remember: false,
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
  <div class="login-desktop-split">
    <!-- 左侧面板 -->
    <div class="left-panel" :style="{ backgroundImage: `url(${bgImage})` }">
      <slot name="leftPanel" :brand="brandName" :slogan="slogan">
        <div class="overlay">
          <slot name="brand">
            <h1 class="brand">
              {{ brandName }}
            </h1>
            <p class="slogan">
              {{ slogan }}
            </p>
          </slot>
          
          <!-- 左侧额外内容 -->
          <slot name="leftExtra" />
        </div>
      </slot>
    </div>

    <!-- 右侧登录区域 -->
    <div class="right-panel">
      <div class="login-box">
        <!-- Logo 插槽 -->
        <div v-if="$slots.logo || showLogo" class="logo-area">
          <slot name="logo">
            <div class="default-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor">
                <circle cx="20" cy="20" r="18" opacity="0.1" />
                <path d="M20 10 L28 20 L20 30 L12 20 Z" fill="currentColor" />
              </svg>
            </div>
          </slot>
        </div>

        <!-- 标题区域 -->
        <slot name="header" :title="title" :subtitle="subtitle">
          <h2>{{ title }}</h2>
          <p class="subtitle">
            {{ subtitle }}
          </p>
        </slot>

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
                placeholder="用户名或邮箱"
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

            <div class="form-options">
              <label class="checkbox">
                <input v-model="form.remember" type="checkbox">
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
            <div class="divider">
              <span>或</span>
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
        <div class="footer-text">
          <slot name="footer">
            还没有账号？
            <a href="#" @click.prevent="handleRegister">立即注册</a>
          </slot>
        </div>

        <!-- 额外内容 -->
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-desktop-split {
  display: flex;
  height: 100vh;
}

.left-panel {
  flex: 1;
  background-size: cover;
  background-position: center;
  position: relative;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 40px;
}

.brand {
  font-size: 48px;
  font-weight: 700;
  margin: 0 0 16px;
}

.slogan {
  font-size: 20px;
  margin: 0;
  opacity: 0.9;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  padding: 40px;
}

.login-box {
  width: 100%;
  max-width: 400px;
}

.login-box h2 {
  margin: 0 0 8px;
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.subtitle {
  margin: 0 0 32px;
  font-size: 14px;
  color: #666;
}

.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group input[type="text"],
.form-group input[type="password"] {
  width: 100%;
  padding: 14px;
  font-size: 14px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 14px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #666;
}

.checkbox input {
  cursor: pointer;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

.btn-submit {
  width: 100%;
  padding: 14px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-submit:hover {
  transform: translateY(-2px);
}

.btn-submit:active {
  transform: translateY(0);
}

.footer-text {
  text-align: center;
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

/* Logo 区域 */
.logo-area {
  text-align: center;
  margin-bottom: 24px;
}

.default-logo {
  display: inline-block;
  color: #667eea;
}

/* 社交登录 */
.social-section {
  margin: 24px 0;
}

.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider span {
  background: white;
  padding: 0 16px;
  color: #999;
  font-size: 13px;
  position: relative;
  z-index: 1;
}

.divider::before {
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
}

.social-btn {
  flex: 1;
  padding: 10px;
  border: 1px solid #e0e0e0;
  background: white;
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

/* 加载状态 */
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #ccc;
}
</style>
