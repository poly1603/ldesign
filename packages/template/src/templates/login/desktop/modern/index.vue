<template>
  <div class="login-template-modern" :style="cssVars">
    <!-- 动态背景 -->
    <div class="background-container">
      <div class="gradient-bg"></div>
      <div v-if="backgroundImage" class="custom-bg" :style="{ backgroundImage: `url(${backgroundImage})` }"></div>
      
      <!-- 粒子效果 -->
      <div v-if="enableParticles" class="particles-container">
        <slot name="particles">
          <div v-for="i in 50" :key="i" class="particle" :style="getParticleStyle(i)"></div>
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
                <img :src="logoUrl" :alt="title" />
              </div>
              <div v-else class="logo-icon">🚀</div>
              <h1 class="login-title">{{ title }}</h1>
              <p class="login-subtitle">{{ subtitle }}</p>
            </div>
          </slot>
        </div>

        <!-- 主体内容 -->
        <div class="card-body">
          <!-- 社交登录 -->
          <div v-if="showSocialLogin" class="social-login">
            <slot name="social">
              <div class="social-buttons">
                <button class="social-btn social-btn--google" @click="handleSocialLogin('google')">
                  <div class="social-icon">
                    <svg viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  </div>
                  <span>Google</span>
                </button>
                <button class="social-btn social-btn--github" @click="handleSocialLogin('github')">
                  <div class="social-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </div>
                  <span>GitHub</span>
                </button>
              </div>
              <div class="divider">
                <span class="divider-text">或使用邮箱登录</span>
              </div>
            </slot>
          </div>

          <!-- 登录表单 -->
          <form class="login-form" @submit.prevent="handleSubmit">
            <div class="form-group" :class="{ 'focused': focusedField === 'username', 'filled': formData.username }">
              <input
                v-model="formData.username"
                type="text"
                class="form-input"
                placeholder=" "
                required
                :disabled="loading"
                @focus="focusedField = 'username'"
                @blur="focusedField = ''"
              />
              <label class="form-label">用户名或邮箱</label>
              <div class="form-line"></div>
            </div>

            <div class="form-group" :class="{ 'focused': focusedField === 'password', 'filled': formData.password }">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder=" "
                required
                :disabled="loading"
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
              <label class="form-label">密码</label>
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
                :disabled="loading"
              >
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z"/>
                </svg>
              </button>
              <div class="form-line"></div>
            </div>

            <div class="form-options">
              <label v-if="showRemember" class="modern-checkbox">
                <input
                  v-model="formData.remember"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="loading"
                />
                <span class="checkbox-custom"></span>
                <span class="checkbox-text">记住登录状态</span>
              </label>
              
              <a href="#" class="forgot-link" @click.prevent="handleForgot">
                忘记密码？
              </a>
            </div>

            <button type="submit" class="login-button" :disabled="loading">
              <span class="button-content">
                <span v-if="loading" class="loading-dots">
                  <span></span><span></span><span></span>
                </span>
                <span v-else>立即登录</span>
              </span>
              <div class="button-bg"></div>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'

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
  enableParticles: true
})

// 状态管理
const formData = reactive({
  username: '',
  password: '',
  remember: false
})

const loading = ref(false)
const showPassword = ref(false)
const focusedField = ref('')
const isFormActive = ref(false)

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor
}))

// 粒子样式生成
const getParticleStyle = (index: number) => {
  const size = Math.random() * 4 + 2
  const left = Math.random() * 100
  const animationDelay = Math.random() * 20
  const animationDuration = Math.random() * 10 + 10
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDelay: `${animationDelay}s`,
    animationDuration: `${animationDuration}s`
  }
}

// 事件处理
const handleSubmit = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('现代登录数据:', formData)
    alert(`登录成功！欢迎 ${formData.username}`)
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleSocialLogin = (provider: string) => {
  alert(`${provider} 社交登录`)
}

const handleForgot = () => {
  alert('忘记密码功能')
}

const handleRegister = () => {
  alert('注册功能')
}

// 生命周期
onMounted(() => {
  setTimeout(() => {
    isFormActive.value = true
  }, 100)
})
</script>

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
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
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
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
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
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
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

      &:focus + .form-label,
      &:not(:placeholder-shown) + .form-label {
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

      .checkbox-input:checked + .checkbox-custom {
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

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
        &:nth-child(3) { animation-delay: 0s; }
      }
    }
  }
}

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
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
}
</style>
