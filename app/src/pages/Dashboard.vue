<template>
  <TemplateRenderer key="dashboard-template-renderer" category="dashboard" :show-selector="true" :responsive="true"
    :cache-selection="true" :props="templateProps" @template-change="onTemplateChange" @load-error="onLoadError"
    @load-success="onLoadSuccess">

    <!-- 主要内容插槽 - 这里显示路由内容 -->
    <template #content>
      <RouterView />
    </template>

    <!-- 分别传递各个选择器组件 -->
    <!-- 语言选择器插槽 -->
    <template #language-selector="{ onLanguageChange }">
      <LanguageSwitcher type="buttons" :show-flag="true" @change="onLanguageChange" />
    </template>

    <!-- 主题色选择器插槽 -->
    <template #color-selector="{ onThemeChange }">
      <ThemeSelector :show-preview="true" @themeChange="onThemeChange" />
    </template>

    <!-- 暗黑模式切换器插槽 -->
    <template #dark-mode-toggle="{ onDarkModeChange }">
      <DarkModeToggle :auto-detect="true" animation-type="circle" @change="onDarkModeChange" />
    </template>

    <!-- 尺寸选择器插槽 -->
    <template #size-selector="{ onSizeChange }">
      <SizeSwitcher switcher-style="segmented" :show-labels="true" @change="onSizeChange" />
    </template>
  </TemplateRenderer>
</template>

<script setup lang="ts">
/**
 * Dashboard 页面组件
 *
 * 使用 @ldesign/template 的 TemplateRenderer 组件来渲染 dashboard 模板
 * 支持模板选择器、响应式布局和模板缓存
 *
 * 功能特性：
 * - 模板系统集成
 * - 模板选择器
 * - 响应式布局
 * - 模板缓存
 * - 热更新支持
 */

import { computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { TemplateRenderer } from '@ldesign/template'
import { useI18n } from '@ldesign/i18n/vue'
import { useDevice } from '@ldesign/device/vue'
import { useBreakpoints } from '@ldesign/device/vue/composables/useBreakpoints'
import { RouterView } from '@ldesign/router'
import { getAvailableLocales } from '../i18n'

// 导入配置面板需要的真实组件
import { LanguageSwitcher } from '@ldesign/i18n/vue'
import { DarkModeToggle, ThemeSelector } from '@ldesign/color/vue'
import { SizeSwitcher } from '@ldesign/size/vue'

// 国际化
const { t, locale } = useI18n()

// 当前语言信息
const availableLocales = getAvailableLocales()
const currentLocaleInfo = computed(() => {
  const currentLocale = locale.value as string
  return availableLocales.find((item: any) => item.code === currentLocale)
})

// 设备检测和断点管理
const { deviceType } = useDevice({
  enableResize: true,
  enableOrientation: true
})

const { current: currentBreakpoint, width } = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1200
})

// 计算当前设备类型，用于模板选择
const currentDevice = computed(() => {
  // 优先使用设备检测结果，如果不可用则使用断点判断
  if (deviceType.value) {
    return deviceType.value
  }

  // 基于断点的设备判断
  if (width.value < 768) return 'mobile'
  if (width.value < 1024) return 'tablet'
  return 'desktop'
})

// 监听设备变化，输出调试信息
watch([currentDevice, currentBreakpoint], ([device, breakpoint]) => {
  console.log(`🔄 Dashboard设备切换: ${device} (断点: ${breakpoint}, 宽度: ${width.value}px)`)
}, { immediate: true })

// 模板属性
const templateProps = computed(() => ({
  // 路由组件
  RouterView,

  // 国际化函数
  t,

  // 设备信息
  device: currentDevice.value,
  breakpoint: currentBreakpoint.value,

  // 用户信息（示例）
  userInfo: {
    name: '用户',
    avatar: '👤'
  },

  // 应用信息
  appInfo: {
    name: 'LDesign Demo',
    version: '1.0.0'
  }
}))

// 模板事件处理
const onTemplateChange = (templateInfo: any) => {
  console.log('📋 模板已切换:', templateInfo)
}

const onLoadError = (error: any) => {
  console.error('❌ 模板加载失败:', error)
}

const onLoadSuccess = (templateInfo: any) => {
  console.log('✅ 模板加载成功:', templateInfo)
}

