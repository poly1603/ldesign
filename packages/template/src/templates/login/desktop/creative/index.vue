<script setup lang="ts">
import { computed } from 'vue'
import type { LoginTemplateProps } from '../../types'

/* 简化的Props接口
 */
const props = withDefaults(defineProps<LoginTemplateProps>(), {
  primaryColor: '#ff6b6b',
  secondaryColor: '#4ecdc4',
  backgroundImage: '',
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
  <div class="ldesign-template-login ldesign-template-creative" :style="cssVars">
    <!-- 简化的创意背景 -->
    <div class="ldesign-template-creative-background" :style="backgroundStyle">
      <!-- 保留基础几何形状 -->
      <div v-if="enableAnimations" class="ldesign-template-bg-shapes">
        <div class="ldesign-template-shape ldesign-template-shape-1"></div>
        <div class="ldesign-template-shape ldesign-template-shape-2"></div>
        <div class="ldesign-template-shape ldesign-template-shape-3"></div>
      </div>
    </div>

    <div class="ldesign-template-creative-container">
      <!-- 左侧装饰区域 -->
      <div class="ldesign-template-artwork-section">
        <slot name="artwork">
          <div class="ldesign-template-artwork-content">
            <div v-if="enableAnimations" class="ldesign-template-floating-elements">
              <div class="ldesign-template-element ldesign-template-element-circle"></div>
              <div class="ldesign-template-element ldesign-template-element-triangle"></div>
              <div class="ldesign-template-element ldesign-template-element-square"></div>
            </div>
            <div class="ldesign-template-artwork-placeholder">
              <div class="ldesign-template-placeholder-icon">🎨</div>
              <p class="ldesign-template-placeholder-text">创意展示区域</p>
            </div>
          </div>
        </slot>
      </div>

      <!-- 右侧登录区域 -->
      <div class="ldesign-template-login-section">
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
              <!-- 模板选择器将在这里显示-->
            </slot>
            <slot name="content">
              <div class="ldesign-template-content-placeholder">
                <div class="ldesign-template-creative-placeholder-icon">🎨</div>
                <p class="ldesign-template-placeholder-text">创意登录表单内容区域</p>
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

          <!-- 保留基础装饰元素 -->
          <div v-if="enableAnimations" class="ldesign-template-creative-decorations">
            <div class="ldesign-template-decoration ldesign-template-decoration-1"></div>
            <div class="ldesign-template-decoration ldesign-template-decoration-2"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ldesign-template-login.ldesign-template-creative {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, var(--ldesign-brand-color-2) 0%, var(--ldesign-brand-color-8) 100%);
}

/* 简化的创意背景
 */
.ldesign-template-creative-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;

  .ldesign-template-bg-shapes {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    .ldesign-template-shape {
      position: absolute;
      border-radius: 50%;
      opacity: 0.1;
      animation: float-shape 20s linear infinite;

      &.ldesign-template-shape-1 {
        width: 150px;
        height: 150px;
        background: var(--primary-color);
        top: 15%;
        left: 10%;
      }

      &.ldesign-template-shape-2 {
        width: 100px;
        height: 100px;
        background: var(--secondary-color);
        top: 60%;
        right: 15%;
        animation-delay: -8s;
      }

      &.ldesign-template-shape-3 {
        width: 80px;
        height: 80px;
        background: var(--tertiary-color);
        bottom: 25%;
        left: 20%;
        animation-delay: -15s;
        clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      }
    }
  }
}

@keyframes float-shape {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg) scale(1);
  }

  50% {
    transform: translateY(-15px) rotate(180deg) scale(1.05);
  }
}

/* 主容☰ */
.ldesign-template-creative-container {
  position: relative;
  z-index: 10;
  display: flex;
  min-height: 100vh;
}

/* 左侧装饰区域
 */
.ldesign-template-artwork-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;

  .ldesign-template-artwork-content {
    text-align: center;
    color: white;
    position: relative;

    .ldesign-template-floating-elements {
      position: absolute;
      top: -50px;
      left: -50px;
      right: -50px;
      bottom: -50px;

      .ldesign-template-element {
        position: absolute;
        animation: float-element 15s ease-in-out infinite;

        &.ldesign-template-element-circle {
          width: 40px;
          height: 40px;
          background: var(--primary-color);
          border-radius: 50%;
          top: 20%;
          left: 20%;
          opacity: 0.6;
        }

        &.ldesign-template-element-triangle {
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 30px solid var(--secondary-color);
          top: 70%;
          right: 30%;
          opacity: 0.6;
          animation-delay: -5s;
        }

        &.ldesign-template-element-square {
          width: 30px;
          height: 30px;
          background: var(--tertiary-color);
          transform: rotate(45deg);
          top: 50%;
          left: 70%;
          opacity: 0.6;
          animation-delay: -10s;
        }
      }
    }

    .ldesign-template-artwork-placeholder {
      .ldesign-template-placeholder-icon {
        font-size: 4rem;
        margin-bottom: var(--ls-margin-base);
        opacity: 0.7;
      }

      .ldesign-template-placeholder-text {
        font-size: var(--ls-font-size-lg);
        color: rgba(255, 255, 255, 0.8);
        font-weight: 300;
      }
    }
  }
}

@keyframes float-element {

  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
  }

  50% {
    transform: translateY(-10px) rotate(180deg);
  }
}

/* 右侧登录区域
 */
.ldesign-template-login-section {
  width: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--ls-padding-base);
}

.ldesign-template-login-panel {
  background: var(--ldesign-bg-color-container);
  backdrop-filter: blur(20px);
  border-radius: var(--ls-border-radius-xl);
  padding: var(--ls-padding-xl);
  width: 100%;
  min-height: 500px;
  position: relative;
  box-shadow: var(--ldesign-shadow-3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面板头部
 */
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
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--ls-border-radius-lg);
  backdrop-filter: blur(10px);

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
      border-radius: var(--ls-border-radius-lg);
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 16px;
      color: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

      &:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }

      &:active {
        transform: translateY(0) scale(0.95);
      }
    }
  }
}

/* 面板内容
 */
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
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    opacity: 0.05;
    pointer-events: none;
  }

  .ldesign-template-content-placeholder {
    text-align: center;
    padding: var(--ls-padding-lg);
    position: relative;
    z-index: 2;

    .ldesign-template-creative-placeholder-icon {
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

/* 面板底部
 */
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

/* 简化的装饰元素
 */
.ldesign-template-creative-decorations {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;

  .ldesign-template-decoration {
    position: absolute;
    border-radius: 50%;
    background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
    opacity: 0.1;
    animation: float-decoration 8s ease-in-out infinite;

    &.ldesign-template-decoration-1 {
      width: 20px;
      height: 20px;
      top: 15%;
      right: 15%;
    }

    &.ldesign-template-decoration-2 {
      width: 15px;
      height: 15px;
      bottom: 25%;
      left: 20%;
      animation-delay: 4s;
    }
  }
}

@keyframes float-decoration {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-8px) rotate(180deg);
  }
}

/* 响应式设置 */
@media (max-width: 1024px) {
  .ldesign-template-creative-container {
    flex-direction: column;
  }

  .ldesign-template-artwork-section {
    min-height: 30vh;
  }

  .ldesign-template-login-section {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .ldesign-template-login-panel {
    padding: var(--ls-padding-lg);
    border-radius: var(--ls-border-radius-lg);
    min-height: 400px;
  }

  .ldesign-template-panel-content {
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .ldesign-template-login-panel {
    padding: var(--ls-padding-base);
    min-height: 350px;
  }

  .ldesign-template-panel-content {
    min-height: 200px;
  }
}
</style>
