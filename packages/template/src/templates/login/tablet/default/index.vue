<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

// Props定义
interface Props {
  title?: string
  subtitle?: string
  showRemember?: boolean
  showRegister?: boolean
  showForgot?: boolean
  logoUrl?: string
  backgroundImage?: string
  primaryColor?: string
  enableLandscapeMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '平板登录',
  subtitle: '在平板上享受更好的体验',
  showRemember: true,
  showRegister: true,
  showForgot: true,
  logoUrl: '',
  backgroundImage: '',
  primaryColor: '#667eea',
  enableLandscapeMode: true,
})

// 状态管理
const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)
const showPassword = ref(false)
const isLandscape = ref(false)

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
}))

const backgroundStyle = computed(() => {
  if (props.backgroundImage) {
    return {
      backgroundImage: `url(${props.backgroundImage})`,
    }
  }
  return {}
})

// 检测屏幕方向
function checkOrientation() {
  isLandscape.value = window.innerWidth > window.innerHeight
}

// 处理输入框焦点（平板键盘适配）
function handleInputFocus() {
  // 平板键盘弹出时的处理
  if (window.innerHeight < 600) {
    document.body.style.height = '100vh'
  }
}

function handleInputBlur() {
  // 键盘收起时的处理
  document.body.style.height = 'auto'
}

// 事件处理
async function handleSubmit() {
  loading.value = true

  try {
    // 触觉反馈（如果支持）
    if ('vibrate' in navigator) {
      navigator.vibrate(50)
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('平板登录数据:', formData)
    alert(`登录成功！用户名: ${formData.username}`)
  }
  catch (error) {
    console.error('登录失败:', error)

    // 错误震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }

    alert('登录失败，请重试')
  }
  finally {
    loading.value = false
  }
}

function handleForgot() {
  alert('忘记密码功能')
}

function handleRegister() {
  alert('注册功能')
}

// 生命周期
onMounted(() => {
  checkOrientation()
  window.addEventListener('resize', checkOrientation)
  window.addEventListener('orientationchange', checkOrientation)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkOrientation)
  window.removeEventListener('orientationchange', checkOrientation)
  document.body.style.height = 'auto'
})
</script>

<template>
  <div class="login-template-tablet" :style="cssVars" :class="{ landscape: isLandscape }">
    <!-- 模板标识横幅 -->
    <div class="template-banner">
      <div class="banner-content">
        <div class="template-info">
          <span class="template-name">平板端登录模板</span>
          <span class="template-meta">
            <span class="device-type">📱 Tablet</span>
            <span class="template-version">v1.0.0</span>
          </span>
        </div>
        <div class="template-category">
          Login
        </div>
      </div>
    </div>

    <!-- 平板优化背景 -->
    <div class="tablet-background" :style="backgroundStyle">
      <div class="background-overlay" />

      <!-- 平板专用装饰元素 -->
      <div class="tablet-decorations">
        <div class="decoration-circle circle-1" />
        <div class="decoration-circle circle-2" />
        <div class="decoration-wave wave-1" />
        <div class="decoration-wave wave-2" />
        <div class="decoration-grid" />
      </div>

      <!-- 触摸友好的视觉提示 -->
      <div class="touch-indicators">
        <div class="touch-ripple ripple-1" />
        <div class="touch-ripple ripple-2" />
        <div class="touch-ripple ripple-3" />
      </div>
    </div>

    <div class="tablet-container">
      <!-- 侧边栏（横屏模式） -->
      <div v-if="isLandscape && enableLandscapeMode" class="sidebar-section">
        <slot name="sidebar">
          <div class="sidebar-content">
            <div class="brand-section">
              <div class="brand-icon">
                📱
              </div>
              <h2 class="brand-title">
                {{ title }}
              </h2>
              <p class="brand-subtitle">
                {{ subtitle }}
              </p>
            </div>

            <div class="feature-list">
              <div class="feature-item">
                <div class="feature-icon">
                  ✨
                </div>
                <div class="feature-text">
                  优雅的设计
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  🚀
                </div>
                <div class="feature-text">
                  快速响应
                </div>
              </div>
              <div class="feature-item">
                <div class="feature-icon">
                  🔒
                </div>
                <div class="feature-text">
                  安全可靠
                </div>
              </div>
            </div>
          </div>
        </slot>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-section">
        <div class="login-card">
          <!-- 头部 -->
          <div class="card-header">
            <slot name="header">
              <div class="logo-section">
                <div v-if="logoUrl" class="logo-image">
                  <img :src="logoUrl" :alt="title">
                </div>
                <div v-else class="logo-icon">
                  🔐
                </div>

                <!-- 竖屏模式显示标题 -->
                <div v-if="!isLandscape || !enableLandscapeMode" class="title-section">
                  <h1 class="login-title">
                    {{ title }}
                  </h1>
                  <p class="login-subtitle">
                    {{ subtitle }}
                  </p>
                </div>
              </div>
            </slot>
          </div>

          <!-- 登录表单 -->
          <form class="tablet-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="username" class="form-label">用户名</label>
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <input
                  id="username"
                  v-model="formData.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户名或邮箱"
                  required
                  :disabled="loading"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="password" class="form-label">密码</label>
              <div class="input-wrapper">
                <div class="input-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入密码"
                  required
                  :disabled="loading"
                  @focus="handleInputFocus"
                  @blur="handleInputBlur"
                >
                <button
                  type="button"
                  class="password-toggle"
                  :disabled="loading"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="showPassword" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label v-if="showRemember" class="tablet-checkbox">
                <input
                  v-model="formData.remember"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="loading"
                >
                <span class="checkbox-custom" />
                <span class="checkbox-text">记住我</span>
              </label>

              <a v-if="showForgot" href="#" class="forgot-link" @click.prevent="handleForgot">
                忘记密码？
              </a>
            </div>

            <button type="submit" class="tablet-button" :disabled="loading">
              <span v-if="loading" class="loading-spinner" />
              <span>{{ loading ? '登录中...' : '登录' }}</span>
            </button>

            <div v-if="showRegister" class="register-section">
              <p class="register-text">
                还没有账户？
                <a href="#" class="register-link" @click.prevent="handleRegister">
                  立即注册
                </a>
              </p>
            </div>

            <slot name="extra" />
          </form>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="tablet-footer">
      <slot name="footer">
        <p class="footer-text">
          &copy; 2024 ldesign. 专为平板优化
        </p>
      </slot>
    </div>
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
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.95), rgba(142, 68, 173, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.template-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.template-meta {
  display: flex;
  gap: 0.8rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.9);
}

