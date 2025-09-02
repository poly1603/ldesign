<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

// Props定义
interface Props {
  title?: string
  subtitle?: string
  showRemember?: boolean
  showQuickLogin?: boolean
  showRegister?: boolean
  logoUrl?: string
  primaryColor?: string
  enableBiometric?: boolean
  showStatusBar?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '手机登录',
  subtitle: '随时随地，安全登录',
  showRemember: false,
  showQuickLogin: true,
  showRegister: true,
  logoUrl: '',
  primaryColor: '#667eea',
  enableBiometric: true,
  showStatusBar: true,
})

// 状态管理
const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)
const showPassword = ref(false)
const rippleActive = ref(false)
const currentTime = ref('')
const focusedField = ref('')
const keyboardVisible = ref(false)

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
}))

// 更新时间
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

let timeInterval: number

// 键盘检测
function detectKeyboard() {
  const initialHeight = window.innerHeight

  const handleResize = () => {
    const currentHeight = window.innerHeight
    keyboardVisible.value = currentHeight < initialHeight * 0.75
  }

  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}

// 事件处理
function handleInputFocus(field: string) {
  focusedField.value = field

  // 触觉反馈
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }

  // 滚动到输入框
  setTimeout(() => {
    const element = document.querySelector('.form-input:focus')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}

function handleInputBlur() {
  focusedField.value = ''
}

function togglePassword() {
  showPassword.value = !showPassword.value

  // 触觉反馈
  if ('vibrate' in navigator) {
    navigator.vibrate(10)
  }
}

async function handleSubmit() {
  loading.value = true
  rippleActive.value = true

  // 触觉反馈
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))

    console.log('移动端登录数据:', formData)
    alert(`登录成功！用户名: ${formData.username}`)

    // 成功震动
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }
  catch (error) {
    console.error('登录失败:', error)

    // 错误震动
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100])
    }

    alert('登录失败，请重试')
  }
  finally {
    loading.value = false
    setTimeout(() => {
      rippleActive.value = false
    }, 300)
  }
}

function handleBiometricLogin(type: string) {
  if ('vibrate' in navigator) {
    navigator.vibrate(30)
  }
  alert(`${type === 'fingerprint' ? '指纹' : '面容'}登录`)
}

function handleSmsLogin() {
  if ('vibrate' in navigator) {
    navigator.vibrate(30)
  }
  alert('短信登录功能')
}

function handleForgot() {
  alert('忘记密码功能')
}

function handleRegister() {
  if ('vibrate' in navigator) {
    navigator.vibrate(30)
  }
  alert('注册功能')
}

