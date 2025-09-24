<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'

/* 使用统一的Props接口
 */
const props = withDefaults(defineProps<DashboardTemplateProps>(), {
  title: '移动管理',
  logoUrl: '',
  primaryColor: '#1890ff',
  secondaryColor: '#40a9ff',
  showSidebar: false,
  collapsibleSidebar: true,
  sidebarCollapsed: true,
  showBreadcrumb: false,
  showUserInfo: true,
  showNotifications: true,
  enableAnimations: true,
})

/* 响应式状态 */
const showDrawer = ref(false)

/* 计算属性 */
const cssVars = computed(() => ({
  '--primary-color': props.primaryColor,
  '--secondary-color': props.secondaryColor,
}))

/* 方法
 */
const toggleDrawer = () => {
  showDrawer.value = !showDrawer.value
}

const closeDrawer = () => {
  showDrawer.value = false
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
  <div class="ldesign-template-dashboard ldesign-template-mobile" :style="cssVars">
    <!-- 头部区域 -->
    <header class="ldesign-template-mobile-header">
      <!-- Logo和菜单区域-->
      <div class="ldesign-template-header-left">
        <slot name="header-logo">
          <button class="ldesign-template-menu-button" @click="toggleDrawer">
            <span class="ldesign-template-menu-icon">☰</span>
          </button>
          <div class="ldesign-template-logo-container">
            <div v-if="logoUrl" class="ldesign-template-logo-image">
              <img :src="logoUrl" :alt="title">
            </div>
            <div v-else class="logo-placeholder">📱</div>
            <h1 class="app-title">{{ title }}</h1>
          </div>
        </slot>
      </div>

      <!-- 操作区域 -->
      <div class="header-actions">
        <slot name="header-actions">
          <div v-if="showNotifications" class="notifications">
            <span class="notification-icon">🔔</span>
            <span class="notification-badge">3</span>
          </div>
        </slot>
      </div>

      <!-- 用户信息区域 -->
      <div class="header-user">
        <slot name="header-user">
          <div v-if="showUserInfo" class="user-avatar">
            <img v-if="userInfo?.avatar" :src="userInfo.avatar" :alt="userInfo?.name">
            <span v-else class="avatar-placeholder">👤</span>
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

    <!-- 主要内容区域 -->
    <main class="mobile-content">
      <slot name="content">
        <!-- 主要内容区域，留空供插槽使用 -->
      </slot>
    </main>

    <!-- 底部导航 -->
    <nav class="mobile-bottom-nav">
      <slot name="bottom-nav">
        <div class="nav-item active">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📊</span>
          <span class="nav-text">数据</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">📋</span>
          <span class="nav-text">任务</span>
        </div>
        <div class="nav-item">
          <span class="nav-icon">👤</span>
          <span class="nav-text">我的</span>
        </div>
      </slot>
    </nav>

    <!-- 抽屉菜单 -->
    <div v-if="showDrawer" class="drawer-overlay" @click="closeDrawer">
      <div class="drawer-menu" @click.stop>
        <div class="drawer-header">
          <div class="user-info">
            <div class="user-avatar-large">
              <img v-if="userInfo?.avatar" :src="userInfo.avatar" :alt="userInfo?.name">
              <span v-else class="avatar-placeholder">👤</span>
            </div>
            <div class="user-details">
              <div class="user-name">{{ userInfo?.name || '用户' }}</div>
              <div class="user-role">{{ userInfo?.role || '用户' }}</div>
            </div>
          </div>
          <button class="close-button" @click="closeDrawer">☰</button>
        </div>

        <div class="drawer-content">
          <slot name="drawer-menu">
            <nav class="drawer-nav">
              <div class="nav-item active">
                <span class="nav-icon">🏠</span>
                <span class="nav-text">控制台</span>
              </div>
              <div class="nav-item">
                <span class="nav-icon">👥</span>
                <span class="nav-text">用户管理</span>
              </div>
              <div class="nav-item">
                <span class="nav-icon">📊</span>
                <span class="nav-text">数据统计</span>
              </div>
              <div class="nav-item">
                <span class="nav-icon">⚙️</span>
                <span class="nav-text">系统设置</span>
              </div>
              <div class="nav-item">
                <span class="nav-icon">🚪</span>
                <span class="nav-text">退出登录</span>
              </div>
            </nav>
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.ldesign-template-dashboard.ldesign-template-mobile {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--ldesign-bg-color-page);
}

/* 头部样式
 */
