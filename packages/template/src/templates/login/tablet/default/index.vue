<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { LoginTemplateProps } from '../../types'

/* 使用统一的Props接口 */
const props = withDefaults(defineProps<LoginTemplateProps>(), {
  title: '平板登录',
  subtitle: '在平板上享受更好的体验',
  logoUrl: '',
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  backgroundImage: '',
  showRemember: true,
  showRegister: true,
  showForgot: true,
  enableAnimations: true,
})

/* 定义事件 - 提供完整的组件通信 */
const emit = defineEmits<{
  themeChange: [theme: string]
  languageChange: [language: string]
  darkModeChange: [isDark: boolean]
  sizeChange: [size: string]
  login: [credentials: { username: string, password: string, remember: boolean }]
  register: []
  forgotPassword: []
  orientationChange: [orientation: 'portrait' | 'landscape']
}>()

/* 响应式状态 */
const isLandscape = ref(false)
const isTouchDevice = ref(false)
const showPasswordStrength = ref(false)
const isKeyboardVisible = ref(false)

/* 优化：合并计算属性，减少响应式开销 */
const combinedStyles = computed(() => {
  const styles: Record<string, any> = {
    '--primary-color': props.primaryColor,
    '--secondary-color': props.secondaryColor,
    '--tertiary-color': '#45b7d1',
  }

  // 合并背景样式到同一个计算属性中
  if (props.backgroundImage) {
    styles.backgroundImage = `url(${props.backgroundImage})`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
    styles.backgroundRepeat = 'no-repeat'
  }

  return styles
})

/* 计算容器类名 */
const containerClasses = computed(() => ({
  'ldesign-template-login': true,
  'ldesign-template-tablet': true,
  'is-landscape': isLandscape.value,
  'is-touch': isTouchDevice.value,
  'keyboard-visible': isKeyboardVisible.value,
}))

/* 配置选择器事件处理方法 */
const handleThemeChange = (theme: string) => {
  emit('themeChange', theme)
}

const handleLanguageChange = (language: string) => {
  emit('languageChange', language)
}

const handleDarkModeChange = (isDark: boolean) => {
  emit('darkModeChange', isDark)
}

const handleSizeChange = (size: string) => {
  emit('sizeChange', size)
}

/* 新增：屏幕方向检测 */
const detectOrientation = () => {
  if (typeof window === 'undefined') return

  const width = window.innerWidth
  const height = window.innerHeight
  const newOrientation = width > height ? 'landscape' : 'portrait'
  const wasLandscape = isLandscape.value

  isLandscape.value = newOrientation === 'landscape'

  if (wasLandscape !== isLandscape.value) {
    emit('orientationChange', newOrientation)
  }
}

/* 新增：触摸设备检测 */
const detectTouchDevice = () => {
  if (typeof window === 'undefined') return

  isTouchDevice.value = 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/* 新增：键盘可见性检测 */
const handleResize = () => {
  if (typeof window === 'undefined') return

  // 在移动设备上，当键盘弹出时视口高度会减小
  const viewportHeight = window.visualViewport?.height || window.innerHeight
  const windowHeight = window.innerHeight

  isKeyboardVisible.value = viewportHeight < windowHeight * 0.75
}

/* 生命周期钩子 */
onMounted(() => {
  detectOrientation()
  detectTouchDevice()

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', detectOrientation)
    window.addEventListener('orientationchange', detectOrientation)

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', detectOrientation)
    window.removeEventListener('orientationchange', detectOrientation)

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleResize)
    }
  }
})
</script>

