<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

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
  debugInfo?: {
    deviceType?: string
    templateName?: string
    isResponsive?: boolean
    screenWidth?: number
    renderMode?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户登录',
  subtitle: '欢迎回来，请登录您的账户',
  showRemember: true,
  showRegister: true,
  showForgot: true,
  logoUrl: '',
  backgroundImage: '',
  primaryColor: '#667eea',
})

// 调试信息相关
const showDebugInfo = ref(true) // 开发环境下默认显示调试信息
const renderTime = ref('')

// 设备类型标签映射
const deviceTypeLabels = ref({
  desktop: '🖥️ 桌面端',
  tablet: '📱 平板端',
  mobile: '📱 移动端',
})

// 计算属性
const currentDeviceType = computed(() => {
  return props.debugInfo?.deviceType || 'desktop'
})

const currentTemplateName = computed(() => {
  return props.debugInfo?.templateName || 'default'
})

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  remember: false,
})

// 状态
const loading = ref(false)
const showPassword = ref(false)

// 计算属性
const backgroundStyle = computed(() => {
  if (props.backgroundImage) {
    return {
      backgroundImage: `url(${props.backgroundImage})`,
    }
  }
  return {}
})

// 事件处理
async function handleSubmit() {
  loading.value = true

  try {
    // 模拟登录请求
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log('登录数据:', formData)
    alert(`登录成功！用户名: ${formData.username}`)
  }
  catch (error) {
    console.error('登录失败:', error)
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
  renderTime.value = new Date().toLocaleTimeString()
  console.log(`模板渲染完成: ${currentTemplateName.value} (${currentDeviceType.value})`)
})
</script>

<template>
  <div class="login-template-default" :style="{ '--primary-color': primaryColor }">
    <!-- 专业背景 -->
    <div class="professional-background" :style="backgroundStyle">
      <div class="background-overlay" />
      <!-- 几何装饰 -->
      <div class="geometric-decoration">
        <div class="geo-shape geo-circle-1" />
        <div class="geo-shape geo-circle-2" />
        <div class="geo-shape geo-square-1" />
        <div class="geo-shape geo-line-1" />
        <div class="geo-shape geo-line-2" />
      </div>
      <!-- 品牌水印 -->
      <div class="brand-watermark">
        <div class="watermark-text">
          LDesign
        </div>
      </div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <slot name="header">
            <div class="logo-section">
              <slot name="logo">
                <div v-if="logoUrl" class="logo-image">
                  <img :src="logoUrl" :alt="title">
                </div>
                <div v-else class="logo-icon">
                  🔐
                </div>
              </slot>
              <h1 class="login-title">
                {{ title }}
              </h1>
              <p class="login-subtitle">
                {{ subtitle }}
              </p>
            </div>
            <div class="template-selector-slot">
              <slot name="selector" />
            </div>

          </slot>
        </div>

        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <input v-model="formData.username" type="text" class="form-input" placeholder="请输入用户名或邮箱"
                autocomplete="username" required :disabled="loading">
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <div class="input-wrapper">
              <div class="input-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10C20,8.9,19.1,8,18,8z M12,17c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,17,12,17z M15.1,8H8.9V6c0-1.71,1.39-3.1,3.1-3.1s3.1,1.39,3.1,3.1V8z" />
                </svg>
              </div>
              <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" class="form-input"
                placeholder="请输入密码" autocomplete="current-password" required :disabled="loading">
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
            </div>
          </div>

          <div class="form-options">
            <label v-if="showRemember" class="checkbox-label">
              <input v-model="formData.remember" type="checkbox" class="checkbox-input" :disabled="loading">
              <span class="checkbox-custom" />
              <span class="checkbox-text">记住我</span>
            </label>

            <a v-if="showForgot" href="#" class="forgot-link" @click.prevent="handleForgot">
              忘记密码？
            </a>
          </div>

          <button type="submit" class="login-button" :disabled="loading">
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

        <div class="login-footer">
          <slot name="footer">
            <p class="footer-text">
              &copy; 2024 ldesign. All rights reserved.
            </p>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.login-template-default {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.professional-background {
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

  // 几何装饰
  .geometric-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .geo-shape {
      position: absolute;
      opacity: 0.1;

      &.geo-circle-1 {
        width: 300px;
        height: 300px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        top: -150px;
        right: -150px;
      }

      &.geo-circle-2 {
        width: 200px;
        height: 200px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        bottom: -100px;
        left: -100px;
      }

      &.geo-square-1 {
        width: 100px;
        height: 100px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: rotate(45deg);
        top: 20%;
        left: 10%;
      }

      &.geo-line-1 {
        width: 200px;
        height: 1px;
        background: rgba(255, 255, 255, 0.2);
        top: 60%;
        right: 20%;
        transform: rotate(30deg);
      }

      &.geo-line-2 {
        width: 150px;
        height: 1px;
        background: rgba(255, 255, 255, 0.2);
        bottom: 30%;
        left: 15%;
        transform: rotate(-20deg);
      }
    }
  }

  // 品牌水印
  .brand-watermark {
    position: absolute;
    bottom: 50px;
    left: 50px;
    pointer-events: none;

    .watermark-text {
      font-size: 4rem;
      font-weight: 100;
      color: rgba(255, 255, 255, 0.05);
      letter-spacing: 0.2em;
      transform: rotate(-15deg);
    }
  }
}

