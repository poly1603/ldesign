<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'

/* 使用统一的Props接口
 */
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  title: '平板管理',
  logoUrl: '',
  primaryColor: '#1890ff',
  secondaryColor: '#40a9ff',
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
  '--sidebar-width': isCollapsed.value ? '64px' : '200px',
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
  <div class="ldesign-template-dashboard ldesign-template-tablet" :style="cssVars">
    <!-- 头部区域 -->
    <header class="ldesign-template-tablet-header">
      <!-- Logo区域 -->
      <div class="ldesign-template-header-logo">
        <slot name="header-logo">
          <div class="ldesign-template-logo-container">
            <button v-if="showSidebar && collapsibleSidebar" class="ldesign-template-sidebar-toggle"
              @click="toggleSidebar">
              <span class="ldesign-template-toggle-icon">☰</span>
            </button>
            <div v-if="logoUrl" class="ldesign-template-logo-image">
              <img :src="logoUrl" :alt="title">
            </div>
            <div v-else class="logo-placeholder">💻</div>
            <h1 class="app-title">{{ title }}</h1>
          </div>
        </slot>
      </div>

      <!-- 导航区域 -->
      <div class="header-nav">
        <slot name="header-nav">
          <!-- 面包屑导航-->
          <nav v-if="showBreadcrumb" class="breadcrumb">
            <span class="breadcrumb-item">首页</span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item current">控制台</span>
          </nav>
        </slot>
      </div>

      <!-- 用户信息区域 -->
      <div class="header-user">
        <slot name="header-user">
          <div v-if="showUserInfo" class="user-info">
            <div v-if="showNotifications" class="notifications">
              <span class="notification-icon">🔔</span>
              <span class="notification-badge">5</span>
            </div>
            <div class="user-avatar">
              <img v-if="userInfo?.avatar" :src="userInfo.avatar" :alt="userInfo?.name">
              <span v-else class="avatar-placeholder">👤</span>
            </div>
            <div class="user-details">
              <div class="user-name">{{ userInfo?.name || '用户' }}</div>
              <div class="user-role">{{ userInfo?.role || '用户' }}</div>
            </div>
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
    <div class="tablet-body">
      <!-- 侧边栏-->
      <aside v-if="showSidebar" class="tablet-sidebar" :class="{ collapsed: isCollapsed }">
        <slot name="sidebar-menu">
          <nav class="sidebar-nav">
            <div class="nav-item active">
              <span class="nav-icon">📊</span>
              <span v-if="!isCollapsed" class="nav-text">控制台</span>
            </div>
            <div class="nav-item">
              <span class="nav-icon">👥</span>
              <span v-if="!isCollapsed" class="nav-text">用户管理</span>
            </div>
            <div class="nav-item">
              <span class="nav-icon">📈</span>
              <span v-if="!isCollapsed" class="nav-text">数据分析</span>
            </div>
            <div class="nav-item">
              <span class="nav-icon">⚙️</span>
              <span v-if="!isCollapsed" class="nav-text">系统设置</span>
            </div>
          </nav>
        </slot>
      </aside>

      <!-- 内容区域 -->
      <main class="tablet-content">
        <slot name="content">
          <!-- 主要内容区域，留空供插槽使用 -->
        </slot>
      </main>
    </div>

    <!-- 底部区域 -->
    <footer class="tablet-footer">
      <slot name="footer">
        <div class="footer-content">
          <p>&copy; 2024 {{ title }}. All rights reserved.</p>
        </div>
      </slot>
    </footer>
  </div>
</template>

<style lang="less" scoped>
.tablet-dashboard-template {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--ldesign-bg-color-page);
}

/* 头部样式
 */
