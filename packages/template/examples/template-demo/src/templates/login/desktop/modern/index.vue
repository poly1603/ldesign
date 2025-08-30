<template>
  <div class="login-template-modern">
    <div class="login-container" :class="{ 'form-active': isFormActive }">
      <div class="login-card">
        <div class="card-header">
          <slot name="header">
            <div class="logo-section">
              <div class="logo-icon">🚀</div>
              <h1 class="login-title">{{ title }}</h1>
              <p class="login-subtitle">体验现代化的登录方式</p>
            </div>
          </slot>
        </div>

        <div class="card-body">
          <!-- 社交登录 -->
          <div v-if="showSocialLogin" class="social-login">
            <slot name="social">
              <div class="social-buttons">
                <button class="social-btn social-btn--google" @click="handleSocialLogin('google')">
                  <span class="social-icon">G</span>
                  Google
                </button>
                <button class="social-btn social-btn--github" @click="handleSocialLogin('github')">
                  <span class="social-icon">⚡</span>
                  GitHub
                </button>
              </div>
              <div class="divider">
                <span class="divider-text">或使用邮箱登录</span>
              </div>
            </slot>
          </div>

          <!-- 登录表单 -->
          <form class="login-form" @submit.prevent="handleSubmit">
            <div class="form-group" :class="{ 'focused': focusedField === 'username' }">
              <input
                v-model="formData.username"
                type="text"
                class="form-input"
                placeholder=" "
                required
                @focus="focusedField = 'username'"
                @blur="focusedField = ''"
              />
              <label class="form-label">用户名或邮箱</label>
              <div class="form-line"></div>
            </div>

            <div class="form-group" :class="{ 'focused': focusedField === 'password' }">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder=" "
                required
                @focus="focusedField = 'password'"
                @blur="focusedField = ''"
              />
              <label class="form-label">密码</label>
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
              <div class="form-line"></div>
            </div>

            <div class="form-options">
              <label v-if="showRemember" class="modern-checkbox">
                <input
                  v-model="formData.remember"
                  type="checkbox"
                  class="checkbox-input"
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

      <!-- 背景装饰 -->
      <div class="bg-decoration">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'

// Props定义
interface Props {
  title?: string
  showRemember?: boolean
  showSocialLogin?: boolean
  showRegister?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '现代登录',
  showRemember: true,
  showSocialLogin: true,
  showRegister: true
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

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

.card-header {
  text-align: center;
  margin-bottom: 2rem;

  .logo-section {
    .logo-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      display: inline-block;
      animation: float 3s ease-in-out infinite;
    }

    .login-title {
      font-size: 2.2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

.card-body {
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
        border-color: #667eea;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(102, 126, 234, 0.2);
      }

      .social-icon {
        font-weight: bold;
        font-size: 1.1rem;
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
          border-bottom-color: #667eea;
        }

        &:focus + .form-label,
        &:not(:placeholder-shown) + .form-label {
          transform: translateY(-1.5rem) scale(0.85);
          color: #667eea;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        transition: width 0.3s ease;
      }

      &.focused .form-line {
        width: 100%;
      }

      .password-toggle {
        position: absolute;
        right: 0;
        top: 1rem;
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        opacity: 0.6;
        transition: opacity 0.3s ease;

        &:hover {
          opacity: 1;
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;

          &::after {
            transform: translate(-50%, -50%) scale(1);
          }
        }

        .checkbox-text {
          color: #6c757d;
        }
      }

      .forgot-link {
        color: #667eea;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.3s ease;

        &:hover {
          color: #5a6fd8;
        }
      }
    }

    .login-button {
      width: 100%;
      position: relative;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.3s ease;

      &:hover {
        color: #5a6fd8;
      }
    }
  }
}

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
      color: #667eea;
    }
  }
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;

  .floating-shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float-around 20s linear infinite;

    &.shape-1 {
      width: 100px;
      height: 100px;
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }

    &.shape-2 {
      width: 150px;
      height: 150px;
      top: 60%;
      right: 15%;
      animation-delay: -7s;
    }

    &.shape-3 {
      width: 80px;
      height: 80px;
      bottom: 20%;
      left: 20%;
      animation-delay: -14s;
    }
  }
}

// 动画定义
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes float-around {
  0% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-30px) rotate(120deg); }
  66% { transform: translateY(30px) rotate(240deg); }
  100% { transform: translateY(0px) rotate(360deg); }
}

@keyframes loading-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
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