.login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: 2rem;
}

.login-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 3rem;
  width: 500px;
  backdrop-filter: blur(10px);
}

.login-header {
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
      color: var(--primary-color, #667eea);
    }

    .login-title {
      font-size: 2rem;
      font-weight: 600;
      color: var(--ldesign-text-color, #2c3e50);
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      color: var(--ldesign-text-color-secondary, #7f8c8d);
      font-size: 0.9rem;
    }
  }
}

.template-selector-slot {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;

  // 让触发器紧贴标题区，避免额外底部间距
  :deep(.template-selector-wrapper) {
    margin-bottom: 0;
  }
}


.login-form {
  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    font-weight: 500;
    color: var(--ldesign-text-color, #2c3e50);
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
  }

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;

    .input-icon {
      position: absolute;
      left: 1rem;
      width: 20px;
      height: 20px;
      color: var(--ldesign-text-color-placeholder, #adb5bd);
      z-index: 2;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .form-input {
      width: 100%;
      padding: 0.875rem 1rem 0.875rem 3rem;
      border: 2px solid var(--ldesign-border-color, #e9ecef);
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: var(--ldesign-bg-color-page, white);

      &:focus {
        outline: none;
        border-color: var(--ldesign-brand-color, #667eea);
        box-shadow: 0 0 0 3px var(--ldesign-brand-color-1, rgba(102, 126, 234, 0.1));
      }

      &:disabled {
        background: var(--ldesign-bg-color-component, #f8f9fa);
        cursor: not-allowed;
      }

      &::placeholder {
        color: var(--ldesign-text-color-placeholder, #adb5bd);
      }
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      background: none;
      border: none;
      width: 20px;
      height: 20px;
      color: var(--ldesign-text-color-placeholder, #adb5bd);
      cursor: pointer;
      transition: color 0.3s ease;
      z-index: 2;

      &:hover:not(:disabled) {
        color: var(--ldesign-brand-color, #667eea);
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
    margin-bottom: 2rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
    font-size: 0.9rem;

    .checkbox-input {
      display: none;
    }

    .checkbox-custom {
      width: 18px;
      height: 18px;
      border: 2px solid var(--ldesign-border-color, #e9ecef);
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
        color: var(--ldesign-bg-color-page, white);
        font-size: 12px;
        font-weight: bold;
        transition: transform 0.2s ease;
      }
    }

    .checkbox-input:checked+.checkbox-custom {
      background: var(--ldesign-brand-color, #667eea);
      border-color: var(--ldesign-brand-color, #667eea);

      &::after {
        transform: translate(-50%, -50%) scale(1);
      }
    }

    .checkbox-text {
      color: var(--ldesign-text-color-secondary, #6c757d);
    }
  }

  .forgot-link {
    color: var(--ldesign-brand-color, #667eea);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s ease;

    &:hover {
      color: var(--ldesign-brand-color-hover, #5a6fd8);
      text-decoration: underline;
    }
  }

  .login-button {
    width: 100%;
    background: linear-gradient(135deg, var(--ldesign-brand-color, #667eea) 0%, var(--ldesign-brand-color-8, #764ba2) 100%);
    color: var(--ldesign-bg-color-page, white);
    border: none;
    padding: 0.875rem;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px var(--ldesign-brand-color-3, rgba(102, 126, 234, 0.3));
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  }

  .register-section {
    text-align: center;
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 1px solid var(--ldesign-border-color, #e9ecef);

    .register-text {
      color: var(--ldesign-text-color-secondary, #6c757d);
      font-size: 0.9rem;
    }

    .register-link {
      color: var(--ldesign-brand-color, #667eea);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s ease;

      &:hover {
        color: var(--ldesign-brand-color-hover, #5a6fd8);
        text-decoration: underline;
      }
    }
  }
}

.login-footer {
  text-align: center;
  margin-top: 2rem;

  .footer-text {
    color: var(--ldesign-text-color-placeholder, #adb5bd);
    font-size: 0.8rem;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

// 模板标识横幅样式
.template-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  background: linear-gradient(135deg, var(--ldesign-brand-color, rgba(102, 126, 234, 0.95)), var(--ldesign-brand-color-8, rgba(118, 75, 162, 0.95)));
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px var(--ldesign-shadow-1, rgba(0, 0, 0, 0.1));
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
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem;
  }

  .login-header .logo-section .login-title {
    font-size: 1.5rem;
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
