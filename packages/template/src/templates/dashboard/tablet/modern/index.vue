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
  sidebarCollapsed: true,
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
  '--sidebar-width': isCollapsed.value ? '60px' : '200px',
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
  <div class="ldesign-template-dashboard ldesign-template-modern-style ldesign-template-tablet-layout" :style="cssVars">
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

      <!-- 用户信息区域 -->
      <div class="header-user">
        <slot name="header-user">
          <div class="user-info">
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

        <slot name="selector">
          <!-- 模板选择器将在这里显示-->
        </slot>
      </div>
    </header>

    <!-- 主体区域 -->
    <div class="dashboard-body">
      <!-- 侧边栏-->
      <aside v-if="showSidebar" class="dashboard-sidebar" :class="{ collapsed: isCollapsed }">
        <slot name="sidebar-menu">
          <nav class="sidebar-nav">
            <div class="nav-item active">
              <span class="nav-icon">🏠</span>
              <span v-if="!isCollapsed" class="nav-text">首页</span>
            </div>
            <div class="nav-item">
              <span class="nav-icon">📊</span>
              <span v-if="!isCollapsed" class="nav-text">数据</span>
            </div>
            <div class="nav-item">
              <span class="nav-icon">⚙️</span>
              <span v-if="!isCollapsed" class="nav-text">设置</span>
            </div>
          </nav>
        </slot>
      </aside>

      <!-- 主要内容区域 -->
      <main class="dashboard-main">
        <div class="main-content">
          <slot name="content">
            <div class="content-placeholder">
              <h2>现代风格Dashboard (平板)</h2>
              <p>适配平板设备的现代化Dashboard模板</p>
            </div>
          </slot>
        </div>
      </main>
    </div>

    <!-- 底部区域 -->
    <footer class="dashboard-footer">
      <slot name="footer">
        <div class="footer-content">
          <p>&copy; 2024 现代管理系统 (平板版)</p>
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
.ldesign-template-dashboard.ldesign-template-modern-style.ldesign-template-tablet-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .ldesign-template-dashboard-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 16px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 0 0 12px 12px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);

    .ldesign-template-header-logo {
      .ldesign-template-logo-container {
        display: flex;
        align-items: center;
        gap: 8px;

        .ldesign-template-sidebar-toggle {
          background: none;
          border: none;
          font-size: 16px;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(var(--primary-color), 0.1);
          }
        }

        .logo-title {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    .header-user {
      .user-info {
        display: flex;
        align-items: center;

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
        }
      }
    }

    .ldesign-template-header-selectors {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      margin-left: var(--ls-margin-sm);

      .ldesign-template-selector-item {
        display: flex;
        align-items: center;

        .ldesign-template-selector-placeholder {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: var(--ls-border-radius-lg);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 14px;
          color: white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
      border-radius: 12px;
      margin: 12px 0 12px 12px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;

      .sidebar-nav {
        padding: 12px;

        .nav-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 6px;

          &:hover {
            background: rgba(var(--primary-color), 0.1);
          }

          &.active {
            background: var(--primary-color);
            color: white;
          }

          .nav-icon {
            font-size: 16px;
            min-width: 16px;
          }

          .nav-text {
            font-weight: 500;
            font-size: 14px;
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
      padding: 12px;
      overflow: auto;

      .main-content {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(10px);
        border-radius: 12px;
        padding: 20px;
        box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
        min-height: calc(100vh - 140px);

        .content-placeholder {
          text-align: center;
          padding: 30px;

          h2 {
            color: var(--primary-color);
            margin-bottom: 12px;
            font-size: 20px;
          }

          p {
            color: #666;
            font-size: 14px;
          }
        }
      }
    }
  }

  .dashboard-footer {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 12px 12px 0 0;
    padding: 12px 16px;
    text-align: center;
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.1);

    .footer-content {
      p {
        margin: 0;
        color: #666;
        font-size: 12px;
      }
    }
  }
}
</style>


