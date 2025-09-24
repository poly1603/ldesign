<script setup lang="ts">
import { computed } from 'vue'
import type { LoginTemplateProps } from '../../types'

/* 使用统一的Props接口
 */
const props = withDefaults(defineProps<LoginTemplateProps>(), {
  title: '移动端登录',
  subtitle: '随时随地，安全登录',
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
  <div class="ldesign-template-login ldesign-template-mobile" :style="cssVars">
    <!-- 移动端优化背景-->
    <div class="ldesign-template-mobile-background" :style="backgroundStyle">
      <!-- 移动端专用装饰元素-->
      <div v-if="enableAnimations" class="ldesign-template-mobile-decorations">
        <div class="ldesign-template-decoration-bubble ldesign-template-bubble-1"></div>
        <div class="ldesign-template-decoration-bubble ldesign-template-bubble-2"></div>
        <div class="ldesign-template-decoration-bubble ldesign-template-bubble-3"></div>
        <div class="ldesign-template-decoration-line ldesign-template-line-1"></div>
        <div class="ldesign-template-decoration-line ldesign-template-line-2"></div>
      </div>
    </div>

    <div class="ldesign-template-mobile-container">
      <!-- 头部区域 -->
      <div class="ldesign-template-mobile-header">
        <slot name="header">
          <div class="ldesign-template-header-content">
            <div v-if="logoUrl" class="ldesign-template-logo-section">
              <img :src="logoUrl" :alt="title" class="ldesign-template-logo-image">
            </div>
            <div v-else class="ldesign-template-app-icon">📱</div>
            <h1 class="ldesign-template-app-title">{{ title }}</h1>
            <p class="ldesign-template-app-subtitle">{{ subtitle }}</p>
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
      <div class="ldesign-template-mobile-main">
        <!-- 登录面板 -->
        <div class="ldesign-template-login-panel">
          <!-- 内容区域 -->
          <div class="ldesign-template-panel-content">
            <slot name="content">
              <!-- 移动端登录表单内容区域，留空供插槽使用-->
            </slot>
          </div>

          <!-- 底部区域 -->
          <div class="ldesign-template-panel-footer">
            <slot name="footer">
              <div class="ldesign-template-footer-links">
                <a v-if="showForgot" href="#" class="ldesign-template-footer-link">忘记密码？</a>
                <a v-if="showRegister" href="#" class="ldesign-template-footer-link">立即注册</a>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
/* 移动端登录模板样式 */
.ldesign-template-login.ldesign-template-mobile {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #ff6b6b, #feca57);
}

/* 移动端背景 */
.ldesign-template-mobile-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

/* 装饰元素
 */
.ldesign-template-mobile-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  .ldesign-template-decoration-bubble {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    animation: float-mobile 6s ease-in-out infinite;

    &.ldesign-template-bubble-1 {
      width: 60px;
      height: 60px;
      top: 20%;
      right: 20%;
      animation-delay: 0s;
    }

    &.ldesign-template-bubble-2 {
      width: 40px;
      height: 40px;
      top: 60%;
      left: 15%;
      animation-delay: 2s;
    }

    &.ldesign-template-bubble-3 {
      width: 80px;
      height: 80px;
      bottom: 30%;
      right: 10%;
      animation-delay: 4s;
    }
  }

  .ldesign-template-decoration-line {
    position: absolute;
    width: 2px;
    height: 100px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: slide-mobile 8s linear infinite;

    &.ldesign-template-line-1 {
      top: 10%;
      left: 30%;
      animation-delay: 0s;
    }

    &.ldesign-template-line-2 {
      top: 50%;
      right: 25%;
      animation-delay: 4s;
    }
  }
}

@keyframes float-mobile {

  0%,
  100% {
    transform: translateY(0) scale(1);
  }

  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

@keyframes slide-mobile {
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    transform: translateY(100px);
    opacity: 0;
  }
}

/* 主容☰ */
.ldesign-template-mobile-container {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: var(--ls-padding-base);
}

/* 头部区域
 */
.ldesign-template-mobile-header {
  text-align: center;
  padding: var(--ls-padding-lg) 0;

  .ldesign-template-header-content {
    .ldesign-template-logo-section {
      margin-bottom: var(--ls-margin-base);

      .ldesign-template-logo-image {
        height: 60px;
        width: auto;
        object-fit: contain;
      }
    }

    .ldesign-template-app-icon {
      font-size: 3rem;
      margin-bottom: var(--ls-margin-base);
    }

    .ldesign-template-app-title {
      font-size: var(--ls-font-size-h2);
      font-weight: 700;
      color: var(--ldesign-font-white-1);
      margin-bottom: var(--ls-margin-xs);
    }

    .ldesign-template-app-subtitle {
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-font-white-3);
      margin: 0;
    }
  }
}

.ldesign-template-header-selectors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-xs);
  margin-bottom: var(--ls-margin-base);
  padding: var(--ls-padding-xs);
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--ls-border-radius-base);
  backdrop-filter: blur(8px);

  .ldesign-template-selector-item {
    display: flex;
    align-items: center;

    .ldesign-template-selector-placeholder {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: var(--ls-border-radius-base);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 13px;
      color: white;

      &:hover {
        background: rgba(255, 255, 255, 0.25);
        border-color: rgba(255, 255, 255, 0.4);
        transform: scale(1.1);
      }

      &:active {
        transform: scale(0.9);
      }
    }
  }
}

/* 主要内容区域
 */
.ldesign-template-mobile-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-base) 0;
}

/* 登录面板
 */
.ldesign-template-login-panel {
  background: var(--ldesign-bg-color-container);
  backdrop-filter: blur(20px);
  border-radius: var(--ls-border-radius-lg);
  padding: var(--ls-padding-xl);
  width: 100%;
  max-width: 400px;
  min-height: 300px;
  box-shadow: var(--ldesign-shadow-2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
}

/* 面板内容
 */
.ldesign-template-panel-content {
  flex: 1;
  margin: var(--ls-margin-base) 0;
  min-height: 150px;
}

/* 面板底部
 */
.ldesign-template-panel-footer {
  margin-top: auto;
  text-align: center;
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);

  .ldesign-template-footer-links {
    display: flex;
    justify-content: center;
    gap: var(--ls-spacing-lg);

    .ldesign-template-footer-link {
      color: var(--primary-color);
      text-decoration: none;
      font-size: var(--ls-font-size-sm);
      transition: all 0.3s ease;

      &:hover {
        color: var(--secondary-color);
        transform: translateY(-1px);
      }
    }
  }
}

/* 响应式设置 */
@media (max-width: 480px) {
  .ldesign-template-mobile-container {
    padding: var(--ls-padding-sm);
  }

  .ldesign-template-login-panel {
    padding: var(--ls-padding-lg);
    min-height: 250px;
  }

  .ldesign-template-mobile-header .ldesign-template-header-content .ldesign-template-app-title {
    font-size: var(--ls-font-size-h3);
  }
}

/* 超小屏幕优化
 */
@media (max-width: 320px) {
  .ldesign-template-mobile-container {
    padding: var(--ls-padding-xs);
  }

  .ldesign-template-login-panel {
    padding: var(--ls-padding-base);
  }
}
</style>


