<template>
  <div id="app">
    <!-- 应用头部导航 -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>{{ t('app.welcome') }}</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active" exact-active-class="active">
            {{ t('nav.home') }}
          </router-link>
          <router-link to="/config" class="nav-link" active-class="active">
            ⚙️ 配置中心
          </router-link>
          <router-link to="/login" class="nav-link" active-class="active">
            {{ t('nav.login') }}
          </router-link>
        </div>
        <div class="app-controls">
          <LanguageSwitcher type="buttons" :show-flag="true" />
          <ThemeSelector mode="select" :show-preview="true"
            :disabled-builtin-themes="disabledBuiltinThemes" :placeholder="t('app.theme')" />
          <SizeSwitcher
            switcher-style="segmented"
            :show-icons="true"
            :animated="true"
            :modes="['small', 'medium', 'large', 'extra-large']" />
          <DarkModeToggle />
        </div>
      </div>
    </nav>

    <!-- 路由视图 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2024 {{ t('app.title') }} - {{ t('app.description') }}</p>
        <div class="footer-info">
          <span>{{ t('app.language') }}: {{ currentLocaleInfo?.nativeName }}</span>
          <span class="separator">|</span>
          <span>{{ t('app.version') }}: 1.0.0</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
/**
 * 应用根组件
 * 提供应用的基本布局和导航结构
 * 使用 @ldesign/router 的路由系统和 @ldesign/i18n 的国际化功能
 */

import { ref, computed } from 'vue'
import { ThemeSelector, DarkModeToggle } from '@ldesign/color/index.ts'
import { useI18n, LanguageSwitcher } from '@ldesign/i18n/vue/index.ts'
import { SizeSwitcher } from '@ldesign/size/vue/index.ts'
import { getAvailableLocales } from '../i18n'

// 使用国际化功能
const { t, locale } = useI18n()

// 当前语言信息
const availableLocales = getAvailableLocales()
const currentLocaleInfo = computed(() => {
  const currentLocale = typeof locale.value === 'object' ? locale.value.value : locale.value
  return availableLocales.find((item: any) => item.code === currentLocale)
})

// 禁用的内置主题列表（示例：禁用红色和粉色主题）
const disabledBuiltinThemes = ref<string[]>(['red', 'pink'])

// 注意：自定义主题配置已移除，避免配置错误
// 如需自定义主题，请参考 @ldesign/color 包的文档

// 应用组件已加载，减少控制台输出
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/*
 * 直接使用 @ldesign/color 生成的CSS变量
 * 这些变量由主题管理器动态注入，无需重复定义
 *
 * 可用的变量包括：
 * - 文本颜色：--ldesign-text-color-primary, --ldesign-text-color-secondary, --ldesign-text-color-placeholder, --ldesign-text-color-disabled
 * - 背景颜色：--ldesign-bg-color-page, --ldesign-bg-color-container, --ldesign-bg-color-component
 * - 边框颜色：--ldesign-border-color, --ldesign-border-color-hover, --ldesign-border-color-focus
 * - 主题色：--ldesign-brand-color, --ldesign-brand-color-hover, --ldesign-brand-color-active
 * - 功能色：--ldesign-success-color, --ldesign-warning-color, --ldesign-error-color
 * - 色阶：--ldesign-brand-color-1 到 --ldesign-brand-color-10
 * - 阴影：--ldesign-shadow-1, --ldesign-shadow-2, --ldesign-shadow-3
 */

/* 确保主题切换有平滑过渡效果 */
html, body {
  transition: background-color 0.3s ease, color 0.3s ease;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--ldesign-text-color-primary);
  background-color: var(--ldesign-bg-color-page);
  transition: all 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 - 使用 @ldesign/color 和 @ldesign/size 变量 */
.app-nav {
  background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-8) 100%);
  color: var(--ldesign-font-white-1);
  padding: var(--ls-spacing-lg) 0;
  box-shadow: var(--ldesign-shadow-2);
  transition: all 0.3s ease;
  border-bottom: var(--ls-border-width) solid var(--ldesign-border-color);
  backdrop-filter: blur(10px);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: var(--ls-container-max-width);
  margin: 0 auto;
  padding: 0 var(--ls-spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ls-spacing-lg);
}

.nav-brand h1 {
  font-size: var(--ls-font-size-xl);
  font-weight: var(--ls-font-weight-semibold);
}