// 生命周期
onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)

  const cleanupKeyboard = detectKeyboard()

  // 防止页面缩放
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }

  return cleanupKeyboard
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="login-template-mobile" :style="cssVars">
    <!-- 模板标识横幅 -->
    <div class="template-banner">
      <div class="banner-content">
        <div class="template-info">
          <span class="template-name">移动端登录模板</span>
          <span class="template-meta">
            <span class="device-type">📱 Mobile</span>
            <span class="template-version">v1.0.0</span>
          </span>
        </div>
        <div class="template-category">
          Login
        </div>
      </div>
    </div>

    <!-- 状态栏 -->
    <div v-if="showStatusBar" class="status-bar">
      <slot name="status-bar">
        <div class="status-left">
          <span class="time">{{ currentTime }}</span>
        </div>
        <div class="status-center">
          <div class="notch" />
        </div>
        <div class="status-right">
          <span class="battery">🔋</span>
          <span class="signal">📶</span>
          <span class="wifi">📶</span>
        </div>
      </slot>
    </div>

    <div class="mobile-container">
      <!-- 头部区域 -->
      <div class="mobile-header">
        <slot name="header">
          <div class="header-content">
            <div v-if="logoUrl" class="logo-image">
              <img :src="logoUrl" :alt="title">
            </div>
            <div v-else class="app-icon">
              📱
            </div>
            <h1 class="app-title">
              {{ title }}
            </h1>
            <p class="app-subtitle">
              {{ subtitle }}
            </p>
          </div>
        </slot>
      </div>

      <!-- 主要内容区域 -->
      <div class="mobile-main">
        <!-- 快捷登录 -->
        <div v-if="showQuickLogin" class="quick-login">
          <slot name="quick-actions">
            <div class="quick-title">
              快速登录
            </div>
            <div class="quick-buttons">
              <button
                v-if="enableBiometric"
                class="quick-btn quick-btn--fingerprint"
                @click="handleBiometricLogin('fingerprint')"
              >
                <div class="quick-icon">
                  👆
                </div>
                <span>指纹</span>
              </button>
              <button
                v-if="enableBiometric"
                class="quick-btn quick-btn--face"
                @click="handleBiometricLogin('face')"
              >
                <div class="quick-icon">
                  😊
                </div>
                <span>面容</span>
              </button>
              <button class="quick-btn quick-btn--sms" @click="handleSmsLogin">
                <div class="quick-icon">
                  💬
                </div>
                <span>短信</span>
              </button>
            </div>
            <div class="quick-divider">
              <span>或使用账号密码</span>
            </div>
          </slot>
        </div>

        <!-- 登录表单 -->
        <form class="mobile-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <div class="input-wrapper" :class="{ focused: focusedField === 'username' }">
              <div class="input-icon">
                👤
              </div>
              <input
                v-model="formData.username"
                type="text"
                class="form-input"
                placeholder="手机号/邮箱"
                autocomplete="username"
                required
                :disabled="loading"
                @focus="handleInputFocus('username')"
                @blur="handleInputBlur"
              >
              <div class="input-line" />
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper" :class="{ focused: focusedField === 'password' }">
              <div class="input-icon">
                🔒
              </div>
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="密码"
                autocomplete="current-password"
                required
                :disabled="loading"
                @focus="handleInputFocus('password')"
                @blur="handleInputBlur"
              >
              <button
                type="button"
                class="password-toggle"
                :disabled="loading"
                @click="togglePassword"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
              <div class="input-line" />
            </div>
          </div>

          <div v-if="showRemember" class="form-options">
            <label class="mobile-checkbox">
              <input
                v-model="formData.remember"
                type="checkbox"
                class="checkbox-input"
                :disabled="loading"
              >
              <span class="checkbox-mark" />
              <span class="checkbox-text">记住登录状态</span>
            </label>
          </div>

          <button type="submit" class="mobile-button" :disabled="loading">
            <div class="button-content">
              <div v-if="loading" class="loading-spinner" />
              <span>{{ loading ? '登录中...' : '立即登录' }}</span>
            </div>
            <div class="button-ripple" :class="{ active: rippleActive }" />
          </button>

          <div class="form-links">
            <a href="#" class="form-link" @click.prevent="handleForgot">忘记密码？</a>
            <a href="#" class="form-link" @click.prevent="handleSmsLogin">短信登录</a>
          </div>
        </form>

        <!-- 注册区域 -->
        <div v-if="showRegister" class="register-section">
          <p class="register-text">
            还没有账户？
          </p>
          <button class="register-button" @click="handleRegister">
            免费注册
          </button>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="mobile-footer">
        <slot name="footer">
          <div class="footer-content">
            <div class="footer-links">
              <a href="#" class="footer-link">用户协议</a>
              <span class="footer-separator">|</span>
              <a href="#" class="footer-link">隐私政策</a>
            </div>
            <p class="copyright">
              © 2024 ldesign
            </p>
          </div>
        </slot>
      </div>

      <!-- 安全指示器 -->
      <div class="security-indicator">
        <div class="security-icon">
          🔐
        </div>
        <span class="security-text">安全连接</span>
      </div>
    </div>

    <!-- 键盘占位符 -->
    <div class="keyboard-spacer" :class="{ active: keyboardVisible }" />
  </div>
</template>

<style lang="less" scoped>
// 模板标识横幅样式
.template-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: linear-gradient(135deg, var(--ldesign-brand-color, rgba(46, 204, 113, 0.95)), var(--ldesign-brand-color-8, rgba(52, 152, 219, 0.95)));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px var(--ldesign-shadow-1, rgba(0, 0, 0, 0.1));
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.template-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--ldesign-bg-color-page, white);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.template-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
}

