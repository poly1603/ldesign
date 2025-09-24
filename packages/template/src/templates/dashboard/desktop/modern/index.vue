<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'

/* 使用统一的Props接口
 */
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  title: '现代管理后台',
  logoUrl: '',
  primaryColor: '#722ED1',
  secondaryColor: '#9254DE',
  showSidebar: true,
  collapsibleSidebar: true,
  sidebarCollapsed: false,
  showBreadcrumb: true,
  showUserInfo: true,
  showNotifications: true,
  enableAnimations: true,
})

/* 响应式状态 */
const isCollapsed = ref(props.sidebarCollapsed)

/* 计算属性 */
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
  '--sidebar-width': isCollapsed.value ? '64px' : '240px',
}))

/* 方法
 */
const toggleSidebar = () => {
  if (props.collapsibleSidebar) {
    isCollapsed.value = !isCollapsed.value
  }
}

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
  <div class="ldesign-template-dashboard ldesign-template-modern-style" :style="cssVars">
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
          <div class="user-info">
            <span class="user-name">{{ userInfo?.name || '用户' }}</span>
            <div class="user-avatar">👤</div>
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

        <!-- 模板选择器区域-->
        <div class="ldesign-template-selector-item">
          <slot name="selector">
            <!-- 模板选择器将在这里显示-->
          </slot>
        </div>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="dashboard-body">
      <!-- 侧边栏-->
      <aside v-if="showSidebar" class="dashboard-sidebar" :class="{ collapsed: isCollapsed }">
        <slot name="sidebar-menu">

        </slot>
      </aside>

      <!-- 主要内容区域 -->
      <main class="dashboard-main">
        <div class="main-content">
          <slot name="content">
            <div class="content-placeholder">
              <h2>现代风格Dashboard</h2>
              <p>这是现代风格的Dashboard模板，采用渐变背景和圆角设计。</p>
            </div>
          </slot>
        </div>
      </main>
    </div>

    <!-- 底部区域 -->
    <footer class="dashboard-footer">
      <slot name="footer">
        <div class="footer-content">
          <p>&copy; 2024 现代管理系统 - 现代化设计风格</p>
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
.ldesign-template-dashboard.ldesign-template-modern-style {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .ldesign-template-dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 24px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 0 0 16px 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    z-index: 1000;

    .ldesign-template-header-logo {
      .ldesign-template-logo-container {
        display: flex;
        align-items: center;
        gap: 12px;

        .ldesign-template-sidebar-toggle {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(var(--primary-color), 0.1);
          }
        }

        .ldesign-template-logo-title {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    .header-nav {
      .nav-links {
        display: flex;
        gap: 24px;

        .nav-link {
          text-decoration: none;
          color: #333;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(var(--primary-color), 0.1);
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
        padding: 8px 16px;
        border-radius: 20px;
        background: rgba(var(--primary-color), 0.1);

        .user-name {
          font-weight: 500;
          color: #333;
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
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
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
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      margin: 16px 0 16px 16px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      .sidebar-nav {
        padding: 16px;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 8px;

          &:hover {
            background: rgba(var(--primary-color), 0.1);
          }

          &.active {
            background: var(--primary-color);
            color: white;
          }

          .nav-icon {
            font-size: 18px;
            min-width: 18px;
          }

          .nav-text {
            font-weight: 500;
          }
        }
      }

      &.collapsed {
        .nav-item {
          justify-content: center;
        }
      }
    }

    .dashboard-main {
      flex: 1;
      padding: 16px;
      overflow: auto;

      .main-content {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        min-height: calc(100vh - 160px);

        .content-placeholder {
          text-align: center;
          padding: 40px;

          h2 {
            color: var(--primary-color);
            margin-bottom: 16px;
          }

          p {
            color: #666;
            font-size: 16px;
          }
        }
      }
    }
  }

  .dashboard-footer {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 16px 16px 0 0;
    padding: 16px 24px;
    text-align: center;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);

    .footer-content {
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
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
