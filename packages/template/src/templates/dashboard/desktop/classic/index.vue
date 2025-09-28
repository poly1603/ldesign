<script setup lang="ts">
import { computed, ref } from 'vue'
import type { DashboardTemplateProps } from '../../types'


/* 使用统一的Props接口
 */
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

/* 配置选择器事件处☰ */
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
  <div class="ldesign-dashboard ldesign-dashboard--classic">
    <header class="ldesign-dashboard__header">
      <div class="ldesign-dashboard__header-prefix">Logo</div>
      <div class="ldesign-dashboard__header-content"></div>
      <div class="ldesign-dashboard__header-suffix">
        <slot name="language-selector"></slot>
        <slot name="color-selector"></slot>
        <slot name="dark-mode-toggle"></slot>
        <slot name="size-selector"></slot>
        <slot name="selector"></slot>
      </div>
    </header>
    <asider class="ldesign-dashboard__asider">fwefff</asider>
    <section class="ldesign-dashboard__content">
      <router-view />
    </section>
    <footer class="ldesign-dashboard__footer"></footer>
  </div>
</template>

<style lang="less">
.ldesign-dashboard--classic {
  display: grid;
  grid-template-columns: var(--ldesign-dashboard-sidebar-width) 1fr;
  grid-template-rows: var(--ldesign-dashboard-header-height) 1fr var(--ldesign-dashboard-footer-height);
  height: 100vh;
  background: var(--ldesign-bg-color-page);
  --ldesign-dashboard-header-height: 64px;
  --ldesign-dashboard-footer-height: 0;
  --ldesign-dashboard-sidebar-width: 240px;

  .ldesign-dashboard {
    &__header {
      grid-area: 1/1/2/3;
      background-color: var(--ldesign-dashboard-header-background, var(--ldesign-bg-color-container));
      display: flex;
      align-items: center;
      padding: 0 24px;

      &-content {
        flex: 1;
      }

      &-prefix,
      &-suffix {
        display: flex;
        align-items: center;
        gap: 16px;
      }
    }

    &__asider {
      grid-area: 2/1/3/2;
      background-color: var(--ldesign-dashboard-asider-background, var(--ldesign-bg-color-container));
    }

    &__content {
      grid-area: 2/2/3/3;
      box-sizing: border-box;
      padding: var(--ldesign-dashboard-content-padding, 16px);
      overflow: auto;
    }

    &__footer {
      grid-area: 3/1/4/3;
    }
  }
}
</style>
