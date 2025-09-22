<script setup lang="ts">
import { computed } from 'vue'
import type { LoginTemplateProps } from '../../types'

// 简化的Props接口
const props = withDefaults(defineProps<LoginTemplateProps>(), {
  primaryColor: 'var(--ldesign-brand-color)',
  secondaryColor: 'var(--ldesign-brand-color-6)',
  backgroundImage: '',
  enableAnimations: true,
})

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
}))

const backgroundStyle = computed(() => {
  if (props.backgroundImage) {
    return {
      backgroundImage: `url(${props.backgroundImage})`,
    }
  }
  return {}
})

// 配置选择器事件处理方法
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
  <div class="ldesign-template-login ldesign-template-modern" :style="cssVars">
    <!-- 简化的现代背景 -->
    <div class="ldesign-template-background-container" :style="backgroundStyle">
      <!-- 保留基础渐变背景 -->
      <div class="ldesign-template-gradient-bg ldesign-template-gradient-primary"></div>
      <div class="ldesign-template-gradient-bg ldesign-template-gradient-secondary"></div>

      <!-- 简化的毛玻璃装饰球 -->
      <div v-if="enableAnimations" class="ldesign-template-glass-orbs">
        <div class="ldesign-template-glass-orb ldesign-template-orb-1"></div>
        <div class="ldesign-template-glass-orb ldesign-template-orb-2"></div>
      </div>

      <!-- 保留基础几何图案 -->
      <div class="ldesign-template-modern-patterns">
        <div class="ldesign-template-pattern-hexagon"></div>
        <div class="ldesign-template-pattern-triangle"></div>
        <div class="ldesign-template-pattern-dots"></div>
      </div>
    </div>

    <!-- 登录容器 -->
    <div class="ldesign-template-login-container">
      <div class="ldesign-template-login-panel">
        <!-- 头部区域 -->
        <div class="ldesign-template-panel-header">
          <slot name="header">
            <!-- 默认为空，由使用者自定义 -->
          </slot>
        </div>

        <!-- 内容区域 - 空白面板 -->
        <div class="ldesign-template-panel-content">
          <slot name="selector">
            <!-- 模板选择器将在这里显示 -->
          </slot>
          <slot name="content">
            <div class="ldesign-template-content-placeholder">
              <div class="ldesign-template-modern-placeholder-icon">✨</div>
              <p class="ldesign-template-placeholder-text">现代化登录表单内容区域</p>
              <p class="ldesign-template-placeholder-hint">请通过 content 插槽添加登录表单</p>
            </div>
          </slot>
        </div>

        <!-- 底部区域 -->
        <div class="ldesign-template-panel-footer">
          <slot name="footer">
            <!-- 默认为空，由使用者自定义 -->
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ldesign-template-login.ldesign-template-modern {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

// 简化的背景容器
.ldesign-template-background-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .ldesign-template-gradient-bg {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: gradient-shift 10s ease-in-out infinite;

    &.ldesign-template-gradient-primary {
      background: linear-gradient(135deg,
          var(--ldesign-brand-color-3) 0%,
          var(--ldesign-brand-color-7) 50%,
          var(--ldesign-brand-color-9) 100%);
    }

    &.ldesign-template-gradient-secondary {
      background: linear-gradient(45deg,
          rgba(255, 255, 255, 0.1) 0%,
          rgba(255, 255, 255, 0.05) 100%);
      animation-delay: -5s;
    }
  }

  // 简化的毛玻璃装饰球
  .ldesign-template-glass-orbs {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .ldesign-template-glass-orb {
      position: absolute;
      border-radius: 50%;
      backdrop-filter: blur(20px);
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      animation: float-orb 15s ease-in-out infinite;

      &.ldesign-template-orb-1 {
        width: 150px;
        height: 150px;
        top: 15%;
        right: 20%;
      }

      &.ldesign-template-orb-2 {
        width: 100px;
        height: 100px;
        bottom: 25%;
        left: 15%;
        animation-delay: -8s;
      }
    }
  }

  // 简化的几何图案
  .ldesign-template-modern-patterns {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .ldesign-template-pattern-hexagon {
      position: absolute;
      width: 40px;
      height: 40px;
      top: 30%;
      left: 20%;
      background: rgba(255, 255, 255, 0.05);
      clip-path: polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%);
      animation: rotate-slow 20s linear infinite;
    }

    .ldesign-template-pattern-triangle {
      position: absolute;
      width: 30px;
      height: 30px;
      top: 65%;
      right: 30%;
      background: rgba(255, 255, 255, 0.05);
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      animation: rotate-slow 15s linear infinite reverse;
    }

    .ldesign-template-pattern-dots {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.05) 1px, transparent 0);
      background-size: 50px 50px;
      opacity: 0.3;
    }
  }
}

