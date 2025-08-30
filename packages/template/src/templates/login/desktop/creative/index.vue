<template>
  <div class="login-template-creative" :style="cssVars">
    <!-- 创意背景 -->
    <div class="creative-background">
      <div class="bg-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
      
      <!-- 动态网格 -->
      <div v-if="enableAnimations" class="grid-overlay">
        <div v-for="i in 20" :key="i" class="grid-line" :style="getGridLineStyle(i)"></div>
      </div>
    </div>

    <div class="creative-container">
      <!-- 左侧艺术区域 -->
      <div class="artwork-section">
        <slot name="artwork">
          <div class="artwork-content">
            <div class="floating-elements" v-if="showCreativeElements">
              <div class="element element-circle"></div>
              <div class="element element-triangle"></div>
              <div class="element element-square"></div>
              <div class="element element-hexagon"></div>
            </div>
            
            <div class="artwork-text">
              <h2 class="artwork-title">设计改变世界</h2>
              <p class="artwork-subtitle">每一次登录都是创意的开始</p>
              <div class="artwork-stats">
                <div class="stat-item">
                  <div class="stat-number">10K+</div>
                  <div class="stat-label">创意作品</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">500+</div>
                  <div class="stat-label">设计师</div>
                </div>
              </div>
            </div>
          </div>
        </slot>
      </div>

      <!-- 右侧登录区域 -->
      <div class="login-section">
        <div class="login-card">
          <!-- 头部 -->
          <div class="card-header">
            <slot name="header">
              <div class="logo-section">
                <div v-if="logoUrl" class="logo-image">
                  <img :src="logoUrl" :alt="title" />
                </div>
                <div v-else class="logo-creative">
                  <div class="logo-shapes">
                    <div class="logo-shape logo-shape-1"></div>
                    <div class="logo-shape logo-shape-2"></div>
                    <div class="logo-shape logo-shape-3"></div>
                  </div>
                </div>
                <h1 class="login-title">{{ title }}</h1>
                <p class="login-subtitle">{{ subtitle }}</p>
              </div>
            </slot>
          </div>

          <!-- 登录表单 -->
          <form class="creative-form" @submit.prevent="handleSubmit">
            <div class="form-group">
              <div class="input-container" :class="{ 'active': focusedField === 'username' }">
                <div class="input-decoration"></div>
                <input
                  v-model="formData.username"
                  type="text"
                  class="form-input"
                  placeholder="用户名或邮箱"
                  required
                  :disabled="loading"
                  @focus="focusedField = 'username'"
                  @blur="focusedField = ''"
                />
                <div class="input-highlight"></div>
              </div>
            </div>

            <div class="form-group">
              <div class="input-container" :class="{ 'active': focusedField === 'password' }">
                <div class="input-decoration"></div>
                <input
                  v-model="formData.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="密码"
                  required
                  :disabled="loading"
                  @focus="focusedField = 'password'"
                  @blur="focusedField = ''"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                >
                  <div class="toggle-icon" :class="{ 'visible': showPassword }">
                    <span class="eye-line eye-line-1"></span>
                    <span class="eye-line eye-line-2"></span>
                    <span class="eye-circle"></span>
                  </div>
                </button>
                <div class="input-highlight"></div>
              </div>
            </div>

            <div class="form-options">
              <label v-if="showRemember" class="creative-checkbox">
                <input
                  v-model="formData.remember"
                  type="checkbox"
                  class="checkbox-input"
                  :disabled="loading"
                />
                <div class="checkbox-design">
                  <div class="checkbox-bg"></div>
                  <div class="checkbox-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                      <polyline points="20,6 9,17 4,12"></polyline>
                    </svg>
                  </div>
                </div>
                <span class="checkbox-text">记住我</span>
              </label>
              
              <a href="#" class="forgot-link" @click.prevent="handleForgot">
                <span class="link-text">忘记密码？</span>
                <div class="link-underline"></div>
              </a>
            </div>

            <button type="submit" class="creative-button" :disabled="loading">
              <div class="button-bg">
                <div class="button-layer layer-1"></div>
                <div class="button-layer layer-2"></div>
                <div class="button-layer layer-3"></div>
              </div>
              <span class="button-content">
                <span v-if="loading" class="loading-creative">
                  <div class="loading-shape"></div>
                </span>
                <span v-else class="button-text">开始创作</span>
              </span>
            </button>
          </form>

          <div v-if="showRegister" class="register-section">
            <div class="register-divider">
              <div class="divider-line"></div>
              <span class="divider-text">或者</span>
              <div class="divider-line"></div>
            </div>
            <p class="register-text">
              还没有账户？
              <a href="#" class="register-link" @click.prevent="handleRegister">
                <span class="link-text">加入我们</span>
                <div class="link-arrow">→</div>
              </a>
            </p>
          </div>

          <!-- 创意元素 -->
          <div v-if="showCreativeElements" class="creative-decorations">
            <slot name="creative-elements">
              <div class="decoration decoration-1"></div>
              <div class="decoration decoration-2"></div>
              <div class="decoration decoration-3"></div>
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div class="creative-footer">
      <slot name="footer">
        <div class="footer-content">
          <p>&copy; 2024 Creative Studio. 让创意无限延伸</p>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Props定义