.device-type, .template-version {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.template-category {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 18px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.login-template-tablet {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 背景
.tablet-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, #764ba2 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  .background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  // 平板专用装饰元素
  .tablet-decorations {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .decoration-circle {
      position: absolute;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      animation: float-decoration 12s ease-in-out infinite;

      &.circle-1 {
        width: 200px;
        height: 200px;
        top: 15%;
        right: 10%;
        animation-delay: 0s;
      }

      &.circle-2 {
        width: 150px;
        height: 150px;
        bottom: 20%;
        left: 15%;
        animation-delay: -6s;
      }
    }

    .decoration-wave {
      position: absolute;
      width: 300px;
      height: 100px;
      opacity: 0.1;

      &.wave-1 {
        top: 30%;
        left: -50px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100'%3E%3Cpath d='M0,50 Q75,10 150,50 T300,50' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E");
        animation: wave-flow 8s ease-in-out infinite;
      }

      &.wave-2 {
        bottom: 25%;
        right: -50px;
        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 100'%3E%3Cpath d='M0,50 Q75,90 150,50 T300,50' stroke='white' stroke-width='2' fill='none'/%3E%3C/svg%3E");
        animation: wave-flow 10s ease-in-out infinite reverse;
      }
    }

    .decoration-grid {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
      background-size: 50px 50px;
      animation: grid-shift 15s linear infinite;
    }
  }

  // 触摸友好的视觉提示
  .touch-indicators {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .touch-ripple {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
      animation: touch-pulse 6s ease-in-out infinite;

      &.ripple-1 {
        width: 80px;
        height: 80px;
        top: 25%;
        left: 20%;
        animation-delay: 0s;
      }

      &.ripple-2 {
        width: 60px;
        height: 60px;
        top: 60%;
        right: 25%;
        animation-delay: -2s;
      }

      &.ripple-3 {
        width: 100px;
        height: 100px;
        bottom: 30%;
        left: 60%;
        animation-delay: -4s;
      }
    }
  }
}

// 主容器
.tablet-container {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  padding: 2rem;
  gap: 2rem;
}

// 侧边栏（横屏模式）
.sidebar-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .sidebar-content {
    color: white;
    text-align: center;

    .brand-section {
      margin-bottom: 3rem;

      .brand-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: float 3s ease-in-out infinite;
      }

      .brand-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 0.5rem;
      }

      .brand-subtitle {
        font-size: 1.1rem;
        opacity: 0.9;
      }
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);

        .feature-icon {
          font-size: 1.5rem;
        }

        .feature-text {
          font-size: 1rem;
          font-weight: 500;
        }
      }
    }
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

// 主要内容区域
.main-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