.ldesign-template-mobile-header {
  height: 56px;
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-level-1-color);
  display: flex;
  align-items: center;
  padding: 0 var(--ls-padding-base);
  box-shadow: var(--ldesign-shadow-1);
  z-index: 100;

  .ldesign-template-header-left {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
    flex: 1;

    .ldesign-template-menu-button {
      background: none;
      border: none;
      padding: var(--ls-padding-xs);
      cursor: pointer;
      border-radius: var(--ls-border-radius-sm);
      transition: all 0.3s ease;

      &:hover {
        background: var(--ldesign-bg-color-component);
      }

      .ldesign-template-menu-icon {
        font-size: 18px;
        color: var(--ldesign-text-color-secondary);
      }
    }

    .ldesign-template-logo-container {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-xs);

      .ldesign-template-logo-image img {
        height: 24px;
        width: auto;
      }

      .ldesign-template-logo-placeholder {
        font-size: 20px;
      }

      .ldesign-template-app-title {
        font-size: var(--ls-font-size-base);
        font-weight: 600;
        color: var(--ldesign-text-color-primary);
        margin: 0;
      }
    }
  }

  .ldesign-template-header-actions {
    .ldesign-template-notifications {
      position: relative;
      cursor: pointer;
      padding: var(--ls-padding-xs);

      .ldesign-template-notification-icon {
        font-size: 18px;
        color: var(--ldesign-text-color-secondary);
      }

      .ldesign-template-notification-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background: var(--ldesign-danger-color);
        color: white;
        font-size: 10px;
        padding: 1px 4px;
        border-radius: 8px;
        min-width: 14px;
        text-align: center;
      }
    }
  }

  .header-user {
    margin-left: var(--ls-margin-sm);

    .user-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      overflow: hidden;
      background: var(--ldesign-bg-color-component);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-placeholder {
        font-size: 14px;
        color: var(--ldesign-text-color-secondary);
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
        background: var(--ldesign-bg-color-component);
        border: 1px solid var(--ldesign-border-level-1-color);
        border-radius: var(--ls-border-radius-base);
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;

        &:hover {
          background: var(--ldesign-bg-color-component-hover);
          border-color: var(--ldesign-border-level-2-color);
        }

        &:active {
          transform: scale(0.95);
        }
      }
    }
  }
}

/* 主要内容区域
 */
.mobile-content {
  flex: 1;
  padding: var(--ls-padding-base);
  overflow: auto;
  margin-bottom: 60px; // 为底部导航留出空间
}

/* 底部导航
 */
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-level-1-color);
  display: flex;
  align-items: center;
  z-index: 99;

  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: var(--ls-padding-xs);
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: var(--ldesign-bg-color-component);
    }

    &.active {
      color: var(--primary-color);

      .nav-icon {
        transform: scale(1.1);
      }
    }

    .nav-icon {
      font-size: 16px;
      transition: transform 0.3s ease;
    }

    .nav-text {
      font-size: 10px;
      font-weight: 500;
    }
  }
}

/* 抽屉菜单
 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.3s ease;

  .drawer-menu {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 280px;
    background: var(--ldesign-bg-color-container);
    box-shadow: var(--ldesign-shadow-3);
    animation: slideInLeft 0.3s ease;
    display: flex;
    flex-direction: column;

    .drawer-header {
      padding: var(--ls-padding-lg);
      border-bottom: 1px solid var(--ldesign-border-level-1-color);
      display: flex;
      align-items: center;
      justify-content: space-between;

      .user-info {
        display: flex;
        align-items: center;
        gap: var(--ls-spacing-base);

        .user-avatar-large {
          width: 48px;
          height: 48px;
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
            font-size: 24px;
            color: var(--ldesign-text-color-secondary);
          }
        }

        .user-details {
          .user-name {
            font-size: var(--ls-font-size-base);
            font-weight: 600;
            color: var(--ldesign-text-color-primary);
            margin-bottom: 2px;
          }

          .user-role {
            font-size: var(--ls-font-size-sm);
            color: var(--ldesign-text-color-secondary);
          }
        }
      }

      .close-button {
        background: none;
        border: none;
        font-size: 18px;
        color: var(--ldesign-text-color-secondary);
        cursor: pointer;
        padding: var(--ls-padding-xs);
        border-radius: var(--ls-border-radius-sm);

        &:hover {
          background: var(--ldesign-bg-color-component);
        }
      }
    }

    .drawer-content {
      flex: 1;
      overflow: auto;

      .drawer-nav {
        padding: var(--ls-padding-base);

        .nav-item {
          display: flex;
          align-items: center;
          gap: var(--ls-spacing-base);
          padding: var(--ls-padding-base);
          margin-bottom: var(--ls-margin-xs);
          border-radius: var(--ls-border-radius-sm);
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            background: var(--ldesign-bg-color-component);
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
            font-size: var(--ls-font-size-base);
            font-weight: 500;
          }
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes slideInLeft {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(0);
  }
}

/* 响应式设置 */
@media (max-width: 480px) {
  .mobile-header {
    padding: 0 var(--ls-padding-sm);

    .header-left .logo-container .app-title {
      font-size: var(--ls-font-size-sm);
    }
  }

  .mobile-content {
    padding: var(--ls-padding-sm);
  }

  .drawer-overlay .drawer-menu {
    width: 260px;
  }

  .header-selector {
    margin-left: 8px;
    display: flex;
    align-items: center;
  }
}
</style>


