<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'


// 简化的Props接口，只保留布局相关配置
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  primaryColor: 'var(--ldesign-brand-color)',
  secondaryColor: 'var(--ldesign-brand-color-6)',
  showSidebar: true,
  collapsibleSidebar: true,
  sidebarCollapsed: false,
  enableAnimations: true,
})

// 响应式状态
const isCollapsed = ref(props.sidebarCollapsed)

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
  '--sidebar-width': isCollapsed.value ? '64px' : '240px',
}))

// 方法
const toggleSidebar = () => {
  if (props.collapsibleSidebar) {
    isCollapsed.value = !isCollapsed.value
  }
}

// 配置选择器事件处理方法
const handleThemeChange = (theme: string) => {
  console.log('Theme changed:', theme)
}

const handleLanguageChange = (language: string) => {
  console.log('Language changed:', language)
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('Dark mode changed:', isDark)
}

const handleSizeChange = (size: string) => {
  console.log('Size changed:', size)
}
</script>

<template>
  <div class="ldesign-template-dashboard ldesign-template-default-style" :style="cssVars">
    <!-- 头部区域 -->
    <header class="ldesign-template-dashboard-header">
      <button v-if="showSidebar && collapsibleSidebar" class="ldesign-template-sidebar-toggle" @click="toggleSidebar">
        <span class="ldesign-template-toggle-icon">☰</span>
      </button>
      <!-- Logo区域 -->
      <div class="ldesign-template-header-logo">
        <slot name="header-logo">
        </slot>
      </div>

      <!-- 导航区域 -->
      <div class="ldesign-template-header-nav">
        <slot name="header-nav">
          <!-- 默认为空，由使用者自定义 -->
        </slot>
      </div>

      <!-- 用户信息区域 -->
      <div class="ldesign-template-header-user">
        <slot name="header-user">
          <!-- 默认为空，由使用者自定义 -->
        </slot>
      </div>

      <div class="ldesign-template-header-selectors">
        <!-- 语言选择器 -->
        <div class="ldesign-template-selector-item">
          <slot name="language-selector" :on-language-change="handleLanguageChange">
            <!-- 默认语言选择器占位符 -->
            <div class="ldesign-template-selector-placeholder">🌍</div>
          </slot>
        </div>

        <!-- 主题色选择器 -->
        <div class="ldesign-template-selector-item">
          <slot name="color-selector" :on-theme-change="handleThemeChange">
            <!-- 默认主题选择器占位符 -->
            <div class="ldesign-template-selector-placeholder">🎨</div>
          </slot>
        </div>

        <!-- 暗黑模式切换器 -->
        <div class="ldesign-template-selector-item">
          <slot name="dark-mode-toggle" :on-dark-mode-change="handleDarkModeChange">
            <!-- 默认暗黑模式切换器占位符 -->
            <div class="ldesign-template-selector-placeholder">🌙</div>
          </slot>
        </div>

        <!-- 尺寸选择器 -->
        <div class="ldesign-template-selector-item">
          <slot name="size-selector" :on-size-change="handleSizeChange">
            <!-- 默认尺寸选择器占位符 -->
            <div class="ldesign-template-selector-placeholder">📏</div>
          </slot>
        </div>
      </div>

      <!-- 模板选择器区域 -->
      <div class="ldesign-template-header-selector">
        <slot name="selector">
          <!-- 模板选择器将在这里显示 -->
        </slot>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="ldesign-template-dashboard-body">
      <!-- 侧边栏 -->
      <aside v-if="showSidebar" class="ldesign-template-dashboard-sidebar"
        :class="{ 'ldesign-template-collapsed': isCollapsed }">
        <slot name="sidebar-menu">
          <div class="ldesign-template-sidebar-placeholder">
            <div class="ldesign-template-placeholder-icon">📋</div>
            <p v-if="!isCollapsed" class="ldesign-template-placeholder-text">侧边栏菜单区域</p>
            <p v-if="!isCollapsed" class="ldesign-template-placeholder-hint">请通过 sidebar-menu 插槽添加菜单</p>
          </div>
        </slot>
      </aside>

      <!-- 内容区域 -->
      <main class="ldesign-template-dashboard-content">
        <slot name="content">
          <div class="ldesign-template-content-placeholder">
            <div class="ldesign-template-placeholder-icon">📊</div>
            <p class="ldesign-template-placeholder-text">Dashboard 内容区域</p>
            <p class="ldesign-template-placeholder-hint">请通过 content 插槽添加内容</p>
          </div>
        </slot>
      </main>
    </div>

    <!-- 底部区域 -->
    <footer class="ldesign-template-dashboard-footer">
      <slot name="footer">
        <!-- 默认为空，由使用者自定义 -->
      </slot>
    </footer>


  </div>