.ldesign-template-tablet-header {
  height: 60px;
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

      .logo-image img {
        height: 36px;
        width: auto;
      }

      .logo-placeholder {
        font-size: 28px;
      }

      .app-title {
        font-size: var(--ls-font-size-lg);
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin: 0;
      }
    }
  }

  .header-nav {
    flex: 1;
    margin-left: var(--ls-margin-lg);

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);

      .breadcrumb-item {
        color: var(--ldesign-text-color-secondary);
        font-size: var(--ls-font-size-sm);

        &.current {
          color: var(--ldesign-text-color-primary);
          font-weight: 500;
        }
      }

      .breadcrumb-separator {
        color: var(--ldesign-text-color-placeholder);
      }
    }
  }

  .header-user {
    .user-info {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-base);

      .notifications {
        position: relative;
        cursor: pointer;
        padding: var(--ls-padding-xs);

        .notification-icon {
          font-size: 20px;
          color: var(--ldesign-text-color-secondary);
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--ldesign-danger-color);
          color: white;
          font-size: 11px;
          padding: 2px 5px;
          border-radius: 10px;
          min-width: 16px;
          text-align: center;
        }
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--ldesign-bg-color-component);
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          font-size: 18px;
          color: var(--ldesign-text-color-secondary);
        }
      }

      .user-details {
        .user-name {
          font-size: var(--ls-font-size-sm);
          font-weight: 500;
          color: var(--ldesign-text-color-primary);
        }

        .user-role {
          font-size: var(--ls-font-size-xs);
          color: var(--ldesign-text-color-secondary);
        }
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
        background: var(--ldesign-bg-color-component);
        border: 1px solid var(--ldesign-border-level-1-color);
        border-radius: var(--ls-border-radius-base);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 14px;

        &:hover {
          background: var(--ldesign-bg-color-component-hover);
          border-color: var(--ldesign-border-level-2-color);
          transform: scale(1.05);
        }
      }
    }
  }
}

/* 主体区域
 */
.tablet-body {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 侧边栏样式 */
.tablet-sidebar {
  width: var(--sidebar-width);
  background: var(--ldesign-bg-color-container);
  border-right: 1px solid var(--ldesign-border-level-1-color);
  transition: width 0.3s ease;
  overflow: hidden;

  &.collapsed {
    width: 64px;
  }

  .sidebar-nav {
    padding: var(--ls-padding-base);

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);
      padding: var(--ls-padding-sm) var(--ls-padding-base);
      margin-bottom: var(--ls-margin-xs);
      border-radius: var(--ls-border-radius-sm);
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;

      &:hover {
        background: var(--ldesign-bg-color-component);
      }

      &.active {
        background: var(--primary-color);
        color: white;

        .nav-icon {
          filter: brightness(0) invert(1);
        }
      }

      .nav-icon {
        font-size: 16px;
        min-width: 16px;
      }

      .nav-text {
        font-size: var(--ls-font-size-sm);
        font-weight: 500;
      }
    }
  }
}

/* 内容区域
 */
.tablet-content {
  flex: 1;
  padding: var(--ls-padding-lg);
  overflow: auto;
  background: var(--ldesign-bg-color-page);
}

/* 底部样式
 */
.tablet-footer {
  height: 44px;
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  display: flex;
  align-items: center;
  justify-content: center;

  .footer-content {
    p {
      margin: 0;
      font-size: var(--ls-font-size-xs);
      color: var(--ldesign-text-color-secondary);
    }
  }
}

/* 响应式设置 */
@media (max-width: 1024px) {
  .tablet-header {
    padding: 0 var(--ls-padding-base);

    .header-nav {
      margin-left: var(--ls-margin-base);
    }
  }

  .tablet-content {
    padding: var(--ls-padding-base);
  }
}

@media (max-width: 768px) {
  .tablet-sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 44px;
    z-index: 99;
    transform: translateX(-100%);

    &:not(.collapsed) {
      transform: translateX(0);
    }
  }

  .tablet-header .header-user .user-details {
    display: none;
  }
}

/* 横屏模式优化
 */
@media (orientation: landscape) and (min-width: 768px) and (max-width: 1024px) {
  .tablet-header {
    .app-title {
      font-size: var(--ls-font-size-base);
    }
  }

  .tablet-sidebar {
    width: 180px;

    &.collapsed {
      width: 60px;
    }
  }
}
</style>


