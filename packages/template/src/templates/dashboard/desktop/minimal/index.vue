<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'

// 使用统一的Props接口
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  title: '简约工作台',
  logoUrl: '',
  primaryColor: '#000000',
  secondaryColor: '#666666',
  showSidebar: true,
  collapsibleSidebar: true,
  sidebarCollapsed: false,
  showBreadcrumb: false,
  showUserInfo: true,
  showNotifications: false,
  enableAnimations: true,
})

// 响应式状态
const isCollapsed = ref(props.sidebarCollapsed)

// 计算属性
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
  '--sidebar-width': isCollapsed.value ? '60px' : '200px',
}))

// 方法
const toggleSidebar = () => {
  if (props.collapsibleSidebar) {
    isCollapsed.value = !isCollapsed.value
  }
}

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
  <div class="ldesign-template-dashboard ldesign-template-minimal-style" :style="cssVars">
    <!-- 头部区域 -->
    <header class="ldesign-template-dashboard-header">
      <!-- Logo区域 -->
      <div class="ldesign-template-header-logo">
        <slot name="header-logo">
          <div class="ldesign-template-logo-container">
            <button v-if="showSidebar && collapsibleSidebar" class="ldesign-template-sidebar-toggle"
              @click="toggleSidebar">
              ☰
            </button>
            <h1 class="ldesign-template-logo-title">{{ title }}</h1>
          </div>
        </slot>
      </div>

      <!-- 导航区域 -->
      <nav class="header-nav">
        <slot name="header-nav">
        </slot>
      </nav>

      <!-- 用户信息区域 -->
      <div class="header-user">
        <slot name="header-user">
        </slot>
      </div>

      <!-- 配置选择器区域 -->
      <div class="ldesign-template-header-selectors">
        <!-- 语言选择器 -->
        <div class="ldesign-template-selector-item">
          <slot name="language-selector" :on-language-change="handleLanguageChange">
            <!-- 默认语言选择器占位符 -->
          </slot>
        </div>

        <!-- 主题色选择器 -->
        <div class="ldesign-template-selector-item">
          <slot name="color-selector" :on-theme-change="handleThemeChange">
            <!-- 默认主题选择器占位符 -->
          </slot>
        </div>

        <!-- 暗黑模式切换器 -->
        <div class="ldesign-template-selector-item">
          <slot name="dark-mode-toggle" :on-dark-mode-change="handleDarkModeChange">
            <!-- 默认暗黑模式切换器占位符 -->
          </slot>
        </div>

        <!-- 尺寸选择器 -->
        <div class="ldesign-template-selector-item">
          <slot name="size-selector" :on-size-change="handleSizeChange">
            <!-- 默认尺寸选择器占位符 -->
          </slot>
        </div>

        <!-- 模板选择器区域 -->
        <div class="ldesign-template-selector-item">
          <slot name="selector">
            <!-- 模板选择器将在这里显示 -->
          </slot>
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="dashboard-body">
      <!-- 侧边栏 -->
      <aside v-if="showSidebar" class="dashboard-sidebar" :class="{ collapsed: isCollapsed }">
        <slot name="sidebar-menu">

        </slot>
      </aside>

      <!-- 主要内容区域 -->
      <main class="dashboard-main">
        <div class="main-content">
          <slot name="content">
            <div class="content-placeholder">
              <h2>极简风格Dashboard</h2>
              <p>专注于内容，去除多余装饰，提供纯净的工作环境。</p>
            </div>
          </slot>
        </div>
      </main>
    </div>

    <!-- 底部区域 -->
    <footer class="dashboard-footer">
      <slot name="footer">
        <div class="footer-content">
          <p>简约设计 · 专注内容</p>
        </div>
      </slot>
    </footer>

    <!-- 额外内容区域 -->
    <div class="dashboard-extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ldesign-template-dashboard.ldesign-template-minimal-style {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #333;

  .ldesign-template-dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    padding: 0 32px;
    background: #ffffff;
    border-bottom: 1px solid #f0f0f0;

    .ldesign-template-header-logo {
      .ldesign-template-logo-container {
        display: flex;
        align-items: center;
        gap: 16px;

        .ldesign-template-sidebar-toggle {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 8px;
          color: var(--secondary-color);
          transition: color 0.2s ease;

          &:hover {
            color: var(--primary-color);
          }
        }

        .ldesign-template-logo-title {
          margin: 0;
          font-size: 18px;
          font-weight: 300;
          color: var(--primary-color);
          letter-spacing: 0.5px;
        }
      }
    }

    .ldesign-template-header-nav {
      .ldesign-template-nav-links {
        display: flex;
        gap: 32px;

        .ldesign-template-nav-link {
          text-decoration: none;
          color: var(--secondary-color);
          font-weight: 400;
          font-size: 14px;
          transition: color 0.2s ease;

          &:hover {
            color: var(--primary-color);
          }
        }
      }
    }

    .header-user {
      .user-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .user-name {
          font-weight: 400;
          color: var(--secondary-color);
          font-size: 14px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }
      }
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

  .dashboard-body {
    display: flex;
    flex: 1;
    overflow: hidden;

    .dashboard-sidebar {
      width: var(--sidebar-width);
      background: #ffffff;
      border-right: 1px solid #f0f0f0;
      transition: width 0.3s ease;

      .sidebar-nav {
        padding: 24px 0;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 24px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 0 12px 4px;
          border-radius: 8px;

          &:hover {
            background: #f8f8f8;
          }

          &.active {
            background: #f0f0f0;

            .nav-icon {
              color: var(--primary-color);
            }

            .nav-text {
              color: var(--primary-color);
              font-weight: 500;
            }
          }

          .nav-icon {
            font-size: 12px;
            min-width: 12px;
            color: var(--secondary-color);
          }

          .nav-text {
            font-weight: 400;
            color: var(--secondary-color);
            font-size: 14px;
          }
        }
      }

      &.collapsed {
        .nav-item {
          justify-content: center;
          padding: 12px;
        }
      }
    }

    .dashboard-main {
      flex: 1;
      padding: 32px;
      overflow: auto;
      background: #ffffff;

      .main-content {
        max-width: 1200px;
        margin: 0 auto;

        .content-placeholder {
          text-align: center;
          padding: 80px 40px;

          h2 {
            color: var(--primary-color);
            margin-bottom: 16px;
            font-weight: 300;
            font-size: 24px;
            letter-spacing: 0.5px;
          }

          p {
            color: var(--secondary-color);
            font-size: 16px;
            font-weight: 300;
            line-height: 1.6;
          }
        }
      }
    }
  }

  .dashboard-footer {
    background: #ffffff;
    border-top: 1px solid #f0f0f0;
    padding: 16px 32px;
    text-align: center;

    .footer-content {
      p {
        margin: 0;
        color: var(--secondary-color);
        font-size: 12px;
        font-weight: 300;
        letter-spacing: 0.5px;
      }
    }
  }

  .header-selector {
    margin-left: 16px;
    display: flex;
    align-items: center;
  }
}
</style>