</template>

<style lang="less" scoped>
.ldesign-template-dashboard.ldesign-template-default-style {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--ldesign-bg-color-page);
}

// 头部样式
.ldesign-template-dashboard-header {
  height: 64px;
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  display: flex;
  align-items: center;
  padding: 0 var(--ls-padding-lg);
  box-shadow: var(--ldesign-shadow-1);
  z-index: 100;

  .ldesign-template-header-logo {
    .ldesign-template-logo-container {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);

      .ldesign-template-sidebar-toggle {
        background: none;
        border: none;
        padding: var(--ls-padding-xs);
        cursor: pointer;
        border-radius: var(--ls-border-radius-sm);
        transition: all 0.3s ease;

        &:hover {
          background: var(--ldesign-bg-color-component);
        }

        .ldesign-template-toggle-icon {
          font-size: 18px;
          color: var(--ldesign-text-color-secondary);
        }
      }

      .ldesign-template-logo-image img {
        height: 32px;
        width: auto;
      }

      .ldesign-template-logo-placeholder {
        font-size: 24px;
      }

      .ldesign-template-app-title {
        font-size: var(--ls-font-size-lg);
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin: 0;
      }
    }
  }

  .ldesign-template-header-nav {
    flex: 1;
    margin-left: var(--ls-margin-lg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ldesign-template-header-user {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-base);
  }

  .ldesign-template-header-selectors {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    margin-left: var(--ls-margin-base);

    .ldesign-template-selector-item {
      display: flex;
      align-items: center;

      .ldesign-template-selector-placeholder {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--ldesign-bg-color-component);
        border: 1px solid var(--ldesign-border-level-1-color);
        border-radius: var(--ls-border-radius-base);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 16px;

        &:hover {
          background: var(--ldesign-bg-color-component-hover);
          border-color: var(--ldesign-border-level-2-color);
        }
      }
    }
  }
}

// 主体区域
.ldesign-template-dashboard-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

// 侧边栏样式
.ldesign-template-dashboard-sidebar {
  width: var(--sidebar-width);
  background: var(--ldesign-bg-color-container);
  border-right: 1px solid var(--ldesign-border-level-1-color);
  transition: width 0.3s ease;
  overflow: hidden;

  &.ldesign-template-collapsed {
    width: 64px;
  }

  .ldesign-template-sidebar-placeholder {
    text-align: center;
    padding: var(--ls-padding-lg);
    color: var(--ldesign-text-color-secondary);
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .ldesign-template-placeholder-icon {
      font-size: 2rem;
      margin-bottom: var(--ls-margin-sm);
      opacity: 0.6;
    }

    .ldesign-template-placeholder-text {
      font-size: var(--ls-font-size-sm);
      margin-bottom: var(--ls-margin-xs);
      font-weight: 500;
    }

    .ldesign-template-placeholder-hint {
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-placeholder);
    }
  }
}

// 内容区域
.ldesign-template-dashboard-content {
  flex: 1;
  padding: var(--ls-padding-lg);
  overflow: auto;
  background: var(--ldesign-bg-color-page);
  display: flex;
  align-items: center;
  justify-content: center;

  .ldesign-template-content-placeholder {
    text-align: center;
    padding: var(--ls-padding-xl);
    color: var(--ldesign-text-color-secondary);

    .ldesign-template-placeholder-icon {
      font-size: 4rem;
      margin-bottom: var(--ls-margin-lg);
      opacity: 0.6;
    }

    .ldesign-template-placeholder-text {
      font-size: var(--ls-font-size-lg);
      margin-bottom: var(--ls-margin-sm);
      font-weight: 500;
    }

    .ldesign-template-placeholder-hint {
      font-size: var(--ls-font-size-sm);
      color: var(--ldesign-text-color-placeholder);
    }
  }
}

// 底部样式
.ldesign-template-dashboard-footer {
  min-height: 48px;
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  display: flex;
  align-items: center;
  justify-content: center;
}

// 响应式设计
@media (max-width: 768px) {
  .ldesign-template-dashboard-header {
    padding: 0 var(--ls-padding-base);

    .ldesign-template-header-nav {
      margin-left: var(--ls-margin-base);
    }

    .ldesign-template-user-details {
      display: none;
    }
  }

  .ldesign-template-dashboard-sidebar {
    position: fixed;
    left: 0;
    top: 64px;
    bottom: 48px;
    z-index: 99;
    transform: translateX(-100%);

    &:not(.ldesign-template-collapsed) {
      transform: translateX(0);
    }
  }

  .ldesign-template-dashboard-content {
    padding: var(--ls-padding-base);
  }
}
</style>
