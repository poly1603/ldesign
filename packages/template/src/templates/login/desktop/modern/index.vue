<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

// Props定义
interface Props {
  title?: string
  subtitle?: string
  showRemember?: boolean
  showSocialLogin?: boolean
  showRegister?: boolean
  logoUrl?: string
  backgroundImage?: string
  primaryColor?: string
  secondaryColor?: string
  enableParticles?: boolean
  debugInfo?: {
    deviceType?: string
    templateName?: string
    isResponsive?: boolean
    screenWidth?: number
    renderMode?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: '现代登录',
  subtitle: '体验现代化的登录方式',
  showRemember: true,
  showSocialLogin: true,
  showRegister: true,
  logoUrl: '',
  backgroundImage: '',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  enableParticles: true,
})

// 状态管理
const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

const loading = ref(false)
const showPassword = ref(false)
const focusedField = ref('')
const isFormActive = ref(false)

// 调试信息相关
const showDebugInfo = ref(true) // 开发环境下默认显示调试信息
const renderTime = ref('')

// 设备类型标签映射
const deviceTypeLabels = {
  desktop: '🖥️ 桌面端',
  tablet: '📱 平板端',
  mobile: '📱 移动端',
}

// 调试信息计算属性
const currentDeviceType = computed(() => {
  return props.debugInfo?.deviceType || 'desktop'
})

const currentTemplateName = computed(() => {
  return props.debugInfo?.templateName || 'modern'
})

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
}))