interface Props {
  title?: string
  subtitle?: string
  showRemember?: boolean
  showRegister?: boolean
  showCreativeElements?: boolean
  logoUrl?: string
  accentColor?: string
  secondaryAccent?: string
  tertiaryAccent?: string
  enableAnimations?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '创意登录',
  subtitle: '释放你的创造力',
  showRemember: true,
  showRegister: true,
  showCreativeElements: true,
  logoUrl: '',
  accentColor: '#ff6b6b',
  secondaryAccent: '#4ecdc4',
  tertiaryAccent: '#45b7d1',
  enableAnimations: true
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

// 计算属性
const cssVars = computed(() => ({
  '--accent-color': props.accentColor,
  '--secondary-accent': props.secondaryAccent,
  '--tertiary-accent': props.tertiaryAccent
}))

// 网格线样式生成
const getGridLineStyle = (index: number) => {
  const isVertical = index % 2 === 0
  const position = (index / 20) * 100
  const opacity = Math.random() * 0.3 + 0.1
  const animationDelay = Math.random() * 5
  
  if (isVertical) {
    return {
      left: `${position}%`,
      width: '1px',
      height: '100%',
      opacity,
      animationDelay: `${animationDelay}s`
    }
  } else {
    return {
      top: `${position}%`,
      height: '1px',
      width: '100%',
      opacity,
      animationDelay: `${animationDelay}s`
    }
  }
}

// 事件处理
const handleSubmit = async () => {
  loading.value = true
  
  try {
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('创意登录数据:', formData)
    alert(`欢迎来到创意世界！${formData.username}`)
  } catch (error) {
    console.error('登录失败:', error)
    alert('登录失败，请重试')
  } finally {
    loading.value = false
  }
}

const handleForgot = () => {
  alert('忘记密码功能')
}

const handleRegister = () => {
  alert('注册功能')
}
</script>

<style lang="less" scoped>
.login-template-creative {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

// 创意背景
.creative-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .bg-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      animation: float-shape 20s linear infinite;

      &.shape-1 {
        width: 200px;
        height: 200px;
        background: var(--accent-color);
        top: 10%;
        left: 5%;
        animation-delay: 0s;
      }

      &.shape-2 {
        width: 150px;
        height: 150px;
        background: var(--secondary-accent);
        top: 60%;
        right: 10%;
        animation-delay: -5s;
      }

      &.shape-3 {
        width: 100px;
        height: 100px;
        background: var(--tertiary-accent);
        bottom: 20%;
        left: 15%;
        animation-delay: -10s;
      }

      &.shape-4 {
        width: 80px;
        height: 80px;
        background: var(--accent-color);
        top: 30%;
        right: 30%;
        animation-delay: -15s;
      }

      &.shape-5 {
        width: 120px;
        height: 120px;
        background: var(--secondary-accent);
        bottom: 40%;
        right: 5%;
        animation-delay: -7s;
      }
    }
  }

  .grid-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .grid-line {
      position: absolute;
      background: rgba(255, 255, 255, 0.1);
      animation: grid-pulse 3s ease-in-out infinite;
    }
  }
}

@keyframes float-shape {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-20px) rotate(90deg); }
  50% { transform: translateY(0px) rotate(180deg); }
  75% { transform: translateY(20px) rotate(270deg); }
}

@keyframes grid-pulse {
  0%, 100% { opacity: 0.1; }
  50% { opacity: 0.3; }
}

// 主容器
.creative-container {
  position: relative;
  z-index: 10;
  display: flex;
  min-height: 100vh;
}

