<template>
  <div class="login-template-mobile">
    <div class="mobile-container">
      <!-- 顶部状态栏 -->
      <div class="status-bar">
        <div class="status-left">
          <span class="time">{{ currentTime }}</span>
        </div>
        <div class="status-right">
          <span class="battery">🔋</span>
          <span class="signal">📶</span>
        </div>
      </div>

      <!-- 头部区域 -->
      <div class="mobile-header">
        <slot name="header">
          <div class="header-content">
            <div class="app-icon">📱</div>
            <h1 class="app-title">{{ title }}</h1>
            <p class="app-subtitle">快速安全登录</p>
          </div>
        </slot>
      </div>

      <!-- 主要内容区域 -->
      <div class="mobile-main">
        <!-- 快捷登录 -->
        <div v-if="showQuickLogin" class="quick-login">
          <slot name="quick-actions">
            <div class="quick-buttons">
              <button class="quick-btn quick-btn--fingerprint" @click="handleQuickLogin('fingerprint')">
                <div class="quick-icon">👆</div>
                <span>指纹登录</span>
              </button>
              <button class="quick-btn quick-btn--face" @click="handleQuickLogin('face')">
                <div class="quick-icon">😊</div>
                <span>面容登录</span>
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
            <div class="input-wrapper">
              <div class="input-icon">👤</div>
              <input
                v-model="formData.username"
                type="text"
                class="form-input"
                placeholder="手机号/邮箱"
                required
                @focus="handleInputFocus"
                @blur="handleInputBlur"
              />
            </div>
          </div>

          <div class="form-group">
            <div class="input-wrapper">
              <div class="input-icon">🔒</div>
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="密码"
                required
                @focus="handleInputFocus"
                @blur="handleInputBlur"
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>

          <div class="form-options" v-if="showRemember">
            <label class="mobile-checkbox">
              <input
                v-model="formData.remember"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-mark"></span>
              <span class="checkbox-text">记住登录状态</span>
            </label>
          </div>

          <button type="submit" class="login-button" :disabled="loading">
            <div class="button-content">
              <div v-if="loading" class="loading-spinner"></div>
              <span>{{ loading ? '登录中...' : '立即登录' }}</span>
            </div>
            <div class="button-ripple" :class="{ active: rippleActive }"></div>
          </button>

          <div class="form-links">
            <a href="#" class="form-link" @click.prevent="handleForgot">忘记密码？</a>
            <a href="#" class="form-link" @click.prevent="handleSmsLogin">短信登录</a>
          </div>
        </form>

        <!-- 注册区域 -->
        <div v-if="showRegister" class="register-section">
          <p class="register-text">还没有账户？</p>
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
            <p class="copyright">© 2024 ldesign</p>
          </div>
        </slot>
      </div>

      <!-- 安全指示器 -->
      <div class="security-indicator">
        <div class="security-icon">🔐</div>
        <span class="security-text">安全连接</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'

// Props定义
interface Props {
  title?: string
  showRemember?: boolean
  showQuickLogin?: boolean
  showRegister?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '手机登录',
  showRemember: false,
  showQuickLogin: true,
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
const rippleActive = ref(false)
const currentTime = ref('')

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

let timeInterval: number

// 事件处理
const handleSubmit = async () => {
  loading.value = true
  rippleActive.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('移动端登录数据:', formData)
    
    // 触觉反馈（如果支持）
    if ('vibrate' in navigator) {
      navigator.vibrate(100)
    }
    
    alert(`登录成功！欢迎 ${formData.username}`)
  } catch (error) {
    console.error('登录失败:', error)
    
    // 错误震动反馈
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
    
    alert('登录失败，请重试')
  } finally {
    loading.value = false
    setTimeout(() => {
      rippleActive.value = false
    }, 300)
  }
}

const handleQuickLogin = (type: string) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(50)
  }
  alert(`${type === 'fingerprint' ? '指纹' : '面容'}登录`)
}

const handleInputFocus = () => {
  // 移动端键盘弹出时的处理
  if (window.innerHeight < 600) {
    document.body.style.height = '100vh'
  }
}

const handleInputBlur = () => {
  // 键盘收起时的处理
  document.body.style.height = 'auto'
}

const handleForgot = () => {
  alert('忘记密码功能')
}

const handleSmsLogin = () => {
  alert('短信登录功能')
}

const handleRegister = () => {
  alert('注册功能')
}

// 生命周期
onMounted(() => {
  updateTime()
  timeInterval = window.setInterval(updateTime, 1000)
  
  // 防止页面缩放
  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
  }
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
  document.body.style.height = 'auto'
})
</script>

<style lang="less" scoped>
.login-template-mobile {
  min-height: 100vh;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow-x: hidden;
}

.mobile-container {
  max-width: 375px;
  margin: 0 auto;
  min-height: 100vh;
  background: white;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

// 状态栏
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  font-size: 0.8rem;
  font-weight: 500;

  .status-left .time {
    font-family: monospace;
  }

  .status-right {
    display: flex;
    gap: 0.5rem;
  }
}

// 头部
.mobile-header {
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1.5rem;
  text-align: center;

  .header-content {
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

// 主要内容
.mobile-main {
  padding: 2rem 1.5rem;
  flex: 1;
}

// 快捷登录
.quick-login {
  margin-bottom: 2rem;

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

    &--fingerprint:hover {
      border-color: #28a745;
      color: #28a745;
    }

    &--face:hover {
      border-color: #007bff;
      color: #007bff;
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

    &:focus-within {
      border-color: #667eea;
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
      padding: 1rem 0;
      font-size: 1rem;
      outline: none;

      &::placeholder {
        color: #adb5bd;
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

      &:active {
        background: rgba(102, 126, 234, 0.1);
        opacity: 1;
      }
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
        background: #667eea;
        border-color: #667eea;

        &::after {
          transform: translate(-50%, -50%) scale(1);
        }
      }
    }
  }

  .login-button {
    width: 100%;
    position: relative;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;

      &:active {
        color: #5a6fd8;
      }
    }
  }
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
    color: #667eea;
    border: 2px solid #667eea;
    padding: 0.75rem 2rem;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:active {
      background: #667eea;
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

  .security-icon {
    font-size: 0.8rem;
  }
}

// 动画
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 触摸优化
@media (hover: none) and (pointer: coarse) {
  .quick-btn:hover,
  .quick-btn--fingerprint:hover,
  .quick-btn--face:hover {
    border-color: #e9ecef;
    color: #495057;
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
</style>
