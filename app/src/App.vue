<template>
  <div id="app">
    <!-- 应用头部导航 -->
    <nav class="app-nav">
      <div class="nav-container">
        <div class="nav-brand">
          <h1>{{ t('demo.welcome') }}</h1>
        </div>
        <div class="nav-links">
          <router-link to="/" class="nav-link" active-class="active" exact-active-class="active">
            首页
          </router-link>
          <router-link to="/login" class="nav-link" active-class="active">
            登录
          </router-link>
        </div>
        <ThemeSelector mode="select" :show-preview="true" :custom-themes="customThemes"
          :disabled-builtin-themes="disabledBuiltinThemes" placeholder="选择主题" />
        <DarkModeToggle />
      </div>
    </nav>

    <!-- 路由视图 -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- 应用底部 -->
    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2024 {{ t('page.home.title') }} - {{ t('demo.description') }}</p>
        <div class="footer-info">
          <span>{{ t('language.current') }}: {{ getCurrentLanguageName() }}</span>
          <span class="separator">|</span>
          <span>{{ t('theme.title') }}: {{ t('theme.light') }}</span>
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

import { ref } from 'vue'
import { ThemeSelector, DarkModeToggle } from '@ldesign/color'
import type { ThemeConfig } from '@ldesign/color'

// 自定义主题配置
const customThemes = ref<ThemeConfig[]>([
  {
    name: 'custom-brand',
    displayName: '品牌主题',
    description: '公司品牌色主题',
    builtin: false,
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444'
    }
  },
  {
    name: 'custom-ocean',
    displayName: '海洋主题',
    description: '深海蓝色主题',
    builtin: false,
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      success: '#059669',
      warning: '#d97706',
      danger: '#dc2626'
    }
  }
])

// 禁用的内置主题列表（示例：禁用红色和粉色主题）
const disabledBuiltinThemes = ref<string[]>(['red', 'pink'])

console.log('🎉 App.vue 组件已加载')
console.log('🚀 使用 @ldesign/router 路由系统')
console.log('🌐 使用 @ldesign/i18n 国际化系统')
console.log('🔧 展示优化后的 LDesign Engine + Router + I18n 集成')
console.log(`📍 当前语言: ${languageManager.getLocale()}`)
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* CSS变量定义 - 亮色模式 */
:root {
  --color-text: #333333;
  --color-text-secondary: #666666;
  --color-text-muted: #999999;
  --color-bg: #ffffff;
  --color-bg-secondary: #f8f9fa;
  --color-bg-tertiary: #e9ecef;
  --color-border: #dee2e6;
  --color-primary: #2c3e50;
  --color-secondary: #3498db;
  --color-success: #27ae60;
  --color-warning: #f39c12;
  --color-danger: #e74c3c;
  --color-shadow: rgba(0, 0, 0, 0.1);
}

/* 暗黑模式变量 */
[data-mode="dark"] {
  --color-text: #ffffff;
  --color-text-secondary: #e0e0e0;
  --color-text-muted: #b0b0b0;
  --color-bg: #1a1a1a;
  --color-bg-secondary: #2d2d2d;
  --color-bg-tertiary: #404040;
  --color-border: #555555;
  --color-primary: #4a5568;
  --color-secondary: #4299e1;
  --color-success: #48bb78;
  --color-warning: #ed8936;
  --color-danger: #f56565;
  --color-shadow: rgba(0, 0, 0, 0.3);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: var(--color-text);
  background-color: var(--color-bg);
  transition: all 0.3s ease;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 导航栏样式 */
.app-nav {
  background: var(--color-primary);
  color: var(--color-text);
  padding: 1rem 0;
  box-shadow: 0 2px 4px var(--color-shadow);
  transition: all 0.3s ease;
  border-bottom: 1px solid var(--color-border);
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
  color: var(--color-text);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: inline-block;
}

.nav-link:hover {
  background: var(--color-bg-secondary);
  color: var(--color-text);
}

.nav-link.active {
  background: var(--color-secondary);
  color: var(--color-text);
}

/* 主内容区域 */
.app-main {
  flex: 1;
  background-color: var(--color-bg);
  transition: all 0.3s ease;
}

/* 底部样式 */
.app-footer {
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: 1rem 0;
  text-align: center;
  border-top: 1px solid var(--color-border);
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