.device-type, .template-version {
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.template-category {
  background: rgba(255, 255, 255, 0.2);
  color: var(--ldesign-bg-color-page, white);
  padding: 0.25rem 0.5rem;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-template-mobile {
  min-height: 100vh;
  background: linear-gradient(180deg, var(--ldesign-brand-color, #667eea) 0%, var(--ldesign-brand-color-8, #764ba2) 100%);
  position: relative;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  // 移动端专用装饰背景
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.06) 0%, transparent 50%);
    pointer-events: none;
  }

  // 移动端装饰元素
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image:
      linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%),
      linear-gradient(-45deg, transparent 40%, rgba(255, 255, 255, 0.02) 50%, transparent 60%);
    background-size: 60px 60px, 80px 80px;
    animation: mobile-pattern-shift 20s linear infinite;
    pointer-events: none;
  }
}

// 状态栏
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.1);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
  position: relative;

  .status-left .time {
    font-family: monospace;
  }

  .status-center {
    .notch {
      width: 120px;
      height: 20px;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 0 0 12px 12px;
      position: relative;
    }
  }

  .status-right {
    display: flex;
    gap: 0.25rem;
    font-size: 0.7rem;
  }
}

// 主容器
.mobile-container {
  max-width: 375px;
  margin: 0 auto;
  min-height: calc(100vh - 40px);
  background: white;
  position: relative;
  display: flex;
  flex-direction: column;

  // 移动端专用装饰元素
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(180deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
    pointer-events: none;
    z-index: 1;
  }

  // 手势提示动画
  .gesture-hints {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 2;

    .swipe-indicator {
      position: absolute;
      top: 50%;
      right: 20px;
      width: 30px;
      height: 2px;
      background: rgba(102, 126, 234, 0.3);
      border-radius: 1px;
      animation: swipe-hint 3s ease-in-out infinite;

      &::after {
        content: '';
        position: absolute;
        right: -8px;
        top: -3px;
        width: 0;
        height: 0;
        border-left: 8px solid rgba(102, 126, 234, 0.3);
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }
    }

    .tap-indicator {
      position: absolute;
      width: 40px;
      height: 40px;
      border: 2px solid rgba(102, 126, 234, 0.2);
      border-radius: 50%;
      animation: tap-pulse 4s ease-in-out infinite;

      &.tap-1 {
        top: 30%;
        left: 30px;
        animation-delay: 0s;
      }

      &.tap-2 {
        bottom: 25%;
        right: 40px;
        animation-delay: -2s;
      }
    }
  }
}