// 左侧艺术区域
.artwork-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;

  .artwork-content {
    text-align: center;
    color: white;
    position: relative;

    .floating-elements {
      position: absolute;
      top: -100px;
      left: -100px;
      right: -100px;
      bottom: -100px;

      .element {
        position: absolute;
        animation: float-element 15s ease-in-out infinite;

        &.element-circle {
          width: 60px;
          height: 60px;
          background: var(--accent-color);
          border-radius: 50%;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        &.element-triangle {
          width: 0;
          height: 0;
          border-left: 30px solid transparent;
          border-right: 30px solid transparent;
          border-bottom: 50px solid var(--secondary-accent);
          top: 70%;
          right: 20%;
          animation-delay: -3s;
        }

        &.element-square {
          width: 40px;
          height: 40px;
          background: var(--tertiary-accent);
          transform: rotate(45deg);
          top: 50%;
          left: 80%;
          animation-delay: -6s;
        }

        &.element-hexagon {
          width: 50px;
          height: 50px;
          background: var(--accent-color);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          bottom: 30%;
          left: 30%;
          animation-delay: -9s;
        }
      }
    }

    .artwork-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .artwork-subtitle {
      font-size: 1.2rem;
      opacity: 0.9;
      margin-bottom: 2rem;
    }

    .artwork-stats {
      display: flex;
      justify-content: center;
      gap: 3rem;

      .stat-item {
        text-align: center;

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent-color);
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }
      }
    }
  }
}

@keyframes float-element {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-15px) rotate(120deg); }
  66% { transform: translateY(15px) rotate(240deg); }
}

// 右侧登录区域
.login-section {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 30px;
  padding: 3rem;
  width: 100%;
  position: relative;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

// 卡片头部
.card-header {
  text-align: center;
  margin-bottom: 2.5rem;

  .logo-section {
    .logo-image img {
      height: 60px;
      width: auto;
      margin-bottom: 1rem;
    }

    .logo-creative {
      margin-bottom: 1rem;

      .logo-shapes {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;

        .logo-shape {
          animation: logo-pulse 2s ease-in-out infinite;

          &.logo-shape-1 {
            width: 20px;
            height: 20px;
            background: var(--accent-color);
            border-radius: 50%;
            animation-delay: 0s;
          }

          &.logo-shape-2 {
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 15px solid var(--secondary-accent);
            animation-delay: 0.3s;
          }

          &.logo-shape-3 {
            width: 15px;
            height: 15px;
            background: var(--tertiary-accent);
            transform: rotate(45deg);
            animation-delay: 0.6s;
          }
        }
      }
    }

    .login-title {
      font-size: 2.5rem;
      font-weight: 700;
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.5rem;
    }

    .login-subtitle {
      color: #6c757d;
      font-size: 1rem;
    }
  }
}

@keyframes logo-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

// 创意表单
.creative-form {
  .form-group {
    margin-bottom: 2rem;
  }

  .input-container {
    position: relative;
    overflow: hidden;
    border-radius: 15px;
    transition: all 0.3s ease;

    .input-decoration {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &.active .input-decoration {
      opacity: 0.1;
    }

    .form-input {
      width: 100%;
      padding: 1.2rem 1.5rem;
      border: 2px solid #e9ecef;
      border-radius: 15px;
      font-size: 1rem;
      background: white;
      transition: all 0.3s ease;
      position: relative;
      z-index: 2;

      &:focus {
        outline: none;
        border-color: var(--accent-color);
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &::placeholder {
        color: #adb5bd;
      }
    }

    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      z-index: 3;
      padding: 0.5rem;

      .toggle-icon {
        width: 24px;
        height: 24px;
        position: relative;
        transition: all 0.3s ease;

        .eye-line {
          position: absolute;
          background: #6c757d;
          border-radius: 2px;
          transition: all 0.3s ease;

          &.eye-line-1 {
            width: 20px;
            height: 2px;
            top: 8px;
            left: 2px;
            transform-origin: center;
          }

          &.eye-line-2 {
            width: 20px;
            height: 2px;
            top: 14px;
            left: 2px;
            transform-origin: center;
          }
        }

        .eye-circle {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #6c757d;
          border-radius: 50%;
          top: 8px;
          left: 8px;
          transition: all 0.3s ease;
        }

        &.visible {
          .eye-line-1 {
            transform: rotate(45deg);
            top: 11px;
          }

          .eye-line-2 {
            transform: rotate(-45deg);
            top: 11px;
          }

          .eye-circle {
            opacity: 0;
          }
        }
      }
    }

    .input-highlight {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 3px;
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
      transition: width 0.3s ease;
    }

    &.active .input-highlight {
      width: 100%;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5rem;

    .creative-checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-size: 0.9rem;

      .checkbox-input {
        display: none;
      }

      .checkbox-design {
        width: 24px;
        height: 24px;
        margin-right: 0.75rem;
        position: relative;
        border-radius: 6px;
        overflow: hidden;

        .checkbox-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #e9ecef;
          transition: all 0.3s ease;
        }

        .checkbox-check {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transform: scale(0);
          transition: transform 0.3s ease;

          svg {
            width: 14px;
            height: 14px;
          }
        }
      }

      .checkbox-input:checked + .checkbox-design {
        .checkbox-bg {
          background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
        }

        .checkbox-check {
          transform: scale(1);
        }
      }

      .checkbox-text {
        color: #6c757d;
      }
    }

    .forgot-link {
      text-decoration: none;
      position: relative;
      color: var(--accent-color);
      font-size: 0.9rem;

      .link-text {
        position: relative;
        z-index: 2;
      }

      .link-underline {
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
        transition: width 0.3s ease;
      }

      &:hover .link-underline {
        width: 100%;
      }
    }
  }

  .creative-button {
    width: 100%;
    position: relative;
    border: none;
    border-radius: 15px;
    padding: 1.2rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .button-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;

      .button-layer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        transition: all 0.3s ease;

        &.layer-1 {
          background: var(--accent-color);
        }

        &.layer-2 {
          background: var(--secondary-accent);
          transform: translateX(100%);
        }

        &.layer-3 {
          background: var(--tertiary-accent);
          transform: translateX(200%);
        }
      }
    }

    &:hover .button-bg {
      .layer-2 {
        transform: translateX(0);
      }

      .layer-3 {
        transform: translateX(100%);
      }
    }

    .button-content {
      position: relative;
      z-index: 2;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;

      .loading-creative {
        .loading-shape {
          width: 20px;
          height: 20px;
          border: 3px solid transparent;
          border-top: 3px solid currentColor;
          border-radius: 50%;
          animation: creative-spin 1s linear infinite;
        }
      }
    }
  }
}