const onTemplateSelected = (template: any) => {
  console.log('🎯 模板已选择:', template)
}

const onSelectorClose = () => {
  console.log('� 模板选择器已关闭')
}

// 配置面板组件事件处理函数
const handleLanguageChange = (language: string) => {
  console.log('🌍 语言切换:', language)
  // 这里可以添加语言切换的逻辑
}

const handleThemeChange = (theme: any) => {
  console.log('🎨 主题切换:', theme)
  // 这里可以添加主题切换的逻辑
}

const handleDarkModeChange = (isDark: boolean) => {
  console.log('🌙 暗黑模式切换:', isDark)
  // 这里可以添加暗黑模式切换的逻辑
}

const handleSizeChange = (size: string) => {
  console.log('📏 尺寸切换:', size)
  // 这里可以添加尺寸切换的逻辑
}

// 组件生命周期
onMounted(() => {
  console.log(`� Dashboard页面已挂载 - 当前设备: ${currentDevice.value}`)
})

onBeforeUnmount(() => {
  console.log('💀 Dashboard页面即将卸载')
})
</script>

<style lang="less" scoped>
.dashboard-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--ldesign-bg-color-page);
}

.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--ls-padding-base);
  height: 64px;
  background: var(--ldesign-bg-color-container);
  border-bottom: 1px solid var(--ldesign-border-color);
  box-shadow: var(--ldesign-shadow-1);

  .nav-brand h1 {
    margin: 0;
    font-size: var(--ls-font-size-lg);
    color: var(--ldesign-text-color-primary);
  }

  .nav-links {
    display: flex;
    gap: var(--ls-spacing-base);

    .nav-link {
      padding: var(--ls-padding-xs) var(--ls-padding-sm);
      color: var(--ldesign-text-color-secondary);
      text-decoration: none;
      border-radius: var(--ls-border-radius-base);
      transition: all 0.2s ease;

      &:hover {
        color: var(--ldesign-brand-color);
        background: var(--ldesign-brand-color-focus);
      }

      &.active {
        color: var(--ldesign-brand-color);
        background: var(--ldesign-brand-color-focus);
      }
    }
  }

  .app-controls {
    display: flex;
    align-items: center;
    gap: var(--ls-spacing-sm);
  }
}

.dashboard-body {
  display: flex;
  flex: 1;
}

.dashboard-sidebar {
  width: 240px;
  background: var(--ldesign-bg-color-container);
  border-right: 1px solid var(--ldesign-border-color);
  overflow-y: auto;

  .sidebar-nav {
    padding: var(--ls-padding-base);

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--ls-spacing-sm);
      padding: var(--ls-padding-sm);
      margin-bottom: var(--ls-margin-xs);
      color: var(--ldesign-text-color-secondary);
      text-decoration: none;
      border-radius: var(--ls-border-radius-base);
      transition: all 0.2s ease;

      &:hover {
        color: var(--ldesign-brand-color);
        background: var(--ldesign-brand-color-focus);
      }

      &.active {
        color: var(--ldesign-brand-color);
        background: var(--ldesign-brand-color-focus);
      }

      .nav-icon {
        font-size: var(--ls-font-size-base);
      }

      .nav-text {
        font-size: var(--ls-font-size-sm);
      }
    }
  }
}

.dashboard-content {
  flex: 1;
  padding: var(--ls-padding-base);
  background: var(--ldesign-bg-color-page);
  overflow-y: auto;
}

.dashboard-footer {
  background: var(--ldesign-bg-color-container);
  border-top: 1px solid var(--ldesign-border-color);
  padding: var(--ls-padding-base);

  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;

    p {
      margin: 0;
      color: var(--ldesign-text-color-secondary);
      font-size: var(--ls-font-size-xs);
    }

    .footer-info {
      display: flex;
      gap: var(--ls-spacing-sm);
      color: var(--ldesign-text-color-placeholder);
      font-size: var(--ls-font-size-xs);
    }
  }
}

// 配置面板组件样式
.config-panel-components {
  .config-section {
    margin-bottom: var(--ls-margin-lg);

    h4 {
      margin: 0 0 var(--ls-margin-sm) 0;
      font-size: var(--ls-font-size-sm);
      font-weight: 600;
      color: var(--ldesign-text-color-primary);
    }
  }
}
</style>