@keyframes gradient-shift {

  0%,
  100% {
    filter: hue-rotate(0deg) brightness(1);
  }

  50% {
    filter: hue-rotate(15deg) brightness(1.05);
  }
}

@keyframes float-orb {

  0%,
  100% {
    transform: translateY(0px) translateX(0px) scale(1);
  }

  50% {
    transform: translateY(-15px) translateX(8px) scale(1.02);
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

// 登录容器
.ldesign-template-login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 450px;
  padding: var(--ls-padding-base);
}

.ldesign-template-login-panel {
  background: var(--ldesign-bg-color-container);
  backdrop-filter: blur(20px);
  border-radius: var(--ls-border-radius-xl);
  box-shadow: var(--ldesign-shadow-3);
  padding: var(--ls-padding-xl);
  width: 450px;
  min-height: 500px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  transform: translateY(20px);
  opacity: 0;
  animation: panel-enter 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

// 面板头部
.ldesign-template-panel-header {
  text-align: center;
  margin-bottom: var(--ls-margin-lg);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ldesign-template-header-selectors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ls-spacing-sm);
  margin-bottom: var(--ls-margin-base);
  padding: var(--ls-padding-sm);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--ls-border-radius-xl);
  backdrop-filter: blur(20px);

  .ldesign-template-selector-item {
    display: flex;
    align-items: center;

    .ldesign-template-selector-placeholder {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: var(--ls-border-radius-xl);
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 16px;
      color: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

      &:hover {
        transform: translateY(-4px) scale(1.1);
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      }

      &:active {
        transform: translateY(-2px) scale(1.05);
      }
    }
  }
}

// 面板内容
.ldesign-template-panel-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: var(--ls-margin-lg) 0;
  min-height: 300px;
  border: 2px dashed var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);
  backdrop-filter: blur(10px);

  .ldesign-template-content-placeholder {
    text-align: center;
    padding: var(--ls-padding-lg);

    .ldesign-template-modern-placeholder-icon {
      font-size: 3rem;
      margin-bottom: var(--ls-margin-base);
      animation: float 3s ease-in-out infinite;
    }

    .ldesign-template-placeholder-text {
      font-size: var(--ls-font-size-base);
      color: var(--ldesign-text-color-secondary);
      margin-bottom: var(--ls-margin-xs);
      font-weight: 500;
    }

    .ldesign-template-placeholder-hint {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-placeholder);
    }
  }
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-8px);
  }
}

// 面板底部
.ldesign-template-panel-footer {
  margin-top: auto;
  text-align: center;
  padding-top: var(--ls-padding-base);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}





// 响应式设计
@media (max-width: 768px) {
  .ldesign-template-login-container {
    padding: var(--ls-padding-sm);
    max-width: 100%;
  }

  .ldesign-template-login-panel {
    width: 100%;
    max-width: 400px;
    min-height: 450px;
    padding: var(--ls-padding-lg);
  }

  .ldesign-template-panel-header {
    .ldesign-template-panel-title {
      font-size: var(--ls-font-size-h3);
    }
  }
}

@media (max-width: 480px) {
  .ldesign-template-login-panel {
    max-width: 350px;
    min-height: 400px;
    padding: var(--ls-padding-base);
  }

  .ldesign-template-panel-content {
    min-height: 150px;
  }

  .ldesign-template-footer-links {
    flex-direction: column;
    gap: var(--ls-spacing-sm);
  }
}
</style>