.nav-links {
  display: flex;
  gap: var(--ls-spacing-xl);
}

.nav-link {
  color: var(--ldesign-font-white-1);
  text-decoration: none;
  padding: var(--ls-spacing-sm) var(--ls-spacing-lg);
  border-radius: var(--ls-border-radius);
  transition: all 0.3s ease;
  display: inline-block;
  font-weight: var(--ls-font-weight-medium);
}

.nav-link:hover {
  background: var(--ldesign-brand-color-2);
  color: var(--ldesign-brand-color-9);
  transform: translateY(var(--ls-transform-hover-y));
}

.nav-link.active {
  background: var(--ldesign-font-white-1);
  color: var(--ldesign-brand-color);
  box-shadow: var(--ldesign-shadow-1);
}

/* 主内容区域 */
.app-main {
  flex: 1;
  background-color: var(--ldesign-bg-color-page);
  transition: all 0.3s ease;
  min-height: calc(100vh - var(--ls-header-footer-height));
}

/* 底部样式 */
.app-footer {
  background: linear-gradient(135deg, var(--ldesign-bg-color-container) 0%, var(--ldesign-bg-color-component) 100%);
  color: var(--ldesign-text-color-secondary);
  padding: var(--ls-spacing-xl) 0;
  text-align: center;
  border-top: var(--ls-border-width) solid var(--ldesign-border-color);
  transition: all 0.3s ease;
  backdrop-filter: blur(var(--ls-blur-sm));
}

.footer-container {
  max-width: var(--ls-container-max-width);
  margin: 0 auto;
  padding: 0 var(--ls-spacing-xl);
}

/* 控制组件样式 */
.app-controls {
  display: flex;
  align-items: center;
  gap: var(--ls-spacing-lg);
}

.app-controls>* {
  flex-shrink: 0;
}

/* 主题选择器样式 */
.app-controls :deep(.theme-selector) {
  min-width: 120px;
}

.app-controls :deep(.theme-selector .theme-dropdown) {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  color: var(--ldesign-text-color-primary);
  padding: 8px 12px;
  font-size: var(--ls-font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-controls :deep(.theme-selector .theme-dropdown:hover) {
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}

.app-controls :deep(.theme-selector .theme-dropdown:focus) {
  outline: none;
  border-color: var(--ldesign-brand-color);
  box-shadow: 0 0 0 2px var(--ldesign-brand-color-focus);
}

/* 暗色模式切换器样式 */
.app-controls :deep(.dark-mode-toggle) {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  color: var(--ldesign-text-color-primary);
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-controls :deep(.dark-mode-toggle:hover) {
  background: var(--ldesign-bg-color-container-hover);
  border-color: var(--ldesign-brand-color);
}

/* 语言切换器样式 */
.app-controls :deep(.language-switcher) {
  background: var(--ldesign-bg-color-container);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
}

.app-controls :deep(.language-switcher .lang-button) {
  background: transparent;
  border: none;
  color: var(--ldesign-text-color-primary);
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-controls :deep(.language-switcher .lang-button:hover) {
  background: var(--ldesign-bg-color-container-hover);
}

.app-controls :deep(.language-switcher .lang-button.active) {
  background: var(--ldesign-brand-color);
  color: white;
}

/* 尺寸切换器样式 */
.app-controls :deep(.size-switcher) {
  background: var(--ldesign-bg-color-container);
  border: 1px solid var(--ldesign-border-color);
  border-radius: var(--ls-border-radius-base);
  overflow: hidden;
}

.app-controls :deep(.size-switcher .size-option) {
  background: transparent;
  border: none;
  color: var(--ldesign-text-color-primary);
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.app-controls :deep(.size-switcher .size-option:hover) {
  background: var(--ldesign-bg-color-container-hover);
}

.app-controls :deep(.size-switcher .size-option.active) {
  background: var(--ldesign-brand-color);
  color: white;
}



/* 响应式设计 */
@media (max-width: var(--ls-breakpoint-md)) {
  .nav-container {
    flex-direction: column;
    gap: var(--ls-spacing-lg);
  }

  .nav-links {
    gap: var(--ls-spacing-lg);
  }

  .nav-container,
  .footer-container {
    padding: 0 var(--ls-spacing-lg);
  }
}
</style>