// 头部
.mobile-header {
  background: linear-gradient(180deg, var(--ldesign-brand-color, #667eea) 0%, var(--ldesign-brand-color-8, #764ba2) 100%);
  color: var(--ldesign-bg-color-page, white);
  padding: 2rem 1.5rem;
  text-align: center;

  .header-content {
    .logo-image {
      margin-bottom: 1rem;

      img {
        height: 60px;
        width: auto;
      }
    }

    .app-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      animation: bounce 2s ease-in-out infinite;
    }

    .app-title {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    .app-subtitle {
      opacity: 0.9;
      font-size: 1rem;
    }
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

// 主要内容
.mobile-main {
  flex: 1;
  padding: 2rem 1.5rem;
}

// 快捷登录
.quick-login {
  margin-bottom: 2rem;

  .quick-title {
    text-align: center;
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .quick-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .quick-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1.5rem 1rem;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    color: #495057;

    &:active {
      transform: scale(0.95);
      background: #e9ecef;
    }

    .quick-icon {
      font-size: 2rem;
    }

    &--fingerprint:active {
      border-color: #28a745;
      color: #28a745;
    }

    &--face:active {
      border-color: #007bff;
      color: #007bff;
    }

    &--sms:active {
      border-color: #ffc107;
      color: #ffc107;
    }
  }

  .quick-divider {
    text-align: center;
    position: relative;
    color: #6c757d;
    font-size: 0.9rem;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
      z-index: 1;
    }

    span {
      background: white;
      padding: 0 1rem;
      position: relative;
      z-index: 2;
    }
  }
}

// 表单
.mobile-form {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    background: #f8f9fa;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    padding: 0 1rem;
    transition: all 0.3s ease;

    &.focused {
      border-color: var(--primary-color, #667eea);
      background: white;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input-icon {
      font-size: 1.2rem;
      margin-right: 0.75rem;
      opacity: 0.6;
    }

    .form-input {
      flex: 1;
      border: none;
      background: transparent;
      padding: 1.2rem 0;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: #adb5bd;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .password-toggle {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      opacity: 0.6;
      padding: 0.5rem;
      margin: -0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:active:not(:disabled) {
        background: rgba(102, 126, 234, 0.1);
        opacity: 1;
      }

      &:disabled {
        cursor: not-allowed;
      }
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: var(--primary-color, #667eea);
      transition: width 0.3s ease;
    }

    &.focused .input-line {
      width: 100%;
    }
  }

  .form-options {
    margin-bottom: 2rem;

    .mobile-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.9rem;
      color: #6c757d;

      .checkbox-input {
        display: none;
      }

      .checkbox-mark {
        width: 20px;
        height: 20px;
        border: 2px solid #e9ecef;
        border-radius: 6px;
        margin-right: 0.75rem;
        position: relative;
        transition: all 0.3s ease;

        &::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(0);
          color: white;
          font-size: 12px;
          font-weight: bold;
          transition: transform 0.2s ease;
        }
      }

      .checkbox-input:checked + .checkbox-mark {
        background: var(--primary-color, #667eea);
        border-color: var(--primary-color, #667eea);

        &::after {
          transform: translate(-50%, -50%) scale(1);
        }
      }
    }
  }

  .mobile-button {
    width: 100%;
    position: relative;
    background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1.2rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;

    &:active:not(:disabled) {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .button-content {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .button-ripple {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: all 0.3s ease;

      &.active {
        width: 300px;
        height: 300px;
      }
    }
  }

  .form-links {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2rem;

    .form-link {
      color: var(--primary-color, #667eea);
      text-decoration: none;
      font-size: 0.9rem;
      padding: 0.5rem;
      margin: -0.5rem;
      border-radius: 8px;
      transition: all 0.3s ease;

      &:active {
        color: #5a6fd8;
        background: rgba(102, 126, 234, 0.1);
      }
    }
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 注册区域
.register-section {
  text-align: center;
  padding: 2rem 0;
  border-top: 1px solid #e9ecef;

  .register-text {
    color: #6c757d;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .register-button {
    background: transparent;
    color: var(--primary-color, #667eea);
    border: 2px solid var(--primary-color, #667eea);
    padding: 0.75rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background: var(--primary-color, #667eea);
      color: white;
      transform: scale(0.95);
    }
  }
}

// 底部
.mobile-footer {
  padding: 1.5rem;
  background: #f8f9fa;
  text-align: center;
  margin-top: auto;

  .footer-content {
    .footer-links {
      margin-bottom: 0.5rem;
      font-size: 0.8rem;

      .footer-link {
        color: #6c757d;
        text-decoration: none;
      }

      .footer-separator {
        margin: 0 0.5rem;
        color: #adb5bd;
      }
    }

    .copyright {
      color: #adb5bd;
      font-size: 0.7rem;
    }
  }
}

// 安全指示器
.security-indicator {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(40, 167, 69, 0.9);
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  backdrop-filter: blur(10px);
  z-index: 1000;

  .security-icon {
    font-size: 0.8rem;
  }
}

// 键盘占位符
.keyboard-spacer {
  height: 0;
  transition: height 0.3s ease;

  &.active {
    height: 300px;
  }
}

// 小屏幕适配
@media (max-height: 600px) {
  .mobile-header {
    padding: 1rem 1.5rem;

    .app-icon {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    .app-title {
      font-size: 1.5rem;
    }
  }

  .mobile-main {
    padding: 1rem 1.5rem;
  }

  .quick-login {
    margin-bottom: 1rem;
  }
}

// 触摸设备优化
// 移动端专用动画
@keyframes mobile-pattern-shift {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 60px 60px, -80px -80px;
  }
}

@keyframes swipe-hint {
  0%, 100% {
    opacity: 0;
    transform: translateX(0);
  }
  50% {
    opacity: 1;
    transform: translateX(10px);
  }
}

@keyframes tap-pulse {
  0%, 100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

// 触摸设备优化
@media (hover: none) and (pointer: coarse) {
  .quick-btn:hover,
  .form-link:hover,
  .register-button:hover {
    transform: none;
    background: initial;
  }

  // 增强触摸反馈
  .mobile-button:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .form-input:focus {
    transform: scale(1.02);
  }

  .quick-btn:active {
    transform: scale(0.95);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}
</style>