<template>
  <div :class="containerClasses" :style="combinedStyles">
    <!-- 平板优化背景 - 优化：合并样式到combinedStyles -->
    <div class="ldesign-template-tablet-background">
      <!-- 平板专用装饰元素 - 优化：减少DOM节点，提升性能 -->
      <div v-if="enableAnimations" class="ldesign-template-tablet-decorations">
        <div class="ldesign-template-decoration-hexagon ldesign-template-hex-1"></div>
        <div class="ldesign-template-decoration-hexagon ldesign-template-hex-2"></div>
        <div class="ldesign-template-decoration-hexagon ldesign-template-hex-3"></div>
        <div class="ldesign-template-decoration-grid"></div>
        <!-- 优化：粒子数量从8个减少到4个，减少50%的DOM节点和动画开销 -->
        <div class="decoration-particles">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
        </div>
      </div>
    </div>

    <div class="tablet-container">
      <!-- 头部区域 - 优化：使用v-once标记静态内容，减少重渲染 -->
      <div class="tablet-header">
        <slot name="header">
          <div v-once class="header-content">
            <div v-if="logoUrl" class="logo-section">
              <img :src="logoUrl" :alt="title" class="logo-image">
            </div>
            <div v-else class="app-icon">💻</div>
            <h1 class="app-title">{{ title }}</h1>
            <p class="app-subtitle">{{ subtitle }}</p>
          </div>
        </slot>
      </div>

      <!-- 配置选择器区域-->
      <div class="ldesign-template-header-selectors">
        <!-- 语言选择器-->
        <div class="ldesign-template-selector-item">
          <slot name="language-selector" :on-language-change="handleLanguageChange">
            <!-- 默认语言选择器占位符 -->
            <div class="ldesign-template-selector-placeholder">🌍</div>
          </slot>
        </div>

        <!-- 主题色选择器-->
        <div class="ldesign-template-selector-item">
          <slot name="color-selector" :on-theme-change="handleThemeChange">
            <!-- 默认主题选择器占位符 -->
            <div class="ldesign-template-selector-placeholder">🎨</div>
          </slot>
        </div>

        <!-- 暗黑模式切换☰-->
        <div class="ldesign-template-selector-item">
          <slot name="dark-mode-toggle" :on-dark-mode-change="handleDarkModeChange">
            <!-- 默认暗黑模式切换器占位符 -->
            <div class="ldesign-template-selector-placeholder">🌙</div>
          </slot>
        </div>

        <!-- 尺寸选择器-->
        <div class="ldesign-template-selector-item">
          <slot name="size-selector" :on-size-change="handleSizeChange">
            <!-- 默认尺寸选择器占位符 -->
            <div class="ldesign-template-selector-placeholder">📏</div>
          </slot>
        </div>
      </div>

      <!-- 主要内容区域 -->
      <div class="tablet-main">
        <!-- 登录面板 -->
        <div class="login-panel">
          <!-- 内容区域 -->
          <div class="panel-content">
            <slot name="content">
              <!-- 平板端登录表单内容区域，留空供插槽使用-->
            </slot>
          </div>

          <!-- 底部区域 -->
          <div class="panel-footer">
            <slot name="footer">
              <div class="footer-links">
                <a v-if="showForgot" href="#" class="footer-link">忘记密码？</a>
                <a v-if="showRegister" href="#" class="footer-link">立即注册</a>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
/*
 * 平板端登录模板样式
 * 性能优化：
 * 1. 使用 CSS contain 优化渲染
 * 2. 使用 transform3d 启用GPU加速
 * 3. 减少动画元素数量
 * 4. 支持 prefers-reduced-motion
 */

/* CSS变量定义 - 统一管理动画时长 */
:root {
  --animation-duration-slow: 12s;
  --animation-duration-medium: 8s;
  --animation-duration-fast: 6s;
}

.ldesign-template-login.ldesign-template-tablet {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #48cae4, #023e8a);
  /* 性能优化：使用 contain 属性优化渲染 */
  contain: layout style paint;
}

/* 平板背景 - 优化：添加渲染优化 */
.ldesign-template-tablet-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  /* 性能优化：隔离背景层的渲染 */
  contain: strict;
}

