<script setup lang="ts">
import { computed, ref } from 'vue'
import type { LoginTemplateProps } from '../../types'
import TemplateConfigPanel from '../../../../components/TemplateConfigPanel.vue'

// 简化的Props接口，只保留基础配置
const props = withDefaults(defineProps<LoginTemplateProps>(), {
  primaryColor: 'var(--ldesign-brand-color)',
  secondaryColor: 'var(--ldesign-brand-color-6)',
  backgroundImage: '',
  enableAnimations: true,
})

// 计算属性
const backgroundStyle = computed(() => {
  if (props.backgroundImage) {
    return {
      backgroundImage: `url(${props.backgroundImage})`,
    }
  }
  return {}
})

// CSS变量
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
}))

// 配置面板状态
const showConfigPanel = ref(false)
const currentTemplate = ref('login-desktop-default')

// 配置面板相关方法
const handleTemplateSelect = (templateName: string) => {
  currentTemplate.value = templateName
  console.log('Selected template:', templateName)
}

const handleThemeChange = (theme: string) => {
  console.log('Theme changed:', theme)
}

const handleLanguageChange = (language: string) => {
  console.log('Language changed:', language)
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('Dark mode changed:', isDark)
}
</script>

<template>
  <div class="ldesign-template-login ldesign-template-default" :style="cssVars">
    <!-- 简化的专业背景 -->
    <div class="ldesign-template-professional-background" :style="backgroundStyle">
      <div class="ldesign-template-background-overlay"></div>
      <!-- 保留基础几何装饰 -->
      <div v-if="enableAnimations" class="ldesign-template-geometric-decoration">
        <div class="ldesign-template-geo-shape ldesign-template-geo-circle-1"></div>
        <div class="ldesign-template-geo-shape ldesign-template-geo-circle-2"></div>
        <div class="ldesign-template-geo-shape ldesign-template-geo-square-1"></div>
      </div>
    </div>

    <!-- 登录容器 -->
    <div class="ldesign-template-login-container">
      <div class="ldesign-template-login-panel">
        <!-- 头部区域 - 简化为插槽 -->
        <div class="ldesign-template-panel-header">
          <slot name="header">
            <!-- 默认为空，由使用者自定义 -->
          </slot>
        </div>

        <!-- 内容区域 - 空白面板 -->
        <div class="ldesign-template-panel-content">
          <slot name="content">
            <slot name="selector">
              <!-- 模板选择器将在这里显示 -->
            </slot>
            <div class="ldesign-template-content-placeholder">
              <div class="ldesign-template-placeholder-icon">📝</div>
              <p class="ldesign-template-placeholder-text">登录表单内容区域</p>
              <p class="ldesign-template-placeholder-hint">请通过 content 插槽添加登录表单</p>
            </div>
          </slot>
        </div>

        <!-- 底部区域 - 简化为插槽 -->
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
.ldesign-template-login.ldesign-template-default {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.ldesign-template-professional-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--ldesign-brand-color-2) 0%, var(--ldesign-brand-color-8) 100%);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  .ldesign-template-background-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  // 简化的几何装饰
  .ldesign-template-geometric-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;

    .ldesign-template-geo-shape {
      position: absolute;
      opacity: 0.1;

      &.ldesign-template-geo-circle-1 {
        width: 200px;
        height: 200px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        top: -100px;
        right: -100px;
      }

      &.ldesign-template-geo-circle-2 {
        width: 150px;
        height: 150px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        bottom: -75px;
        left: -75px;
      }

      &.ldesign-template-geo-square-1 {
        width: 80px;
        height: 80px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        transform: rotate(45deg);
        top: 30%;
        left: 15%;
      }
    }
  }
}

.ldesign-template-login-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 400px;
  padding: var(--ls-padding-base);
}

.ldesign-template-login-panel {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-lg);
  box-shadow: var(--ldesign-shadow-3);
  padding: var(--ls-padding-xl);
  width: 400px;
  min-height: 500px;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
}

.ldesign-template-panel-header {
  text-align: center;
  margin-bottom: var(--ls-margin-lg);
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ldesign-template-panel-content {
  flex: 1;
  margin: var(--ls-margin-lg) 0;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed var(--ldesign-border-level-2-color);
  border-radius: var(--ls-border-radius-base);
  background: var(--ldesign-bg-color-component);

  .ldesign-template-content-placeholder {
    text-align: center;
    padding: var(--ls-padding-lg);

    .ldesign-template-placeholder-icon {
      font-size: 3rem;
      margin-bottom: var(--ls-margin-base);
      opacity: 0.6;
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
    max-width: 350px;
    min-height: 450px;
    padding: var(--ls-padding-lg);
  }

  .ldesign-template-panel-content {
    min-height: 250px;
  }
}

@media (max-width: 480px) {
  .ldesign-template-login-panel {
    max-width: 300px;
    min-height: 400px;
    padding: var(--ls-padding-base);
  }

  .ldesign-template-panel-content {
    min-height: 200px;
  }
}
</style>
