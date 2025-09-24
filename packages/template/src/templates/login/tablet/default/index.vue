<script setup lang="ts">
import { computed } from 'vue'
import type { LoginTemplateProps } from '../../types'

/* 使用统一的Props接口
 */
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

/* 计算属性 */
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
  '--tertiary-color': '#45b7d1',
}))

const backgroundStyle = computed(() => {
  if (props.backgroundImage) {
    return {
      backgroundImage: `url(${props.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    }
  }
  return {}
})

/* 配置选择器事件处理方法 */
const handleThemeChange = (theme: string) => {
  console.log('主题切换:', theme)
}

const handleLanguageChange = (language: string) => {
  console.log('语言切换:', language)
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('暗黑模式切换:', isDark)
}

const handleSizeChange = (size: string) => {
  console.log('尺寸切换:', size)
}


</script>

<template>
  <div class="ldesign-template-login ldesign-template-tablet" :style="cssVars">
    <!-- 平板优化背景 -->
    <div class="ldesign-template-tablet-background" :style="backgroundStyle">
      <!-- 平板专用装饰元素 -->
      <div v-if="enableAnimations" class="ldesign-template-tablet-decorations">
        <div class="ldesign-template-decoration-hexagon ldesign-template-hex-1"></div>
        <div class="ldesign-template-decoration-hexagon ldesign-template-hex-2"></div>
        <div class="ldesign-template-decoration-hexagon ldesign-template-hex-3"></div>
        <div class="ldesign-template-decoration-grid"></div>
        <div class="decoration-particles">
          <div class="particle particle-1"></div>
          <div class="particle particle-2"></div>
          <div class="particle particle-3"></div>
          <div class="particle particle-4"></div>
          <div class="particle particle-5"></div>
          <div class="particle particle-6"></div>
          <div class="particle particle-7"></div>
          <div class="particle particle-8"></div>
        </div>
      </div>
    </div>

    <div class="tablet-container">
      <!-- 头部区域 -->
      <div class="tablet-header">
        <slot name="header">
          <div class="header-content">
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
/* 平板端登录模板样式 */
.ldesign-template-login.ldesign-template-tablet {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #48cae4, #023e8a);
}

/* 平板背景
 */
.ldesign-template-tablet-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* 装饰元素
 */
.ldesign-template-tablet-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .ldesign-template-decoration-hexagon {
    position: absolute;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.08);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    animation: rotate-hexagon 12s linear infinite;

    &.ldesign-template-hex-1 {
      top: 20%;
      right: 20%;
      animation-delay: 0s;
    }

    &.ldesign-template-hex-2 {
      top: 60%;
      left: 15%;
      animation-delay: 4s;
      transform: scale(0.8);
    }

    &.hex-3 {
      bottom: 20%;
      right: 30%;
      animation-delay: 8s;
      transform: scale(1.2);
    }
  }

  .decoration-grid {
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
      animation: particle-float 8s ease-in-out infinite;

      &.particle-1 {
        top: 20%;
        left: 15%;
        animation-delay: 1s;
        animation-duration: 6s;
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
        animation-duration: 8s;
      }

      &.particle-4 {
        top: 75%;
        left: 70%;
        animation-delay: 4s;
        animation-duration: 9s;
      }

      &.particle-5 {
        top: 45%;
        left: 50%;
        animation-delay: 5s;
        animation-duration: 10s;
      }

      &.particle-6 {
        top: 15%;
        left: 60%;
        animation-delay: 6s;
        animation-duration: 7s;
      }

      &.particle-7 {
        top: 85%;
        left: 30%;
        animation-delay: 7s;
        animation-duration: 8s;
      }

      &.particle-8 {
        top: 25%;
        left: 85%;
        animation-delay: 8s;
        animation-duration: 6s;
      }
    }
  }
}

@keyframes rotate-hexagon {
  0% {
    transform: rotate(0deg) scale(1);
    opacity: 0.8;
  }

  50% {
    transform: rotate(180deg) scale(1.1);
    opacity: 0.4;
  }

  100% {
    transform: rotate(360deg) scale(1);
    opacity: 0.8;
  }
}

@keyframes grid-move {
  0% {
    transform: translate(0, 0);
  }

  100% {
    transform: translate(20px, 20px);
  }
}

@keyframes particle-float {

  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }

  50% {
    transform: translateY(-20px) scale(1.2);
    opacity: 1;
  }
}

/* 主容☰ */
.tablet-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--ls-padding-lg);
}

/* 头部区域
 */
.tablet-header {
  text-align: center;
  padding: var(--ls-padding-xl) 0;

  .header-content {
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

/* 登录面板
 */
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

/* 横屏模式优化
 */
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