// 粒子样式生成
function getParticleStyle(index: number) {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const animationDelay = Math.random() * 20
  const animationDuration = Math.random() * 10 + 10

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`,
  }
}

// 事件处理
async function handleSubmit() {
  loading.value = true

  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('现代登录数据:', formData)
    alert(`登录成功！欢迎 ${formData.username}`)
  }
  catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  }
  finally {
    loading.value = false
  }
}

function handleSocialLogin(provider: string) {
  alert(`${provider} 社交登录`)
}

function handleForgot() {
  alert('忘记密码功能')
}

function handleRegister() {
  alert('注册功能')
}

// 生命周期
onMounted(() => {
  renderTime.value = new Date().toLocaleTimeString()
  console.log(`模板渲染完成: ${currentTemplateName.value} (${currentDeviceType.value})`)

  setTimeout(() => {
    isFormActive.value = true
  }, 100)
})
</script>

<template>
  <div class="login-template-modern" :style="cssVars">

    <!-- 现代动态背景 -->
    <div class="background-container">
      <!-- 多层渐变背景 -->
      <div class="gradient-bg gradient-primary" />
      <div class="gradient-bg gradient-secondary" />
      <div class="gradient-bg gradient-accent" />

      <div v-if="backgroundImage" class="custom-bg" :style="{ backgroundImage: `url(${backgroundImage})` }" />

      <!-- 毛玻璃装饰球 -->
      <div class="glass-orbs">
        <div class="glass-orb orb-1" />
        <div class="glass-orb orb-2" />
        <div class="glass-orb orb-3" />
        <div class="glass-orb orb-4" />
      </div>

      <!-- 现代几何图案 -->
      <div class="modern-patterns">
        <div class="pattern-hexagon" />
        <div class="pattern-triangle" />
        <div class="pattern-diamond" />
        <div class="pattern-dots" />
      </div>

      <!-- 粒子效果 -->
      <div v-if="enableParticles" class="particles-container">
        <slot name="particles">
          <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)" />
        </slot>
      </div>
    </div>

    <div class="login-container" :class="{ 'form-active': isFormActive }">
      <div class="login-card">
        <!-- 头部 -->
        <div class="card-header">
          <slot name="header">
            <div class="logo-section">
              <div v-if="logoUrl" class="logo-image">
                <img :src="logoUrl" :alt="title">
              </div>
              <div v-else class="logo-icon">
                🚀
              </div>
              <h1 class="login-title">
                {{ title }}
              </h1>
              <p class="login-subtitle">
                {{ subtitle }}
              </p>
            </div>
          </slot>
        </div>

        <!-- 主体内容 -->
        <div class="card-body">

          <!-- 登录表单 -->
          <form class="login-form" @submit.prevent="handleSubmit">
            <div class="form-group" :class="{ focused: focusedField === 'username', filled: formData.username }">
              <input v-model="formData.username" type="text" class="form-input" placeholder=" " autocomplete="username"
                required :disabled="loading" @focus="focusedField = 'username'" @blur="focusedField = ''">
              <label class="form-label">用户名</label>
              <div class="form-line" />
            </div>

            <div class="form-group" :class="{ focused: focusedField === 'password', filled: formData.password }">
              <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" class="form-input"
                placeholder=" " autocomplete="current-password" required :disabled="loading"
                @focus="focusedField = 'password'" @blur="focusedField = ''">
              <label class="form-label">密码</label>
              <button type="button" class="password-toggle" :disabled="loading" @click="showPassword = !showPassword">
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
                </svg>
              </button>
              <div class="form-line" />
            </div>

            <div class="form-options">
              <label v-if="showRemember" class="modern-checkbox">
                <input v-model="formData.remember" type="checkbox" class="checkbox-input" :disabled="loading">
                <span class="checkbox-custom" />
                <span class="checkbox-text">记住登录状态</span>
              </label>

              <a href="#" class="forgot-link" @click.prevent="handleForgot">
                忘记密码？
              </a>
            </div>

            <button type="submit" class="login-button" :disabled="loading">
              <span class="button-content">
                <span v-if="loading" class="loading-dots">
                  <span /><span /><span />
                </span>
                <span v-else>立即登录</span>
              </span>
              <div class="button-bg" />
            </button>
          </form>

          <div v-if="showRegister" class="register-section">
            <p class="register-text">
              还没有账户？
              <a href="#" class="register-link" @click.prevent="handleRegister">
                免费注册
              </a>
            </p>
          </div>
        </div>

        <!-- 底部 -->
        <div class="card-footer">
          <slot name="footer">
            <div class="footer-links">
              <a href="#" class="footer-link">隐私政策</a>
              <a href="#" class="footer-link">服务条款</a>
              <a href="#" class="footer-link">帮助中心</a>
            </div>
          </slot>
          <div class="template-selector-slot">
            <slot name="selector" />
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-template-modern {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 背景容器
.background-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .gradient-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: gradient-shift 10s ease-in-out infinite;

    &.gradient-primary {
      background: linear-gradient(135deg,
          rgba(99, 102, 241, 0.8) 0%,
          rgba(168, 85, 247, 0.8) 50%,
          rgba(236, 72, 153, 0.8) 100%);
    }

    &.gradient-secondary {
      background: linear-gradient(45deg,
          rgba(59, 130, 246, 0.3) 0%,
          rgba(147, 51, 234, 0.3) 100%);
      animation-delay: -3s;
    }

    &.gradient-accent {
      background: radial-gradient(circle at 30% 70%,
          rgba(236, 72, 153, 0.2) 0%,
          transparent 50%);
      animation-delay: -6s;
    }
  }

  .custom-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    opacity: 0.3;
  }

  // 毛玻璃装饰球
  .glass-orbs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .glass-orb {
      position: absolute;
      border-radius: 50%;
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: float-orb 15s ease-in-out infinite;

      &.orb-1 {
        width: 200px;
        height: 200px;
        top: 10%;
        right: 15%;
        animation-delay: 0s;
      }

      &.orb-2 {
        width: 150px;
        height: 150px;
        bottom: 20%;
        left: 10%;
        animation-delay: -5s;
      }

      &.orb-3 {
        width: 100px;
        height: 100px;
        top: 60%;
        right: 30%;
        animation-delay: -10s;
      }

      &.orb-4 {
        width: 80px;
        height: 80px;
        top: 30%;
        left: 20%;
        animation-delay: -7s;
      }
    }
  }

  // 现代几何图案
  .modern-patterns {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .pattern-hexagon {
      position: absolute;
      width: 60px;
      height: 60px;
      top: 25%;
      left: 15%;
      background: rgba(255, 255, 255, 0.05);
      clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
      animation: rotate-slow 20s linear infinite;
    }

    .pattern-triangle {
      position: absolute;
      width: 40px;
      height: 40px;
      top: 70%;
      right: 25%;
      background: rgba(255, 255, 255, 0.05);
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      animation: rotate-slow 15s linear infinite reverse;
    }

    .pattern-diamond {
      position: absolute;
      width: 50px;
      height: 50px;
      top: 45%;
      right: 10%;
      background: rgba(255, 255, 255, 0.05);
      transform: rotate(45deg);
      animation: pulse-glow 8s ease-in-out infinite;
    }

    .pattern-dots {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
      background-size: 40px 40px;
      opacity: 0.3;
    }
  }
}

// 粒子效果
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .particle {
    position: absolute;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: float-particle linear infinite;
  }
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: 1;
  }

  90% {
    opacity: 1;
  }

  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

@keyframes gradient-shift {

  0%,
  100% {
    filter: hue-rotate(0deg) brightness(1);
  }

  50% {
    filter: hue-rotate(30deg) brightness(1.1);
  }
}

@keyframes float-orb {

  0%,
  100% {
    transform: translateY(0px) translateX(0px) scale(1);
  }

  33% {
    transform: translateY(-20px) translateX(10px) scale(1.05);
  }

  66% {
    transform: translateY(10px) translateX(-15px) scale(0.95);
  }
}

@keyframes rotate-slow {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse-glow {

  0%,
  100% {
    opacity: 0.05;
    transform: rotate(45deg) scale(1);
  }

  50% {
    opacity: 0.15;
    transform: rotate(45deg) scale(1.1);
  }
}

// 登录容器
.login-container {
  position: relative;
  z-index: 10;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);

  &.form-active {
    transform: translateY(0);
    opacity: 1;
  }
}

.login-card {
  background: var(--ldesign-bg-color-page, rgba(255, 255, 255, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 50px var(--ldesign-shadow-2, rgba(0, 0, 0, 0.15));
  padding: 2.5rem;
  width: 420px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

// 卡片头部
.card-header {
  text-align: center;
  margin-bottom: 2rem;

  .logo-section {
    .logo-image {
      margin-bottom: 1rem;

      img {
        height: 60px;
        width: auto;
      }
    }

    .logo-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: inline-block;
      animation: float 3s ease-in-out infinite;
    }

    .login-title {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      color: #6c757d;
      font-size: 0.95rem;
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-10px);
  }
}

// 社交登录
.social-login {
  margin-bottom: 2rem;

  .social-buttons {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .social-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    background: white;
    color: #495057;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
    }

    .social-icon {
      width: 20px;
      height: 20px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    &--google:hover {
      border-color: #db4437;
      color: #db4437;
    }

    &--github:hover {
      border-color: #333;
      color: #333;
    }
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #e9ecef;
    }

    .divider-text {
      background: rgba(255, 255, 255, 0.95);
      padding: 0 1rem;
      color: #6c757d;
      font-size: 0.9rem;
    }
  }
}

// 表单样式
.login-form {
  .form-group {
    position: relative;
    margin-bottom: 2rem;

    .form-input {
      width: 100%;
      padding: 1rem 0 0.5rem 0;
      border: none;
      border-bottom: 2px solid #e9ecef;
      background: transparent;
      font-size: 1rem;
      transition: all 0.3s ease;

      &:focus {
        outline: none;
        border-bottom-color: var(--primary-color);
      }

      &:focus+.form-label,
      &:not(:placeholder-shown)+.form-label {
        transform: translateY(-1.5rem) scale(0.85);
        color: var(--primary-color);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .form-label {
      position: absolute;
      top: 1rem;
      left: 0;
      color: #6c757d;
      font-size: 1rem;
      pointer-events: none;
      transition: all 0.3s ease;
      transform-origin: left top;
    }

    .form-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      transition: width 0.3s ease;
    }

    &.focused .form-line,
    &.filled .form-line {
      width: 100%;
    }

    .password-toggle {
      position: absolute;
      right: 0;
      top: 1rem;
      background: none;
      border: none;
      cursor: pointer;
      width: 20px;
      height: 20px;
      opacity: 0.6;
      transition: opacity 0.3s ease;

      &:hover:not(:disabled) {
        opacity: 1;
      }

      &:disabled {
        cursor: not-allowed;
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
    margin-bottom: 2rem;

    .modern-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.9rem;

      .checkbox-input {
        display: none;
      }

      .checkbox-custom {
        width: 20px;
        height: 20px;
        border: 2px solid #e9ecef;
        border-radius: 4px;
        margin-right: 0.5rem;
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
          transition: transform 0.2s ease;
        }
      }

      .checkbox-input:checked+.checkbox-custom {
        background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
        border-color: var(--primary-color);

        &::after {
          transform: translate(-50%, -50%) scale(1);
        }
      }

      .checkbox-text {
        color: #6c757d;
      }
    }

    .forgot-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;

      &:hover {
        color: var(--secondary-color);
      }
    }
  }

  .login-button {
    width: 100%;
    position: relative;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 15px 30px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .button-content {
      position: relative;
      z-index: 2;
    }

    .button-bg {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }

    &:hover .button-bg {
      left: 100%;
    }

    .loading-dots {
      display: inline-flex;
      gap: 0.2rem;

      span {
        width: 6px;
        height: 6px;
        background: currentColor;
        border-radius: 50%;
        animation: loading-bounce 1.4s ease-in-out infinite both;

        &:nth-child(1) {
          animation-delay: -0.32s;
        }

        &:nth-child(2) {
          animation-delay: -0.16s;
        }

        &:nth-child(3) {
          animation-delay: 0s;
        }
      }
    }
  }
}

@keyframes loading-bounce {

  0%,
  80%,
  100% {
    transform: scale(0);
  }

  40% {
    transform: scale(1);
  }
}

// 注册区域
.register-section {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;

  .register-text {
    color: #6c757d;
    font-size: 0.9rem;
  }

  .register-link {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: var(--secondary-color);
    }
  }
}

// 卡片底部
.card-footer {
  text-align: center;
  margin-top: 2rem;

  .footer-links {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .footer-link {
    color: #adb5bd;
    text-decoration: none;
    font-size: 0.8rem;
    transition: color 0.3s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
}

// 选择器容器（位于卡片 footer 内，居中展示）
.card-footer {
  .template-selector-slot {
    margin-top: 1rem;
    display: flex;
    justify-content: center;

    :deep(.template-selector-wrapper) {
      margin-bottom: 0;
    }
  }
}


// 模板标识横幅样式
.template-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.95), rgba(155, 89, 182, 0.95));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.template-name {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.template-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
}

.device-type,
.template-version {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.template-category {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

// 调试信息样式
.debug-info {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 9999;
  max-width: 300px;
}

.debug-panel {
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.debug-panel h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.9rem;
  color: #4CAF50;
  font-weight: 600;
}

.debug-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.debug-label {
  color: #aaa;
  font-weight: 500;
}

.debug-value {
  font-weight: 600;
  color: white;
}

.debug-value.device-type.device-desktop {
  color: #4CAF50;
}

.debug-value.device-type.device-tablet {
  color: #FF9800;
}

.debug-value.device-type.device-mobile {
  color: #2196F3;
}

.debug-value.template-name {
  color: #E91E63;
}

// 响应式设计
@media (max-width: 480px) {
  .login-card {
    width: 90vw;
    padding: 2rem;
  }

  .social-buttons {
    flex-direction: column;
  }

  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .debug-info {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 1rem;
    max-width: none;
  }

  .debug-panel {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style>
