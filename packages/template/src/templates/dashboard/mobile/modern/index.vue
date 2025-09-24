<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'

/* 使用统一的Props接口
 */
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  title: '移动管理台',
  logoUrl: '',
  primaryColor: '#722ED1',
  secondaryColor: '#9254DE',
  showSidebar: false,
  collapsibleSidebar: false,
  sidebarCollapsed: false,
  showBreadcrumb: false,
  showUserInfo: true,
  showNotifications: false,
  enableAnimations: true,
})

/* 响应式状态 */
const showMobileMenu = ref(false)

/* 计算属性 */
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
}))

/* 方法
 */
const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
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
  <div class="ldesign-template-dashboard ldesign-template-modern-style ldesign-template-mobile-layout" :style="cssVars">
    <!-- 头部区域 -->
    <header class="ldesign-template-dashboard-header">
      <!-- Logo区域 -->
      <div class="ldesign-template-header-logo">
        <slot name="header-logo">
          <div class="ldesign-template-logo-container">
            <button class="ldesign-template-menu-toggle" @click="toggleMobileMenu">
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
      </div>
    </header>

    <!-- 移动端菜单-->
    <div v-if="showMobileMenu" class="mobile-menu-overlay" @click="toggleMobileMenu">
      <nav class="mobile-menu" @click.stop>
        <slot name="sidebar-menu">
          <div class="nav-item active">
            <span class="nav-icon">🏠</span>
            <span class="nav-text">首页</span>
          </div>
          <div class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">数据</span>
          </div>
          <div class="nav-item">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">设置</span>
          </div>
        </slot>
      </nav>
    </div>

    <!-- 主要内容区域 -->
    <main class="dashboard-main">
      <div class="main-content">
        <slot name="content">
          <div class="content-placeholder">
            <h2>现代风格Dashboard</h2>
            <p>移动端优化的现代化Dashboard模板</p>
          </div>
        </slot>
      </div>
    </main>

    <!-- 底部区域 -->
    <footer class="dashboard-footer">
      <slot name="footer">
        <div class="footer-content">
          <p>&copy; 2024 移动管理系统</p>
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
.ldesign-template-dashboard.ldesign-template-modern-style.ldesign-template-mobile-layout {
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
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);

    .ldesign-template-header-logo {
      .ldesign-template-logo-container {
        display: flex;
        align-items: center;
        gap: 12px;

        .ldesign-template-menu-toggle {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: all 0.3s ease;

          &:hover {
            background: rgba(var(--primary-color), 0.1);
          }
        }

        .logo-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          background: linear-gradient(45deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    }

    .header-user {
      .user-info {
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 16px;
        }
      }
    }

    .ldesign-template-header-selectors {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);
      margin-left: var(--ls-margin-xs);

      .ldesign-template-selector-item {
        display: flex;
        align-items: center;

        .ldesign-template-selector-placeholder {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: var(--ls-border-radius-lg);
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 12px;
          color: white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          &:active {
            transform: scale(0.95);
          }
        }
      }
    }
  }

  .mobile-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;
    display: flex;
    align-items: flex-start;
    padding-top: 56px;

    .mobile-menu {
      width: 280px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 0 16px 16px 0;
      padding: 20px 0;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);

      .nav-item {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 24px;
        cursor: pointer;
        transition: all 0.3s ease;

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
          font-size: 16px;
        }
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
      padding: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      min-height: calc(100vh - 140px);

      .content-placeholder {
        text-align: center;
        padding: 40px 20px;

        h2 {
          color: var(--primary-color);
          margin-bottom: 16px;
          font-size: 24px;
        }

        p {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
        }
      }
    }
  }

  .dashboard-footer {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    padding: 16px;
    text-align: center;
    box-shadow: 0 -2px 16px rgba(0, 0, 0, 0.1);

    .footer-content {
      p {
        margin: 0;
        color: #666;
        font-size: 14px;
      }
    }
  }
}
</style>


