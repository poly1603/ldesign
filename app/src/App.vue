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
          <router-link to="/packages" class="nav-link" active-class="active">
            {{ t('nav.products') }}
          </router-link>
          <router-link to="/login" class="nav-link" active-class="active">
            {{ t('nav.login') }}
          </router-link>
        </div>
        <div class="app-controls">
          <LanguageSwitcher type="buttons" :show-flag="true" />
          <ThemeSelector mode="select" :show-preview="true"
            :disabled-builtin-themes="disabledBuiltinThemes" :placeholder="t('app.theme')" />
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
import { ThemeSelector, DarkModeToggle } from '@ldesign/color'
import { useI18n, LanguageSwitcher } from '@ldesign/i18n/vue'
import { getAvailableLocales } from './i18n/locales'

// 使用国际化功能
const { t, locale } = useI18n()

// 当前语言信息
const availableLocales = getAvailableLocales()
const currentLocaleInfo = computed(() => {
  return availableLocales.find((item: any) => item.code === locale.value)
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

/* 导航栏样式 - 直接使用 @ldesign/color 变量 */
.app-nav {
  background: linear-gradient(135deg, var(--ldesign-brand-color) 0%, var(--ldesign-brand-color-8) 100%);
  color: var(--ldesign-font-white-1);
  padding: 1rem 0;
  box-shadow: var(--ldesign-shadow-2);
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--ldesign-border-color);
  backdrop-filter: blur(10px);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.nav-brand h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--ldesign-font-white-1);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: inline-block;
  font-weight: 500;
}

.nav-link:hover {
  background: var(--ldesign-brand-color-2);
  color: var(--ldesign-brand-color-9);
  transform: translateY(-1px);
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
  min-height: calc(100vh - 200px);
}

/* 底部样式 */
.app-footer {
  background: linear-gradient(135deg, var(--ldesign-bg-color-container) 0%, var(--ldesign-bg-color-component) 100%);
  color: var(--ldesign-text-color-secondary);
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid var(--ldesign-border-color);
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 控制组件样式 */
.app-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.app-controls>* {
  flex-shrink: 0;
}



/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    gap: 1rem;
  }

  .nav-container,
  .footer-container {
    padding: 0 1rem;
  }
}
</style>