// 竖屏模式调整
.login-template-tablet:not(.landscape) {
  .tablet-container {
    flex-direction: column;
    justify-content: center;
  }

  .main-section {
    max-width: 600px;
  }
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 3rem;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// 卡片头部
.card-header {
  text-align: center;
  margin-bottom: 2.5rem;

  .logo-section {
    .logo-image {
      margin-bottom: 1.5rem;

      img {
        height: 70px;
        width: auto;
      }
    }

    .logo-icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      color: var(--primary-color, #667eea);
    }

    .title-section {
      .login-title {
        font-size: 2.2rem;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 0.5rem;
      }

      .login-subtitle {
        color: #7f8c8d;
        font-size: 1rem;
      }
    }
  }
}

// 平板表单
.tablet-form {
  .form-group {
    margin-bottom: 2rem;
  }

  .form-label {
    display: block;
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .input-icon {
      position: absolute;
      left: 1.25rem;
      width: 22px;
      height: 22px;
      color: #adb5bd;
      z-index: 2;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .form-input {
      width: 100%;
      padding: 1.25rem 1.25rem 1.25rem 3.5rem;
      border: 2px solid #e9ecef;
      border-radius: 12px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
      background: white;

      &:focus {
        outline: none;
        border-color: var(--primary-color, #667eea);
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
      }

      &:disabled {
        background: #f8f9fa;
        cursor: not-allowed;
      }

      &::placeholder {
        color: #adb5bd;
      }
    }

    .password-toggle {
      position: absolute;
      right: 1.25rem;
      background: none;
      border: none;
      width: 22px;
      height: 22px;
      color: #adb5bd;
      cursor: pointer;
      transition: color 0.3s ease;
      z-index: 2;
      padding: 0.5rem;
      margin: -0.5rem;
      border-radius: 8px;

      &:hover:not(:disabled) {
        color: var(--primary-color, #667eea);
        background: rgba(102, 126, 234, 0.1);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      svg {
        width: 100%;
        height: 100%;
      }
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;
  }

  .tablet-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 1rem;

    .checkbox-input {
      display: none;
    }

    .checkbox-custom {
      width: 22px;
      height: 22px;
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
        font-size: 14px;
        font-weight: bold;
        transition: transform 0.2s ease;
      }
    }

    .checkbox-input:checked + .checkbox-custom {
      background: var(--primary-color, #667eea);
      border-color: var(--primary-color, #667eea);

      &::after {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .checkbox-text {
      color: #6c757d;
    }
  }

  .forgot-link {
    color: var(--primary-color, #667eea);
    text-decoration: none;
    font-size: 1rem;
    transition: color 0.3s ease;
    padding: 0.5rem;
    margin: -0.5rem;
    border-radius: 8px;

    &:hover {
      color: #5a6fd8;
      background: rgba(102, 126, 234, 0.1);
    }
  }

  .tablet-button {
    width: 100%;
    background: linear-gradient(135deg, var(--primary-color, #667eea) 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 1.25rem;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .register-section {
    text-align: center;
    margin-top: 2.5rem;
    padding-top: 2.5rem;
    border-top: 1px solid #e9ecef;

    .register-text {
      color: #6c757d;
      font-size: 1rem;
    }

    .register-link {
      color: var(--primary-color, #667eea);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;
      padding: 0.5rem;
      margin: -0.5rem;
      border-radius: 8px;

      &:hover {
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

// 底部
.tablet-footer {
  position: relative;
  z-index: 10;
  text-align: center;
  padding: 1.5rem;

  .footer-text {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
  }
}

// 响应式设计
@media (max-width: 1024px) and (orientation: portrait) {
  .tablet-container {
    padding: 1.5rem;
  }

  .login-card {
    padding: 2.5rem;
  }
}

@media (max-width: 768px) {
  .tablet-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
    border-radius: 16px;
  }

  .card-header .logo-section .title-section .login-title {
    font-size: 1.8rem;
  }
}

// 触摸设备优化
@media (hover: none) and (pointer: coarse) {
  .tablet-button:hover,
  .password-toggle:hover,
  .forgot-link:hover,
  .register-link:hover {
    transform: none;
    background: initial;
  }

  .tablet-button:active {
    transform: scale(0.98);
  }
}

// 平板专用动画
@keyframes float-decoration {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.2;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.4;
  }
}

@keyframes wave-flow {
  0%, 100% {
    transform: translateX(0px) scaleX(1);
  }
  50% {
    transform: translateX(20px) scaleX(1.1);
  }
}

@keyframes grid-shift {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

@keyframes touch-pulse {
  0%, 100% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}
</style>