/* 装饰元素 - 优化：添加性能提示和GPU加速 */
.ldesign-template-tablet-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  /* 性能优化：隔离装饰层 */
  contain: layout style;

  .ldesign-template-decoration-hexagon {
    position: absolute;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.08);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    animation: rotate-hexagon var(--animation-duration-slow) linear infinite;
    /* 性能优化：使用will-change提示浏览器优化 */
    will-change: transform, opacity;
    /* 性能优化：强制GPU加速 */
    transform: translate3d(0, 0, 0);

    &.ldesign-template-hex-1 {
      top: 20%;
      right: 20%;
      animation-delay: 0s;
    }

    &.ldesign-template-hex-2 {
      top: 60%;
      left: 15%;
      animation-delay: 4s;
      transform: scale(0.8) translate3d(0, 0, 0);
    }

    /* Bug修复：修正类名 .hex-3 -> .ldesign-template-hex-3 */
    &.ldesign-template-hex-3 {
      bottom: 20%;
      right: 30%;
      animation-delay: 8s;
      transform: scale(1.2) translate3d(0, 0, 0);
    }
  }

  .ldesign-template-decoration-grid {
    position: absolute;
    top: 10%;
    left: 10%;
    width: 150px;
    height: 150px;
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 20px 20px;
    animation: grid-move 15s linear infinite;
    /* 性能优化：GPU加速 */
    will-change: transform;
    transform: translate3d(0, 0, 0);
  }

  .decoration-particles {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .particle {
      position: absolute;
      width: 4px;
      height: 4px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 50%;
      animation: particle-float var(--animation-duration-medium) ease-in-out infinite;
      /* 性能优化：GPU加速和will-change */
      will-change: transform, opacity;
      transform: translate3d(0, 0, 0);

      /* 优化：只保留4个粒子，减少50%的DOM和动画开销 */
      &.particle-1 {
        top: 20%;
        left: 15%;
        animation-delay: 1s;
        animation-duration: var(--animation-duration-fast);
      }

      &.particle-2 {
        top: 35%;
        left: 80%;
        animation-delay: 2s;
        animation-duration: 7s;
      }

      &.particle-3 {
        top: 60%;
        left: 25%;
        animation-delay: 3s;
        animation-duration: var(--animation-duration-medium);
      }

      &.particle-4 {
        top: 75%;
        left: 70%;
        animation-delay: 4s;
        animation-duration: 9s;
      }
    }
  }
}

/* 动画定义 - 优化：使用transform3d启用GPU加速 */
@keyframes rotate-hexagon {
  0% {
    transform: rotate(0deg) scale(1) translate3d(0, 0, 0);
    opacity: 0.8;
  }

  50% {
    transform: rotate(180deg) scale(1.1) translate3d(0, 0, 0);
    opacity: 0.4;
  }

  100% {
    transform: rotate(360deg) scale(1) translate3d(0, 0, 0);
    opacity: 0.8;
  }
}

@keyframes grid-move {
  0% {
    transform: translate3d(0, 0, 0);
  }

  100% {
    transform: translate3d(20px, 20px, 0);
  }
}

@keyframes particle-float {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translate3d(0, -20px, 0) scale(1.2);
    opacity: 1;
  }
}

/* 可访问性：支持减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  .ldesign-template-tablet-decorations * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 主容器 - 优化：添加渲染优化 */
.tablet-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--ls-padding-lg);
  /* 性能优化：优化容器渲染 */
  contain: layout;
}

/* 头部区域 - 优化：简化选择器嵌套 */
.tablet-header {
  text-align: center;
  padding: var(--ls-padding-xl) 0;
}

