<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'


// 使用统一的Props接口
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  title: '企业管理系统',
  logoUrl: '',
  primaryColor: '#1890ff',
  secondaryColor: '#40a9ff',
  showSidebar: true,
  collapsibleSidebar: true,
  sidebarCollapsed: false,
  showBreadcrumb: true,
  showUserInfo: true,
  showNotifications: true,
  enableAnimations: false,
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

// 配置选择器事件处理
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
  <div class="ldesign-template-dashboard ldesign-template-classic-style" :style="cssVars">
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
      <nav class="ldesign-template-header-nav">
        <slot name="header-nav">

        </slot>
      </nav>

      <!-- 用户信息区域 -->
      <div class="ldesign-template-header-user">
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
    <div class="ldesign-template-dashboard-body">
      <!-- 侧边栏 -->
      <aside v-if="showSidebar" class="ldesign-template-dashboard-sidebar"
        :class="{ 'ldesign-template-collapsed': isCollapsed }">
        <slot name="sidebar-menu">

        </slot>
      </aside>

      <!-- 主要内容区域 -->
      <main class="ldesign-template-dashboard-main">
        <div class="ldesign-template-main-content">
          <slot name="content">
            <div class="ldesign-template-content-placeholder">
              <h2>经典风格Dashboard</h2>
              <p>这是经典风格的Dashboard模板，采用传统企业级设计风格。</p>
            </div>
          </slot>
        </div>
      </main>
    </div>

    <!-- 底部区域 -->
    <footer class="ldesign-template-dashboard-footer">
      <slot name="footer">
        <div class="ldesign-template-footer-content">
          <p>&copy; 2024 企业管理系统 - 经典稳重设计</p>
        </div>
      </slot>
    </footer>

    <!-- 额外内容区域 -->
    <div class="ldesign-template-dashboard-extra">
      <slot name="extra"></slot>
    </div>


  </div>
</template>

<style lang="less" scoped>
.ldesign-template-dashboard.ldesign-template-classic-style {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  font-family: 'Microsoft YaHei', Arial, sans-serif;

  .ldesign-template-dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 24px;
    background: #fff;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .ldesign-template-header-logo {
      .ldesign-template-logo-container {
        display: flex;
        align-items: center;
        gap: 12px;

        .ldesign-template-sidebar-toggle {
          background: none;
          border: 1px solid #d9d9d9;
          font-size: 16px;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 4px;

          &:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
          }
        }

        .ldesign-template-logo-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
      }
    }

    .ldesign-template-header-nav {
      .ldesign-template-nav-links {
        display: flex;
        gap: 0;

        .ldesign-template-nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 12px 20px;
          border-right: 1px solid #e8e8e8;

          &:hover {
            background: #f0f0f0;
            color: var(--primary-color);
          }

          &:last-child {
            border-right: none;
          }
        }
      }
    }

    .ldesign-template-header-user {
      .ldesign-template-user-info {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 16px;
        border: 1px solid #d9d9d9;
        border-radius: 4px;

        .ldesign-template-user-name {
          font-weight: 500;
          color: #333;
        }

        .ldesign-template-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 4px;
          background: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
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

  .ldesign-template-dashboard-body {
    display: flex;
    flex: 1;
    overflow: hidden;

    .ldesign-template-dashboard-sidebar {
      width: var(--sidebar-width);
      background: #fff;
      border-right: 1px solid #e8e8e8;
      transition: width 0.2s ease;

      .ldesign-template-sidebar-nav {
        padding: 0;

        .ldesign-template-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;

          &:hover {
            background: #f0f0f0;
          }

          &.ldesign-template-active {
            background: var(--primary-color);
            color: white;
          }

          .ldesign-template-nav-icon {
            font-size: 16px;
            min-width: 16px;
          }

          .ldesign-template-nav-text {
            font-weight: 500;
          }
        }
      }

      &.ldesign-template-collapsed {
        .ldesign-template-nav-item {
          justify-content: center;
          padding: 16px 12px;
        }
      }
    }

    .ldesign-template-dashboard-main {
      flex: 1;
      padding: 16px;
      overflow: auto;
      background: #f5f5f5;

      .ldesign-template-main-content {
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 4px;
        padding: 24px;
        min-height: calc(100vh - 160px);

        .ldesign-template-content-placeholder {
          text-align: center;
          padding: 40px;

          h2 {
            color: #333;
            margin-bottom: 16px;
            font-weight: 600;
          }

          p {
            color: #666;
            font-size: 16px;
          }
        }
      }
    }
  }

  .ldesign-template-dashboard-footer {
    background: #fff;
    border-top: 1px solid #e8e8e8;
    padding: 16px 24px;
    text-align: center;

    .ldesign-template-footer-content {
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
  }

  .ldesign-template-header-selector {
    margin-left: 16px;
    display: flex;
    align-items: center;
  }
}
</style>