@keyframes creative-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 注册区域
.register-section {
  margin-top: 2.5rem;

  .register-divider {
    display: flex;
    align-items: center;
    margin-bottom: 1.5rem;

    .divider-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(45deg, var(--accent-color), var(--secondary-accent));
      opacity: 0.3;
    }

    .divider-text {
      margin: 0 1rem;
      color: #6c757d;
      font-size: 0.9rem;
    }
  }

  .register-text {
    text-align: center;
    color: #6c757d;
    font-size: 0.9rem;
  }

  .register-link {
    color: var(--accent-color);
    text-decoration: none;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;

    .link-arrow {
      transition: transform 0.3s ease;
    }

    &:hover {
      color: var(--secondary-accent);

      .link-arrow {
        transform: translateX(3px);
      }
    }
  }
}

// 创意装饰
.creative-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;

  .decoration {
    position: absolute;
    opacity: 0.1;
    animation: decoration-float 10s ease-in-out infinite;

    &.decoration-1 {
      width: 30px;
      height: 30px;
      background: var(--accent-color);
      border-radius: 50%;
      top: 10%;
      right: 10%;
      animation-delay: 0s;
    }

    &.decoration-2 {
      width: 0;
      height: 0;
      border-left: 15px solid transparent;
      border-right: 15px solid transparent;
      border-bottom: 25px solid var(--secondary-accent);
      bottom: 20%;
      left: 5%;
      animation-delay: -3s;
    }

    &.decoration-3 {
      width: 20px;
      height: 20px;
      background: var(--tertiary-accent);
      transform: rotate(45deg);
      top: 60%;
      right: 5%;
      animation-delay: -6s;
    }
  }
}

@keyframes decoration-float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(180deg); }
}

// 底部
.creative-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 1rem;
  text-align: center;

  .footer-content {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.8rem;
  }
}

// 响应式设计
@media (max-width: 1024px) {
  .creative-container {
    flex-direction: column;
  }

  .artwork-section {
    min-height: 40vh;
  }

  .login-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem;
    border-radius: 20px;
  }

  .artwork-section .artwork-content .artwork-title {
    font-size: 2rem;
  }

  .card-header .logo-section .login-title {
    font-size: 2rem;
  }
}
</style>