.header-content {
  /* 性能优化：静态内容使用v-once，减少不必要的渲染 */
  .logo-section {
    margin-bottom: var(--ls-margin-lg);

    .logo-image {
      height: 80px;
      width: auto;
      object-fit: contain;
    }
  }

  .app-icon {
    font-size: 4rem;
    margin-bottom: var(--ls-margin-lg);
  }

  .app-title {
    font-size: var(--ls-font-size-h1);
    font-weight: 700;
    color: var(--ldesign-font-white-1);
    margin-bottom: var(--ls-margin-sm);
  }

  .app-subtitle {
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-font-white-3);
    margin: 0;
  }
}

.ldesign-template-header-selectors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-margin-lg);
  padding: var(--ls-padding-sm);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--ls-border-radius-lg);
  backdrop-filter: blur(10px);

  .ldesign-template-selector-item {
    display: flex;
    align-items: center;

    .ldesign-template-selector-placeholder {
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 15px;
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.3);
        border-color: rgba(255, 255, 255, 0.5);
        transform: scale(1.05);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}

/* 主要内容区域
 */
.tablet-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录面板 - 优化：添加渲染优化 */
.login-panel {
  background: var(--ldesign-bg-color-container);
  backdrop-filter: blur(20px);
  border-radius: var(--ls-border-radius-xl);
  padding: var(--ls-padding-xxl);
  width: 100%;
  max-width: 500px;
  min-height: 400px;
  box-shadow: var(--ldesign-shadow-3);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  /* 性能优化：隔离面板渲染 */
  contain: layout style;
  /* 性能优化：优化backdrop-filter性能 */
  will-change: transform;
}

/* 面板内容
 */
.panel-content {
  flex: 1;
  margin: var(--ls-margin-lg) 0;
  min-height: 200px;
}

/* 面板底部
 */
.panel-footer {
  margin-top: auto;
  text-align: center;
  padding-top: var(--ls-padding-lg);
  border-top: 1px solid var(--ldesign-border-level-1-color);

  .footer-links {
    display: flex;
    justify-content: center;
    gap: var(--ls-spacing-xxl);

    .footer-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: var(--ls-font-size-base);
      transition: all 0.3s ease;

      &:hover {
        color: var(--secondary-color);
        transform: translateY(-2px);
      }
    }
  }
}

/* 响应式设置 */
@media (max-width: 768px) {
  .tablet-container {
    padding: var(--ls-padding-base);
  }

  .login-panel {
    padding: var(--ls-padding-xl);
    min-height: 350px;
  }

  .tablet-header .header-content .app-title {
    font-size: var(--ls-font-size-h2);
  }
}

/* 横屏模式优化 - 使用类名而非媒体查询，性能更好 */
.ldesign-template-tablet.is-landscape {
  .tablet-container {
    flex-direction: row;
    align-items: center;
    gap: var(--ls-spacing-xl);
  }

  .tablet-header {
    flex: 1;
    padding-right: var(--ls-padding-xl);
    text-align: left;
  }

  .tablet-main {
    flex: 1;
  }

  .login-panel {
    max-width: 600px;
  }
}

/* 触摸设备优化 */
.ldesign-template-tablet.is-touch {
  /* 增大触摸目标 */
  .ldesign-template-selector-placeholder {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }

  .footer-link {
    padding: var(--ls-padding-sm);
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  /* 触摸反馈 */
  .ldesign-template-selector-placeholder:active,
  .footer-link:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
}

/* 键盘可见时优化 */
.ldesign-template-tablet.keyboard-visible {
  .tablet-header {
    padding: var(--ls-padding-base) 0;
  }

  .app-title {
    font-size: var(--ls-font-size-h3);
  }

  .app-subtitle {
    display: none;
  }

  .ldesign-template-header-selectors {
    display: none;
  }
}

/* 横屏模式媒体查询回退 */
@media (orientation: landscape) and (min-width: 768px) {
  .tablet-container {
    flex-direction: row;
    align-items: center;
  }

  .tablet-header {
    flex: 1;
    padding-right: var(--ls-padding-xl);
  }

  .tablet-main {
    flex: 1;
  }
}
</style>


